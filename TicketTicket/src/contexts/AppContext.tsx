'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Listing, Application, Message, Review } from '@/types';
import {
  mockUsers,
  mockListings,
  mockApplications,
  mockMessages,
  mockReviews,
} from '@/data/mock';

interface AppContextType {
  // 當前用戶
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;

  // 刊登
  listings: Listing[];
  addListing: (listing: Listing) => void;
  updateListing: (id: string, updates: Partial<Listing>) => void;

  // 申請
  applications: Application[];
  addApplication: (application: Application) => void;
  updateApplication: (id: string, updates: Partial<Application>) => void;

  // 訊息
  messages: Message[];
  addMessage: (message: Message) => void;

  // 評價
  reviews: Review[];
  addReview: (review: Review) => void;

  // 用戶
  users: User[];
  getUserById: (id: string) => User | undefined;

  // 免責聲明同意
  hasAgreedToDisclaimer: boolean;
  setHasAgreedToDisclaimer: (agreed: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [users] = useState<User[]>(mockUsers);
  const [hasAgreedToDisclaimer, setHasAgreedToDisclaimerState] = useState(false);

  // 初始化資料
  useEffect(() => {
    // 從 localStorage 讀取同意狀態
    const agreed = localStorage.getItem('disclaimerAgreed') === 'true';
    setHasAgreedToDisclaimerState(agreed);

    // 設定當前用戶（模擬登入）
    const savedUserId = localStorage.getItem('currentUserId');
    const user = savedUserId
      ? mockUsers.find((u) => u.id === savedUserId)
      : mockUsers.find((u) => u.id === 'current-user');
    setCurrentUser(user || null);

    // 載入模擬資料
    setListings(mockListings);
    setApplications(mockApplications);
    setMessages(mockMessages);
    setReviews(mockReviews);
  }, []);

  // 設定免責聲明同意狀態
  const setHasAgreedToDisclaimer = (agreed: boolean) => {
    setHasAgreedToDisclaimerState(agreed);
    localStorage.setItem('disclaimerAgreed', String(agreed));
  };

  // 新增刊登
  const addListing = (listing: Listing) => {
    setListings((prev) => [listing, ...prev]);
  };

  // 更新刊登
  const updateListing = (id: string, updates: Partial<Listing>) => {
    setListings((prev) =>
      prev.map((listing) =>
        listing.id === id ? { ...listing, ...updates, updatedAt: new Date() } : listing
      )
    );
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

  // 新增訊息
  const addMessage = (message: Message) => {
    setMessages((prev) => [...prev, message]);
  };

  // 新增評價
  const addReview = (review: Review) => {
    setReviews((prev) => [review, ...prev]);
  };

  // 取得用戶
  const getUserById = (id: string): User | undefined => {
    return users.find((user) => user.id === id);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        listings,
        addListing,
        updateListing,
        applications,
        addApplication,
        updateApplication,
        messages,
        addMessage,
        reviews,
        addReview,
        users,
        getUserById,
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
