import { apiClient } from "../lib/apiClient";
import { tokenStore, type StoredKhata, type StoredUser } from "../auth/tokenStore";

export interface LoginResponse {
  success: boolean;
  message?: string;
  token?: string;
  refreshToken?: string;
  user?: StoredUser;
  khatas?: StoredKhata[];
  defaultKhata?: StoredKhata;
}

export interface SendOtpResponse {
  success: boolean;
  message?: string;
  /** Some backends echo the OTP back in non-production environments. */
  otp?: string;
}

export interface RegisterResponse {
  success: boolean;
  message?: string;
}

export const authService = {
  /** POST /auth/login — public endpoint, no bearer token attached. */
  async login(mobileNumber: string, pin: string): Promise<LoginResponse> {
    const data = await apiClient.post<LoginResponse>(
      "/auth/login",
      { mobile_number: mobileNumber, pin },
      { auth: false }
    );

    if (data.success) {
      tokenStore.setSession({
        accessToken: data.token,
        refreshToken: data.refreshToken,
        user: data.user,
        khatas: data.khatas,
        defaultKhata: data.defaultKhata,
      });
    }

    return data;
  },

  /** POST /auth/send-otp — public endpoint. */
  async sendOtp(mobileNumber: string, purpose: "REGISTRATION" | "RESET_PIN" = "REGISTRATION") {
    return apiClient.post<SendOtpResponse>(
      "/auth/send-otp",
      { mobile_number: mobileNumber, purpose },
      { auth: false }
    );
  },

  /** POST /auth/register — public endpoint. */
  async register(mobileNumber: string, otpCode: string, pin: string) {
    return apiClient.post<RegisterResponse>(
      "/auth/register",
      { mobile_number: mobileNumber, otp_code: otpCode, pin },
      { auth: false }
    );
  },

  /** Clears the local session. Does not need a network call unless the
   *  backend tracks server-side sessions — add a POST /auth/logout call
   *  here if/when that endpoint exists. */
  logout() {
    tokenStore.clearAll();
  },

  /** Cached user info captured at login time (name/phone shown in the
   *  Account page). There is currently no GET /auth/me endpoint on the
   *  backend, so this reads what login already gave us instead of
   *  guessing at a new endpoint. */
  getCachedUser(): StoredUser | null {
    return tokenStore.getUser();
  },
};

export default authService;
