import React, { useState } from "react";

export default function PaymentTransferForm() {
  const [toCustomer, setToCustomer] = useState("");
  const [fromCustomer, setFromCustomer] = useState("");
  const [amount, setAmount] = useState("");
  const [details, setDetails] = useState("");

  const customersList = ["Javed", "Achintaya", "Shivam", "Rahul", "Aman"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!toCustomer || !fromCustomer || !amount) {
      alert("Please fill in all required fields.");
      return;
    }
    alert(
      `Transaction Successful!\nFrom: ${fromCustomer}\nTo: ${toCustomer}\nAmount: ₹${amount}\nDetails: ${details || "N/A"}`
    );
  };

  return (
    <div className="min-h-screen w-full bg-slate-100 p-3 sm:p-6 font-sans text-slate-800 flex justify-center items-start pt-6 sm:pt-12">
      
      {/* Outer Main Container Box */}
      <div className="w-full max-w-5xl rounded-lg border border-slate-300 bg-white p-4 shadow-sm sm:p-8">
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          
          {/* 1. To Customer Field */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-red-600 block">
              To Customer
            </label>
            <div className="relative rounded-md border border-slate-200 bg-white shadow-2xs transition-all focus-within:border-indigo-600 focus-within:ring-1 focus-within:ring-indigo-600">
              <select
                value={toCustomer}
                onChange={(e) => setToCustomer(e.target.value)}
                className="w-full rounded-md bg-transparent px-3.5 py-3 text-sm font-medium text-slate-700 outline-none cursor-pointer appearance-none"
              >
                <option value="" disabled>
                  Select Customer
                </option>
                {customersList.map((cust) => (
                  <option key={cust} value={cust}>
                    {cust}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                ▼
              </div>
            </div>
          </div>

          {/* 2. From Customer Field */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-emerald-600 block">
              From Customer
            </label>
            <div className="relative rounded-md border border-slate-200 bg-white shadow-2xs transition-all focus-within:border-indigo-600 focus-within:ring-1 focus-within:ring-indigo-600">
              <select
                value={fromCustomer}
                onChange={(e) => setFromCustomer(e.target.value)}
                className="w-full rounded-md bg-transparent px-3.5 py-3 text-sm font-medium text-slate-700 outline-none cursor-pointer appearance-none"
              >
                <option value="" disabled>
                  Select Customer
                </option>
                {customersList.map((cust) => (
                  <option key={cust} value={cust}>
                    {cust}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                ▼
              </div>
            </div>
          </div>

          {/* 3. Enter Amount Field */}
          <div className="space-y-1">
            <div className="relative flex items-center rounded-md border border-slate-200 bg-white px-3.5 py-3 shadow-2xs transition-all focus-within:border-indigo-600 focus-within:ring-1 focus-within:ring-indigo-600">
              <input
                type="number"
                value={amount}
                onChange={(e) => {
                  if (e.target.value.length <= 9) {
                    setAmount(e.target.value);
                  }
                }}
                placeholder="Enter Amount"
                className="w-full bg-transparent text-sm font-bold text-slate-700 outline-none placeholder:text-slate-400 placeholder:font-bold"
              />
              <div className="flex flex-col text-[10px] text-slate-400 pl-2 cursor-pointer select-none">
                <span>▲</span>
                <span>▼</span>
              </div>
            </div>
            <div className="text-right text-[11px] font-medium text-slate-400">
              {amount.length}/9
            </div>
          </div>

          {/* 4. Enter Details Field */}
          <div className="space-y-1">
            <div className="relative rounded-md border border-slate-200 bg-white px-3.5 py-3 shadow-2xs transition-all focus-within:border-indigo-600 focus-within:ring-1 focus-within:ring-indigo-600">
              <input
                type="text"
                maxLength={36}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Enter Details"
                className="w-full bg-transparent text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400"
              />
            </div>
            <div className="text-right text-[11px] font-medium text-slate-400">
              {details.length}/36
            </div>
          </div>

          {/* 5. Pay Action Button */}
          <button
            type="submit"
            className="mt-2 w-full rounded-md bg-[#3c2a93] py-3.5 text-sm font-bold text-white shadow-md transition-all hover:bg-[#32227d] active:scale-[0.99]"
          >
            Pay
          </button>

        </form>
      </div>

    </div>
  );
}