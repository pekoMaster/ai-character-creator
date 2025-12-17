-- 禁用 RLS（因為我們使用 NextAuth 而非 Supabase Auth）
-- 在 Supabase SQL Editor 中執行此腳本

-- 禁用所有表的 RLS
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE listings DISABLE ROW LEVEL SECURITY;
ALTER TABLE applications DISABLE ROW LEVEL SECURITY;
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE events DISABLE ROW LEVEL SECURITY;

-- 刪除現有的 RLS 政策
DROP POLICY IF EXISTS "Users can view all users" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Anyone can view active events" ON events;
DROP POLICY IF EXISTS "Anyone can view open listings" ON listings;
DROP POLICY IF EXISTS "Users can create listings" ON listings;
DROP POLICY IF EXISTS "Users can update own listings" ON listings;
DROP POLICY IF EXISTS "Users can delete own listings" ON listings;
DROP POLICY IF EXISTS "Users can view own applications" ON applications;
DROP POLICY IF EXISTS "Users can create applications" ON applications;
DROP POLICY IF EXISTS "Users can update own applications" ON applications;
DROP POLICY IF EXISTS "Users can view own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can view messages in own conversations" ON messages;
DROP POLICY IF EXISTS "Users can send messages in own conversations" ON messages;
DROP POLICY IF EXISTS "Anyone can view reviews" ON reviews;
DROP POLICY IF EXISTS "Users can create reviews" ON reviews;
