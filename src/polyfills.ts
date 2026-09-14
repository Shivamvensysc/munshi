/**
 * src/polyfills.ts
 * ------------------
 * `amazon-cognito-identity-js` (and its dependencies) were written for
 * Node.js and reference the global `global` object, which does not exist
 * in the browser — Vite doesn't polyfill it automatically, causing
 * `Uncaught ReferenceError: global is not defined`.
 *
 * This file must be imported FIRST, before any other import in the app
 * (see src/main.tsx), so `global` exists before Cognito's code ever runs.
 */

if (typeof (globalThis as unknown as { global?: unknown }).global === "undefined") {
  (globalThis as unknown as { global: typeof globalThis }).global = globalThis;
}

// Some Cognito/AWS SDK internals also probe `process.env` — provide a
// harmless empty stand-in if it's missing so those checks don't throw.
if (typeof (globalThis as unknown as { process?: unknown }).process === "undefined") {
  (globalThis as unknown as { process: { env: Record<string, string> } }).process = {
    env: {},
  };
}
