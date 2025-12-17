'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';
import Avatar from '@/components/ui/Avatar';
import StarRating from '@/components/ui/StarRating';
import { Check, Star } from 'lucide-react';

interface ReviewableUser {
  id: string;
  username: string;
  avatar_url?: string;
  custom_avatar_url?: string;
}

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  listingId: string;
  reviewableUsers: ReviewableUser[];
  isHost: boolean;
  onSubmitSuccess?: () => void;
}

export default function ReviewModal({
  isOpen,
  onClose,
  listingId,
  reviewableUsers,
  isHost,
  onSubmitSuccess,
}: ReviewModalProps) {
  const t = useTranslations('review');
  const [selectedUser, setSelectedUser] = useState<ReviewableUser | null>(
    reviewableUsers.length === 1 ? reviewableUsers[0] : null
  );
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!selectedUser || rating === 0) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId,
          revieweeId: selectedUser.id,
          rating,
          comment: comment.trim() || undefined,
        }),
      });

      if (response.ok) {
        setShowSuccess(true);
        setTimeout(() => {
          onSubmitSuccess?.();
          onClose();
          // Reset state
          setShowSuccess(false);
          setRating(0);
          setComment('');
          setSelectedUser(reviewableUsers.length === 1 ? reviewableUsers[0] : null);
        }, 1500);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="">
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {t('submitSuccess')}
          </h3>
          <p className="text-gray-500">{t('thankYou')}</p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isHost ? t('reviewGuest') : t('reviewHost')}
    >
      <div className="p-4 space-y-4">
        {/* User Selection (if multiple) */}
        {reviewableUsers.length > 1 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('selectUser')}
            </label>
            <div className="space-y-2">
              {reviewableUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className={`
                    w-full flex items-center gap-3 p-3 rounded-lg border transition-colors
                    ${selectedUser?.id === user.id
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  <Avatar
                    src={user.custom_avatar_url || user.avatar_url}
                    size="sm"
                  />
                  <span className="font-medium text-gray-900">{user.username}</span>
                  {selectedUser?.id === user.id && (
                    <Check className="w-5 h-5 text-indigo-500 ml-auto" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Selected User Display (if single) */}
        {reviewableUsers.length === 1 && selectedUser && (
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Avatar
              src={selectedUser.custom_avatar_url || selectedUser.avatar_url}
              size="md"
            />
            <div>
              <p className="font-medium text-gray-900">{selectedUser.username}</p>
              <p className="text-sm text-gray-500">
                {isHost ? t('reviewGuest') : t('reviewHost')}
              </p>
            </div>
          </div>
        )}

        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('yourRating')}
          </label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`w-8 h-8 ${
                    star <= rating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
            {rating > 0 && (
              <span className="ml-2 text-sm text-gray-500">{rating}/5</span>
            )}
          </div>
        </div>

        {/* Comment */}
        <Textarea
          label={t('yourComment')}
          placeholder={t('commentPlaceholder')}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          maxLength={500}
          showCount
        />

        {/* Submit Button */}
        <Button
          fullWidth
          onClick={handleSubmit}
          disabled={!selectedUser || rating === 0}
          loading={isSubmitting}
        >
          {t('submit')}
        </Button>
      </div>
    </Modal>
  );
}
