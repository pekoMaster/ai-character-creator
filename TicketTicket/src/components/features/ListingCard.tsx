'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useLanguage } from '@/contexts/LanguageContext';
import { Calendar, MapPin, Users } from 'lucide-react';
import Card from '@/components/ui/Card';
import { TicketTypeTag } from '@/components/ui/Tag';
import Avatar from '@/components/ui/Avatar';
import StarRating from '@/components/ui/StarRating';
import { Listing, User } from '@/types';

interface ListingCardProps {
  listing: Listing;
  host?: User;
}

export default function ListingCard({ listing, host }: ListingCardProps) {
  const t = useTranslations('listing');
  const { locale } = useLanguage();

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(locale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  return (
    <Link href={`/listing/${listing.id}`}>
      <Card hoverable className="animate-fade-in">
        {/* 標籤 */}
        <div className="mb-3 flex flex-wrap gap-2">
          <TicketTypeTag
            type={listing.ticketType}
            showWarning={true}
          />
        </div>

        {/* 活動資訊 */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
          {listing.eventName}
        </h3>

        {/* 藝人標籤 */}
        {listing.artistTags && listing.artistTags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {listing.artistTags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-pink-50 text-pink-600"
              >
                {tag}
              </span>
            ))}
            {listing.artistTags.length > 3 && (
              <span className="text-xs text-gray-400">
                +{listing.artistTags.length - 3}
              </span>
            )}
          </div>
        )}

        <div className="space-y-1 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(listing.eventDate)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <MapPin className="w-4 h-4" />
            <span className="line-clamp-1">{listing.venue}</span>
          </div>
        </div>

        {/* 價格和名額 */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 bg-indigo-50 rounded-lg py-2 px-3 text-center">
            <p className="text-lg font-bold text-indigo-600">
              ¥{listing.askingPriceJPY.toLocaleString()}
            </p>
            <p className="text-xs text-indigo-400">{t('perPerson')}</p>
          </div>
          <div className="flex-1 bg-gray-50 rounded-lg py-2 px-3 text-center">
            <div className="flex items-center justify-center gap-1">
              <Users className="w-4 h-4 text-gray-500" />
              <span className="text-lg font-bold text-gray-700">
                {listing.availableSlots}/{listing.totalSlots}
              </span>
            </div>
            <p className="text-xs text-gray-400">{t('slots')}</p>
          </div>
        </div>

        {/* 主辦方資訊 */}
        {host && (
          <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
            <Avatar src={host.avatarUrl} size="sm" />
            <span className="text-sm text-gray-600 flex-1">{host.username}</span>
            <StarRating
              value={host.rating}
              readonly
              size="sm"
              showValue
              totalReviews={host.reviewCount}
            />
          </div>
        )}
      </Card>
    </Link>
  );
}
