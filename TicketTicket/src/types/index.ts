// 用戶型別
export interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  customAvatarUrl?: string;        // 用戶上傳的自訂頭像
  rating: number;
  reviewCount: number;
  createdAt: Date;
  isVerified: boolean;
  // 聯絡資料
  phoneCountryCode?: string;
  phoneNumber?: string;
  // 連結帳號
  lineId?: string;
  discordId?: string;
  showLine?: boolean;
  showDiscord?: boolean;
}

// 常用國碼選項
export const PHONE_COUNTRY_CODES = [
  { value: '+81', label: '+81', country: '日本' },
  { value: '+886', label: '+886', country: '台灣' },
  { value: '+852', label: '+852', country: '香港' },
  { value: '+86', label: '+86', country: '中國' },
  { value: '+82', label: '+82', country: '韓國' },
  { value: '+1', label: '+1', country: '美國/加拿大' },
  { value: '+60', label: '+60', country: '馬來西亞' },
  { value: '+65', label: '+65', country: '新加坡' },
  { value: '+62', label: '+62', country: '印尼' },
  { value: '+66', label: '+66', country: '泰國' },
  { value: '+63', label: '+63', country: '菲律賓' },
  { value: '+61', label: '+61', country: '澳洲' },
  { value: '+44', label: '+44', country: '英國' },
];

// 票券類型（新版）
// find_companion: 尋找同行者（必須是二人票，價格為一半）
// main_ticket_transfer: 母票轉讓（須提供持票帳號或見面時借出手機）- 暫時停用
// sub_ticket_transfer: 子票轉讓（須確認對方持有且可啟用ZAIKO）
// ticket_exchange: 換票（與其他用戶交換票券）
export type TicketType = 'find_companion' | 'main_ticket_transfer' | 'sub_ticket_transfer' | 'ticket_exchange';

// 座位等級（改為動態字串，由管理員自訂）
export type SeatGrade = string;

// 票種類型（移除家庭票）
export type TicketCountType = 'solo' | 'duo';

// 刊登狀態
export type ListingStatus = 'open' | 'matched' | 'closed';

// 補貼方向
export type SubsidyDirection = 'i_pay_you' | 'you_pay_me';

// 票券刊登
export interface Listing {
  id: string;
  hostId: string;
  eventName: string;
  artistTags: string[];                     // 藝人/團體標籤
  eventDate: Date;
  venue: string;
  meetingTime: Date;
  meetingLocation: string;
  originalPriceJPY: number;                // 原價（日圓）
  askingPriceJPY: number;                  // 希望費用（日圓）
  totalSlots: number;
  availableSlots: number;
  ticketType: TicketType;
  seatGrade: SeatGrade;                    // 座位等級
  ticketCountType: TicketCountType;        // 票種類型
  hostNationality: string;                 // 持票人國籍
  hostLanguages: string[];                 // 可使用語言
  identificationFeatures: string;          // 辨識特徵（穿著等）
  status: ListingStatus;
  description?: string;                    // 其他注意事項
  // 換票專用欄位
  exchangeEventName?: string;              // 想換的活動名稱
  exchangeSeatGrade?: string;              // 想換的座位等級（'any' 為任意）
  subsidyAmount?: number;                  // 補貼金額（日圓）
  subsidyDirection?: SubsidyDirection;     // 補貼方向
  createdAt: Date;
  updatedAt: Date;
  host?: User;                             // 刊登者資訊（從 API 載入時附帶）
}

// 申請狀態
export type ApplicationStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled';

// 配對申請
export interface Application {
  id: string;
  listingId: string;
  guestId: string;
  status: ApplicationStatus;
  message?: string;
  createdAt: Date;
  updatedAt: Date;
}

// 聊天訊息
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: Date;
  isRead: boolean;
}

// 評價
export interface Review {
  id: string;
  reviewerId: string;
  revieweeId: string;
  listingId: string;
  rating: number;
  comment?: string;
  createdAt: Date;
}

// HOLOLIVE 活動類型
export type EventCategory = 'concert' | 'fan_meeting' | 'expo' | 'streaming' | 'other';

// 票價等級（用於管理員設定價格天花板）
export interface TicketPriceTier {
  seatGrade: SeatGrade;
  ticketCountType: TicketCountType;
  priceJPY: number;
}

// HOLOLIVE 活動
export interface HololiveEvent {
  id: string;
  name: string;                    // 活動名稱
  artist: string;                  // 藝人/團體（如：星街すいせい、hololive）
  eventDate: Date;                 // 活動日期
  eventEndDate?: Date;             // 活動結束日（多日活動）
  venue: string;                   // 場地
  venueAddress?: string;           // 場地地址
  imageUrl?: string;               // 活動圖片 URL
  description?: string;            // 活動描述
  ticketPriceTiers: TicketPriceTier[];  // 票價等級列表
  category: EventCategory;
  isActive: boolean;               // 是否啟用顯示
  createdAt: Date;
  updatedAt: Date;
}

// 活動分類資訊
export const EVENT_CATEGORY_INFO: Record<EventCategory, {
  label: string;
  color: string;
}> = {
  concert: {
    label: '演唱會',
    color: 'bg-purple-100 text-purple-800',
  },
  fan_meeting: {
    label: '粉絲見面會',
    color: 'bg-pink-100 text-pink-800',
  },
  expo: {
    label: '展覽活動',
    color: 'bg-blue-100 text-blue-800',
  },
  streaming: {
    label: '線上直播',
    color: 'bg-green-100 text-green-800',
  },
  other: {
    label: '其他',
    color: 'bg-gray-100 text-gray-800',
  },
};

// 票券類型資訊（新版）
export const TICKET_TYPE_INFO: Record<TicketType, {
  label: string;
  description: string;
  warning?: string;
  color: string;
  requiresDuo?: boolean;  // 是否必須是二人票
  disabled?: boolean;     // 是否暫時停用
}> = {
  find_companion: {
    label: '尋找同行者',
    description: '尋找一起入場的夥伴，費用均攤',
    warning: '必須選擇二人票，價格為票價的一半',
    color: 'bg-blue-100 text-blue-800',
    requiresDuo: true,
  },
  main_ticket_transfer: {
    label: '母票轉讓',
    description: '轉讓主票，需提供持票帳號給對方或見面時借出手機',
    warning: '須提供 ZAIKO 帳號或現場借出手機入場',
    color: 'bg-purple-100 text-purple-800',
    disabled: true,  // 暫時停用
  },
  sub_ticket_transfer: {
    label: '子票轉讓',
    description: '轉讓子票，對方需持有並可啟用 ZAIKO',
    warning: '請確認對方已安裝 ZAIKO 並可接收票券',
    color: 'bg-green-100 text-green-800',
  },
  ticket_exchange: {
    label: '換票',
    description: '與其他用戶交換票券',
    warning: '需選擇想換的活動和票種',
    color: 'bg-orange-100 text-orange-800',
  },
};

// 座位等級資訊（預設，用於顯示顏色）
// 由於座位等級現在是動態字串，使用函數取得標籤
export const DEFAULT_SEAT_GRADE_COLORS: Record<string, string> = {
  B: 'bg-gray-100 text-gray-800',
  A: 'bg-blue-100 text-blue-800',
  S: 'bg-purple-100 text-purple-800',
  SS: 'bg-yellow-100 text-yellow-800',
};

// 取得座位等級顯示標籤
export function getSeatGradeLabel(grade: string): string {
  return grade; // 直接返回等級名稱
}

// 取得座位等級顏色
export function getSeatGradeColor(grade: string): string {
  return DEFAULT_SEAT_GRADE_COLORS[grade] || 'bg-indigo-100 text-indigo-800';
}

// 向後相容：SEAT_GRADE_INFO（已廢棄，請使用 getSeatGradeLabel 和 getSeatGradeColor）
export const SEAT_GRADE_INFO: Record<string, { label: string; color: string }> = {
  B: { label: 'B', color: 'bg-gray-100 text-gray-800' },
  A: { label: 'A', color: 'bg-blue-100 text-blue-800' },
  S: { label: 'S', color: 'bg-purple-100 text-purple-800' },
  SS: { label: 'SS', color: 'bg-yellow-100 text-yellow-800' },
};

// 票種類型資訊（移除家庭票）
export const TICKET_COUNT_TYPE_INFO: Record<TicketCountType, {
  label: string;
  description: string;
  color: string;
}> = {
  solo: { label: '一人票', description: '單人入場', color: 'bg-green-100 text-green-800' },
  duo: { label: '二人票', description: '雙人同行', color: 'bg-blue-100 text-blue-800' },
};

// 常用國籍選項
export const NATIONALITY_OPTIONS = [
  { value: 'TW', label: '台灣 Taiwan' },
  { value: 'JP', label: '日本 Japan' },
  { value: 'HK', label: '香港 Hong Kong' },
  { value: 'CN', label: '中國 China' },
  { value: 'KR', label: '韓國 Korea' },
  { value: 'US', label: '美國 USA' },
  { value: 'MY', label: '馬來西亞 Malaysia' },
  { value: 'SG', label: '新加坡 Singapore' },
  { value: 'ID', label: '印尼 Indonesia' },
  { value: 'TH', label: '泰國 Thailand' },
  { value: 'PH', label: '菲律賓 Philippines' },
  { value: 'AU', label: '澳洲 Australia' },
  { value: 'UK', label: '英國 UK' },
  { value: 'OTHER', label: '其他 Other' },
];

// 常用語言選項
export const LANGUAGE_OPTIONS = [
  { value: 'zh-TW', label: '繁體中文' },
  { value: 'zh-CN', label: '簡體中文' },
  { value: 'ja', label: '日本語' },
  { value: 'en', label: 'English' },
  { value: 'ko', label: '한국어' },
  { value: 'id', label: 'Bahasa Indonesia' },
  { value: 'th', label: 'ภาษาไทย' },
  { value: 'vi', label: 'Tiếng Việt' },
];

// 價格計算工具
export function calculateMaxPrice(originalPriceJPY: number, totalSlots: number): number {
  return Math.round(originalPriceJPY / totalSlots);
}

export function validatePrice(askingPrice: number, maxPrice: number): boolean {
  return askingPrice <= maxPrice;
}
