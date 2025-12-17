'use client';

import { useTranslations } from 'next-intl';
import { useLanguage } from '@/contexts/LanguageContext';
import Avatar from '@/components/ui/Avatar';
import StarRating from '@/components/ui/StarRating';

interface ReviewCardProps {
  review: {
    id: string;
    rating: number;
    comment?: string;
    created_at: string;
    reviewer: {
      id: string;
      username: string;
      avatar_url?: string;
      custom_avatar_url?: string;
    };
    listing?: {
      id: string;
      event_name: string;
      event_date: string;
    };
  };
  showEvent?: boolean;
}

export default function ReviewCard({ review, showEvent = true }: ReviewCardProps) {
  const { locale } = useLanguage();
  const t = useTranslations('review');

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100">
      <div className="flex items-start gap-3">
        <Avatar
          src={review.reviewer.custom_avatar_url || review.reviewer.avatar_url}
          size="md"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="font-medium text-gray-900">{review.reviewer.username}</p>
            <p className="text-xs text-gray-400">{formatDate(review.created_at)}</p>
          </div>
          <StarRating value={review.rating} readonly size="sm" />
          {showEvent && review.listing && (
            <p className="text-xs text-gray-500 mt-1 truncate">
              {review.listing.event_name}
            </p>
          )}
          {review.comment && (
            <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">
              {review.comment}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
