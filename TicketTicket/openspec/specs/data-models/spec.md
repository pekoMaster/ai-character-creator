# 資料模型規格

## 用戶 (User)

```typescript
interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  rating: number;        // 平均評分 (1-5)
  reviewCount: number;   // 評價數量
  createdAt: Date;
  isVerified: boolean;   // 是否已驗證
}
```

### 需求
- User.id SHALL 為唯一識別碼
- User.rating SHALL 為 1 到 5 之間的數值
- User.username SHALL 為 2-20 個字元

---

## 票券刊登 (Listing)

```typescript
interface Listing {
  id: string;
  hostId: string;                    // 主辦方用戶 ID
  eventName: string;                 // 活動名稱
  eventDate: Date;                   // 活動日期
  venue: string;                     // 場地
  meetingTime: Date;                 // 見面時間
  meetingLocation: string;           // 見面地點
  originalPriceJPY: number;          // 原價 (日圓)
  originalPriceTWD: number;          // 原價 (台幣，自動換算)
  askingPriceTWD: number;            // 要價 (台幣)
  totalSlots: number;                // 總名額
  availableSlots: number;            // 可用名額
  ticketType: TicketType;            // 票券類型
  status: ListingStatus;             // 刊登狀態
  description?: string;              // 描述
  createdAt: Date;
  updatedAt: Date;
}

type TicketType =
  | 'must_enter_together'    // 需同行入場
  | 'overseas_ticket'        // 海外票券 (需證件)
  | 'separate_link';         // 獨立連結

type ListingStatus =
  | 'open'      // 開放中
  | 'matched'   // 已配對 (額滿)
  | 'closed';   // 已關閉
```

### 需求
- Listing.askingPriceTWD SHALL NOT exceed (originalPriceTWD / totalSlots)
- Listing.originalPriceTWD SHALL be calculated as (originalPriceJPY * 0.22)
- Listing.availableSlots SHALL be >= 0 and <= totalSlots
- Listing.eventDate SHALL be a future date when created

### 情境

#### Scenario: 價格驗證
- **Given** 原價為 10,000 日圓，總名額為 2 人
- **When** 主辦方設定要價
- **Then** 要價 SHALL NOT exceed 1,100 台幣 (10000 * 0.22 / 2)

#### Scenario: 票券類型警告
- **Given** 票券類型為 'overseas_ticket'
- **When** 顯示刊登詳情
- **Then** 系統 SHALL 顯示「需攜帶護照或相關證件」警告

---

## 配對申請 (Application)

```typescript
interface Application {
  id: string;
  listingId: string;       // 刊登 ID
  guestId: string;         // 賓客用戶 ID
  status: ApplicationStatus;
  message?: string;        // 申請訊息
  createdAt: Date;
  updatedAt: Date;
}

type ApplicationStatus =
  | 'pending'    // 待審核
  | 'accepted'   // 已接受
  | 'rejected'   // 已拒絕
  | 'cancelled'; // 已取消
```

### 需求
- Application SHALL be unique per (listingId, guestId) combination
- Application.status change to 'accepted' SHALL decrement Listing.availableSlots
- When Listing.availableSlots reaches 0, Listing.status SHALL change to 'matched'

---

## 聊天訊息 (Message)

```typescript
interface Message {
  id: string;
  conversationId: string;  // 對話 ID (listingId)
  senderId: string;        // 發送者 ID
  content: string;         // 訊息內容
  createdAt: Date;
  isRead: boolean;
}
```

### 需求
- Message.content SHALL NOT exceed 1000 characters
- Messages SHALL only be accessible to matched users (host and accepted guests)

---

## 評價 (Review)

```typescript
interface Review {
  id: string;
  reviewerId: string;      // 評價者 ID
  revieweeId: string;      // 被評價者 ID
  listingId: string;       // 相關刊登 ID
  rating: number;          // 評分 (1-5)
  comment?: string;        // 評論
  createdAt: Date;
}
```

### 需求
- Review.rating SHALL be an integer from 1 to 5
- Review SHALL only be created after Listing.eventDate has passed
- Review SHALL be unique per (reviewerId, revieweeId, listingId) combination
- Review.comment SHALL NOT exceed 500 characters
