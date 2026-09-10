// // import React, { useState } from "react";
// // import { ArrowLeftRight, IndianRupee } from "lucide-react";

// // export default function PaymentTransferForm() {
// //   const [toCustomer, setToCustomer] = useState("");
// //   const [fromCustomer, setFromCustomer] = useState("");
// //   const [amount, setAmount] = useState("");
// //   const [details, setDetails] = useState("");

// //   const customersList = ["Javed", "Achintaya", "Shivam", "Rahul", "Aman"];

// //   const handleSubmit = (e: React.FormEvent) => {
// //     e.preventDefault();
// //     if (!toCustomer || !fromCustomer || !amount) {
// //       alert("Please fill in all required fields.");
// //       return;
// //     }
// //     alert(
// //       `Transaction Successful!\nFrom: ${fromCustomer}\nTo: ${toCustomer}\nAmount: ₹${amount}\nDetails: ${details || "N/A"}`
// //     );
// //   };

// //   return (
// //     <div className="w-full font-sans text-ink-900">
// //       {/* PAGE HEADING */}
// //       <div className="mb-5 flex flex-col gap-1 sm:mb-6">
// //         <h1 className="text-xl font-extrabold tracking-tight text-ink-900 sm:text-2xl">
// //           Cross Entry
// //         </h1>
// //         <p className="text-xs font-medium text-ink-500 sm:text-sm">
// //           Move a balance directly between two customers in one step.
// //         </p>
// //       </div>

// //       <div className="mx-auto grid w-full max-w-3xl grid-cols-1 gap-4 lg:max-w-none lg:grid-cols-5">
// //         {/* Form Card */}
// //         <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card sm:p-7 lg:col-span-3">
// //           <div className="mb-5 flex items-center gap-2.5">
// //             <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600/10 text-violet-700">
// //               <ArrowLeftRight size={18} />
// //             </div>
// //             <div>
// //               <h2 className="text-sm font-bold text-ink-900 sm:text-base">Transfer Details</h2>
// //               <p className="text-[11px] font-medium text-ink-500">All fields marked are required</p>
// //             </div>
// //           </div>

// //           <form onSubmit={handleSubmit} className="flex flex-col gap-5">
// //             {/* 1. To Customer Field */}
// //             <div className="space-y-1.5">
// //               <label className="block text-sm font-bold text-debit-600">To Customer</label>
// //               <div className="relative rounded-xl border border-slate-200 bg-white shadow-2xs transition-all focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-brand-600/15">
// //                 <select
// //                   value={toCustomer}
// //                   onChange={(e) => setToCustomer(e.target.value)}
// //                   className="w-full cursor-pointer appearance-none rounded-xl bg-transparent px-3.5 py-3 text-sm font-medium text-ink-700 outline-none"
// //                 >
// //                   <option value="" disabled>
// //                     Select Customer
// //                   </option>
// //                   {customersList.map((cust) => (
// //                     <option key={cust} value={cust}>
// //                       {cust}
// //                     </option>
// //                   ))}
// //                 </select>
// //                 <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-ink-300">
// //                   ▼
// //                 </div>
// //               </div>
// //             </div>

// //             {/* 2. From Customer Field */}
// //             <div className="space-y-1.5">
// //               <label className="block text-sm font-bold text-credit-600">From Customer</label>
// //               <div className="relative rounded-xl border border-slate-200 bg-white shadow-2xs transition-all focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-brand-600/15">
// //                 <select
// //                   value={fromCustomer}
// //                   onChange={(e) => setFromCustomer(e.target.value)}
// //                   className="w-full cursor-pointer appearance-none rounded-xl bg-transparent px-3.5 py-3 text-sm font-medium text-ink-700 outline-none"
// //                 >
// //                   <option value="" disabled>
// //                     Select Customer
// //                   </option>
// //                   {customersList.map((cust) => (
// //                     <option key={cust} value={cust}>
// //                       {cust}
// //                     </option>
// //                   ))}
// //                 </select>
// //                 <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-ink-300">
// //                   ▼
// //                 </div>
// //               </div>
// //             </div>

// //             {/* 3. Enter Amount Field */}
// //             <div className="space-y-1">
// //               <label className="block text-sm font-bold text-ink-700">Amount</label>
// //               <div className="relative flex items-center rounded-xl border border-slate-200 bg-white px-3.5 py-3 shadow-2xs transition-all focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-brand-600/15">
// //                 <IndianRupee size={15} className="mr-2 shrink-0 text-ink-300" />
// //                 <input
// //                   type="number"
// //                   value={amount}
// //                   onChange={(e) => {
// //                     if (e.target.value.length <= 9) {
// //                       setAmount(e.target.value);
// //                     }
// //                   }}
// //                   placeholder="Enter Amount"
// //                   className="w-full bg-transparent text-sm font-bold text-ink-700 outline-none placeholder:font-bold placeholder:text-ink-300"
// //                 />
// //               </div>
// //               <div className="text-right text-[11px] font-medium text-ink-300">
// //                 {amount.length}/9
// //               </div>
// //             </div>

// //             {/* 4. Enter Details Field */}
// //             <div className="space-y-1">
// //               <label className="block text-sm font-bold text-ink-700">Details</label>
// //               <div className="relative rounded-xl border border-slate-200 bg-white px-3.5 py-3 shadow-2xs transition-all focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-brand-600/15">
// //                 <input
// //                   type="text"
// //                   maxLength={36}
// //                   value={details}
// //                   onChange={(e) => setDetails(e.target.value)}
// //                   placeholder="Enter Details"
// //                   className="w-full bg-transparent text-sm font-medium text-ink-700 outline-none placeholder:text-ink-300"
// //                 />
// //               </div>
// //               <div className="text-right text-[11px] font-medium text-ink-300">
// //                 {details.length}/36
// //               </div>
// //             </div>

// //             {/* 5. Pay Action Button */}
// //             <button
// //               type="submit"
// //               className="mt-2 w-full rounded-xl bg-gradient-to-r from-violet-800 to-violet-600 py-3.5 text-sm font-bold text-white shadow-md transition-all hover:from-violet-700 hover:to-violet-500 active:scale-[0.99]"
// //             >
// //               Pay
// //             </button>
// //           </form>
// //         </div>

// //         {/* Summary / preview card */}
// //         <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-brand-700 via-brand-600 to-violet-700 p-6 text-white shadow-lift lg:col-span-2">
// //           <h3 className="text-sm font-bold uppercase tracking-wider text-white/70">Preview</h3>
// //           <div className="mt-4 space-y-4">
// //             <div>
// //               <p className="text-[11px] font-semibold uppercase tracking-wide text-white/60">From</p>
// //               <p className="text-lg font-extrabold">{fromCustomer || "—"}</p>
// //             </div>
// //             <div>
// //               <p className="text-[11px] font-semibold uppercase tracking-wide text-white/60">To</p>
// //               <p className="text-lg font-extrabold">{toCustomer || "—"}</p>
// //             </div>
// //             <div className="border-t border-white/15 pt-4">
// //               <p className="text-[11px] font-semibold uppercase tracking-wide text-white/60">Amount</p>
// //               <p className="text-3xl font-black tracking-tight">₹ {amount || "0"}</p>
// //             </div>
// //             {details && (
// //               <p className="rounded-lg bg-white/10 p-3 text-xs font-medium text-white/80">
// //                 {details}
// //               </p>
// //             )}
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }


// import React, { useState, useEffect, useCallback } from "react";
// import { ArrowLeftRight, IndianRupee, Loader2 } from "lucide-react";
// import { toast } from "react-toastify";

// // Customer Interface based on API Response
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

// export default function PaymentTransferForm() {
//   // Form State
//   const [toCustomer, setToCustomer] = useState<string>("");
//   const [fromCustomer, setFromCustomer] = useState<string>("");
//   const [amount, setAmount] = useState<string>("");
//   const [details, setDetails] = useState<string>("");

//   // API Data & Loading State
//   const [customersList, setCustomersList] = useState<CustomerApiData[]>([]);
//   const [isLoading, setIsLoading] = useState<boolean>(true);

//   // Helper to fetch authorization token headers
//   const getAuthHeaders = useCallback(() => {
//     const token = localStorage.getItem("token");
//     return {
//       "Content-Type": "application/json",
//       ...(token ? { Authorization: `Bearer ${token}` } : {}),
//     };
//   }, []);

//   // Fetch Customer List from API
//   const fetchCustomers = useCallback(async () => {
//     // Get active khata_id from localStorage or fallback
//     const khataId = localStorage.getItem("khata_id") || "9441f5af-58d4-47e9-b479-58a417b4ed30";

//     if (!khataId) {
//       toast.error("Khata ID not found.");
//       setIsLoading(false);
//       return;
//     }

//     setIsLoading(true);

//     try {
//       const response = await fetch(
//         `http://192.168.0.158:5000/api/parties/khata/${khataId}`,
//         {
//           method: "GET",
//           headers: getAuthHeaders(),
//         }
//       );

//       const result = await response.json();

//       if (response.ok && result.success && Array.isArray(result.data)) {
//         setCustomersList(result.data);
//       } else {
//         toast.error(result.message || "Failed to load customer list.");
//       }
//     } catch (error) {
//       console.error("Fetch Customers Error:", error);
//       toast.error("Unable to connect to the server.");
//     } finally {
//       setIsLoading(false);
//     }
//   }, [getAuthHeaders]);

//   useEffect(() => {
//     fetchCustomers();
//   }, [fetchCustomers]);

//   // Form Submit Handler
//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!toCustomer || !fromCustomer || !amount) {
//       alert("Please fill in all required fields.");
//       return;
//     }

//     if (toCustomer === fromCustomer) {
//       alert("Source and Destination customer cannot be the same.");
//       return;
//     }

//     // Resolve customer names for display
//     const selectedFromObj = customersList.find((c) => c.khata_customer_id === fromCustomer);
//     const selectedToObj = customersList.find((c) => c.khata_customer_id === toCustomer);

//     alert(
//       `Transaction Successful!\nFrom: ${selectedFromObj?.customer_name || fromCustomer}\nTo: ${selectedToObj?.customer_name || toCustomer}\nAmount: ₹${amount}\nDetails: ${details || "N/A"}`
//     );
//   };

//   // Helper to get Customer Name from ID for Preview Card
//   const getCustomerName = (id: string) => {
//     const found = customersList.find((c) => c.khata_customer_id === id);
//     return found ? found.customer_name : "—";
//   };

//   return (
//     <div className="w-full font-sans text-ink-900">
//       {/* PAGE HEADING */}
//       <div className="mb-5 flex flex-col gap-1 sm:mb-6">
//         <h1 className="text-xl font-extrabold tracking-tight text-ink-900 sm:text-2xl">
//           Cross Entry
//         </h1>
//         <p className="text-xs font-medium text-ink-500 sm:text-sm">
//           Move a balance directly between two customers in one step.
//         </p>
//       </div>

//       <div className="mx-auto grid w-full max-w-3xl grid-cols-1 gap-4 lg:max-w-none lg:grid-cols-5">
//         {/* Form Card */}
//         <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card sm:p-7 lg:col-span-3">
//           <div className="mb-5 flex items-center gap-2.5">
//             <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600/10 text-violet-700">
//               <ArrowLeftRight size={18} />
//             </div>
//             <div>
//               <h2 className="text-sm font-bold text-ink-900 sm:text-base">Transfer Details</h2>
//               <p className="text-[11px] font-medium text-ink-500">All fields marked are required</p>
//             </div>
//           </div>

//           <form onSubmit={handleSubmit} className="flex flex-col gap-5">
//             {/* 1. To Customer Field */}
//             <div className="space-y-1.5">
//               <label className="block text-sm font-bold text-debit-600">To Customer</label>
//               <div className="relative rounded-xl border border-slate-200 bg-white shadow-2xs transition-all focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-brand-600/15">
//                 <select
//                   disabled={isLoading}
//                   value={toCustomer}
//                   onChange={(e) => setToCustomer(e.target.value)}
//                   className="w-full cursor-pointer appearance-none rounded-xl bg-transparent px-3.5 py-3 text-sm font-medium text-ink-700 outline-none disabled:opacity-50"
//                 >
//                   <option value="" disabled>
//                     {isLoading ? "Loading customers..." : "Select Customer"}
//                   </option>
//                   {customersList.map((cust) => (
//                     <option key={cust.khata_customer_id} value={cust.khata_customer_id}>
//                       {cust.customer_name} ({cust.mobile_number})
//                     </option>
//                   ))}
//                 </select>
//                 <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-ink-300">
//                   {isLoading ? <Loader2 size={14} className="animate-spin" /> : "▼"}
//                 </div>
//               </div>
//             </div>

//             {/* 2. From Customer Field */}
//             <div className="space-y-1.5">
//               <label className="block text-sm font-bold text-credit-600">From Customer</label>
//               <div className="relative rounded-xl border border-slate-200 bg-white shadow-2xs transition-all focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-brand-600/15">
//                 <select
//                   disabled={isLoading}
//                   value={fromCustomer}
//                   onChange={(e) => setFromCustomer(e.target.value)}
//                   className="w-full cursor-pointer appearance-none rounded-xl bg-transparent px-3.5 py-3 text-sm font-medium text-ink-700 outline-none disabled:opacity-50"
//                 >
//                   <option value="" disabled>
//                     {isLoading ? "Loading customers..." : "Select Customer"}
//                   </option>
//                   {customersList.map((cust) => (
//                     <option key={cust.khata_customer_id} value={cust.khata_customer_id}>
//                       {cust.customer_name} ({cust.mobile_number})
//                     </option>
//                   ))}
//                 </select>
//                 <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-ink-300">
//                   {isLoading ? <Loader2 size={14} className="animate-spin" /> : "▼"}
//                 </div>
//               </div>
//             </div>

//             {/* 3. Enter Amount Field */}
//             <div className="space-y-1">
//               <label className="block text-sm font-bold text-ink-700">Amount</label>
//               <div className="relative flex items-center rounded-xl border border-slate-200 bg-white px-3.5 py-3 shadow-2xs transition-all focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-brand-600/15">
//                 <IndianRupee size={15} className="mr-2 shrink-0 text-ink-300" />
//                 <input
//                   type="number"
//                   value={amount}
//                   onChange={(e) => {
//                     if (e.target.value.length <= 9) {
//                       setAmount(e.target.value);
//                     }
//                   }}
//                   placeholder="Enter Amount"
//                   className="w-full bg-transparent text-sm font-bold text-ink-700 outline-none placeholder:font-bold placeholder:text-ink-300"
//                 />
//               </div>
//               <div className="text-right text-[11px] font-medium text-ink-300">
//                 {amount.length}/9
//               </div>
//             </div>

//             {/* 4. Enter Details Field */}
//             <div className="space-y-1">
//               <label className="block text-sm font-bold text-ink-700">Details</label>
//               <div className="relative rounded-xl border border-slate-200 bg-white px-3.5 py-3 shadow-2xs transition-all focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-brand-600/15">
//                 <input
//                   type="text"
//                   maxLength={36}
//                   value={details}
//                   onChange={(e) => setDetails(e.target.value)}
//                   placeholder="Enter Details"
//                   className="w-full bg-transparent text-sm font-medium text-ink-700 outline-none placeholder:text-ink-300"
//                 />
//               </div>
//               <div className="text-right text-[11px] font-medium text-ink-300">
//                 {details.length}/36
//               </div>
//             </div>

//             {/* 5. Pay Action Button */}
//             <button
//               type="submit"
//               className="mt-2 w-full rounded-xl bg-gradient-to-r from-violet-800 to-violet-600 py-3.5 text-sm font-bold text-white shadow-md transition-all hover:from-violet-700 hover:to-violet-500 active:scale-[0.99]"
//             >
//               Pay
//             </button>
//           </form>
//         </div>

//         {/* Summary / preview card */}
//         <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-brand-700 via-brand-600 to-violet-700 p-6 text-white shadow-lift lg:col-span-2">
//           <h3 className="text-sm font-bold uppercase tracking-wider text-white/70">Preview</h3>
//           <div className="mt-4 space-y-4">
//             <div>
//               <p className="text-[11px] font-semibold uppercase tracking-wide text-white/60">From</p>
//               <p className="text-lg font-extrabold">{getCustomerName(fromCustomer)}</p>
//             </div>
//             <div>
//               <p className="text-[11px] font-semibold uppercase tracking-wide text-white/60">To</p>
//               <p className="text-lg font-extrabold">{getCustomerName(toCustomer)}</p>
//             </div>
//             <div className="border-t border-white/15 pt-4">
//               <p className="text-[11px] font-semibold uppercase tracking-wide text-white/60">Amount</p>
//               <p className="text-3xl font-black tracking-tight">₹ {amount || "0"}</p>
//             </div>
//             {details && (
//               <p className="rounded-lg bg-white/10 p-3 text-xs font-medium text-white/80">
//                 {details}
//               </p>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


import React, { useState, useEffect, useCallback } from "react";
import { ArrowLeftRight, IndianRupee, Loader2 } from "lucide-react";
import { toast } from "react-toastify";

// Customer Interface based on API Response
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

export default function PaymentTransferForm() {
  // Form State
  const [toCustomer, setToCustomer] = useState<string>("");
  const [fromCustomer, setFromCustomer] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [details, setDetails] = useState<string>("");

  // API Data & Loading States
  const [customersList, setCustomersList] = useState<CustomerApiData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Helper to fetch authorization token headers
  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }, []);

  // Fetch Customer List from API
  const fetchCustomers = useCallback(async () => {
    // Get active khata_id from localStorage or fallback
    const khataId = localStorage.getItem("khata_id") || "9441f5af-58d4-47e9-b479-58a417b4ed30";

    if (!khataId) {
      toast.error("Khata ID not found.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `http://192.168.0.158:5000/api/parties/khata/${khataId}`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        }
      );

      const result = await response.json();

      if (response.ok && result.success && Array.isArray(result.data)) {
        setCustomersList(result.data);
      } else {
        toast.error(result.message || "Failed to load customer list.");
      }
    } catch (error) {
      console.error("Fetch Customers Error:", error);
      toast.error("Unable to connect to the server.");
    } finally {
      setIsLoading(false);
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Form Submit Handler for Cross-Entry API
  const handleSubmit = async (e: React.FormEvent) => {
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

    const khataId = localStorage.getItem("khata_id") || "9441f5af-58d4-47e9-b479-58a417b4ed30";

    // Payload updated with backend parameter names: from_customer_id & to_customer_id
    const payload = {
      khata_id: khataId,
      from_customer_id: fromCustomer,
      to_customer_id: toCustomer,
      amount: parsedAmount,
      details: details.trim(),
    };

    setIsSubmitting(true);

    try {
      const response = await fetch("http://192.168.0.158:5000/api/cross-entries", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok && (result.success ?? true)) {
        toast.success(result.message || "Cross entry payment transferred successfully!");
        
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
      console.error("POST Cross Entry Error:", error);
      toast.error("Network error. Could not process payment.");
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
    <div className="w-full font-sans text-ink-900">
      {/* PAGE HEADING */}
      <div className="mb-5 flex flex-col gap-1 sm:mb-6">
        <h1 className="text-xl font-extrabold tracking-tight text-ink-900 sm:text-2xl">
          Cross Entry
        </h1>
        <p className="text-xs font-medium text-ink-500 sm:text-sm">
          Move a balance directly between two customers in one step.
        </p>
      </div>

      <div className="mx-auto grid w-full max-w-3xl grid-cols-1 gap-4 lg:max-w-none lg:grid-cols-5">
        {/* Form Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card sm:p-7 lg:col-span-3">
          <div className="mb-5 flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600/10 text-violet-700">
              <ArrowLeftRight size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-ink-900 sm:text-base">Transfer Details</h2>
              <p className="text-[11px] font-medium text-ink-500">All fields marked are required</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* 1. To Customer Field */}
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-debit-600">To Customer</label>
              <div className="relative rounded-xl border border-slate-200 bg-white shadow-2xs transition-all focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-brand-600/15">
                <select
                  disabled={isLoading || isSubmitting}
                  value={toCustomer}
                  onChange={(e) => setToCustomer(e.target.value)}
                  className="w-full cursor-pointer appearance-none rounded-xl bg-transparent px-3.5 py-3 text-sm font-medium text-ink-700 outline-none disabled:opacity-50"
                >
                  <option value="" disabled>
                    {isLoading ? "Loading customers..." : "Select Customer"}
                  </option>
                  {customersList.map((cust) => (
                    <option key={cust.khata_customer_id} value={cust.khata_customer_id}>
                      {cust.customer_name} ({cust.mobile_number})
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-ink-300">
                  {isLoading ? <Loader2 size={14} className="animate-spin" /> : "▼"}
                </div>
              </div>
            </div>

            {/* 2. From Customer Field */}
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-credit-600">From Customer</label>
              <div className="relative rounded-xl border border-slate-200 bg-white shadow-2xs transition-all focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-brand-600/15">
                <select
                  disabled={isLoading || isSubmitting}
                  value={fromCustomer}
                  onChange={(e) => setFromCustomer(e.target.value)}
                  className="w-full cursor-pointer appearance-none rounded-xl bg-transparent px-3.5 py-3 text-sm font-medium text-ink-700 outline-none disabled:opacity-50"
                >
                  <option value="" disabled>
                    {isLoading ? "Loading customers..." : "Select Customer"}
                  </option>
                  {customersList.map((cust) => (
                    <option key={cust.khata_customer_id} value={cust.khata_customer_id}>
                      {cust.customer_name} ({cust.mobile_number})
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-ink-300">
                  {isLoading ? <Loader2 size={14} className="animate-spin" /> : "▼"}
                </div>
              </div>
            </div>

            {/* 3. Enter Amount Field */}
            <div className="space-y-1">
              <label className="block text-sm font-bold text-ink-700">Amount</label>
              <div className="relative flex items-center rounded-xl border border-slate-200 bg-white px-3.5 py-3 shadow-2xs transition-all focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-brand-600/15">
                <IndianRupee size={15} className="mr-2 shrink-0 text-ink-300" />
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
                  className="w-full bg-transparent text-sm font-bold text-ink-700 outline-none placeholder:font-bold placeholder:text-ink-300 disabled:opacity-50"
                />
              </div>
              <div className="text-right text-[11px] font-medium text-ink-300">
                {amount.length}/9
              </div>
            </div>

            {/* 4. Enter Details Field */}
            <div className="space-y-1">
              <label className="block text-sm font-bold text-ink-700">Details</label>
              <div className="relative rounded-xl border border-slate-200 bg-white px-3.5 py-3 shadow-2xs transition-all focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-brand-600/15">
                <input
                  type="text"
                  maxLength={36}
                  disabled={isSubmitting}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Enter Details"
                  className="w-full bg-transparent text-sm font-medium text-ink-700 outline-none placeholder:text-ink-300 disabled:opacity-50"
                />
              </div>
              <div className="text-right text-[11px] font-medium text-ink-300">
                {details.length}/36
              </div>
            </div>

            {/* 5. Pay Action Button */}
            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-800 to-violet-600 py-3.5 text-sm font-bold text-white shadow-md transition-all hover:from-violet-700 hover:to-violet-500 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Processing...
                </>
              ) : (
                "Pay"
              )}
            </button>
          </form>
        </div>

        {/* Summary / Preview Card */}
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-brand-700 via-brand-600 to-violet-700 p-6 text-white shadow-lift lg:col-span-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white/70">Preview</h3>
          <div className="mt-4 space-y-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-white/60">From</p>
              <p className="text-lg font-extrabold">{getCustomerName(fromCustomer)}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-white/60">To</p>
              <p className="text-lg font-extrabold">{getCustomerName(toCustomer)}</p>
            </div>
            <div className="border-t border-white/15 pt-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-white/60">Amount</p>
              <p className="text-3xl font-black tracking-tight">₹ {amount || "0"}</p>
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
  );
}