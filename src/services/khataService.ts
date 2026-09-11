import { apiClient } from "../lib/apiClient";

export interface KhataApiData {
  khata_id: string;
  user_id: string;
  khata_name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface KhataStats {
  khata_id: string;
  user_id: string;
  khata_name: string;
  total_customers: string;
  total_you_will_get: number;
  total_you_will_give: number;
  net_balance: number;
  net_status: string;
}

interface ListKhatasResponse {
  success: boolean;
  message?: string;
  data: KhataApiData[];
}

interface KhataResponse {
  success: boolean;
  message?: string;
  data: KhataApiData;
}

interface KhataStatsResponse {
  success: boolean;
  message?: string;
  data: KhataStats;
}

export interface UpdateKhataInput {
  khata_name: string;
  description: string;
}

interface DeleteKhataResponse {
  success: boolean;
  message?: string;
}

export const khataService = {
  /** GET /khatas */
  list() {
    return apiClient.get<ListKhatasResponse>("/khatas");
  },

  /** POST /khatas */
  create(khataName: string) {
    return apiClient.post<KhataResponse>("/khatas", { khata_name: khataName });
  },

  /** PUT /khatas/:khataId */
  update(khataId: string, input: UpdateKhataInput) {
    return apiClient.put<KhataResponse>(`/khatas/${khataId}`, input);
  },

  /** DELETE /khatas/:khataId */
  remove(khataId: string) {
    return apiClient.delete<DeleteKhataResponse>(`/khatas/${khataId}`);
  },

  /** GET /khatas/:khataId/stats */
  stats(khataId: string) {
    return apiClient.get<KhataStatsResponse>(`/khatas/${khataId}/stats`);
  },
};

export default khataService;
