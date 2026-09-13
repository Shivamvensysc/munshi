import { useState, useEffect, useCallback, type FormEvent } from "react";
import { ArrowLeftRight, IndianRupee, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import Button from "../components/Button";
import {
  customerService,
  paymentService,
  type CustomerApiData,
} from "../services";
import { useKhata } from "../context/KhataContext";
import type { ApiError } from "../lib/apiClient";

export default function PaymentTransferForm() {
  const { selectedKhataId, isLoadingKhatas } = useKhata();

  // Form State
  const [toCustomer, setToCustomer] = useState<string>("");
  const [fromCustomer, setFromCustomer] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [details, setDetails] = useState<string>("");

  // API Data & Loading States
  const [customersList, setCustomersList] = useState<CustomerApiData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Fetch Customer List for the currently active Khata
  const fetchCustomers = useCallback(async () => {
    if (!selectedKhataId) {
      // The khata list is still loading on first mount — selectedKhataId is
      // briefly null before that resolves. Only show the "no khata" error
      // once we know for sure there really isn't one.
      if (!isLoadingKhatas) {
        toast.error("No active Khata selected. Please choose a Khata first.");
        setIsLoading(false);
      }
      return;
    }

    setIsLoading(true);

    try {
      const result = await customerService.listByKhata(selectedKhataId);

      if (result.success && Array.isArray(result.data)) {
        setCustomersList(result.data);
      } else {
        toast.error(result.message || "Failed to load customer list.");
      }
    } catch (error) {
      const apiError = error as ApiError;
      console.error("Fetch Customers Error:", error);
      toast.error(apiError.message || "Unable to connect to the server.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedKhataId, isLoadingKhatas]);

  useEffect(() => {
    // Re-runs automatically whenever selectedKhataId (or the khata list's
    // loading state) changes, since fetchCustomers is recreated with the
    // new values (see dependency above).
    fetchCustomers();
  }, [fetchCustomers]);

  // Form Submit Handler for Cross-Entry API
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!toCustomer || !fromCustomer || !amount) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (toCustomer === fromCustomer) {
      toast.error("Source and Destination customer cannot be the same.");
      return;
    }

    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }

    if (!selectedKhataId) {
      toast.error("No active Khata selected. Please choose a Khata first.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await paymentService.createCrossEntry({
        khata_id: selectedKhataId,
        from_customer_id: fromCustomer,
        to_customer_id: toCustomer,
        amount: parsedAmount,
        details: details.trim(),
      });

      if (result.success ?? true) {
        toast.success(
          result.message || "Cross entry payment transferred successfully!",
        );

        // Reset form fields upon success
        setToCustomer("");
        setFromCustomer("");
        setAmount("");
        setDetails("");

        // Refresh customer list/balances
        fetchCustomers();
      } else {
        toast.error(result.message || "Failed to complete transaction.");
      }
    } catch (error) {
      const apiError = error as ApiError;
      console.error("POST Cross Entry Error:", error);
      toast.error(
        apiError.message || "Network error. Could not process payment.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to get Customer Name from ID for Preview Card
  const getCustomerName = (id: string) => {
    const found = customersList.find((c) => c.khata_customer_id === id);
    return found ? found.customer_name : "—";
  };

  return (
    <div className="w-full min-h-full bg-ledger-bg font-sans text-ledger-ink">
      <div className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-6 sm:py-6">
        {/* PAGE HEADING */}
        <div className="mb-5 flex flex-col gap-1 sm:mb-6">
          <h1 className="font-serif text-xl font-semibold tracking-tight text-ledger-ink sm:text-2xl">
            Cross Entry
          </h1>
          <p className="text-xs font-medium text-ledger-subtle sm:text-sm">
            Move a balance directly between two customers in one step.
          </p>
        </div>

        <div className="mx-auto grid w-full max-w-3xl grid-cols-1 gap-4 lg:max-w-none lg:grid-cols-5">
          {/* Form Card */}
          <div className="w-full rounded-2xl border border-ledger-border bg-ledger-paper p-5 shadow-sm sm:p-7 lg:col-span-3">
            <div className="mb-5 flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ledger-brass/10 text-ledger-brass-dark">
                <ArrowLeftRight size={18} />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-ledger-ink sm:text-base">
                  Transfer Details
                </h2>
                <p className="text-[11px] font-medium text-ledger-faint">
                  All fields marked are required
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* 1. To Customer Field */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-ledger-red">
                  To Customer
                </label>
                <div className="relative rounded-xl border border-slate-200 bg-white shadow-2xs transition-all focus-within:border-ledger-brass focus-within:ring-2 focus-within:ring-ledger-brass/15">
                  <select
                    disabled={isLoading || isSubmitting}
                    value={toCustomer}
                    onChange={(e) => setToCustomer(e.target.value)}
                    className="w-full cursor-pointer appearance-none rounded-xl bg-transparent px-3.5 py-3 text-sm font-medium text-slate-700 outline-none disabled:opacity-50"
                  >
                    <option value="" disabled>
                      {isLoading ? "Loading customers..." : "Select Customer"}
                    </option>
                    {customersList.map((cust) => (
                      <option
                        key={cust.khata_customer_id}
                        value={cust.khata_customer_id}
                      >
                        {cust.customer_name} ({cust.mobile_number})
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                    {isLoading ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      "▼"
                    )}
                  </div>
                </div>
              </div>

              {/* 2. From Customer Field */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-ledger-green">
                  From Customer
                </label>
                <div className="relative rounded-xl border border-slate-200 bg-white shadow-2xs transition-all focus-within:border-ledger-brass focus-within:ring-2 focus-within:ring-ledger-brass/15">
                  <select
                    disabled={isLoading || isSubmitting}
                    value={fromCustomer}
                    onChange={(e) => setFromCustomer(e.target.value)}
                    className="w-full cursor-pointer appearance-none rounded-xl bg-transparent px-3.5 py-3 text-sm font-medium text-slate-700 outline-none disabled:opacity-50"
                  >
                    <option value="" disabled>
                      {isLoading ? "Loading customers..." : "Select Customer"}
                    </option>
                    {customersList.map((cust) => (
                      <option
                        key={cust.khata_customer_id}
                        value={cust.khata_customer_id}
                      >
                        {cust.customer_name} ({cust.mobile_number})
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                    {isLoading ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      "▼"
                    )}
                  </div>
                </div>
              </div>

              {/* 3. Enter Amount Field */}
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-slate-700">
                  Amount
                </label>
                <div className="relative flex items-center rounded-xl border border-slate-200 bg-white px-3.5 py-3 shadow-2xs transition-all focus-within:border-ledger-brass focus-within:ring-2 focus-within:ring-ledger-brass/15">
                  <IndianRupee
                    size={15}
                    className="mr-2 shrink-0 text-slate-400"
                  />
                  <input
                    type="number"
                    disabled={isSubmitting}
                    value={amount}
                    onChange={(e) => {
                      if (e.target.value.length <= 9) {
                        setAmount(e.target.value);
                      }
                    }}
                    placeholder="Enter Amount"
                    className="w-full bg-transparent text-sm font-semibold text-slate-700 outline-none placeholder:font-bold placeholder:text-slate-400 disabled:opacity-50"
                  />
                </div>
                <div className="text-right text-[11px] font-medium text-slate-400">
                  {amount.length}/9
                </div>
              </div>

              {/* 4. Enter Details Field */}
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-slate-700">
                  Details
                </label>
                <div className="relative rounded-xl border border-slate-200 bg-white px-3.5 py-3 shadow-2xs transition-all focus-within:border-ledger-brass focus-within:ring-2 focus-within:ring-ledger-brass/15">
                  <input
                    type="text"
                    maxLength={36}
                    disabled={isSubmitting}
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="Enter Details"
                    className="w-full bg-transparent text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400 disabled:opacity-50"
                  />
                </div>
                <div className="text-right text-[11px] font-medium text-slate-400">
                  {details.length}/36
                </div>
              </div>

              {/* 5. Pay Action Button */}
              <Button
                type="submit"
                disabled={isLoading}
                loading={isSubmitting}
                loadingText="Processing..."
                className="mt-2 !bg-ledger-brass py-3.5 text-sm font-semibold shadow-sm hover:!bg-ledger-brass-dark"
              >
                Pay
              </Button>
            </form>
          </div>

          {/* Summary / Preview Card */}
          <div className="relative w-full overflow-hidden rounded-2xl border border-ledger-ink-dark bg-ledger-ink p-6 text-white shadow-sm lg:col-span-2">
            <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-ledger-brass-light/10 blur-2xl" />
            <h3 className="relative z-10 text-[13px] font-semibold text-white/70">
              Preview
            </h3>
            <div className="relative z-10 mt-4 space-y-4">
              <div>
                <p className="text-[11px] font-medium text-white/50">From</p>
                <p className="font-serif text-lg font-semibold">
                  {getCustomerName(fromCustomer)}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-medium text-white/50">To</p>
                <p className="font-serif text-lg font-semibold">
                  {getCustomerName(toCustomer)}
                </p>
              </div>
              <div className="border-t border-white/15 pt-4">
                <p className="text-[11px] font-medium text-white/50">Amount</p>
                <p className="font-serif text-3xl font-semibold tabular-nums text-ledger-gold">
                  ₹ {amount || "0"}
                </p>
              </div>
              {details && (
                <p className="rounded-lg bg-white/10 p-3 text-xs font-medium text-white/80">
                  {details}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
