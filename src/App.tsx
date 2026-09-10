import { Navigate, Route, Routes } from "react-router-dom";
import Index from "./layout/Index"
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import KhataList from "./pages/KhataList";
import CustomerDetail from "./pages/CustomerDetail";
import LedgerEntriesPage from "./pages/LedgerEntriesPage";
import PaymentTransferForm from "./pages/PaymentTransferForm";
import AccountProfilePage from "./pages/AccountProfilePage";

export default function App() {
  return (
    <Routes>
      {/* Public / Auth Routes (Without Header & Footer) */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Protected App Routes Wrapper with Fixed Header and Footer Layout */}
      <Route element={<Index />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/khatalist" element={<KhataList />} />
        {/* <Route path="/customer-detail" element={<CustomerDetail />} /> */}
        <Route path="/customer-detail/:khataCustomerId" element={<CustomerDetail />} />
        <Route path="/ledger-entries-page" element={<LedgerEntriesPage />} />
        <Route path="/payment-transfer-form" element={<PaymentTransferForm />} />
        <Route path="/account-profile-page" element={<AccountProfilePage />} />
      </Route>

      {/* Fallback Route */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}