-- TicketTicket Database Schema for Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) NOT NULL,
  avatar_url TEXT,
  custom_avatar_url TEXT, -- 用戶上傳的自訂頭像
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  provider VARCHAR(50) NOT NULL, -- 'google'
  provider_id VARCHAR(255) NOT NULL,
  -- 聯絡資料
  phone_country_code VARCHAR(10),
  phone_number VARCHAR(20),
  -- 連結帳號
  line_id VARCHAR(100),
  discord_id VARCHAR(100),
  show_line BOOLEAN DEFAULT FALSE,
  show_discord BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(provider, provider_id)
);

-- Events table (for admin-managed hololive events)
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  artist VARCHAR(255) NOT NULL,
  event_date DATE NOT NULL,
  event_end_date DATE,
  venue VARCHAR(255) NOT NULL,
  venue_address TEXT,
  image_url TEXT,
  description TEXT,
  ticket_price_tiers JSONB DEFAULT '[]'::jsonb,
  category VARCHAR(50) DEFAULT 'concert',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Listings table
CREATE TABLE IF NOT EXISTS listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  host_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  event_name VARCHAR(255) NOT NULL,
  artist_tags TEXT[] DEFAULT '{}',
  event_date DATE NOT NULL,
  venue VARCHAR(255) NOT NULL,
  meeting_time TIMESTAMP WITH TIME ZONE NOT NULL,
  meeting_location VARCHAR(255) NOT NULL,
  original_price_jpy INTEGER NOT NULL,
  asking_price_jpy INTEGER NOT NULL,
  total_slots INTEGER NOT NULL DEFAULT 1,
  available_slots INTEGER NOT NULL DEFAULT 1,
  ticket_type VARCHAR(50) NOT NULL, -- 'find_companion', 'main_ticket_transfer', 'sub_ticket_transfer'
  seat_grade VARCHAR(10) NOT NULL, -- 'B', 'A', 'S', 'SS'
  ticket_count_type VARCHAR(20) NOT NULL, -- 'solo', 'duo'
  host_nationality VARCHAR(10) NOT NULL,
  host_languages TEXT[] DEFAULT '{}',
  identification_features TEXT,
  status VARCHAR(20) DEFAULT 'open', -- 'open', 'matched', 'closed'
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Applications table
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  guest_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'accepted', 'rejected', 'cancelled'
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(listing_id, guest_id)
);

-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  host_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  guest_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(listing_id, guest_id)
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reviewee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(reviewer_id, listing_id)
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_listings_host_id ON listings(host_id);
CREATE INDEX IF NOT EXISTS idx_listings_event_date ON listings(event_date);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_applications_listing_id ON applications(listing_id);
CREATE INDEX IF NOT EXISTS idx_applications_guest_id ON applications(guest_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee_id ON reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone_country_code, phone_number);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to auto-update updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_listings_updated_at
  BEFORE UPDATE ON listings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to update user rating when a new review is added
CREATE OR REPLACE FUNCTION update_user_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users
  SET
    rating = (
      SELECT COALESCE(AVG(rating), 0)
      FROM reviews
      WHERE reviewee_id = NEW.reviewee_id
    ),
    review_count = (
      SELECT COUNT(*)
      FROM reviews
      WHERE reviewee_id = NEW.reviewee_id
    )
  WHERE id = NEW.reviewee_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_rating
  AFTER INSERT ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_user_rating();

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view all users" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

-- Events policies (public read, admin write)
CREATE POLICY "Anyone can view active events" ON events
  FOR SELECT USING (is_active = true);

-- Listings policies
CREATE POLICY "Anyone can view open listings" ON listings
  FOR SELECT USING (status = 'open' OR host_id::text = auth.uid()::text);

CREATE POLICY "Users can create listings" ON listings
  FOR INSERT WITH CHECK (host_id::text = auth.uid()::text);

CREATE POLICY "Users can update own listings" ON listings
  FOR UPDATE USING (host_id::text = auth.uid()::text);

CREATE POLICY "Users can delete own listings" ON listings
  FOR DELETE USING (host_id::text = auth.uid()::text);

-- Applications policies
CREATE POLICY "Users can view own applications" ON applications
  FOR SELECT USING (
    guest_id::text = auth.uid()::text OR
    listing_id IN (SELECT id FROM listings WHERE host_id::text = auth.uid()::text)
  );

CREATE POLICY "Users can create applications" ON applications
  FOR INSERT WITH CHECK (guest_id::text = auth.uid()::text);

CREATE POLICY "Users can update own applications" ON applications
  FOR UPDATE USING (
    guest_id::text = auth.uid()::text OR
    listing_id IN (SELECT id FROM listings WHERE host_id::text = auth.uid()::text)
  );

-- Conversations policies
CREATE POLICY "Users can view own conversations" ON conversations
  FOR SELECT USING (
    host_id::text = auth.uid()::text OR
    guest_id::text = auth.uid()::text
  );

-- Messages policies
CREATE POLICY "Users can view messages in own conversations" ON messages
  FOR SELECT USING (
    conversation_id IN (
      SELECT id FROM conversations
      WHERE host_id::text = auth.uid()::text OR guest_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can send messages in own conversations" ON messages
  FOR INSERT WITH CHECK (
    sender_id::text = auth.uid()::text AND
    conversation_id IN (
      SELECT id FROM conversations
      WHERE host_id::text = auth.uid()::text OR guest_id::text = auth.uid()::text
    )
  );

-- Reviews policies
CREATE POLICY "Anyone can view reviews" ON reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can create reviews" ON reviews
  FOR INSERT WITH CHECK (reviewer_id::text = auth.uid()::text);
