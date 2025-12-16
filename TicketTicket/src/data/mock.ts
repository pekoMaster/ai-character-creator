import { User, Listing, Application, Message, Review } from '@/types';

// 模擬用戶資料
export const mockUsers: User[] = [
  {
    id: 'current-user',
    username: '我',
    email: 'me@example.com',
    avatarUrl: undefined,
    rating: 0,
    reviewCount: 0,
    createdAt: new Date(),
    isVerified: false,
  },
];

// 模擬刊登資料
export const mockListings: Listing[] = [];

// 模擬申請資料
export const mockApplications: Application[] = [];

// 模擬訊息資料
export const mockMessages: Message[] = [];

// 模擬評價資料
export const mockReviews: Review[] = [];

// 取得用戶的函數
export function getUserById(id: string): User | undefined {
  return mockUsers.find(user => user.id === id);
}

// 取得刊登的函數
export function getListingById(id: string): Listing | undefined {
  return mockListings.find(listing => listing.id === id);
}

// 取得用戶的刊登
export function getListingsByHostId(hostId: string): Listing[] {
  return mockListings.filter(listing => listing.hostId === hostId);
}

// 取得刊登的申請
export function getApplicationsByListingId(listingId: string): Application[] {
  return mockApplications.filter(app => app.listingId === listingId);
}

// 取得用戶的申請
export function getApplicationsByGuestId(guestId: string): Application[] {
  return mockApplications.filter(app => app.guestId === guestId);
}

// 取得對話訊息
export function getMessagesByConversationId(conversationId: string): Message[] {
  return mockMessages.filter(msg => msg.conversationId === conversationId);
}

// 取得用戶的評價
export function getReviewsByRevieweeId(revieweeId: string): Review[] {
  return mockReviews.filter(review => review.revieweeId === revieweeId);
}
