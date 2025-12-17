'use client';

import { useApp } from '@/contexts/AppContext';
import { useTranslations } from 'next-intl';
import ListingCard from '@/components/features/ListingCard';
import { Ticket, TrendingUp, Calendar, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const { listings, isLoadingListings } = useApp();
  const t = useTranslations('home');

  // 取得開放中的刊登，按日期排序
  const openListings = listings
    .filter((l) => l.status === 'open')
    .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());

  // 取得即將到來的活動（7天內）
  const now = new Date();
  const weekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const upcomingListings = openListings.filter(
    (l) => new Date(l.eventDate) <= weekLater
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header - mobile only */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30 lg:hidden">
        <div className="px-4 py-4">
          <div className="flex items-center gap-2">
            <Ticket className="w-7 h-7 text-indigo-500" />
            <h1 className="text-xl font-bold text-gray-900">TicketTicket</h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">{t('subtitle')}</p>
        </div>
      </header>

      {/* Desktop Header */}
      <header className="hidden lg:block bg-white border-b border-gray-100 px-6 py-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('subtitle')}</h1>
      </header>

      <div className="flex-1 px-4 lg:px-6 py-6 space-y-8">
        {isLoadingListings ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          </div>
        ) : (
          <>
            {/* 即將到來區塊 */}
            {upcomingListings.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-5 h-5 text-orange-500" />
                  <h2 className="text-lg font-semibold text-gray-900">{t('upcoming')}</h2>
                  <span className="bg-orange-100 text-orange-600 text-xs font-medium px-2 py-0.5 rounded-full">
                    {t('within7days')}
                  </span>
                </div>
                <div className="space-y-4 lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:gap-4 lg:space-y-0">
                  {upcomingListings.slice(0, 3).map((listing) => (
                    <ListingCard
                      key={listing.id}
                      listing={listing}
                      host={listing.host}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* 熱門刊登區塊 */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-500" />
                  <h2 className="text-lg font-semibold text-gray-900">{t('explore')}</h2>
                </div>
                <Link
                  href="/explore"
                  className="text-sm text-indigo-500 font-medium hover:text-indigo-600"
                >
                  {t('viewAll')}
                </Link>
              </div>

              {openListings.length > 0 ? (
                <div className="space-y-4 lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:gap-4 lg:space-y-0">
                  {openListings.map((listing) => (
                    <ListingCard
                      key={listing.id}
                      listing={listing}
                      host={listing.host}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Ticket className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">{t('noListings')}</p>
                  <Link
                    href="/create"
                    className="text-indigo-500 font-medium hover:text-indigo-600 mt-2 inline-block"
                  >
                    {t('createFirst')}
                  </Link>
                </div>
              )}
            </section>

            {/* 平台說明 */}
            <section className="bg-indigo-50 rounded-xl p-4 lg:p-6">
              <h3 className="font-semibold text-indigo-900 mb-2">{t('whatIs')}</h3>
              <ul className="text-sm text-indigo-700 space-y-2 lg:flex lg:gap-8 lg:space-y-0">
                <li className="flex items-start gap-2">
                  <span className="text-indigo-400">•</span>
                  <span>{t('feature1')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-400">•</span>
                  <span>{t('feature2')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-400">•</span>
                  <span>{t('feature3')}</span>
                </li>
              </ul>
            </section>
          </>
        )}
      </div>

      {/* Footer with Privacy Policy */}
      <footer className="bg-white border-t border-gray-100 px-4 py-6 mt-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Ticket className="w-5 h-5 text-indigo-500" />
              <span className="text-sm font-medium text-gray-700">TicketTicket</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <Link href="/legal/privacy" className="hover:text-indigo-600 transition-colors">
                隱私權政策
              </Link>
              <Link href="/legal/terms" className="hover:text-indigo-600 transition-colors">
                使用條款
              </Link>
              <Link href="/legal/tokushoho" className="hover:text-indigo-600 transition-colors">
                特定商取引法
              </Link>
            </div>
            <p className="text-xs text-gray-400">
              © 2025 TicketTicket. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
