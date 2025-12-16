'use client';

import { useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useTranslations } from 'next-intl';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';
import Tag from '@/components/ui/Tag';
import Button from '@/components/ui/Button';
import { MessageCircle, Users, Clock, Check, X } from 'lucide-react';
import Link from 'next/link';

export default function MessagesPage() {
  const { currentUser, listings, applications, getUserById, updateApplication, updateListing } =
    useApp();
  const t = useTranslations('messages');

  // 作為主辦方的刊登和申請
  const myListings = useMemo(() => {
    if (!currentUser) return [];
    return listings
      .filter((l) => l.hostId === currentUser.id)
      .map((listing) => ({
        listing,
        applications: applications.filter((a) => a.listingId === listing.id),
      }));
  }, [currentUser, listings, applications]);

  // 作為賓客的申請
  const myApplications = useMemo(() => {
    if (!currentUser) return [];
    return applications
      .filter((a) => a.guestId === currentUser.id)
      .map((app) => ({
        application: app,
        listing: listings.find((l) => l.id === app.listingId),
      }));
  }, [currentUser, applications, listings]);

  // 已配對的對話（已接受的申請）
  const matchedConversations = useMemo(() => {
    const fromHost = myListings.flatMap(({ listing, applications }) =>
      applications
        .filter((a) => a.status === 'accepted')
        .map((a) => ({
          type: 'host' as const,
          listing,
          application: a,
          otherUser: getUserById(a.guestId),
        }))
    );

    const fromGuest = myApplications
      .filter(({ application }) => application.status === 'accepted')
      .map(({ application, listing }) => ({
        type: 'guest' as const,
        listing,
        application,
        otherUser: listing ? getUserById(listing.hostId) : undefined,
      }));

    return [...fromHost, ...fromGuest];
  }, [myListings, myApplications, getUserById]);

  // 待處理的申請（我是主辦方）
  const pendingApplications = useMemo(() => {
    return myListings.flatMap(({ listing, applications }) =>
      applications
        .filter((a) => a.status === 'pending')
        .map((a) => ({
          listing,
          application: a,
          guest: getUserById(a.guestId),
        }))
    );
  }, [myListings, getUserById]);

  const handleAccept = (applicationId: string, listingId: string) => {
    updateApplication(applicationId, { status: 'accepted' });

    // 更新刊登的可用名額
    const listing = listings.find((l) => l.id === listingId);
    if (listing && listing.availableSlots > 0) {
      const newSlots = listing.availableSlots - 1;
      updateListing(listingId, {
        availableSlots: newSlots,
        status: newSlots === 0 ? 'matched' : 'open',
      });
    }
  };

  const handleReject = (applicationId: string) => {
    updateApplication(applicationId, { status: 'rejected' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title={t('title')} />

      <div className="pt-14 pb-20 px-4 py-6 space-y-6">
        {/* 待處理申請 */}
        {pendingApplications.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-orange-500" />
              <h2 className="text-lg font-semibold text-gray-900">{t('pending')}</h2>
              <span className="bg-orange-100 text-orange-600 text-xs font-medium px-2 py-0.5 rounded-full">
                {pendingApplications.length}
              </span>
            </div>

            <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
              {pendingApplications.map(({ listing, application, guest }) => (
                <Card key={application.id}>
                  <div className="flex items-start gap-3">
                    <Avatar src={guest?.avatarUrl} size="lg" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900">{guest?.username}</p>
                      <p className="text-sm text-gray-500 truncate">{listing.eventName}</p>
                      {application.message && (
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                          「{application.message}」
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleReject(application.id)}
                    >
                      <X className="w-4 h-4 mr-1" />
                      {t('reject')}
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => handleAccept(application.id, listing.id)}
                    >
                      <Check className="w-4 h-4 mr-1" />
                      {t('accept')}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* 已配對對話 */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle className="w-5 h-5 text-indigo-500" />
            <h2 className="text-lg font-semibold text-gray-900">{t('conversations')}</h2>
          </div>

          {matchedConversations.length > 0 ? (
            <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
              {matchedConversations.map(({ type, listing, application, otherUser }) => (
                <Link
                  key={application.id}
                  href={`/chat/${listing?.id}?with=${otherUser?.id}`}
                >
                  <Card hoverable className="flex items-center gap-3">
                    <Avatar src={otherUser?.avatarUrl} size="lg" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900">{otherUser?.username}</p>
                        <Tag variant={type === 'host' ? 'purple' : 'info'} size="sm">
                          {type === 'host' ? t('imHost') : t('imGuest')}
                        </Tag>
                      </div>
                      <p className="text-sm text-gray-500 truncate">{listing?.eventName}</p>
                    </div>
                    <MessageCircle className="w-5 h-5 text-gray-400" />
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">{t('noConversations')}</p>
              <Link
                href="/explore"
                className="text-indigo-500 font-medium mt-2 inline-block"
              >
                {t('goExplore')}
              </Link>
            </div>
          )}
        </section>

        {/* 我的申請狀態 */}
        {myApplications.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-gray-500" />
              <h2 className="text-lg font-semibold text-gray-900">{t('myApplications')}</h2>
            </div>

            <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
              {myApplications.map(({ application, listing }) => (
                <Card key={application.id}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {listing?.eventName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {listing?.venue}
                      </p>
                    </div>
                    <Tag
                      variant={
                        application.status === 'pending'
                          ? 'warning'
                          : application.status === 'accepted'
                          ? 'success'
                          : 'error'
                      }
                    >
                      {application.status === 'pending' && t('waiting')}
                      {application.status === 'accepted' && t('accepted')}
                      {application.status === 'rejected' && t('rejected')}
                    </Tag>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
