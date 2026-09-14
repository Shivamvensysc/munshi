import { apiClient } from "../lib/apiClient";

export interface RecycleBinCustomer {
  khata_customer_id: string;
  customer_id: string;
  customer_name: string;
  mobile_number: string | null;
  deleted_at: string;
}

export interface RecycleBinKhata {
  khata_id: string;
  khata_name: string;
  deleted_at: string;
}

export interface RecycleBinTransaction {
  transaction_id: string;
  amount: string;
  transaction_type: "LENE" | "DENE";
  transaction_date: string;
  description: string | null;
  deleted_at: string;
  customer_name: string;
}

export interface RecycleBinData {
  customers: RecycleBinCustomer[];
  khatas: RecycleBinKhata[];
  transactions: RecycleBinTransaction[];
}

interface RecycleBinResponse {
  success: boolean;
  message?: string;
  data: RecycleBinData;
}

interface RecycleBinActionResponse {
  success: boolean;
  message?: string;
}

export const recycleBinService = {
  /** GET /recycle-bin/:khataId — every soft-deleted customer, khata & transaction for this khata. */
  getByKhata(khataId: string) {
    return apiClient.get<RecycleBinResponse>(`/recycle-bin/${khataId}`);
  },

  /** POST /recycle-bin/transaction/:id/restore */
  restoreTransaction(transactionId: string) {
    return apiClient.post<RecycleBinActionResponse>(
      `/recycle-bin/transaction/${transactionId}/restore`,
    );
  },

  /** DELETE /recycle-bin/transaction/:id/purge */
  purgeTransaction(transactionId: string) {
    return apiClient.delete<RecycleBinActionResponse>(
      `/recycle-bin/transaction/${transactionId}/purge`,
    );
  },

  // NOTE: only the transaction restore/purge endpoints were confirmed by the
  // backend team. Customer & khata routes below mirror that exact same
  // convention (`/recycle-bin/<type>/:id/restore` and `.../purge`) so the
  // UI has something to call — if the real backend paths differ, only the
  // two URLs inside each function below need to change.

  /** POST /recycle-bin/customer/:id/restore (assumed — mirrors transaction route) */
  restoreCustomer(khataCustomerId: string) {
    return apiClient.post<RecycleBinActionResponse>(
      `/recycle-bin/customer/${khataCustomerId}/restore`,
    );
  },

  /** DELETE /recycle-bin/customer/:id/purge (assumed — mirrors transaction route) */
  purgeCustomer(khataCustomerId: string) {
    return apiClient.delete<RecycleBinActionResponse>(
      `/recycle-bin/customer/${khataCustomerId}/purge`,
    );
  },

  /** POST /recycle-bin/khata/:id/restore (assumed — mirrors transaction route) */
  restoreKhata(khataId: string) {
    return apiClient.post<RecycleBinActionResponse>(
      `/recycle-bin/khata/${khataId}/restore`,
    );
  },

  /** DELETE /recycle-bin/khata/:id/purge (assumed — mirrors transaction route) */
  purgeKhata(khataId: string) {
    return apiClient.delete<RecycleBinActionResponse>(
      `/recycle-bin/khata/${khataId}/purge`,
    );
  },
};

export default recycleBinService;
