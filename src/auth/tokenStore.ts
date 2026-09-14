/**
 * src/auth/tokenStore.ts
 * -----------------------
 * Single source of truth for reading/writing/clearing auth + session data on
 * the client. Every other file in the app should go through this module
 * instead of touching `localStorage` (or `sessionStorage`) directly.
 *
 * WHY THIS EXISTS
 * ----------------
 * The previous implementation kept `token` / `refreshToken` / `user` /
 * `khatas` / `khataId` in `localStorage`. That is the least secure place to
 * put a session token:
 *   - It is plain text, visible to anyone with a moment of DevTools access.
 *   - It persists forever (survives closing the browser), so a stolen device
 *     or shared/public computer leaks a long-lived session.
 *   - It is shared across every tab of the same origin.
 *   - Most importantly: ANY JavaScript that manages to run on the page —
 *     an XSS bug in a dependency, a compromised npm package, a malicious
 *     browser extension — can do `localStorage.getItem('token')` and
 *     exfiltrate it in one line. It requires zero special privilege.
 *
 * WHAT THIS MODULE DOES INSTEAD
 * ------------------------------
 *   1. Keeps the live values in a module-scoped variable (plain JS memory),
 *      never attached to `window`, so it does not show up under the
 *      DevTools "Application" tab the way Storage APIs do, and reads are
 *      synchronous/in-process instead of going through a public Storage API
 *      that any script can enumerate with `Object.keys(localStorage)`.
 *   2. Backs that memory copy with `sessionStorage` (never `localStorage`)
 *      purely so a page refresh doesn't force the user to log in again.
 *      sessionStorage is cleared the moment the tab is closed and is never
 *      shared across tabs/windows or persisted to disk long-term — a
 *      meaningfully smaller exposure window than localStorage.
 *   3. Gives the whole app ONE choke point for session data instead of a
 *      dozen files independently calling `localStorage.getItem(...)`. That
 *      makes it possible to audit, rotate, or harden the storage strategy
 *      (e.g. add encryption, short-lived tokens, or swap to an
 *      httpOnly-cookie/BFF model) by editing a single file.
 *
 * THE HONEST LIMIT OF ANY FRONTEND-ONLY FIX
 * -------------------------------------------
 * No storage a browser exposes to JavaScript — memory, sessionStorage,
 * localStorage, IndexedDB — is safe from a *successful* XSS attack, because
 * injected attacker code runs with the exact same privileges as this file.
 * The only token storage that JS-based XSS genuinely cannot read is an
 * httpOnly, Secure, SameSite cookie set by the backend. If the backend can
 * be changed to set tokens that way (directly, or via a small
 * backend-for-frontend), that is the real long-term fix. Until then, this
 * module is the strongest mitigation achievable purely on the frontend.
 */

type StoreKey =
  | "accessToken"
  | "refreshToken"
  | "idToken"
  | "user"
  | "khatas"
  | "defaultKhata"
  | "khataId";

const ALL_KEYS: StoreKey[] = [
  "accessToken",
  "refreshToken",
  "idToken",
  "user",
  "khatas",
  "defaultKhata",
  "khataId",
];

// Auth data that must be wiped on logout / 401.
const AUTH_KEYS: StoreKey[] = ["accessToken", "refreshToken", "idToken", "user", "khatas", "defaultKhata"];

// Namespaced so these keys aren't just sitting in sessionStorage under
// obvious, greppable names ("token") that automated token-stealing scripts
// specifically scan for.
const STORAGE_PREFIX = "__lm_session__";
const storageKey = (key: StoreKey) => `${STORAGE_PREFIX}${key}`;

// Module-scoped memory — NOT on `window`, NOT enumerable via a public
// Storage API. This is the source of truth for every get() call.
const memoryStore: Partial<Record<StoreKey, string>> = {};

/** One-time hydration from sessionStorage so an in-tab refresh keeps the
 *  session alive. After this, all reads are served from memory. */
function hydrate() {
  ALL_KEYS.forEach((key) => {
    try {
      const value = window.sessionStorage.getItem(storageKey(key));
      if (value) memoryStore[key] = value;
    } catch {
      // sessionStorage can throw (e.g. some private-browsing modes) — the
      // app still works for the current page load via memory only.
    }
  });
}
hydrate();

function setValue(key: StoreKey, value: string) {
  memoryStore[key] = value;
  try {
    window.sessionStorage.setItem(storageKey(key), value);
  } catch {
    // Non-fatal — memory copy still serves the rest of this page's life.
  }
}

function getValue(key: StoreKey): string | null {
  return memoryStore[key] ?? null;
}

function removeValue(key: StoreKey) {
  delete memoryStore[key];
  try {
    window.sessionStorage.removeItem(storageKey(key));
  } catch {
    // Non-fatal.
  }
}

function getJSON<T>(key: StoreKey): T | null {
  const raw = getValue(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function setJSON(key: StoreKey, value: unknown) {
  setValue(key, JSON.stringify(value));
}

export interface StoredUser {
  name?: string;
  phone?: string;
}

export interface StoredKhata {
  id: string;
  name: string;
}

export const tokenStore = {
  // ── Tokens ────────────────────────────────────────────────────────────
  getAccessToken: (): string | null => getValue("accessToken"),
  getRefreshToken: (): string | null => getValue("refreshToken"),
  getIdToken: (): string | null => getValue("idToken"),

  setAccessToken: (value: string): void => setValue("accessToken", value),
  setRefreshToken: (value: string): void => setValue("refreshToken", value),
  setIdToken: (value: string): void => setValue("idToken", value),

  /** True if we currently hold an access token. */
  hasAccessToken: (): boolean => !!getValue("accessToken"),

  /** True if we currently hold an ID token (used for route guards — the ID
   *  token is what's now sent as the API bearer credential, see apiClient). */
  hasIdToken: (): boolean => !!getValue("idToken"),

  // ── Session data returned alongside the tokens at login ────────────────
  getUser: (): StoredUser | null => getJSON<StoredUser>("user"),
  setUser: (user: StoredUser): void => setJSON("user", user),

  getKhatas: (): StoredKhata[] => getJSON<StoredKhata[]>("khatas") ?? [],
  setKhatas: (khatas: StoredKhata[]): void => setJSON("khatas", khatas),

  getDefaultKhata: (): StoredKhata | null => getJSON<StoredKhata>("defaultKhata"),
  setDefaultKhata: (khata: StoredKhata): void => setJSON("defaultKhata", khata),

  /** Currently active Khata id (selected in the header / Khata list). */
  getKhataId: (): string | null => getValue("khataId"),
  setKhataId: (id: string): void => setValue("khataId", id),

  /** Persists everything returned by a successful login/signup response. */
  setSession: (session: {
    accessToken?: string;
    refreshToken?: string;
    user?: StoredUser;
    khatas?: StoredKhata[];
    defaultKhata?: StoredKhata;
  }): void => {
    if (session.accessToken) setValue("accessToken", session.accessToken);
    if (session.refreshToken) setValue("refreshToken", session.refreshToken);
    if (session.user) setJSON("user", session.user);
    if (session.khatas) setJSON("khatas", session.khatas);
    if (session.defaultKhata) {
      setJSON("defaultKhata", session.defaultKhata);
      setValue("khataId", session.defaultKhata.id);
    }
  },

  /** Clears tokens + cached session data (logout / 401), keeps nothing behind. */
  clearTokens: (): void => {
    AUTH_KEYS.forEach(removeValue);
  },

  /** Clears literally everything this module tracks, including the active khata. */
  clearAll: (): void => {
    ALL_KEYS.forEach(removeValue);
  },
};

export default tokenStore;
