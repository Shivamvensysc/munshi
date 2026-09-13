import { useState, useEffect, useCallback, type FormEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Pencil,
  FileText,
  Trash2,
  AlertCircle,
  Check,
  History,
  Landmark,
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
  rawAmount: number;
  rawType: "LENE" | "DENE";
  rawDescription: string;
  rawReferenceNumber: string;
  rawTransactionDate: string;
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

  // Per-row confirmed toggle (N ⇄ Y)
  const [confirmMap, setConfirmMap] = useState<Record<string, "Y" | "N">>({});
  const getConfirmStatus = (id: string): "Y" | "N" => confirmMap[id] ?? "N";
  const toggleConfirmStatus = (id: string) => {
    setConfirmMap((prev) => ({
      ...prev,
      [id]: getConfirmStatus(id) === "Y" ? "N" : "Y",
    }));
  };

  // Transaction currently targeted by the Edit/Delete modals
  const [activeTransaction, setActiveTransaction] = useState<Entry | null>(
    null,
  );

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
    const rawDateSource =
      tx.transaction_date || tx.created_at || new Date().toISOString();
    const parsedDate = new Date(rawDateSource);
    const rawTransactionDate = isNaN(parsedDate.getTime())
      ? new Date().toISOString().slice(0, 10)
      : parsedDate.toISOString().slice(0, 10);

    return {
      id: tx.transaction_id,
      title:
        tx.description ||
        (tx.transaction_type === "LENE" ? "Lene Entry" : "Dene Entry"),
      date: formatDateString(
        tx.created_at || tx.transaction_date || new Date().toISOString(),
      ),
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

  // Fetch customer details and transactions
  const fetchCustomerAndTransactions = useCallback(async () => {
    if (!khataCustomerId) {
      toast.error("Invalid customer identifier.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
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
                  address:
                    prev.address ||
                    (transactionsData.customer?.address as string) ||
                    "",
                } as CustomerApiData)
              : prev,
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

  const handleOpenEditTransaction = (entry: Entry) => {
    setActiveTransaction(entry);
    setEditAmount(String(entry.rawAmount));
    setEditDescription(entry.rawDescription);
    setEditReferenceNumber(entry.rawReferenceNumber);
    setEditTransactionDate(entry.rawTransactionDate);
    setActiveModal("EDIT_TRANSACTION");
  };

  const handleOpenDeleteTransaction = (entry: Entry) => {
    setActiveTransaction(entry);
    setActiveModal("DELETE_TRANSACTION_CONFIRM");
  };

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

  const generateStatementPdf = (report: StatementReportResponse["data"]) => {
    const doc = new jsPDF("p", "pt", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 36;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(30, 41, 59);
    doc.text(report.business.khata_name || "Business Ledger", margin, 48);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Mobile: ${report.business.owner_mobile || "N/A"}`, margin, 64);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    doc.text(
      `Customer: ${report.customer.customer_name}`,
      pageWidth - margin,
      48,
      {
        align: "right",
      },
    );

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `Mobile: ${report.customer.mobile_number || "N/A"}`,
      pageWidth - margin,
      64,
      {
        align: "right",
      },
    );
    if (report.customer.address) {
      doc.text(`Address: ${report.customer.address}`, pageWidth - margin, 78, {
        align: "right",
      });
    }

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(1);
    doc.line(margin, 90, pageWidth - margin, 90);

    const formattedOpening = Number(
      report.summary.opening_balance || 0,
    ).toLocaleString("en-IN");
    const formattedLene = Number(
      report.summary.total_received_lene || 0,
    ).toLocaleString("en-IN");
    const formattedDene = Number(
      report.summary.total_given_dene || 0,
    ).toLocaleString("en-IN");
    const formattedNet = Number(
      report.summary.closing_balance || 0,
    ).toLocaleString("en-IN");

    autoTable(doc, {
      startY: 100,
      margin: { left: margin, right: margin },
      head: [
        ["Opening Balance", "Total Lene (-)", "Total Dene (+)", "Net Balance"],
      ],
      body: [
        [
          `Rs. ${formattedOpening}`,
          `Rs. ${formattedLene}`,
          `Rs. ${formattedDene}`,
          `Rs. ${formattedNet}`,
        ],
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

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text(
      `No. of Entries: ${report.transactions?.length || 0}`,
      margin,
      summaryEndY,
    );

    const tableRows = (report.transactions || []).map((t) => [
      formatPdfDate(t.date),
      t.description || (t.type === "LENE" ? "Lene Entry" : "Dene Entry"),
      t.type === "LENE"
        ? `Rs. ${Number(t.amount).toLocaleString("en-IN")}`
        : "-",
      t.type === "DENE"
        ? `Rs. ${Number(t.amount).toLocaleString("en-IN")}`
        : "-",
      `Rs. ${Number(t.balance).toLocaleString("en-IN")}`,
    ]);

    autoTable(doc, {
      startY: summaryEndY + 6,
      margin: { left: margin, right: margin },
      head: [["Date", "Details", "Lene (-)", "Dene (+)", "Balance"]],
      body: [
        [
          formatPdfDate(
            report.period.start_date !== "Beginning"
              ? report.period.start_date
              : new Date().toISOString(),
          ),
          "Opening balance",
          "-",
          "-",
          `Rs. ${formattedOpening}`,
        ],
        ...tableRows,
      ],
      foot: [
        [
          "Grand Total",
          "",
          `Rs. ${formattedLene}`,
          `Rs. ${formattedDene}`,
          `Rs. ${formattedNet}`,
        ],
      ],
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
        const pageCount = (doc.internal as any).getNumberOfPages();
        const pageHeight = doc.internal.pageSize.getHeight();

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);

        const now = new Date();
        const formattedTime = now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
        const formattedReportDate = now.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "2-digit",
        });

        doc.text(
          `Report Generated: ${formattedTime} | ${formattedReportDate}`,
          margin,
          pageHeight - 20,
        );

        doc.text(
          `Page ${data.pageNumber} of ${pageCount}`,
          pageWidth - margin,
          pageHeight - 20,
          {
            align: "right",
          },
        );
      },
    });

    const safeCustomerName = (
      report.customer.customer_name || "Customer"
    ).replace(/\s+/g, "_");
    doc.save(`${safeCustomerName}_statement_${Date.now()}.pdf`);
  };

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
        description:
          detailsInput.trim() ||
          (activeModal === "LENE" ? "Amount Diya" : "Amount Liya"),
      });

      if (data.success) {
        toast.success(
          data.message ||
            `${activeModal === "LENE" ? "Lene" : "Dene"} transaction added successfully!`,
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

  const netBalNum = customer
    ? parseFloat(String(customer.net_balance || "0"))
    : 0;
  const formattedNetBalance = Math.abs(netBalNum).toLocaleString("en-IN");

  return (
    // Fixed wrapper accounts for the top app header (~56px) and bottom navbar (~64px)
    <div className="fixed top-[56px] bottom-[64px] left-0 right-0 z-10 flex flex-col overflow-hidden bg-ledger-bg text-ledger-ink">
      {/* 1. TOP HEADER SECTION (Identity, Balance, Actions) */}
      <header className="w-full shrink-0 border-b border-ledger-ink bg-ledger-paper shadow-sm">
        {/* Identity Row: Full width */}
        <div className="flex h-14 w-full items-center justify-between border-b border-ledger-border-soft px-4 sm:px-8">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ledger-icon transition-colors hover:bg-ledger-hover-alt active:scale-95"
            aria-label="Back"
          >
            <ArrowLeft size={20} />
          </button>

          <button
            type="button"
            onClick={() => handleOpenModal("EDIT_CUSTOMER")}
            className="group flex min-w-0 items-baseline justify-center gap-1.5 truncate px-2 transition hover:opacity-80"
          >
            <span className="truncate font-serif text-lg font-semibold text-ledger-ink sm:text-xl">
              {customer?.customer_name || "Loading…"}
            </span>
            <Pencil
              size={14}
              className="shrink-0 translate-y-[-1px] text-ledger-brass transition-transform group-hover:scale-110"
            />
          </button>

          <button
            type="button"
            disabled={isDownloadingPdf || !customer?.customer_id}
            onClick={handleDownloadPdf}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-ledger-border-hover bg-ledger-paper text-ledger-brass-dark transition hover:border-ledger-ink hover:bg-ledger-ink hover:text-ledger-paper-muted disabled:opacity-40"
            aria-label="Download Statement"
            title="Download Statement PDF"
          >
            {isDownloadingPdf ? (
              <Spinner size={17} className="text-ledger-brass-dark" />
            ) : (
              <FileText size={17} />
            )}
          </button>
        </div>

        {/* Opening Balance */}
        <div className="flex w-full items-center justify-between border-b border-ledger-border-soft px-4 py-2 sm:px-8">
          <span className="text-[13px] font-medium text-ledger-subtle">
            Opening balance
          </span>
          <span className="font-serif text-base text-ledger-slate tabular-nums">
            ₹ 0
          </span>
        </div>

        {/* Closing Balance Headline */}
        <div
          className={`flex w-full items-center justify-between border-b border-ledger-border-soft px-4 py-2.5 sm:px-8 ${
            netBalNum > 0
              ? "bg-ledger-green-wash"
              : netBalNum < 0
                ? "bg-ledger-red-wash"
                : "bg-ledger-paper"
          }`}
        >
          <span className="text-[13px] font-semibold text-ledger-muted">
            {netBalNum > 0
              ? "Closing — You will get"
              : netBalNum < 0
                ? "Closing — You will give"
                : "Closing balance"}
          </span>
          <span
            className={`font-serif text-2xl font-semibold tabular-nums sm:text-3xl ${
              netBalNum > 0
                ? "text-ledger-green"
                : netBalNum < 0
                  ? "text-ledger-red"
                  : "text-ledger-ink"
            }`}
          >
            ₹ {formattedNetBalance}
          </span>
        </div>

        {/* Actions Row */}
        <div className="flex w-full items-center justify-between gap-3 border-b border-ledger-border-soft bg-ledger-ink px-4 py-2 sm:px-8">
          <button
            type="button"
            onClick={() => handleOpenModal("MONDAY_FINAL_CONFIRM")}
            className="flex items-center gap-1.5 rounded-full border border-ledger-brass-light/50 bg-ledger-brass-light/15 px-3.5 py-1.5 text-xs font-semibold text-ledger-gold transition hover:bg-ledger-brass-light/25 active:scale-95 sm:text-sm"
          >
            <Landmark size={14} />
            Monday Final
          </button>

          <button
            type="button"
            className="flex items-center gap-1.5 rounded-full border border-white/15 px-3.5 py-1.5 text-xs font-semibold text-ledger-navy-text transition hover:bg-white/10 active:scale-95 sm:text-sm"
          >
            <History size={14} />
            Last Week Record
          </button>
        </div>
      </header>

      {/* 2. FULL WIDTH SCROLLABLE TABLE AREA */}
      <main className="scrollbar-hide relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="w-full">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-ledger-faint">
              <Spinner size={24} className="text-ledger-brass-dark" />
              <span className="text-xs font-medium">
                Loading ledger transactions…
              </span>
            </div>
          ) : entries.length > 0 ? (
            <div className="w-full border-b border-ledger-border bg-ledger-paper">
              {/* Pinned Table Columns Header */}
              <div className="sticky top-0 z-10 grid w-full grid-cols-12 gap-2 border-b border-ledger-ink/15 bg-ledger-hover px-4 py-2.5 text-[13px] font-semibold text-ledger-muted sm:px-8">
                <div className="col-span-7 sm:col-span-5">Entry</div>
                <div className="col-span-2 hidden text-right sm:block">
                  Lene
                </div>
                <div className="col-span-2 hidden text-right sm:block">
                  Dene
                </div>
                <div className="col-span-5 text-right sm:col-span-3">
                  Status
                </div>
              </div>

              {/* Transactions List */}
              {entries.map((item, idx) => {
                const status = getConfirmStatus(item.id);
                const isConfirmed = status === "Y";

                return (
                  <div
                    key={item.id}
                    className={`grid w-full grid-cols-12 items-center gap-2 px-4 py-3.5 transition hover:bg-ledger-hover/70 sm:gap-3 sm:px-8 ${
                      idx !== 0 ? "border-t border-ledger-border-soft" : ""
                    }`}
                  >
                    {/* Left Column: Details & Date */}
                    <div className="col-span-7 min-w-0 sm:col-span-5">
                      <div className="truncate text-[15px] font-medium text-ledger-ink">
                        {item.title}
                      </div>
                      <div className="mt-0.5 text-xs text-ledger-faint">
                        {item.date}
                      </div>
                      {item.subPerson && (
                        <div className="text-xs font-semibold text-ledger-brass-dark">
                          {item.subPerson}
                        </div>
                      )}
                      <div className="mt-0.5 text-xs font-medium text-ledger-muted">
                        Balance ₹ {item.balance}
                      </div>
                    </div>

                    {/* Lene Amount Column */}
                    <div className="col-span-2 hidden text-right font-serif text-base font-semibold tabular-nums text-ledger-red sm:block">
                      {item.leneAmount ? (
                        `₹${item.leneAmount}`
                      ) : (
                        <span className="text-ledger-dash">—</span>
                      )}
                    </div>

                    {/* Dene Amount Column */}
                    <div className="col-span-2 hidden text-right font-serif text-base font-semibold tabular-nums text-ledger-green sm:block">
                      {item.deneAmount ? (
                        `₹${item.deneAmount}`
                      ) : (
                        <span className="text-ledger-dash">—</span>
                      )}
                    </div>

                    {/* Right Column: Status Toggle & Actions */}
                    <div className="col-span-5 flex items-center justify-end gap-1.5 sm:col-span-3">
                      {/* Mobile-only inline amount */}
                      <div className="mr-auto font-serif text-sm font-semibold tabular-nums sm:hidden">
                        {item.leneAmount && (
                          <span className="text-ledger-red">
                            ₹{item.leneAmount}
                          </span>
                        )}
                        {item.deneAmount && (
                          <span className="text-ledger-green">
                            ₹{item.deneAmount}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleConfirmStatus(item.id)}
                        title={
                          isConfirmed
                            ? "Confirmed (locked)"
                            : "Unconfirmed — tap to lock"
                        }
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition active:scale-95 ${
                          isConfirmed
                            ? "bg-ledger-green text-white"
                            : "border border-ledger-border-hover bg-ledger-paper-muted text-ledger-faint hover:bg-ledger-hover-strong"
                        }`}
                      >
                        {isConfirmed ? (
                          <Check size={13} strokeWidth={3} />
                        ) : (
                          "N"
                        )}
                      </button>

                      {!isConfirmed && (
                        <div className="flex items-center gap-0.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEditTransaction(item)}
                            aria-label="Edit transaction"
                            title="Edit transaction"
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-ledger-faint hover:bg-ledger-hover-strong hover:text-ledger-brass-dark active:scale-95"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenDeleteTransaction(item)}
                            aria-label="Delete transaction"
                            title="Delete transaction"
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-ledger-faint hover:bg-rose-50 hover:text-ledger-red active:scale-95"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex w-full flex-col items-center justify-center py-20 text-center text-ledger-faint">
              <AlertCircle size={32} className="stroke-1 text-ledger-icon-faint" />
              <p className="mt-2 text-sm font-medium text-ledger-muted">
                No transactions recorded yet.
              </p>
              <p className="text-xs text-ledger-faint">
                Use Lene or Dene below to add the first entry.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* 3. FULL-WIDTH FIXED LENE & DENE BOTTOM BAR */}
      <footer className="w-full shrink-0 border-t border-ledger-ink bg-ledger-paper p-2.5 shadow-[0_-3px_10px_rgba(0,0,0,0.08)]">
        <div className="flex w-full gap-3 px-1 sm:px-6">
          <button
            type="button"
            onClick={() => handleOpenModal("LENE")}
            className="flex flex-1 flex-col items-center justify-center rounded-xl bg-ledger-red py-2 text-white shadow-sm transition hover:bg-ledger-red-dark active:scale-[0.99]"
          >
            <span className="text-sm font-semibold tracking-wide">Lene ₹</span>
            <span className="text-[11px] opacity-90">Amount Diya</span>
          </button>

          <button
            type="button"
            onClick={() => handleOpenModal("DENE")}
            className="flex flex-1 flex-col items-center justify-center rounded-xl bg-ledger-green py-2 text-white shadow-sm transition hover:bg-ledger-green-dark active:scale-[0.99]"
          >
            <span className="text-sm font-semibold tracking-wide">Dene ₹</span>
            <span className="text-[11px] opacity-90">Amount Liya</span>
          </button>
        </div>
      </footer>

      {/* 4. MODALS */}

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
          <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
            You really want to Monday Final. After this you are not able to
            update this customer's transactions, and all transactions of this
            user in the recycle bin will be deleted.
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
        <form
          onSubmit={handleCustomerUpdate}
          className="flex flex-col gap-4 p-5 sm:p-6"
        >
          <div className="space-y-1">
            <div className="relative rounded-xl border border-slate-200 bg-white px-3.5 py-3 transition-all focus-within:border-ledger-brass focus-within:ring-2 focus-within:ring-ledger-brass/15">
              <input
                type="text"
                maxLength={36}
                required
                disabled={isSubmitting}
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter Customer Name"
                className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400 disabled:opacity-50"
              />
            </div>
            <div className="text-right text-[11px] font-medium text-slate-400">
              {customerName.length}/36
            </div>
          </div>

          <div className="relative flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3.5 py-3 transition-all focus-within:border-ledger-brass focus-within:ring-2 focus-within:ring-ledger-brass/15">
            <div className="flex items-center gap-1 border-r border-slate-200 pr-3">
              <span className="inline-block whitespace-nowrap text-xs font-bold text-slate-700">
                🇮🇳 +91
              </span>
              <span className="text-[10px] text-slate-400">▼</span>
            </div>
            <input
              type="tel"
              disabled={isSubmitting}
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="Enter Phone Number"
              className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400 disabled:opacity-50"
            />
          </div>

          <div className="space-y-1">
            <div className="relative rounded-xl border border-slate-200 bg-white px-3.5 py-3 transition-all focus-within:border-ledger-brass focus-within:ring-2 focus-within:ring-ledger-brass/15">
              <input
                type="text"
                maxLength={36}
                disabled={isSubmitting}
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                placeholder="Enter Address"
                className="w-full bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400 disabled:opacity-50"
              />
            </div>
            <div className="text-right text-[11px] font-medium text-slate-400">
              {customerAddress.length}/36
            </div>
          </div>

          <Button
            type="submit"
            loading={isSubmitting}
            loadingText="Updating..."
          >
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

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        open={activeModal === "DELETE_CONFIRM"}
        onClose={() => setActiveModal("EDIT_CUSTOMER")}
        title="Are you sure?"
        preventClose={isSubmitting}
        size="sm"
        tone="danger"
      >
        <div className="p-6 text-center sm:p-7">
          <p className="text-sm font-medium leading-relaxed text-slate-600 sm:text-base">
            Do you want to delete this customer? All transaction records
            associated with this customer will be deleted.
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
            className={`flex items-center justify-center gap-1 font-bold ${
              activeModal === "LENE" ? "text-ledger-red" : "text-ledger-green"
            }`}
          >
            <span>₹</span>
            <span>{activeModal === "LENE" ? "Lene" : "Dene"}</span>
            <span>·</span>
            <span className="max-w-[150px] truncate">
              {customer?.customer_name}
            </span>
          </span>
        }
      >
        <form
          onSubmit={handleEntrySubmit}
          className="flex flex-col gap-4 p-5 sm:p-6"
        >
          <div className="space-y-1">
            <div className="relative flex items-center rounded-xl border border-slate-200 bg-white px-3.5 py-3 transition-all focus-within:border-ledger-brass focus-within:ring-2 focus-within:ring-ledger-brass/15">
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
                className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:font-bold placeholder:text-slate-400 disabled:opacity-50"
              />
            </div>
            <div className="text-right text-[11px] font-medium text-slate-400">
              {amountInput.length}/9
            </div>
          </div>

          <div className="space-y-1">
            <div className="relative rounded-xl border border-slate-200 bg-white px-3.5 py-3 transition-all focus-within:border-ledger-brass focus-within:ring-2 focus-within:ring-ledger-brass/15">
              <input
                type="text"
                maxLength={36}
                disabled={isSubmitting}
                value={detailsInput}
                onChange={(e) => setDetailsInput(e.target.value)}
                placeholder="Enter Details (e.g. Cash received)"
                className="w-full bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400 disabled:opacity-50"
              />
            </div>
            <div className="text-right text-[11px] font-medium text-slate-400">
              {detailsInput.length}/36
            </div>
          </div>

          <Button
            type="submit"
            loading={isSubmitting}
            loadingText="Saving..."
            className={
              activeModal === "LENE"
                ? "!bg-ledger-red hover:!bg-ledger-red-dark active:scale-[0.99]"
                : "!bg-ledger-green hover:!bg-ledger-green-dark active:scale-[0.99]"
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
        <form
          onSubmit={handleUpdateTransactionSubmit}
          className="flex flex-col gap-4 p-5 sm:p-6"
        >
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-500">
              Amount
            </label>
            <div className="relative flex items-center rounded-xl border border-slate-200 bg-white px-3.5 py-3 transition-all focus-within:border-ledger-brass focus-within:ring-2 focus-within:ring-ledger-brass/15">
              <input
                type="number"
                step="any"
                required
                disabled={isSubmitting}
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
                placeholder="Enter Amount"
                className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:font-bold placeholder:text-slate-400 disabled:opacity-50"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-500">
              Description
            </label>
            <div className="relative rounded-xl border border-slate-200 bg-white px-3.5 py-3 transition-all focus-within:border-ledger-brass focus-within:ring-2 focus-within:ring-ledger-brass/15">
              <input
                type="text"
                maxLength={100}
                disabled={isSubmitting}
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Enter Details"
                className="w-full bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400 disabled:opacity-50"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-500">
              Reference Number
            </label>
            <div className="relative rounded-xl border border-slate-200 bg-white px-3.5 py-3 transition-all focus-within:border-ledger-brass focus-within:ring-2 focus-within:ring-ledger-brass/15">
              <input
                type="text"
                maxLength={50}
                disabled={isSubmitting}
                value={editReferenceNumber}
                onChange={(e) => setEditReferenceNumber(e.target.value)}
                placeholder="Enter Reference Number (optional)"
                className="w-full bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400 disabled:opacity-50"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-500">
              Transaction Date
            </label>
            <div className="relative rounded-xl border border-slate-200 bg-white px-3.5 py-3 transition-all focus-within:border-ledger-brass focus-within:ring-2 focus-within:ring-ledger-brass/15">
              <input
                type="date"
                required
                disabled={isSubmitting}
                value={editTransactionDate}
                onChange={(e) => setEditTransactionDate(e.target.value)}
                className="w-full bg-transparent text-sm font-medium text-slate-900 outline-none disabled:opacity-50"
              />
            </div>
          </div>

          <Button
            type="submit"
            loading={isSubmitting}
            loadingText="Updating..."
          >
            Update Transaction
          </Button>
        </form>
      </Modal>

      {/* DELETE TRANSACTION CONFIRMATION MODAL */}
      <Modal
        open={activeModal === "DELETE_TRANSACTION_CONFIRM"}
        onClose={handleModalClose}
        title="Delete Transaction?"
        preventClose={isSubmitting}
        size="sm"
        tone="danger"
      >
        <div className="p-6 text-center sm:p-7">
          <p className="text-sm font-medium leading-relaxed text-slate-600 sm:text-base">
            Are you sure you want to delete this{" "}
            <span className="font-bold text-slate-900">
              {activeTransaction?.title}
            </span>{" "}
            entry? This action cannot be undone.
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
