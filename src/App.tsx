import { lazy, Suspense, useEffect } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { setUnauthorizedHandler } from "./lib/apiClient";
import { tokenStore } from "./auth/tokenStore";
import RequireAuth from "./auth/RequireAuth";
import PageLoader from "./components/ui/PageLoader";

// Route-level code splitting: each page ships as its own chunk and is only
// downloaded when the user actually navigates to it.
const Index = lazy(() => import("./layout/Index"));
const Login = lazy(() => import("./pages/Login"));
const SignUp = lazy(() => import("./pages/SignUp"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const KhataList = lazy(() => import("./pages/KhataList"));
const CustomerDetail = lazy(() => import("./pages/CustomerDetail"));
const LedgerEntriesPage = lazy(() => import("./pages/LedgerEntriesPage"));
const PaymentTransferForm = lazy(() => import("./pages/PaymentTransferForm"));
const AccountProfilePage = lazy(() => import("./pages/AccountProfilePage"));
const NotFound = lazy(() => import("./pages/NotFound"));

export default function App() {
  const navigate = useNavigate();

  // Wire the API client's 401 interceptor to react-router so an expired
  // session lands on /login via client-side navigation (no full reload).
  useEffect(() => {
    setUnauthorizedHandler(() => {
      tokenStore.clearTokens();
      navigate("/login", { replace: true });
    });
    return () => setUnauthorizedHandler(() => undefined);
  }, [navigate]);

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public / Auth Routes (Without Header & Footer) */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected App Routes Wrapper with Fixed Header and Footer Layout */}
        <Route
          element={
            <RequireAuth>
              <Index />
            </RequireAuth>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/khatalist" element={<KhataList />} />
          <Route path="/customer-detail/:khataCustomerId" element={<CustomerDetail />} />
          <Route path="/ledger-entries-page" element={<LedgerEntriesPage />} />
          <Route path="/payment-transfer-form" element={<PaymentTransferForm />} />
          <Route path="/account-profile-page" element={<AccountProfilePage />} />
        </Route>

        {/* Fallback Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
