/**
 * src/lib/apiClient.ts
 * ----------------------
 * Every network call in the app goes through this module instead of a raw
 * `fetch(...)` scattered across pages. It gives us, in one place:
 *
 *   - the base URL (read once from `.env`, see src/lib/env.ts)
 *   - the Authorization header, built from the Cognito ID token held in the
 *     secure tokenStore — never from localStorage
 *   - a single normalized error shape (ApiError) instead of every page
 *     re-implementing its own try/catch/parse dance
 *   - a request/response "interceptor": any authenticated call that comes
 *     back 401 Unauthorized first tries a silent refresh (by exchanging the
 *     stored AWS Cognito refresh token directly with Cognito for a new
 *     token pair) and retries once; only if that also fails does it
 *     clear the session and redirect to /login — no page has to remember
 *     to do any of that itself
 *
 * This intentionally does not depend on axios — it's a thin wrapper around
 * the native `fetch`, so it works with zero extra dependencies.
 */

import { API_BASE_URL } from "./env";
import { tokenStore } from "../auth/tokenStore";
import { cognitoAuth } from "./cognito";

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  raw?: unknown;
}

export interface RequestOptions extends RequestInit {
  /** Plain object body — automatically JSON.stringify-ed. Use `body` for raw payloads (e.g. FormData). */
  json?: unknown;
  /** Attach the Authorization header from tokenStore. Default: true. */
  auth?: boolean;
  /** On a 401 response, clear the session and redirect to /login. Default: same as `auth`. */
  redirectOnUnauthorized?: boolean;
  /** Abort/timeout signal is derived automatically unless you pass your own. */
  timeout?: number;
  /** @internal set automatically when retrying after a silent token refresh — do not pass this yourself. */
  _isRetryAfterRefresh?: boolean;
}

const DEFAULT_TIMEOUT = 30_000;

/** Registered once from App.tsx so the interceptor can navigate via
 *  react-router instead of a hard page reload. Falls back to a hard
 *  redirect if nothing has registered yet (e.g. very first paint). */
let unauthorizedHandler: (() => void) | null = null;

export function setUnauthorizedHandler(handler: () => void) {
  unauthorizedHandler = handler;
}

function triggerUnauthorizedRedirect() {
  tokenStore.clearTokens();
  if (unauthorizedHandler) {
    unauthorizedHandler();
  } else if (typeof window !== "undefined") {
    window.location.assign("/login");
  }
}

/**
 * Decodes a JWT's payload without verifying its signature — good enough to
 * read a claim (here, the Cognito username) back out of a token we already
 * trust because we're the ones who stored it. Never use this to *validate*
 * a token, only to read it.
 */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/**
 * Silent refresh: exchanges the AWS Cognito refresh token for a new
 * access/id token pair — directly against Cognito, not our own backend.
 *
 * Doesn't depend on authService (which itself depends on this file) —
 * that would be a circular import.
 *
 * Multiple requests can 401 around the same time (e.g. a page firing
 * several calls in parallel). `refreshPromise` makes sure only ONE call to
 * Cognito's refresh flow happens; every other caller just awaits the same
 * in-flight promise instead of hammering the endpoint.
 *
 * Cognito's refreshSession needs a `CognitoUser` (i.e. a username) to
 * attach the refreshed session to. Rather than storing the email separately,
 * we read it back out of the "cognito:username" (falling back to "email")
 * claim already sitting in the ID token we have on hand.
 */
let refreshPromise: Promise<string | null> | null = null;

function refreshAccessToken(): Promise<string | null> {
  const refreshToken = tokenStore.getRefreshToken();
  const idToken = tokenStore.getIdToken();
  if (!refreshToken || !idToken) return Promise.resolve(null);

  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const payload = decodeJwtPayload(idToken);
        const username =
          (payload?.["cognito:username"] as string | undefined) ??
          (payload?.email as string | undefined);
        if (!username) return null;

        const tokens = await cognitoAuth.refreshSession(username, refreshToken);

        tokenStore.setAccessToken(tokens.accessToken);
        tokenStore.setIdToken(tokens.idToken);
        tokenStore.setRefreshToken(tokens.refreshToken);
        return tokens.idToken;
      } catch {
        return null;
      } finally {
        refreshPromise = null;
      }
    })();
  }

  return refreshPromise;
}

async function parseBody(response: Response): Promise<unknown> {
  if (response.status === 204 || response.status === 205) return null;

  const contentType = response.headers.get("content-type") ?? "";
  if (/json/i.test(contentType)) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }
  try {
    return await response.text();
  } catch {
    return null;
  }
}

function extractMessage(raw: unknown, response: Response): string {
  if (raw && typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    if (typeof obj.message === "string") return obj.message;
    if (typeof obj.error === "string") return obj.error;
  }
  if (typeof raw === "string" && raw.trim().length > 0) return raw;
  return `HTTP ${response.status}: ${response.statusText}`;
}

/**
 * Low-level request helper. Prefer the typed wrappers below (`apiGet`,
 * `apiPost`, ...) from feature services instead of calling this directly.
 */
export async function apiRequest<T = unknown>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const {
    json,
    auth = true,
    redirectOnUnauthorized = auth,
    timeout = DEFAULT_TIMEOUT,
    headers,
    _isRetryAfterRefresh = false,
    ...rest
  } = options;

  const url = path.startsWith("http") ? path : `${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;

  const finalHeaders: Record<string, string> = {
    ...(json !== undefined ? { "Content-Type": "application/json" } : {}),
    ...(headers as Record<string, string> | undefined),
  };

  if (auth) {
    // Backend now expects the Cognito ID token (not the access token) as
    // the bearer credential on every authenticated call.
    const token = tokenStore.getIdToken();
    if (token) finalHeaders.Authorization = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  let response: Response;
  try {
    response = await fetch(url, {
      ...rest,
      headers: finalHeaders,
      body: json !== undefined ? JSON.stringify(json) : rest.body,
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timeoutId);
    if ((err as Error)?.name === "AbortError") {
      throw { message: `Request timed out. Please check your connection.`, code: "TIMEOUT" } as ApiError;
    }
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      throw { message: "You're offline. Please check your internet connection.", code: "OFFLINE" } as ApiError;
    }
    throw { message: "Unable to connect to the server.", code: "NETWORK_ERROR", raw: err } as ApiError;
  } finally {
    clearTimeout(timeoutId);
  }

  const raw = await parseBody(response);

  if (response.status === 401 && redirectOnUnauthorized) {
    // Don't give up on the very first 401 — the ID token may simply have
    // expired. Try exchanging the AWS Cognito refresh token for a fresh
    // token pair and replaying this exact request once. Only if that also
    // fails (refresh token missing/expired/revoked) do we actually clear
    // the session and send the user to /login. A logged-in user should
    // only ever be logged out by clicking Logout, or by their refresh
    // token itself expiring.
    if (!_isRetryAfterRefresh) {
      const newIdToken = await refreshAccessToken();
      if (newIdToken) {
        return apiRequest<T>(path, { ...options, _isRetryAfterRefresh: true });
      }
    }

    triggerUnauthorizedRedirect();
    throw {
      message: "Your session has expired. Please sign in again.",
      status: 401,
      code: "UNAUTHORIZED",
      raw,
    } as ApiError;
  }

  if (!response.ok) {
    throw {
      message: extractMessage(raw, response),
      status: response.status,
      raw,
    } as ApiError;
  }

  return raw as T;
}

export const apiClient = {
  get: <T = unknown>(path: string, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: "GET" }),
  post: <T = unknown>(path: string, json?: unknown, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: "POST", json }),
  put: <T = unknown>(path: string, json?: unknown, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: "PUT", json }),
  patch: <T = unknown>(path: string, json?: unknown, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: "PATCH", json }),
  delete: <T = unknown>(path: string, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: "DELETE" }),
};

export default apiClient;
