import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Store,
  Plus,
  Search,
  Filter,
  FileText,
  Users,
  IndianRupee,
  ArrowRightLeft,
  MoreHorizontal,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";

interface Customer {
  id: string;
  name: string;
  amount: string;
  type: "give" | "get"; // 'give' -> Dene (Red), 'get' -> Lene (Green)
}

const mockCustomers: Customer[] = [
  { id: "1", name: "Achintaya", amount: "65,000", type: "give" },
  { id: "2", name: "Avanish", amount: "5,00,000", type: "give" },
  { id: "3", name: "Javed", amount: "10,000", type: "get" },
  { id: "4", name: "Shivam", amount: "4,50,000", type: "give" },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"customers" | "transaction" | "cross" | "more">("customers");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Customer Form State
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newContactNo, setNewContactNo] = useState("");
  const [newAddress, setNewAddress] = useState("");

  const filteredCustomers = mockCustomers.filter((customer) =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Reset and close modal
    setNewCustomerName("");
    setNewContactNo("");
    setNewAddress("");
    setIsAddModalOpen(false);
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-slate-100 font-sans text-slate-800 pb-20 md:pb-6">
      
     
     

      {/* MAIN CONTENT WRAPPER */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-3 py-4 sm:px-6">
        
        {/* 2. NET BALANCE SUMMARY CARD */}
        <div className="mb-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {/* Net Balance Row */}
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 sm:px-6">
            <span className="text-sm font-extrabold text-blue-900 sm:text-base">
              Net Balance
            </span>
            <span className="text-lg font-black tracking-tight text-blue-900 sm:text-2xl">
              ₹ 10,05,000
            </span>
          </div>

          {/* Dene & Lene Split Row */}
          <div className="grid grid-cols-2 divide-x divide-slate-100 bg-slate-50/50">
            {/* You Give (Dene - Red) */}
            <div className="p-3 sm:p-4">
              <div className="text-xs font-bold text-slate-600 sm:text-sm">Dene</div>
              <div className="mt-1 text-base font-extrabold text-red-600 sm:text-xl">
                ₹ 10,15,000
              </div>
            </div>

            {/* You Get (Lene - Green) */}
            <div className="p-3 text-right sm:p-4">
              <div className="text-xs font-bold text-slate-600 sm:text-sm">Lene</div>
              <div className="mt-1 text-base font-extrabold text-emerald-600 sm:text-xl">
                ₹ 10,000
              </div>
            </div>
          </div>
        </div>

        {/* BLUE SEPARATOR ACCENT */}
        <div className="mb-4 h-1.5 w-full rounded-full bg-blue-600" />

        {/* 3. SEARCH AND ACTION BAR */}
        <div className="mb-4 flex items-center gap-2 sm:gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Customer"
              className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm font-medium text-slate-800 shadow-sm outline-none transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
            />
          </div>

          {/* Filter Action Icon */}
          <button
            type="button"
            aria-label="Filter"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-blue-900 shadow-sm transition-all hover:bg-slate-50 active:scale-95"
          >
            <Filter size={18} />
          </button>

          {/* Download PDF Action Icon */}
          <button
            type="button"
            aria-label="Download Report"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-blue-900 shadow-sm transition-all hover:bg-slate-50 active:scale-95"
          >
            <FileText size={18} />
          </button>
        </div>

        {/* 4. CUSTOMER LIST SECTION */}
        <div className="space-y-2.5">
          {filteredCustomers.length > 0 ? (
            filteredCustomers.map((customer) => (
              <div
                key={customer.id}
                className="group flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm transition-all hover:border-slate-300 hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-slate-800 transition-colors group-hover:text-blue-600 sm:text-base">
                    {customer.name}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-sm font-extrabold sm:text-base ${
                      customer.type === "get" ? "text-emerald-600" : "text-red-600"
                    }`}
                  >
                    ₹ {customer.amount}
                  </span>
                  <ChevronRight size={16} className="text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-500" />
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm font-medium text-slate-500">
              No customers found matching "{searchQuery}"
            </div>
          )}
        </div>
      </main>

      {/* 5. BOTTOM NAVIGATION BAR */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white shadow-lg">
        <div className="mx-auto flex max-w-md items-center justify-around py-1.5">
          
          <button
            type="button"
            onClick={() => setActiveTab("customers")}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 text-xs font-semibold transition-colors ${
              activeTab === "customers" ? "text-blue-600" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Users size={20} />
            <span>Customers</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("transaction")}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 text-xs font-semibold transition-colors ${
              activeTab === "transaction" ? "text-blue-600" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <IndianRupee size={20} />
            <span>Transaction</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("cross")}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 text-xs font-semibold transition-colors ${
              activeTab === "cross" ? "text-blue-600" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <ArrowRightLeft size={20} />
            <span>Cross Entry</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("more")}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 text-xs font-semibold transition-colors ${
              activeTab === "more" ? "text-blue-600" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <MoreHorizontal size={20} />
            <span>More</span>
          </button>

        </div>
      </nav>

      {/* 6. NEW CUSTOMER POPUP MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-xs p-0 sm:p-4">
          <div className="flex h-full w-full max-w-4xl flex-col bg-white shadow-2xl sm:h-auto sm:rounded-xl overflow-hidden border border-slate-200">
            
            {/* Modal Header */}
            <div className="relative flex items-center justify-between border-b border-blue-700 bg-blue-600 px-4 py-3 text-white">
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
            <form onSubmit={handleAddCustomerSubmit} className="flex flex-col gap-4 p-4 sm:p-6">
              
              {/* Customer Name Input */}
              <div className="space-y-1">
                <div className="relative rounded-lg border border-indigo-900/60 bg-white px-3 py-2.5 transition-all focus-within:ring-1 focus-within:ring-indigo-600">
                  <input
                    type="text"
                    maxLength={36}
                    value={newCustomerName}
                    onChange={(e) => setNewCustomerName(e.target.value)}
                    placeholder="Customer Name"
                    className="w-full bg-transparent text-sm font-medium text-slate-800 outline-none placeholder:text-slate-500"
                  />
                </div>
                <div className="text-right text-[11px] text-slate-400">
                  {newCustomerName.length}/36
                </div>
              </div>

              {/* Contact No Input with Country Code */}
              <div>
                <div className="flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2.5 transition-all focus-within:border-indigo-600 focus-within:ring-1 focus-within:ring-indigo-600">
                  <div className="flex items-center gap-1.5 border-r border-slate-200 pr-3 mr-3 text-xs font-bold text-slate-700">
                    <span className="text-base leading-none">🇮🇳</span>
                    <span>+91</span>
                    <span className="text-[10px] text-slate-400">▼</span>
                  </div>
                  <input
                    type="tel"
                    value={newContactNo}
                    onChange={(e) => setNewContactNo(e.target.value)}
                    placeholder="Contact No"
                    className="w-full bg-transparent text-sm font-medium text-slate-800 outline-none placeholder:text-slate-500"
                  />
                </div>
              </div>

              {/* Address Input */}
              <div className="space-y-1">
                <div className="relative rounded-lg border border-slate-200 bg-white px-3 py-2.5 transition-all focus-within:border-indigo-600 focus-within:ring-1 focus-within:ring-indigo-600">
                  <input
                    type="text"
                    maxLength={36}
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    placeholder="Address"
                    className="w-full bg-transparent text-sm font-medium text-slate-800 outline-none placeholder:text-slate-500"
                  />
                </div>
                <div className="text-right text-[11px] text-slate-400">
                  {newAddress.length}/36
                </div>
              </div>

              {/* Continue Submit Button */}
              <button
                type="submit"
                className="mt-2 w-full rounded-lg bg-indigo-900 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-indigo-950 active:scale-[0.99]"
              >
                Continue
              </button>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}