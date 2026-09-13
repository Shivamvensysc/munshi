import { useState, useEffect } from "react";
import { Receipt } from "lucide-react";
import Spinner from "../components/ui/Spinner";
import { customerService, type CustomerApiData } from "../services";
import { useKhata } from "../context/KhataContext";
import type { ApiError } from "../lib/apiClient";

interface Entry {
  id: string;
  name: string;
  description: string;
  date: string;
  subName?: string;
  leneAmount?: string;
  deneAmount?: string;
  status?: string;
}

// Format ISO date to readable string (e.g. 10-09-2026 12:26 PM)
function formatDate(isoString: string | null | undefined): string {
  if (!isoString) return "";
  const dateObj = new Date(isoString);
  if (isNaN(dateObj.getTime())) return isoString;

  const day = String(dateObj.getDate()).padStart(2, "0");
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const year = dateObj.getFullYear();

  let hours = dateObj.getHours();
  const minutes = String(dateObj.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;

  return `${day}-${month}-${year} ${String(hours).padStart(2, "0")}:${minutes} ${ampm}`;
}

export default function LedgerEntriesList() {
  const { selectedKhataId, isLoadingKhatas } = useKhata();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchKhataEntries = async () => {
    if (!selectedKhataId) {
      // The khata list is still loading on first mount — selectedKhataId is
      // briefly null before that resolves. Only show the "no khata" message
      // once we know for sure there really isn't one, so the list doesn't
      // flash an error before the real khata loads in.
      if (!isLoadingKhatas) {
        setErrorMsg("No active Khata selected.");
        setIsFetching(false);
      }
      return;
    }

    setIsFetching(true);
    setErrorMsg(null);

    try {
      const data = await customerService.listByKhata(selectedKhataId);

      if (data.success && Array.isArray(data.data)) {
        const mappedEntries: Entry[] = data.data.map(
          (item: CustomerApiData) => {
            const lene = parseFloat(String(item.total_lene || "0"));
            const dene = parseFloat(String(item.total_dene || "0"));

            return {
              id: item.khata_customer_id,
              name: item.customer_name,
              description:
                item.address || item.mobile_number || "No address provided",
              date: formatDate(item.last_activity_date || item.created_at),
              subName: item.mobile_number
                ? `Mob: ${item.mobile_number}`
                : undefined,
              leneAmount:
                lene > 0 ? `₹ ${lene.toLocaleString("en-IN")}` : undefined,
              deneAmount:
                dene > 0 ? `₹ ${dene.toLocaleString("en-IN")}` : undefined,
              status: item.is_active ? "CRE" : undefined,
            };
          },
        );

        setEntries(mappedEntries);
      } else {
        setErrorMsg(data.message || "Failed to fetch entries.");
      }
    } catch (error) {
      const apiError = error as ApiError;
      console.error("Fetch Entries Error:", error);
      setErrorMsg(apiError.message || "Unable to connect to the server.");
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchKhataEntries();
    // Re-fetch whenever the active khata changes in the header, and once
    // more when khata loading finishes (see fetchKhataEntries above).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedKhataId, isLoadingKhatas]);

  return (
    <div className="w-full min-h-full bg-ledger-bg font-sans text-ledger-ink">
      <div className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-6 sm:py-6">
        {/* PAGE HEADING */}
        <div className="mb-5 flex flex-col gap-1 sm:mb-6">
          <h1 className="font-serif text-xl font-semibold tracking-tight text-ledger-ink sm:text-2xl">
            Transactions
          </h1>
          <p className="text-xs font-medium text-ledger-subtle sm:text-sm">
            Every lene / dene entry recorded across your khata, newest first.
          </p>
        </div>

        <div className="w-full overflow-hidden rounded-2xl border border-ledger-border bg-ledger-paper shadow-sm">
          {/* Header Bar — part of the same table, stays with the columns below it */}
          <div className="grid grid-cols-12 items-center gap-2 border-b border-ledger-ink/15 bg-ledger-hover px-4 py-2.5 text-[13px] font-semibold text-ledger-muted">
            <div className="col-span-6 flex items-center gap-1.5 sm:col-span-5">
              <Receipt size={14} className="text-ledger-brass-dark" />
              <span>Entries</span>
            </div>
            <div className="col-span-3 text-center sm:col-span-3">Lene</div>
            <div className="col-span-3 pr-1 text-right sm:col-span-4">Dene</div>
          </div>

          {/* Entries List */}
          <div>
            {isFetching ? (
              <div className="flex items-center justify-center gap-2 py-12 text-xs font-medium text-ledger-faint sm:text-sm">
                <Spinner size={18} className="text-ledger-brass-dark" />
                <span>Loading transactions...</span>
              </div>
            ) : errorMsg ? (
              <div className="py-8 text-center text-xs font-medium text-ledger-red sm:text-sm">
                {errorMsg}
              </div>
            ) : entries.length === 0 ? (
              <div className="py-8 text-center text-xs font-medium text-ledger-faint sm:text-sm">
                No entries found for this Khata.
              </div>
            ) : (
              entries.map((item, idx) => (
                <div
                  key={item.id}
                  className={`grid grid-cols-12 items-center px-4 py-3.5 transition-colors hover:bg-ledger-hover/70 ${
                    idx !== 0 ? "border-t border-ledger-border-soft" : ""
                  }`}
                >
                  {/* Left Column: Entries Details */}
                  <div className="col-span-6 space-y-0.5 sm:col-span-5">
                    <div className="text-[15px] font-semibold text-ledger-ink">
                      {item.name}
                    </div>
                    <div className="whitespace-pre-line text-xs font-medium text-ledger-muted">
                      {item.description}
                    </div>
                    <div className="text-[11px] font-medium text-ledger-faint">
                      {item.date}
                    </div>
                    {item.subName && (
                      <div className="text-xs font-semibold text-ledger-brass-dark">
                        {item.subName}
                      </div>
                    )}
                  </div>

                  {/* Middle Column: LENE Amount */}
                  <div className="col-span-3 text-center">
                    {item.leneAmount && (
                      <span className="font-serif text-xs font-semibold tabular-nums text-ledger-red sm:text-sm">
                        {item.leneAmount}
                      </span>
                    )}
                  </div>

                  {/* Right Column: DENE Amount & Status Badge */}
                  <div className="col-span-3 flex items-center justify-end gap-3 pr-1 sm:col-span-4">
                    {item.deneAmount && (
                      <span className="font-serif text-xs font-semibold tabular-nums text-ledger-green sm:text-sm">
                        {item.deneAmount}
                      </span>
                    )}
                    {item.status && (
                      <span className="rounded-full bg-ledger-brass/10 px-2 py-0.5 text-[10px] font-bold text-ledger-brass-dark">
                        {item.status}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
