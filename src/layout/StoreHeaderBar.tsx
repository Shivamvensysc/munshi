import { useState, useRef, useEffect, type FormEvent } from "react";
import { BookOpen, Plus, ChevronDown, Check, UserCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Modal from "../components/ui/Modal";
import Spinner from "../components/ui/Spinner";
import Button from "../components/Button";
import { khataService } from "../services";
import { useKhata } from "../context/KhataContext";
import type { ApiError } from "../lib/apiClient";

export default function StoreHeaderBar() {
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Shared khata state are  — the same values every page reads via useKhata(),
  // so selecting a khata here is instantly visible everywhere else too.
  const {
    khatasList,
    isLoadingKhatas,
    selectedKhataId,
    selectedKhata,
    selectKhata,
    addKhata,
  } = useKhata();

  // Dropdown open/close state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Create Khata modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newKhataName, setNewKhataName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCreateKhataSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!newKhataName.trim()) {
      toast.error("Please enter a valid Khata name.");
      return;
    }

    setIsCreating(true);
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
      setIsCreating(false);
    }
  };

  const handleAddCustomer = () => {
    // "Create customer" from the header just gets the user to the
    // Dashboard, where the actual Add Customer flow lives — and asks it to
    // open the modal immediately so it feels like one continuous action.
    navigate("/dashboard", { state: { openAddCustomer: true } });
  };

  return (
    <header className="relative z-40 w-full border-b border-ledger-border bg-ledger-paper/95 px-3 py-3 shadow-sm backdrop-blur-md sm:px-6">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-2 sm:gap-4">
        {/* Left cluster: khata selector */}
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          {/* Khata Dropdown Container */}
          <div className="relative min-w-0" ref={dropdownRef}>
            {isLoadingKhatas ? (
              <div className="flex items-center gap-2 rounded-lg border border-ledger-border bg-ledger-paper px-3 py-2 text-xs font-semibold text-ledger-faint sm:px-4 sm:text-sm">
                <Spinner size={14} className="text-ledger-brass-dark" />
                <span>Loading…</span>
              </div>
            ) : khatasList.length === 0 ? (
              /* DEFAULT STATE: No Khata exists -> Shows "Create Khata" */
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="flex cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-ledger-brass px-2.5 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-ledger-brass-dark active:scale-95 sm:gap-2 sm:px-4 sm:text-sm"
              >
                <Plus size={16} className="shrink-0 stroke-[2.5]" />
                <span className="whitespace-nowrap">Create Khata</span>
              </button>
            ) : (
              /* STATE: When Khatas exist -> Displays selected Khata with dropdown option */
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-ledger-border bg-ledger-paper px-2.5 py-2 text-xs font-semibold text-ledger-ink shadow-sm transition-all hover:border-ledger-border-hover hover:bg-ledger-hover active:scale-95 sm:gap-2 sm:px-4 sm:text-sm"
              >
                <BookOpen size={16} className="shrink-0 text-ledger-brass-dark" />
                <span className="xs:max-w-[160px] max-w-[110px] truncate sm:max-w-[220px]">
                  {selectedKhata?.name || "Select Khata"}
                </span>
                <ChevronDown
                  size={14}
                  className={`shrink-0 text-ledger-faint transition-transform duration-200 ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
            )}

            {/* Dropdown Menu (Available when Khatas exist) */}
            {isDropdownOpen && khatasList.length > 0 && (
              <div className="absolute left-0 z-50 mt-2 w-56 rounded-xl border border-ledger-border bg-ledger-paper py-1.5 shadow-xl transition-all sm:w-64">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-ledger-faint">
                  Your Khatas
                </div>

                {/* List of Khatas */}
                <div className="max-h-48 divide-y divide-ledger-border-soft overflow-y-auto">
                  {khatasList.map((khata) => {
                    const isSelected = khata.id === selectedKhataId;
                    return (
                      <button
                        key={khata.id}
                        type="button"
                        onClick={() => {
                          selectKhata(khata.id, khata.name);
                          setIsDropdownOpen(false);
                        }}
                        className={`flex w-full cursor-pointer items-center justify-between px-3 py-2 text-left text-xs font-medium transition-colors hover:bg-ledger-hover sm:text-sm ${
                          isSelected
                            ? "bg-ledger-brass/10 text-ledger-brass-dark"
                            : "text-ledger-muted"
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <BookOpen
                            size={14}
                            className={
                              isSelected ? "text-ledger-brass-dark" : "text-ledger-placeholder"
                            }
                          />
                          <span className="truncate">{khata.name}</span>
                        </div>
                        {isSelected && (
                          <Check
                            size={14}
                            className="shrink-0 text-ledger-green"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Action to create another new Khata inside dropdown */}
                <div className="mt-1 border-t border-ledger-border-soft pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      setIsCreateModalOpen(true);
                    }}
                    className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-xs font-semibold text-ledger-brass-dark transition-colors hover:bg-ledger-hover sm:text-sm"
                  >
                    <Plus size={15} className="stroke-[2.5]" />
                    <span>+ Create New Khata</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right cluster: add customer + profile avatar */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={handleAddCustomer}
            aria-label="Add Customer"
            className="flex cursor-pointer items-center justify-center gap-1 rounded-lg bg-ledger-ink px-2.5 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-ledger-ink-dark active:scale-95 sm:gap-1.5 sm:px-4 sm:text-sm"
          >
            <Plus size={16} className="shrink-0 stroke-[2.5]" />
            {/* Label hides on the very narrowest phones so this button can
                never force the header to overflow horizontally — icon alone
                still communicates the action there. */}
            <span className="hidden whitespace-nowrap xs:inline">Add Customer</span>
          </button>

          {/* Was `hidden sm:flex` before — completely unreachable on phones.
              Always shown now so the account page is reachable on every screen size. */}
          <button
            type="button"
            onClick={() => navigate("/account-profile-page")}
            aria-label="Account"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-ledger-border bg-ledger-hover text-ledger-brass-dark transition-colors hover:bg-ledger-border-soft active:scale-95"
          >
            <UserCircle2 size={20} />
          </button>
        </div>
      </div>

      {/* CREATE NEW KHATA MODAL */}
      <Modal
        open={isCreateModalOpen}
        onClose={() => !isCreating && setIsCreateModalOpen(false)}
        title="New Khata"
        preventClose={isCreating}
        size="sm"
      >
        <form
          onSubmit={handleCreateKhataSubmit}
          className="flex flex-col gap-4 p-5 sm:p-6"
        >
          <div className="space-y-1">
            <div className="relative rounded-xl border border-slate-200 bg-white px-3.5 py-3 transition-all focus-within:border-ledger-brass focus-within:ring-2 focus-within:ring-ledger-brass/15">
              <input
                type="text"
                maxLength={20}
                required
                autoFocus
                disabled={isCreating}
                value={newKhataName}
                onChange={(e) => setNewKhataName(e.target.value)}
                placeholder="Enter Shop/Business Name"
                className="w-full bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400 disabled:opacity-50"
              />
            </div>
            <div className="text-right text-[11px] font-medium text-slate-400">
              {newKhataName.length}/20
            </div>
          </div>

          <Button type="submit" loading={isCreating} loadingText="Creating...">
            Create Khata
          </Button>
        </form>
      </Modal>
    </header>
  );
}
