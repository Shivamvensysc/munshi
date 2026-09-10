import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  ArrowLeft,
  Users,
  IndianRupee,
  ArrowRightLeft,
  MoreHorizontal,
  Eye,
} from "lucide-react";

interface KhataItem {
  id: string;
  name: string;
  avatarText: string;
}

const initialKhatas: KhataItem[] = [
  { id: "1", name: "Maa Sharda Store", avatarText: "MSS" },
  { id: "2", name: "Maa Ganga", avatarText: "MG" },
];

export default function KhataList() {
  const navigate = useNavigate();

  const [khatas, setKhatas] = useState<KhataItem[]>(initialKhatas);
  const [selectedKhataId, setSelectedKhataId] = useState<string>("1");
  const [activeTab, setActiveTab] = useState<"customers" | "transaction" | "cross" | "more">("customers");

  // State for Create New Khata Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newKhataName, setNewKhataName] = useState("");

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  const handleCreateKhataSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKhataName.trim()) return;

    // Generate avatar initials automatically (e.g. "Maa Ganga" -> "MG")
    const words = newKhataName.trim().split(" ");
    const initials = words
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 3);

    const newKhata: KhataItem = {
      id: Date.now().toString(),
      name: newKhataName.trim(),
      avatarText: initials || "K",
    };

    setKhatas([...khatas, newKhata]);
    setSelectedKhataId(newKhata.id);
    setNewKhataName("");
    setIsCreateModalOpen(false);
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-slate-100 font-sans text-slate-800 pb-20 md:pb-6">
      
      {/* MAIN CONTAINER */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-3 py-4 sm:px-6">
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          
          {/* Section Sub-Header */}
          <div className="relative flex items-center justify-center border-b border-slate-100 px-4 py-3">
            <button
              type="button"
              onClick={handleBackToDashboard}
              className="absolute left-4 p-1 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              aria-label="Back to Dashboard"
            >
              <ArrowLeft size={18} />
            </button>
            <h1 className="text-sm font-bold text-slate-600 sm:text-base">
              Khata
            </h1>
          </div>

          {/* List & Create Action Body */}
          <div className="p-4 sm:p-6 space-y-4">
            
            {/* List of Khatas */}
            <div className="space-y-3">
              {khatas.map((khata) => {
                const isSelected = khata.id === selectedKhataId;
                return (
                  <div
                    key={khata.id}
                    onClick={() => setSelectedKhataId(khata.id)}
                    className={`flex cursor-pointer items-center gap-3.5 rounded-xl border p-3.5 shadow-xs transition-all hover:shadow-md ${
                      isSelected
                        ? "border-blue-500 bg-slate-50/80"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    {/* Circle Initials Badge */}
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-600 shadow-inner">
                      {khata.avatarText}
                    </div>

                    {/* Khata Name */}
                    <span className="text-sm font-bold text-slate-900 sm:text-base">
                      {khata.name}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Create New Khata Trigger Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-900 py-3.5 text-xs font-bold text-white shadow-md transition-all hover:bg-indigo-950 active:scale-[0.99] sm:text-sm cursor-pointer"
              >
                <Plus size={16} />
                <span>Create New Khata</span>
              </button>
            </div>

          </div>
        </div>
      </main>

      {/* BOTTOM NAVIGATION BAR */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white shadow-lg">
        <div className="mx-auto flex max-w-md items-center justify-around py-1.5">
          
          <button
            type="button"
            onClick={() => setActiveTab("customers")}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === "customers" ? "text-blue-600" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Users size={20} />
            <span>Customers</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("transaction")}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === "transaction" ? "text-blue-600" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <IndianRupee size={20} />
            <span>Transaction</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("cross")}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === "cross" ? "text-blue-600" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <ArrowRightLeft size={20} />
            <span>Cross Entry</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("more")}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === "more" ? "text-blue-600" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <MoreHorizontal size={20} />
            <span>More</span>
          </button>

        </div>
      </nav>

      {/* CREATE NEW KHATA POPUP MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-xs p-0 sm:p-4">
          <div className="flex h-full w-full max-w-4xl flex-col bg-white shadow-2xl sm:h-auto sm:rounded-xl overflow-hidden border border-slate-200">
            
            {/* Modal Header */}
            <div className="relative flex items-center justify-center border-b border-slate-200 bg-white px-4 py-3 text-slate-700">
              <button
                type="button"
                onClick={handleBackToDashboard}
                className="absolute left-4 p-1 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                aria-label="Back to Dashboard"
              >
                <ArrowLeft size={20} />
              </button>
              <h2 className="text-sm font-bold text-slate-700 sm:text-base">Khata</h2>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleCreateKhataSubmit} className="flex flex-col gap-4 p-4 sm:p-6">
              
              {/* Input Field with Character Counter */}
              <div className="space-y-1">
                <div className="relative rounded-lg border border-indigo-900/80 bg-white px-3.5 py-3 transition-all focus-within:ring-1 focus-within:ring-indigo-600">
                  <input
                    type="text"
                    maxLength={20}
                    required
                    value={newKhataName}
                    onChange={(e) => setNewKhataName(e.target.value)}
                    placeholder="Enter Shop/Business Name"
                    className="w-full bg-transparent text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400"
                  />
                </div>
                <div className="text-right text-[11px] font-medium text-slate-400">
                  {newKhataName.length}/20
                </div>
              </div>

              {/* Create Primary Button */}
              <button
                type="submit"
                className="w-full rounded-lg bg-indigo-900 py-3 text-xs font-bold text-white shadow-md transition-all hover:bg-indigo-950 active:scale-[0.99] sm:text-sm cursor-pointer"
              >
                Create
              </button>

              {/* View Khata Secondary Button */}
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-indigo-900/80 bg-white py-2.5 text-xs font-bold text-indigo-900 transition-all hover:bg-slate-50 active:scale-[0.99] sm:text-sm cursor-pointer"
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