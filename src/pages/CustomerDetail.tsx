import { useState, useEffect, useCallback, type FormEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Pencil,
  FileText,
  Trash2,
  AlertCircle,
  Check,
} from "lucide-react";
import { toast } from "react-toastify";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Modal from "../components/ui/Modal";
import Spinner from "../components/ui/Spinner";
import Button from "../components/Button";
import {
  customerService,
  transactionService,
  type CustomerApiData,
  type TransactionApiData,
  type StatementReportResponse,
} from "../services";
import type { ApiError } from "../lib/apiClient";

// --- UI Models ---
interface Entry {
  id: string;
  title: string;
  date: string;
  subPerson?: string;
  balance: string;
  leneAmount?: string;
  deneAmount?: string;
  // Raw fields kept around so the Edit modal can be pre-filled without
  // re-parsing the formatted display strings above.
  rawAmount: number;
  rawType: "LENE" | "DENE";
  rawDescription: string;
  rawReferenceNumber: string;
  rawTransactionDate: string; // yyyy-mm-dd, ready for an <input type="date">
}

type ModalType =
  | "LENE"
  | "DENE"
  | "EDIT_CUSTOMER"
  | "DELETE_CONFIRM"
  | "MONDAY_FINAL_CONFIRM"
  | "EDIT_TRANSACTION"
  | "DELETE_TRANSACTION_CONFIRM"
  | null;

export default function CustomerDetail() {
  const { khataCustomerId } = useParams<{ khataCustomerId: string }>();
  const navigate = useNavigate();

  // Component States
  const [entries, setEntries] = useState<Entry[]>([]);
  const [customer, setCustomer] = useState<CustomerApiData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState<boolean>(false);

  // Active Modal State
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  // Per-row "confirmed" toggle (N ⇄ Y). Not backed by an API field — purely
  // a UI lock: while a row is "N" its Edit/Delete icons are shown, and
  // flipping it to "Y" hides them so a verified/settled entry can't be
  // accidentally changed. Defaults to "N" for every entry.
  const [confirmMap, setConfirmMap] = useState<Record<string, "Y" | "N">>({});
  const getConfirmStatus = (id: string): "Y" | "N" => confirmMap[id] ?? "N";
  const toggleConfirmStatus = (id: string) => {
    setConfirmMap((prev) => ({ ...prev, [id]: getConfirmStatus(id) === "Y" ? "N" : "Y" }));
  };

  // Transaction currently targeted by the Edit/Delete modals.
  const [activeTransaction, setActiveTransaction] = useState<Entry | null>(null);

  // Edit Transaction Form State
  const [editAmount, setEditAmount] = useState<string>("");
  const [editDescription, setEditDescription] = useState<string>("");
  const [editReferenceNumber, setEditReferenceNumber] = useState<string>("");
  const [editTransactionDate, setEditTransactionDate] = useState<string>("");

  // Lene/Dene Form State
  const [amountInput, setAmountInput] = useState<string>("");
  const [detailsInput, setDetailsInput] = useState<string>("");

  // Customer Profile Edit Form State
  const [customerName, setCustomerName] = useState<string>("");
  const [customerPhone, setCustomerPhone] = useState<string>("");
  const [customerAddress, setCustomerAddress] = useState<string>("");

  // Format date string for UI display
  const formatDateString = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date
        .toLocaleString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
        .replace(/\//g, "-")
        .toUpperCase();
    } catch {
      return dateStr;
    }
  };

  // Helper date formatter for PDF report
  const formatPdfDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  // Map backend API transaction to UI Entry shape
  const mapTransactionToEntry = (tx: TransactionApiData): Entry => {
    const numAmount = parseFloat(String(tx.amount || "0"));
    const numBalance = parseFloat(String(tx.running_balance || "0"));
    const rawDateSource = tx.transaction_date || tx.created_at || new Date().toISOString();
    const parsedDate = new Date(rawDateSource);
    const rawTransactionDate = isNaN(parsedDate.getTime())
      ? new Date().toISOString().slice(0, 10)
      : parsedDate.toISOString().slice(0, 10);

    return {
      id: tx.transaction_id,
      title: tx.description || (tx.transaction_type === "LENE" ? "Lene Entry" : "Dene Entry"),
      date: formatDateString(tx.created_at || tx.transaction_date || new Date().toISOString()),
      balance: numBalance.toLocaleString("en-IN"),
      ...(tx.transaction_type === "LENE"
        ? { leneAmount: numAmount.toLocaleString("en-IN") }
        : { deneAmount: numAmount.toLocaleString("en-IN") }),
      rawAmount: numAmount,
      rawType: tx.transaction_type,
      rawDescription: tx.description || "",
      rawReferenceNumber: tx.reference_number || "",
      rawTransactionDate,
    };
  };

  // GET API: Fetch customer details and then fetch transactions using customer_id (partyId)
  const fetchCustomerAndTransactions = useCallback(async () => {
    if (!khataCustomerId) {
      toast.error("Invalid customer identifier.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      // Step 1: Retrieve customer party metadata
      const customerData = await customerService.getById(khataCustomerId);

      if (!customerData.success || !customerData.data) {
        toast.error(customerData.message || "Failed to load customer profile.");
        setIsLoading(false);
        return;
      }

      const partyRecord = customerData.data;
      setCustomer(partyRecord);
      setCustomerName(partyRecord.customer_name || "");
      setCustomerPhone(partyRecord.mobile_number || "");
      setCustomerAddress(partyRecord.address || "");

      // Step 2: Retrieve transactions using customer_id (partyId)
      const partyId = partyRecord.customer_id;

      if (!partyId) {
        toast.error("Party customer ID not found on customer record.");
        setIsLoading(false);
        return;
      }

      const transactionsData = await transactionService.listByParty(partyId);

      if (transactionsData.success) {
        if (transactionsData.customer) {
          setCustomer((prev) =>
            prev
              ? ({
                  ...prev,
                  ...(transactionsData.customer as Partial<CustomerApiData>),
                  address: prev.address || (transactionsData.customer?.address as string) || "",
                } as CustomerApiData)
              : prev
          );
        }

        if (Array.isArray(transactionsData.data)) {
          setEntries(transactionsData.data.map(mapTransactionToEntry));
        } else {
          setEntries([]);
        }
      } else {
        toast.error(transactionsData.message || "Failed to load transactions.");
      }
    } catch (error) {
      const apiError = error as ApiError;
      console.error("Fetch Details Error:", error);
      toast.error(apiError.message || "Unable to connect to the server.");
    } finally {
      setIsLoading(false);
    }
  }, [khataCustomerId]);

  useEffect(() => {
    fetchCustomerAndTransactions();
  }, [fetchCustomerAndTransactions]);

  const handleModalClose = () => {
    setActiveModal(null);
    setAmountInput("");
    setDetailsInput("");
    setActiveTransaction(null);
  };

  const handleOpenModal = (type: ModalType) => {
    setAmountInput("");
    setDetailsInput("");
    setActiveModal(type);
  };

  // Opens the Edit Transaction modal, pre-filled from the row's raw data.
  const handleOpenEditTransaction = (entry: Entry) => {
    setActiveTransaction(entry);
    setEditAmount(String(entry.rawAmount));
    setEditDescription(entry.rawDescription);
    setEditReferenceNumber(entry.rawReferenceNumber);
    setEditTransactionDate(entry.rawTransactionDate);
    setActiveModal("EDIT_TRANSACTION");
  };

  // Opens the delete confirmation "pop modal" for a single transaction row.
  const handleOpenDeleteTransaction = (entry: Entry) => {
    setActiveTransaction(entry);
    setActiveModal("DELETE_TRANSACTION_CONFIRM");
  };

  // PUT API: Update an existing transaction (amount / description / reference / date)
  const handleUpdateTransactionSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!activeTransaction) return;

    const parsedAmount = parseFloat(editAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error("Please enter a valid amount greater than zero.");
      return;
    }

    setIsSubmitting(true);

    try {
      const data = await transactionService.update(activeTransaction.id, {
        amount: parsedAmount,
        description: editDescription.trim(),
        reference_number: editReferenceNumber.trim(),
        transaction_date: editTransactionDate,
      });

      if (data.success) {
        toast.success(data.message || "Transaction updated successfully!");
        handleModalClose();
        fetchCustomerAndTransactions();
      } else {
        toast.error(data.message || "Failed to update transaction.");
      }
    } catch (error) {
      const apiError = error as ApiError;
      console.error("Transaction Update Error:", error);
      toast.error(apiError.message || "Unable to connect to the server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // DELETE API: Delete a single transaction, called after the confirmation
  // pop modal's "Yes" is clicked.
  const handleConfirmDeleteTransaction = async () => {
    if (!activeTransaction) return;

    setIsSubmitting(true);

    try {
      const data = await transactionService.remove(activeTransaction.id);

      if (data.success ?? true) {
        toast.success(data.message || "Transaction deleted successfully.");
        handleModalClose();
        fetchCustomerAndTransactions();
      } else {
        toast.error(data.message || "Failed to delete transaction.");
      }
    } catch (error) {
      const apiError = error as ApiError;
      console.error("Transaction Delete Error:", error);
      toast.error(apiError.message || "Unable to connect to the server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // PDF Generator using Statement Report API Response
  const generateStatementPdf = (report: StatementReportResponse["data"]) => {
    const doc = new jsPDF("p", "pt", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 36; // 0.5 inch

    // 1. Business Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(30, 41, 59);
    doc.text(report.business.khata_name || "Business Ledger", margin, 48);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Mobile: ${report.business.owner_mobile || "N/A"}`, margin, 64);

    // Customer & Period Info Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    doc.text(`Customer: ${report.customer.customer_name}`, pageWidth - margin, 48, {
      align: "right",
    });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Mobile: ${report.customer.mobile_number || "N/A"}`, pageWidth - margin, 64, {
      align: "right",
    });
    if (report.customer.address) {
      doc.text(`Address: ${report.customer.address}`, pageWidth - margin, 78, { align: "right" });
    }

    // Horizontal Divider
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(1);
    doc.line(margin, 90, pageWidth - margin, 90);

    // 2. Summary Boxes Table
    const formattedOpening = Number(report.summary.opening_balance || 0).toLocaleString("en-IN");
    const formattedLene = Number(report.summary.total_received_lene || 0).toLocaleString("en-IN");
    const formattedDene = Number(report.summary.total_given_dene || 0).toLocaleString("en-IN");
    const formattedNet = Number(report.summary.closing_balance || 0).toLocaleString("en-IN");

    autoTable(doc, {
      startY: 100,
      margin: { left: margin, right: margin },
      head: [["Opening Balance", "Total Lene (-)", "Total Dene (+)", "Net Balance"]],
      body: [
        [`Rs. ${formattedOpening}`, `Rs. ${formattedLene}`, `Rs. ${formattedDene}`, `Rs. ${formattedNet}`],
        [
          "",
          "",
          "",
          report.summary.status === "YOU_WILL_GET"
            ? `(${report.customer.customer_name} will give)`
            : `(You will give)`,
        ],
      ],
      theme: "grid",
      headStyles: {
        fillColor: [241, 245, 249],
        textColor: [51, 65, 85],
        fontStyle: "bold",
        fontSize: 9,
        halign: "center",
      },
      bodyStyles: {
        textColor: [15, 23, 42],
        fontSize: 10,
        fontStyle: "bold",
        halign: "center",
      },
      alternateRowStyles: {
        fillColor: [255, 255, 255],
        textColor: [100, 116, 139],
        fontSize: 8,
        fontStyle: "italic",
      },
    });

    const summaryEndY = (doc as any).lastAutoTable.finalY + 14;

    // Sub-header entry count
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text(`No. of Entries: ${report.transactions?.length || 0}`, margin, summaryEndY);

    // 3. Transactions Table
    const tableRows = (report.transactions || []).map((t) => [
      formatPdfDate(t.date),
      t.description || (t.type === "LENE" ? "Lene Entry" : "Dene Entry"),
      t.type === "LENE" ? `Rs. ${Number(t.amount).toLocaleString("en-IN")}` : "-",
      t.type === "DENE" ? `Rs. ${Number(t.amount).toLocaleString("en-IN")}` : "-",
      `Rs. ${Number(t.balance).toLocaleString("en-IN")}`,
    ]);

    autoTable(doc, {
      startY: summaryEndY + 6,
      margin: { left: margin, right: margin },
      head: [["Date", "Details", "Lene (-)", "Dene (+)", "Balance"]],
      body: [
        [
          formatPdfDate(
            report.period.start_date !== "Beginning" ? report.period.start_date : new Date().toISOString()
          ),
          "Opening balance",
          "-",
          "-",
          `Rs. ${formattedOpening}`,
        ],
        ...tableRows,
      ],
      foot: [["Grand Total", "", `Rs. ${formattedLene}`, `Rs. ${formattedDene}`, `Rs. ${formattedNet}`]],
      theme: "striped",
      headStyles: {
        fillColor: [79, 70, 229],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 9,
      },
      footStyles: {
        fillColor: [248, 250, 252],
        textColor: [15, 23, 42],
        fontStyle: "bold",
        fontSize: 9,
      },
      styles: {
        fontSize: 8.5,
        cellPadding: 6,
        textColor: [30, 41, 59],
      },
      columnStyles: {
        0: { cellWidth: 75 },
        1: { cellWidth: "auto" },
        2: { halign: "right", cellWidth: 80, textColor: [220, 38, 38] },
        3: { halign: "right", cellWidth: 80, textColor: [22, 163, 74] },
        4: { halign: "right", cellWidth: 85, fontStyle: "bold" },
      },
      didDrawPage: (data) => {
        // Footer info on each page
        const pageCount = (doc.internal as any).getNumberOfPages();
        const pageHeight = doc.internal.pageSize.getHeight();

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);

        const now = new Date();
        const formattedTime = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        const formattedReportDate = now.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "2-digit",
        });

        doc.text(`Report Generated: ${formattedTime} | ${formattedReportDate}`, margin, pageHeight - 20);

        doc.text(`Page ${data.pageNumber} of ${pageCount}`, pageWidth - margin, pageHeight - 20, {
          align: "right",
        });
      },
    });

    // Save and download PDF file
    const safeCustomerName = (report.customer.customer_name || "Customer").replace(/\s+/g, "_");
    doc.save(`${safeCustomerName}_statement_${Date.now()}.pdf`);
  };

  // GET API: Fetch JSON Statement Data & Generate PDF
  const handleDownloadPdf = async () => {
    const partyId = customer?.customer_id;
    if (!partyId) {
      toast.error("Customer party ID not found.");
      return;
    }

    setIsDownloadingPdf(true);

    try {
      const result = await transactionService.statementReport(partyId);

      if (result.success && result.data) {
        generateStatementPdf(result.data);
        toast.success("Statement PDF downloaded successfully!");
      } else {
        toast.error(result.message || "Failed to generate statement report.");
      }
    } catch (error) {
      const apiError = error as ApiError;
      console.error("PDF Download Error:", error);
      toast.error(apiError.message || "Unable to download statement PDF.");
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  // POST API: Create LENE or DENE Transaction
  const handleEntrySubmit = async (e: FormEvent) => {
    e.preventDefault();

    const parsedAmount = parseFloat(amountInput);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error("Please enter a valid amount greater than zero.");
      return;
    }

    if (!activeModal || (activeModal !== "LENE" && activeModal !== "DENE")) {
      return;
    }

    if (!khataCustomerId) {
      toast.error("Customer ID is missing.");
      return;
    }

    setIsSubmitting(true);

    try {
      const data = await transactionService.create({
        khata_customer_id: khataCustomerId,
        amount: parsedAmount,
        transaction_type: activeModal,
        description: detailsInput.trim() || (activeModal === "LENE" ? "Amount Diya" : "Amount Liya"),
      });

      if (data.success) {
        toast.success(
          data.message || `${activeModal === "LENE" ? "Lene" : "Dene"} transaction added successfully!`
        );
        handleModalClose();
        fetchCustomerAndTransactions();
      } else {
        toast.error(data.message || "Failed to add transaction.");
      }
    } catch (error) {
      const apiError = error as ApiError;
      console.error("Transaction Submission Error:", error);
      toast.error(apiError.message || "Unable to connect to the server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // PUT API: Handle Edit Customer Update
  const handleCustomerUpdate = async (e: FormEvent) => {
    e.preventDefault();

    if (!customerName.trim()) {
      toast.error("Customer name cannot be empty.");
      return;
    }

    if (!khataCustomerId) return;

    setIsSubmitting(true);

    try {
      const data = await customerService.update(khataCustomerId, {
        customer_name: customerName.trim(),
        mobile_number: customerPhone.trim(),
        address: customerAddress.trim(),
      });

      if (data.success) {
        toast.success(data.message || "Customer updated successfully!");
        handleModalClose();
        fetchCustomerAndTransactions();
      } else {
        toast.error(data.message || "Failed to update customer.");
      }
    } catch (error) {
      const apiError = error as ApiError;
      console.error("Customer Update Error:", error);
      toast.error(apiError.message || "Unable to connect to the server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // DELETE API: Delete Customer
  const handleConfirmDelete = async () => {
    if (!khataCustomerId) return;

    setIsSubmitting(true);

    try {
      const data = await customerService.remove(khataCustomerId);

      if (data.success) {
        toast.success(data.message || "Customer deleted successfully.");
        handleModalClose();
        navigate(-1);
      } else {
        toast.error(data.message || "Failed to delete customer.");
      }
    } catch (error) {
      const apiError = error as ApiError;
      console.error("Customer Delete Error:", error);
      toast.error(apiError.message || "Unable to connect to the server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // POST API: Monday Final Submission
  const handleMondayFinalSubmit = async () => {
    const partyId = customer?.customer_id;
    if (!partyId) {
      toast.error("Customer party ID not found.");
      return;
    }

    setIsSubmitting(true);

    try {
      const data = await transactionService.mondayFinal(partyId);

      if (data.success) {
        toast.success(data.message || "Monday Final completed successfully!");
        handleModalClose();
        fetchCustomerAndTransactions();
      } else {
        toast.error(data.message || "Failed to complete Monday Final.");
      }
    } catch (error) {
      const apiError = error as ApiError;
      console.error("Monday Final Error:", error);
      toast.error(apiError.message || "Unable to connect to the server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate closing balance display value
  const netBalNum = customer ? parseFloat(String(customer.net_balance || "0")) : 0;
  const formattedNetBalance = Math.abs(netBalNum).toLocaleString("en-IN");

  return (
    <div className="-m-2 flex min-h-[calc(100vh-4rem)] w-full flex-col rounded-2xl border border-slate-200 bg-white pb-28 shadow-card sm:-m-4 md:-m-6 lg:-m-8">
      {/* STICKY TOP BLOCK — navbar + opening/closing balance + action bar are
          grouped into ONE sticky unit so they scroll together. Previously
          only the navbar was sticky, so the "Opening" row (which sat right
          below it) would scroll a few pixels behind it and get visually
          clipped/hidden. Keeping them in the same sticky wrapper fixes that. */}
      <div className="sticky top-0 z-20 rounded-t-2xl">
        {/* 1. TOP NAVBAR */}
        <header className="flex w-full items-center justify-between gap-2 rounded-t-2xl border-b border-slate-100 bg-white/95 px-3 py-3 shadow-xs backdrop-blur-sm sm:px-6 sm:py-3.5">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-slate-100 active:scale-95"
            aria-label="Back"
          >
            <ArrowLeft size={20} />
          </button>

          {/* Customer Name with Edit Pen Icon */}
          <button
            type="button"
            onClick={() => handleOpenModal("EDIT_CUSTOMER")}
            className="flex min-w-0 flex-1 items-center justify-center gap-1.5 truncate font-bold text-brand-900 transition-opacity hover:opacity-80 active:scale-95 sm:text-lg"
          >
            <Pencil size={15} className="shrink-0 text-brand-700" />
            <span className="truncate">{customer?.customer_name || "Loading..."}</span>
          </button>

          {/* PDF Download Icon Button */}
          <button
            type="button"
            disabled={isDownloadingPdf || !customer?.customer_id}
            onClick={handleDownloadPdf}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-brand-700 bg-brand-50 text-brand-800 transition-colors hover:bg-brand-700 hover:text-white disabled:opacity-50"
            aria-label="Download Statement"
            title="Download Statement PDF"
          >
            {isDownloadingPdf ? <Spinner size={18} className="text-brand-700" /> : <FileText size={18} />}
          </button>
        </header>

        {/* 2. OPENING & CLOSING BALANCE BANNER */}
        <div className="border-b border-slate-100 bg-slate-50/80 px-4 py-2 backdrop-blur-sm sm:px-6">
          <div className="mx-auto flex max-w-6xl items-center justify-between py-1">
            <div className="text-xs font-bold text-brand-900 sm:text-sm">Opening</div>
            <div className="text-sm font-bold text-credit-600 sm:text-base">₹ 0</div>
          </div>

          <div className="mx-auto flex max-w-6xl items-center justify-between border-t border-slate-200 pt-1.5 pb-1">
            <div className="text-sm font-black text-brand-900 sm:text-lg">Closing</div>
            <div
              className={`text-sm font-black sm:text-lg ${
                netBalNum > 0 ? "text-credit-600" : netBalNum < 0 ? "text-debit-600" : "text-ink-900"
              }`}
            >
              ₹ {formattedNetBalance}
            </div>
          </div>
        </div>

        {/* 3. FILTER / ACTION BANNER BAR */}
        <div className="w-full bg-gradient-to-r from-brand-700 via-brand-600 to-violet-700 px-4 py-2 shadow-inner sm:py-2.5">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => handleOpenModal("MONDAY_FINAL_CONFIRM")}
              className="rounded-lg bg-white/15 px-3 py-1.5 text-[11px] font-bold text-white shadow-sm ring-1 ring-white/20 transition-all hover:bg-white/25 active:scale-95 sm:px-4 sm:text-sm"
            >
              Monday Final
            </button>

            <button
              type="button"
              className="rounded-lg border border-white/40 bg-white/10 px-3 py-1.5 text-[11px] font-bold text-white shadow-xs backdrop-blur-xs transition-all hover:bg-white/20 active:scale-95 sm:px-4 sm:text-sm"
            >
              Last Week Record
            </button>
          </div>
        </div>
      </div>

      {/* 4. MAIN CONTENT & ENTRIES TABLE */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-2.5 py-4 sm:px-6">
        <div className="hidden grid-cols-12 px-3 py-2 text-[11px] font-extrabold uppercase tracking-wider text-ink-500 sm:grid sm:text-xs">
          <div className="col-span-5">Entries</div>
          <div className="col-span-2 text-right">Lene</div>
          <div className="col-span-2 text-right">Dene</div>
          <div className="col-span-3 text-right">Status / Actions</div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
            <Spinner size={24} className="text-brand-600" />
            <span className="text-xs font-medium">Loading ledger transactions...</span>
          </div>
        ) : entries.length > 0 ? (
          <div className="space-y-2.5">
            {entries.map((item) => {
              const status = getConfirmStatus(item.id);
              const isConfirmed = status === "Y";
              return (
                <div
                  key={item.id}
                  className="relative flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs transition-all hover:border-brand-200 hover:shadow-sm sm:flex-row sm:items-center sm:gap-2"
                >
                  {/* Details */}
                  <div className="min-w-0 space-y-0.5 sm:w-5/12 sm:shrink-0">
                    <div className="truncate text-xs font-bold text-ink-900 sm:text-sm">{item.title}</div>
                    <div className="text-[10px] font-medium text-ink-300 sm:text-xs">{item.date}</div>
                    {item.subPerson && (
                      <div className="text-xs font-bold text-brand-800">{item.subPerson}</div>
                    )}
                    <div className="text-[11px] font-bold text-debit-600 sm:text-xs">
                      Bal. ₹ {item.balance}
                    </div>
                  </div>

                  {/* Amounts + status/actions row (stacks below details on mobile) */}
                  <div className="flex items-center justify-between gap-2 sm:flex-1 sm:justify-end sm:gap-4">
                    <div className="w-1/2 text-left sm:w-2/12 sm:text-right">
                      {item.leneAmount && (
                        <span className="text-xs font-black text-debit-600 sm:text-sm">
                          ₹ {item.leneAmount}
                        </span>
                      )}
                    </div>

                    <div className="w-1/2 text-right sm:w-2/12">
                      {item.deneAmount && (
                        <span className="text-xs font-black text-credit-600 sm:text-sm">
                          ₹ {item.deneAmount}
                        </span>
                      )}
                    </div>

                    {/* Y/N confirm toggle + conditional Edit/Delete icons */}
                    <div className="flex shrink-0 items-center justify-end gap-1.5 sm:w-3/12">
                      <button
                        type="button"
                        onClick={() => toggleConfirmStatus(item.id)}
                        title={isConfirmed ? "Confirmed — click to reopen" : "Not confirmed — click to lock"}
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-extrabold transition-all active:scale-95 ${
                          isConfirmed
                            ? "bg-credit-600 text-white shadow-sm"
                            : "border border-slate-300 bg-slate-50 text-ink-500 hover:border-brand-300 hover:text-brand-700"
                        }`}
                      >
                        {isConfirmed ? <Check size={13} /> : "N"}
                      </button>

                      {!isConfirmed && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleOpenEditTransaction(item)}
                            aria-label="Edit transaction"
                            title="Edit transaction"
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-brand-600 transition-colors hover:bg-brand-50 active:scale-95"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenDeleteTransaction(item)}
                            aria-label="Delete transaction"
                            title="Delete transaction"
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-rose-600 transition-colors hover:bg-rose-50 active:scale-95"
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 py-16 text-center text-slate-400">
            <AlertCircle size={32} className="stroke-1 text-slate-300" />
            <p className="mt-2 text-sm font-medium">No transactions recorded yet.</p>
            <p className="text-xs text-slate-400">Use LENE or DENE to add your first entry.</p>
          </div>
        )}
      </main>

      {/* 5. BOTTOM ACTION BUTTONS */}
      <footer className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white/85 p-2 backdrop-blur-md sm:p-4 lg:left-72">
        <div className="mx-auto flex max-w-6xl gap-3">
          <button
            type="button"
            onClick={() => handleOpenModal("LENE")}
            className="flex flex-1 flex-col items-center justify-center rounded-xl bg-gradient-to-r from-debit-600 to-debit-500 py-2.5 text-white shadow-md transition-all hover:brightness-105 active:scale-[0.98]"
          >
            <span className="text-xs font-black uppercase tracking-wide sm:text-sm">LENE ₹</span>
            <span className="text-[10px] font-medium opacity-90 sm:text-xs">Amount Diya</span>
          </button>

          <button
            type="button"
            onClick={() => handleOpenModal("DENE")}
            className="flex flex-1 flex-col items-center justify-center rounded-xl bg-gradient-to-r from-credit-600 to-credit-500 py-2.5 text-white shadow-md transition-all hover:brightness-105 active:scale-[0.98]"
          >
            <span className="text-xs font-black uppercase tracking-wide sm:text-sm">DENE ₹</span>
            <span className="text-[10px] font-medium opacity-90 sm:text-xs">Amount Liya</span>
          </button>
        </div>
      </footer>

      {/* 6. POPUP MODALS */}

      {/* MONDAY FINAL CONFIRMATION MODAL */}
      <Modal
        open={activeModal === "MONDAY_FINAL_CONFIRM"}
        onClose={handleModalClose}
        title="Monday Final"
        preventClose={isSubmitting}
        size="sm"
        tone="danger"
      >
        <div className="p-6 text-center sm:p-7">
          <p className="text-sm leading-relaxed text-ink-500 sm:text-base">
            You really want to Monday Final. After this you are not able to update this customer's
            transactions, and all transactions of this user in the recycle bin will be deleted.
          </p>

          <div className="mt-7 flex items-center justify-center gap-3 sm:gap-4">
            <Button
              type="button"
              variant="secondary"
              fullWidth={false}
              disabled={isSubmitting}
              onClick={handleModalClose}
              className="w-28 sm:w-32"
            >
              No
            </Button>
            <Button
              type="button"
              variant="dangerSolid"
              fullWidth={false}
              loading={isSubmitting}
              onClick={handleMondayFinalSubmit}
              className="w-28 sm:w-32"
            >
              Yes
            </Button>
          </div>
        </div>
      </Modal>

      {/* EDIT CUSTOMER MODAL */}
      <Modal
        open={activeModal === "EDIT_CUSTOMER"}
        onClose={handleModalClose}
        title="Edit Customer"
        preventClose={isSubmitting}
      >
        <form onSubmit={handleCustomerUpdate} className="flex flex-col gap-4 p-5 sm:p-6">
          <div className="space-y-1">
            <div className="relative rounded-xl border border-slate-200 bg-white px-3.5 py-3 transition-all focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-brand-600/15">
              <input
                type="text"
                maxLength={36}
                required
                disabled={isSubmitting}
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter Customer Name"
                className="w-full bg-transparent text-sm font-semibold text-ink-900 outline-none placeholder:text-ink-300 disabled:opacity-50"
              />
            </div>
            <div className="text-right text-[11px] font-medium text-ink-300">
              {customerName.length}/36
            </div>
          </div>

          <div className="relative flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3.5 py-3 transition-all focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-brand-600/15">
            <div className="flex items-center gap-1 border-r border-slate-200 pr-3">
              <span className="inline-block text-xs font-bold text-ink-700">🇮🇳 +91</span>
              <span className="text-[10px] text-ink-500">▼</span>
            </div>
            <input
              type="tel"
              disabled={isSubmitting}
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="Enter Phone Number"
              className="w-full bg-transparent text-sm font-semibold text-ink-900 outline-none placeholder:text-ink-300 disabled:opacity-50"
            />
          </div>

          <div className="space-y-1">
            <div className="relative rounded-xl border border-slate-200 bg-white px-3.5 py-3 transition-all focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-brand-600/15">
              <input
                type="text"
                maxLength={36}
                disabled={isSubmitting}
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                placeholder="Enter Address"
                className="w-full bg-transparent text-sm font-medium text-ink-900 outline-none placeholder:text-ink-300 disabled:opacity-50"
              />
            </div>
            <div className="text-right text-[11px] font-medium text-ink-300">
              {customerAddress.length}/36
            </div>
          </div>

          <Button type="submit" loading={isSubmitting} loadingText="Updating...">
            Update Customer
          </Button>

          <Button
            type="button"
            variant="dangerSolid"
            disabled={isSubmitting}
            onClick={() => setActiveModal("DELETE_CONFIRM")}
            icon={<Trash2 size={16} />}
          >
            Delete Customer
          </Button>
        </form>
      </Modal>

      {/* DELETE CONFIRMATION POPUP MODAL */}
      <Modal
        open={activeModal === "DELETE_CONFIRM"}
        onClose={() => setActiveModal("EDIT_CUSTOMER")}
        title="Are you sure?"
        preventClose={isSubmitting}
        size="sm"
        tone="danger"
      >
        <div className="p-6 text-center sm:p-7">
          <p className="text-sm font-medium leading-relaxed text-ink-500 sm:text-base">
            Do you want to delete this customer? All transaction records associated with this customer
            will be deleted.
          </p>

          <div className="mt-8 flex items-center justify-center gap-4">
            <Button
              type="button"
              variant="secondary"
              fullWidth={false}
              disabled={isSubmitting}
              onClick={() => setActiveModal("EDIT_CUSTOMER")}
              className="w-32"
            >
              No
            </Button>
            <Button
              type="button"
              variant="dangerSolid"
              fullWidth={false}
              loading={isSubmitting}
              onClick={handleConfirmDelete}
              className="w-32"
            >
              Yes
            </Button>
          </div>
        </div>
      </Modal>

      {/* LENE / DENE TRANSACTION MODAL */}
      <Modal
        open={activeModal === "LENE" || activeModal === "DENE"}
        onClose={handleModalClose}
        preventClose={isSubmitting}
        title={
          <span
            className={`flex items-center justify-center gap-1 ${
              activeModal === "LENE" ? "text-debit-600" : "text-credit-700"
            }`}
          >
            <span>₹</span>
            <span>{activeModal === "LENE" ? "Lene" : "Dene"}</span>
            <span>-</span>
            <span className="max-w-[150px] truncate">{customer?.customer_name}</span>
          </span>
        }
      >
        <form onSubmit={handleEntrySubmit} className="flex flex-col gap-4 p-5 sm:p-6">
          <div className="space-y-1">
            <div className="relative flex items-center rounded-xl border border-slate-200 bg-white px-3.5 py-3 transition-all focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-brand-600/15">
              <input
                type="number"
                step="any"
                required
                disabled={isSubmitting}
                value={amountInput}
                onChange={(e) => {
                  if (e.target.value.length <= 9) {
                    setAmountInput(e.target.value);
                  }
                }}
                placeholder="Enter Amount"
                className="w-full bg-transparent text-sm font-semibold text-ink-900 outline-none placeholder:font-bold placeholder:text-ink-300 disabled:opacity-50"
              />
            </div>
            <div className="text-right text-[11px] font-medium text-ink-300">
              {amountInput.length}/9
            </div>
          </div>

          <div className="space-y-1">
            <div className="relative rounded-xl border border-slate-200 bg-white px-3.5 py-3 transition-all focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-brand-600/15">
              <input
                type="text"
                maxLength={36}
                disabled={isSubmitting}
                value={detailsInput}
                onChange={(e) => setDetailsInput(e.target.value)}
                placeholder="Enter Details (e.g. Cash received)"
                className="w-full bg-transparent text-sm font-medium text-ink-900 outline-none placeholder:text-ink-300 disabled:opacity-50"
              />
            </div>
            <div className="text-right text-[11px] font-medium text-ink-300">
              {detailsInput.length}/36
            </div>
          </div>

          <Button
            type="submit"
            loading={isSubmitting}
            loadingText="Saving..."
            className={
              activeModal === "LENE"
                ? "!bg-gradient-to-r !from-debit-600 !to-debit-500 hover:brightness-105"
                : "!bg-gradient-to-r !from-credit-600 !to-credit-500 hover:brightness-105"
            }
          >
            Save
          </Button>
        </form>
      </Modal>

      {/* EDIT TRANSACTION MODAL */}
      <Modal
        open={activeModal === "EDIT_TRANSACTION"}
        onClose={handleModalClose}
        preventClose={isSubmitting}
        title="Edit Transaction"
      >
        <form onSubmit={handleUpdateTransactionSubmit} className="flex flex-col gap-4 p-5 sm:p-6">
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wide text-ink-400">Amount</label>
            <div className="relative flex items-center rounded-xl border border-slate-200 bg-white px-3.5 py-3 transition-all focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-brand-600/15">
              <input
                type="number"
                step="any"
                required
                disabled={isSubmitting}
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
                placeholder="Enter Amount"
                className="w-full bg-transparent text-sm font-semibold text-ink-900 outline-none placeholder:font-bold placeholder:text-ink-300 disabled:opacity-50"
              />
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
                disabled={isSubmitting}
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Enter Details"
                className="w-full bg-transparent text-sm font-medium text-ink-900 outline-none placeholder:text-ink-300 disabled:opacity-50"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wide text-ink-400">
              Reference Number
            </label>
            <div className="relative rounded-xl border border-slate-200 bg-white px-3.5 py-3 transition-all focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-brand-600/15">
              <input
                type="text"
                maxLength={50}
                disabled={isSubmitting}
                value={editReferenceNumber}
                onChange={(e) => setEditReferenceNumber(e.target.value)}
                placeholder="Enter Reference Number (optional)"
                className="w-full bg-transparent text-sm font-medium text-ink-900 outline-none placeholder:text-ink-300 disabled:opacity-50"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wide text-ink-400">
              Transaction Date
            </label>
            <div className="relative rounded-xl border border-slate-200 bg-white px-3.5 py-3 transition-all focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-brand-600/15">
              <input
                type="date"
                required
                disabled={isSubmitting}
                value={editTransactionDate}
                onChange={(e) => setEditTransactionDate(e.target.value)}
                className="w-full bg-transparent text-sm font-medium text-ink-900 outline-none disabled:opacity-50"
              />
            </div>
          </div>

          <Button type="submit" loading={isSubmitting} loadingText="Updating...">
            Update Transaction
          </Button>
        </form>
      </Modal>

      {/* DELETE TRANSACTION CONFIRMATION POPUP MODAL */}
      <Modal
        open={activeModal === "DELETE_TRANSACTION_CONFIRM"}
        onClose={handleModalClose}
        title="Delete Transaction?"
        preventClose={isSubmitting}
        size="sm"
        tone="danger"
      >
        <div className="p-6 text-center sm:p-7">
          <p className="text-sm font-medium leading-relaxed text-ink-500 sm:text-base">
            Are you sure you want to delete this{" "}
            <span className="font-bold text-ink-900">{activeTransaction?.title}</span> entry? This
            action cannot be undone.
          </p>

          <div className="mt-8 flex items-center justify-center gap-4">
            <Button
              type="button"
              variant="secondary"
              fullWidth={false}
              disabled={isSubmitting}
              onClick={handleModalClose}
              className="w-28 sm:w-32"
            >
              No
            </Button>
            <Button
              type="button"
              variant="dangerSolid"
              fullWidth={false}
              loading={isSubmitting}
              onClick={handleConfirmDeleteTransaction}
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
