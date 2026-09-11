import { useState, useEffect, useRef, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Filter,
  FileText,
  Wallet,
  TrendingDown,
  TrendingUp,
  Users,
  IndianRupee,
  Loader2,
} from "lucide-react";
import { toast } from "react-toastify";
import Modal from "../components/ui/Modal";
import Spinner from "../components/ui/Spinner";
import Button from "../components/Button";
import {
  customerService,
  khataService,
  transactionService,
  type CustomerApiData,
} from "../services";
import { useKhata } from "../context/KhataContext";
import type { ApiError } from "../lib/apiClient";

interface Customer {
  id: string;
  name: string;
  amount: string;
  type: "give" | "get"; // 'give' -> Dene (Red), 'get' -> Lene (Green)
  rawBalance: number;
}

type FilterOption = "ALL" | "NAME_AZ" | "NAME_ZA" | "BAL_HIGH_LOW" | "BAL_LOW_HIGH";

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedKhataId } = useKhata();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter Dropdown States
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<FilterOption>("ALL");
  const filterRef = useRef<HTMLDivElement>(null);

  // New Customer Form State
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newContactNo, setNewContactNo] = useState("");
  const [newAddress, setNewAddress] = useState("");

  // "Add Single" Transaction Popup State (bottom-right + icon on Dashboard)
  const [isAddTxnModalOpen, setIsAddTxnModalOpen] = useState(false);
  const [isSubmittingTxn, setIsSubmittingTxn] = useState(false);
  const [txnCustomerId, setTxnCustomerId] = useState("");
  const [txnType, setTxnType] = useState<"" | "LENE" | "DENE">("");
  const [txnAmount, setTxnAmount] = useState("");
  const [txnDescription, setTxnDescription] = useState("");

  // Calculated totals state from Khata Stats API
  const [totalLene, setTotalLene] = useState<number>(0);
  const [totalDene, setTotalDene] = useState<number>(0);
  const [netBalance, setNetBalance] = useState<number>(0);

  // If we arrived here via the header's "Create Customer" shortcut, open
  // the Add Customer modal straight away instead of making the user click
  // it again.
  useEffect(() => {
    const state = location.state as { openAddCustomer?: boolean } | null;
    if (state?.openAddCustomer) {
      setIsAddModalOpen(true);
      navigate(location.pathname, { replace: true, state: null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Close filter dropdown on clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Helper to map API record to UI model
  const mapCustomerData = (item: CustomerApiData): Customer => {
    const lene = parseFloat(String(item.total_lene || "0"));
    const dene = parseFloat(String(item.total_dene || "0"));
    const balance = parseFloat(String(item.net_balance || "0"));

    let type: "give" | "get" = "give";
    let formattedAmount = "0";

    if (balance > 0) {
      type = "get";
      formattedAmount = balance.toLocaleString("en-IN");
    } else if (balance < 0) {
      type = "give";
      formattedAmount = Math.abs(balance).toLocaleString("en-IN");
    } else {
      if (lene >= dene) {
        type = "get";
        formattedAmount = lene.toLocaleString("en-IN");
      } else {
        type = "give";
        formattedAmount = dene.toLocaleString("en-IN");
      }
    }

    return {
      id: item.khata_customer_id,
      name: item.customer_name,
      amount: formattedAmount,
      type,
      rawBalance: balance,
    };
  };

  // GET API: Fetch customer list & stats in parallel
  const fetchDashboardData = async () => {
    if (!selectedKhataId) {
      toast.error("No Khata selected. Please select a Khata first.");
      setIsFetching(false);
      return;
    }

    setIsFetching(true);

    try {
      const [customersData, statsData] = await Promise.all([
        customerService.listByKhata(selectedKhataId),
        khataService.stats(selectedKhataId),
      ]);

      // Handle Customers List
      if (customersData.success && Array.isArray(customersData.data)) {
        setCustomers(customersData.data.map(mapCustomerData));
      } else {
        toast.error(customersData.message || "Failed to load customers.");
      }

      // Handle Khata Stats Card Data
      if (statsData.success && statsData.data) {
        const stats = statsData.data;
        setTotalLene(Number(stats.total_you_will_get || 0));
        setTotalDene(Number(stats.total_you_will_give || 0));
        setNetBalance(Number(stats.net_balance || 0));
      } else {
        toast.error(statsData.message || "Failed to load khata statistics.");
      }
    } catch (error) {
      const apiError = error as ApiError;
      console.error("Fetch Dashboard Data Error:", error);
      toast.error(apiError.message || "Unable to connect to the server.");
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // Re-run whenever the active khata changes (header dropdown) so the
    // dashboard refreshes immediately instead of waiting for a route change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedKhataId]);

  // Filter and Sort Customers
  const filteredCustomers = customers
    .filter((customer) => customer.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      switch (selectedFilter) {
        case "NAME_AZ":
          return a.name.localeCompare(b.name);
        case "NAME_ZA":
          return b.name.localeCompare(a.name);
        case "BAL_HIGH_LOW":
          return Math.abs(b.rawBalance) - Math.abs(a.rawBalance);
        case "BAL_LOW_HIGH":
          return Math.abs(a.rawBalance) - Math.abs(b.rawBalance);
        case "ALL":
        default:
          return 0;
      }
    });

  // Navigate to Customer Details page with khata_customer_id
  const handleCustomerClick = (khataCustomerId: string) => {
    navigate(`/customer-detail/${khataCustomerId}`);
  };

  // POST API: Add New Customer
  const handleAddCustomerSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!newCustomerName.trim()) {
      toast.error("Please enter a customer name.");
      return;
    }

    if (!selectedKhataId) {
      toast.error("No active Khata ID found. Please select a Khata first.");
      return;
    }

    setIsSubmitting(true);

    try {
      const data = await customerService.create(selectedKhataId, {
        customer_name: newCustomerName.trim(),
        mobile_number: newContactNo.trim(),
        address: newAddress.trim(),
      });

      if (data.success && data.data) {
        toast.success(data.message || "Customer added successfully!");

        const newCustomer = mapCustomerData(data.data);
        setCustomers((prev) => [newCustomer, ...prev]);

        // Refresh stats after adding a new customer
        fetchDashboardData();

        // Reset and close modal
        setNewCustomerName("");
        setNewContactNo("");
        setNewAddress("");
        setIsAddModalOpen(false);
      } else {
        toast.error(data.message || "Failed to add customer.");
      }
    } catch (error) {
      const apiError = error as ApiError;
      console.error("Add Customer Error:", error);
      toast.error(apiError.message || "Unable to connect to the server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetTxnForm = () => {
    setTxnCustomerId("");
    setTxnType("");
    setTxnAmount("");
    setTxnDescription("");
  };

  // POST API: Add Single Transaction (LENE / DENE) from the Dashboard's
  // floating "+" icon — separate from the "Add Customer" flow above.
  const handleAddTransactionSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!txnCustomerId) {
      toast.error("Please select a customer.");
      return;
    }

    if (txnType !== "LENE" && txnType !== "DENE") {
      toast.error("Please select a transaction type.");
      return;
    }

    const parsedAmount = parseFloat(txnAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error("Please enter a valid amount greater than zero.");
      return;
    }

    setIsSubmittingTxn(true);

    try {
      const data = await transactionService.create({
        khata_customer_id: txnCustomerId,
        amount: parsedAmount,
        transaction_type: txnType,
        description: txnDescription.trim(),
      });

      if (data.success) {
        toast.success(data.message || "Transaction added successfully!");
        resetTxnForm();
        setIsAddTxnModalOpen(false);

        // Refresh customer list & stats so balances reflect the new entry.
        fetchDashboardData();
      } else {
        toast.error(data.message || "Failed to add transaction.");
      }
    } catch (error) {
      const apiError = error as ApiError;
      console.error("Add Transaction Error:", error);
      toast.error(apiError.message || "Unable to connect to the server.");
    } finally {
      setIsSubmittingTxn(false);
    }
  };

  return (
    <div className="w-full font-sans text-ink-900">
      {/* PAGE HEADING */}
      <div className="mb-5 flex flex-col gap-1 sm:mb-6">
        <h1 className="text-xl font-extrabold tracking-tight text-ink-900 sm:text-2xl">
          Dashboard
        </h1>
        <p className="text-xs font-medium text-ink-500 sm:text-sm">
          A quick overview of your ledger and customer balances.
        </p>
      </div>

      {/* STAT CARDS */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        {/* Net Balance */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-700 via-brand-600 to-violet-700 p-5 text-white shadow-lift">
          <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10 blur-2xl" />
          <div className="relative z-10 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-white/70">
              Net Balance
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
              <Wallet size={17} />
            </div>
          </div>
          <div className="relative z-10 mt-3 text-2xl font-black tracking-tight sm:text-3xl">
            ₹ {netBalance.toLocaleString("en-IN")}
          </div>
          <div className="relative z-10 mt-1 text-[11px] font-medium text-white/70">
            Across all khatas &amp; customers
          </div>
        </div>

        {/* You'll Give */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-500">
              Dene (You'll Give)
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-debit-500/10 text-debit-600">
              <TrendingDown size={17} />
            </div>
          </div>
          <div className="mt-3 text-2xl font-extrabold tracking-tight text-debit-600 sm:text-3xl">
            ₹ {totalDene.toLocaleString("en-IN")}
          </div>
          <div className="mt-1 text-[11px] font-medium text-ink-500">Owed to your customers</div>
        </div>

        {/* You'll Get */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-500">
              Lene (You'll Get)
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-credit-500/10 text-credit-600">
              <TrendingUp size={17} />
            </div>
          </div>
          <div className="mt-3 text-2xl font-extrabold tracking-tight text-credit-600 sm:text-3xl">
            ₹ {totalLene.toLocaleString("en-IN")}
          </div>
          <div className="mt-1 text-[11px] font-medium text-ink-500">Owed by your customers</div>
        </div>
      </div>

      {/* SEARCH AND ACTION BAR */}
      <div className="mb-4 flex items-center gap-2 sm:gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-300" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search customer"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm font-medium text-ink-900 shadow-sm outline-none transition-all focus:border-brand-600 focus:ring-2 focus:ring-brand-600/15"
          />
        </div>

        {/* Filter Button & Popup Dropdown Menu */}
        <div className="relative" ref={filterRef}>
          <button
            type="button"
            aria-label="Filter"
            onClick={() => setIsFilterOpen((prev) => !prev)}
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border shadow-sm transition-all active:scale-95 ${
              isFilterOpen || selectedFilter !== "ALL"
                ? "border-brand-600 bg-brand-50 text-brand-700"
                : "border-slate-200 bg-white text-brand-800 hover:bg-brand-50"
            }`}
          >
            <Filter size={18} />
          </button>

          {isFilterOpen && (
            <div className="absolute right-0 top-12 z-30 w-52 overflow-hidden rounded-2xl border border-slate-100 bg-white py-2 shadow-xl ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-100">
              {(
                [
                  ["ALL", "All"],
                  ["NAME_AZ", "Name: A to Z"],
                  ["NAME_ZA", "Name: Z to A"],
                  ["BAL_HIGH_LOW", "Balance: High to Low"],
                  ["BAL_LOW_HIGH", "Balance: Low to High"],
                ] as [FilterOption, string][]
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setSelectedFilter(value);
                    setIsFilterOpen(false);
                  }}
                  className={`flex w-full px-4 py-2.5 text-left text-sm transition-colors ${
                    selectedFilter === value
                      ? "bg-slate-50 font-bold text-ink-900"
                      : "font-medium text-ink-600 hover:bg-slate-50 hover:text-ink-900"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          aria-label="Download Report"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-brand-800 shadow-sm transition-all hover:bg-brand-50 active:scale-95"
        >
          <FileText size={18} />
        </button>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="hidden shrink-0 items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-700 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-violet-600/25 transition-all hover:from-violet-600 hover:to-violet-500 active:scale-95 sm:flex"
        >
          <Plus size={17} className="stroke-[2.5]" />
          <span>Add Customer</span>
        </button>
      </div>

      {/* CUSTOMER LIST SECTION */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-card">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5 sm:px-5">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-brand-600" />
            <h2 className="text-sm font-bold text-ink-900 sm:text-base">Customers</h2>
          </div>
          <span className="text-xs font-semibold text-ink-500">
            {filteredCustomers.length} total
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {isFetching ? (
            <div className="flex items-center justify-center py-10 text-slate-400 gap-2 text-sm">
              <Spinner size={18} className="text-brand-600" />
              <span>Loading customers...</span>
            </div>
          ) : filteredCustomers.length > 0 ? (
            filteredCustomers.map((customer) => (
              <button
                key={customer.id}
                type="button"
                onClick={() => handleCustomerClick(customer.id)}
                className="group flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors hover:bg-brand-50/40 sm:px-5"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold ring-1 ${
                      customer.type === "get"
                        ? "bg-credit-500/10 text-credit-600 ring-credit-500/20"
                        : "bg-debit-500/10 text-debit-600 ring-debit-500/20"
                    }`}
                  >
                    {initials(customer.name)}
                  </div>
                  <span className="truncate text-sm font-bold text-ink-900 transition-colors group-hover:text-brand-700 sm:text-base">
                    {customer.name}
                  </span>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <span
                    className={`text-sm font-extrabold sm:text-base ${
                      customer.type === "get" ? "text-credit-600" : "text-debit-600"
                    }`}
                  >
                    ₹ {customer.amount}
                  </span>
                </div>
              </button>
            ))
          ) : (
            <div className="p-8 text-center text-sm font-medium text-ink-500">
              No customers found matching "{searchQuery}"
            </div>
          )}
        </div>
      </div>

      {/* Floating add-customer trigger for small screens */}
      <button
        type="button"
        onClick={() => setIsAddModalOpen(true)}
        aria-label="Add Customer"
        className="fixed bottom-5 right-5 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-violet-700 to-violet-600 text-white shadow-lift transition-all active:scale-95 sm:hidden"
      >
        <Plus size={24} className="stroke-[2.5]" />
      </button>

      {/* Floating add-transaction trigger — bottom right corner on every
          screen size, sits well clear of the fixed bottom nav bar and the
          mobile-only Add Customer FAB above. */}
      <button
        type="button"
        onClick={() => setIsAddTxnModalOpen(true)}
        aria-label="Add Transaction"
        className="fixed bottom-24 right-5 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-sky-600 to-blue-600 text-white shadow-lift transition-all active:scale-95 sm:right-6"
      >
        <Plus size={24} className="stroke-[2.5]" />
      </button>

      {/* NEW CUSTOMER POPUP MODAL */}
      <Modal
        open={isAddModalOpen}
        onClose={() => !isSubmitting && setIsAddModalOpen(false)}
        title="New Customer"
        preventClose={isSubmitting}
      >
        <form onSubmit={handleAddCustomerSubmit} className="flex flex-col gap-4 p-5 sm:p-6">
          {/* Customer Name Input */}
          <div className="space-y-1">
            <div className="relative rounded-xl border border-slate-200 bg-white px-3.5 py-3 transition-all focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-brand-600/15">
              <input
                type="text"
                maxLength={36}
                required
                disabled={isSubmitting}
                value={newCustomerName}
                onChange={(e) => setNewCustomerName(e.target.value)}
                placeholder="Customer Name"
                className="w-full bg-transparent text-sm font-medium text-ink-900 outline-none placeholder:text-ink-300 disabled:opacity-50"
              />
            </div>
            <div className="text-right text-[11px] text-ink-300">{newCustomerName.length}/36</div>
          </div>

          {/* Contact No Input with Country Code */}
          <div>
            <div className="flex items-center rounded-xl border border-slate-200 bg-white px-3.5 py-3 transition-all focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-brand-600/15">
              <div className="mr-3 flex shrink-0 items-center gap-1.5 whitespace-nowrap border-r border-slate-200 pr-3 text-xs font-bold text-ink-700">
                <span className="text-base leading-none">🇮🇳</span>
                <span>+91</span>
                <span className="text-[10px] text-ink-300">▼</span>
              </div>
              <input
                type="tel"
                disabled={isSubmitting}
                value={newContactNo}
                onChange={(e) => setNewContactNo(e.target.value)}
                placeholder="Contact No"
                className="w-full bg-transparent text-sm font-medium text-ink-900 outline-none placeholder:text-ink-300 disabled:opacity-50"
              />
            </div>
          </div>

          {/* Address Input */}
          <div className="space-y-1">
            <div className="relative rounded-xl border border-slate-200 bg-white px-3.5 py-3 transition-all focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-brand-600/15">
              <input
                type="text"
                maxLength={36}
                disabled={isSubmitting}
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                placeholder="Address"
                className="w-full bg-transparent text-sm font-medium text-ink-900 outline-none placeholder:text-ink-300 disabled:opacity-50"
              />
            </div>
            <div className="text-right text-[11px] text-ink-300">{newAddress.length}/36</div>
          </div>

          {/* Continue Submit Button */}
          <Button type="submit" loading={isSubmitting} loadingText="Adding Customer...">
            Continue
          </Button>
        </form>
      </Modal>

      {/* ADD SINGLE TRANSACTION POPUP MODAL — triggered by the bottom-right + icon */}
      <Modal
        open={isAddTxnModalOpen}
        onClose={() => {
          if (isSubmittingTxn) return;
          setIsAddTxnModalOpen(false);
          resetTxnForm();
        }}
        title="Add Single"
        preventClose={isSubmittingTxn}
      >
        <form onSubmit={handleAddTransactionSubmit} className="flex flex-col gap-4 p-5 sm:p-6">
          {/* Customer Dropdown */}
          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-ink-700">Customer</label>
            <div className="relative rounded-xl border border-slate-200 bg-white shadow-2xs transition-all focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-brand-600/15">
              <select
                required
                disabled={isSubmittingTxn || isFetching}
                value={txnCustomerId}
                onChange={(e) => setTxnCustomerId(e.target.value)}
                className="w-full cursor-pointer appearance-none rounded-xl bg-transparent px-3.5 py-3 text-sm font-medium text-ink-700 outline-none disabled:opacity-50"
              >
                <option value="" disabled>
                  {isFetching ? "Loading customers..." : "Select Customer"}
                </option>
                {customers.map((cust) => (
                  <option key={cust.id} value={cust.id}>
                    {cust.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-ink-300">
                {isFetching ? <Loader2 size={14} className="animate-spin" /> : "▼"}
              </div>
            </div>
          </div>

          {/* Transaction Type Dropdown (LENE / DENE) */}
          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-ink-700">Type</label>
            <div className="relative rounded-xl border border-slate-200 bg-white shadow-2xs transition-all focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-brand-600/15">
              <select
                required
                disabled={isSubmittingTxn}
                value={txnType}
                onChange={(e) => setTxnType(e.target.value as "" | "LENE" | "DENE")}
                className="w-full cursor-pointer appearance-none rounded-xl bg-transparent px-3.5 py-3 text-sm font-medium text-ink-700 outline-none disabled:opacity-50"
              >
                <option value="" disabled>
                  Select Type
                </option>
                <option value="LENE">LENE (You&apos;ll Get)</option>
                <option value="DENE">DENE (You&apos;ll Give)</option>
              </select>
              <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-ink-300">
                ▼
              </div>
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-1">
            <label className="block text-sm font-bold text-ink-700">Amount</label>
            <div className="relative flex items-center rounded-xl border border-slate-200 bg-white px-3.5 py-3 shadow-2xs transition-all focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-brand-600/15">
              <IndianRupee size={15} className="mr-2 shrink-0 text-ink-300" />
              <input
                type="number"
                step="any"
                required
                disabled={isSubmittingTxn}
                value={txnAmount}
                onChange={(e) => {
                  if (e.target.value.length <= 9) {
                    setTxnAmount(e.target.value);
                  }
                }}
                placeholder="Enter Amount"
                className="w-full bg-transparent text-sm font-bold text-ink-700 outline-none placeholder:font-bold placeholder:text-ink-300 disabled:opacity-50"
              />
            </div>
            <div className="text-right text-[11px] font-medium text-ink-300">
              {txnAmount.length}/9
            </div>
          </div>

          {/* Details Input */}
          <div className="space-y-1">
            <label className="block text-sm font-bold text-ink-700">Details</label>
            <div className="relative rounded-xl border border-slate-200 bg-white px-3.5 py-3 shadow-2xs transition-all focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-brand-600/15">
              <input
                type="text"
                maxLength={100}
                disabled={isSubmittingTxn}
                value={txnDescription}
                onChange={(e) => setTxnDescription(e.target.value)}
                placeholder="Enter Details (e.g. Cash received)"
                className="w-full bg-transparent text-sm font-medium text-ink-700 outline-none placeholder:text-ink-300 disabled:opacity-50"
              />
            </div>
            <div className="text-right text-[11px] font-medium text-ink-300">
              {txnDescription.length}/100
            </div>
          </div>

          {/* Pay Button — POSTs to /transactions */}
          <Button type="submit" loading={isSubmittingTxn} loadingText="Processing...">
            Pay
          </Button>
        </form>
      </Modal>
    </div>
  );
}
