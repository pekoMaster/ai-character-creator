'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Locale, locales, defaultLocale } from '@/i18n/config';

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  hasSelectedLanguage: boolean;
  setHasSelectedLanguage: (selected: boolean) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);
  const [hasSelectedLanguage, setHasSelectedLanguageState] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // 從 localStorage 讀取語言設定
    const savedLocale = localStorage.getItem('locale') as Locale | null;
    const hasSelected = localStorage.getItem('hasSelectedLanguage') === 'true';

    if (savedLocale && locales.includes(savedLocale)) {
      setLocaleState(savedLocale);
    }
    setHasSelectedLanguageState(hasSelected);
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('locale', newLocale);
    // 設定 cookie 供 server 端使用
    document.cookie = `locale=${newLocale};path=/;max-age=31536000`;
    // 重新載入頁面以套用新語言
    window.location.reload();
  };

  const setHasSelectedLanguage = (selected: boolean) => {
    setHasSelectedLanguageState(selected);
    localStorage.setItem('hasSelectedLanguage', String(selected));
  };

  if (!mounted) {
    return null;
  }

  return (
    <LanguageContext.Provider
      value={{
        locale,
        setLocale,
        hasSelectedLanguage,
        setHasSelectedLanguage,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
