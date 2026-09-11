import { apiClient } from "../lib/apiClient";

export interface TransactionApiData {
  transaction_id: string;
  khata_customer_id: string;
  created_by?: string;
  transaction_type: "LENE" | "DENE";
  amount: string;
  transaction_date?: string;
  description: string;
  reference_number?: string | null;
  created_at: string;
  updated_at?: string;
  running_balance: string | number;
  customer_name?: string;
}

interface TransactionsByPartyResponse {
  success: boolean;
  message?: string;
  data: TransactionApiData[];
  customer?: Record<string, unknown>;
}

export interface NewTransactionInput {
  khata_customer_id: string;
  amount: number;
  transaction_type: "LENE" | "DENE";
  description: string;
}

export interface StatementReportResponse {
  success: boolean;
  message?: string;
  data: {
    business: { khata_name: string; owner_mobile: string };
    customer: { customer_name: string; mobile_number: string; address: string };
    period: { start_date: string; end_date: string };
    summary: {
      opening_balance: number;
      total_received_lene: number;
      total_given_dene: number;
      closing_balance: number;
      status: string;
    };
    transactions: Array<{
      id: string;
      date: string;
      type: "LENE" | "DENE";
      amount: number;
      description: string;
      reference: string | null;
      balance: number;
    }>;
    whatsapp_share_text?: string;
    whatsapp_url?: string;
  };
}

export const transactionService = {
  /** GET /transactions/party/:partyId */
  listByParty(partyId: string) {
    return apiClient.get<TransactionsByPartyResponse>(`/transactions/party/${partyId}`);
  },

  /** POST /transactions */
  create(input: NewTransactionInput) {
    return apiClient.post<{ success: boolean; message?: string }>("/transactions", input);
  },

  /** POST /monday-final */
  mondayFinal(partyId: string) {
    return apiClient.post<{ success: boolean; message?: string }>("/monday-final", {
      party_id: partyId,
    });
  },

  /** GET /reports/party/:partyId/statement */
  statementReport(partyId: string) {
    return apiClient.get<StatementReportResponse>(`/reports/party/${partyId}/statement`);
  },
};

export default transactionService;
