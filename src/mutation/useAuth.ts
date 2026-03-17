import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/service/authService";
import type { LoginRequest } from "@/types/api";

/**
 * Mutation hook for logging in.
 * On success, stores tokens + user in AuthContext and navigates to home.
 */
export const useLogin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (body: LoginRequest) => authService.login(body),
    onSuccess: (data) => {
      login(data.user, data.access_token, data.refresh_token);
      navigate("/");
    },
  });
};

/**
 * Mutation hook for logging out.
 * Calls the server logout endpoint (best-effort), then clears local auth state.
 */
export const useLogout = () => {
  const { logout } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const mutate = useCallback(async () => {
    await authService.logout();
    logout();
    queryClient.removeQueries({ queryKey: ["lessonIntents"] });
    navigate("/");
  }, [logout, queryClient, navigate]);

  return { mutate };
};
