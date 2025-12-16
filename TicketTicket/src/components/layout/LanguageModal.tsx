'use client';

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Locale, locales, localeNames, localeFlags } from '@/i18n/config';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { Globe, Check } from 'lucide-react';

export default function LanguageModal() {
  const { locale, setLocale, hasSelectedLanguage, setHasSelectedLanguage } = useLanguage();
  const [selectedLocale, setSelectedLocale] = useState<Locale>(locale);

  const handleConfirm = () => {
    setHasSelectedLanguage(true);
    if (selectedLocale !== locale) {
      setLocale(selectedLocale);
    }
  };

  if (hasSelectedLanguage) return null;

  return (
    <Modal isOpen={true} preventClose size="sm">
      <div className="p-6">
        {/* Icon */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
            <Globe className="w-8 h-8 text-indigo-500" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Select Language</h1>
          <p className="text-gray-500 text-sm mt-1">選擇語言 / 言語を選択 / 选择语言</p>
        </div>

        {/* Language Options */}
        <div className="space-y-2 mb-6">
          {locales.map((loc) => (
            <button
              key={loc}
              onClick={() => setSelectedLocale(loc)}
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
        <Button fullWidth size="lg" onClick={handleConfirm}>
          {selectedLocale === 'zh-TW' && '確認選擇'}
          {selectedLocale === 'zh-CN' && '确认选择'}
          {selectedLocale === 'ja' && '選択を確認'}
          {selectedLocale === 'en' && 'Confirm Selection'}
        </Button>
      </div>
    </Modal>
  );
}
