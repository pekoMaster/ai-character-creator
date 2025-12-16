'use client';

import { useTranslations } from 'next-intl';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';

export default function TokushohoPage() {
  const t = useTranslations('tokushoho');

  const items = [
    { label: t('businessName'), value: t('businessNameValue') },
    { label: t('representative'), value: t('representativeValue') },
    { label: t('address'), value: t('addressValue') },
    { label: t('contact'), value: t('contactValue') },
    { label: t('serviceContent'), value: t('serviceContentValue') },
    { label: t('price'), value: t('priceValue') },
    { label: t('paymentMethod'), value: t('paymentMethodValue') },
    { label: t('refund'), value: t('refundValue') },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title={t('title')} showBack />

      <div className="pt-14 pb-20 px-4 py-6">
        <div className="space-y-4">
          {/* Title Card */}
          <Card>
            <h1 className="text-xl font-bold text-gray-900 mb-2">{t('title')}</h1>
            <p className="text-sm text-gray-500">{t('titleZh')}</p>
          </Card>

          {/* Information Items */}
          <Card>
            <div className="divide-y divide-gray-100">
              {items.map((item, index) => (
                <div key={index} className="py-4 first:pt-0 last:pb-0">
                  <dt className="text-sm font-medium text-gray-500 mb-1">{item.label}</dt>
                  <dd className="text-gray-900">{item.value}</dd>
                </div>
              ))}
            </div>
          </Card>

          {/* Important Notice */}
          <Card className="bg-orange-50 border border-orange-200">
            <h3 className="font-semibold text-orange-800 mb-2">{t('importantNotice')}</h3>
            <p className="text-sm text-orange-700">{t('importantNoticeContent')}</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
