/**
 * src/lib/env.ts
 * ----------------
 * Single source of truth for reading build-time environment variables.
 * Nothing else in the app should touch `import.meta.env` directly — that
 * keeps every "where does this come from" question answerable in one file,
 * and means we only have to fix a missing/renamed env var in one place.
 */

function readEnv(key: string, fallback?: string): string {
  const value = import.meta.env[key];

  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim().replace(/\/+$/, ""); // strip trailing slash(es)
  }

  if (fallback !== undefined) {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.warn(
        `[env] ${key} is not set — falling back to "${fallback}". ` +
          `Copy .env.example to .env and set it for your environment.`
      );
    }
    return fallback;
  }

  throw new Error(`[env] Missing required environment variable: ${key}`);
}

/** Base URL of the backend REST API, e.g. "http://192.168.0.158:5000/api". */
export const API_BASE_URL = readEnv(
  "VITE_API_BASE_URL",
  "https://322m7iq2ze.execute-api.ap-south-1.amazonaws.com/dev/api"
);

/** AWS Cognito User Pool ID, e.g. "ap-south-1_a4xkMF". */
export const COGNITO_USER_POOL_ID = readEnv("VITE_COGNITO_USER_POOL_ID");

/** AWS Cognito App Client ID. */
export const COGNITO_CLIENT_ID = readEnv("VITE_COGNITO_CLIENT_ID");

/** AWS region the Cognito user pool lives in, e.g. "ap-south-1". */
export const AWS_REGION = readEnv("VITE_AWS_REGION", "ap-south-1");
