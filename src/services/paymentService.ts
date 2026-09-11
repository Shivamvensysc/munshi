import { apiClient } from "../lib/apiClient";

export interface CrossEntryInput {
  khata_id: string;
  from_customer_id: string;
  to_customer_id: string;
  amount: number;
  details: string;
}

export const paymentService = {
  /** POST /cross-entries — move a balance directly between two customers. */
  createCrossEntry(input: CrossEntryInput) {
    return apiClient.post<{ success?: boolean; message?: string }>("/cross-entries", input);
  },
};

export default paymentService;
