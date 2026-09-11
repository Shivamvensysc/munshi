import { useState, useEffect } from "react";
import { Receipt } from "lucide-react";
import Spinner from "../components/ui/Spinner";
import { customerService, type CustomerApiData } from "../services";
import { tokenStore } from "../auth/tokenStore";
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
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchKhataEntries = async () => {
    const khataId = tokenStore.getKhataId();
    if (!khataId) {
      setErrorMsg("No active Khata selected.");
      setIsFetching(false);
      return;
    }

    setIsFetching(true);
    setErrorMsg(null);

    try {
      const data = await customerService.listByKhata(khataId);

      if (data.success && Array.isArray(data.data)) {
        const mappedEntries: Entry[] = data.data.map((item: CustomerApiData) => {
          const lene = parseFloat(String(item.total_lene || "0"));
          const dene = parseFloat(String(item.total_dene || "0"));

          return {
            id: item.khata_customer_id,
            name: item.customer_name,
            description: item.address || item.mobile_number || "No address provided",
            date: formatDate(item.last_activity_date || item.created_at),
            subName: item.mobile_number ? `Mob: ${item.mobile_number}` : undefined,
            leneAmount: lene > 0 ? `₹ ${lene.toLocaleString("en-IN")}` : undefined,
            deneAmount: dene > 0 ? `₹ ${dene.toLocaleString("en-IN")}` : undefined,
            status: item.is_active ? "CRE" : undefined,
          };
        });

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full font-sans text-ink-900">
      {/* PAGE HEADING */}
      <div className="mb-5 flex flex-col gap-1 sm:mb-6">
        <h1 className="text-xl font-extrabold tracking-tight text-ink-900 sm:text-2xl">
          Transactions
        </h1>
        <p className="text-xs font-medium text-ink-500 sm:text-sm">
          Every lene / dene entry recorded across your khata, newest first.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
        {/* Header Bar */}
        <div className="grid grid-cols-12 items-center gap-2 bg-gradient-to-r from-brand-700 to-brand-600 px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-white sm:text-xs">
          <div className="col-span-6 flex items-center gap-1.5 sm:col-span-5">
            <Receipt size={13} />
            <span>Entries</span>
          </div>
          <div className="col-span-3 text-center sm:col-span-3">Lene</div>
          <div className="col-span-3 pr-1 text-right sm:col-span-4">Dene</div>
        </div>

        {/* Entries Cards List */}
        <div className="space-y-2.5 bg-slate-50/60 p-2.5 sm:p-3.5">
          {isFetching ? (
            <div className="flex items-center justify-center py-12 text-slate-400 gap-2 text-xs font-semibold sm:text-sm">
              <Spinner size={18} className="text-brand-600" />
              <span>Loading transactions...</span>
            </div>
          ) : errorMsg ? (
            <div className="py-8 text-center text-xs font-medium text-red-500 sm:text-sm">
              {errorMsg}
            </div>
          ) : entries.length === 0 ? (
            <div className="py-8 text-center text-xs font-medium text-slate-400 sm:text-sm">
              No entries found for this Khata.
            </div>
          ) : (
            entries.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-12 items-center rounded-xl border border-slate-200 bg-white px-4 py-3.5 shadow-xs transition-all hover:border-brand-200 hover:shadow-sm"
              >
                {/* Left Column: Entries Details */}
                <div className="col-span-6 space-y-0.5 sm:col-span-5">
                  <div className="text-sm font-extrabold text-ink-900">{item.name}</div>
                  <div className="whitespace-pre-line text-xs font-semibold text-ink-700">
                    {item.description}
                  </div>
                  <div className="text-[11px] font-semibold text-ink-300">{item.date}</div>
                  {item.subName && (
                    <div className="text-xs font-bold text-brand-700">{item.subName}</div>
                  )}
                </div>

                {/* Middle Column: LENE Amount */}
                <div className="col-span-3 text-center">
                  {item.leneAmount && (
                    <span className="text-xs font-black text-debit-600 sm:text-sm">
                      {item.leneAmount}
                    </span>
                  )}
                </div>

                {/* Right Column: DENE Amount & Status Badge */}
                <div className="col-span-3 flex items-center justify-end gap-3 pr-1 sm:col-span-4">
                  {item.deneAmount && (
                    <span className="text-xs font-black text-credit-600 sm:text-sm">
                      {item.deneAmount}
                    </span>
                  )}
                  {item.status && (
                    <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-black text-brand-800">
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
  );
}
