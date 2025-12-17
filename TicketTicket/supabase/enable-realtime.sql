-- 啟用 Realtime 功能
-- 在 Supabase SQL Editor 中執行此腳本

-- 啟用 messages 表的 Realtime（用於即時聊天）
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- 如果需要也可以啟用其他表的 Realtime
-- ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
-- ALTER PUBLICATION supabase_realtime ADD TABLE applications;
