-- 新增用戶個人資料欄位（2025-12-17）
-- 在 Supabase SQL Editor 中執行此腳本

-- 新增電話相關欄位
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_country_code VARCHAR(10);
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20);

-- 新增 LINE 和 Discord ID 欄位
ALTER TABLE users ADD COLUMN IF NOT EXISTS line_id VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS discord_id VARCHAR(100);

-- 新增顯示控制欄位（是否在活動頁面顯示）
ALTER TABLE users ADD COLUMN IF NOT EXISTS show_line BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS show_discord BOOLEAN DEFAULT FALSE;

-- 新增自訂頭像 URL 欄位（用於上傳的頭像，與 OAuth 頭像分開）
ALTER TABLE users ADD COLUMN IF NOT EXISTS custom_avatar_url TEXT;

-- 為電話欄位加入索引（可能用於搜尋）
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone_country_code, phone_number);
