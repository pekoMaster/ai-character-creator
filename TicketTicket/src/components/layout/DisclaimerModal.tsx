'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useApp } from '@/contexts/AppContext';
import { useLanguage } from '@/contexts/LanguageContext';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { Ticket, AlertTriangle, Shield, Users, Handshake, Heart, Gift } from 'lucide-react';

export default function DisclaimerModal() {
  const t = useTranslations('disclaimer');
  const { hasAgreedToDisclaimer, setHasAgreedToDisclaimer } = useApp();
  const { hasSelectedLanguage } = useLanguage();
  const [isScrolledToEnd, setIsScrolledToEnd] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 倒計時
  useEffect(() => {
    if (mounted && !hasAgreedToDisclaimer && hasSelectedLanguage && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown, hasAgreedToDisclaimer, hasSelectedLanguage, mounted]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 50) {
      setIsScrolledToEnd(true);
    }
  };

  const canAgree = isScrolledToEnd || countdown === 0;

  // 先選語言，再顯示免責聲明
  if (!mounted || hasAgreedToDisclaimer || !hasSelectedLanguage) return null;

  return (
    <Modal isOpen={true} preventClose size="lg">
      <div className="p-6">
        {/* Logo & Title */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
            <Ticket className="w-8 h-8 text-indigo-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">TicketTicket</h1>
          <p className="text-gray-500 mt-1">{t('title')}</p>
        </div>

        {/* VTuber 粉絲專屬 & 非商用 */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-pink-50 border border-pink-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-pink-700 font-semibold mb-1">
              <Heart className="w-4 h-4" />
              <span className="text-sm">{t('vtuberOnly')}</span>
            </div>
            <p className="text-pink-600 text-xs">
              {t('vtuberOnlyDesc')}
            </p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-green-700 font-semibold mb-1">
              <Gift className="w-4 h-4" />
              <span className="text-sm">{t('nonCommercial')}</span>
            </div>
            <p className="text-green-600 text-xs">
              {t('nonCommercialDesc')}
            </p>
          </div>
        </div>

        {/* 重要聲明區塊 */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 text-red-700 font-semibold mb-2">
            <AlertTriangle className="w-5 h-5" />
            <span>{t('important')}</span>
          </div>
          <p className="text-red-600 text-sm">
            {t('importantDesc')}
          </p>
        </div>

        {/* 可滾動的條款區域 */}
        <div
          className="bg-gray-50 rounded-lg p-4 h-64 overflow-y-auto mb-4"
          onScroll={handleScroll}
        >
          <div className="space-y-6">
            {/* 1. 平台性質 */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-indigo-500" />
                <h3 className="font-semibold text-gray-900">{t('section1Title')}</h3>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                {t('section1Content')}
              </p>
            </div>

            {/* 2. 現場交易 */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Handshake className="w-5 h-5 text-indigo-500" />
                <h3 className="font-semibold text-gray-900">{t('section2Title')}</h3>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                {t('section2Content')}
              </p>
            </div>

            {/* 3. 入場風險 */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-indigo-500" />
                <h3 className="font-semibold text-gray-900">{t('section3Title')}</h3>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                {t('section3Content')}
              </p>
            </div>

            {/* 4. 用戶責任 */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-indigo-500" />
                <h3 className="font-semibold text-gray-900">{t('section4Title')}</h3>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                {t('section4Content')}
              </p>
            </div>

            {/* 5. 隱私保護 */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-indigo-500" />
                <h3 className="font-semibold text-gray-900">{t('section5Title')}</h3>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                {t('section5Content')}
              </p>
            </div>

            {/* 最終聲明 */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 mt-4">
              <p className="text-sm text-gray-700 leading-relaxed">
                {t('finalNote')}
              </p>
            </div>
          </div>
        </div>

        {/* 提示文字 */}
        <p className="text-center text-sm text-gray-400 mb-4">
          {!canAgree && t('scrollHint', { seconds: countdown })}
          {canAgree && t('canAgree')}
        </p>

        {/* 同意按鈕 */}
        <Button
          fullWidth
          size="lg"
          disabled={!canAgree}
          onClick={() => setHasAgreedToDisclaimer(true)}
        >
          {canAgree ? t('agree') : t('pleaseRead')}
        </Button>
      </div>
    </Modal>
  );
}
