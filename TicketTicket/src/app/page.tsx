'use client';

import { useState, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useAdmin } from '@/contexts/AdminContext';
import { useTranslations } from 'next-intl';
import ListingCard from '@/components/features/ListingCard';
import { Input } from '@/components/ui/Input';
import {
  Ticket,
  Search,
  Filter,
  X,
  Loader2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import Link from 'next/link';
import {
  TicketType,
  TICKET_TYPE_INFO,
  NATIONALITY_OPTIONS,
  LANGUAGE_OPTIONS,
} from '@/types';

type SortOption = 'date' | 'price_asc' | 'price_desc' | 'newest';
type DateFilter = 'all' | 'week' | 'month' | '3months';

export default function HomePage() {
  const { listings, isLoadingListings } = useApp();
  const { events } = useAdmin();
  const t = useTranslations('home');
  const tFilter = useTranslations('filter');
  const tTicket = useTranslations('ticketType');

  // 搜尋和篩選狀態
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [selectedTicketType, setSelectedTicketType] = useState<TicketType | ''>('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [hostNameQuery, setHostNameQuery] = useState('');
  const [minRating, setMinRating] = useState('');
  const [selectedNationality, setSelectedNationality] = useState('');
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('date');

  // 取得所有唯一的活動名稱
  const allEventNames = useMemo(() => {
    const namesSet = new Set<string>();
    listings.forEach((listing) => {
      if (listing.eventName) {
        namesSet.add(listing.eventName);
      }
    });
    // 也加入管理員活動
    events.filter(e => e.isActive).forEach((event) => {
      namesSet.add(event.name);
    });
    return Array.from(namesSet).sort();
  }, [listings, events]);

  // 篩選邏輯
  const filteredListings = useMemo(() => {
    let result = listings.filter((l) => l.status === 'open');

    // 關鍵字搜尋
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (l) =>
          l.eventName.toLowerCase().includes(query) ||
          l.venue.toLowerCase().includes(query) ||
          l.description?.toLowerCase().includes(query) ||
          l.host?.username.toLowerCase().includes(query)
      );
    }

    // 活動名稱篩選
    if (selectedEvent) {
      result = result.filter((l) => l.eventName === selectedEvent);
    }

    // 日期篩選
    const now = new Date();
    if (dateFilter === 'week') {
      const weekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      result = result.filter((l) => new Date(l.eventDate) <= weekLater);
    } else if (dateFilter === 'month') {
      const monthLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      result = result.filter((l) => new Date(l.eventDate) <= monthLater);
    } else if (dateFilter === '3months') {
      const threeMonthsLater = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
      result = result.filter((l) => new Date(l.eventDate) <= threeMonthsLater);
    }

    // 票券類型篩選
    if (selectedTicketType) {
      result = result.filter((l) => l.ticketType === selectedTicketType);
    }

    // 價格範圍篩選
    const min = parseInt(minPrice) || 0;
    const max = parseInt(maxPrice) || Infinity;
    if (minPrice || maxPrice) {
      result = result.filter((l) => l.askingPriceJPY >= min && l.askingPriceJPY <= max);
    }

    // 主辦人名稱搜尋
    if (hostNameQuery) {
      const query = hostNameQuery.toLowerCase();
      result = result.filter((l) => l.host?.username.toLowerCase().includes(query));
    }

    // 評分篩選
    if (minRating) {
      const rating = parseInt(minRating);
      result = result.filter((l) => (l.host?.rating || 0) >= rating);
    }

    // 國籍篩選
    if (selectedNationality) {
      result = result.filter((l) => l.hostNationality === selectedNationality);
    }

    // 語言篩選
    if (selectedLanguages.length > 0) {
      result = result.filter((l) =>
        l.hostLanguages && selectedLanguages.some((lang) => l.hostLanguages.includes(lang))
      );
    }

    // 排序
    switch (sortBy) {
      case 'date':
        result.sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());
        break;
      case 'price_asc':
        result.sort((a, b) => a.askingPriceJPY - b.askingPriceJPY);
        break;
      case 'price_desc':
        result.sort((a, b) => b.askingPriceJPY - a.askingPriceJPY);
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    return result;
  }, [listings, searchQuery, selectedEvent, dateFilter, selectedTicketType, minPrice, maxPrice, hostNameQuery, minRating, selectedNationality, selectedLanguages, sortBy]);

  const toggleLanguage = (lang: string) => {
    setSelectedLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedEvent('');
    setDateFilter('all');
    setSelectedTicketType('');
    setMinPrice('');
    setMaxPrice('');
    setHostNameQuery('');
    setMinRating('');
    setSelectedNationality('');
    setSelectedLanguages([]);
    setSortBy('date');
  };

  const hasActiveFilters =
    searchQuery !== '' ||
    selectedEvent !== '' ||
    dateFilter !== 'all' ||
    selectedTicketType !== '' ||
    minPrice !== '' ||
    maxPrice !== '' ||
    hostNameQuery !== '' ||
    minRating !== '' ||
    selectedNationality !== '' ||
    selectedLanguages.length > 0 ||
    sortBy !== 'date';

  const ticketTypes: TicketType[] = ['find_companion', 'main_ticket_transfer', 'sub_ticket_transfer'];

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

      {/* 搜尋與篩選區 */}
      <div className="bg-white border-b border-gray-100 px-4 lg:px-6 py-4">
        <div className="max-w-7xl mx-auto">
          {/* 搜尋列 */}
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder={tFilter('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-5 h-5" />}
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`
                px-4 py-2.5 rounded-lg border transition-colors flex items-center gap-2
                ${hasActiveFilters ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'}
              `}
            >
              <Filter className="w-5 h-5" />
              <span className="hidden sm:inline">
                {showFilters ? tFilter('hideFilters') : tFilter('showFilters')}
              </span>
              {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {/* 篩選面板 */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-100 space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {/* 活動篩選 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{tFilter('event')}</label>
                  <select
                    value={selectedEvent}
                    onChange={(e) => setSelectedEvent(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-sm"
                  >
                    <option value="">{tFilter('allEvents')}</option>
                    {allEventNames.map((name) => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                </div>

                {/* 日期範圍 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{tFilter('dateRange')}</label>
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value as DateFilter)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-sm"
                  >
                    <option value="all">{tFilter('all')}</option>
                    <option value="week">{tFilter('thisWeek')}</option>
                    <option value="month">{tFilter('thisMonth')}</option>
                    <option value="3months">{tFilter('next3Months')}</option>
                  </select>
                </div>

                {/* 票券類型 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{tFilter('ticketType')}</label>
                  <select
                    value={selectedTicketType}
                    onChange={(e) => setSelectedTicketType(e.target.value as TicketType | '')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-sm"
                  >
                    <option value="">{tFilter('allTypes')}</option>
                    {ticketTypes.map((type) => (
                      <option key={type} value={type}>{TICKET_TYPE_INFO[type].label}</option>
                    ))}
                  </select>
                </div>

                {/* 排序 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{tFilter('sortBy')}</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-sm"
                  >
                    <option value="date">{tFilter('byDate')}</option>
                    <option value="price_asc">{tFilter('priceLowHigh')}</option>
                    <option value="price_desc">{tFilter('priceHighLow')}</option>
                    <option value="newest">{tFilter('newest')}</option>
                  </select>
                </div>

                {/* 價格範圍 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{tFilter('priceRange')}</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder={tFilter('minPrice')}
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                    <span className="flex items-center text-gray-400">~</span>
                    <input
                      type="number"
                      placeholder={tFilter('maxPrice')}
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                  </div>
                </div>

                {/* 主辦人名稱 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{tFilter('hostName')}</label>
                  <input
                    type="text"
                    placeholder={tFilter('hostNamePlaceholder')}
                    value={hostNameQuery}
                    onChange={(e) => setHostNameQuery(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>

                {/* 最低評分 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{tFilter('minRating')}</label>
                  <select
                    value={minRating}
                    onChange={(e) => setMinRating(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-sm"
                  >
                    <option value="">{tFilter('allRatings')}</option>
                    <option value="4">{tFilter('stars', { n: 4 })}</option>
                    <option value="3">{tFilter('stars', { n: 3 })}</option>
                    <option value="2">{tFilter('stars', { n: 2 })}</option>
                    <option value="1">{tFilter('stars', { n: 1 })}</option>
                  </select>
                </div>

                {/* 國籍 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{tFilter('nationality')}</label>
                  <select
                    value={selectedNationality}
                    onChange={(e) => setSelectedNationality(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-sm"
                  >
                    <option value="">{tFilter('allNationalities')}</option>
                    {NATIONALITY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 語言篩選（多選） */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{tFilter('languages')}</label>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGE_OPTIONS.map((lang) => (
                    <button
                      key={lang.value}
                      type="button"
                      onClick={() => toggleLanguage(lang.value)}
                      className={`
                        px-3 py-1.5 rounded-full text-sm font-medium transition-colors
                        ${selectedLanguages.includes(lang.value)
                          ? 'bg-indigo-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
                      `}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 清除篩選 */}
              {hasActiveFilters && (
                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm text-indigo-600 font-medium">
                    {tFilter('activeFilters')}
                  </span>
                  <button
                    onClick={clearFilters}
                    className="text-sm text-red-500 font-medium flex items-center gap-1 hover:text-red-600"
                  >
                    <X className="w-4 h-4" />
                    {tFilter('clearFilters')}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 結果數量 */}
          <div className="mt-3">
            <p className="text-sm text-gray-500">
              {tFilter('foundResults', { count: filteredListings.length })}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 lg:px-6 py-6">
        <div className="max-w-7xl mx-auto">
          {isLoadingListings ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
          ) : filteredListings.length > 0 ? (
            <div className="space-y-4 lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:gap-4 lg:space-y-0">
              {filteredListings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  host={listing.host}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">{hasActiveFilters ? tFilter('noResults') : t('noListings')}</p>
              {hasActiveFilters ? (
                <button
                  onClick={clearFilters}
                  className="text-indigo-500 font-medium mt-2"
                >
                  {tFilter('clearFilters')}
                </button>
              ) : (
                <Link
                  href="/create"
                  className="text-indigo-500 font-medium hover:text-indigo-600 mt-2 inline-block"
                >
                  {t('createFirst')}
                </Link>
              )}
            </div>
          )}

          {/* 平台說明 */}
          {!hasActiveFilters && filteredListings.length > 0 && (
            <section className="bg-indigo-50 rounded-xl p-4 lg:p-6 mt-8">
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
          )}
        </div>
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
