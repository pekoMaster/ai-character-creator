'use client';

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslations } from 'next-intl';
import { Locale, locales, localeNames, localeFlags } from '@/i18n/config';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { Check, ChevronRight } from 'lucide-react';

interface LanguageSwitcherProps {
  variant?: 'button' | 'menu-item';
}

export default function LanguageSwitcher({ variant = 'button' }: LanguageSwitcherProps) {
  const { locale, setLocale } = useLanguage();
  const t = useTranslations('language');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLocale, setSelectedLocale] = useState<Locale>(locale);

  const handleOpen = () => {
    setSelectedLocale(locale);
    setIsOpen(true);
  };

  const handleConfirm = () => {
    if (selectedLocale !== locale) {
      setLocale(selectedLocale);
    }
    setIsOpen(false);
  };

  if (variant === 'menu-item') {
    return (
      <>
        <button
          onClick={handleOpen}
          className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <span className="text-xl">{localeFlags[locale]}</span>
          <span className="flex-1 text-left font-medium">Language</span>
          <span className="text-sm text-gray-500">
            {localeNames[locale]}
          </span>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>

        <LanguageModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          selectedLocale={selectedLocale}
          onSelectLocale={setSelectedLocale}
          onConfirm={handleConfirm}
        />
      </>
    );
  }

  return (
    <>
      <button
        onClick={handleOpen}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
      >
        <span className="text-lg">{localeFlags[locale]}</span>
        <span className="text-sm font-medium text-gray-700">Language</span>
      </button>

      <LanguageModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        selectedLocale={selectedLocale}
        onSelectLocale={setSelectedLocale}
        onConfirm={handleConfirm}
      />
    </>
  );
}

interface LanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLocale: Locale;
  onSelectLocale: (locale: Locale) => void;
  onConfirm: () => void;
}

function LanguageModal({ isOpen, onClose, selectedLocale, onSelectLocale, onConfirm }: LanguageModalProps) {
  const t = useTranslations('language');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('title')}>
      <div className="p-4">
        {/* Language Options */}
        <div className="space-y-2 mb-6">
          {locales.map((loc) => (
            <button
              key={loc}
              onClick={() => onSelectLocale(loc)}
              className={`
                w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all
                ${selectedLocale === loc
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}
              `}
            >
              <span className="text-2xl">{localeFlags[loc]}</span>
              <span className="flex-1 text-left font-medium text-gray-900">
                {localeNames[loc]}
              </span>
              {selectedLocale === loc && (
                <Check className="w-5 h-5 text-indigo-500" />
              )}
            </button>
          ))}
        </div>

        {/* Confirm Button */}
        <Button fullWidth onClick={onConfirm}>
          {t('confirm')}
        </Button>
      </div>
    </Modal>
  );
}
