import React, { useState } from "react";

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

const initialEntries: Entry[] = [
  {
    id: "1",
    name: "Javed",
    description: "Cross",
    date: "09-09-2026 11:55:49 AM",
    subName: "Achintaya",
    leneAmount: "₹ 5,000",
    status: "CRE",
  },
  {
    id: "2",
    name: "Achintaya",
    description: "Cross",
    date: "09-09-2026 11:55:49 AM",
    subName: "Javed",
    deneAmount: "₹ 5,000",
    status: "CRE",
  },
  {
    id: "3",
    name: "Shivam",
    description: "Cash",
    date: "09-09-2026 11:45:57 AM",
    deneAmount: "₹ 50,000",
  },
  {
    id: "4",
    name: "Shivam",
    description: "Cash Mein Diye",
    date: "09-09-2026 11:45:14 AM",
    deneAmount: "₹ 1,00,000",
  },
  {
    id: "5",
    name: "Shivam",
    description: "Cash For Car",
    date: "09-09-2026 11:44:50 AM",
    leneAmount: "₹ 6,00,000",
  },
  {
    id: "6",
    name: "Javed",
    description: "Cash mein after 0 amo\nunt",
    date: "08-09-2026 08:15:26 PM",
    deneAmount: "₹ 15,000",
  },
];

export default function LedgerEntriesList() {
  const [entries] = useState<Entry[]>(initialEntries);

  return (
    <div className="min-h-screen w-full bg-slate-100 p-2 sm:p-4 font-sans text-slate-900">
      <div className="mx-auto w-full max-w-[1400px] overflow-hidden rounded-md border border-slate-300 bg-white shadow-xs">
        
        {/* Blue Header Bar */}
        <div className="grid grid-cols-12 bg-[#5d8cd6] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white">
          <div className="col-span-6 sm:col-span-5">ENTRIES</div>
          <div className="col-span-3 text-center sm:col-span-3">LENE</div>
          <div className="col-span-3 text-right sm:col-span-4 pr-1">DENE</div>
        </div>

        {/* Entries Cards List */}
        <div className="space-y-3 bg-slate-200/50 p-2 sm:p-3">
          {entries.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-12 items-center rounded-lg border border-slate-300 bg-white px-4 py-3 shadow-xs transition-all hover:border-slate-400"
            >
              {/* Left Column: Entries Details */}
              <div className="col-span-6 space-y-0.5 sm:col-span-5">
                <div className="text-sm font-extrabold text-slate-900">
                  {item.name}
                </div>
                <div className="whitespace-pre-line text-xs font-semibold text-slate-700">
                  {item.description}
                </div>
                <div className="text-[11px] font-semibold text-slate-500">
                  {item.date}
                </div>
                {item.subName && (
                  <div className="text-xs font-bold text-blue-700">
                    {item.subName}
                  </div>
                )}
              </div>

              {/* Middle Column: LENE Amount */}
              <div className="col-span-3 text-center">
                {item.leneAmount && (
                  <span className="text-xs font-black text-red-600 sm:text-sm">
                    {item.leneAmount}
                  </span>
                )}
              </div>

              {/* Right Column: DENE Amount & Status Badge */}
              <div className="col-span-3 flex items-center justify-end gap-3 pr-1 sm:col-span-4">
                {item.deneAmount && (
                  <span className="text-xs font-black text-emerald-700 sm:text-sm">
                    {item.deneAmount}
                  </span>
                )}
                {item.status && (
                  <span className="text-xs font-black text-blue-800">
                    {item.status}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}