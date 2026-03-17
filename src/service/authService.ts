import { apiClient } from "@/lib/apiClient";
import type { LoginRequest, TokenResponse } from "@/types/api";

export const authService = {
  async login(body: LoginRequest): Promise<TokenResponse> {
    const { data } = await apiClient.post<TokenResponse>(
      "/api/v1/auth/login",
      body,
    );
    return data;
  },

  async logout(): Promise<void> {
    await apiClient.post("/api/v1/auth/logout").catch(() => {
      // best-effort — clear tokens regardless
    });
  },
};
