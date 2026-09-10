// import { useState, useEffect } from "react";
// import {
//   Plus,
//   Search,
//   Filter,
//   FileText,
//   ChevronRight,
//   ArrowLeft,
//   Wallet,
//   TrendingDown,
//   TrendingUp,
//   Users,
//   Loader2,
// } from "lucide-react";
// import { toast } from "react-toastify";

// interface CustomerApiData {
//   khata_customer_id: string;
//   khata_id: string;
//   customer_id: string;
//   customer_name: string;
//   mobile_number: string;
//   address: string;
//   is_active: boolean;
//   total_lene: string;
//   total_dene: string;
//   net_balance: string;
//   last_activity_date: string | null;
//   created_at: string;
// }

// interface Customer {
//   id: string;
//   name: string;
//   amount: string;
//   type: "give" | "get"; // 'give' -> Dene (Red), 'get' -> Lene (Green)
//   rawBalance: number;
// }

// interface KhataStats {
//   khata_id: string;
//   user_id: string;
//   khata_name: string;
//   total_customers: string;
//   total_you_will_get: number;
//   total_you_will_give: number;
//   net_balance: number;
//   net_status: string;
// }

// function initials(name: string) {
//   return name
//     .split(" ")
//     .map((w) => w[0])
//     .join("")
//     .slice(0, 2)
//     .toUpperCase();
// }

// export default function Dashboard() {
//   const [customers, setCustomers] = useState<Customer[]>([]);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [isAddModalOpen, setIsAddModalOpen] = useState(false);
//   const [isFetching, setIsFetching] = useState(true);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   // New Customer Form State
//   const [newCustomerName, setNewCustomerName] = useState("");
//   const [newContactNo, setNewContactNo] = useState("");
//   const [newAddress, setNewAddress] = useState("");

//   // Calculated totals state from Khata Stats API
//   const [totalLene, setTotalLene] = useState<number>(0);
//   const [totalDene, setTotalDene] = useState<number>(0);
//   const [netBalance, setNetBalance] = useState<number>(0);

//   // Helper to retrieve auth header
//   const getAuthHeaders = () => {
//     const token = localStorage.getItem("token");
//     return {
//       "Content-Type": "application/json",
//       ...(token ? { Authorization: `Bearer ${token}` } : {}),
//     };
//   };

//   // Helper to retrieve selected Khata ID directly from localStorage
//   const getKhataId = () => {
//     return localStorage.getItem("khataId");
//   };

//   // Helper to map API record to UI model
//   const mapCustomerData = (item: CustomerApiData): Customer => {
//     const lene = parseFloat(item.total_lene || "0");
//     const dene = parseFloat(item.total_dene || "0");
//     const balance = parseFloat(item.net_balance || "0");

//     let type: "give" | "get" = "give";
//     let formattedAmount = "0";

//     if (balance > 0) {
//       type = "get";
//       formattedAmount = balance.toLocaleString("en-IN");
//     } else if (balance < 0) {
//       type = "give";
//       formattedAmount = Math.abs(balance).toLocaleString("en-IN");
//     } else {
//       if (lene >= dene) {
//         type = "get";
//         formattedAmount = lene.toLocaleString("en-IN");
//       } else {
//         type = "give";
//         formattedAmount = dene.toLocaleString("en-IN");
//       }
//     }

//     return {
//       id: item.khata_customer_id,
//       name: item.customer_name,
//       amount: formattedAmount,
//       type: type,
//       rawBalance: balance,
//     };
//   };

//   // GET API: Fetch customer list & stats in parallel
//   const fetchDashboardData = async () => {
//     const khataId = getKhataId();
//     if (!khataId) {
//       toast.error("No Khata selected. Please select a Khata first.");
//       setIsFetching(false);
//       return;
//     }

//     setIsFetching(true);

//     try {
//       const headers = getAuthHeaders();

//       const [customersRes, statsRes] = await Promise.all([
//         fetch(`http://192.168.0.158:5000/api/parties/khata/${khataId}`, {
//           method: "GET",
//           headers,
//         }),
//         fetch(`http://192.168.0.158:5000/api/khatas/${khataId}/stats`, {
//           method: "GET",
//           headers,
//         }),
//       ]);

//       const customersData = await customersRes.json();
//       const statsData = await statsRes.json();

//       // Handle Customers List
//       if (customersRes.ok && customersData.success && Array.isArray(customersData.data)) {
//         const mapped: Customer[] = customersData.data.map((item: CustomerApiData) =>
//           mapCustomerData(item)
//         );
//         setCustomers(mapped);
//       } else {
//         toast.error(customersData.message || "Failed to load customers.");
//       }

//       // Handle Khata Stats Card Data
//       if (statsRes.ok && statsData.success && statsData.data) {
//         const stats: KhataStats = statsData.data;
//         setTotalLene(Number(stats.total_you_will_get || 0));
//         setTotalDene(Number(stats.total_you_will_give || 0));
//         setNetBalance(Number(stats.net_balance || 0));
//       } else {
//         toast.error(statsData.message || "Failed to load khata statistics.");
//       }
//     } catch (error) {
//       console.error("Fetch Dashboard Data Error:", error);
//       toast.error("Unable to connect to the server.");
//     } finally {
//       setIsFetching(false);
//     }
//   };

//   useEffect(() => {
//     fetchDashboardData();
//   }, []);

//   const filteredCustomers = customers.filter((customer) =>
//     customer.name.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   // POST API: Add New Customer
//   const handleAddCustomerSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!newCustomerName.trim()) {
//       toast.error("Please enter a customer name.");
//       return;
//     }

//     const khataId = getKhataId();
//     if (!khataId) {
//       toast.error("No active Khata ID found. Please select a Khata first.");
//       return;
//     }

//     setIsSubmitting(true);

//     try {
//       const response = await fetch(
//         `http://192.168.0.158:5000/api/parties/khata/${khataId}`,
//         {
//           method: "POST",
//           headers: getAuthHeaders(),
//           body: JSON.stringify({
//             customer_name: newCustomerName.trim(),
//             mobile_number: newContactNo.trim(),
//             address: newAddress.trim(),
//           }),
//         }
//       );

//       const data = await response.json();

//       if (response.ok && data.success && data.data) {
//         toast.success(data.message || "Customer added successfully!");

//         const newCustomer = mapCustomerData(data.data);
//         setCustomers((prev) => [newCustomer, ...prev]);

//         // Refresh stats after adding a new customer
//         fetchDashboardData();

//         // Reset and close modal
//         setNewCustomerName("");
//         setNewContactNo("");
//         setNewAddress("");
//         setIsAddModalOpen(false);
//       } else {
//         toast.error(data.message || "Failed to add customer.");
//       }
//     } catch (error) {
//       console.error("Add Customer Error:", error);
//       toast.error("Unable to connect to the server.");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="w-full font-sans text-ink-900">
//       {/* PAGE HEADING */}
//       <div className="mb-5 flex flex-col gap-1 sm:mb-6">
//         <h1 className="text-xl font-extrabold tracking-tight text-ink-900 sm:text-2xl">
//           Dashboard
//         </h1>
//         <p className="text-xs font-medium text-ink-500 sm:text-sm">
//           A quick overview of your ledger and customer balances.
//         </p>
//       </div>

//       {/* STAT CARDS */}
//       <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
//         {/* Net Balance */}
//         <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-700 via-brand-600 to-violet-700 p-5 text-white shadow-lift">
//           <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10 blur-2xl" />
//           <div className="relative z-10 flex items-center justify-between">
//             <span className="text-xs font-semibold uppercase tracking-wider text-white/70">
//               Net Balance
//             </span>
//             <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
//               <Wallet size={17} />
//             </div>
//           </div>
//           <div className="relative z-10 mt-3 text-2xl font-black tracking-tight sm:text-3xl">
//             ₹ {netBalance.toLocaleString("en-IN")}
//           </div>
//           <div className="relative z-10 mt-1 text-[11px] font-medium text-white/70">
//             Across all khatas &amp; customers
//           </div>
//         </div>

//         {/* You'll Give */}
//         <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
//           <div className="flex items-center justify-between">
//             <span className="text-xs font-semibold uppercase tracking-wider text-ink-500">
//               Dene (You'll Give)
//             </span>
//             <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-debit-500/10 text-debit-600">
//               <TrendingDown size={17} />
//             </div>
//           </div>
//           <div className="mt-3 text-2xl font-extrabold tracking-tight text-debit-600 sm:text-3xl">
//             ₹ {totalDene.toLocaleString("en-IN")}
//           </div>
//           <div className="mt-1 text-[11px] font-medium text-ink-500">Owed to your customers</div>
//         </div>

//         {/* You'll Get */}
//         <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
//           <div className="flex items-center justify-between">
//             <span className="text-xs font-semibold uppercase tracking-wider text-ink-500">
//               Lene (You'll Get)
//             </span>
//             <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-credit-500/10 text-credit-600">
//               <TrendingUp size={17} />
//             </div>
//           </div>
//           <div className="mt-3 text-2xl font-extrabold tracking-tight text-credit-600 sm:text-3xl">
//             ₹ {totalLene.toLocaleString("en-IN")}
//           </div>
//           <div className="mt-1 text-[11px] font-medium text-ink-500">Owed by your customers</div>
//         </div>
//       </div>

//       {/* SEARCH AND ACTION BAR */}
//       <div className="mb-4 flex items-center gap-2 sm:gap-3">
//         <div className="relative flex-1">
//           <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-300" />
//           <input
//             type="text"
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             placeholder="Search customer"
//             className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm font-medium text-ink-900 shadow-sm outline-none transition-all focus:border-brand-600 focus:ring-2 focus:ring-brand-600/15"
//           />
//         </div>

//         <button
//           type="button"
//           aria-label="Filter"
//           className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-brand-800 shadow-sm transition-all hover:bg-brand-50 active:scale-95"
//         >
//           <Filter size={18} />
//         </button>

//         <button
//           type="button"
//           aria-label="Download Report"
//           className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-brand-800 shadow-sm transition-all hover:bg-brand-50 active:scale-95"
//         >
//           <FileText size={18} />
//         </button>

//         <button
//           type="button"
//           onClick={() => setIsAddModalOpen(true)}
//           className="hidden shrink-0 items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-700 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-violet-600/25 transition-all hover:from-violet-600 hover:to-violet-500 active:scale-95 sm:flex"
//         >
//           <Plus size={17} className="stroke-[2.5]" />
//           <span>Add Customer</span>
//         </button>
//       </div>

//       {/* CUSTOMER LIST SECTION */}
//       <div className="rounded-2xl border border-slate-200 bg-white shadow-card">
//         <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5 sm:px-5">
//           <div className="flex items-center gap-2">
//             <Users size={16} className="text-brand-600" />
//             <h2 className="text-sm font-bold text-ink-900 sm:text-base">Customers</h2>
//           </div>
//           <span className="text-xs font-semibold text-ink-500">
//             {filteredCustomers.length} total
//           </span>
//         </div>

//         <div className="divide-y divide-slate-100">
//           {isFetching ? (
//             <div className="flex items-center justify-center py-10 text-slate-400 gap-2 text-sm">
//               <Loader2 size={18} className="animate-spin text-brand-600" />
//               <span>Loading customers...</span>
//             </div>
//           ) : filteredCustomers.length > 0 ? (
//             filteredCustomers.map((customer) => (
//               <div
//                 key={customer.id}
//                 className="group flex cursor-pointer items-center justify-between gap-3 px-4 py-3.5 transition-colors hover:bg-brand-50/40 sm:px-5"
//               >
//                 <div className="flex min-w-0 items-center gap-3">
//                   <div
//                     className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold ring-1 ${
//                       customer.type === "get"
//                         ? "bg-credit-500/10 text-credit-600 ring-credit-500/20"
//                         : "bg-debit-500/10 text-debit-600 ring-debit-500/20"
//                     }`}
//                   >
//                     {initials(customer.name)}
//                   </div>
//                   <span className="truncate text-sm font-bold text-ink-900 transition-colors group-hover:text-brand-700 sm:text-base">
//                     {customer.name}
//                   </span>
//                 </div>

//                 <div className="flex shrink-0 items-center gap-2">
//                   <span
//                     className={`text-sm font-extrabold sm:text-base ${
//                       customer.type === "get" ? "text-credit-600" : "text-debit-600"
//                     }`}
//                   >
//                     ₹ {customer.amount}
//                   </span>
//                   <ChevronRight
//                     size={16}
//                     className="text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-500"
//                   />
//                 </div>
//               </div>
//             ))
//           ) : (
//             <div className="p-8 text-center text-sm font-medium text-ink-500">
//               No customers found matching "{searchQuery}"
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Floating add-customer trigger for small screens */}
//       <button
//         type="button"
//         onClick={() => setIsAddModalOpen(true)}
//         aria-label="Add Customer"
//         className="fixed bottom-5 right-5 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-violet-700 to-violet-600 text-white shadow-lift transition-all active:scale-95 sm:hidden"
//       >
//         <Plus size={24} className="stroke-[2.5]" />
//       </button>

//       {/* NEW CUSTOMER POPUP MODAL */}
//       {isAddModalOpen && (
//         <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-xs p-0 sm:items-center sm:p-4">
//           <div className="flex h-full w-full max-w-md flex-col overflow-hidden border border-slate-200 bg-white shadow-2xl sm:h-auto sm:rounded-2xl">
//             {/* Modal Header */}
//             <div className="relative flex items-center justify-between bg-gradient-to-r from-brand-700 to-brand-600 px-4 py-3.5 text-white">
//               <button
//                 type="button"
//                 onClick={() => setIsAddModalOpen(false)}
//                 className="rounded-lg p-1 transition-colors hover:bg-white/20 active:scale-95"
//                 aria-label="Back"
//               >
//                 <ArrowLeft size={20} />
//               </button>
//               <h2 className="text-base font-bold tracking-wide">New Customer</h2>
//               <div className="w-6" />
//             </div>

//             {/* Modal Form Body */}
//             <form onSubmit={handleAddCustomerSubmit} className="flex flex-col gap-4 p-5 sm:p-6">
//               {/* Customer Name Input */}
//               <div className="space-y-1">
//                 <div className="relative rounded-xl border border-slate-200 bg-white px-3.5 py-3 transition-all focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-brand-600/15">
//                   <input
//                     type="text"
//                     maxLength={36}
//                     required
//                     disabled={isSubmitting}
//                     value={newCustomerName}
//                     onChange={(e) => setNewCustomerName(e.target.value)}
//                     placeholder="Customer Name"
//                     className="w-full bg-transparent text-sm font-medium text-ink-900 outline-none placeholder:text-ink-300 disabled:opacity-50"
//                   />
//                 </div>
//                 <div className="text-right text-[11px] text-ink-300">
//                   {newCustomerName.length}/36
//                 </div>
//               </div>

//               {/* Contact No Input with Country Code */}
//               <div>
//                 <div className="flex items-center rounded-xl border border-slate-200 bg-white px-3.5 py-3 transition-all focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-brand-600/15">
//                   <div className="mr-3 flex items-center gap-1.5 border-r border-slate-200 pr-3 text-xs font-bold text-ink-700">
//                     <span className="text-base leading-none">🇮🇳</span>
//                     <span>+91</span>
//                     <span className="text-[10px] text-ink-300">▼</span>
//                   </div>
//                   <input
//                     type="tel"
//                     disabled={isSubmitting}
//                     value={newContactNo}
//                     onChange={(e) => setNewContactNo(e.target.value)}
//                     placeholder="Contact No"
//                     className="w-full bg-transparent text-sm font-medium text-ink-900 outline-none placeholder:text-ink-300 disabled:opacity-50"
//                   />
//                 </div>
//               </div>

//               {/* Address Input */}
//               <div className="space-y-1">
//                 <div className="relative rounded-xl border border-slate-200 bg-white px-3.5 py-3 transition-all focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-brand-600/15">
//                   <input
//                     type="text"
//                     maxLength={36}
//                     disabled={isSubmitting}
//                     value={newAddress}
//                     onChange={(e) => setNewAddress(e.target.value)}
//                     placeholder="Address"
//                     className="w-full bg-transparent text-sm font-medium text-ink-900 outline-none placeholder:text-ink-300 disabled:opacity-50"
//                   />
//                 </div>
//                 <div className="text-right text-[11px] text-ink-300">{newAddress.length}/36</div>
//               </div>

//               {/* Continue Submit Button */}
//               <button
//                 type="submit"
//                 disabled={isSubmitting}
//                 className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-800 to-violet-600 py-3 text-sm font-bold text-white shadow-md transition-all hover:from-violet-700 hover:to-violet-500 active:scale-[0.99] disabled:opacity-50"
//               >
//                 {isSubmitting ? (
//                   <>
//                     <Loader2 size={16} className="animate-spin" />
//                     <span>Adding Customer...</span>
//                   </>
//                 ) : (
//                   <span>Continue</span>
//                 )}
//               </button>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Filter,
  FileText,
  ChevronRight,
  ArrowLeft,
  Wallet,
  TrendingDown,
  TrendingUp,
  Users,
  Loader2,
} from "lucide-react";
import { toast } from "react-toastify";

interface CustomerApiData {
  khata_customer_id: string;
  khata_id: string;
  customer_id: string;
  customer_name: string;
  mobile_number: string;
  address: string;
  is_active: boolean;
  total_lene: string;
  total_dene: string;
  net_balance: string;
  last_activity_date: string | null;
  created_at: string;
}

interface Customer {
  id: string;
  name: string;
  amount: string;
  type: "give" | "get"; // 'give' -> Dene (Red), 'get' -> Lene (Green)
  rawBalance: number;
}

interface KhataStats {
  khata_id: string;
  user_id: string;
  khata_name: string;
  total_customers: string;
  total_you_will_get: number;
  total_you_will_give: number;
  net_balance: number;
  net_status: string;
}

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
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Customer Form State
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newContactNo, setNewContactNo] = useState("");
  const [newAddress, setNewAddress] = useState("");

  // Calculated totals state from Khata Stats API
  const [totalLene, setTotalLene] = useState<number>(0);
  const [totalDene, setTotalDene] = useState<number>(0);
  const [netBalance, setNetBalance] = useState<number>(0);

  // Helper to retrieve auth header
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  // Helper to retrieve selected Khata ID directly from localStorage
  const getKhataId = () => {
    return localStorage.getItem("khataId");
  };

  // Helper to map API record to UI model
  const mapCustomerData = (item: CustomerApiData): Customer => {
    const lene = parseFloat(item.total_lene || "0");
    const dene = parseFloat(item.total_dene || "0");
    const balance = parseFloat(item.net_balance || "0");

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
      type: type,
      rawBalance: balance,
    };
  };

  // GET API: Fetch customer list & stats in parallel
  const fetchDashboardData = async () => {
    const khataId = getKhataId();
    if (!khataId) {
      toast.error("No Khata selected. Please select a Khata first.");
      setIsFetching(false);
      return;
    }

    setIsFetching(true);

    try {
      const headers = getAuthHeaders();

      const [customersRes, statsRes] = await Promise.all([
        fetch(`http://192.168.0.158:5000/api/parties/khata/${khataId}`, {
          method: "GET",
          headers,
        }),
        fetch(`http://192.168.0.158:5000/api/khatas/${khataId}/stats`, {
          method: "GET",
          headers,
        }),
      ]);

      const customersData = await customersRes.json();
      const statsData = await statsRes.json();

      // Handle Customers List
      if (customersRes.ok && customersData.success && Array.isArray(customersData.data)) {
        const mapped: Customer[] = customersData.data.map((item: CustomerApiData) =>
          mapCustomerData(item)
        );
        setCustomers(mapped);
      } else {
        toast.error(customersData.message || "Failed to load customers.");
      }

      // Handle Khata Stats Card Data
      if (statsRes.ok && statsData.success && statsData.data) {
        const stats: KhataStats = statsData.data;
        setTotalLene(Number(stats.total_you_will_get || 0));
        setTotalDene(Number(stats.total_you_will_give || 0));
        setNetBalance(Number(stats.net_balance || 0));
      } else {
        toast.error(statsData.message || "Failed to load khata statistics.");
      }
    } catch (error) {
      console.error("Fetch Dashboard Data Error:", error);
      toast.error("Unable to connect to the server.");
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Navigate to Customer Details page with khata_customer_id
  const handleCustomerClick = (khataCustomerId: string) => {
    navigate(`/customer-detail/${khataCustomerId}`);
  };

  // POST API: Add New Customer
  const handleAddCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newCustomerName.trim()) {
      toast.error("Please enter a customer name.");
      return;
    }

    const khataId = getKhataId();
    if (!khataId) {
      toast.error("No active Khata ID found. Please select a Khata first.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `http://192.168.0.158:5000/api/parties/khata/${khataId}`,
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            customer_name: newCustomerName.trim(),
            mobile_number: newContactNo.trim(),
            address: newAddress.trim(),
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success && data.data) {
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
      console.error("Add Customer Error:", error);
      toast.error("Unable to connect to the server.");
    } finally {
      setIsSubmitting(false);
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

        <button
          type="button"
          aria-label="Filter"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-brand-800 shadow-sm transition-all hover:bg-brand-50 active:scale-95"
        >
          <Filter size={18} />
        </button>

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
              <Loader2 size={18} className="animate-spin text-brand-600" />
              <span>Loading customers...</span>
            </div>
          ) : filteredCustomers.length > 0 ? (
            filteredCustomers.map((customer) => (
              <div
                key={customer.id}
                onClick={() => handleCustomerClick(customer.id)}
                className="group flex cursor-pointer items-center justify-between gap-3 px-4 py-3.5 transition-colors hover:bg-brand-50/40 sm:px-5"
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
                  <ChevronRight
                    size={16}
                    className="text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-500"
                  />
                </div>
              </div>
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

      {/* NEW CUSTOMER POPUP MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-xs p-0 sm:items-center sm:p-4">
          <div className="flex h-full w-full max-w-md flex-col overflow-hidden border border-slate-200 bg-white shadow-2xl sm:h-auto sm:rounded-2xl">
            {/* Modal Header */}
            <div className="relative flex items-center justify-between bg-gradient-to-r from-brand-700 to-brand-600 px-4 py-3.5 text-white">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-lg p-1 transition-colors hover:bg-white/20 active:scale-95"
                aria-label="Back"
              >
                <ArrowLeft size={20} />
              </button>
              <h2 className="text-base font-bold tracking-wide">New Customer</h2>
              <div className="w-6" />
            </div>

            {/* Modal Form Body */}
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
                <div className="text-right text-[11px] text-ink-300">
                  {newCustomerName.length}/36
                </div>
              </div>

              {/* Contact No Input with Country Code */}
              <div>
                <div className="flex items-center rounded-xl border border-slate-200 bg-white px-3.5 py-3 transition-all focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-brand-600/15">
                  <div className="mr-3 flex items-center gap-1.5 border-r border-slate-200 pr-3 text-xs font-bold text-ink-700">
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
              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-800 to-violet-600 py-3 text-sm font-bold text-white shadow-md transition-all hover:from-violet-700 hover:to-violet-500 active:scale-[0.99] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Adding Customer...</span>
                  </>
                ) : (
                  <span>Continue</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}