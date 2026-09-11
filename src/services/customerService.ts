import { apiClient } from "../lib/apiClient";

export interface CustomerApiData {
  khata_customer_id: string;
  khata_id: string;
  customer_id: string;
  customer_name: string;
  mobile_number: string;
  address?: string;
  khata_name?: string;
  is_active?: boolean;
  total_lene: string | number;
  total_dene: string | number;
  net_balance: string | number;
  net_status?: string;
  last_activity_date?: string | null;
  created_at?: string;
}

interface CustomerListResponse {
  success: boolean;
  message?: string;
  data: CustomerApiData[];
}

interface CustomerResponse {
  success: boolean;
  message?: string;
  data: CustomerApiData;
  customer?: Partial<CustomerApiData>;
}

export interface NewCustomerInput {
  customer_name: string;
  mobile_number?: string;
  address?: string;
}

export interface UpdateCustomerInput {
  customer_name: string;
  mobile_number?: string;
  address?: string;
}

export const customerService = {
  /** GET /parties/khata/:khataId — all customers for a khata. */
  listByKhata(khataId: string) {
    return apiClient.get<CustomerListResponse>(`/parties/khata/${khataId}`);
  },

  /** POST /parties/khata/:khataId — add a new customer to a khata. */
  create(khataId: string, input: NewCustomerInput) {
    return apiClient.post<CustomerResponse>(`/parties/khata/${khataId}`, input);
  },

  /** GET /parties/:khataCustomerId — a single customer's profile. */
  getById(khataCustomerId: string) {
    return apiClient.get<CustomerResponse>(`/parties/${khataCustomerId}`);
  },

  /** PUT /parties/:khataCustomerId — update a customer's profile. */
  update(khataCustomerId: string, input: UpdateCustomerInput) {
    return apiClient.put<CustomerResponse>(`/parties/${khataCustomerId}`, input);
  },

  /** DELETE /parties/:khataCustomerId */
  remove(khataCustomerId: string) {
    return apiClient.delete<{ success: boolean; message?: string }>(`/parties/${khataCustomerId}`);
  },
};

export default customerService;
