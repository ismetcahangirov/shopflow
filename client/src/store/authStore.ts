// src/store/authStore.ts
// Zustand auth store managing auth state, user profile, and token synchronization

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { api, parseApiError } from '@/lib/api';

export type UserRole = 'CUSTOMER' | 'VENDOR' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  storeName?: string | null;
  phone?: string | null;
  avatar?: string | null;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean;
  error: string | null;
  
  // Setters
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setError: (error: string | null) => void;
  setHydrated: () => void;
  
  // Async operations
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isHydrated: false,
      error: null,

      setUser: (user) => set({ user, isAuthenticated: !!user }),

      setToken: (token) => {
        if (typeof window !== 'undefined') {
          (window as Window & { __accessToken?: string }).__accessToken = token ?? undefined;
          
          // Also set userRole cookie to assist middleware.ts with role-based auth
          if (token) {
            const userObj = get().user;
            if (userObj) {
              document.cookie = `userRole=${userObj.role}; path=/; max-age=604800; SameSite=Lax; Secure`;
            }
          } else {
            document.cookie = 'userRole=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
          }
        }
      },

      setError: (error) => set({ error }),

      setHydrated: () => set({ isHydrated: true }),

      logout: async () => {
        set({ isLoading: true, error: null });
        try {
          // Call backend logout to clear refresh_token HTTP-only cookie
          await api.post('/auth/logout');
        } catch (err) {
          // Even if API logout fails, clear local credentials
          console.error('Logout API error:', err);
        } finally {
          get().setToken(null);
          // Delete helper cookie for middleware.ts
          if (typeof window !== 'undefined') {
            document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
            document.cookie = 'userRole=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
          }
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      checkAuth: async () => {
        // Run verification at startup (e.g. initial render)
        set({ isLoading: true, error: null });
        try {
          // Try to refresh access token using the httpOnly cookie
          const { data } = await api.post<{ success: boolean; data: { accessToken: string } }>('/auth/refresh-token');
          const token = data.data.accessToken;
          
          // Store token in-memory and fetch user profile
          if (typeof window !== 'undefined') {
            (window as Window & { __accessToken?: string }).__accessToken = token;
          }
          
          const profileRes = await api.get<{ success: boolean; data: User }>('/auth/me');
          const user = profileRes.data.data;
          
          set({ user, isAuthenticated: true });
          get().setToken(token);
        } catch (err) {
          // If check auth fails, clear local memory
          get().setToken(null);
          set({ user: null, isAuthenticated: false });
          const parsedErr = parseApiError(err);
          // If it's a normal unauthenticated case, don't show noisy error
          if (parsedErr !== 'Unauthorized' && parsedErr !== 'jwt expired') {
            set({ error: parsedErr });
          }
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'shopflow-auth',
      // Persist only the user metadata, token is in-memory for security
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        // Delegate to the rehydrated state instead of referencing useAuthStore
        // directly: for synchronous localStorage the callback runs inside
        // create(), where the module-level store binding is still in its
        // temporal dead zone, so a direct reference silently fails to hydrate.
        state?.setHydrated();
      },
    }
  )
);
