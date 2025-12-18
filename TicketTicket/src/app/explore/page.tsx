'use client';

import { useState, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useTranslations } from 'next-intl';
import ListingCard from '@/components/features/ListingCard';
import Header from '@/components/layout/Header';
import { Input } from '@/components/ui/Input';
import { Search, Filter, X, Tag } from 'lucide-react';
import { TicketType } from '@/types';

type SortOption = 'date' | 'price_asc' | 'price_desc' | 'newest';
type DateFilter = 'all' | 'week' | 'month' | 'custom';

export default function ExplorePage() {
  const { listings, isLoadingListings } = useApp();
  const t = useTranslations('explore');
  const tTicket = useTranslations('ticketType');
  const tCommon = useTranslations('common');
  const tCreate = useTranslations('create');

  // 搜尋和篩選狀態
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<TicketType[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');

  // 收集所有唯一的藝人標籤
  const allArtistTags = useMemo(() => {
    const tagsSet = new Set<string>();
    listings.forEach((listing) => {
      if (listing.artistTags && Array.isArray(listing.artistTags)) {
        listing.artistTags.forEach((tag) => tagsSet.add(tag));
      }
    });
    return Array.from(tagsSet).sort();
  }, [listings]);

  // 篩選和排序邏輯
  const filteredListings = useMemo(() => {
    let result = listings.filter((l) => l.status === 'open');

    // 關鍵字搜尋
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (l) =>
          l.eventName.toLowerCase().includes(query) ||
          l.venue.toLowerCase().includes(query) ||
          l.description?.toLowerCase().includes(query)
      );
    }

    // 票券類型篩選
    if (selectedTypes.length > 0) {
      result = result.filter((l) => selectedTypes.includes(l.ticketType));
    }

    // 藝人標籤篩選
    if (selectedTags.length > 0) {
      result = result.filter((l) =>
        l.artistTags && l.artistTags.some((tag) => selectedTags.includes(tag))
      );
    }

    // 日期篩選
    const now = new Date();
    if (dateFilter === 'week') {
      const weekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      result = result.filter((l) => new Date(l.eventDate) <= weekLater);
    } else if (dateFilter === 'month') {
      const monthLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      result = result.filter((l) => new Date(l.eventDate) <= monthLater);
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
  }, [listings, searchQuery, selectedTypes, selectedTags, sortBy, dateFilter]);

  const toggleType = (type: TicketType) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSelectedTypes([]);
    setSelectedTags([]);
    setSortBy('date');
    setDateFilter('all');
  };

  const hasActiveFilters = selectedTypes.length > 0 || selectedTags.length > 0 || sortBy !== 'date' || dateFilter !== 'all';

  const ticketTypes: TicketType[] = ['find_companion', 'main_ticket_transfer', 'sub_ticket_transfer', 'ticket_exchange'];
  const ticketTypeLabels: Record<TicketType, string> = {
    find_companion: tTicket('findCompanion'),
    main_ticket_transfer: tTicket('mainTicketTransfer'),
    sub_ticket_transfer: tTicket('subTicketTransfer'),
    ticket_exchange: tTicket('ticketExchange'),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title={t('title')} />

      <div className="pt-14">
        {/* 搜尋列 */}
        <div className="bg-white border-b border-gray-100 px-4 py-3">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-5 h-5" />}
                className="py-2"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`
                p-3 rounded-lg border transition-colors
                ${hasActiveFilters ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-gray-300 text-gray-600'}
              `}
            >
              <Filter className="w-5 h-5" />
            </button>
          </div>

          {/* 篩選面板 */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-100 animate-fade-in">
              {/* 日期篩選 */}
              <div className="mb-4">
                <label className="text-sm font-medium text-gray-700 mb-2 block">{t('dateRange')}</label>
                <div className="flex gap-2 flex-wrap">
                  {[
                    { value: 'all', label: tCommon('all') },
                    { value: 'week', label: t('thisWeek') },
                    { value: 'month', label: t('thisMonth') },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setDateFilter(option.value as DateFilter)}
                      className={`
                        px-3 py-1.5 rounded-full text-sm font-medium transition-colors
                        ${dateFilter === option.value
                          ? 'bg-indigo-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
                      `}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 票券類型篩選 */}
              <div className="mb-4">
                <label className="text-sm font-medium text-gray-700 mb-2 block">{t('ticketType')}</label>
                <div className="flex gap-2 flex-wrap">
                  {ticketTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => toggleType(type)}
                      className={`
                        px-3 py-1.5 rounded-full text-sm font-medium transition-colors
                        ${selectedTypes.includes(type)
                          ? 'bg-indigo-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
                      `}
                    >
                      {ticketTypeLabels[type]}
                    </button>
                  ))}
                </div>
              </div>

              {/* 藝人標籤篩選 */}
              {allArtistTags.length > 0 && (
                <div className="mb-4">
                  <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-1">
                    <Tag className="w-4 h-4" />
                    {tCreate('artistGroup')}
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {allArtistTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`
                          px-3 py-1.5 rounded-full text-sm font-medium transition-colors
                          ${selectedTags.includes(tag)
                            ? 'bg-pink-500 text-white'
                            : 'bg-pink-50 text-pink-600 hover:bg-pink-100'}
                        `}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 排序 */}
              <div className="mb-4">
                <label className="text-sm font-medium text-gray-700 mb-2 block">{t('sortBy')}</label>
                <div className="flex gap-2 flex-wrap">
                  {[
                    { value: 'date', label: t('byDate') },
                    { value: 'price_asc', label: t('priceLowHigh') },
                    { value: 'price_desc', label: t('priceHighLow') },
                    { value: 'newest', label: t('newest') },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSortBy(option.value as SortOption)}
                      className={`
                        px-3 py-1.5 rounded-full text-sm font-medium transition-colors
                        ${sortBy === option.value
                          ? 'bg-indigo-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
                      `}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 清除篩選 */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-indigo-500 font-medium flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  {t('clearFilters')}
                </button>
              )}
            </div>
          )}
        </div>

        {/* 結果數量 */}
        <div className="px-4 py-3">
          <p className="text-sm text-gray-500">
            {t('foundResults', { count: filteredListings.length })}
          </p>
        </div>

        {/* 刊登列表 */}
        <div className="px-4 lg:px-6 pb-6 space-y-4 lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:gap-4 lg:space-y-0">
          {isLoadingListings ? (
            <div className="text-center py-12 lg:col-span-full">
              <p className="text-gray-500">{t('loading')}</p>
            </div>
          ) : filteredListings.length > 0 ? (
            filteredListings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                host={listing.host}
              />
            ))
          ) : (
            <div className="text-center py-12 lg:col-span-full">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">{t('noResults')}</p>
              <button
                onClick={clearFilters}
                className="text-indigo-500 font-medium mt-2"
              >
                {t('clearFilters')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
