
// import { useState, useEffect } from "react";
// import { Plus, BookOpen, Check, Eye, Loader2 } from "lucide-react";
// import { toast } from "react-toastify";

// interface KhataData {
//   khata_id: string;
//   user_id: string;
//   khata_name: string;
//   description: string | null;
//   is_active: boolean;
//   created_at: string;
//   updated_at: string;
// }

// interface KhataItem {
//   id: string;
//   name: string;
//   avatarText: string;
// }

// const API_KHATAS_URL = "http://192.168.0.158:5000/api/khatas";

// export default function KhataList() {
//   const [khatas, setKhatas] = useState<KhataItem[]>([]);
//   const [selectedKhataId, setSelectedKhataId] = useState<string>("");
//   const [isFetching, setIsFetching] = useState<boolean>(true);

//   // State for Create New Khata Modal
//   const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
//   const [newKhataName, setNewKhataName] = useState("");
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   // Helper function to extract initials from name
//   const getInitials = (name: string): string => {
//     const words = name.trim().split(/\s+/);
//     if (words.length === 1) {
//       return words[0].slice(0, 3).toUpperCase();
//     }
//     return words
//       .map((w) => w[0])
//       .join("")
//       .toUpperCase()
//       .slice(0, 3);
//   };

//   // Helper function to get authorization headers
//   const getAuthHeaders = () => {
//     const token = localStorage.getItem("token");
//     return {
//       "Content-Type": "application/json",
//       ...(token ? { Authorization: `Bearer ${token}` } : {}),
//     };
//   };

//   // GET API: Fetch Khatas list
//   const fetchKhatas = async () => {
//     setIsFetching(true);
//     try {
//       const response = await fetch(API_KHATAS_URL, {
//         method: "GET",
//         headers: getAuthHeaders(),
//       });

//       const data = await response.json();

//       if (response.ok && data.success && Array.isArray(data.data)) {
//         const mappedKhatas: KhataItem[] = data.data.map((item: KhataData) => ({
//           id: item.khata_id,
//           name: item.khata_name,
//           avatarText: getInitials(item.khata_name),
//         }));

//         setKhatas(mappedKhatas);

//         if (mappedKhatas.length > 0) {
//           // Keep existing selection if valid, otherwise select the first
//           setSelectedKhataId((prev) =>
//             mappedKhatas.some((k) => k.id === prev) ? prev : mappedKhatas[0].id
//           );
//         }
//       } else {
//         toast.error(data.message || "Failed to load Khatas.");
//       }
//     } catch (error) {
//       console.error("Fetch Khatas Error:", error);
//       toast.error("Unable to connect to the server. Please check network.");
//     } finally {
//       setIsFetching(false);
//     }
//   };

//   useEffect(() => {
//     fetchKhatas();
//   }, []);

//   // POST API: Create New Khata
//   const handleCreateKhataSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!newKhataName.trim()) {
//       toast.error("Please enter a valid Khata name.");
//       return;
//     }

//     setIsSubmitting(true);

//     try {
//       const response = await fetch(API_KHATAS_URL, {
//         method: "POST",
//         headers: getAuthHeaders(),
//         body: JSON.stringify({
//           khata_name: newKhataName.trim(),
//         }),
//       });

//       const data = await response.json();

//       if (response.ok && data.success && data.data) {
//         toast.success(data.message || "Khata created successfully!");

//         const createdItem: KhataItem = {
//           id: data.data.khata_id,
//           name: data.data.khata_name,
//           avatarText: getInitials(data.data.khata_name),
//         };

//         setKhatas((prev) => [...prev, createdItem]);
//         setSelectedKhataId(createdItem.id);
//         setNewKhataName("");
//         setIsCreateModalOpen(false);
//       } else {
//         toast.error(data.message || "Failed to create Khata.");
//       }
//     } catch (error) {
//       console.error("Create Khata Error:", error);
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
//           Your Khatas
//         </h1>
//         <p className="text-xs font-medium text-ink-500 sm:text-sm">
//           Switch between businesses or create a brand new ledger book.
//         </p>
//       </div>

//       <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
//         {/* Khata list */}
//         <div className="rounded-2xl border border-slate-200 bg-white shadow-card lg:col-span-2">
//           <div className="border-b border-slate-100 px-4 py-3.5 sm:px-5">
//             <h2 className="text-sm font-bold text-ink-900 sm:text-base">All Khatas</h2>
//           </div>

//           <div className="divide-y divide-slate-100 p-2 sm:p-3">
//             {isFetching ? (
//               <div className="flex items-center justify-center py-10 text-slate-400 gap-2 text-sm">
//                 <Loader2 size={18} className="animate-spin text-brand-600" />
//                 <span>Loading your Khatas...</span>
//               </div>
//             ) : khatas.length === 0 ? (
//               <div className="py-8 text-center text-xs font-medium text-slate-400 sm:text-sm">
//                 No Khatas found. Create your first Khata to get started!
//               </div>
//             ) : (
//               khatas.map((khata) => {
//                 const isSelected = khata.id === selectedKhataId;
//                 return (
//                   <button
//                     key={khata.id}
//                     type="button"
//                     onClick={() => setSelectedKhataId(khata.id)}
//                     className={`flex w-full items-center gap-3.5 rounded-xl p-3.5 text-left transition-all ${
//                       isSelected ? "bg-brand-50/70 ring-1 ring-brand-200" : "hover:bg-slate-50"
//                     }`}
//                   >
//                     {/* Circle Initials Badge */}
//                     <div
//                       className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xs font-bold shadow-inner ${
//                         isSelected
//                           ? "bg-gradient-to-br from-brand-600 to-violet-600 text-white"
//                           : "bg-slate-200 text-ink-700"
//                       }`}
//                     >
//                       {khata.avatarText}
//                     </div>

//                     {/* Khata Name */}
//                     <span className="flex-1 truncate text-sm font-bold text-ink-900 sm:text-base">
//                       {khata.name}
//                     </span>

//                     {isSelected && (
//                       <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white">
//                         <Check size={13} />
//                       </span>
//                     )}
//                   </button>
//                 );
//               })
//             )}
//           </div>
//         </div>

//         {/* Create new khata card */}
//         <div className="rounded-2xl border border-dashed border-brand-300 bg-brand-50/40 p-5 text-center shadow-sm">
//           <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-brand-600 shadow-sm">
//             <BookOpen size={22} />
//           </div>
//           <h3 className="mt-3 text-sm font-bold text-ink-900">Start a new khata</h3>
//           <p className="mt-1 text-xs font-medium text-ink-500">
//             Keep a separate ledger for each of your shops or businesses.
//           </p>
//           <button
//             type="button"
//             onClick={() => setIsCreateModalOpen(true)}
//             className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-800 to-violet-600 py-3 text-xs font-bold text-white shadow-md transition-all hover:from-violet-700 hover:to-violet-500 active:scale-[0.99] sm:text-sm"
//           >
//             <Plus size={16} />
//             <span>Create New Khata</span>
//           </button>
//         </div>
//       </div>

//       {/* CREATE NEW KHATA POPUP MODAL */}
//       {isCreateModalOpen && (
//         <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-xs p-0 sm:items-center sm:p-4">
//           <div className="flex h-full w-full max-w-md flex-col overflow-hidden border border-slate-200 bg-white shadow-2xl sm:h-auto sm:rounded-2xl">
//             {/* Modal Header */}
//             <div className="relative flex items-center justify-center border-b border-slate-100 bg-white px-4 py-3.5 text-ink-700">
//               <h2 className="text-sm font-bold text-ink-900 sm:text-base">New Khata</h2>
//             </div>

//             {/* Modal Form Body */}
//             <form onSubmit={handleCreateKhataSubmit} className="flex flex-col gap-4 p-5 sm:p-6">
//               {/* Input Field with Character Counter */}
//               <div className="space-y-1">
//                 <div className="relative rounded-xl border border-slate-200 bg-white px-3.5 py-3 transition-all focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-brand-600/15">
//                   <input
//                     type="text"
//                     maxLength={20}
//                     required
//                     disabled={isSubmitting}
//                     value={newKhataName}
//                     onChange={(e) => setNewKhataName(e.target.value)}
//                     placeholder="Enter Shop/Business Name"
//                     className="w-full bg-transparent text-sm font-medium text-ink-900 outline-none placeholder:text-ink-300 disabled:opacity-50"
//                   />
//                 </div>
//                 <div className="text-right text-[11px] font-medium text-ink-300">
//                   {newKhataName.length}/20
//                 </div>
//               </div>

//               {/* Create Primary Button */}
//               <button
//                 type="submit"
//                 disabled={isSubmitting}
//                 className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-800 to-violet-600 py-3 text-xs font-bold text-white shadow-md transition-all hover:from-violet-700 hover:to-violet-500 active:scale-[0.99] disabled:opacity-50 sm:text-sm"
//               >
//                 {isSubmitting ? (
//                   <>
//                     <Loader2 size={16} className="animate-spin" />
//                     <span>Creating...</span>
//                   </>
//                 ) : (
//                   <span>Create</span>
//                 )}
//               </button>

//               {/* View Khata Secondary Button */}
//               <button
//                 type="button"
//                 onClick={() => setIsCreateModalOpen(false)}
//                 disabled={isSubmitting}
//                 className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-brand-800 transition-all hover:bg-slate-50 active:scale-[0.99] disabled:opacity-50 sm:text-sm"
//               >
//                 <Eye size={16} />
//                 <span>View Khata</span>
//               </button>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }


import { useState, useEffect } from "react";
import { Plus, BookOpen, Check, Eye, Loader2 } from "lucide-react";
import { toast } from "react-toastify";

interface KhataData {
  khata_id: string;
  user_id: string;
  khata_name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface KhataItem {
  id: string;
  name: string;
  avatarText: string;
}

const API_KHATAS_URL = "http://192.168.0.158:5000/api/khatas";

export default function KhataList() {
  const [khatas, setKhatas] = useState<KhataItem[]>([]);
  
  // Read initial selected ID from localStorage
  const [selectedKhataId, setSelectedKhataId] = useState<string>(
    () => localStorage.getItem("khataId") || ""
  );
  
  const [isFetching, setIsFetching] = useState<boolean>(true);

  // State for Create New Khata Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newKhataName, setNewKhataName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper to handle selection and persist to localStorage
  const handleSelectKhata = (id: string) => {
    setSelectedKhataId(id);
    localStorage.setItem("khataId", id);
  };

  // Helper function to extract initials from name
  const getInitials = (name: string): string => {
    const words = name.trim().split(/\s+/);
    if (words.length === 1) {
      return words[0].slice(0, 3).toUpperCase();
    }
    return words
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 3);
  };

  // Helper function to get authorization headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  // GET API: Fetch Khatas list
  const fetchKhatas = async () => {
    setIsFetching(true);
    try {
      const response = await fetch(API_KHATAS_URL, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (response.ok && data.success && Array.isArray(data.data)) {
        const mappedKhatas: KhataItem[] = data.data.map((item: KhataData) => ({
          id: item.khata_id,
          name: item.khata_name,
          avatarText: getInitials(item.khata_name),
        }));

        setKhatas(mappedKhatas);

        if (mappedKhatas.length > 0) {
          // Keep existing valid selection, or select the first item and persist it
          setSelectedKhataId((prev) => {
            const exists = mappedKhatas.some((k) => k.id === prev);
            const activeId = exists ? prev : mappedKhatas[0].id;
            localStorage.setItem("khataId", activeId);
            return activeId;
          });
        }
      } else {
        toast.error(data.message || "Failed to load Khatas.");
      }
    } catch (error) {
      console.error("Fetch Khatas Error:", error);
      toast.error("Unable to connect to the server. Please check network.");
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchKhatas();
  }, []);

  // POST API: Create New Khata
  const handleCreateKhataSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKhataName.trim()) {
      toast.error("Please enter a valid Khata name.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(API_KHATAS_URL, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          khata_name: newKhataName.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok && data.success && data.data) {
        toast.success(data.message || "Khata created successfully!");

        const createdItem: KhataItem = {
          id: data.data.khata_id,
          name: data.data.khata_name,
          avatarText: getInitials(data.data.khata_name),
        };

        setKhatas((prev) => [...prev, createdItem]);
        
        // Save new Khata as currently selected ID in localStorage
        handleSelectKhata(createdItem.id);
        
        setNewKhataName("");
        setIsCreateModalOpen(false);
      } else {
        toast.error(data.message || "Failed to create Khata.");
      }
    } catch (error) {
      console.error("Create Khata Error:", error);
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
          Your Khatas
        </h1>
        <p className="text-xs font-medium text-ink-500 sm:text-sm">
          Switch between businesses or create a brand new ledger book.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Khata list */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-card lg:col-span-2">
          <div className="border-b border-slate-100 px-4 py-3.5 sm:px-5">
            <h2 className="text-sm font-bold text-ink-900 sm:text-base">All Khatas</h2>
          </div>

          <div className="divide-y divide-slate-100 p-2 sm:p-3">
            {isFetching ? (
              <div className="flex items-center justify-center py-10 text-slate-400 gap-2 text-sm">
                <Loader2 size={18} className="animate-spin text-brand-600" />
                <span>Loading your Khatas...</span>
              </div>
            ) : khatas.length === 0 ? (
              <div className="py-8 text-center text-xs font-medium text-slate-400 sm:text-sm">
                No Khatas found. Create your first Khata to get started!
              </div>
            ) : (
              khatas.map((khata) => {
                const isSelected = khata.id === selectedKhataId;
                return (
                  <button
                    key={khata.id}
                    type="button"
                    onClick={() => handleSelectKhata(khata.id)}
                    className={`flex w-full items-center gap-3.5 rounded-xl p-3.5 text-left transition-all ${
                      isSelected ? "bg-brand-50/70 ring-1 ring-brand-200" : "hover:bg-slate-50"
                    }`}
                  >
                    {/* Circle Initials Badge */}
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xs font-bold shadow-inner ${
                        isSelected
                          ? "bg-gradient-to-br from-brand-600 to-violet-600 text-white"
                          : "bg-slate-200 text-ink-700"
                      }`}
                    >
                      {khata.avatarText}
                    </div>

                    {/* Khata Name */}
                    <span className="flex-1 truncate text-sm font-bold text-ink-900 sm:text-base">
                      {khata.name}
                    </span>

                    {isSelected && (
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white">
                        <Check size={13} />
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Create new khata card */}
        <div className="rounded-2xl border border-dashed border-brand-300 bg-brand-50/40 p-5 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-brand-600 shadow-sm">
            <BookOpen size={22} />
          </div>
          <h3 className="mt-3 text-sm font-bold text-ink-900">Start a new khata</h3>
          <p className="mt-1 text-xs font-medium text-ink-500">
            Keep a separate ledger for each of your shops or businesses.
          </p>
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-800 to-violet-600 py-3 text-xs font-bold text-white shadow-md transition-all hover:from-violet-700 hover:to-violet-500 active:scale-[0.99] sm:text-sm"
          >
            <Plus size={16} />
            <span>Create New Khata</span>
          </button>
        </div>
      </div>

      {/* CREATE NEW KHATA POPUP MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-xs p-0 sm:items-center sm:p-4">
          <div className="flex h-full w-full max-w-md flex-col overflow-hidden border border-slate-200 bg-white shadow-2xl sm:h-auto sm:rounded-2xl">
            {/* Modal Header */}
            <div className="relative flex items-center justify-center border-b border-slate-100 bg-white px-4 py-3.5 text-ink-700">
              <h2 className="text-sm font-bold text-ink-900 sm:text-base">New Khata</h2>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleCreateKhataSubmit} className="flex flex-col gap-4 p-5 sm:p-6">
              {/* Input Field with Character Counter */}
              <div className="space-y-1">
                <div className="relative rounded-xl border border-slate-200 bg-white px-3.5 py-3 transition-all focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-brand-600/15">
                  <input
                    type="text"
                    maxLength={20}
                    required
                    disabled={isSubmitting}
                    value={newKhataName}
                    onChange={(e) => setNewKhataName(e.target.value)}
                    placeholder="Enter Shop/Business Name"
                    className="w-full bg-transparent text-sm font-medium text-ink-900 outline-none placeholder:text-ink-300 disabled:opacity-50"
                  />
                </div>
                <div className="text-right text-[11px] font-medium text-ink-300">
                  {newKhataName.length}/20
                </div>
              </div>

              {/* Create Primary Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-800 to-violet-600 py-3 text-xs font-bold text-white shadow-md transition-all hover:from-violet-700 hover:to-violet-500 active:scale-[0.99] disabled:opacity-50 sm:text-sm"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <span>Create</span>
                )}
              </button>

              {/* View Khata Secondary Button */}
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-brand-800 transition-all hover:bg-slate-50 active:scale-[0.99] disabled:opacity-50 sm:text-sm"
              >
                <Eye size={16} />
                <span>View Khata</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}