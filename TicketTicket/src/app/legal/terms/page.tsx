'use client';

import { useTranslations } from 'next-intl';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';

export default function TermsOfServicePage() {
  const t = useTranslations('terms');

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

          {/* Section 1: Service Description */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">{t('section1Title')}</h2>
            <p className="text-gray-700">{t('section1Content')}</p>
          </Card>

          {/* Section 2: User Eligibility */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">{t('section2Title')}</h2>
            <p className="text-gray-700">{t('section2Content')}</p>
          </Card>

          {/* Section 3: User Responsibilities */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">{t('section3Title')}</h2>
            <div className="space-y-2 text-gray-700">
              <p>{t('section3Content1')}</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>{t('section3Item1')}</li>
                <li>{t('section3Item2')}</li>
                <li>{t('section3Item3')}</li>
                <li>{t('section3Item4')}</li>
                <li>{t('section3Item5')}</li>
              </ul>
            </div>
          </Card>

          {/* Section 4: Prohibited Activities */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">{t('section4Title')}</h2>
            <div className="space-y-2 text-gray-700">
              <p>{t('section4Content1')}</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>{t('section4Item1')}</li>
                <li>{t('section4Item2')}</li>
                <li>{t('section4Item3')}</li>
                <li>{t('section4Item4')}</li>
                <li>{t('section4Item5')}</li>
              </ul>
            </div>
          </Card>

          {/* Section 5: Transactions */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">{t('section5Title')}</h2>
            <p className="text-gray-700">{t('section5Content')}</p>
          </Card>

          {/* Section 6: Disclaimer */}
          <Card className="bg-orange-50 border border-orange-200">
            <h2 className="text-lg font-semibold text-orange-800 mb-3">{t('section6Title')}</h2>
            <div className="space-y-2 text-orange-700">
              <p>{t('section6Content1')}</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>{t('section6Item1')}</li>
                <li>{t('section6Item2')}</li>
                <li>{t('section6Item3')}</li>
              </ul>
            </div>
          </Card>

          {/* Section 7: Account Termination */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">{t('section7Title')}</h2>
            <p className="text-gray-700">{t('section7Content')}</p>
          </Card>

          {/* Section 8: Changes to Terms */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">{t('section8Title')}</h2>
            <p className="text-gray-700">{t('section8Content')}</p>
          </Card>

          {/* Section 9: Contact */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">{t('section9Title')}</h2>
            <p className="text-gray-700">{t('section9Content')}</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
