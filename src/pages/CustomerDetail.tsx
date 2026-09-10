// // import { useState, useEffect, useCallback } from "react";
// // import { useParams, useNavigate } from "react-router-dom";
// // import {
// //   ArrowLeft,
// //   Pencil,
// //   FileText,
// //   Trash2,
// //   Loader2,
// //   AlertCircle,
// // } from "lucide-react";
// // import { toast } from "react-toastify";

// // // --- API Data Interfaces ---
// // interface TransactionApiData {
// //   transaction_id: string;
// //   khata_customer_id: string;
// //   created_by?: string;
// //   transaction_type: "LENE" | "DENE";
// //   amount: string;
// //   transaction_date?: string;
// //   description: string;
// //   reference_number?: string | null;
// //   created_at: string;
// //   updated_at?: string;
// //   running_balance: string | number;
// //   customer_name?: string;
// // }

// // interface CustomerApiData {
// //   khata_customer_id: string;
// //   khata_id: string;
// //   customer_id: string;
// //   customer_name: string;
// //   mobile_number: string;
// //   address?: string;
// //   khata_name?: string;
// //   is_active?: boolean;
// //   total_lene: string | number;
// //   total_dene: string | number;
// //   net_balance: string | number;
// //   net_status?: string;
// //   last_activity_date?: string | null;
// //   created_at?: string;
// // }

// // // --- UI Models ---
// // interface Entry {
// //   id: string;
// //   title: string;
// //   date: string;
// //   subPerson?: string;
// //   balance: string;
// //   leneAmount?: string;
// //   deneAmount?: string;
// //   tag?: string;
// //   status?: string;
// // }

// // type ModalType = "LENE" | "DENE" | "EDIT_CUSTOMER" | "DELETE_CONFIRM" | null;

// // export default function CustomerDetail() {
// //   const { khataCustomerId } = useParams<{ khataCustomerId: string }>();
// //   const navigate = useNavigate();

// //   // Component States
// //   const [entries, setEntries] = useState<Entry[]>([]);
// //   const [customer, setCustomer] = useState<CustomerApiData | null>(null);
// //   const [isLoading, setIsLoading] = useState<boolean>(true);
// //   const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

// //   // Active Modal State
// //   const [activeModal, setActiveModal] = useState<ModalType>(null);

// //   // Lene/Dene Form State
// //   const [amountInput, setAmountInput] = useState<string>("");
// //   const [detailsInput, setDetailsInput] = useState<string>("");

// //   // Customer Profile Edit Form State
// //   const [customerName, setCustomerName] = useState<string>("");
// //   const [customerPhone, setCustomerPhone] = useState<string>("");
// //   const [customerAddress, setCustomerAddress] = useState<string>("");

// //   // Utility to generate Auth headers
// //   const getAuthHeaders = useCallback(() => {
// //     const token = localStorage.getItem("token");
// //     return {
// //       "Content-Type": "application/json",
// //       ...(token ? { Authorization: `Bearer ${token}` } : {}),
// //     };
// //   }, []);

// //   // Format date string for UI display
// //   const formatDateString = (dateStr: string) => {
// //     try {
// //       const date = new Date(dateStr);
// //       return date
// //         .toLocaleString("en-GB", {
// //           day: "2-digit",
// //           month: "2-digit",
// //           year: "numeric",
// //           hour: "2-digit",
// //           minute: "2-digit",
// //           second: "2-digit",
// //           hour12: true,
// //         })
// //         .replace(/\//g, "-")
// //         .toUpperCase();
// //     } catch {
// //       return dateStr;
// //     }
// //   };

// //   // Map backend API transaction to UI Entry shape
// //   const mapTransactionToEntry = (tx: TransactionApiData): Entry => {
// //     const numAmount = parseFloat(String(tx.amount || "0")).toLocaleString("en-IN");
// //     const numBalance = parseFloat(String(tx.running_balance || "0")).toLocaleString("en-IN");

// //     return {
// //       id: tx.transaction_id,
// //       title: tx.description || (tx.transaction_type === "LENE" ? "Lene Entry" : "Dene Entry"),
// //       date: formatDateString(tx.created_at || tx.transaction_date || new Date().toISOString()),
// //       balance: numBalance,
// //       ...(tx.transaction_type === "LENE"
// //         ? { leneAmount: numAmount }
// //         : { deneAmount: numAmount }),
// //       tag: "N",
// //     };
// //   };

// //   // GET API: Fetch customer details and then fetch transactions using customer_id (partyId)
// //   const fetchCustomerAndTransactions = useCallback(async () => {
// //     if (!khataCustomerId) {
// //       toast.error("Invalid customer identifier.");
// //       setIsLoading(false);
// //       return;
// //     }

// //     setIsLoading(true);

// //     try {
// //       const headers = getAuthHeaders();

// //       // Step 1: Retrieve customer party metadata to get customer_id
// //       const customerRes = await fetch(
// //         `http://192.168.0.158:5000/api/parties/${khataCustomerId}`,
// //         {
// //           method: "GET",
// //           headers,
// //         }
// //       );

// //       const customerData = await customerRes.json();

// //       if (!customerRes.ok || !customerData.success || !customerData.data) {
// //         toast.error(customerData.message || "Failed to load customer profile.");
// //         setIsLoading(false);
// //         return;
// //       }

// //       const partyRecord: CustomerApiData = customerData.data;
// //       setCustomer(partyRecord);
// //       setCustomerName(partyRecord.customer_name || "");
// //       setCustomerPhone(partyRecord.mobile_number || "");
// //       setCustomerAddress(partyRecord.address || "");

// //       // Step 2: Use customer_id as partyId in http://192.168.0.158:5000/api/transactions/party/{partyId}
// //       const partyId = partyRecord.customer_id;

// //       if (!partyId) {
// //         toast.error("Party customer ID not found on customer record.");
// //         setIsLoading(false);
// //         return;
// //       }

// //       const transactionsRes = await fetch(
// //         `http://192.168.0.158:5000/api/transactions/party/${partyId}`,
// //         {
// //           method: "GET",
// //           headers,
// //         }
// //       );

// //       const transactionsData = await transactionsRes.json();

// //       if (transactionsRes.ok && transactionsData.success) {
// //         // Update customer balance details if returned by the transactions/party endpoint
// //         if (transactionsData.customer) {
// //           setCustomer((prev) => ({
// //             ...prev,
// //             ...transactionsData.customer,
// //             address: prev?.address || transactionsData.customer.address || "",
// //           }));
// //         }

// //         // Map and render transactions list
// //         if (Array.isArray(transactionsData.data)) {
// //           const mappedEntries = transactionsData.data.map((tx: TransactionApiData) =>
// //             mapTransactionToEntry(tx)
// //           );
// //           setEntries(mappedEntries);
// //         } else {
// //           setEntries([]);
// //         }
// //       } else {
// //         toast.error(transactionsData.message || "Failed to load transactions.");
// //       }
// //     } catch (error) {
// //       console.error("Fetch Details Error:", error);
// //       toast.error("Unable to connect to the server.");
// //     } finally {
// //       setIsLoading(false);
// //     }
// //   }, [khataCustomerId, getAuthHeaders]);

// //   useEffect(() => {
// //     fetchCustomerAndTransactions();
// //   }, [fetchCustomerAndTransactions]);

// //   const handleModalClose = () => {
// //     setActiveModal(null);
// //     setAmountInput("");
// //     setDetailsInput("");
// //   };

// //   const handleOpenModal = (type: ModalType) => {
// //     setAmountInput("");
// //     setDetailsInput("");
// //     setActiveModal(type);
// //   };

// //   // POST API: Create LENE or DENE Transaction
// //   const handleEntrySubmit = async (e: React.FormEvent) => {
// //     e.preventDefault();

// //     const parsedAmount = parseFloat(amountInput);
// //     if (isNaN(parsedAmount) || parsedAmount <= 0) {
// //       toast.error("Please enter a valid amount greater than zero.");
// //       return;
// //     }

// //     if (!activeModal || (activeModal !== "LENE" && activeModal !== "DENE")) {
// //       return;
// //     }

// //     if (!khataCustomerId) {
// //       toast.error("Customer ID is missing.");
// //       return;
// //     }

// //     setIsSubmitting(true);

// //     try {
// //       const payload = {
// //         khata_customer_id: khataCustomerId,
// //         amount: parsedAmount,
// //         transaction_type: activeModal,
// //         description: detailsInput.trim() || (activeModal === "LENE" ? "Amount Diya" : "Amount Liya"),
// //       };

// //       const response = await fetch("http://192.168.0.158:5000/api/transactions", {
// //         method: "POST",
// //         headers: getAuthHeaders(),
// //         body: JSON.stringify(payload),
// //       });

// //       const data = await response.json();

// //       if (response.ok && data.success) {
// //         toast.success(data.message || `${activeModal === "LENE" ? "Lene" : "Dene"} transaction added successfully!`);
// //         handleModalClose();
// //         fetchCustomerAndTransactions();
// //       } else {
// //         toast.error(data.message || "Failed to add transaction.");
// //       }
// //     } catch (error) {
// //       console.error("Transaction Submission Error:", error);
// //       toast.error("Unable to connect to the server.");
// //     } finally {
// //       setIsSubmitting(false);
// //     }
// //   };

// //   // PUT/PATCH API: Handle Edit Customer Update
// //   const handleCustomerUpdate = async (e: React.FormEvent) => {
// //     e.preventDefault();

// //     if (!customerName.trim()) {
// //       toast.error("Customer name cannot be empty.");
// //       return;
// //     }

// //     setIsSubmitting(true);

// //     try {
// //       const response = await fetch(
// //         `http://192.168.0.158:5000/api/parties/${khataCustomerId}`,
// //         {
// //           method: "PUT",
// //           headers: getAuthHeaders(),
// //           body: JSON.stringify({
// //             customer_name: customerName.trim(),
// //             mobile_number: customerPhone.trim(),
// //             address: customerAddress.trim(),
// //           }),
// //         }
// //       );

// //       const data = await response.json();

// //       if (response.ok && data.success) {
// //         toast.success(data.message || "Customer updated successfully!");
// //         handleModalClose();
// //         fetchCustomerAndTransactions();
// //       } else {
// //         toast.error(data.message || "Failed to update customer.");
// //       }
// //     } catch (error) {
// //       console.error("Customer Update Error:", error);
// //       toast.error("Unable to connect to the server.");
// //     } finally {
// //       setIsSubmitting(false);
// //     }
// //   };

// //   // DELETE API: Delete Customer
// //   const handleConfirmDelete = async () => {
// //     if (!khataCustomerId) return;

// //     setIsSubmitting(true);

// //     try {
// //       const response = await fetch(
// //         `http://192.168.0.158:5000/api/parties/${khataCustomerId}`,
// //         {
// //           method: "DELETE",
// //           headers: getAuthHeaders(),
// //         }
// //       );

// //       const data = await response.json();

// //       if (response.ok && data.success) {
// //         toast.success(data.message || "Customer deleted successfully.");
// //         handleModalClose();
// //         navigate(-1);
// //       } else {
// //         toast.error(data.message || "Failed to delete customer.");
// //       }
// //     } catch (error) {
// //       console.error("Customer Delete Error:", error);
// //       toast.error("Unable to connect to the server.");
// //     } finally {
// //       setIsSubmitting(false);
// //     }
// //   };

// //   // Calculate closing balance display value
// //   const netBalNum = customer ? parseFloat(String(customer.net_balance || "0")) : 0;
// //   const formattedNetBalance = Math.abs(netBalNum).toLocaleString("en-IN");

// //   return (
// //     <div className="-m-2 flex min-h-[calc(100vh-4rem)] w-full flex-col rounded-2xl border border-slate-200 bg-white pb-24 shadow-card sm:-m-4 md:-m-6 lg:-m-8">
// //       {/* 1. TOP NAVBAR */}
// //       <header className="sticky top-0 z-20 flex w-full items-center justify-between rounded-t-2xl border-b border-slate-100 bg-white px-4 py-3.5 shadow-xs">
// //         <button
// //           type="button"
// //           onClick={() => navigate(-1)}
// //           className="rounded-lg p-1.5 text-ink-500 transition-colors hover:bg-slate-100 active:scale-95"
// //           aria-label="Back"
// //         >
// //           <ArrowLeft size={20} />
// //         </button>

// //         {/* Customer Name with Edit Pen Icon */}
// //         <button
// //           type="button"
// //           onClick={() => handleOpenModal("EDIT_CUSTOMER")}
// //           className="flex items-center gap-1.5 font-bold text-brand-900 transition-opacity hover:opacity-80 active:scale-95 sm:text-lg"
// //         >
// //           <Pencil size={15} className="text-brand-700" />
// //           <span>{customer?.customer_name || "Loading..."}</span>
// //         </button>

// //         {/* PDF Download Icon Button */}
// //         <button
// //           type="button"
// //           className="flex h-9 w-9 items-center justify-center rounded-lg border border-brand-700 bg-brand-50 text-brand-800 transition-colors hover:bg-brand-700 hover:text-white"
// //           aria-label="Download Statement"
// //         >
// //           <FileText size={18} />
// //         </button>
// //       </header>

// //       {/* 2. OPENING & CLOSING BALANCE BANNER */}
// //       <div className="border-b border-slate-100 bg-slate-50/60 px-4 py-2.5 sm:px-6">
// //         <div className="mx-auto flex max-w-6xl items-center justify-between py-1">
// //           <div className="text-sm font-bold text-credit-600 sm:text-base">₹ 0</div>
// //           <div className="text-xs font-bold text-brand-900 sm:text-sm">Opening</div>
// //         </div>

// //         <div className="mx-auto flex max-w-6xl items-center justify-between border-t border-slate-200 pt-2 pb-1">
// //           <div className="text-base font-black text-brand-900 sm:text-lg">Closing</div>
// //           <div
// //             className={`text-base font-black sm:text-lg ${
// //               netBalNum > 0
// //                 ? "text-credit-600"
// //                 : netBalNum < 0
// //                 ? "text-debit-600"
// //                 : "text-ink-900"
// //             }`}
// //           >
// //             ₹ {formattedNetBalance}
// //           </div>
// //         </div>
// //       </div>

// //       {/* 3. FILTER / ACTION BANNER BAR */}
// //       <div className="w-full bg-gradient-to-r from-brand-700 via-brand-600 to-violet-700 px-4 py-2.5 shadow-inner">
// //         <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
// //           <button
// //             type="button"
// //             className="rounded-lg bg-white/15 px-4 py-1.5 text-xs font-bold text-white shadow-sm ring-1 ring-white/20 transition-all hover:bg-white/25 active:scale-95 sm:text-sm"
// //           >
// //             Monday Final
// //           </button>

// //           <button
// //             type="button"
// //             className="rounded-lg border border-white/40 bg-white/10 px-4 py-1.5 text-xs font-bold text-white shadow-xs backdrop-blur-xs transition-all hover:bg-white/20 active:scale-95 sm:text-sm"
// //           >
// //             Last Week Record
// //           </button>
// //         </div>
// //       </div>

// //       {/* 4. MAIN CONTENT & ENTRIES TABLE */}
// //       <main className="mx-auto w-full max-w-6xl flex-1 px-3 py-4 sm:px-6">
// //         <div className="grid grid-cols-12 px-3 py-2 text-[11px] font-extrabold uppercase tracking-wider text-ink-500 sm:text-xs">
// //           <div className="col-span-6 sm:col-span-5">Entries</div>
// //           <div className="col-span-3 text-center sm:col-span-3">Lene</div>
// //           <div className="col-span-3 pr-2 text-right sm:col-span-4">Dene</div>
// //         </div>

// //         {isLoading ? (
// //           <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
// //             <Loader2 size={24} className="animate-spin text-brand-600" />
// //             <span className="text-xs font-medium">Loading ledger transactions...</span>
// //           </div>
// //         ) : entries.length > 0 ? (
// //           <div className="space-y-2.5">
// //             {entries.map((item) => (
// //               <div
// //                 key={item.id}
// //                 className="relative grid grid-cols-12 items-center rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs transition-all hover:border-brand-200 hover:shadow-sm"
// //               >
// //                 <div className="col-span-6 space-y-0.5 sm:col-span-5">
// //                   <div className="text-xs font-bold text-ink-900 sm:text-sm">{item.title}</div>
// //                   <div className="text-[10px] font-medium text-ink-300 sm:text-xs">{item.date}</div>
// //                   {item.subPerson && (
// //                     <div className="text-xs font-bold text-brand-800">{item.subPerson}</div>
// //                   )}
// //                   <div className="text-[11px] font-bold text-debit-600 sm:text-xs">
// //                     Bal. ₹ {item.balance}
// //                   </div>
// //                 </div>

// //                 <div className="col-span-3 text-center">
// //                   {item.leneAmount && (
// //                     <span className="text-xs font-black text-debit-600 sm:text-sm">
// //                       ₹ {item.leneAmount}
// //                     </span>
// //                   )}
// //                 </div>

// //                 <div className="col-span-3 flex items-center justify-end gap-2 pr-1 sm:col-span-4">
// //                   {item.deneAmount && (
// //                     <span className="text-xs font-black text-credit-600 sm:text-sm">
// //                       ₹ {item.deneAmount}
// //                     </span>
// //                   )}

// //                   <div className="flex flex-col items-end">
// //                     {item.tag && (
// //                       <span className="text-[11px] font-extrabold text-debit-600">{item.tag}</span>
// //                     )}
// //                     {item.status && (
// //                       <span className="text-[9px] font-bold tracking-tight text-brand-900">
// //                         {item.status}
// //                       </span>
// //                     )}
// //                   </div>
// //                 </div>
// //               </div>
// //             ))}
// //           </div>
// //         ) : (
// //           <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 py-16 text-center text-slate-400">
// //             <AlertCircle size={32} className="stroke-1 text-slate-300" />
// //             <p className="mt-2 text-sm font-medium">No transactions recorded yet.</p>
// //             <p className="text-xs text-slate-400">Use LENE or DENE to add your first entry.</p>
// //           </div>
// //         )}
// //       </main>

// //       {/* 5. BOTTOM ACTION BUTTONS */}
// //       <footer className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white/85 p-2 backdrop-blur-md sm:p-4 lg:left-72">
// //         <div className="mx-auto flex max-w-6xl gap-3">
// //           <button
// //             type="button"
// //             onClick={() => handleOpenModal("LENE")}
// //             className="flex flex-1 flex-col items-center justify-center rounded-xl bg-gradient-to-r from-debit-600 to-debit-500 py-2.5 text-white shadow-md transition-all hover:brightness-105 active:scale-[0.98]"
// //           >
// //             <span className="text-xs font-black uppercase tracking-wide sm:text-sm">LENE ₹</span>
// //             <span className="text-[10px] font-medium opacity-90 sm:text-xs">Amount Diya</span>
// //           </button>

// //           <button
// //             type="button"
// //             onClick={() => handleOpenModal("DENE")}
// //             className="flex flex-1 flex-col items-center justify-center rounded-xl bg-gradient-to-r from-credit-600 to-credit-500 py-2.5 text-white shadow-md transition-all hover:brightness-105 active:scale-[0.98]"
// //           >
// //             <span className="text-xs font-black uppercase tracking-wide sm:text-sm">DENE ₹</span>
// //             <span className="text-[10px] font-medium opacity-90 sm:text-xs">Amount Liya</span>
// //           </button>
// //         </div>
// //       </footer>

// //       {/* 6. POPUP MODALS */}

// //       {/* EDIT CUSTOMER MODAL */}
// //       {activeModal === "EDIT_CUSTOMER" && (
// //         <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-xs p-0 sm:items-center sm:p-4">
// //           <div className="flex h-full w-full max-w-md flex-col overflow-hidden border border-slate-200 bg-white shadow-2xl sm:h-auto sm:rounded-2xl">
// //             <div className="relative flex items-center justify-center border-b border-slate-100 bg-white px-4 py-3.5">
// //               <button
// //                 type="button"
// //                 disabled={isSubmitting}
// //                 onClick={handleModalClose}
// //                 className="absolute left-4 p-1 text-ink-500 transition-colors hover:text-ink-900 active:scale-95 disabled:opacity-50"
// //                 aria-label="Back"
// //               >
// //                 <ArrowLeft size={20} />
// //               </button>

// //               <h2 className="text-base font-extrabold text-ink-900">Edit Customer</h2>
// //             </div>

// //             <form onSubmit={handleCustomerUpdate} className="flex flex-col gap-4 p-5 sm:p-6">
// //               <div className="space-y-1">
// //                 <div className="relative rounded-xl border border-slate-200 bg-white px-3.5 py-3 transition-all focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-brand-600/15">
// //                   <input
// //                     type="text"
// //                     maxLength={36}
// //                     required
// //                     disabled={isSubmitting}
// //                     value={customerName}
// //                     onChange={(e) => setCustomerName(e.target.value)}
// //                     placeholder="Enter Customer Name"
// //                     className="w-full bg-transparent text-sm font-semibold text-ink-900 outline-none placeholder:text-ink-300 disabled:opacity-50"
// //                   />
// //                 </div>
// //                 <div className="text-right text-[11px] font-medium text-ink-300">
// //                   {customerName.length}/36
// //                 </div>
// //               </div>

// //               <div className="relative flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3.5 py-3 transition-all focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-brand-600/15">
// //                 <div className="flex items-center gap-1 border-r border-slate-200 pr-3">
// //                   <span className="inline-block text-xs font-bold text-ink-700">🇮🇳 +91</span>
// //                   <span className="text-[10px] text-ink-500">▼</span>
// //                 </div>
// //                 <input
// //                   type="tel"
// //                   disabled={isSubmitting}
// //                   value={customerPhone}
// //                   onChange={(e) => setCustomerPhone(e.target.value)}
// //                   placeholder="Enter Phone Number"
// //                   className="w-full bg-transparent text-sm font-semibold text-ink-900 outline-none placeholder:text-ink-300 disabled:opacity-50"
// //                 />
// //               </div>

// //               <div className="space-y-1">
// //                 <div className="relative rounded-xl border border-slate-200 bg-white px-3.5 py-3 transition-all focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-brand-600/15">
// //                   <input
// //                     type="text"
// //                     maxLength={36}
// //                     disabled={isSubmitting}
// //                     value={customerAddress}
// //                     onChange={(e) => setCustomerAddress(e.target.value)}
// //                     placeholder="Enter Address"
// //                     className="w-full bg-transparent text-sm font-medium text-ink-900 outline-none placeholder:text-ink-300 disabled:opacity-50"
// //                   />
// //                 </div>
// //                 <div className="text-right text-[11px] font-medium text-ink-300">
// //                   {customerAddress.length}/36
// //                 </div>
// //               </div>

// //               <button
// //                 type="submit"
// //                 disabled={isSubmitting}
// //                 className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-800 to-violet-600 py-3 text-sm font-bold text-white shadow-md transition-all hover:from-violet-700 hover:to-violet-500 active:scale-[0.99] disabled:opacity-50"
// //               >
// //                 {isSubmitting ? (
// //                   <>
// //                     <Loader2 size={16} className="animate-spin" />
// //                     <span>Updating...</span>
// //                   </>
// //                 ) : (
// //                   <span>Update Customer</span>
// //                 )}
// //               </button>

// //               <button
// //                 type="button"
// //                 disabled={isSubmitting}
// //                 onClick={() => setActiveModal("DELETE_CONFIRM")}
// //                 className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 py-3 text-sm font-bold text-white shadow-md transition-all hover:brightness-105 active:scale-[0.99] disabled:opacity-50"
// //               >
// //                 <Trash2 size={16} />
// //                 <span>Delete Customer</span>
// //               </button>
// //             </form>
// //           </div>
// //         </div>
// //       )}

// //       {/* DELETE CONFIRMATION POPUP MODAL */}
// //       {activeModal === "DELETE_CONFIRM" && (
// //         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-xs">
// //           <div className="w-full max-w-lg rounded-2xl bg-white p-8 text-center shadow-2xl transition-all">
// //             <h3 className="text-3xl font-extrabold text-ink-900 sm:text-4xl">Are you sure?</h3>
// //             <p className="mt-4 text-sm font-medium leading-relaxed text-ink-500 sm:text-base">
// //               Do you want to delete this customer? All transaction records associated with this customer will be deleted.
// //             </p>

// //             <div className="mt-8 flex items-center justify-center gap-4">
// //               <button
// //                 type="button"
// //                 disabled={isSubmitting}
// //                 onClick={() => setActiveModal("EDIT_CUSTOMER")}
// //                 className="w-32 rounded-xl bg-slate-200 py-2.5 text-base font-bold text-ink-700 shadow-xs transition-all hover:bg-slate-300 active:scale-95 disabled:opacity-50"
// //               >
// //                 No
// //               </button>
// //               <button
// //                 type="button"
// //                 disabled={isSubmitting}
// //                 onClick={handleConfirmDelete}
// //                 className="flex w-32 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 py-2.5 text-base font-bold text-white shadow-xs transition-all hover:brightness-105 active:scale-95 disabled:opacity-50"
// //               >
// //                 {isSubmitting ? (
// //                   <Loader2 size={18} className="animate-spin" />
// //                 ) : (
// //                   <span>Yes</span>
// //                 )}
// //               </button>
// //             </div>
// //           </div>
// //         </div>
// //       )}

// //       {/* LENE / DENE TRANSACTION MODAL */}
// //       {(activeModal === "LENE" || activeModal === "DENE") && (
// //         <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-xs p-0 sm:items-center sm:p-4">
// //           <div className="flex h-full w-full max-w-md flex-col overflow-hidden border border-slate-200 bg-white shadow-2xl sm:h-auto sm:rounded-2xl">
// //             <div className="relative flex items-center justify-center border-b border-slate-100 bg-white px-4 py-3.5">
// //               <button
// //                 type="button"
// //                 disabled={isSubmitting}
// //                 onClick={handleModalClose}
// //                 className="absolute left-4 p-1 text-ink-500 transition-colors hover:text-ink-900 active:scale-95 disabled:opacity-50"
// //                 aria-label="Back"
// //               >
// //                 <ArrowLeft size={20} />
// //               </button>

// //               <h2
// //                 className={`flex items-center gap-1 text-base font-extrabold ${
// //                   activeModal === "LENE" ? "text-debit-600" : "text-credit-700"
// //                 }`}
// //               >
// //                 <span>₹</span>
// //                 <span>{activeModal === "LENE" ? "Lene" : "Dene"}</span>
// //                 <span>-</span>
// //                 <span className="truncate max-w-[150px]">{customer?.customer_name}</span>
// //               </h2>
// //             </div>

// //             <form onSubmit={handleEntrySubmit} className="flex flex-col gap-4 p-5 sm:p-6">
// //               <div className="space-y-1">
// //                 <div className="relative flex items-center rounded-xl border border-slate-200 bg-white px-3.5 py-3 transition-all focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-brand-600/15">
// //                   <input
// //                     type="number"
// //                     step="any"
// //                     required
// //                     disabled={isSubmitting}
// //                     value={amountInput}
// //                     onChange={(e) => {
// //                       if (e.target.value.length <= 9) {
// //                         setAmountInput(e.target.value);
// //                       }
// //                     }}
// //                     placeholder="Enter Amount"
// //                     className="w-full bg-transparent text-sm font-semibold text-ink-900 outline-none placeholder:font-bold placeholder:text-ink-300 disabled:opacity-50"
// //                   />
// //                   <div className="flex flex-col pl-2 text-[10px] text-ink-300 select-none cursor-pointer">
// //                     <span>▲</span>
// //                     <span>▼</span>
// //                   </div>
// //                 </div>
// //                 <div className="text-right text-[11px] font-medium text-ink-300">
// //                   {amountInput.length}/9
// //                 </div>
// //               </div>

// //               <div className="space-y-1">
// //                 <div className="relative rounded-xl border border-slate-200 bg-white px-3.5 py-3 transition-all focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-brand-600/15">
// //                   <input
// //                     type="text"
// //                     maxLength={36}
// //                     disabled={isSubmitting}
// //                     value={detailsInput}
// //                     onChange={(e) => setDetailsInput(e.target.value)}
// //                     placeholder="Enter Details (e.g. Cash received)"
// //                     className="w-full bg-transparent text-sm font-medium text-ink-900 outline-none placeholder:text-ink-300 disabled:opacity-50"
// //                   />
// //                 </div>
// //                 <div className="text-right text-[11px] font-medium text-ink-300">
// //                   {detailsInput.length}/36
// //                 </div>
// //               </div>

// //               <button
// //                 type="submit"
// //                 disabled={isSubmitting}
// //                 className={`mt-2 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white shadow-md transition-all active:scale-[0.99] disabled:opacity-50 ${
// //                   activeModal === "LENE"
// //                     ? "bg-gradient-to-r from-debit-600 to-debit-500 hover:brightness-105"
// //                     : "bg-gradient-to-r from-credit-600 to-credit-500 hover:brightness-105"
// //                 }`}
// //               >
// //                 {isSubmitting ? (
// //                   <>
// //                     <Loader2 size={16} className="animate-spin" />
// //                     <span>Saving...</span>
// //                   </>
// //                 ) : (
// //                   <span>Save</span>
// //                 )}
// //               </button>
// //             </form>
// //           </div>
// //         </div>
// //       )}
// //     </div>
// //   );
// // }

// import { useState, useEffect, useCallback } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import {
//   ArrowLeft,
//   Pencil,
//   FileText,
//   Trash2,
//   Loader2,
//   AlertCircle,
// } from "lucide-react";
// import { toast } from "react-toastify";

// // --- API Data Interfaces ---
// interface TransactionApiData {
//   transaction_id: string;
//   khata_customer_id: string;
//   created_by?: string;
//   transaction_type: "LENE" | "DENE";
//   amount: string;
//   transaction_date?: string;
//   description: string;
//   reference_number?: string | null;
//   created_at: string;
//   updated_at?: string;
//   running_balance: string | number;
//   customer_name?: string;
// }

// interface CustomerApiData {
//   khata_customer_id: string;
//   khata_id: string;
//   customer_id: string;
//   customer_name: string;
//   mobile_number: string;
//   address?: string;
//   khata_name?: string;
//   is_active?: boolean;
//   total_lene: string | number;
//   total_dene: string | number;
//   net_balance: string | number;
//   net_status?: string;
//   last_activity_date?: string | null;
//   created_at?: string;
// }

// // --- UI Models ---
// interface Entry {
//   id: string;
//   title: string;
//   date: string;
//   subPerson?: string;
//   balance: string;
//   leneAmount?: string;
//   deneAmount?: string;
//   tag?: string;
//   status?: string;
// }

// type ModalType =
//   | "LENE"
//   | "DENE"
//   | "EDIT_CUSTOMER"
//   | "DELETE_CONFIRM"
//   | "MONDAY_FINAL_CONFIRM"
//   | null;

// export default function CustomerDetail() {
//   const { khataCustomerId } = useParams<{ khataCustomerId: string }>();
//   const navigate = useNavigate();

//   // Component States
//   const [entries, setEntries] = useState<Entry[]>([]);
//   const [customer, setCustomer] = useState<CustomerApiData | null>(null);
//   const [isLoading, setIsLoading] = useState<boolean>(true);
//   const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

//   // Active Modal State
//   const [activeModal, setActiveModal] = useState<ModalType>(null);

//   // Lene/Dene Form State
//   const [amountInput, setAmountInput] = useState<string>("");
//   const [detailsInput, setDetailsInput] = useState<string>("");

//   // Customer Profile Edit Form State
//   const [customerName, setCustomerName] = useState<string>("");
//   const [customerPhone, setCustomerPhone] = useState<string>("");
//   const [customerAddress, setCustomerAddress] = useState<string>("");

//   // Utility to generate Auth headers
//   const getAuthHeaders = useCallback(() => {
//     const token = localStorage.getItem("token");
//     return {
//       "Content-Type": "application/json",
//       ...(token ? { Authorization: `Bearer ${token}` } : {}),
//     };
//   }, []);

//   // Format date string for UI display
//   const formatDateString = (dateStr: string) => {
//     try {
//       const date = new Date(dateStr);
//       return date
//         .toLocaleString("en-GB", {
//           day: "2-digit",
//           month: "2-digit",
//           year: "numeric",
//           hour: "2-digit",
//           minute: "2-digit",
//           second: "2-digit",
//           hour12: true,
//         })
//         .replace(/\//g, "-")
//         .toUpperCase();
//     } catch {
//       return dateStr;
//     }
//   };

//   // Map backend API transaction to UI Entry shape
//   const mapTransactionToEntry = (tx: TransactionApiData): Entry => {
//     const numAmount = parseFloat(String(tx.amount || "0")).toLocaleString("en-IN");
//     const numBalance = parseFloat(String(tx.running_balance || "0")).toLocaleString("en-IN");

//     return {
//       id: tx.transaction_id,
//       title: tx.description || (tx.transaction_type === "LENE" ? "Lene Entry" : "Dene Entry"),
//       date: formatDateString(tx.created_at || tx.transaction_date || new Date().toISOString()),
//       balance: numBalance,
//       ...(tx.transaction_type === "LENE"
//         ? { leneAmount: numAmount }
//         : { deneAmount: numAmount }),
//       tag: "N",
//     };
//   };

//   // GET API: Fetch customer details and then fetch transactions using customer_id (partyId)
//   const fetchCustomerAndTransactions = useCallback(async () => {
//     if (!khataCustomerId) {
//       toast.error("Invalid customer identifier.");
//       setIsLoading(false);
//       return;
//     }

//     setIsLoading(true);

//     try {
//       const headers = getAuthHeaders();

//       // Step 1: Retrieve customer party metadata
//       const customerRes = await fetch(
//         `http://192.168.0.158:5000/api/parties/${khataCustomerId}`,
//         {
//           method: "GET",
//           headers,
//         }
//       );

//       const customerData = await customerRes.json();

//       if (!customerRes.ok || !customerData.success || !customerData.data) {
//         toast.error(customerData.message || "Failed to load customer profile.");
//         setIsLoading(false);
//         return;
//       }

//       const partyRecord: CustomerApiData = customerData.data;
//       setCustomer(partyRecord);
//       setCustomerName(partyRecord.customer_name || "");
//       setCustomerPhone(partyRecord.mobile_number || "");
//       setCustomerAddress(partyRecord.address || "");

//       // Step 2: Retrieve transactions using customer_id (partyId)
//       const partyId = partyRecord.customer_id;

//       if (!partyId) {
//         toast.error("Party customer ID not found on customer record.");
//         setIsLoading(false);
//         return;
//       }

//       const transactionsRes = await fetch(
//         `http://192.168.0.158:5000/api/transactions/party/${partyId}`,
//         {
//           method: "GET",
//           headers,
//         }
//       );

//       const transactionsData = await transactionsRes.json();

//       if (transactionsRes.ok && transactionsData.success) {
//         if (transactionsData.customer) {
//           setCustomer((prev) => ({
//             ...prev,
//             ...transactionsData.customer,
//             address: prev?.address || transactionsData.customer.address || "",
//           }));
//         }

//         if (Array.isArray(transactionsData.data)) {
//           const mappedEntries = transactionsData.data.map((tx: TransactionApiData) =>
//             mapTransactionToEntry(tx)
//           );
//           setEntries(mappedEntries);
//         } else {
//           setEntries([]);
//         }
//       } else {
//         toast.error(transactionsData.message || "Failed to load transactions.");
//       }
//     } catch (error) {
//       console.error("Fetch Details Error:", error);
//       toast.error("Unable to connect to the server.");
//     } finally {
//       setIsLoading(false);
//     }
//   }, [khataCustomerId, getAuthHeaders]);

//   useEffect(() => {
//     fetchCustomerAndTransactions();
//   }, [fetchCustomerAndTransactions]);

//   const handleModalClose = () => {
//     setActiveModal(null);
//     setAmountInput("");
//     setDetailsInput("");
//   };

//   const handleOpenModal = (type: ModalType) => {
//     setAmountInput("");
//     setDetailsInput("");
//     setActiveModal(type);
//   };

//   // POST API: Create LENE or DENE Transaction
//   const handleEntrySubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     const parsedAmount = parseFloat(amountInput);
//     if (isNaN(parsedAmount) || parsedAmount <= 0) {
//       toast.error("Please enter a valid amount greater than zero.");
//       return;
//     }

//     if (!activeModal || (activeModal !== "LENE" && activeModal !== "DENE")) {
//       return;
//     }

//     if (!khataCustomerId) {
//       toast.error("Customer ID is missing.");
//       return;
//     }

//     setIsSubmitting(true);

//     try {
//       const payload = {
//         khata_customer_id: khataCustomerId,
//         amount: parsedAmount,
//         transaction_type: activeModal,
//         description: detailsInput.trim() || (activeModal === "LENE" ? "Amount Diya" : "Amount Liya"),
//       };

//       const response = await fetch("http://192.168.0.158:5000/api/transactions", {
//         method: "POST",
//         headers: getAuthHeaders(),
//         body: JSON.stringify(payload),
//       });

//       const data = await response.json();

//       if (response.ok && data.success) {
//         toast.success(data.message || `${activeModal === "LENE" ? "Lene" : "Dene"} transaction added successfully!`);
//         handleModalClose();
//         fetchCustomerAndTransactions();
//       } else {
//         toast.error(data.message || "Failed to add transaction.");
//       }
//     } catch (error) {
//       console.error("Transaction Submission Error:", error);
//       toast.error("Unable to connect to the server.");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   // PUT/PATCH API: Handle Edit Customer Update
//   const handleCustomerUpdate = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!customerName.trim()) {
//       toast.error("Customer name cannot be empty.");
//       return;
//     }

//     setIsSubmitting(true);

//     try {
//       const response = await fetch(
//         `http://192.168.0.158:5000/api/parties/${khataCustomerId}`,
//         {
//           method: "PUT",
//           headers: getAuthHeaders(),
//           body: JSON.stringify({
//             customer_name: customerName.trim(),
//             mobile_number: customerPhone.trim(),
//             address: customerAddress.trim(),
//           }),
//         }
//       );

//       const data = await response.json();

//       if (response.ok && data.success) {
//         toast.success(data.message || "Customer updated successfully!");
//         handleModalClose();
//         fetchCustomerAndTransactions();
//       } else {
//         toast.error(data.message || "Failed to update customer.");
//       }
//     } catch (error) {
//       console.error("Customer Update Error:", error);
//       toast.error("Unable to connect to the server.");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   // DELETE API: Delete Customer
//   const handleConfirmDelete = async () => {
//     if (!khataCustomerId) return;

//     setIsSubmitting(true);

//     try {
//       const response = await fetch(
//         `http://192.168.0.158:5000/api/parties/${khataCustomerId}`,
//         {
//           method: "DELETE",
//           headers: getAuthHeaders(),
//         }
//       );

//       const data = await response.json();

//       if (response.ok && data.success) {
//         toast.success(data.message || "Customer deleted successfully.");
//         handleModalClose();
//         navigate(-1);
//       } else {
//         toast.error(data.message || "Failed to delete customer.");
//       }
//     } catch (error) {
//       console.error("Customer Delete Error:", error);
//       toast.error("Unable to connect to the server.");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   // POST API: Monday Final Submission
//   const handleMondayFinalSubmit = async () => {
//     const partyId = customer?.customer_id;
//     if (!partyId) {
//       toast.error("Customer party ID not found.");
//       return;
//     }

//     setIsSubmitting(true);

//     try {
//       const response = await fetch("http://192.168.0.158:5000/api/monday-final", {
//         method: "POST",
//         headers: getAuthHeaders(),
//         body: JSON.stringify({
//           party_id: partyId,
//         }),
//       });

//       const data = await response.json();

//       if (response.ok && data.success) {
//         toast.success(data.message || "Monday Final completed successfully!");
//         handleModalClose();
//         fetchCustomerAndTransactions();
//       } else {
//         toast.error(data.message || "Failed to complete Monday Final.");
//       }
//     } catch (error) {
//       console.error("Monday Final Error:", error);
//       toast.error("Unable to connect to the server.");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   // Calculate closing balance display value
//   const netBalNum = customer ? parseFloat(String(customer.net_balance || "0")) : 0;
//   const formattedNetBalance = Math.abs(netBalNum).toLocaleString("en-IN");

//   return (
//     <div className="-m-2 flex min-h-[calc(100vh-4rem)] w-full flex-col rounded-2xl border border-slate-200 bg-white pb-24 shadow-card sm:-m-4 md:-m-6 lg:-m-8">
//       {/* 1. TOP NAVBAR */}
//       <header className="sticky top-0 z-20 flex w-full items-center justify-between rounded-t-2xl border-b border-slate-100 bg-white px-4 py-3.5 shadow-xs">
//         <button
//           type="button"
//           onClick={() => navigate(-1)}
//           className="rounded-lg p-1.5 text-ink-500 transition-colors hover:bg-slate-100 active:scale-95"
//           aria-label="Back"
//         >
//           <ArrowLeft size={20} />
//         </button>

//         {/* Customer Name with Edit Pen Icon */}
//         <button
//           type="button"
//           onClick={() => handleOpenModal("EDIT_CUSTOMER")}
//           className="flex items-center gap-1.5 font-bold text-brand-900 transition-opacity hover:opacity-80 active:scale-95 sm:text-lg"
//         >
//           <Pencil size={15} className="text-brand-700" />
//           <span>{customer?.customer_name || "Loading..."}</span>
//         </button>

//         {/* PDF Download Icon Button */}
//         <button
//           type="button"
//           className="flex h-9 w-9 items-center justify-center rounded-lg border border-brand-700 bg-brand-50 text-brand-800 transition-colors hover:bg-brand-700 hover:text-white"
//           aria-label="Download Statement"
//         >
//           <FileText size={18} />
//         </button>
//       </header>

//       {/* 2. OPENING & CLOSING BALANCE BANNER */}
//       <div className="border-b border-slate-100 bg-slate-50/60 px-4 py-2.5 sm:px-6">
//         <div className="mx-auto flex max-w-6xl items-center justify-between py-1">
//           <div className="text-sm font-bold text-credit-600 sm:text-base">₹ 0</div>
//           <div className="text-xs font-bold text-brand-900 sm:text-sm">Opening</div>
//         </div>

//         <div className="mx-auto flex max-w-6xl items-center justify-between border-t border-slate-200 pt-2 pb-1">
//           <div className="text-base font-black text-brand-900 sm:text-lg">Closing</div>
//           <div
//             className={`text-base font-black sm:text-lg ${
//               netBalNum > 0
//                 ? "text-credit-600"
//                 : netBalNum < 0
//                 ? "text-debit-600"
//                 : "text-ink-900"
//             }`}
//           >
//             ₹ {formattedNetBalance}
//           </div>
//         </div>
//       </div>

//       {/* 3. FILTER / ACTION BANNER BAR */}
//       <div className="w-full bg-gradient-to-r from-brand-700 via-brand-600 to-violet-700 px-4 py-2.5 shadow-inner">
//         <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
//           <button
//             type="button"
//             onClick={() => handleOpenModal("MONDAY_FINAL_CONFIRM")}
//             className="rounded-lg bg-white/15 px-4 py-1.5 text-xs font-bold text-white shadow-sm ring-1 ring-white/20 transition-all hover:bg-white/25 active:scale-95 sm:text-sm"
//           >
//             Monday Final
//           </button>

//           <button
//             type="button"
//             className="rounded-lg border border-white/40 bg-white/10 px-4 py-1.5 text-xs font-bold text-white shadow-xs backdrop-blur-xs transition-all hover:bg-white/20 active:scale-95 sm:text-sm"
//           >
//             Last Week Record
//           </button>
//         </div>
//       </div>

//       {/* 4. MAIN CONTENT & ENTRIES TABLE */}
//       <main className="mx-auto w-full max-w-6xl flex-1 px-3 py-4 sm:px-6">
//         <div className="grid grid-cols-12 px-3 py-2 text-[11px] font-extrabold uppercase tracking-wider text-ink-500 sm:text-xs">
//           <div className="col-span-6 sm:col-span-5">Entries</div>
//           <div className="col-span-3 text-center sm:col-span-3">Lene</div>
//           <div className="col-span-3 pr-2 text-right sm:col-span-4">Dene</div>
//         </div>

//         {isLoading ? (
//           <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
//             <Loader2 size={24} className="animate-spin text-brand-600" />
//             <span className="text-xs font-medium">Loading ledger transactions...</span>
//           </div>
//         ) : entries.length > 0 ? (
//           <div className="space-y-2.5">
//             {entries.map((item) => (
//               <div
//                 key={item.id}
//                 className="relative grid grid-cols-12 items-center rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs transition-all hover:border-brand-200 hover:shadow-sm"
//               >
//                 <div className="col-span-6 space-y-0.5 sm:col-span-5">
//                   <div className="text-xs font-bold text-ink-900 sm:text-sm">{item.title}</div>
//                   <div className="text-[10px] font-medium text-ink-300 sm:text-xs">{item.date}</div>
//                   {item.subPerson && (
//                     <div className="text-xs font-bold text-brand-800">{item.subPerson}</div>
//                   )}
//                   <div className="text-[11px] font-bold text-debit-600 sm:text-xs">
//                     Bal. ₹ {item.balance}
//                   </div>
//                 </div>

//                 <div className="col-span-3 text-center">
//                   {item.leneAmount && (
//                     <span className="text-xs font-black text-debit-600 sm:text-sm">
//                       ₹ {item.leneAmount}
//                     </span>
//                   )}
//                 </div>

//                 <div className="col-span-3 flex items-center justify-end gap-2 pr-1 sm:col-span-4">
//                   {item.deneAmount && (
//                     <span className="text-xs font-black text-credit-600 sm:text-sm">
//                       ₹ {item.deneAmount}
//                     </span>
//                   )}

//                   <div className="flex flex-col items-end">
//                     {item.tag && (
//                       <span className="text-[11px] font-extrabold text-debit-600">{item.tag}</span>
//                     )}
//                     {item.status && (
//                       <span className="text-[9px] font-bold tracking-tight text-brand-900">
//                         {item.status}
//                       </span>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         ) : (
//           <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 py-16 text-center text-slate-400">
//             <AlertCircle size={32} className="stroke-1 text-slate-300" />
//             <p className="mt-2 text-sm font-medium">No transactions recorded yet.</p>
//             <p className="text-xs text-slate-400">Use LENE or DENE to add your first entry.</p>
//           </div>
//         )}
//       </main>

//       {/* 5. BOTTOM ACTION BUTTONS */}
//       <footer className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white/85 p-2 backdrop-blur-md sm:p-4 lg:left-72">
//         <div className="mx-auto flex max-w-6xl gap-3">
//           <button
//             type="button"
//             onClick={() => handleOpenModal("LENE")}
//             className="flex flex-1 flex-col items-center justify-center rounded-xl bg-gradient-to-r from-debit-600 to-debit-500 py-2.5 text-white shadow-md transition-all hover:brightness-105 active:scale-[0.98]"
//           >
//             <span className="text-xs font-black uppercase tracking-wide sm:text-sm">LENE ₹</span>
//             <span className="text-[10px] font-medium opacity-90 sm:text-xs">Amount Diya</span>
//           </button>

//           <button
//             type="button"
//             onClick={() => handleOpenModal("DENE")}
//             className="flex flex-1 flex-col items-center justify-center rounded-xl bg-gradient-to-r from-credit-600 to-credit-500 py-2.5 text-white shadow-md transition-all hover:brightness-105 active:scale-[0.98]"
//           >
//             <span className="text-xs font-black uppercase tracking-wide sm:text-sm">DENE ₹</span>
//             <span className="text-[10px] font-medium opacity-90 sm:text-xs">Amount Liya</span>
//           </button>
//         </div>
//       </footer>

//       {/* 6. POPUP MODALS */}

//       {/* MONDAY FINAL CONFIRMATION MODAL */}
//       {activeModal === "MONDAY_FINAL_CONFIRM" && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-xs">
//           <div className="w-full max-w-md rounded-2xl bg-white p-7 text-center shadow-2xl transition-all sm:p-8">
//             <h3 className="text-2xl font-bold text-ink-800 sm:text-3xl">Monday Final</h3>
//             <p className="mt-4 text-sm leading-relaxed text-ink-500 sm:text-base">
//               You realy want to Monday Final. After this you are not able to update
//               this customer Transaction and all Transactions of this user in Recycle
//               bin will be deleted
//             </p>

//             <div className="mt-7 flex items-center justify-center gap-3 sm:gap-4">
//               <button
//                 type="button"
//                 disabled={isSubmitting}
//                 onClick={handleModalClose}
//                 className="w-28 rounded-lg bg-slate-300/80 py-2.5 text-sm font-semibold text-white shadow-xs transition-all hover:bg-slate-400 active:scale-95 disabled:opacity-50 sm:w-32 sm:text-base"
//               >
//                 No
//               </button>
//               <button
//                 type="button"
//                 disabled={isSubmitting}
//                 onClick={handleMondayFinalSubmit}
//                 className="flex w-28 items-center justify-center gap-1.5 rounded-lg bg-[#DE6551] py-2.5 text-sm font-semibold text-white shadow-xs transition-all hover:bg-[#cf5642] active:scale-95 disabled:opacity-50 sm:w-32 sm:text-base"
//               >
//                 {isSubmitting ? (
//                   <Loader2 size={18} className="animate-spin text-white" />
//                 ) : (
//                   <span>Yes</span>
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* EDIT CUSTOMER MODAL */}
//       {activeModal === "EDIT_CUSTOMER" && (
//         <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-xs p-0 sm:items-center sm:p-4">
//           <div className="flex h-full w-full max-w-md flex-col overflow-hidden border border-slate-200 bg-white shadow-2xl sm:h-auto sm:rounded-2xl">
//             <div className="relative flex items-center justify-center border-b border-slate-100 bg-white px-4 py-3.5">
//               <button
//                 type="button"
//                 disabled={isSubmitting}
//                 onClick={handleModalClose}
//                 className="absolute left-4 p-1 text-ink-500 transition-colors hover:text-ink-900 active:scale-95 disabled:opacity-50"
//                 aria-label="Back"
//               >
//                 <ArrowLeft size={20} />
//               </button>

//               <h2 className="text-base font-extrabold text-ink-900">Edit Customer</h2>
//             </div>

//             <form onSubmit={handleCustomerUpdate} className="flex flex-col gap-4 p-5 sm:p-6">
//               <div className="space-y-1">
//                 <div className="relative rounded-xl border border-slate-200 bg-white px-3.5 py-3 transition-all focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-brand-600/15">
//                   <input
//                     type="text"
//                     maxLength={36}
//                     required
//                     disabled={isSubmitting}
//                     value={customerName}
//                     onChange={(e) => setCustomerName(e.target.value)}
//                     placeholder="Enter Customer Name"
//                     className="w-full bg-transparent text-sm font-semibold text-ink-900 outline-none placeholder:text-ink-300 disabled:opacity-50"
//                   />
//                 </div>
//                 <div className="text-right text-[11px] font-medium text-ink-300">
//                   {customerName.length}/36
//                 </div>
//               </div>

//               <div className="relative flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3.5 py-3 transition-all focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-brand-600/15">
//                 <div className="flex items-center gap-1 border-r border-slate-200 pr-3">
//                   <span className="inline-block text-xs font-bold text-ink-700">🇮🇳 +91</span>
//                   <span className="text-[10px] text-ink-500">▼</span>
//                 </div>
//                 <input
//                   type="tel"
//                   disabled={isSubmitting}
//                   value={customerPhone}
//                   onChange={(e) => setCustomerPhone(e.target.value)}
//                   placeholder="Enter Phone Number"
//                   className="w-full bg-transparent text-sm font-semibold text-ink-900 outline-none placeholder:text-ink-300 disabled:opacity-50"
//                 />
//               </div>

//               <div className="space-y-1">
//                 <div className="relative rounded-xl border border-slate-200 bg-white px-3.5 py-3 transition-all focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-brand-600/15">
//                   <input
//                     type="text"
//                     maxLength={36}
//                     disabled={isSubmitting}
//                     value={customerAddress}
//                     onChange={(e) => setCustomerAddress(e.target.value)}
//                     placeholder="Enter Address"
//                     className="w-full bg-transparent text-sm font-medium text-ink-900 outline-none placeholder:text-ink-300 disabled:opacity-50"
//                   />
//                 </div>
//                 <div className="text-right text-[11px] font-medium text-ink-300">
//                   {customerAddress.length}/36
//                 </div>
//               </div>

//               <button
//                 type="submit"
//                 disabled={isSubmitting}
//                 className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-800 to-violet-600 py-3 text-sm font-bold text-white shadow-md transition-all hover:from-violet-700 hover:to-violet-500 active:scale-[0.99] disabled:opacity-50"
//               >
//                 {isSubmitting ? (
//                   <>
//                     <Loader2 size={16} className="animate-spin" />
//                     <span>Updating...</span>
//                   </>
//                 ) : (
//                   <span>Update Customer</span>
//                 )}
//               </button>

//               <button
//                 type="button"
//                 disabled={isSubmitting}
//                 onClick={() => setActiveModal("DELETE_CONFIRM")}
//                 className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 py-3 text-sm font-bold text-white shadow-md transition-all hover:brightness-105 active:scale-[0.99] disabled:opacity-50"
//               >
//                 <Trash2 size={16} />
//                 <span>Delete Customer</span>
//               </button>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* DELETE CONFIRMATION POPUP MODAL */}
//       {activeModal === "DELETE_CONFIRM" && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-xs">
//           <div className="w-full max-w-lg rounded-2xl bg-white p-8 text-center shadow-2xl transition-all">
//             <h3 className="text-3xl font-extrabold text-ink-900 sm:text-4xl">Are you sure?</h3>
//             <p className="mt-4 text-sm font-medium leading-relaxed text-ink-500 sm:text-base">
//               Do you want to delete this customer? All transaction records associated with this customer will be deleted.
//             </p>

//             <div className="mt-8 flex items-center justify-center gap-4">
//               <button
//                 type="button"
//                 disabled={isSubmitting}
//                 onClick={() => setActiveModal("EDIT_CUSTOMER")}
//                 className="w-32 rounded-xl bg-slate-200 py-2.5 text-base font-bold text-ink-700 shadow-xs transition-all hover:bg-slate-300 active:scale-95 disabled:opacity-50"
//               >
//                 No
//               </button>
//               <button
//                 type="button"
//                 disabled={isSubmitting}
//                 onClick={handleConfirmDelete}
//                 className="flex w-32 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 py-2.5 text-base font-bold text-white shadow-xs transition-all hover:brightness-105 active:scale-95 disabled:opacity-50"
//               >
//                 {isSubmitting ? (
//                   <Loader2 size={18} className="animate-spin" />
//                 ) : (
//                   <span>Yes</span>
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* LENE / DENE TRANSACTION MODAL */}
//       {(activeModal === "LENE" || activeModal === "DENE") && (
//         <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-xs p-0 sm:items-center sm:p-4">
//           <div className="flex h-full w-full max-w-md flex-col overflow-hidden border border-slate-200 bg-white shadow-2xl sm:h-auto sm:rounded-2xl">
//             <div className="relative flex items-center justify-center border-b border-slate-100 bg-white px-4 py-3.5">
//               <button
//                 type="button"
//                 disabled={isSubmitting}
//                 onClick={handleModalClose}
//                 className="absolute left-4 p-1 text-ink-500 transition-colors hover:text-ink-900 active:scale-95 disabled:opacity-50"
//                 aria-label="Back"
//               >
//                 <ArrowLeft size={20} />
//               </button>

//               <h2
//                 className={`flex items-center gap-1 text-base font-extrabold ${
//                   activeModal === "LENE" ? "text-debit-600" : "text-credit-700"
//                 }`}
//               >
//                 <span>₹</span>
//                 <span>{activeModal === "LENE" ? "Lene" : "Dene"}</span>
//                 <span>-</span>
//                 <span className="truncate max-w-[150px]">{customer?.customer_name}</span>
//               </h2>
//             </div>

//             <form onSubmit={handleEntrySubmit} className="flex flex-col gap-4 p-5 sm:p-6">
//               <div className="space-y-1">
//                 <div className="relative flex items-center rounded-xl border border-slate-200 bg-white px-3.5 py-3 transition-all focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-brand-600/15">
//                   <input
//                     type="number"
//                     step="any"
//                     required
//                     disabled={isSubmitting}
//                     value={amountInput}
//                     onChange={(e) => {
//                       if (e.target.value.length <= 9) {
//                         setAmountInput(e.target.value);
//                       }
//                     }}
//                     placeholder="Enter Amount"
//                     className="w-full bg-transparent text-sm font-semibold text-ink-900 outline-none placeholder:font-bold placeholder:text-ink-300 disabled:opacity-50"
//                   />
//                   <div className="flex flex-col pl-2 text-[10px] text-ink-300 select-none cursor-pointer">
//                     <span>▲</span>
//                     <span>▼</span>
//                   </div>
//                 </div>
//                 <div className="text-right text-[11px] font-medium text-ink-300">
//                   {amountInput.length}/9
//                 </div>
//               </div>

//               <div className="space-y-1">
//                 <div className="relative rounded-xl border border-slate-200 bg-white px-3.5 py-3 transition-all focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-brand-600/15">
//                   <input
//                     type="text"
//                     maxLength={36}
//                     disabled={isSubmitting}
//                     value={detailsInput}
//                     onChange={(e) => setDetailsInput(e.target.value)}
//                     placeholder="Enter Details (e.g. Cash received)"
//                     className="w-full bg-transparent text-sm font-medium text-ink-900 outline-none placeholder:text-ink-300 disabled:opacity-50"
//                   />
//                 </div>
//                 <div className="text-right text-[11px] font-medium text-ink-300">
//                   {detailsInput.length}/36
//                 </div>
//               </div>

//               <button
//                 type="submit"
//                 disabled={isSubmitting}
//                 className={`mt-2 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white shadow-md transition-all active:scale-[0.99] disabled:opacity-50 ${
//                   activeModal === "LENE"
//                     ? "bg-gradient-to-r from-debit-600 to-debit-500 hover:brightness-105"
//                     : "bg-gradient-to-r from-credit-600 to-credit-500 hover:brightness-105"
//                 }`}
//               >
//                 {isSubmitting ? (
//                   <>
//                     <Loader2 size={16} className="animate-spin" />
//                     <span>Saving...</span>
//                   </>
//                 ) : (
//                   <span>Save</span>
//                 )}
//               </button>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Pencil,
  FileText,
  Trash2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-toastify";

// --- API Data Interfaces ---
interface TransactionApiData {
  transaction_id: string;
  khata_customer_id: string;
  created_by?: string;
  transaction_type: "LENE" | "DENE";
  amount: string;
  transaction_date?: string;
  description: string;
  reference_number?: string | null;
  created_at: string;
  updated_at?: string;
  running_balance: string | number;
  customer_name?: string;
}

interface CustomerApiData {
  khata_customer_id: string;
  khata_id: string;
  customer_id: string;
  customer_name: string;
  mobile_number: string;
  address?: string;
  khata_name?: string;
  is_active?: boolean;
  total_lene: string | number;
  total_dene: string | number;
  net_balance: string | number;
  net_status?: string;
  last_activity_date?: string | null;
  created_at?: string;
}

// --- UI Models ---
interface Entry {
  id: string;
  title: string;
  date: string;
  subPerson?: string;
  balance: string;
  leneAmount?: string;
  deneAmount?: string;
  tag?: string;
  status?: string;
}

type ModalType =
  | "LENE"
  | "DENE"
  | "EDIT_CUSTOMER"
  | "DELETE_CONFIRM"
  | "MONDAY_FINAL_CONFIRM"
  | null;

export default function CustomerDetail() {
  const { khataCustomerId } = useParams<{ khataCustomerId: string }>();
  const navigate = useNavigate();

  // Component States
  const [entries, setEntries] = useState<Entry[]>([]);
  const [customer, setCustomer] = useState<CustomerApiData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState<boolean>(false);

  // Active Modal State
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  // Lene/Dene Form State
  const [amountInput, setAmountInput] = useState<string>("");
  const [detailsInput, setDetailsInput] = useState<string>("");

  // Customer Profile Edit Form State
  const [customerName, setCustomerName] = useState<string>("");
  const [customerPhone, setCustomerPhone] = useState<string>("");
  const [customerAddress, setCustomerAddress] = useState<string>("");

  // Utility to generate Auth headers
  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }, []);

  // Format date string for UI display
  const formatDateString = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date
        .toLocaleString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
        .replace(/\//g, "-")
        .toUpperCase();
    } catch {
      return dateStr;
    }
  };

  // Map backend API transaction to UI Entry shape
  const mapTransactionToEntry = (tx: TransactionApiData): Entry => {
    const numAmount = parseFloat(String(tx.amount || "0")).toLocaleString("en-IN");
    const numBalance = parseFloat(String(tx.running_balance || "0")).toLocaleString("en-IN");

    return {
      id: tx.transaction_id,
      title: tx.description || (tx.transaction_type === "LENE" ? "Lene Entry" : "Dene Entry"),
      date: formatDateString(tx.created_at || tx.transaction_date || new Date().toISOString()),
      balance: numBalance,
      ...(tx.transaction_type === "LENE"
        ? { leneAmount: numAmount }
        : { deneAmount: numAmount }),
      tag: "N",
    };
  };

  // GET API: Fetch customer details and then fetch transactions using customer_id (partyId)
  const fetchCustomerAndTransactions = useCallback(async () => {
    if (!khataCustomerId) {
      toast.error("Invalid customer identifier.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const headers = getAuthHeaders();

      // Step 1: Retrieve customer party metadata
      const customerRes = await fetch(
        `http://192.168.0.158:5000/api/parties/${khataCustomerId}`,
        {
          method: "GET",
          headers,
        }
      );

      const customerData = await customerRes.json();

      if (!customerRes.ok || !customerData.success || !customerData.data) {
        toast.error(customerData.message || "Failed to load customer profile.");
        setIsLoading(false);
        return;
      }

      const partyRecord: CustomerApiData = customerData.data;
      setCustomer(partyRecord);
      setCustomerName(partyRecord.customer_name || "");
      setCustomerPhone(partyRecord.mobile_number || "");
      setCustomerAddress(partyRecord.address || "");

      // Step 2: Retrieve transactions using customer_id (partyId)
      const partyId = partyRecord.customer_id;

      if (!partyId) {
        toast.error("Party customer ID not found on customer record.");
        setIsLoading(false);
        return;
      }

      const transactionsRes = await fetch(
        `http://192.168.0.158:5000/api/transactions/party/${partyId}`,
        {
          method: "GET",
          headers,
        }
      );

      const transactionsData = await transactionsRes.json();

      if (transactionsRes.ok && transactionsData.success) {
        if (transactionsData.customer) {
          setCustomer((prev) => ({
            ...prev,
            ...transactionsData.customer,
            address: prev?.address || transactionsData.customer.address || "",
          }));
        }

        if (Array.isArray(transactionsData.data)) {
          const mappedEntries = transactionsData.data.map((tx: TransactionApiData) =>
            mapTransactionToEntry(tx)
          );
          setEntries(mappedEntries);
        } else {
          setEntries([]);
        }
      } else {
        toast.error(transactionsData.message || "Failed to load transactions.");
      }
    } catch (error) {
      console.error("Fetch Details Error:", error);
      toast.error("Unable to connect to the server.");
    } finally {
      setIsLoading(false);
    }
  }, [khataCustomerId, getAuthHeaders]);

  useEffect(() => {
    fetchCustomerAndTransactions();
  }, [fetchCustomerAndTransactions]);

  const handleModalClose = () => {
    setActiveModal(null);
    setAmountInput("");
    setDetailsInput("");
  };

  const handleOpenModal = (type: ModalType) => {
    setAmountInput("");
    setDetailsInput("");
    setActiveModal(type);
  };

  // GET API: Download PDF Statement
  const handleDownloadPdf = async () => {
    const partyId = customer?.customer_id;
    if (!partyId) {
      toast.error("Customer party ID not found.");
      return;
    }

    setIsDownloadingPdf(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://192.168.0.158:5000/api/reports/party/${partyId}/statement`,
        {
          method: "GET",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      if (!response.ok) {
        try {
          const errorJson = await response.json();
          toast.error(errorJson.message || "Failed to download statement.");
        } catch {
          toast.error("Failed to download statement.");
        }
        return;
      }

      // Convert response to Blob and download file
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      const fileName = `${(customer?.customer_name || "customer").replace(/\s+/g, "_")}_statement.pdf`;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      toast.success("Statement downloaded successfully!");
    } catch (error) {
      console.error("PDF Download Error:", error);
      toast.error("Unable to download PDF statement.");
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  // POST API: Create LENE or DENE Transaction
  const handleEntrySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsedAmount = parseFloat(amountInput);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error("Please enter a valid amount greater than zero.");
      return;
    }

    if (!activeModal || (activeModal !== "LENE" && activeModal !== "DENE")) {
      return;
    }

    if (!khataCustomerId) {
      toast.error("Customer ID is missing.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        khata_customer_id: khataCustomerId,
        amount: parsedAmount,
        transaction_type: activeModal,
        description: detailsInput.trim() || (activeModal === "LENE" ? "Amount Diya" : "Amount Liya"),
      };

      const response = await fetch("http://192.168.0.158:5000/api/transactions", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(data.message || `${activeModal === "LENE" ? "Lene" : "Dene"} transaction added successfully!`);
        handleModalClose();
        fetchCustomerAndTransactions();
      } else {
        toast.error(data.message || "Failed to add transaction.");
      }
    } catch (error) {
      console.error("Transaction Submission Error:", error);
      toast.error("Unable to connect to the server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // PUT/PATCH API: Handle Edit Customer Update
  const handleCustomerUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim()) {
      toast.error("Customer name cannot be empty.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `http://192.168.0.158:5000/api/parties/${khataCustomerId}`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            customer_name: customerName.trim(),
            mobile_number: customerPhone.trim(),
            address: customerAddress.trim(),
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(data.message || "Customer updated successfully!");
        handleModalClose();
        fetchCustomerAndTransactions();
      } else {
        toast.error(data.message || "Failed to update customer.");
      }
    } catch (error) {
      console.error("Customer Update Error:", error);
      toast.error("Unable to connect to the server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // DELETE API: Delete Customer
  const handleConfirmDelete = async () => {
    if (!khataCustomerId) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `http://192.168.0.158:5000/api/parties/${khataCustomerId}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(data.message || "Customer deleted successfully.");
        handleModalClose();
        navigate(-1);
      } else {
        toast.error(data.message || "Failed to delete customer.");
      }
    } catch (error) {
      console.error("Customer Delete Error:", error);
      toast.error("Unable to connect to the server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // POST API: Monday Final Submission
  const handleMondayFinalSubmit = async () => {
    const partyId = customer?.customer_id;
    if (!partyId) {
      toast.error("Customer party ID not found.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("http://192.168.0.158:5000/api/monday-final", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          party_id: partyId,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(data.message || "Monday Final completed successfully!");
        handleModalClose();
        fetchCustomerAndTransactions();
      } else {
        toast.error(data.message || "Failed to complete Monday Final.");
      }
    } catch (error) {
      console.error("Monday Final Error:", error);
      toast.error("Unable to connect to the server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate closing balance display value
  const netBalNum = customer ? parseFloat(String(customer.net_balance || "0")) : 0;
  const formattedNetBalance = Math.abs(netBalNum).toLocaleString("en-IN");

  return (
    <div className="-m-2 flex min-h-[calc(100vh-4rem)] w-full flex-col rounded-2xl border border-slate-200 bg-white pb-24 shadow-card sm:-m-4 md:-m-6 lg:-m-8">
      {/* 1. TOP NAVBAR */}
      <header className="sticky top-0 z-20 flex w-full items-center justify-between rounded-t-2xl border-b border-slate-100 bg-white px-4 py-3.5 shadow-xs">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="rounded-lg p-1.5 text-ink-500 transition-colors hover:bg-slate-100 active:scale-95"
          aria-label="Back"
        >
          <ArrowLeft size={20} />
        </button>

        {/* Customer Name with Edit Pen Icon */}
        <button
          type="button"
          onClick={() => handleOpenModal("EDIT_CUSTOMER")}
          className="flex items-center gap-1.5 font-bold text-brand-900 transition-opacity hover:opacity-80 active:scale-95 sm:text-lg"
        >
          <Pencil size={15} className="text-brand-700" />
          <span>{customer?.customer_name || "Loading..."}</span>
        </button>

        {/* PDF Download Icon Button */}
        <button
          type="button"
          disabled={isDownloadingPdf || !customer?.customer_id}
          onClick={handleDownloadPdf}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-brand-700 bg-brand-50 text-brand-800 transition-colors hover:bg-brand-700 hover:text-white disabled:opacity-50"
          aria-label="Download Statement"
          title="Download Statement PDF"
        >
          {isDownloadingPdf ? (
            <Loader2 size={18} className="animate-spin text-brand-700" />
          ) : (
            <FileText size={18} />
          )}
        </button>
      </header>

      {/* 2. OPENING & CLOSING BALANCE BANNER */}
      <div className="border-b border-slate-100 bg-slate-50/60 px-4 py-2.5 sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between py-1">
          <div className="text-sm font-bold text-credit-600 sm:text-base">₹ 0</div>
          <div className="text-xs font-bold text-brand-900 sm:text-sm">Opening</div>
        </div>

        <div className="mx-auto flex max-w-6xl items-center justify-between border-t border-slate-200 pt-2 pb-1">
          <div className="text-base font-black text-brand-900 sm:text-lg">Closing</div>
          <div
            className={`text-base font-black sm:text-lg ${
              netBalNum > 0
                ? "text-credit-600"
                : netBalNum < 0
                ? "text-debit-600"
                : "text-ink-900"
            }`}
          >
            ₹ {formattedNetBalance}
          </div>
        </div>
      </div>

      {/* 3. FILTER / ACTION BANNER BAR */}
      <div className="w-full bg-gradient-to-r from-brand-700 via-brand-600 to-violet-700 px-4 py-2.5 shadow-inner">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => handleOpenModal("MONDAY_FINAL_CONFIRM")}
            className="rounded-lg bg-white/15 px-4 py-1.5 text-xs font-bold text-white shadow-sm ring-1 ring-white/20 transition-all hover:bg-white/25 active:scale-95 sm:text-sm"
          >
            Monday Final
          </button>

          <button
            type="button"
            className="rounded-lg border border-white/40 bg-white/10 px-4 py-1.5 text-xs font-bold text-white shadow-xs backdrop-blur-xs transition-all hover:bg-white/20 active:scale-95 sm:text-sm"
          >
            Last Week Record
          </button>
        </div>
      </div>

      {/* 4. MAIN CONTENT & ENTRIES TABLE */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-3 py-4 sm:px-6">
        <div className="grid grid-cols-12 px-3 py-2 text-[11px] font-extrabold uppercase tracking-wider text-ink-500 sm:text-xs">
          <div className="col-span-6 sm:col-span-5">Entries</div>
          <div className="col-span-3 text-center sm:col-span-3">Lene</div>
          <div className="col-span-3 pr-2 text-right sm:col-span-4">Dene</div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
            <Loader2 size={24} className="animate-spin text-brand-600" />
            <span className="text-xs font-medium">Loading ledger transactions...</span>
          </div>
        ) : entries.length > 0 ? (
          <div className="space-y-2.5">
            {entries.map((item) => (
              <div
                key={item.id}
                className="relative grid grid-cols-12 items-center rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs transition-all hover:border-brand-200 hover:shadow-sm"
              >
                <div className="col-span-6 space-y-0.5 sm:col-span-5">
                  <div className="text-xs font-bold text-ink-900 sm:text-sm">{item.title}</div>
                  <div className="text-[10px] font-medium text-ink-300 sm:text-xs">{item.date}</div>
                  {item.subPerson && (
                    <div className="text-xs font-bold text-brand-800">{item.subPerson}</div>
                  )}
                  <div className="text-[11px] font-bold text-debit-600 sm:text-xs">
                    Bal. ₹ {item.balance}
                  </div>
                </div>

                <div className="col-span-3 text-center">
                  {item.leneAmount && (
                    <span className="text-xs font-black text-debit-600 sm:text-sm">
                      ₹ {item.leneAmount}
                    </span>
                  )}
                </div>

                <div className="col-span-3 flex items-center justify-end gap-2 pr-1 sm:col-span-4">
                  {item.deneAmount && (
                    <span className="text-xs font-black text-credit-600 sm:text-sm">
                      ₹ {item.deneAmount}
                    </span>
                  )}

                  <div className="flex flex-col items-end">
                    {item.tag && (
                      <span className="text-[11px] font-extrabold text-debit-600">{item.tag}</span>
                    )}
                    {item.status && (
                      <span className="text-[9px] font-bold tracking-tight text-brand-900">
                        {item.status}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 py-16 text-center text-slate-400">
            <AlertCircle size={32} className="stroke-1 text-slate-300" />
            <p className="mt-2 text-sm font-medium">No transactions recorded yet.</p>
            <p className="text-xs text-slate-400">Use LENE or DENE to add your first entry.</p>
          </div>
        )}
      </main>

      {/* 5. BOTTOM ACTION BUTTONS */}
      <footer className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white/85 p-2 backdrop-blur-md sm:p-4 lg:left-72">
        <div className="mx-auto flex max-w-6xl gap-3">
          <button
            type="button"
            onClick={() => handleOpenModal("LENE")}
            className="flex flex-1 flex-col items-center justify-center rounded-xl bg-gradient-to-r from-debit-600 to-debit-500 py-2.5 text-white shadow-md transition-all hover:brightness-105 active:scale-[0.98]"
          >
            <span className="text-xs font-black uppercase tracking-wide sm:text-sm">LENE ₹</span>
            <span className="text-[10px] font-medium opacity-90 sm:text-xs">Amount Diya</span>
          </button>

          <button
            type="button"
            onClick={() => handleOpenModal("DENE")}
            className="flex flex-1 flex-col items-center justify-center rounded-xl bg-gradient-to-r from-credit-600 to-credit-500 py-2.5 text-white shadow-md transition-all hover:brightness-105 active:scale-[0.98]"
          >
            <span className="text-xs font-black uppercase tracking-wide sm:text-sm">DENE ₹</span>
            <span className="text-[10px] font-medium opacity-90 sm:text-xs">Amount Liya</span>
          </button>
        </div>
      </footer>

      {/* 6. POPUP MODALS */}

      {/* MONDAY FINAL CONFIRMATION MODAL */}
      {activeModal === "MONDAY_FINAL_CONFIRM" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-7 text-center shadow-2xl transition-all sm:p-8">
            <h3 className="text-2xl font-bold text-ink-800 sm:text-3xl">Monday Final</h3>
            <p className="mt-4 text-sm leading-relaxed text-ink-500 sm:text-base">
              You realy want to Monday Final. After this you are not able to update
              this customer Transaction and all Transactions of this user in Recycle
              bin will be deleted
            </p>

            <div className="mt-7 flex items-center justify-center gap-3 sm:gap-4">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleModalClose}
                className="w-28 rounded-lg bg-slate-300/80 py-2.5 text-sm font-semibold text-white shadow-xs transition-all hover:bg-slate-400 active:scale-95 disabled:opacity-50 sm:w-32 sm:text-base"
              >
                No
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleMondayFinalSubmit}
                className="flex w-28 items-center justify-center gap-1.5 rounded-lg bg-[#DE6551] py-2.5 text-sm font-semibold text-white shadow-xs transition-all hover:bg-[#cf5642] active:scale-95 disabled:opacity-50 sm:w-32 sm:text-base"
              >
                {isSubmitting ? (
                  <Loader2 size={18} className="animate-spin text-white" />
                ) : (
                  <span>Yes</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT CUSTOMER MODAL */}
      {activeModal === "EDIT_CUSTOMER" && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-xs p-0 sm:items-center sm:p-4">
          <div className="flex h-full w-full max-w-md flex-col overflow-hidden border border-slate-200 bg-white shadow-2xl sm:h-auto sm:rounded-2xl">
            <div className="relative flex items-center justify-center border-b border-slate-100 bg-white px-4 py-3.5">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleModalClose}
                className="absolute left-4 p-1 text-ink-500 transition-colors hover:text-ink-900 active:scale-95 disabled:opacity-50"
                aria-label="Back"
              >
                <ArrowLeft size={20} />
              </button>

              <h2 className="text-base font-extrabold text-ink-900">Edit Customer</h2>
            </div>

            <form onSubmit={handleCustomerUpdate} className="flex flex-col gap-4 p-5 sm:p-6">
              <div className="space-y-1">
                <div className="relative rounded-xl border border-slate-200 bg-white px-3.5 py-3 transition-all focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-brand-600/15">
                  <input
                    type="text"
                    maxLength={36}
                    required
                    disabled={isSubmitting}
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter Customer Name"
                    className="w-full bg-transparent text-sm font-semibold text-ink-900 outline-none placeholder:text-ink-300 disabled:opacity-50"
                  />
                </div>
                <div className="text-right text-[11px] font-medium text-ink-300">
                  {customerName.length}/36
                </div>
              </div>

              <div className="relative flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3.5 py-3 transition-all focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-brand-600/15">
                <div className="flex items-center gap-1 border-r border-slate-200 pr-3">
                  <span className="inline-block text-xs font-bold text-ink-700">🇮🇳 +91</span>
                  <span className="text-[10px] text-ink-500">▼</span>
                </div>
                <input
                  type="tel"
                  disabled={isSubmitting}
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Enter Phone Number"
                  className="w-full bg-transparent text-sm font-semibold text-ink-900 outline-none placeholder:text-ink-300 disabled:opacity-50"
                />
              </div>

              <div className="space-y-1">
                <div className="relative rounded-xl border border-slate-200 bg-white px-3.5 py-3 transition-all focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-brand-600/15">
                  <input
                    type="text"
                    maxLength={36}
                    disabled={isSubmitting}
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    placeholder="Enter Address"
                    className="w-full bg-transparent text-sm font-medium text-ink-900 outline-none placeholder:text-ink-300 disabled:opacity-50"
                  />
                </div>
                <div className="text-right text-[11px] font-medium text-ink-300">
                  {customerAddress.length}/36
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-800 to-violet-600 py-3 text-sm font-bold text-white shadow-md transition-all hover:from-violet-700 hover:to-violet-500 active:scale-[0.99] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Updating...</span>
                  </>
                ) : (
                  <span>Update Customer</span>
                )}
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setActiveModal("DELETE_CONFIRM")}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 py-3 text-sm font-bold text-white shadow-md transition-all hover:brightness-105 active:scale-[0.99] disabled:opacity-50"
              >
                <Trash2 size={16} />
                <span>Delete Customer</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION POPUP MODAL */}
      {activeModal === "DELETE_CONFIRM" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-8 text-center shadow-2xl transition-all">
            <h3 className="text-3xl font-extrabold text-ink-900 sm:text-4xl">Are you sure?</h3>
            <p className="mt-4 text-sm font-medium leading-relaxed text-ink-500 sm:text-base">
              Do you want to delete this customer? All transaction records associated with this customer will be deleted.
            </p>

            <div className="mt-8 flex items-center justify-center gap-4">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setActiveModal("EDIT_CUSTOMER")}
                className="w-32 rounded-xl bg-slate-200 py-2.5 text-base font-bold text-ink-700 shadow-xs transition-all hover:bg-slate-300 active:scale-95 disabled:opacity-50"
              >
                No
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmDelete}
                className="flex w-32 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 py-2.5 text-base font-bold text-white shadow-xs transition-all hover:brightness-105 active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <span>Yes</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LENE / DENE TRANSACTION MODAL */}
      {(activeModal === "LENE" || activeModal === "DENE") && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-xs p-0 sm:items-center sm:p-4">
          <div className="flex h-full w-full max-w-md flex-col overflow-hidden border border-slate-200 bg-white shadow-2xl sm:h-auto sm:rounded-2xl">
            <div className="relative flex items-center justify-center border-b border-slate-100 bg-white px-4 py-3.5">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleModalClose}
                className="absolute left-4 p-1 text-ink-500 transition-colors hover:text-ink-900 active:scale-95 disabled:opacity-50"
                aria-label="Back"
              >
                <ArrowLeft size={20} />
              </button>

              <h2
                className={`flex items-center gap-1 text-base font-extrabold ${
                  activeModal === "LENE" ? "text-debit-600" : "text-credit-700"
                }`}
              >
                <span>₹</span>
                <span>{activeModal === "LENE" ? "Lene" : "Dene"}</span>
                <span>-</span>
                <span className="truncate max-w-[150px]">{customer?.customer_name}</span>
              </h2>
            </div>

            <form onSubmit={handleEntrySubmit} className="flex flex-col gap-4 p-5 sm:p-6">
              <div className="space-y-1">
                <div className="relative flex items-center rounded-xl border border-slate-200 bg-white px-3.5 py-3 transition-all focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-brand-600/15">
                  <input
                    type="number"
                    step="any"
                    required
                    disabled={isSubmitting}
                    value={amountInput}
                    onChange={(e) => {
                      if (e.target.value.length <= 9) {
                        setAmountInput(e.target.value);
                      }
                    }}
                    placeholder="Enter Amount"
                    className="w-full bg-transparent text-sm font-semibold text-ink-900 outline-none placeholder:font-bold placeholder:text-ink-300 disabled:opacity-50"
                  />
                  <div className="flex flex-col pl-2 text-[10px] text-ink-300 select-none cursor-pointer">
                    <span>▲</span>
                    <span>▼</span>
                  </div>
                </div>
                <div className="text-right text-[11px] font-medium text-ink-300">
                  {amountInput.length}/9
                </div>
              </div>

              <div className="space-y-1">
                <div className="relative rounded-xl border border-slate-200 bg-white px-3.5 py-3 transition-all focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-brand-600/15">
                  <input
                    type="text"
                    maxLength={36}
                    disabled={isSubmitting}
                    value={detailsInput}
                    onChange={(e) => setDetailsInput(e.target.value)}
                    placeholder="Enter Details (e.g. Cash received)"
                    className="w-full bg-transparent text-sm font-medium text-ink-900 outline-none placeholder:text-ink-300 disabled:opacity-50"
                  />
                </div>
                <div className="text-right text-[11px] font-medium text-ink-300">
                  {detailsInput.length}/36
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`mt-2 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white shadow-md transition-all active:scale-[0.99] disabled:opacity-50 ${
                  activeModal === "LENE"
                    ? "bg-gradient-to-r from-debit-600 to-debit-500 hover:brightness-105"
                    : "bg-gradient-to-r from-credit-600 to-credit-500 hover:brightness-105"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}