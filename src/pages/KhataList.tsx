import { useState, useEffect, type FormEvent } from "react";
import { Plus, BookOpen, Check, Eye } from "lucide-react";
import { toast } from "react-toastify";
import Modal from "../components/ui/Modal";
import Spinner from "../components/ui/Spinner";
import Button from "../components/Button";
import { khataService } from "../services";
import { tokenStore, type StoredKhata } from "../auth/tokenStore";
import type { ApiError } from "../lib/apiClient";

interface KhataItem {
  id: string;
  name: string;
  avatarText: string;
}

// Helper function to extract initials from name
function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].slice(0, 3).toUpperCase();
  }
  return words.map((w) => w[0]).join("").toUpperCase().slice(0, 3);
}

export default function KhataList() {
  const [khatas, setKhatas] = useState<KhataItem[]>([]);

  // Read initial selected ID from the secure session store
  const [selectedKhataId, setSelectedKhataId] = useState<string>(
    () => tokenStore.getKhataId() || ""
  );

  const [isFetching, setIsFetching] = useState<boolean>(true);

  // State for Create New Khata Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newKhataName, setNewKhataName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper to handle selection and persist it
  const handleSelectKhata = (id: string, name?: string) => {
    setSelectedKhataId(id);
    tokenStore.setKhataId(id);
    if (name) {
      tokenStore.setDefaultKhata({ id, name } as StoredKhata);
    }
  };

  // GET API: Fetch Khatas list
  const fetchKhatas = async () => {
    setIsFetching(true);
    try {
      const data = await khataService.list();

      if (data.success && Array.isArray(data.data)) {
        const mappedKhatas: KhataItem[] = data.data.map((item) => ({
          id: item.khata_id,
          name: item.khata_name,
          avatarText: getInitials(item.khata_name),
        }));

        setKhatas(mappedKhatas);
        tokenStore.setKhatas(mappedKhatas.map((k) => ({ id: k.id, name: k.name })));

        if (mappedKhatas.length > 0) {
          const exists = mappedKhatas.some((k) => k.id === selectedKhataId);
          const activeId = exists ? selectedKhataId : mappedKhatas[0].id;
          const activeKhata = mappedKhatas.find((k) => k.id === activeId);
          handleSelectKhata(activeId, activeKhata?.name);
        }
      } else {
        toast.error(data.message || "Failed to load Khatas.");
      }
    } catch (error) {
      const apiError = error as ApiError;
      console.error("Fetch Khatas Error:", error);
      toast.error(apiError.message || "Unable to connect to the server. Please check network.");
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchKhatas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // POST API: Create New Khata
  const handleCreateKhataSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!newKhataName.trim()) {
      toast.error("Please enter a valid Khata name.");
      return;
    }

    setIsSubmitting(true);

    try {
      const data = await khataService.create(newKhataName.trim());

      if (data.success && data.data) {
        toast.success(data.message || "Khata created successfully!");

        const createdItem: KhataItem = {
          id: data.data.khata_id,
          name: data.data.khata_name,
          avatarText: getInitials(data.data.khata_name),
        };

        const updated = [...khatas, createdItem];
        setKhatas(updated);
        tokenStore.setKhatas(updated.map((k) => ({ id: k.id, name: k.name })));

        handleSelectKhata(createdItem.id, createdItem.name);

        setNewKhataName("");
        setIsCreateModalOpen(false);
      } else {
        toast.error(data.message || "Failed to create Khata.");
      }
    } catch (error) {
      const apiError = error as ApiError;
      console.error("Create Khata Error:", error);
      toast.error(apiError.message || "Unable to connect to the server.");
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
                <Spinner size={18} className="text-brand-600" />
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
                    onClick={() => handleSelectKhata(khata.id, khata.name)}
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
      <Modal
        open={isCreateModalOpen}
        onClose={() => !isSubmitting && setIsCreateModalOpen(false)}
        title="New Khata"
        preventClose={isSubmitting}
      >
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
          <Button type="submit" loading={isSubmitting} loadingText="Creating...">
            Create
          </Button>

          {/* View Khata Secondary Button */}
          <Button
            type="button"
            variant="secondary"
            icon={<Eye size={16} />}
            disabled={isSubmitting}
            onClick={() => setIsCreateModalOpen(false)}
          >
            View Khata
          </Button>
        </form>
      </Modal>
    </div>
  );
}
