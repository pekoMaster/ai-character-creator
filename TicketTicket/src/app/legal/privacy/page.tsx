'use client';

import { useTranslations } from 'next-intl';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';

export default function PrivacyPolicyPage() {
  const t = useTranslations('privacy');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title={t('title')} showBack />

      <div className="pt-14 pb-20 px-4 py-6 max-w-3xl mx-auto">
        <div className="space-y-4">
          {/* Title */}
          <Card>
            <h1 className="text-xl font-bold text-gray-900 mb-2">{t('title')}</h1>
            <p className="text-sm text-gray-500">{t('lastUpdated')}: 2025-01-01</p>
          </Card>

          {/* Introduction */}
          <Card>
            <p className="text-gray-700">{t('intro')}</p>
          </Card>

          {/* Section 1: Information We Collect */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">{t('section1Title')}</h2>
            <div className="space-y-2 text-gray-700">
              <p>{t('section1Content1')}</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>{t('section1Item1')}</li>
                <li>{t('section1Item2')}</li>
                <li>{t('section1Item3')}</li>
                <li>{t('section1Item4')}</li>
              </ul>
            </div>
          </Card>

          {/* Section 2: How We Use Information */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">{t('section2Title')}</h2>
            <div className="space-y-2 text-gray-700">
              <p>{t('section2Content1')}</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>{t('section2Item1')}</li>
                <li>{t('section2Item2')}</li>
                <li>{t('section2Item3')}</li>
                <li>{t('section2Item4')}</li>
              </ul>
            </div>
          </Card>

          {/* Section 3: Information Sharing */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">{t('section3Title')}</h2>
            <p className="text-gray-700">{t('section3Content')}</p>
          </Card>

          {/* Section 4: Data Security */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">{t('section4Title')}</h2>
            <p className="text-gray-700">{t('section4Content')}</p>
          </Card>

          {/* Section 5: Third-Party Services */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">{t('section5Title')}</h2>
            <p className="text-gray-700">{t('section5Content')}</p>
          </Card>

          {/* Section 6: Your Rights */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">{t('section6Title')}</h2>
            <div className="space-y-2 text-gray-700">
              <p>{t('section6Content1')}</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>{t('section6Item1')}</li>
                <li>{t('section6Item2')}</li>
                <li>{t('section6Item3')}</li>
              </ul>
            </div>
          </Card>

          {/* Section 7: Contact */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">{t('section7Title')}</h2>
            <p className="text-gray-700">{t('section7Content')}</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
