'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useApp } from '@/contexts/AppContext';
import { useTranslations } from 'next-intl';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';
import StarRating from '@/components/ui/StarRating';
import Tag from '@/components/ui/Tag';
import { TicketTypeTag } from '@/components/ui/Tag';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import ReviewCard from '@/components/features/ReviewCard';
import {
  Ticket,
  Calendar,
  MapPin,
  ChevronRight,
  Settings,
  HelpCircle,
  FileText,
  LogOut,
  Scale,
  Star,
} from 'lucide-react';

interface ApiReview {
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
}

interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  customAvatarUrl?: string;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const { listings, applications } = useApp();
  const t = useTranslations('profile');
  const tStatus = useTranslations('status');
  const tLegal = useTranslations('legal');
  const tReview = useTranslations('review');
  const tCommon = useTranslations('common');
  const { locale } = useLanguage();

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userReviews, setUserReviews] = useState<ApiReview[]>([]);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // 取得用戶資料和評價
  const fetchUserData = useCallback(async () => {
    if (!session?.user?.dbId) {
      setIsLoadingProfile(false);
      return;
    }

    try {
      // 並行取得用戶資料和評價
      const [profileRes, reviewsRes] = await Promise.all([
        fetch('/api/profile'),
        fetch(`/api/reviews?userId=${session.user.dbId}`),
      ]);

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setUserProfile({
          id: profileData.id,
          username: profileData.username,
          email: profileData.email || '',
          avatarUrl: profileData.avatarUrl,
          customAvatarUrl: profileData.customAvatarUrl,
          rating: profileData.rating || 0,
          reviewCount: profileData.reviewCount || 0,
          isVerified: profileData.isVerified || false,
        });
      }

      if (reviewsRes.ok) {
        const reviewsData = await reviewsRes.json();
        setUserReviews(reviewsData);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setIsLoadingProfile(false);
    }
  }, [session?.user?.dbId]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // 使用 API 回傳的用戶資訊，fallback 到 session
  const currentUser = userProfile || (session?.user ? {
    id: session.user.dbId || session.user.id || '',
    username: session.user.name || tCommon('defaultUser'),
    email: session.user.email || '',
    avatarUrl: session.user.image || undefined,
    customAvatarUrl: undefined,
    rating: 0,
    reviewCount: 0,
    isVerified: false,
  } : null);

  // 我的刊登
  const myListings = useMemo(() => {
    if (!currentUser) return [];
    return listings.filter((l) => l.hostId === currentUser.id);
  }, [currentUser, listings]);

  // 我的申請
  const myApplications = useMemo(() => {
    if (!currentUser) return [];
    return applications.filter((a) => a.guestId === currentUser.id);
  }, [currentUser, applications]);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(locale, {
      month: 'short',
      day: 'numeric',
    });
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">{t('title')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title={t('title')} />

      <div className="pt-14 pb-20 px-4 py-6 space-y-6">
        {/* 個人資訊卡片 */}
        <Card>
          <div className="flex items-center gap-4">
            <Avatar src={currentUser.customAvatarUrl || currentUser.avatarUrl} size="xl" />
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900">
                {currentUser.username}
              </h2>
              <StarRating
                value={currentUser.rating}
                readonly
                size="sm"
                showValue
                totalReviews={currentUser.reviewCount}
              />
              {currentUser.isVerified && (
                <Tag variant="success" className="mt-2">
                  {t('verified')}
                </Tag>
              )}
            </div>
          </div>

          {/* 統計數據 */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-gray-100">
            <div className="text-center">
              <p className="text-2xl font-bold text-indigo-600">{myListings.length}</p>
              <p className="text-xs text-gray-500">{t('listings')}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-indigo-600">{myApplications.length}</p>
              <p className="text-xs text-gray-500">{t('applications')}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-indigo-600">{userReviews.length}</p>
              <p className="text-xs text-gray-500">{t('reviews')}</p>
            </div>
          </div>
        </Card>

        {/* 我的刊登 */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">{t('myListings')}</h3>
            {myListings.length > 0 && (
              <span className="text-sm text-gray-500">{myListings.length}</span>
            )}
          </div>

          {myListings.length > 0 ? (
            <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
              {myListings.slice(0, 3).map((listing) => (
                <Link key={listing.id} href={`/listing/${listing.id}`}>
                  <Card hoverable className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <TicketTypeTag type={listing.ticketType} size="sm" />
                        <Tag
                          variant={
                            listing.status === 'open'
                              ? 'success'
                              : listing.status === 'matched'
                              ? 'info'
                              : 'default'
                          }
                          size="sm"
                        >
                          {listing.status === 'open' && tStatus('open')}
                          {listing.status === 'matched' && tStatus('matched')}
                          {listing.status === 'closed' && tStatus('closed')}
                        </Tag>
                      </div>
                      <p className="font-medium text-gray-900 truncate">
                        {listing.eventName}
                      </p>
                      <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(listing.eventDate)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {listing.venue}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="text-center py-8">
              <Ticket className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">{t('noListings')}</p>
              <Link
                href="/create"
                className="text-indigo-500 font-medium text-sm mt-2 inline-block"
              >
                {t('createFirst')}
              </Link>
            </Card>
          )}
        </section>

        {/* 收到的評價 */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">{tReview('receivedReviews')}</h3>
            {userReviews.length > 0 && (
              <span className="text-sm text-gray-500">{userReviews.length}</span>
            )}
          </div>

          {userReviews.length > 0 ? (
            <div className="space-y-3">
              {userReviews.slice(0, 5).map((review) => (
                <ReviewCard key={review.id} review={review} showEvent />
              ))}
            </div>
          ) : (
            <Card className="text-center py-8">
              <Star className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">{tReview('noReviewsYet')}</p>
            </Card>
          )}
        </section>

        {/* 設定選單 */}
        <section>
          <h3 className="font-semibold text-gray-900 mb-3">{t('settings')}</h3>
          <Card padding="none">
            <LanguageSwitcher variant="menu-item" />
            <MenuItem
              icon={<Settings className="w-5 h-5" />}
              label={t('accountSettings')}
              href="/profile/settings"
            />
            <MenuItem
              icon={<HelpCircle className="w-5 h-5" />}
              label={t('helpSupport')}
              href="#"
            />
            <MenuItem
              icon={<FileText className="w-5 h-5" />}
              label={t('terms')}
              href="/legal/terms"
            />
            <MenuItem
              icon={<Scale className="w-5 h-5" />}
              label={tLegal('tokushoho')}
              href="/legal/tokushoho"
            />
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="flex items-center gap-3 px-4 py-3.5 w-full text-left text-red-500 hover:bg-gray-50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="flex-1 font-medium">{t('logout')}</span>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </Card>
        </section>

        {/* 版本資訊 */}
        <p className="text-center text-xs text-gray-400">
          TicketTicket v1.0.0 ({t('version')})
        </p>
      </div>
    </div>
  );
}

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  danger?: boolean;
  isLast?: boolean;
}

function MenuItem({ icon, label, href, danger, isLast }: MenuItemProps) {
  return (
    <Link
      href={href}
      className={`
        flex items-center gap-3 px-4 py-3.5
        ${!isLast && 'border-b border-gray-100'}
        ${danger ? 'text-red-500' : 'text-gray-700'}
        hover:bg-gray-50 transition-colors
      `}
    >
      {icon}
      <span className="flex-1 font-medium">{label}</span>
      <ChevronRight className="w-5 h-5 text-gray-400" />
    </Link>
  );
}
