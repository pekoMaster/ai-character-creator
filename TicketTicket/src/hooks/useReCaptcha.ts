'use client';

import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { useCallback } from 'react';

export function useReCaptcha() {
  const { executeRecaptcha } = useGoogleReCaptcha();

  const verifyReCaptcha = useCallback(async (action: string): Promise<string | null> => {
    if (!executeRecaptcha) {
      console.warn('reCAPTCHA not available');
      return null;
    }

    try {
      const token = await executeRecaptcha(action);
      return token;
    } catch (error) {
      console.error('reCAPTCHA execution failed:', error);
      return null;
    }
  }, [executeRecaptcha]);

  const verifyWithServer = useCallback(async (action: string): Promise<boolean> => {
    const token = await verifyReCaptcha(action);

    if (!token) {
      return true; // Allow if reCAPTCHA is not configured
    }

    try {
      const response = await fetch('/api/recaptcha/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, action }),
      });

      const data = await response.json();
      return data.success && data.score >= 0.5;
    } catch (error) {
      console.error('reCAPTCHA verification failed:', error);
      return true; // Allow on error to not block users
    }
  }, [verifyReCaptcha]);

  return {
    verifyReCaptcha,
    verifyWithServer,
    isReady: !!executeRecaptcha,
  };
}
