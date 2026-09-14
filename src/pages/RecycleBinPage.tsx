import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  RotateCcw,
  Trash2,
  Users,
  Receipt,
  Inbox,
} from "lucide-react";
import { toast } from "react-toastify";
import Modal from "../components/ui/Modal";
import Spinner from "../components/ui/Spinner";
import Button from "../components/Button";
import { recycleBinService } from "../services";
import type {
  RecycleBinCustomer,
  RecycleBinKhata,
  RecycleBinTransaction,
} from "../services";
import { useKhata } from "../context/KhataContext";
import type { ApiError } from "../lib/apiClient";

type TabKey = "customers" | "khatas" | "transactions";

/** Item currently targeted by the "Delete Forever" confirmation modal. */
interface PurgeTarget {
  type: TabKey;
  id: string;
  label: string;
}

function formatDeletedAt(value: string): string {
  try {
    return new Date(value).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return value;
  }
}

export default function RecycleBinPage() {
  const navigate = useNavigate();
  const { selectedKhataId, selectedKhata } = useKhata();

  const [activeTab, setActiveTab] = useState<TabKey>("customers");
  const [isLoading, setIsLoading] = useState(true);
  const [customers, setCustomers] = useState<RecycleBinCustomer[]>([]);
  const [khatas, setKhatas] = useState<RecycleBinKhata[]>([]);
  const [transactions, setTransactions] = useState<RecycleBinTransaction[]>([]);

  // Per-row id currently mid-restore, so only that row's button spins.
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [isPurging, setIsPurging] = useState(false);
  const [purgeTarget, setPurgeTarget] = useState<PurgeTarget | null>(null);

  const fetchRecycleBin = useCallback(async () => {
    if (!selectedKhataId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const res = await recycleBinService.getByKhata(selectedKhataId);
      if (res.success && res.data) {
        setCustomers(res.data.customers || []);
        setKhatas(res.data.khatas || []);
        setTransactions(res.data.transactions || []);
      } else {
        toast.error("Failed to load Recycle Bin.");
      }
    } catch (error) {
      const apiError = error as ApiError;
      console.error("Fetch Recycle Bin Error:", error);
      toast.error(apiError.message || "Unable to connect to the server.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedKhataId]);

  useEffect(() => {
    fetchRecycleBin();
  }, [fetchRecycleBin]);

  const handleRestore = async (type: TabKey, id: string) => {
    setRestoringId(id);
    try {
      const res =
        type === "customers"
          ? await recycleBinService.restoreCustomer(id)
          : type === "khatas"
            ? await recycleBinService.restoreKhata(id)
            : await recycleBinService.restoreTransaction(id);

      if (res.success) {
        toast.success(res.message || "Restored successfully.");
        if (type === "customers") {
          setCustomers((prev) => prev.filter((c) => c.khata_customer_id !== id));
        } else if (type === "khatas") {
          setKhatas((prev) => prev.filter((k) => k.khata_id !== id));
        } else {
          setTransactions((prev) => prev.filter((t) => t.transaction_id !== id));
        }
      } else {
        toast.error(res.message || "Failed to restore.");
      }
    } catch (error) {
      const apiError = error as ApiError;
      console.error("Restore Error:", error);
      toast.error(apiError.message || "Unable to connect to the server.");
    } finally {
      setRestoringId(null);
    }
  };

  const handleConfirmPurge = async () => {
    if (!purgeTarget) return;
    const { type, id } = purgeTarget;

    setIsPurging(true);
    try {
      const res =
        type === "customers"
          ? await recycleBinService.purgeCustomer(id)
          : type === "khatas"
            ? await recycleBinService.purgeKhata(id)
            : await recycleBinService.purgeTransaction(id);

      if (res.success) {
        toast.success(res.message || "Deleted permanently.");
        if (type === "customers") {
          setCustomers((prev) => prev.filter((c) => c.khata_customer_id !== id));
        } else if (type === "khatas") {
          setKhatas((prev) => prev.filter((k) => k.khata_id !== id));
        } else {
          setTransactions((prev) => prev.filter((t) => t.transaction_id !== id));
        }
        setPurgeTarget(null);
      } else {
        toast.error(res.message || "Failed to delete permanently.");
      }
    } catch (error) {
      const apiError = error as ApiError;
      console.error("Purge Error:", error);
      toast.error(apiError.message || "Unable to connect to the server.");
    } finally {
      setIsPurging(false);
    }
  };

  const tabs: { key: TabKey; label: string; count: number }[] = [
    { key: "customers", label: "Customers", count: customers.length },
    { key: "khatas", label: "Khatas", count: khatas.length },
    { key: "transactions", label: "Transactions", count: transactions.length },
  ];

  return (
    <div className="w-full min-h-full bg-ledger-bg font-sans text-ledger-ink">
      <div className="mx-auto w-full max-w-5xl px-3 py-4 sm:px-6 sm:py-6">
        {/* PAGE HEADER */}
        <div className="mb-5 flex items-center gap-2 sm:mb-6 sm:gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Back"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-ledger-border bg-ledger-paper text-ledger-icon transition-colors hover:bg-ledger-hover-alt active:scale-95"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="min-w-0 flex-1">
            <h1 className="truncate font-serif text-xl font-semibold tracking-tight text-ledger-ink sm:text-2xl">
              Recycle Bin
            </h1>
            <p className="truncate text-xs font-medium text-ledger-subtle sm:text-sm">
              {selectedKhata?.name
                ? `Deleted items in ${selectedKhata.name}`
                : "Restore or permanently delete removed items"}
            </p>
          </div>

          {/* No other in-page way to reach the Khata list — this jumps there directly. */}
          <button
            type="button"
            onClick={() => navigate("/khatalist")}
            className="flex shrink-0 items-center gap-1.5 rounded-lg border border-ledger-border bg-ledger-paper px-2.5 py-2 text-xs font-semibold text-ledger-brass-dark shadow-2xs transition-colors hover:bg-ledger-hover active:scale-95 sm:gap-2 sm:px-4 sm:text-sm"
          >
            <BookOpen size={16} className="shrink-0" />
            <span className="hidden whitespace-nowrap xs:inline">Khata Book</span>
          </button>
        </div>

        {!selectedKhataId ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-ledger-border bg-ledger-paper px-6 py-16 text-center">
            <Inbox size={28} className="text-ledger-faint" />
            <p className="text-sm font-semibold text-ledger-muted">
              Select a Khata first to view its Recycle Bin.
            </p>
            <Button
              type="button"
              fullWidth={false}
              className="mt-2 w-auto px-5"
              onClick={() => navigate("/khatalist")}
            >
              Go to Khata Book
            </Button>
          </div>
        ) : (
          <>
            {/* TABS */}
            <div className="mb-4 flex w-full items-center gap-1.5 overflow-x-auto rounded-xl border border-ledger-border bg-ledger-paper p-1.5 sm:gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex flex-1 shrink-0 items-center justify-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold transition-colors sm:text-sm ${
                    activeTab === tab.key
                      ? "bg-ledger-ink text-white shadow-sm"
                      : "text-ledger-muted hover:bg-ledger-hover"
                  }`}
                >
                  <span className="whitespace-nowrap">{tab.label}</span>
                  <span
                    className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold ${
                      activeTab === tab.key
                        ? "bg-white/20 text-white"
                        : "bg-ledger-border-soft text-ledger-faint"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* CONTENT */}
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 rounded-2xl border border-ledger-border bg-ledger-paper px-6 py-16 text-ledger-muted">
                <Spinner size={18} className="text-ledger-brass-dark" />
                <span className="text-sm font-semibold">Loading Recycle Bin…</span>
              </div>
            ) : (
              <div className="space-y-2.5">
                {activeTab === "customers" &&
                  (customers.length === 0 ? (
                    <EmptyState icon={Users} label="No deleted customers." />
                  ) : (
                    customers.map((c) => (
                      <RowCard
                        key={c.khata_customer_id}
                        icon={Users}
                        title={c.customer_name}
                        subtitle={c.mobile_number ? `+91 ${c.mobile_number}` : undefined}
                        deletedAt={c.deleted_at}
                        isRestoring={restoringId === c.khata_customer_id}
                        onRestore={() => handleRestore("customers", c.khata_customer_id)}
                        onDelete={() =>
                          setPurgeTarget({
                            type: "customers",
                            id: c.khata_customer_id,
                            label: c.customer_name,
                          })
                        }
                      />
                    ))
                  ))}

                {activeTab === "khatas" &&
                  (khatas.length === 0 ? (
                    <EmptyState icon={BookOpen} label="No deleted khatas." />
                  ) : (
                    khatas.map((k) => (
                      <RowCard
                        key={k.khata_id}
                        icon={BookOpen}
                        title={k.khata_name}
                        deletedAt={k.deleted_at}
                        isRestoring={restoringId === k.khata_id}
                        onRestore={() => handleRestore("khatas", k.khata_id)}
                        onDelete={() =>
                          setPurgeTarget({
                            type: "khatas",
                            id: k.khata_id,
                            label: k.khata_name,
                          })
                        }
                      />
                    ))
                  ))}

                {activeTab === "transactions" &&
                  (transactions.length === 0 ? (
                    <EmptyState icon={Receipt} label="No deleted transactions." />
                  ) : (
                    transactions.map((t) => (
                      <RowCard
                        key={t.transaction_id}
                        icon={Receipt}
                        title={t.customer_name}
                        subtitle={t.description || undefined}
                        amount={t.amount}
                        transactionType={t.transaction_type}
                        deletedAt={t.deleted_at}
                        isRestoring={restoringId === t.transaction_id}
                        onRestore={() => handleRestore("transactions", t.transaction_id)}
                        onDelete={() =>
                          setPurgeTarget({
                            type: "transactions",
                            id: t.transaction_id,
                            label: `${t.customer_name}'s entry`,
                          })
                        }
                      />
                    ))
                  ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* DELETE FOREVER CONFIRMATION MODAL */}
      <Modal
        open={!!purgeTarget}
        onClose={() => !isPurging && setPurgeTarget(null)}
        title="Delete Forever?"
        preventClose={isPurging}
        size="sm"
        tone="danger"
      >
        <div className="p-6 text-center sm:p-7">
          <p className="text-sm font-medium leading-relaxed text-slate-600 sm:text-base">
            Are you sure you want to permanently delete{" "}
            <span className="font-bold text-slate-900">{purgeTarget?.label}</span>?
            This action cannot be undone.
          </p>

          <div className="mt-8 flex items-center justify-center gap-4">
            <Button
              type="button"
              variant="secondary"
              fullWidth={false}
              disabled={isPurging}
              onClick={() => setPurgeTarget(null)}
              className="w-28 sm:w-32"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="dangerSolid"
              fullWidth={false}
              loading={isPurging}
              onClick={handleConfirmPurge}
              className="w-28 sm:w-32"
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  label,
}: {
  icon: typeof Inbox;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-ledger-border bg-ledger-paper px-6 py-14 text-center">
      <Icon size={26} className="text-ledger-faint" />
      <p className="text-sm font-semibold text-ledger-muted">{label}</p>
    </div>
  );
}

function RowCard({
  icon: Icon,
  title,
  subtitle,
  amount,
  transactionType,
  deletedAt,
  isRestoring,
  onRestore,
  onDelete,
}: {
  icon: typeof Users;
  title: string;
  subtitle?: string;
  amount?: string;
  transactionType?: "LENE" | "DENE";
  deletedAt: string;
  isRestoring: boolean;
  onRestore: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-ledger-border bg-ledger-paper p-3.5 shadow-2xs sm:flex-row sm:items-center sm:justify-between sm:p-4">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ledger-brass/10 text-ledger-brass-dark">
          <Icon size={18} />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="truncate font-serif text-sm font-semibold text-ledger-ink sm:text-base">
              {title}
            </p>
            {amount && (
              <span
                className={`shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                  transactionType === "LENE"
                    ? "bg-ledger-red-wash text-ledger-red"
                    : "bg-ledger-green-wash text-ledger-green-dark"
                }`}
              >
                ₹{parseFloat(amount).toLocaleString("en-IN")}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="truncate text-xs font-medium text-ledger-subtle">{subtitle}</p>
          )}
          <p className="truncate text-[11px] font-medium text-ledger-faint">
            Deleted {formatDeletedAt(deletedAt)}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 self-end sm:self-auto">
        <Button
          type="button"
          variant="secondary"
          fullWidth={false}
          loading={isRestoring}
          loadingText="Restoring..."
          icon={<RotateCcw size={14} />}
          onClick={onRestore}
          className="px-3 py-2 text-xs"
        >
          Restore
        </Button>
        <Button
          type="button"
          variant="danger"
          fullWidth={false}
          disabled={isRestoring}
          icon={<Trash2 size={14} />}
          onClick={onDelete}
          className="px-3 py-2 text-xs"
        >
          Delete
        </Button>
      </div>
    </div>
  );
}
