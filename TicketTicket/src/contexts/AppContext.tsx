'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Listing, Application, Review } from '@/types';

// API 回傳的用戶類型
interface ApiUser {
  id: string;
  username: string;
  avatar_url?: string;
  custom_avatar_url?: string;
  rating: number;
  review_count: number;
  is_verified?: boolean;
  line_id?: string;
  discord_id?: string;
  show_line?: boolean;
  show_discord?: boolean;
}

// API 回傳的刊登類型
interface ApiListing {
  id: string;
  host_id: string;
  event_name: string;
  artist_tags: string[];
  event_date: string;
  venue: string;
  meeting_time: string;
  meeting_location: string;
  original_price_jpy: number;
  asking_price_jpy: number;
  total_slots: number;
  available_slots: number;
  ticket_type: 'find_companion' | 'main_ticket_transfer' | 'sub_ticket_transfer' | 'ticket_exchange';
  seat_grade: string;
  ticket_count_type: 'solo' | 'duo';
  host_nationality: string;
  host_languages: string[];
  identification_features?: string;
  status: 'open' | 'matched' | 'closed';
  description?: string;
  // 換票專用欄位
  exchange_event_name?: string;
  exchange_seat_grade?: string;
  subsidy_amount?: number;
  subsidy_direction?: 'i_pay_you' | 'you_pay_me';
  created_at: string;
  updated_at: string;
  host?: ApiUser;
}

// 轉換 API 資料為前端格式
function convertApiListingToListing(apiListing: ApiListing): Listing {
  return {
    id: apiListing.id,
    hostId: apiListing.host_id,
    eventName: apiListing.event_name,
    artistTags: apiListing.artist_tags,
    eventDate: new Date(apiListing.event_date),
    venue: apiListing.venue,
    meetingTime: new Date(apiListing.meeting_time),
    meetingLocation: apiListing.meeting_location,
    originalPriceJPY: apiListing.original_price_jpy,
    askingPriceJPY: apiListing.asking_price_jpy,
    totalSlots: apiListing.total_slots,
    availableSlots: apiListing.available_slots,
    ticketType: apiListing.ticket_type,
    seatGrade: apiListing.seat_grade,
    ticketCountType: apiListing.ticket_count_type,
    hostNationality: apiListing.host_nationality,
    hostLanguages: apiListing.host_languages,
    identificationFeatures: apiListing.identification_features || '',
    status: apiListing.status,
    description: apiListing.description || '',
    // 換票專用欄位
    exchangeEventName: apiListing.exchange_event_name,
    exchangeSeatGrade: apiListing.exchange_seat_grade,
    subsidyAmount: apiListing.subsidy_amount,
    subsidyDirection: apiListing.subsidy_direction,
    createdAt: new Date(apiListing.created_at),
    updatedAt: new Date(apiListing.updated_at),
    host: apiListing.host ? {
      id: apiListing.host.id,
      email: '',
      username: apiListing.host.username,
      avatarUrl: apiListing.host.avatar_url || '',
      customAvatarUrl: apiListing.host.custom_avatar_url,
      rating: apiListing.host.rating,
      reviewCount: apiListing.host.review_count,
      isVerified: apiListing.host.is_verified || false,
      lineId: apiListing.host.line_id,
      discordId: apiListing.host.discord_id,
      showLine: apiListing.host.show_line,
      showDiscord: apiListing.host.show_discord,
      createdAt: new Date(),
    } : undefined,
  };
}

interface AppContextType {
  // 刊登
  listings: Listing[];
  isLoadingListings: boolean;
  fetchListings: () => Promise<void>;
  addListing: (listingData: CreateListingData) => Promise<Listing | null>;
  updateListing: (id: string, updates: Partial<Listing>) => Promise<boolean>;
  deleteListing: (id: string) => Promise<boolean>;

  // 申請
  applications: Application[];
  addApplication: (application: Application) => void;
  updateApplication: (id: string, updates: Partial<Application>) => void;

  // 評價
  reviews: Review[];
  addReview: (review: Review) => void;

  // 免責聲明同意
  hasAgreedToDisclaimer: boolean;
  setHasAgreedToDisclaimer: (agreed: boolean) => void;
}

// 創建刊登的資料類型
interface CreateListingData {
  eventName: string;
  artistTags?: string[];
  eventDate: string;
  venue: string;
  meetingTime: string;
  meetingLocation: string;
  originalPriceJPY: number;
  askingPriceJPY: number;
  totalSlots?: number;
  ticketType: 'find_companion' | 'main_ticket_transfer' | 'sub_ticket_transfer' | 'ticket_exchange';
  seatGrade: string;
  ticketCountType: 'solo' | 'duo';
  hostNationality: string;
  hostLanguages?: string[];
  identificationFeatures?: string;
  description?: string;
  // 換票專用欄位
  exchangeEventName?: string;
  exchangeSeatGrade?: string;
  subsidyAmount?: number;
  subsidyDirection?: 'i_pay_you' | 'you_pay_me';
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoadingListings, setIsLoadingListings] = useState(true);
  const [applications, setApplications] = useState<Application[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [hasAgreedToDisclaimer, setHasAgreedToDisclaimerState] = useState(false);

  // 獲取刊登列表
  const fetchListings = useCallback(async () => {
    setIsLoadingListings(true);
    try {
      const response = await fetch('/api/listings');
      if (response.ok) {
        const data: ApiListing[] = await response.json();
        setListings(data.map(convertApiListingToListing));
      } else {
        console.error('Failed to fetch listings');
      }
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setIsLoadingListings(false);
    }
  }, []);

  // 初始化資料
  useEffect(() => {
    // 從 localStorage 讀取同意狀態
    const agreed = localStorage.getItem('disclaimerAgreed') === 'true';
    setHasAgreedToDisclaimerState(agreed);

    // 載入刊登資料
    fetchListings();
  }, [fetchListings]);

  // 設定免責聲明同意狀態
  const setHasAgreedToDisclaimer = (agreed: boolean) => {
    setHasAgreedToDisclaimerState(agreed);
    localStorage.setItem('disclaimerAgreed', String(agreed));
  };

  // 新增刊登
  const addListing = async (listingData: CreateListingData): Promise<Listing | null> => {
    try {
      const response = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(listingData),
      });

      if (response.ok) {
        const data: ApiListing = await response.json();
        const newListing = convertApiListingToListing(data);
        setListings((prev) => [newListing, ...prev]);
        return newListing;
      } else {
        const error = await response.json();
        console.error('Failed to create listing:', error);
        return null;
      }
    } catch (error) {
      console.error('Error creating listing:', error);
      return null;
    }
  };

  // 更新刊登
  const updateListing = async (id: string, updates: Partial<Listing>): Promise<boolean> => {
    try {
      const response = await fetch(`/api/listings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        setListings((prev) =>
          prev.map((listing) =>
            listing.id === id ? { ...listing, ...updates, updatedAt: new Date() } : listing
          )
        );
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating listing:', error);
      return false;
    }
  };

  // 刪除刊登
  const deleteListing = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/listings/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setListings((prev) => prev.filter((listing) => listing.id !== id));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting listing:', error);
      return false;
    }
  };

  // 新增申請
  const addApplication = (application: Application) => {
    setApplications((prev) => [application, ...prev]);
  };

  // 更新申請
  const updateApplication = (id: string, updates: Partial<Application>) => {
    setApplications((prev) =>
      prev.map((app) =>
        app.id === id ? { ...app, ...updates, updatedAt: new Date() } : app
      )
    );
  };

  // 新增評價
  const addReview = (review: Review) => {
    setReviews((prev) => [review, ...prev]);
  };

  return (
    <AppContext.Provider
      value={{
        listings,
        isLoadingListings,
        fetchListings,
        addListing,
        updateListing,
        deleteListing,
        applications,
        addApplication,
        updateApplication,
        reviews,
        addReview,
        hasAgreedToDisclaimer,
        setHasAgreedToDisclaimer,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
