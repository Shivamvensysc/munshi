// import { useState, useEffect, useRef, type FormEvent, type KeyboardEvent } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import {
//   Plus,
//   Search,
//   Filter,
//   FileText,
//   Wallet,
//   TrendingDown,
//   TrendingUp,
//   Users,
//   IndianRupee,
//   Loader2,
//   ChevronDown,
//   Check,
//   X,
// } from "lucide-react";
// import { toast } from "react-toastify";
// import Modal from "../components/ui/Modal";
// import Spinner from "../components/ui/Spinner";
// import Button from "../components/Button";
// import {
//   customerService,
//   khataService,
//   transactionService,
//   type CustomerApiData,
// } from "../services";
// import { useKhata } from "../context/KhataContext";
// import type { ApiError } from "../lib/apiClient";

// interface Customer {
//   id: string;
//   name: string;
//   amount: string;
//   type: "give" | "get"; // 'give' -> Red (Lene higher/only), 'get' -> Green (Dene higher/only)
//   rawBalance: number;
// }

// type FilterOption =
//   | "ALL"
//   | "NAME_AZ"
//   | "NAME_ZA"
//   | "BAL_HIGH_LOW"
//   | "BAL_LOW_HIGH";

// function initials(name: string) {
//   return name
//     .split(" ")
//     .map((w) => w[0])
//     .join("")
//     .slice(0, 2)
//     .toUpperCase();
// }

// export default function Dashboard() {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { selectedKhataId, isLoadingKhatas } = useKhata();

//   const [customers, setCustomers] = useState<Customer[]>([]);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [isAddModalOpen, setIsAddModalOpen] = useState(false);
//   const [isFetching, setIsFetching] = useState(true);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   // Filter Dropdown States
//   const [isFilterOpen, setIsFilterOpen] = useState(false);
//   const [selectedFilter, setSelectedFilter] = useState<FilterOption>("ALL");
//   const filterRef = useRef<HTMLDivElement>(null);

//   // New Customer Form State
//   const [newCustomerName, setNewCustomerName] = useState("");
//   const [newContactNo, setNewContactNo] = useState("");
//   const [newAddress, setNewAddress] = useState("");

//   // "Add Single" Transaction Popup State
//   const [isAddTxnModalOpen, setIsAddTxnModalOpen] = useState(false);
//   const [isSubmittingTxn, setIsSubmittingTxn] = useState(false);
//   const [txnCustomerId, setTxnCustomerId] = useState("");
//   const [txnCustomerSearch, setTxnCustomerSearch] = useState("");
//   const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
//   const [highlightedIndex, setHighlightedIndex] = useState(-1);
//   const [shouldFocusCustomerInput, setShouldFocusCustomerInput] = useState(false);
//   const customerDropdownRef = useRef<HTMLDivElement>(null);
//   const customerInputRef = useRef<HTMLInputElement>(null);

//   const [txnType, setTxnType] = useState<"" | "LENE" | "DENE">("");
//   const [txnAmount, setTxnAmount] = useState("");
//   const [txnDescription, setTxnDescription] = useState("");

//   // Calculated totals state from Khata Stats API
//   const [totalLene, setTotalLene] = useState<number>(0);
//   const [totalDene, setTotalDene] = useState<number>(0);
//   const [netBalance, setNetBalance] = useState<number>(0);

//   // Universal cross-browser focus execution using requestAnimationFrame
//   useEffect(() => {
//     if (isAddTxnModalOpen && shouldFocusCustomerInput && !isSubmittingTxn) {
//       let rafId1: number;
//       let rafId2: number;
//       let fallbackTimer: ReturnType<typeof setTimeout>;

//       const triggerFocus = () => {
//         if (customerInputRef.current) {
//           customerInputRef.current.focus({ preventScroll: true });
//         }
//       };

//       // Double rAF ensures browser layout, paint, and modal animation locks are resolved
//       rafId1 = requestAnimationFrame(() => {
//         rafId2 = requestAnimationFrame(() => {
//           triggerFocus();
//           setShouldFocusCustomerInput(false);
//         });
//       });

//       // Extra fallback for slower systems/devices with delayed modal transitions
//       fallbackTimer = setTimeout(() => {
//         triggerFocus();
//       }, 150);

//       return () => {
//         cancelAnimationFrame(rafId1);
//         cancelAnimationFrame(rafId2);
//         clearTimeout(fallbackTimer);
//       };
//     }
//   }, [isAddTxnModalOpen, shouldFocusCustomerInput, isSubmittingTxn]);

//   // Open Add Customer modal if routed from header shortcut
//   useEffect(() => {
//     const state = location.state as { openAddCustomer?: boolean } | null;
//     if (state?.openAddCustomer) {
//       setIsAddModalOpen(true);
//       navigate(location.pathname, { replace: true, state: null });
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // Close filter dropdown and customer select dropdown on click outside
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (
//         filterRef.current &&
//         !filterRef.current.contains(event.target as Node)
//       ) {
//         setIsFilterOpen(false);
//       }
//       if (
//         customerDropdownRef.current &&
//         !customerDropdownRef.current.contains(event.target as Node)
//       ) {
//         setIsCustomerDropdownOpen(false);
//         setHighlightedIndex(-1);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);

//   // Helper to map API record to UI model
//   const mapCustomerData = (item: CustomerApiData): Customer => {
//     const lene = parseFloat(String(item.total_lene || "0"));
//     const dene = parseFloat(String(item.total_dene || "0"));
//     const balance = parseFloat(String(item.net_balance || "0"));

//     // Customer table rules:
//     // Lene > Dene -> Red ('give')
//     // Dene > Lene -> Green ('get')
//     let type: "give" | "get" = "give";

//     if (lene > dene) {
//       type = "give"; // Red
//     } else if (dene > lene) {
//       type = "get"; // Green
//     } else {
//       type = balance >= 0 ? "give" : "get";
//     }

//     const displayAmount =
//       balance !== 0 ? Math.abs(balance) : Math.max(lene, dene);
//     const formattedAmount = displayAmount.toLocaleString("en-IN", {
//       minimumFractionDigits: 2,
//       maximumFractionDigits: 2,
//     });

//     return {
//       id: item.khata_customer_id,
//       name: item.customer_name,
//       amount: formattedAmount,
//       type,
//       rawBalance: balance,
//     };
//   };

//   // GET API: Fetch customer list & stats in parallel
//   const fetchDashboardData = async () => {
//     if (!selectedKhataId) {
//       if (!isLoadingKhatas) {
//         toast.error("No Khata selected. Please select a Khata first.");
//         setIsFetching(false);
//       }
//       return;
//     }

//     setIsFetching(true);

//     try {
//       const [customersData, statsData] = await Promise.all([
//         customerService.listByKhata(selectedKhataId),
//         khataService.stats(selectedKhataId),
//       ]);

//       if (customersData.success && Array.isArray(customersData.data)) {
//         setCustomers(customersData.data.map(mapCustomerData));
//       } else {
//         toast.error(customersData.message || "Failed to load customers.");
//       }

//       if (statsData.success && statsData.data) {
//         const stats = statsData.data;
//         setTotalLene(Number(stats.total_you_will_get || 0));
//         setTotalDene(Number(stats.total_you_will_give || 0));
//         setNetBalance(Number(stats.net_balance || 0));
//       } else {
//         toast.error(statsData.message || "Failed to load khata statistics.");
//       }
//     } catch (error) {
//       const apiError = error as ApiError;
//       console.error("Fetch Dashboard Data Error:", error);
//       toast.error(apiError.message || "Unable to connect to the server.");
//     } finally {
//       setIsFetching(false);
//     }
//   };

//   useEffect(() => {
//     fetchDashboardData();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [selectedKhataId, isLoadingKhatas]);

//   // Filter and Sort Customers for list
//   const filteredCustomers = customers
//     .filter((customer) =>
//       customer.name.toLowerCase().includes(searchQuery.toLowerCase()),
//     )
//     .sort((a, b) => {
//       switch (selectedFilter) {
//         case "NAME_AZ":
//           return a.name.localeCompare(b.name);
//         case "NAME_ZA":
//           return b.name.localeCompare(a.name);
//         case "BAL_HIGH_LOW":
//           return Math.abs(b.rawBalance) - Math.abs(a.rawBalance);
//         case "BAL_LOW_HIGH":
//           return Math.abs(a.rawBalance) - Math.abs(b.rawBalance);
//         case "ALL":
//         default:
//           return 0;
//       }
//     });

//   // Filter Customers inside the Modal dropdown
//   const filteredModalCustomers = customers.filter((cust) =>
//     cust.name.toLowerCase().includes(txnCustomerSearch.toLowerCase()),
//   );

//   const handleCustomerClick = (khataCustomerId: string) => {
//     navigate(`/customer-detail/${khataCustomerId}`);
//   };

//   // POST API: Add New Customer
//   const handleAddCustomerSubmit = async (e: FormEvent) => {
//     e.preventDefault();

//     if (!newCustomerName.trim()) {
//       toast.error("Please enter a customer name.");
//       return;
//     }

//     if (!selectedKhataId) {
//       toast.error("No active Khata ID found. Please select a Khata first.");
//       return;
//     }

//     setIsSubmitting(true);

//     try {
//       const data = await customerService.create(selectedKhataId, {
//         customer_name: newCustomerName.trim(),
//         mobile_number: newContactNo.trim(),
//         address: newAddress.trim(),
//       });

//       if (data.success && data.data) {
//         toast.success(data.message || "Customer added successfully!");

//         const newCustomer = mapCustomerData(data.data);
//         setCustomers((prev) => [newCustomer, ...prev]);

//         fetchDashboardData();

//         setNewCustomerName("");
//         setNewContactNo("");
//         setNewAddress("");
//         setIsAddModalOpen(false);
//       } else {
//         toast.error(data.message || "Failed to add customer.");
//       }
//     } catch (error) {
//       const apiError = error as ApiError;
//       console.error("Add Customer Error:", error);
//       toast.error(apiError.message || "Unable to connect to the server.");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const resetTxnForm = () => {
//     setTxnCustomerId("");
//     setTxnCustomerSearch("");
//     setIsCustomerDropdownOpen(false);
//     setHighlightedIndex(-1);
//     setTxnType("");
//     setTxnAmount("");
//     setTxnDescription("");
//   };

//   const selectCustomer = (cust: Customer) => {
//     setTxnCustomerId(cust.id);
//     setTxnCustomerSearch(cust.name);
//     setIsCustomerDropdownOpen(false);
//     setHighlightedIndex(-1);
//   };

//   // Keyboard navigation for customer selection
//   const handleCustomerKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
//     if (isSubmittingTxn || isFetching) return;

//     if (!isCustomerDropdownOpen && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
//       setIsCustomerDropdownOpen(true);
//       return;
//     }

//     if (e.key === "ArrowDown") {
//       e.preventDefault();
//       setHighlightedIndex((prev) =>
//         prev < filteredModalCustomers.length - 1 ? prev + 1 : 0
//       );
//     } else if (e.key === "ArrowUp") {
//       e.preventDefault();
//       setHighlightedIndex((prev) =>
//         prev > 0 ? prev - 1 : filteredModalCustomers.length - 1
//       );
//     } else if (e.key === "Enter") {
//       if (isCustomerDropdownOpen && filteredModalCustomers.length > 0) {
//         e.preventDefault();
//         const targetIndex = highlightedIndex >= 0 ? highlightedIndex : 0;
//         const targetCustomer = filteredModalCustomers[targetIndex];
//         if (targetCustomer) {
//           selectCustomer(targetCustomer);
//         }
//       }
//     } else if (e.key === "Escape") {
//       setIsCustomerDropdownOpen(false);
//       setHighlightedIndex(-1);
//     }
//   };

//   // POST API: Add Single Transaction
//   const handleAddTransactionSubmit = async (e: FormEvent) => {
//     e.preventDefault();

//     if (!txnCustomerId) {
//       toast.error("Please select a customer.");
//       customerInputRef.current?.focus({ preventScroll: true });
//       return;
//     }

//     if (txnType !== "LENE" && txnType !== "DENE") {
//       toast.error("Please select a transaction type.");
//       return;
//     }

//     const parsedAmount = parseFloat(txnAmount);
//     if (isNaN(parsedAmount) || parsedAmount <= 0) {
//       toast.error("Please enter a valid amount greater than zero.");
//       return;
//     }

//     setIsSubmittingTxn(true);

//     try {
//       const data = await transactionService.create({
//         khata_customer_id: txnCustomerId,
//         amount: parsedAmount,
//         transaction_type: txnType,
//         description: txnDescription.trim(),
//       });

//       if (data.success) {
//         toast.success(data.message || "Transaction added successfully!");
//         // Clear form state without closing the modal
//         resetTxnForm();
//         // Trigger auto-focus on customer input field reliably
//         setShouldFocusCustomerInput(true);
//         // Refresh customer list & stats to keep values up to date
//         fetchDashboardData();
//       } else {
//         toast.error(data.message || "Failed to add transaction.");
//       }
//     } catch (error) {
//       const apiError = error as ApiError;
//       console.error("Add Transaction Error:", error);
//       toast.error(apiError.message || "Unable to connect to the server.");
//     } finally {
//       setIsSubmittingTxn(false);
//     }
//   };

//   return (
//     <div className="w-full min-h-full bg-ledger-bg font-sans text-ledger-ink">
//       <div className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-6 sm:py-6">
//         {/* PAGE HEADING */}
//         <div className="mb-5 flex flex-col gap-1 sm:mb-6">
//           <h1 className="font-serif text-xl font-semibold tracking-tight text-ledger-ink sm:text-2xl">
//             Dashboard
//           </h1>
//           <p className="text-xs font-medium text-ledger-subtle sm:text-sm">
//             A quick overview of your ledger and customer balances.
//           </p>
//         </div>

//         {/* STAT CARDS */}
//         <div className="mb-6 grid w-full grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
//           <div className="relative w-full overflow-hidden rounded-2xl border border-ledger-ink-dark bg-ledger-ink p-5 text-white shadow-sm">
//             <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-ledger-brass-light/10 blur-2xl" />
//             <div className="relative z-10 flex items-center justify-between">
//               <span className="text-[13px] font-semibold text-white/70">
//                 Net balance
//               </span>
//               <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-ledger-brass-light/20 text-ledger-gold">
//                 <Wallet size={17} />
//               </div>
//             </div>
//             <div className="relative z-10 mt-3 font-serif text-2xl font-semibold tabular-nums sm:text-3xl">
//               ₹ {netBalance.toLocaleString("en-IN")}
//             </div>
//             <div className="relative z-10 mt-1 text-[11px] font-medium text-white/60">
//               Across all khatas &amp; customers
//             </div>
//           </div>

//           {/* DENE CARD - GREEN */}
//           <div className="w-full rounded-2xl border border-ledger-border bg-ledger-paper p-5 shadow-sm">
//             <div className="flex items-center justify-between">
//               <span className="text-[13px] font-semibold text-ledger-muted">
//                 Dene (You'll Give)
//               </span>
//               <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-ledger-green/10 text-ledger-green">
//                 <TrendingDown size={17} />
//               </div>
//             </div>
//             <div className="mt-3 font-serif text-2xl font-semibold tabular-nums text-ledger-green sm:text-3xl">
//               ₹ {totalDene.toLocaleString("en-IN")}
//             </div>
//             <div className="mt-1 text-[11px] font-medium text-ledger-faint">
//               Owed to your customers
//             </div>
//           </div>

//           {/* LENE CARD - RED */}
//           <div className="w-full rounded-2xl border border-ledger-border bg-ledger-paper p-5 shadow-sm">
//             <div className="flex items-center justify-between">
//               <span className="text-[13px] font-semibold text-ledger-muted">
//                 Lene (You'll Get)
//               </span>
//               <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-ledger-red/10 text-ledger-red">
//                 <TrendingUp size={17} />
//               </div>
//             </div>
//             <div className="mt-3 font-serif text-2xl font-semibold tabular-nums text-ledger-red sm:text-3xl">
//               ₹ {totalLene.toLocaleString("en-IN")}
//             </div>
//             <div className="mt-1 text-[11px] font-medium text-ledger-faint">
//               Owed by your customers
//             </div>
//           </div>
//         </div>

//         {/* SEARCH AND ACTION BAR */}
//         <div className="mb-4 flex w-full items-center gap-2 sm:gap-3">
//           <div className="relative min-w-0 flex-1">
//             <Search
//               size={18}
//               className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ledger-placeholder"
//             />
//             <input
//               type="text"
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               placeholder="Search customer"
//               className="w-full rounded-xl border border-ledger-border bg-ledger-paper py-2.5 pl-10 pr-4 text-sm font-medium text-ledger-ink shadow-sm outline-none transition-all placeholder:text-ledger-placeholder focus:border-ledger-brass focus:ring-2 focus:ring-ledger-brass/15"
//             />
//           </div>

//           <div className="relative shrink-0" ref={filterRef}>
//             <button
//               type="button"
//               aria-label="Filter"
//               onClick={() => setIsFilterOpen((prev) => !prev)}
//               className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border shadow-sm transition-all active:scale-95 ${
//                 isFilterOpen || selectedFilter !== "ALL"
//                   ? "border-ledger-brass bg-ledger-brass/10 text-ledger-brass-dark"
//                   : "border-ledger-border bg-ledger-paper text-ledger-muted hover:bg-ledger-hover"
//               }`}
//             >
//               <Filter size={18} />
//             </button>

//             {isFilterOpen && (
//               <div className="absolute right-0 top-12 z-30 w-52 overflow-hidden rounded-2xl border border-ledger-border bg-ledger-paper py-2 shadow-xl ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-100">
//                 {(
//                   [
//                     ["ALL", "All"],
//                     ["NAME_AZ", "Name: A to Z"],
//                     ["NAME_ZA", "Name: Z to A"],
//                     ["BAL_HIGH_LOW", "Balance: High to Low"],
//                     ["BAL_LOW_HIGH", "Balance: Low to High"],
//                   ] as [FilterOption, string][]
//                 ).map(([value, label]) => (
//                   <button
//                     key={value}
//                     type="button"
//                     onClick={() => {
//                       setSelectedFilter(value);
//                       setIsFilterOpen(false);
//                     }}
//                     className={`flex w-full px-4 py-2.5 text-left text-sm transition-colors ${
//                       selectedFilter === value
//                         ? "bg-ledger-hover font-semibold text-ledger-ink"
//                         : "font-medium text-ledger-muted hover:bg-ledger-hover hover:text-ledger-ink"
//                     }`}
//                   >
//                     {label}
//                   </button>
//                 ))}
//               </div>
//             )}
//           </div>

//           <button
//             type="button"
//             aria-label="Download Report"
//             className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-ledger-border bg-ledger-paper text-ledger-muted shadow-sm transition-all hover:bg-ledger-hover active:scale-95"
//           >
//             <FileText size={18} />
//           </button>

//           <button
//             type="button"
//             onClick={() => setIsAddModalOpen(true)}
//             className="hidden shrink-0 items-center gap-1.5 rounded-xl bg-ledger-brass px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-ledger-brass-dark active:scale-95 sm:flex"
//           >
//             <Plus size={17} className="stroke-[2.5]" />
//             <span>Add Customer</span>
//           </button>
//         </div>

//         {/* CUSTOMER LIST SECTION */}
//         <div className="w-full rounded-2xl border border-ledger-border bg-ledger-paper shadow-sm">
//           <div className="flex items-center justify-between border-b border-ledger-border-soft px-4 py-3.5 sm:px-5">
//             <div className="flex items-center gap-2">
//               <Users size={16} className="text-ledger-brass-dark" />
//               <h2 className="text-sm font-semibold text-ledger-ink sm:text-base">
//                 Customers
//               </h2>
//             </div>
//             <span className="text-xs font-semibold text-ledger-faint">
//               {filteredCustomers.length} total
//             </span>
//           </div>

//           <div className="divide-y divide-ledger-border-soft">
//             {isFetching ? (
//               <div className="flex items-center justify-center gap-2 py-10 text-sm text-ledger-faint">
//                 <Spinner size={18} className="text-ledger-brass-dark" />
//                 <span>Loading customers...</span>
//               </div>
//             ) : filteredCustomers.length > 0 ? (
//               filteredCustomers.map((customer) => (
//                 <button
//                   key={customer.id}
//                   type="button"
//                   onClick={() => handleCustomerClick(customer.id)}
//                   className="group flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors hover:bg-ledger-hover/70 sm:px-5"
//                 >
//                   <div className="flex min-w-0 items-center gap-3">
//                     <div
//                       className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold ring-1 ${
//                         customer.type === "get"
//                           ? "bg-ledger-green/10 text-ledger-green ring-ledger-green/20"
//                           : "bg-ledger-red/10 text-ledger-red ring-ledger-red/20"
//                       }`}
//                     >
//                       {initials(customer.name)}
//                     </div>
//                     <span className="truncate text-sm font-semibold text-ledger-ink transition-colors group-hover:text-ledger-brass-dark sm:text-base">
//                       {customer.name}
//                     </span>
//                   </div>

//                   <div className="flex shrink-0 items-center gap-2">
//                     <span
//                       className={`font-serif text-sm font-semibold tabular-nums sm:text-base ${
//                         customer.type === "get"
//                           ? "text-ledger-green"
//                           : "text-ledger-red"
//                       }`}
//                     >
//                       ₹ {customer.amount}
//                     </span>
//                   </div>
//                 </button>
//               ))
//             ) : (
//               <div className="p-8 text-center text-sm font-medium text-ledger-faint">
//                 {searchQuery.trim() ? (
//                   <>No customers found matching &quot;{searchQuery}&quot;</>
//                 ) : (
//                   <>No customers found</>
//                 )}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Floating add-customer trigger for small screens */}
//       <button
//         type="button"
//         onClick={() => setIsAddModalOpen(true)}
//         aria-label="Add Customer"
//         className="fixed bottom-5 right-5 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-ledger-brass text-white shadow-lg transition-all hover:bg-ledger-brass-dark active:scale-95 sm:hidden"
//       >
//         <Plus size={24} className="stroke-[2.5]" />
//       </button>

//       {/* Floating add-transaction trigger */}
//       <button
//         type="button"
//         onClick={() => {
//           setIsAddTxnModalOpen(true);
//           setShouldFocusCustomerInput(true);
//         }}
//         aria-label="Add Transaction"
//         className="fixed bottom-24 right-5 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-ledger-ink text-white shadow-lg transition-all hover:bg-ledger-ink-dark active:scale-95 sm:right-6"
//       >
//         <Plus size={24} className="stroke-[2.5]" />
//       </button>

//       {/* NEW CUSTOMER POPUP MODAL */}
//       <Modal
//         open={isAddModalOpen}
//         onClose={() => !isSubmitting && setIsAddModalOpen(false)}
//         title="New Customer"
//         preventClose={isSubmitting}
//       >
//         <form
//           onSubmit={handleAddCustomerSubmit}
//           className="flex flex-col gap-4 p-5 sm:p-6"
//         >
//           <div className="space-y-1">
//             <div className="relative rounded-xl border border-slate-200 bg-white px-3.5 py-3 transition-all focus-within:border-ledger-brass focus-within:ring-2 focus-within:ring-ledger-brass/15">
//               <input
//                 type="text"
//                 maxLength={36}
//                 required
//                 disabled={isSubmitting}
//                 value={newCustomerName}
//                 onChange={(e) => setNewCustomerName(e.target.value)}
//                 placeholder="Customer Name"
//                 className="w-full bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400 disabled:opacity-50"
//               />
//             </div>
//             <div className="text-right text-[11px] text-slate-400">
//               {newCustomerName.length}/36
//             </div>
//           </div>

//           <div>
//             <div className="flex items-center rounded-xl border border-slate-200 bg-white px-3.5 py-3 transition-all focus-within:border-ledger-brass focus-within:ring-2 focus-within:ring-ledger-brass/15">
//               <div className="mr-3 flex shrink-0 items-center gap-1.5 whitespace-nowrap border-r border-slate-200 pr-3 text-xs font-bold text-slate-700">
//                 <span className="text-base leading-none">🇮🇳</span>
//                 <span>+91</span>
//                 <span className="text-[10px] text-slate-400">▼</span>
//               </div>
//               <input
//                 type="tel"
//                 disabled={isSubmitting}
//                 value={newContactNo}
//                 onChange={(e) => setNewContactNo(e.target.value)}
//                 placeholder="Contact No"
//                 className="w-full bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400 disabled:opacity-50"
//               />
//             </div>
//           </div>

//           <div className="space-y-1">
//             <div className="relative rounded-xl border border-slate-200 bg-white px-3.5 py-3 transition-all focus-within:border-ledger-brass focus-within:ring-2 focus-within:ring-ledger-brass/15">
//               <input
//                 type="text"
//                 maxLength={36}
//                 disabled={isSubmitting}
//                 value={newAddress}
//                 onChange={(e) => setNewAddress(e.target.value)}
//                 placeholder="Address"
//                 className="w-full bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400 disabled:opacity-50"
//               />
//             </div>
//             <div className="text-right text-[11px] text-slate-400">
//               {newAddress.length}/36
//             </div>
//           </div>

//           <Button
//             type="submit"
//             loading={isSubmitting}
//             loadingText="Adding Customer..."
//           >
//             Continue
//           </Button>
//         </form>
//       </Modal>

//       {/* ADD SINGLE TRANSACTION POPUP MODAL */}
//       <Modal
//         open={isAddTxnModalOpen}
//         onClose={() => {
//           if (isSubmittingTxn) return;
//           setIsAddTxnModalOpen(false);
//           resetTxnForm();
//         }}
//         title="Add Single"
//         preventClose={isSubmittingTxn}
//       >
//         <form
//           onSubmit={handleAddTransactionSubmit}
//           className="flex flex-col gap-4 p-5 sm:p-6"
//         >
//           {/* Customer Searchable Direct Input with Dropdown */}
//           <div className="space-y-1.5">
//             <label className="block text-sm font-semibold text-slate-700">
//               Customer
//             </label>
//             <div className="relative" ref={customerDropdownRef}>
//               <div className="relative flex items-center rounded-xl border border-slate-200 bg-white shadow-2xs transition-all focus-within:border-ledger-brass focus-within:ring-2 focus-within:ring-ledger-brass/15">
//                 <Search size={16} className="ml-3.5 shrink-0 text-slate-400" />
//                 <input
//                   ref={customerInputRef}
//                   type="text"
//                   disabled={isSubmittingTxn || isFetching}
//                   value={txnCustomerSearch}
//                   onFocus={() => {
//                     setIsCustomerDropdownOpen(true);
//                     setHighlightedIndex(-1);
//                   }}
//                   onChange={(e) => {
//                     setTxnCustomerSearch(e.target.value);
//                     setTxnCustomerId("");
//                     setIsCustomerDropdownOpen(true);
//                     setHighlightedIndex(0);
//                   }}
//                   onKeyDown={handleCustomerKeyDown}
//                   placeholder={
//                     isFetching ? "Loading customers..." : "Search & Select Customer..."
//                   }
//                   className="w-full bg-transparent px-3 py-3 text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400 disabled:opacity-50"
//                 />

//                 <div className="mr-3 flex shrink-0 items-center gap-1.5">
//                   {txnCustomerSearch && !isSubmittingTxn && (
//                     <button
//                       type="button"
//                       aria-label="Clear customer selection"
//                       onClick={() => {
//                         setTxnCustomerSearch("");
//                         setTxnCustomerId("");
//                         setIsCustomerDropdownOpen(true);
//                         setHighlightedIndex(-1);
//                         customerInputRef.current?.focus({ preventScroll: true });
//                       }}
//                       className="rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
//                     >
//                       <X size={14} />
//                     </button>
//                   )}

//                   {isFetching ? (
//                     <Loader2 size={15} className="animate-spin text-slate-400" />
//                   ) : (
//                     <button
//                       type="button"
//                       aria-label="Toggle customer list"
//                       tabIndex={-1}
//                       onClick={() => {
//                         setIsCustomerDropdownOpen((prev) => !prev);
//                         customerInputRef.current?.focus({ preventScroll: true });
//                       }}
//                       className="rounded p-0.5 text-slate-400 hover:text-slate-600"
//                     >
//                       <ChevronDown
//                         size={16}
//                         className={`transition-transform duration-150 ${
//                           isCustomerDropdownOpen ? "rotate-180" : ""
//                         }`}
//                       />
//                     </button>
//                   )}
//                 </div>
//               </div>

//               {/* Suggestions Dropdown */}
//               {isCustomerDropdownOpen && (
//                 <div className="absolute left-0 top-[calc(100%+6px)] z-50 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-100">
//                   <div className="max-h-52 overflow-y-auto divide-y divide-slate-50 py-1">
//                     {filteredModalCustomers.length > 0 ? (
//                       filteredModalCustomers.map((cust, index) => {
//                         const isSelected = cust.id === txnCustomerId;
//                         const isHighlighted = index === highlightedIndex;
//                         return (
//                           <button
//                             key={cust.id}
//                             type="button"
//                             onMouseEnter={() => setHighlightedIndex(index)}
//                             onClick={() => selectCustomer(cust)}
//                             className={`flex w-full items-center justify-between px-3.5 py-2.5 text-left text-sm transition-colors ${
//                               isHighlighted
//                                 ? "bg-slate-100"
//                                 : isSelected
//                                 ? "bg-ledger-brass/10 font-semibold text-ledger-brass-dark"
//                                 : "text-slate-700 hover:bg-slate-50"
//                             }`}
//                           >
//                             <span className="truncate">{cust.name}</span>
//                             {isSelected && (
//                               <Check
//                                 size={15}
//                                 className="shrink-0 text-ledger-brass-dark"
//                               />
//                             )}
//                           </button>
//                         );
//                       })
//                     ) : (
//                       <div className="px-3 py-4 text-center text-xs font-medium text-slate-400">
//                         No customers found
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Transaction Type Dropdown (LENE / DENE) */}
//           <div className="space-y-1.5">
//             <label className="block text-sm font-semibold text-slate-700">
//               Type
//             </label>
//             <div className="relative rounded-xl border border-slate-200 bg-white shadow-2xs transition-all focus-within:border-ledger-brass focus-within:ring-2 focus-within:ring-ledger-brass/15">
//               <select
//                 required
//                 disabled={isSubmittingTxn}
//                 value={txnType}
//                 onChange={(e) =>
//                   setTxnType(e.target.value as "" | "LENE" | "DENE")
//                 }
//                 className="w-full cursor-pointer appearance-none rounded-xl bg-transparent px-3.5 py-3 text-sm font-medium text-slate-700 outline-none disabled:opacity-50"
//               >
//                 <option value="" disabled>
//                   Select Type
//                 </option>
//                 <option value="LENE">LENE (You&apos;ll Get)</option>
//                 <option value="DENE">DENE (You&apos;ll Give)</option>
//               </select>
//               <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">
//                 ▼
//               </div>
//             </div>
//           </div>

//           {/* Amount Input */}
//           <div className="space-y-1">
//             <label className="block text-sm font-semibold text-slate-700">
//               Amount
//             </label>
//             <div className="relative flex items-center rounded-xl border border-slate-200 bg-white px-3.5 py-3 shadow-2xs transition-all focus-within:border-ledger-brass focus-within:ring-2 focus-within:ring-ledger-brass/15">
//               <IndianRupee size={15} className="mr-2 shrink-0 text-slate-400" />
//               <input
//                 type="number"
//                 step="any"
//                 required
//                 disabled={isSubmittingTxn}
//                 value={txnAmount}
//                 onChange={(e) => {
//                   if (e.target.value.length <= 9) {
//                     setTxnAmount(e.target.value);
//                   }
//                 }}
//                 placeholder="Enter Amount"
//                 className="w-full bg-transparent text-sm font-semibold text-slate-700 outline-none placeholder:font-bold placeholder:text-slate-400 disabled:opacity-50"
//               />
//             </div>
//             <div className="text-right text-[11px] font-medium text-slate-400">
//               {txnAmount.length}/9
//             </div>
//           </div>

//           {/* Details Input */}
//           <div className="space-y-1">
//             <label className="block text-sm font-semibold text-slate-700">
//               Details
//             </label>
//             <div className="relative rounded-xl border border-slate-200 bg-white px-3.5 py-3 shadow-2xs transition-all focus-within:border-ledger-brass focus-within:ring-2 focus-within:ring-ledger-brass/15">
//               <input
//                 type="text"
//                 maxLength={100}
//                 disabled={isSubmittingTxn}
//                 value={txnDescription}
//                 onChange={(e) => setTxnDescription(e.target.value)}
//                 placeholder="Enter Details (e.g. Cash received)"
//                 className="w-full bg-transparent text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400 disabled:opacity-50"
//               />
//             </div>
//             <div className="text-right text-[11px] font-medium text-slate-400">
//               {txnDescription.length}/100
//             </div>
//           </div>

//           {/* Pay Button */}
//           <Button
//             type="submit"
//             loading={isSubmittingTxn}
//             loadingText="Processing..."
//           >
//             Pay
//           </Button>
//         </form>
//       </Modal>
//     </div>
//   );
// }


import { useState, useEffect, useRef, type FormEvent, type KeyboardEvent } from "react";
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
  ChevronDown,
  Check,
  X,
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
  type: "give" | "get"; // 'give' -> Red (Lene higher/only), 'get' -> Green (Dene higher/only)
  rawBalance: number;
}

type FilterOption =
  | "ALL"
  | "NAME_AZ"
  | "NAME_ZA"
  | "BAL_HIGH_LOW"
  | "BAL_LOW_HIGH";

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
  const { selectedKhataId, isLoadingKhatas } = useKhata();

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

  // "Add Single" Transaction Popup State
  const [isAddTxnModalOpen, setIsAddTxnModalOpen] = useState(false);
  const [isSubmittingTxn, setIsSubmittingTxn] = useState(false);
  const [txnCustomerId, setTxnCustomerId] = useState("");
  const [txnCustomerSearch, setTxnCustomerSearch] = useState("");
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [shouldFocusCustomerInput, setShouldFocusCustomerInput] = useState(false);
  const customerDropdownRef = useRef<HTMLDivElement>(null);
  const customerInputRef = useRef<HTMLInputElement>(null);

  const [txnType, setTxnType] = useState<"" | "LENE" | "DENE">("");
  const [txnAmount, setTxnAmount] = useState("");
  const [txnDescription, setTxnDescription] = useState("");

  // Calculated totals state from Khata Stats API
  const [totalLene, setTotalLene] = useState<number>(0);
  const [totalDene, setTotalDene] = useState<number>(0);
  const [netBalance, setNetBalance] = useState<number>(0);

  // Universal cross-browser focus execution using requestAnimationFrame
  useEffect(() => {
    if (isAddTxnModalOpen && shouldFocusCustomerInput && !isSubmittingTxn) {
      let rafId1: number;
      let rafId2: number;
      let fallbackTimer: ReturnType<typeof setTimeout>;

      const triggerFocus = () => {
        if (customerInputRef.current) {
          customerInputRef.current.focus({ preventScroll: true });
        }
      };

      // Double rAF ensures browser layout, paint, and modal animation locks are resolved
      rafId1 = requestAnimationFrame(() => {
        rafId2 = requestAnimationFrame(() => {
          triggerFocus();
          setShouldFocusCustomerInput(false);
        });
      });

      // Extra fallback for slower systems/devices with delayed modal transitions
      fallbackTimer = setTimeout(() => {
        triggerFocus();
      }, 150);

      return () => {
        cancelAnimationFrame(rafId1);
        cancelAnimationFrame(rafId2);
        clearTimeout(fallbackTimer);
      };
    }
  }, [isAddTxnModalOpen, shouldFocusCustomerInput, isSubmittingTxn]);

  // Open Add Customer modal if routed from header shortcut
  useEffect(() => {
    const state = location.state as { openAddCustomer?: boolean } | null;
    if (state?.openAddCustomer) {
      setIsAddModalOpen(true);
      navigate(location.pathname, { replace: true, state: null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Close filter dropdown and customer select dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target as Node)
      ) {
        setIsFilterOpen(false);
      }
      if (
        customerDropdownRef.current &&
        !customerDropdownRef.current.contains(event.target as Node)
      ) {
        setIsCustomerDropdownOpen(false);
        setHighlightedIndex(-1);
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

    if (lene > dene) {
      type = "give"; // Red
    } else if (dene > lene) {
      type = "get"; // Green
    } else {
      type = balance >= 0 ? "give" : "get";
    }

    const displayAmount =
      balance !== 0 ? Math.abs(balance) : Math.max(lene, dene);
    const formattedAmount = displayAmount.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

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
      if (!isLoadingKhatas) {
        toast.error("No Khata selected. Please select a Khata first.");
        setIsFetching(false);
      }
      return;
    }

    setIsFetching(true);

    try {
      const [customersData, statsData] = await Promise.all([
        customerService.listByKhata(selectedKhataId),
        khataService.stats(selectedKhataId),
      ]);

      if (customersData.success && Array.isArray(customersData.data)) {
        setCustomers(customersData.data.map(mapCustomerData));
      } else {
        toast.error(customersData.message || "Failed to load customers.");
      }

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedKhataId, isLoadingKhatas]);

  // Filter and Sort Customers for list
  const filteredCustomers = customers
    .filter((customer) =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()),
    )
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

  // Filter Customers inside the Modal dropdown
  const filteredModalCustomers = customers.filter((cust) =>
    cust.name.toLowerCase().includes(txnCustomerSearch.toLowerCase()),
  );

  // Keep first customer highlighted reliably across OS / input methods
  useEffect(() => {
    if (isCustomerDropdownOpen && filteredModalCustomers.length > 0) {
      setHighlightedIndex((prev) => (prev >= 0 && prev < filteredModalCustomers.length ? prev : 0));
    } else {
      setHighlightedIndex(-1);
    }
  }, [isCustomerDropdownOpen, txnCustomerSearch, filteredModalCustomers.length]);

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

        fetchDashboardData();

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
    setTxnCustomerSearch("");
    setIsCustomerDropdownOpen(false);
    setHighlightedIndex(-1);
    setTxnType("");
    setTxnAmount("");
    setTxnDescription("");
  };

  const selectCustomer = (cust: Customer) => {
    setTxnCustomerId(cust.id);
    setTxnCustomerSearch(cust.name);
    setIsCustomerDropdownOpen(false);
    setHighlightedIndex(-1);
  };

  // Keyboard navigation for customer selection
  const handleCustomerKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (isSubmittingTxn || isFetching) return;

    if (!isCustomerDropdownOpen && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setIsCustomerDropdownOpen(true);
      setHighlightedIndex(0);
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < filteredModalCustomers.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredModalCustomers.length - 1
      );
    } else if (e.key === "Enter") {
      if (isCustomerDropdownOpen && filteredModalCustomers.length > 0) {
        e.preventDefault();
        const targetIndex = highlightedIndex >= 0 ? highlightedIndex : 0;
        const targetCustomer = filteredModalCustomers[targetIndex];
        if (targetCustomer) {
          selectCustomer(targetCustomer);
        }
      }
    } else if (e.key === "Escape") {
      setIsCustomerDropdownOpen(false);
      setHighlightedIndex(-1);
    }
  };

  // POST API: Add Single Transaction
  const handleAddTransactionSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!txnCustomerId) {
      toast.error("Please select a customer.");
      customerInputRef.current?.focus({ preventScroll: true });
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
        setShouldFocusCustomerInput(true);
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

  // Determine dynamic net balance text color based on which side is higher
  const netAmountColor =
    totalLene > totalDene
      ? "text-ledger-red"
      : totalDene > totalLene
      ? "text-ledger-green"
      : "text-ledger-ink";

  return (
    <div className="w-full min-h-full bg-ledger-bg font-sans text-ledger-ink">
      <div className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-6 sm:py-6">
        {/* PAGE HEADING */}
        <div className="mb-5 flex flex-col gap-1 sm:mb-6">
          <h1 className="font-serif text-xl font-semibold tracking-tight text-ledger-ink sm:text-2xl">
            Dashboard
          </h1>
          <p className="text-xs font-medium text-ledger-subtle sm:text-sm">
            A quick overview of your ledger and customer balances.
          </p>
        </div>

        {/* STAT CARDS */}
        <div className="mb-6 grid w-full grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
          {/* NET BALANCE CARD - WHITE BACKGROUND & DYNAMIC COLOR */}
          <div className="w-full rounded-2xl border border-ledger-border bg-ledger-paper p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-semibold text-ledger-muted">
                Net balance
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-ledger-brass-light/20 text-ledger-brass-dark">
                <Wallet size={17} />
              </div>
            </div>
            <div className={`mt-3 font-serif text-2xl font-semibold tabular-nums sm:text-3xl ${netAmountColor}`}>
              ₹ {netBalance.toLocaleString("en-IN")}
            </div>
            <div className="mt-1 text-[11px] font-medium text-ledger-faint">
              Across all khatas &amp; customers
            </div>
          </div>

          {/* DENE CARD - GREEN */}
          <div className="w-full rounded-2xl border border-ledger-border bg-ledger-paper p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-semibold text-ledger-muted">
                Dene (You'll Give)
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-ledger-green/10 text-ledger-green">
                <TrendingDown size={17} />
              </div>
            </div>
            <div className="mt-3 font-serif text-2xl font-semibold tabular-nums text-ledger-green sm:text-3xl">
              ₹ {totalDene.toLocaleString("en-IN")}
            </div>
            <div className="mt-1 text-[11px] font-medium text-ledger-faint">
              Owed to your customers
            </div>
          </div>

          {/* LENE CARD - RED */}
          <div className="w-full rounded-2xl border border-ledger-border bg-ledger-paper p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-semibold text-ledger-muted">
                Lene (You'll Get)
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-ledger-red/10 text-ledger-red">
                <TrendingUp size={17} />
              </div>
            </div>
            <div className="mt-3 font-serif text-2xl font-semibold tabular-nums text-ledger-red sm:text-3xl">
              ₹ {totalLene.toLocaleString("en-IN")}
            </div>
            <div className="mt-1 text-[11px] font-medium text-ledger-faint">
              Owed by your customers
            </div>
          </div>
        </div>

        {/* SEARCH AND ACTION BAR */}
        <div className="mb-4 flex w-full items-center gap-2 sm:gap-3">
          <div className="relative min-w-0 flex-1">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ledger-placeholder"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search customer"
              className="w-full rounded-xl border border-ledger-border bg-ledger-paper py-2.5 pl-10 pr-4 text-sm font-medium text-ledger-ink shadow-sm outline-none transition-all placeholder:text-ledger-placeholder focus:border-ledger-brass focus:ring-2 focus:ring-ledger-brass/15"
            />
          </div>

          <div className="relative shrink-0" ref={filterRef}>
            <button
              type="button"
              aria-label="Filter"
              onClick={() => setIsFilterOpen((prev) => !prev)}
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border shadow-sm transition-all active:scale-95 ${
                isFilterOpen || selectedFilter !== "ALL"
                  ? "border-ledger-brass bg-ledger-brass/10 text-ledger-brass-dark"
                  : "border-ledger-border bg-ledger-paper text-ledger-muted hover:bg-ledger-hover"
              }`}
            >
              <Filter size={18} />
            </button>

            {isFilterOpen && (
              <div className="absolute right-0 top-12 z-30 w-52 overflow-hidden rounded-2xl border border-ledger-border bg-ledger-paper py-2 shadow-xl ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-100">
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
                        ? "bg-ledger-hover font-semibold text-ledger-ink"
                        : "font-medium text-ledger-muted hover:bg-ledger-hover hover:text-ledger-ink"
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
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-ledger-border bg-ledger-paper text-ledger-muted shadow-sm transition-all hover:bg-ledger-hover active:scale-95"
          >
            <FileText size={18} />
          </button>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="hidden shrink-0 items-center gap-1.5 rounded-xl bg-ledger-brass px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-ledger-brass-dark active:scale-95 sm:flex"
          >
            <Plus size={17} className="stroke-[2.5]" />
            <span>Add Customer</span>
          </button>
        </div>

        {/* CUSTOMER LIST SECTION */}
        <div className="w-full rounded-2xl border border-ledger-border bg-ledger-paper shadow-sm">
          <div className="flex items-center justify-between border-b border-ledger-border-soft px-4 py-3.5 sm:px-5">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-ledger-brass-dark" />
              <h2 className="text-sm font-semibold text-ledger-ink sm:text-base">
                Customers
              </h2>
            </div>
            <span className="text-xs font-semibold text-ledger-faint">
              {filteredCustomers.length} total
            </span>
          </div>

          <div className="divide-y divide-ledger-border-soft">
            {isFetching ? (
              <div className="flex items-center justify-center gap-2 py-10 text-sm text-ledger-faint">
                <Spinner size={18} className="text-ledger-brass-dark" />
                <span>Loading customers...</span>
              </div>
            ) : filteredCustomers.length > 0 ? (
              filteredCustomers.map((customer) => (
                <button
                  key={customer.id}
                  type="button"
                  onClick={() => handleCustomerClick(customer.id)}
                  className="group flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors hover:bg-ledger-hover/70 sm:px-5"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold ring-1 ${
                        customer.type === "get"
                          ? "bg-ledger-green/10 text-ledger-green ring-ledger-green/20"
                          : "bg-ledger-red/10 text-ledger-red ring-ledger-red/20"
                      }`}
                    >
                      {initials(customer.name)}
                    </div>
                    <span className="truncate text-sm font-semibold text-ledger-ink transition-colors group-hover:text-ledger-brass-dark sm:text-base">
                      {customer.name}
                    </span>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <span
                      className={`font-serif text-sm font-semibold tabular-nums sm:text-base ${
                        customer.type === "get"
                          ? "text-ledger-green"
                          : "text-ledger-red"
                      }`}
                    >
                      ₹ {customer.amount}
                    </span>
                  </div>
                </button>
              ))
            ) : (
              <div className="p-8 text-center text-sm font-medium text-ledger-faint">
                {searchQuery.trim() ? (
                  <>No customers found matching &quot;{searchQuery}&quot;</>
                ) : (
                  <>No customers found</>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating add-customer trigger for small screens */}
      <button
        type="button"
        onClick={() => setIsAddModalOpen(true)}
        aria-label="Add Customer"
        className="fixed bottom-5 right-5 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-ledger-brass text-white shadow-lg transition-all hover:bg-ledger-brass-dark active:scale-95 sm:hidden"
      >
        <Plus size={24} className="stroke-[2.5]" />
      </button>

      {/* Floating add-transaction trigger */}
      <button
        type="button"
        onClick={() => {
          setIsAddTxnModalOpen(true);
          setShouldFocusCustomerInput(true);
        }}
        aria-label="Add Transaction"
        className="fixed bottom-24 right-5 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-ledger-ink text-white shadow-lg transition-all hover:bg-ledger-ink-dark active:scale-95 sm:right-6"
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
        <form
          onSubmit={handleAddCustomerSubmit}
          className="flex flex-col gap-4 p-5 sm:p-6"
        >
          <div className="space-y-1">
            <div className="relative rounded-xl border border-slate-200 bg-white px-3.5 py-3 transition-all focus-within:border-ledger-brass focus-within:ring-2 focus-within:ring-ledger-brass/15">
              <input
                type="text"
                maxLength={36}
                required
                disabled={isSubmitting}
                value={newCustomerName}
                onChange={(e) => setNewCustomerName(e.target.value)}
                placeholder="Customer Name"
                className="w-full bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400 disabled:opacity-50"
              />
            </div>
            <div className="text-right text-[11px] text-slate-400">
              {newCustomerName.length}/36
            </div>
          </div>

          <div>
            <div className="flex items-center rounded-xl border border-slate-200 bg-white px-3.5 py-3 transition-all focus-within:border-ledger-brass focus-within:ring-2 focus-within:ring-ledger-brass/15">
              <div className="mr-3 flex shrink-0 items-center gap-1.5 whitespace-nowrap border-r border-slate-200 pr-3 text-xs font-bold text-slate-700">
                <span className="text-base leading-none">🇮🇳</span>
                <span>+91</span>
                <span className="text-[10px] text-slate-400">▼</span>
              </div>
              <input
                type="tel"
                disabled={isSubmitting}
                value={newContactNo}
                onChange={(e) => setNewContactNo(e.target.value)}
                placeholder="Contact No"
                className="w-full bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400 disabled:opacity-50"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="relative rounded-xl border border-slate-200 bg-white px-3.5 py-3 transition-all focus-within:border-ledger-brass focus-within:ring-2 focus-within:ring-ledger-brass/15">
              <input
                type="text"
                maxLength={36}
                disabled={isSubmitting}
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                placeholder="Address"
                className="w-full bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400 disabled:opacity-50"
              />
            </div>
            <div className="text-right text-[11px] text-slate-400">
              {newAddress.length}/36
            </div>
          </div>

          <Button
            type="submit"
            loading={isSubmitting}
            loadingText="Adding Customer..."
          >
            Continue
          </Button>
        </form>
      </Modal>

      {/* ADD SINGLE TRANSACTION POPUP MODAL */}
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
        <form
          onSubmit={handleAddTransactionSubmit}
          className="flex flex-col gap-4 p-5 sm:p-6"
        >
          {/* Customer Searchable Direct Input with Dropdown */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-700">
              Customer
            </label>
            <div className="relative" ref={customerDropdownRef}>
              <div className="relative flex items-center rounded-xl border border-slate-200 bg-white shadow-2xs transition-all focus-within:border-ledger-brass focus-within:ring-2 focus-within:ring-ledger-brass/15">
                <Search size={16} className="ml-3.5 shrink-0 text-slate-400" />
                <input
                  ref={customerInputRef}
                  type="text"
                  disabled={isSubmittingTxn || isFetching}
                  value={txnCustomerSearch}
                  onFocus={() => {
                    setIsCustomerDropdownOpen(true);
                    setHighlightedIndex(0);
                  }}
                  onChange={(e) => {
                    setTxnCustomerSearch(e.target.value);
                    setTxnCustomerId("");
                    setIsCustomerDropdownOpen(true);
                    setHighlightedIndex(0);
                  }}
                  onKeyDown={handleCustomerKeyDown}
                  placeholder={
                    isFetching ? "Loading customers..." : "Search & Select Customer..."
                  }
                  className="w-full bg-transparent px-3 py-3 text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400 disabled:opacity-50"
                />

                <div className="mr-3 flex shrink-0 items-center gap-1.5">
                  {txnCustomerSearch && !isSubmittingTxn && (
                    <button
                      type="button"
                      aria-label="Clear customer selection"
                      onClick={() => {
                        setTxnCustomerSearch("");
                        setTxnCustomerId("");
                        setIsCustomerDropdownOpen(true);
                        setHighlightedIndex(0);
                        customerInputRef.current?.focus({ preventScroll: true });
                      }}
                      className="rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                    >
                      <X size={14} />
                    </button>
                  )}

                  {isFetching ? (
                    <Loader2 size={15} className="animate-spin text-slate-400" />
                  ) : (
                    <button
                      type="button"
                      aria-label="Toggle customer list"
                      tabIndex={-1}
                      onClick={() => {
                        setIsCustomerDropdownOpen((prev) => {
                          const next = !prev;
                          if (next) setHighlightedIndex(0);
                          return next;
                        });
                        customerInputRef.current?.focus({ preventScroll: true });
                      }}
                      className="rounded p-0.5 text-slate-400 hover:text-slate-600"
                    >
                      <ChevronDown
                        size={16}
                        className={`transition-transform duration-150 ${
                          isCustomerDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  )}
                </div>
              </div>

              {/* Suggestions Dropdown */}
              {isCustomerDropdownOpen && (
                <div className="absolute left-0 top-[calc(100%+6px)] z-50 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-100">
                  <div className="max-h-52 overflow-y-auto divide-y divide-slate-50 py-1">
                    {filteredModalCustomers.length > 0 ? (
                      filteredModalCustomers.map((cust, index) => {
                        const isSelected = cust.id === txnCustomerId;
                        const isHighlighted = index === highlightedIndex;
                        return (
                          <button
                            key={cust.id}
                            type="button"
                            onMouseMove={() => setHighlightedIndex(index)}
                            onClick={() => selectCustomer(cust)}
                            className={`flex w-full items-center justify-between px-3.5 py-2.5 text-left text-sm transition-colors ${
                              isHighlighted
                                ? "bg-slate-100"
                                : isSelected
                                ? "bg-ledger-brass/10 font-semibold text-ledger-brass-dark"
                                : "text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            <span className="truncate">{cust.name}</span>
                            {isSelected && (
                              <Check
                                size={15}
                                className="shrink-0 text-ledger-brass-dark"
                              />
                            )}
                          </button>
                        );
                      })
                    ) : (
                      <div className="px-3 py-4 text-center text-xs font-medium text-slate-400">
                        No customers found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Transaction Type Dropdown (LENE / DENE) */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-700">
              Type
            </label>
            <div className="relative rounded-xl border border-slate-200 bg-white shadow-2xs transition-all focus-within:border-ledger-brass focus-within:ring-2 focus-within:ring-ledger-brass/15">
              <select
                required
                disabled={isSubmittingTxn}
                value={txnType}
                onChange={(e) =>
                  setTxnType(e.target.value as "" | "LENE" | "DENE")
                }
                className="w-full cursor-pointer appearance-none rounded-xl bg-transparent px-3.5 py-3 text-sm font-medium text-slate-700 outline-none disabled:opacity-50"
              >
                <option value="" disabled>
                  Select Type
                </option>
                <option value="LENE">LENE (You&apos;ll Get)</option>
                <option value="DENE">DENE (You&apos;ll Give)</option>
              </select>
              <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                ▼
              </div>
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-1">
            <label className="block text-sm font-semibold text-slate-700">
              Amount
            </label>
            <div className="relative flex items-center rounded-xl border border-slate-200 bg-white px-3.5 py-3 shadow-2xs transition-all focus-within:border-ledger-brass focus-within:ring-2 focus-within:ring-ledger-brass/15">
              <IndianRupee size={15} className="mr-2 shrink-0 text-slate-400" />
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
                className="w-full bg-transparent text-sm font-semibold text-slate-700 outline-none placeholder:font-bold placeholder:text-slate-400 disabled:opacity-50"
              />
            </div>
            <div className="text-right text-[11px] font-medium text-slate-400">
              {txnAmount.length}/9
            </div>
          </div>

          {/* Details Input */}
          <div className="space-y-1">
            <label className="block text-sm font-semibold text-slate-700">
              Details
            </label>
            <div className="relative rounded-xl border border-slate-200 bg-white px-3.5 py-3 shadow-2xs transition-all focus-within:border-ledger-brass focus-within:ring-2 focus-within:ring-ledger-brass/15">
              <input
                type="text"
                maxLength={100}
                disabled={isSubmittingTxn}
                value={txnDescription}
                onChange={(e) => setTxnDescription(e.target.value)}
                placeholder="Enter Details (e.g. Cash received)"
                className="w-full bg-transparent text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400 disabled:opacity-50"
              />
            </div>
            <div className="text-right text-[11px] font-medium text-slate-400">
              {txnDescription.length}/100
            </div>
          </div>

          {/* Pay Button */}
          <Button
            type="submit"
            loading={isSubmittingTxn}
            loadingText="Processing..."
          >
            Pay
          </Button>
        </form>
      </Modal>
    </div>
  );
}