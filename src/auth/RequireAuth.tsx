import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { tokenStore } from "./tokenStore";

/**
 * Wraps the protected route group. If there's no access token we redirect
 * to /login and remember where the user was trying to go, so Login can
 * send them back afterwards. This is the proactive half of the auth
 * story — the reactive half lives in src/lib/apiClient.ts, which redirects
 * mid-session the moment the backend returns 401.
 */
export default function RequireAuth({ children }: { children: ReactNode }) {
  const location = useLocation();

  if (!tokenStore.hasAccessToken()) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}
