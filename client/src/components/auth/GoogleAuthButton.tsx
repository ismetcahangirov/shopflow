// src/components/auth/GoogleAuthButton.tsx
// Google Identity Services One-Tap / button OAuth flow
// Loads GIS script, renders a styled button, sends idToken to backend

'use client';

import React, { useCallback, useEffect, useRef } from 'react';
import Script from 'next/script';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/store/authStore';
import { api, parseApiError } from '@/lib/api';
import type { User } from '@/store/authStore';

interface GoogleAuthResponse {
  credential: string;
}

interface GoogleAuthApiResponse {
  success: boolean;
  data: {
    accessToken: string;
    user: User;
  };
  message: string;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: GoogleAuthResponse) => void;
            auto_select?: boolean;
          }) => void;
          renderButton: (
            element: HTMLElement,
            config: {
              type?: string;
              theme?: string;
              size?: string;
              text?: string;
              shape?: string;
              width?: number;
            },
          ) => void;
          disableAutoSelect: () => void;
        };
      };
    };
  }
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '';

interface GoogleAuthButtonProps {
  onError?: (message: string) => void;
}

export default function GoogleAuthButton({ onError }: GoogleAuthButtonProps): React.JSX.Element {
  const t = useTranslations('auth');
  const router = useRouter();
  const buttonRef = useRef<HTMLDivElement>(null);
  const { setUser, setToken } = useAuthStore();

  const handleCredential = useCallback(
    async (response: GoogleAuthResponse) => {
      try {
        const { data } = await api.post<GoogleAuthApiResponse>('/auth/google', {
          idToken: response.credential,
        });

        const { accessToken, user } = data.data;
        setUser(user);
        setToken(accessToken);

        // Set helper cookie for middleware.ts role-based guard
        document.cookie = `refreshToken=present; path=/; max-age=604800; SameSite=Lax`;

        router.push('/');
        router.refresh();
      } catch (err) {
        const message = parseApiError(err);
        onError?.(message);
      }
    },
    [setUser, setToken, router, onError],
  );

  const initGoogle = useCallback(() => {
    if (!window.google || !GOOGLE_CLIENT_ID || !buttonRef.current) return;

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleCredential,
      auto_select: false,
    });

    window.google.accounts.id.renderButton(buttonRef.current, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      text: 'continue_with',
      shape: 'rectangular',
      width: buttonRef.current.offsetWidth || 400,
    });
  }, [handleCredential]);

  // Re-init if Google script is already loaded (e.g. HMR)
  useEffect(() => {
    if (window.google) {
      initGoogle();
    }
  }, [initGoogle]);

  if (!GOOGLE_CLIENT_ID) {
    return (
      <button
        type="button"
        disabled
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-400 dark:border-slate-700 dark:bg-slate-800"
      >
        {t('google_login')} (not configured)
      </button>
    );
  }

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="lazyOnload"
        onLoad={initGoogle}
      />
      {/* Google renders its own button inside this div */}
      <div ref={buttonRef} className="w-full overflow-hidden rounded-xl" />
    </>
  );
}
