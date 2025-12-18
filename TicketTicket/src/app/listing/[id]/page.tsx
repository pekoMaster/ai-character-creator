'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
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
import { TicketType, Listing, SubsidyDirection } from '@/types';
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  AlertTriangle,
  MessageCircle,
  Check,
  Loader2,
  Star,
  Edit3,
  Trash2,
  MoreVertical,
  ArrowLeftRight,
  Banknote,
  ShieldCheck,
} from 'lucide-react';
import ReviewModal from '@/components/features/ReviewModal';

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { listings, deleteListing, updateListing } = useApp();
  const t = useTranslations('listing');
  const tApply = useTranslations('apply');
  const tTicket = useTranslations('ticketType');
  const tCommon = useTranslations('common');
  const tCreate = useTranslations('create');
  const { locale } = useLanguage();

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyMessage, setApplyMessage] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);
  const [isCheckingApplication, setIsCheckingApplication] = useState(true);

  // Host management states
  const [showHostMenu, setShowHostMenu] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Review states
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [isHostForReview, setIsHostForReview] = useState(false);
  const [reviewableUsers, setReviewableUsers] = useState<Array<{
    id: string;
    username: string;
    avatar_url?: string;
    custom_avatar_url?: string;
  }>>([]);
  const tReview = useTranslations('review');

  const listing = listings.find((l) => l.id === params.id);
  const host = listing?.host;
  const currentUserId = session?.user?.dbId;

  // 檢查是否為主辦方
  const isHost = listing?.hostId === currentUserId;

  // 判斷是否為換票類型
  const isExchangeMode = listing?.ticketType === 'ticket_exchange';

  // 檢查是否已申請
  const checkApplication = useCallback(async () => {
    if (!currentUserId || !listing) {
      setIsCheckingApplication(false);
      return;
    }

    try {
      const response = await fetch('/api/applications');
      if (response.ok) {
        const data = await response.json();
        const existingApp = data.sent?.find(
          (app: { listing_id: string }) => app.listing_id === listing.id
        );
        if (existingApp) {
          setHasApplied(true);
          setApplicationStatus(existingApp.status);
        }
      }
    } catch (error) {
      console.error('Error checking application:', error);
    } finally {
      setIsCheckingApplication(false);
    }
  }, [currentUserId, listing]);

  // 檢查是否可以評價
  const checkCanReview = useCallback(async () => {
    if (!currentUserId || !listing) return;

    try {
      const response = await fetch(`/api/reviews/can-review/${listing.id}`);
      if (response.ok) {
        const data = await response.json();
        setCanReview(data.canReview);
        setIsHostForReview(data.isHost || false);
        setReviewableUsers(data.reviewableUsers || []);
      }
    } catch (error) {
      console.error('Error checking review eligibility:', error);
    }
  }, [currentUserId, listing]);

  useEffect(() => {
    checkApplication();
  }, [checkApplication]);

  useEffect(() => {
    if (hasApplied || isHost) {
      checkCanReview();
    }
  }, [hasApplied, isHost, checkCanReview]);

  // Helper to get ticket type info translations
  const getTicketTypeInfo = (type: TicketType) => {
    const typeMapping: Record<TicketType, { labelKey: string; warningKey: string }> = {
      find_companion: { labelKey: 'findCompanion', warningKey: 'findCompanionWarning' },
      main_ticket_transfer: { labelKey: 'mainTicketTransfer', warningKey: 'mainTicketTransferWarning' },
      sub_ticket_transfer: { labelKey: 'subTicketTransfer', warningKey: 'subTicketTransferWarning' },
      ticket_exchange: { labelKey: 'ticketExchange', warningKey: 'ticketExchangeWarning' },
    };
    const { labelKey, warningKey } = typeMapping[type];
    return {
      label: tTicket(labelKey),
      warning: tTicket(warningKey),
    };
  };

  // Helper to get subsidy direction label
  const getSubsidyDirectionLabel = (direction?: SubsidyDirection) => {
    if (!direction) return '';
    return direction === 'i_pay_you' ? tCreate('iPayYou') : tCreate('youPayMe');
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
    if (!currentUserId) return;

    setIsApplying(true);

    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: listing.id,
          message: applyMessage || undefined,
        }),
      });

      if (response.ok) {
        setHasApplied(true);
        setApplicationStatus('pending');
        setShowApplyModal(false);
        setShowSuccessModal(true);
      } else {
        const error = await response.json();
        alert(error.error || tCommon('applyFailed'));
      }
    } catch (error) {
      console.error('Error applying:', error);
      alert(tCommon('applyFailed'));
    } finally {
      setIsApplying(false);
    }
  };

  const ticketInfo = getTicketTypeInfo(listing.ticketType);

  // 處理刪除刊登
  const handleDelete = async () => {
    setIsDeleting(true);
    const success = await deleteListing(listing.id);
    setIsDeleting(false);
    if (success) {
      setShowDeleteModal(false);
      router.push('/profile');
    } else {
      alert(tCommon('deleteFailed'));
    }
  };

  // 處理更新狀態
  const handleUpdateStatus = async (newStatus: 'open' | 'matched' | 'closed') => {
    setIsUpdatingStatus(true);
    const success = await updateListing(listing.id, { status: newStatus });
    setIsUpdatingStatus(false);
    setShowStatusMenu(false);
    if (!success) {
      alert(tCommon('updateFailed'));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        title={t('detail')}
        showBack
        rightAction={isHost ? (
          <div className="relative">
            <button
              onClick={() => setShowHostMenu(!showHostMenu)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </button>
            {showHostMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowHostMenu(false)}
                />
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
                  <button
                    onClick={() => {
                      setShowHostMenu(false);
                      router.push(`/listing/${listing.id}/edit`);
                    }}
                    className="w-full px-4 py-2.5 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Edit3 className="w-4 h-4" />
                    {t('edit')}
                  </button>
                  <button
                    onClick={() => {
                      setShowHostMenu(false);
                      setShowStatusMenu(true);
                    }}
                    className="w-full px-4 py-2.5 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Clock className="w-4 h-4" />
                    {t('changeStatus')}
                  </button>
                  <button
                    onClick={() => {
                      setShowHostMenu(false);
                      setShowDeleteModal(true);
                    }}
                    className="w-full px-4 py-2.5 text-left text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    {t('delete')}
                  </button>
                </div>
              </>
            )}
          </div>
        ) : undefined}
      />

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

        {/* 價格資訊 / 換票資訊 */}
        <div className="px-4 py-4">
          <Card>
            {isExchangeMode ? (
              /* 換票模式 */
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <ArrowLeftRight className="w-5 h-5 text-orange-500" />
                  <h3 className="font-semibold text-gray-900">{t('exchangeInfo')}</h3>
                </div>

                {/* 想換的活動 */}
                {listing.exchangeEventName && (
                  <div className="mb-3">
                    <p className="text-sm text-gray-500">{t('wantToExchange')}</p>
                    <p className="font-medium text-gray-900">{listing.exchangeEventName}</p>
                  </div>
                )}

                {/* 想換的票種 */}
                {listing.exchangeSeatGrade && (
                  <div className="mb-3">
                    <p className="text-sm text-gray-500">{t('wantSeatGrade')}</p>
                    <p className="font-medium text-gray-900">
                      {listing.exchangeSeatGrade === 'any' ? tCreate('anyGrade') : listing.exchangeSeatGrade}
                    </p>
                  </div>
                )}

                {/* 補貼資訊 */}
                {(listing.subsidyAmount !== undefined && listing.subsidyAmount > 0) && (
                  <div className="bg-orange-50 rounded-lg p-3 mt-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Banknote className="w-4 h-4 text-orange-600" />
                      <p className="text-sm font-medium text-orange-800">{t('subsidyInfo')}</p>
                    </div>
                    <p className="text-orange-700">
                      {getSubsidyDirectionLabel(listing.subsidyDirection)}: ¥{listing.subsidyAmount.toLocaleString()}
                    </p>
                  </div>
                )}

                {/* 持有票券原價 */}
                <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600 mt-3">
                  <p>{t('myTicketPrice')}: ¥{listing.originalPriceJPY.toLocaleString()}</p>
                </div>
              </div>
            ) : (
              /* 一般模式：價格資訊 */
              <>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-500">{t('price')}</p>
                    <p className="text-3xl font-bold text-indigo-600">
                      ¥{listing.askingPriceJPY.toLocaleString()}
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
                  <p>{t('originalPrice')}: ¥{listing.originalPriceJPY.toLocaleString()}</p>
                </div>
              </>
            )}
          </Card>
        </div>

        {/* 零手續費聲明 */}
        <div className="px-4 pb-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-green-800">{t('noFeeTitle')}</p>
              <p className="text-sm text-green-700 mt-1">{t('noFeeDesc')}</p>
            </div>
          </div>
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
                <Avatar src={host.customAvatarUrl || host.avatarUrl} size="lg" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{host.username}</p>
                  <StarRating
                    value={host.rating}
                    readonly
                    size="sm"
                    showValue
                    totalReviews={host.reviewCount}
                  />
                  {/* 已申請後顯示聯絡方式圖示 */}
                  {hasApplied && (host.showLine || host.showDiscord) && (
                    <div className="flex items-center gap-2 mt-2">
                      {host.showLine && host.lineId && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-[#00B900]/10 rounded-full" title={`LINE: ${host.lineId}`}>
                          <svg className="w-4 h-4 text-[#00B900]" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                          </svg>
                          <span className="text-xs text-[#00B900] font-medium">{host.lineId}</span>
                        </div>
                      )}
                      {host.showDiscord && host.discordId && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-[#5865F2]/10 rounded-full" title={`Discord: ${host.discordId}`}>
                          <svg className="w-4 h-4 text-[#5865F2]" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
                          </svg>
                          <span className="text-xs text-[#5865F2] font-medium">{host.discordId}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* 評價按鈕 */}
        {canReview && reviewableUsers.length > 0 && (
          <div className="px-4 pb-4">
            <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Star className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {isHostForReview ? tReview('reviewGuest') : tReview('reviewHost')}
                    </p>
                    <p className="text-sm text-gray-500">{tReview('leaveReview')}</p>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => setShowReviewModal(true)}
                >
                  {tReview('writeReview')}
                </Button>
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
        {isCheckingApplication ? (
          <Button fullWidth disabled variant="secondary">
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            載入中...
          </Button>
        ) : isHost ? (
          <Button fullWidth onClick={() => router.push(`/messages`)}>
            <MessageCircle className="w-5 h-5 mr-2" />
            {t('manageApplications')}
          </Button>
        ) : hasApplied ? (
          <Button fullWidth disabled variant="secondary">
            <Check className="w-5 h-5 mr-2" />
            {applicationStatus === 'pending' && t('applied')}
            {applicationStatus === 'accepted' && t('matched')}
            {applicationStatus === 'rejected' && t('rejected')}
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
              {t('price')}: ¥{listing.askingPriceJPY.toLocaleString()}{t('perPerson')}
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

      {/* 評價 Modal */}
      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        listingId={listing.id}
        reviewableUsers={reviewableUsers}
        isHost={isHostForReview}
        onSubmitSuccess={() => {
          setCanReview(false);
          setReviewableUsers([]);
        }}
      />

      {/* 刪除確認 Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title={t('deleteConfirmTitle')}
      >
        <div className="p-4">
          <p className="text-gray-600 mb-6">{t('deleteConfirmMessage')}</p>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => setShowDeleteModal(false)}
            >
              {tCommon('cancel')}
            </Button>
            <Button
              fullWidth
              onClick={handleDelete}
              loading={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {t('delete')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* 狀態更改 Modal */}
      <Modal
        isOpen={showStatusMenu}
        onClose={() => setShowStatusMenu(false)}
        title={t('changeStatus')}
      >
        <div className="p-4 space-y-2">
          {(['open', 'matched', 'closed'] as const).map((status) => (
            <button
              key={status}
              onClick={() => handleUpdateStatus(status)}
              disabled={isUpdatingStatus || listing.status === status}
              className={`
                w-full px-4 py-3 text-left rounded-lg transition-colors flex items-center justify-between
                ${listing.status === status
                  ? 'bg-indigo-50 text-indigo-700 font-medium'
                  : 'hover:bg-gray-50 text-gray-700'}
                ${isUpdatingStatus ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <span>
                {status === 'open' && t('statusOpen')}
                {status === 'matched' && t('statusMatched')}
                {status === 'closed' && t('statusClosed')}
              </span>
              {listing.status === status && (
                <Check className="w-5 h-5 text-indigo-600" />
              )}
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
}
