// src/hooks/useAuth.ts
// TanStack Query mutations for all auth operations (login, register, forgot/reset password)

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { api, parseApiError } from '@/lib/api';
import type { User } from '@/store/authStore';
import type {
  LoginInput,
  RegisterInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from '@/shared/schemas/auth';

// ── API response shapes ────────────────────────────────────────
interface AuthSuccessResponse {
  success: boolean;
  data: { accessToken: string; user: User };
  message: string;
}

interface MessageResponse {
  success: boolean;
  message: string;
}

// ── Helper: set/clear the middleware refresh-token marker cookie ─
function setRefreshCookie(present: boolean): void {
  if (typeof document === 'undefined') return;
  if (present) {
    document.cookie = 'refreshToken=present; path=/; max-age=604800; SameSite=Lax';
  } else {
    document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC';
  }
}

// ── useLogin ──────────────────────────────────────────────────
export function useLogin() {
  const { setUser, setToken } = useAuthStore();
  const router = useRouter();

  return useMutation<AuthSuccessResponse, Error, LoginInput>({
    mutationFn: async (credentials) => {
      const { data } = await api.post<AuthSuccessResponse>('/auth/login', credentials);
      return data;
    },
    onSuccess: (data) => {
      const { accessToken, user } = data.data;
      setUser(user);
      setToken(accessToken);
      setRefreshCookie(true);
      router.push('/');
      router.refresh();
    },
    onError: (err) => {
      useAuthStore.getState().setError(parseApiError(err));
    },
  });
}

// ── useRegister ───────────────────────────────────────────────
export function useRegister() {
  const router = useRouter();

  return useMutation<MessageResponse, Error, RegisterInput>({
    mutationFn: async (payload) => {
      const { data } = await api.post<MessageResponse>('/auth/register', payload);
      return data;
    },
    onSuccess: (_data, variables) => {
      // Redirect to login with a success hint (email in query for UX)
      const params = new URLSearchParams({ email: variables.email, registered: '1' });
      router.push(`/login?${params.toString()}`);
    },
    onError: (err) => {
      useAuthStore.getState().setError(parseApiError(err));
    },
  });
}

// ── useForgotPassword ─────────────────────────────────────────
export function useForgotPassword() {
  return useMutation<MessageResponse, Error, ForgotPasswordInput>({
    mutationFn: async (payload) => {
      const { data } = await api.post<MessageResponse>('/auth/forgot-password', payload);
      return data;
    },
  });
}

// ── useResetPassword ──────────────────────────────────────────
export function useResetPassword() {
  const router = useRouter();

  return useMutation<MessageResponse, Error, ResetPasswordInput & { token: string }>({
    mutationFn: async ({ token, ...payload }) => {
      const { data } = await api.post<MessageResponse>(`/auth/reset-password/${token}`, payload);
      return data;
    },
    onSuccess: () => {
      router.push('/login?reset=1');
    },
  });
}

// ── useVerifyEmail ────────────────────────────────────────────
export function useVerifyEmail() {
  return useMutation<MessageResponse, Error, { token: string }>({
    mutationFn: async ({ token }) => {
      const { data } = await api.get<MessageResponse>(`/auth/verify-email/${token}`);
      return data;
    },
  });
}
