'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { HololiveEvent, TicketPriceTier } from '@/types';

interface AdminContextType {
  // 活動管理
  events: HololiveEvent[];
  addEvent: (event: Omit<HololiveEvent, 'id' | 'createdAt' | 'updatedAt'>) => HololiveEvent;
  updateEvent: (id: string, updates: Partial<HololiveEvent>) => void;
  deleteEvent: (id: string) => void;
  getEvent: (id: string) => HololiveEvent | undefined;

  // 管理員驗證
  isAuthenticated: boolean;
  login: (password: string) => boolean;
  logout: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

// 預設 HOLOLIVE 活動資料（空白）
const DEFAULT_EVENTS: HololiveEvent[] = [];

// 管理員密碼（MVP 使用固定密碼，正式版改用環境變數）
const ADMIN_PASSWORD = 'hololive2025';

export function AdminProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<HololiveEvent[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // 載入活動資料
  useEffect(() => {
    const stored = localStorage.getItem('hololive-events');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // 轉換日期字串為 Date 物件
        const eventsWithDates = parsed.map((e: HololiveEvent) => ({
          ...e,
          eventDate: new Date(e.eventDate),
          eventEndDate: e.eventEndDate ? new Date(e.eventEndDate) : undefined,
          ticketPriceTiers: e.ticketPriceTiers || [],
          createdAt: new Date(e.createdAt),
          updatedAt: new Date(e.updatedAt),
        }));
        setEvents(eventsWithDates);
      } catch {
        setEvents(DEFAULT_EVENTS);
      }
    } else {
      setEvents(DEFAULT_EVENTS);
    }

    // 檢查管理員登入狀態
    const authStatus = sessionStorage.getItem('admin-auth');
    setIsAuthenticated(authStatus === 'true');

    setIsLoaded(true);
  }, []);

  // 儲存活動資料
  useEffect(() => {
    if (isLoaded && events.length > 0) {
      localStorage.setItem('hololive-events', JSON.stringify(events));
    }
  }, [events, isLoaded]);

  // 新增活動
  const addEvent = (eventData: Omit<HololiveEvent, 'id' | 'createdAt' | 'updatedAt'>): HololiveEvent => {
    const newEvent: HololiveEvent = {
      ...eventData,
      id: `holo-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setEvents((prev) => [...prev, newEvent]);
    return newEvent;
  };

  // 更新活動
  const updateEvent = (id: string, updates: Partial<HololiveEvent>) => {
    setEvents((prev) =>
      prev.map((e) =>
        e.id === id
          ? { ...e, ...updates, updatedAt: new Date() }
          : e
      )
    );
  };

  // 刪除活動
  const deleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
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
