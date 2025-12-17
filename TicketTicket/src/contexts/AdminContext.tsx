'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { HololiveEvent } from '@/types';

// API 回傳的活動類型
interface ApiEvent {
  id: string;
  name: string;
  artist: string;
  event_date: string;
  event_end_date?: string;
  venue: string;
  venue_address?: string;
  image_url?: string;
  description?: string;
  ticket_price_tiers: {
    seat_grade: string;
    ticket_count_type: string;
    price_jpy: number;
  }[];
  category: 'concert' | 'fan_meeting' | 'expo' | 'streaming' | 'other';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// 轉換 API 資料為前端格式
function convertApiEventToEvent(apiEvent: ApiEvent): HololiveEvent {
  return {
    id: apiEvent.id,
    name: apiEvent.name,
    artist: apiEvent.artist,
    eventDate: new Date(apiEvent.event_date),
    eventEndDate: apiEvent.event_end_date ? new Date(apiEvent.event_end_date) : undefined,
    venue: apiEvent.venue,
    venueAddress: apiEvent.venue_address,
    imageUrl: apiEvent.image_url,
    description: apiEvent.description,
    ticketPriceTiers: apiEvent.ticket_price_tiers.map(tier => ({
      seatGrade: tier.seat_grade as 'B' | 'A' | 'S' | 'SS',
      ticketCountType: tier.ticket_count_type as 'solo' | 'duo',
      priceJPY: tier.price_jpy,
    })),
    category: apiEvent.category,
    isActive: apiEvent.is_active,
    createdAt: new Date(apiEvent.created_at),
    updatedAt: new Date(apiEvent.updated_at),
  };
}

interface AdminContextType {
  // 活動管理
  events: HololiveEvent[];
  isLoadingEvents: boolean;
  fetchEvents: () => Promise<void>;
  addEvent: (event: Omit<HololiveEvent, 'id' | 'createdAt' | 'updatedAt'>) => Promise<HololiveEvent | null>;
  updateEvent: (id: string, updates: Partial<HololiveEvent>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  getEvent: (id: string) => HololiveEvent | undefined;

  // 管理員驗證（現在透過 OAuth）
  isAuthenticated: boolean;
  login: (password: string) => boolean;
  logout: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

// 管理員密碼（保留舊版兼容）
const ADMIN_PASSWORD = 'hololive2025';

export function AdminProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<HololiveEvent[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 獲取活動列表
  const fetchEvents = useCallback(async () => {
    setIsLoadingEvents(true);
    try {
      const response = await fetch('/api/events?includeInactive=true');
      if (response.ok) {
        const data: ApiEvent[] = await response.json();
        setEvents(data.map(convertApiEventToEvent));
      } else {
        console.error('Failed to fetch events');
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setIsLoadingEvents(false);
    }
  }, []);

  // 載入活動資料
  useEffect(() => {
    fetchEvents();

    // 檢查管理員登入狀態
    const authStatus = sessionStorage.getItem('admin-auth');
    setIsAuthenticated(authStatus === 'true');
  }, [fetchEvents]);

  // 新增活動
  const addEvent = async (eventData: Omit<HololiveEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<HololiveEvent | null> => {
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: eventData.name,
          artist: eventData.artist,
          eventDate: eventData.eventDate instanceof Date
            ? eventData.eventDate.toISOString().split('T')[0]
            : eventData.eventDate,
          eventEndDate: eventData.eventEndDate instanceof Date
            ? eventData.eventEndDate.toISOString().split('T')[0]
            : eventData.eventEndDate,
          venue: eventData.venue,
          venueAddress: eventData.venueAddress,
          imageUrl: eventData.imageUrl,
          description: eventData.description,
          ticketPriceTiers: eventData.ticketPriceTiers?.map(tier => ({
            seat_grade: tier.seatGrade,
            ticket_count_type: tier.ticketCountType,
            price_jpy: tier.priceJPY,
          })),
          category: eventData.category,
          isActive: eventData.isActive,
        }),
      });

      if (response.ok) {
        const data: ApiEvent = await response.json();
        const newEvent = convertApiEventToEvent(data);
        setEvents((prev) => [...prev, newEvent]);
        return newEvent;
      } else {
        const error = await response.json();
        console.error('Failed to create event:', error);
        return null;
      }
    } catch (error) {
      console.error('Error creating event:', error);
      return null;
    }
  };

  // 更新活動
  const updateEvent = async (id: string, updates: Partial<HololiveEvent>) => {
    try {
      const response = await fetch(`/api/events/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: updates.name,
          artist: updates.artist,
          eventDate: updates.eventDate instanceof Date
            ? updates.eventDate.toISOString().split('T')[0]
            : updates.eventDate,
          eventEndDate: updates.eventEndDate instanceof Date
            ? updates.eventEndDate.toISOString().split('T')[0]
            : updates.eventEndDate,
          venue: updates.venue,
          venueAddress: updates.venueAddress,
          imageUrl: updates.imageUrl,
          description: updates.description,
          ticketPriceTiers: updates.ticketPriceTiers?.map(tier => ({
            seat_grade: tier.seatGrade,
            ticket_count_type: tier.ticketCountType,
            price_jpy: tier.priceJPY,
          })),
          category: updates.category,
          isActive: updates.isActive,
        }),
      });

      if (response.ok) {
        setEvents((prev) =>
          prev.map((e) =>
            e.id === id ? { ...e, ...updates, updatedAt: new Date() } : e
          )
        );
      }
    } catch (error) {
      console.error('Error updating event:', error);
    }
  };

  // 刪除活動
  const deleteEvent = async (id: string) => {
    try {
      const response = await fetch(`/api/events/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setEvents((prev) => prev.filter((e) => e.id !== id));
      }
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  // 取得單一活動
  const getEvent = (id: string): HololiveEvent | undefined => {
    return events.find((e) => e.id === id);
  };

  // 登入
  const login = (password: string): boolean => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem('admin-auth', 'true');
      return true;
    }
    return false;
  };

  // 登出
  const logout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('admin-auth');
  };

  return (
    <AdminContext.Provider
      value={{
        events,
        isLoadingEvents,
        fetchEvents,
        addEvent,
        updateEvent,
        deleteEvent,
        getEvent,
        isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
