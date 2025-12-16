'use client';

import { useApp } from '@/contexts/AppContext';
import { useTranslations } from 'next-intl';
import ListingCard from '@/components/features/ListingCard';
import { Ticket, TrendingUp, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const { listings, getUserById } = useApp();
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
    <div className="min-h-screen bg-gray-50">
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

      <div className="px-4 lg:px-6 py-6 space-y-8">
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
                  host={getUserById(listing.hostId)}
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
                  host={getUserById(listing.hostId)}
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
      </div>
    </div>
  );
}
