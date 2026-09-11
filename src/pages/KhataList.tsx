import { useState, type FormEvent } from "react";
import { Plus, BookOpen, Check, Eye, Pencil, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import Modal from "../components/ui/Modal";
import Spinner from "../components/ui/Spinner";
import Button from "../components/Button";
import { khataService } from "../services";
import { useKhata, type Khata } from "../context/KhataContext";
import type { ApiError } from "../lib/apiClient";

// Helper function to extract initials from name
function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].slice(0, 3).toUpperCase();
  }
  return words.map((w) => w[0]).join("").toUpperCase().slice(0, 3);
}

export default function KhataList() {
  // Shared khata state — same list/selection the header uses, so choosing a
  // khata here instantly updates the header and every other page too.
  const { khatasList, isLoadingKhatas, selectedKhataId, selectKhata, addKhata, updateKhata, removeKhata } =
    useKhata();

  const khatas = khatasList.map((k) => ({ ...k, avatarText: getInitials(k.name) }));
  const isFetching = isLoadingKhatas;

  // State for Create New Khata Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newKhataName, setNewKhataName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for Edit Khata Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingKhata, setEditingKhata] = useState<Khata | null>(null);
  const [editKhataName, setEditKhataName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // State for Delete Khata Confirmation Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingKhata, setDeletingKhata] = useState<Khata | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

        addKhata({ id: data.data.khata_id, name: data.data.khata_name });

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

  // Opens the Edit Khata modal, pre-filled from the row's data.
  const handleOpenEditKhata = (khata: Khata) => {
    setEditingKhata(khata);
    setEditKhataName(khata.name);
    setEditDescription(khata.description || "");
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    if (isUpdating) return;
    setIsEditModalOpen(false);
    setEditingKhata(null);
  };

  // PUT API: Update Khata name + description
  const handleUpdateKhataSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingKhata) return;

    if (!editKhataName.trim()) {
      toast.error("Please enter a valid Khata name.");
      return;
    }

    setIsUpdating(true);

    try {
      const data = await khataService.update(editingKhata.id, {
        khata_name: editKhataName.trim(),
        description: editDescription.trim(),
      });

      if (data.success) {
        toast.success(data.message || "Khata updated successfully!");

        updateKhata(editingKhata.id, {
          name: editKhataName.trim(),
          description: editDescription.trim(),
        });

        setIsEditModalOpen(false);
        setEditingKhata(null);
      } else {
        toast.error(data.message || "Failed to update Khata.");
      }
    } catch (error) {
      const apiError = error as ApiError;
      console.error("Update Khata Error:", error);
      toast.error(apiError.message || "Unable to connect to the server.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Opens the delete confirmation "pop modal" for a khata.
  const handleOpenDeleteKhata = (khata: Khata) => {
    setDeletingKhata(khata);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    if (isDeleting) return;
    setIsDeleteModalOpen(false);
    setDeletingKhata(null);
  };

  // DELETE API: Delete Khata — only fired after the user clicks "Yes" in
  // the confirmation modal.
  const handleConfirmDeleteKhata = async () => {
    if (!deletingKhata) return;

    setIsDeleting(true);

    try {
      const data = await khataService.remove(deletingKhata.id);

      if (data.success ?? true) {
        toast.success(data.message || "Khata deleted successfully.");
        removeKhata(deletingKhata.id);
        setIsDeleteModalOpen(false);
        setDeletingKhata(null);
      } else {
        toast.error(data.message || "Failed to delete Khata.");
      }
    } catch (error) {
      const apiError = error as ApiError;
      console.error("Delete Khata Error:", error);
      toast.error(apiError.message || "Unable to connect to the server.");
    } finally {
      setIsDeleting(false);
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
                  <div
                    key={khata.id}
                    className={`flex w-full items-center gap-3.5 rounded-xl p-3.5 transition-all ${
                      isSelected ? "bg-brand-50/70 ring-1 ring-brand-200" : "hover:bg-slate-50"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => selectKhata(khata.id, khata.name)}
                      className="flex min-w-0 flex-1 items-center gap-3.5 text-left"
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

                    {/* Edit / Delete actions — separate from the select button above
                        so they don't trigger a khata switch when clicked. */}
                    <div className="flex shrink-0 items-center gap-1 pl-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEditKhata(khata)}
                        aria-label={`Edit ${khata.name}`}
                        title="Edit Khata"
                        className="flex h-8 w-8 items-center justify-center rounded-full text-brand-600 transition-colors hover:bg-brand-50 active:scale-95"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenDeleteKhata(khata)}
                        aria-label={`Delete ${khata.name}`}
                        title="Delete Khata"
                        className="flex h-8 w-8 items-center justify-center rounded-full text-rose-600 transition-colors hover:bg-rose-50 active:scale-95"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
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

      {/* EDIT KHATA MODAL */}
      <Modal open={isEditModalOpen} onClose={handleCloseEditModal} title="Edit Khata" preventClose={isUpdating}>
        <form onSubmit={handleUpdateKhataSubmit} className="flex flex-col gap-4 p-5 sm:p-6">
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wide text-ink-400">
              Khata Name
            </label>
            <div className="relative rounded-xl border border-slate-200 bg-white px-3.5 py-3 transition-all focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-brand-600/15">
              <input
                type="text"
                maxLength={20}
                required
                autoFocus
                disabled={isUpdating}
                value={editKhataName}
                onChange={(e) => setEditKhataName(e.target.value)}
                placeholder="Enter Shop/Business Name"
                className="w-full bg-transparent text-sm font-medium text-ink-900 outline-none placeholder:text-ink-300 disabled:opacity-50"
              />
            </div>
            <div className="text-right text-[11px] font-medium text-ink-300">
              {editKhataName.length}/20
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wide text-ink-400">
              Description
            </label>
            <div className="relative rounded-xl border border-slate-200 bg-white px-3.5 py-3 transition-all focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-brand-600/15">
              <input
                type="text"
                maxLength={100}
                disabled={isUpdating}
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Enter Description (optional)"
                className="w-full bg-transparent text-sm font-medium text-ink-900 outline-none placeholder:text-ink-300 disabled:opacity-50"
              />
            </div>
          </div>

          <Button type="submit" loading={isUpdating} loadingText="Updating...">
            Update Khata
          </Button>
        </form>
      </Modal>

      {/* DELETE KHATA CONFIRMATION POPUP MODAL */}
      <Modal
        open={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        title="Delete Khata?"
        preventClose={isDeleting}
        size="sm"
        tone="danger"
      >
        <div className="p-6 text-center sm:p-7">
          <p className="text-sm font-medium leading-relaxed text-ink-500 sm:text-base">
            Are you sure you want to delete{" "}
            <span className="font-bold text-ink-900">{deletingKhata?.name}</span>? All customers and
            transactions under this khata will be permanently deleted.
          </p>

          <div className="mt-8 flex items-center justify-center gap-4">
            <Button
              type="button"
              variant="secondary"
              fullWidth={false}
              disabled={isDeleting}
              onClick={handleCloseDeleteModal}
              className="w-28 sm:w-32"
            >
              No
            </Button>
            <Button
              type="button"
              variant="dangerSolid"
              fullWidth={false}
              loading={isDeleting}
              onClick={handleConfirmDeleteKhata}
              className="w-28 sm:w-32"
            >
              Yes
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
