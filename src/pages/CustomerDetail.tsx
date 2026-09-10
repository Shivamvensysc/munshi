import { useState } from "react";
import {
  ArrowLeft,
  Pencil,
  FileText,
  Trash2,
} from "lucide-react";

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

const mockEntries: Entry[] = [
  {
    id: "1",
    title: "Cross",
    date: "09-09-2026 11:55:49 AM",
    subPerson: "Javed",
    balance: "65,000",
    deneAmount: "5,000",
    tag: "N",
    status: "CRE",
  },
  {
    id: "2",
    title: "Building Rent",
    date: "07-09-2026 10:51:48 AM",
    balance: "70,000",
    leneAmount: "20,000",
    tag: "N",
  },
  {
    id: "3",
    title: "Return",
    date: "07-09-2026 10:42:32 AM",
    balance: "50,000",
    deneAmount: "10,000",
    tag: "N",
  },
  {
    id: "4",
    title: "For Business",
    date: "07-09-2026 10:42:09 AM",
    balance: "60,000",
    leneAmount: "60,000",
    tag: "N",
  },
];

type ModalType = "LENE" | "DENE" | "EDIT_CUSTOMER" | "DELETE_CONFIRM" | null;

export default function CustomerDetail() {
  const [entries, setEntries] = useState<Entry[]>(mockEntries);

  // Active Modal State
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  // Lene/Dene Form State
  const [amountInput, setAmountInput] = useState("");
  const [detailsInput, setDetailsInput] = useState("");

  // Customer Profile State
  const [customerName, setCustomerName] = useState("Achintaya");
  const [customerPhone, setCustomerPhone] = useState("7018416867");
  const [customerAddress, setCustomerAddress] = useState("Wazidpur NOIDA");

  // Format date helper
  const getCurrentFormattedDate = () => {
    return new Date()
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
  };

  const handleModalClose = () => {
    setActiveModal(null);
    setAmountInput("");
    setDetailsInput("");
  };

  // Handle LENE / DENE Form Submission
  const handleEntrySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amountInput.trim()) return;

    const formattedAmount = Number(amountInput).toLocaleString("en-IN");
    const currentDate = getCurrentFormattedDate();

    const newEntry: Entry = {
      id: Date.now().toString(),
      title: detailsInput.trim() || "Entry",
      date: currentDate,
      balance: "65,000",
      ...(activeModal === "LENE"
        ? { leneAmount: formattedAmount }
        : { deneAmount: formattedAmount }),
      tag: "N",
    };

    setEntries([newEntry, ...entries]);
    handleModalClose();
  };

  // Handle Edit Customer Update
  const handleCustomerUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    handleModalClose();
  };

  // Handle Final Delete Execution
  const handleConfirmDelete = () => {
    setEntries([]);
    setActiveModal(null);
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-slate-100 font-sans text-slate-800 pb-20 sm:pb-6">
      
      {/* 1. TOP NAVBAR */}
      <header className="sticky top-0 z-20 flex w-full items-center justify-between border-b border-slate-200 bg-white px-4 py-3 shadow-xs">
        <button
          type="button"
          className="rounded-lg p-1.5 text-slate-600 transition-colors hover:bg-slate-100 active:scale-95"
          aria-label="Back"
        >
          <ArrowLeft size={20} />
        </button>

        {/* Customer Name with Edit Pen Icon */}
        <button
          type="button"
          onClick={() => setActiveModal("EDIT_CUSTOMER")}
          className="flex items-center gap-1.5 font-bold text-blue-900 transition-opacity hover:opacity-80 active:scale-95 sm:text-lg"
        >
          <Pencil size={15} className="text-blue-900" />
          <span>{customerName}</span>
        </button>

        {/* PDF Download Icon Button */}
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-indigo-900 bg-indigo-950/5 text-indigo-900 transition-colors hover:bg-indigo-900 hover:text-white"
          aria-label="Download Statement"
        >
          <FileText size={18} />
        </button>
      </header>

      {/* 2. OPENING & CLOSING BALANCE BANNER */}
      <div className="border-b border-slate-200 bg-white px-4 py-2.5 shadow-xs sm:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between py-1">
          <div className="text-sm font-bold text-emerald-600 sm:text-base">
            ₹ 0
          </div>
          <div className="text-xs font-bold text-blue-900 sm:text-sm">
            Opening
          </div>
        </div>

        <div className="mx-auto flex max-w-6xl items-center justify-between border-t border-slate-100 pt-2 pb-1">
          <div className="text-base font-black text-blue-900 sm:text-lg">
            Closing
          </div>
          <div className="text-base font-black text-red-600 sm:text-lg">
            ₹ 65,000
          </div>
        </div>
      </div>

      {/* 3. FILTER / ACTION BANNER BAR */}
      <div className="w-full bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 px-4 py-2.5 shadow-inner">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <button
            type="button"
            className="rounded-md bg-indigo-950 px-4 py-1.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-indigo-900 active:scale-95 sm:text-sm"
          >
            Monday Final
          </button>

          <button
            type="button"
            className="rounded-md border border-white/60 bg-white/20 px-4 py-1.5 text-xs font-bold text-white shadow-xs backdrop-blur-xs transition-all hover:bg-white/30 active:scale-95 sm:text-sm"
          >
            Last Week Record
          </button>
        </div>
      </div>

      {/* 4. MAIN CONTENT & ENTRIES TABLE */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-2 py-3 sm:px-6">
        <div className="grid grid-cols-12 px-3 py-2 text-[11px] font-extrabold uppercase tracking-wider text-slate-700 sm:text-xs">
          <div className="col-span-6 sm:col-span-5">ENTRIES</div>
          <div className="col-span-3 text-center sm:col-span-3">LENE</div>
          <div className="col-span-3 text-right sm:col-span-4 pr-2">DENE</div>
        </div>

        <div className="space-y-2.5">
          {entries.map((item) => (
            <div
              key={item.id}
              className="relative grid grid-cols-12 items-center rounded-lg border border-slate-200 bg-white p-3 shadow-xs transition-all hover:border-slate-300 hover:shadow-sm"
            >
              <div className="col-span-6 sm:col-span-5 space-y-0.5">
                <div className="text-xs font-bold text-slate-800 sm:text-sm">
                  {item.title}
                </div>
                <div className="text-[10px] font-medium text-slate-400 sm:text-xs">
                  {item.date}
                </div>
                {item.subPerson && (
                  <div className="text-xs font-bold text-blue-800">
                    {item.subPerson}
                  </div>
                )}
                <div className="text-[11px] font-bold text-red-600 sm:text-xs">
                  Bal. {item.balance}
                </div>
              </div>

              <div className="col-span-3 text-center">
                {item.leneAmount && (
                  <span className="text-xs font-black text-red-600 sm:text-sm">
                    ₹ {item.leneAmount}
                  </span>
                )}
              </div>

              <div className="col-span-3 sm:col-span-4 flex items-center justify-end gap-2 pr-1">
                {item.deneAmount && (
                  <span className="text-xs font-black text-emerald-600 sm:text-sm">
                    ₹ {item.deneAmount}
                  </span>
                )}

                <div className="flex flex-col items-end">
                  {item.tag && (
                    <span className="text-[11px] font-extrabold text-red-600">
                      {item.tag}
                    </span>
                  )}
                  {item.status && (
                    <span className="text-[9px] font-bold tracking-tight text-blue-900">
                      {item.status}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* 5. BOTTOM ACTION BUTTONS */}
      <footer className="fixed bottom-0 left-0 right-0 z-30 bg-white/80 p-2 backdrop-blur-md border-t border-slate-200 sm:p-4">
        <div className="mx-auto flex max-w-6xl gap-3">
          <button
            type="button"
            onClick={() => setActiveModal("LENE")}
            className="flex flex-1 flex-col items-center justify-center rounded-lg bg-rose-500 py-2.5 text-white shadow-md transition-all hover:bg-rose-600 active:scale-[0.98]"
          >
            <span className="text-xs font-black uppercase tracking-wide sm:text-sm">
              LENE ₹
            </span>
            <span className="text-[10px] font-medium opacity-90 sm:text-xs">
              Amount Diya
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveModal("DENE")}
            className="flex flex-1 flex-col items-center justify-center rounded-lg bg-teal-600 py-2.5 text-white shadow-md transition-all hover:bg-teal-700 active:scale-[0.98]"
          >
            <span className="text-xs font-black uppercase tracking-wide sm:text-sm">
              DENE ₹
            </span>
            <span className="text-[10px] font-medium opacity-90 sm:text-xs">
              Amount Liya
            </span>
          </button>
        </div>
      </footer>

      {/* 6. POPUP MODALS */}

      {/* EDIT CUSTOMER MODAL */}
      {activeModal === "EDIT_CUSTOMER" && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-xs p-0 sm:p-4">
          <div className="flex h-full w-full max-w-4xl flex-col bg-white shadow-2xl sm:h-auto sm:rounded-xl overflow-hidden border border-slate-200">
            <div className="relative flex items-center justify-center border-b border-slate-200 bg-white px-4 py-3">
              <button
                type="button"
                onClick={handleModalClose}
                className="absolute left-4 p-1 text-slate-600 transition-colors hover:text-slate-900 active:scale-95"
                aria-label="Back"
              >
                <ArrowLeft size={20} />
              </button>
              
              <h2 className="text-base font-extrabold text-slate-700">
                New Customer
              </h2>
            </div>

            <form onSubmit={handleCustomerUpdate} className="flex flex-col gap-4 p-4 sm:p-6">
              <div className="space-y-1">
                <div className="relative rounded-lg border border-slate-200 bg-white px-3.5 py-3 transition-all focus-within:border-indigo-600 focus-within:ring-1 focus-within:ring-indigo-600">
                  <input
                    type="text"
                    maxLength={36}
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter Customer Name"
                    className="w-full bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400"
                  />
                </div>
                <div className="text-right text-[11px] font-medium text-slate-400">
                  {customerName.length}/36
                </div>
              </div>

              <div className="relative rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 flex items-center gap-3 transition-all focus-within:border-indigo-600 focus-within:ring-1 focus-within:ring-indigo-600">
                <div className="flex items-center gap-1 border-r border-slate-200 pr-3">
                  <span className="inline-block h-4 w-6 rounded-xs bg-slate-300 shadow-xs"></span>
                  <span className="text-[10px] text-slate-500">▼</span>
                </div>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Enter Phone Number"
                  className="w-full bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400"
                />
              </div>

              <div className="space-y-1">
                <div className="relative rounded-lg border border-slate-200 bg-white px-3.5 py-3 transition-all focus-within:border-indigo-600 focus-within:ring-1 focus-within:ring-indigo-600">
                  <input
                    type="text"
                    maxLength={36}
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    placeholder="Enter Address"
                    className="w-full bg-transparent text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400"
                  />
                </div>
                <div className="text-right text-[11px] font-medium text-slate-400">
                  {customerAddress.length}/36
                </div>
              </div>

              <button
                type="submit"
                className="mt-2 w-full rounded-lg bg-indigo-900 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-indigo-950 active:scale-[0.99]"
              >
                Update Customer
              </button>

              <button
                type="button"
                onClick={() => setActiveModal("DELETE_CONFIRM")}
                className="flex items-center justify-center gap-2 w-full rounded-lg bg-rose-500 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-rose-600 active:scale-[0.99]"
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
            <h3 className="text-3xl font-extrabold text-slate-700 sm:text-4xl">
              Are you sure?
            </h3>
            <p className="mt-4 text-sm font-medium leading-relaxed text-slate-500 sm:text-base">
              Do you want to delete, All the data in this book on khatabook will be moved to recycle bin.
            </p>

            <div className="mt-8 flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => setActiveModal("EDIT_CUSTOMER")}
                className="w-32 rounded-lg bg-slate-300 py-2.5 text-base font-bold text-white shadow-xs transition-all hover:bg-slate-400 active:scale-95"
              >
                No
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="w-32 rounded-lg bg-rose-500 py-2.5 text-base font-bold text-white shadow-xs transition-all hover:bg-rose-600 active:scale-95"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LENE / DENE TRANSACTION MODAL */}
      {(activeModal === "LENE" || activeModal === "DENE") && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-xs p-0 sm:p-4">
          <div className="flex h-full w-full max-w-4xl flex-col bg-white shadow-2xl sm:h-auto sm:rounded-xl overflow-hidden border border-slate-200">
            <div className="relative flex items-center justify-center border-b border-slate-200 bg-white px-4 py-3">
              <button
                type="button"
                onClick={handleModalClose}
                className="absolute left-4 p-1 text-slate-600 transition-colors hover:text-slate-900 active:scale-95"
                aria-label="Back"
              >
                <ArrowLeft size={20} />
              </button>
              
              <h2 className={`text-base font-extrabold flex items-center gap-1 ${
                activeModal === "LENE" ? "text-red-600" : "text-emerald-700"
              }`}>
                <span>₹</span>
                <span>{activeModal === "LENE" ? "Lene" : "Dene"}</span>
                <span>{customerName}</span>
              </h2>
            </div>

            <form onSubmit={handleEntrySubmit} className="flex flex-col gap-4 p-4 sm:p-6">
              <div className="space-y-1">
                <div className="relative flex items-center rounded-lg border border-indigo-900/80 bg-white px-3.5 py-3 transition-all focus-within:ring-1 focus-within:ring-indigo-600">
                  <input
                    type="number"
                    maxLength={9}
                    required
                    value={amountInput}
                    onChange={(e) => {
                      if (e.target.value.length <= 9) {
                        setAmountInput(e.target.value);
                      }
                    }}
                    placeholder="Enter Amount"
                    className="w-full bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400 placeholder:font-bold"
                  />
                  <div className="flex flex-col text-slate-400 text-[10px] pl-2 cursor-pointer select-none">
                    <span>▲</span>
                    <span>▼</span>
                  </div>
                </div>
                <div className="text-right text-[11px] font-medium text-slate-400">
                  {amountInput.length}/9
                </div>
              </div>

              <div className="space-y-1">
                <div className="relative rounded-lg border border-slate-200 bg-white px-3.5 py-3 transition-all focus-within:border-indigo-600 focus-within:ring-1 focus-within:ring-indigo-600">
                  <input
                    type="text"
                    maxLength={36}
                    value={detailsInput}
                    onChange={(e) => setDetailsInput(e.target.value)}
                    placeholder="Enter Details"
                    className="w-full bg-transparent text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400"
                  />
                </div>
                <div className="text-right text-[11px] font-medium text-slate-400">
                  {detailsInput.length}/36
                </div>
              </div>

              <button
                type="submit"
                className={`mt-2 w-full rounded-lg py-3 text-sm font-bold text-white shadow-md transition-all active:scale-[0.99] ${
                  activeModal === "LENE"
                    ? "bg-rose-500 hover:bg-rose-600"
                    : "bg-teal-600 hover:bg-teal-700"
                }`}
              >
                Save
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}