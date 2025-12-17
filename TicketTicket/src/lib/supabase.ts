import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// 一般客戶端（受 RLS 限制）
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 管理員客戶端（繞過 RLS，僅用於伺服器端）
export const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : supabase; // Fallback to regular client if no service key

// Database types
export interface DbUser {
  id: string;
  email: string;
  username: string;
  avatar_url?: string;
  rating: number;
  review_count: number;
  is_verified: boolean;
  provider: string;
  provider_id: string;
  created_at: string;
  updated_at: string;
}

export interface DbListing {
  id: string;
  host_id: string;
  event_id?: string;
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
  ticket_type: 'find_companion' | 'main_ticket_transfer' | 'sub_ticket_transfer';
  seat_grade: 'B' | 'A' | 'S' | 'SS';
  ticket_count_type: 'solo' | 'duo';
  host_nationality: string;
  host_languages: string[];
  identification_features: string;
  status: 'open' | 'matched' | 'closed';
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface DbApplication {
  id: string;
  listing_id: string;
  guest_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  message?: string;
  created_at: string;
  updated_at: string;
}

export interface DbMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface DbReview {
  id: string;
  reviewer_id: string;
  reviewee_id: string;
  listing_id: string;
  rating: number;
  comment?: string;
  created_at: string;
}

export interface DbEvent {
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
