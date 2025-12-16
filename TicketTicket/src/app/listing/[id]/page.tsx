'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useApp } from '@/contexts/AppContext';
import { useTranslations } from 'next-intl';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Input';
import { TicketTypeTag } from '@/components/ui/Tag';
import Avatar from '@/components/ui/Avatar';
import StarRating from '@/components/ui/StarRating';
import SafetyBanner from '@/components/ui/SafetyBanner';
import { TicketType } from '@/types';
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  AlertTriangle,
  MessageCircle,
  Check,
} from 'lucide-react';

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { listings, applications, currentUser, getUserById, addApplication } = useApp();
  const t = useTranslations('listing');
  const tApply = useTranslations('apply');
  const tTicket = useTranslations('ticketType');
  const { locale } = useLanguage();

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyMessage, setApplyMessage] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const listing = listings.find((l) => l.id === params.id);
  const host = listing ? getUserById(listing.hostId) : undefined;

  // 檢查是否已申請
  const existingApplication = applications.find(
    (a) => a.listingId === listing?.id && a.guestId === currentUser?.id
  );

  // 檢查是否為主辦方
  const isHost = listing?.hostId === currentUser?.id;

  // Helper to get ticket type info translations
  const getTicketTypeInfo = (type: TicketType) => {
    const labelKey = type === 'find_companion' ? 'findCompanion' : type === 'main_ticket_transfer' ? 'mainTicketTransfer' : 'subTicketTransfer';
    const warningKey = type === 'find_companion' ? 'findCompanionWarning' : type === 'main_ticket_transfer' ? 'mainTicketTransferWarning' : 'subTicketTransferWarning';
    return {
      label: tTicket(labelKey),
      warning: tTicket(warningKey),
    };
  };

  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">{t('detail')}</p>
      </div>
    );
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleApply = async () => {
    if (!currentUser) return;

    setIsApplying(true);

    // 模擬申請過程
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const newApplication = {
      id: `app-${Date.now()}`,
      listingId: listing.id,
      guestId: currentUser.id,
      status: 'pending' as const,
      message: applyMessage || undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    addApplication(newApplication);

    setIsApplying(false);
    setShowApplyModal(false);
    setShowSuccessModal(true);
  };

  const ticketInfo = getTicketTypeInfo(listing.ticketType);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title={t('detail')} showBack />

      <div className="pt-14 pb-24">
        {/* 主要資訊 */}
        <div className="bg-white px-4 py-6 border-b border-gray-100">
          {/* 票券類型標籤 */}
          <div className="mb-3">
            <TicketTypeTag type={listing.ticketType} size="md" />
          </div>

          {/* 活動名稱 */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{listing.eventName}</h1>

          {/* 活動資訊 */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-gray-600">
              <Calendar className="w-5 h-5 text-gray-400" />
              <span>{formatDate(listing.eventDate)}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <MapPin className="w-5 h-5 text-gray-400" />
              <span>{listing.venue}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <Clock className="w-5 h-5 text-gray-400" />
              <span>{t('meetingTime')}: {formatTime(listing.meetingTime)}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <MapPin className="w-5 h-5 text-gray-400" />
              <span>{t('meetingLocation')}: {listing.meetingLocation}</span>
            </div>
          </div>
        </div>

        {/* 價格資訊 */}
        <div className="px-4 py-4">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-500">{t('price')}</p>
                <p className="text-3xl font-bold text-indigo-600">
                  ${listing.askingPriceTWD.toLocaleString()}
                  <span className="text-base font-normal text-gray-500">{t('perPerson')}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">{t('availableSlots')}</p>
                <div className="flex items-center gap-1">
                  <Users className="w-5 h-5 text-gray-400" />
                  <span className="text-2xl font-bold text-gray-700">
                    {listing.availableSlots}/{listing.totalSlots}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
              <p>{t('originalPrice')}: ¥{listing.originalPriceJPY.toLocaleString()} (≈ ${listing.originalPriceTWD.toLocaleString()} TWD)</p>
            </div>
          </Card>
        </div>

        {/* 票券類型警告 */}
        {ticketInfo.warning && (
          <div className="px-4 pb-4">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-orange-800">{ticketInfo.label}</p>
                <p className="text-sm text-orange-700 mt-1">{ticketInfo.warning}</p>
              </div>
            </div>
          </div>
        )}

        {/* 描述 */}
        {listing.description && (
          <div className="px-4 pb-4">
            <Card>
              <h3 className="font-semibold text-gray-900 mb-2">{t('description')}</h3>
              <p className="text-gray-600 whitespace-pre-wrap">{listing.description}</p>
            </Card>
          </div>
        )}

        {/* 主辦方資訊 */}
        {host && (
          <div className="px-4 pb-4">
            <Card>
              <h3 className="font-semibold text-gray-900 mb-3">{t('host')}</h3>
              <div className="flex items-center gap-3">
                <Avatar src={host.avatarUrl} size="lg" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{host.username}</p>
                  <StarRating
                    value={host.rating}
                    readonly
                    size="sm"
                    showValue
                    totalReviews={host.reviewCount}
                  />
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* 安全提醒 */}
        <div className="px-4 pb-4">
          <SafetyBanner variant="listing" />
        </div>
      </div>

      {/* 底部操作列 */}
      <div className="fixed bottom-16 left-0 right-0 lg:left-64 lg:bottom-0 bg-white border-t border-gray-100 px-4 py-3 safe-area-bottom">
        {isHost ? (
          <Button fullWidth onClick={() => router.push(`/messages`)}>
            <MessageCircle className="w-5 h-5 mr-2" />
            {t('manageApplications')}
          </Button>
        ) : existingApplication ? (
          <Button fullWidth disabled variant="secondary">
            <Check className="w-5 h-5 mr-2" />
            {existingApplication.status === 'pending' && t('applied')}
            {existingApplication.status === 'accepted' && t('matched')}
            {existingApplication.status === 'rejected' && t('rejected')}
          </Button>
        ) : listing.availableSlots === 0 ? (
          <Button fullWidth disabled variant="secondary">
            {t('full')}
          </Button>
        ) : (
          <Button fullWidth onClick={() => setShowApplyModal(true)}>
            {t('apply')}
          </Button>
        )}
      </div>

      {/* 申請 Modal */}
      <Modal
        isOpen={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        title={tApply('title')}
      >
        <div className="p-4">
          <div className="mb-4">
            <p className="text-gray-600 text-sm mb-2">
              {listing.eventName}
            </p>
            <p className="text-gray-600 text-sm">
              {t('price')}: ${listing.askingPriceTWD}{t('perPerson')}
            </p>
          </div>

          <Textarea
            label={tApply('intro')}
            placeholder={tApply('introPlaceholder')}
            value={applyMessage}
            onChange={(e) => setApplyMessage(e.target.value)}
            rows={4}
            maxLength={200}
            showCount
          />

          <SafetyBanner variant="listing" className="mt-4" />

          <Button
            fullWidth
            className="mt-4"
            onClick={handleApply}
            loading={isApplying}
          >
            {tApply('submit')}
          </Button>
        </div>
      </Modal>

      {/* 成功 Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title=""
      >
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{tApply('success')}</h3>
          <p className="text-gray-500 mb-6">
            {tApply('successMessage')}
          </p>
          <Button fullWidth onClick={() => {
            setShowSuccessModal(false);
            router.push('/');
          }}>
            {tApply('backHome')}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
