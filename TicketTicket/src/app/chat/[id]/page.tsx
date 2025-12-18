'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useSupabaseClient } from '@/hooks/useSupabaseClient';
import Header from '@/components/layout/Header';
import SafetyBanner from '@/components/ui/SafetyBanner';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import { Send, Calendar, MapPin, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

interface User {
  id: string;
  username: string;
  avatar_url?: string;
  rating: number;
  review_count: number;
}

interface Listing {
  id: string;
  event_name: string;
  event_date: string;
  venue: string;
  asking_price_jpy: number;
  meeting_location: string;
  status: string;
}

interface ConversationData {
  conversation: {
    id: string;
    listing_id: string;
    host_id: string;
    guest_id: string;
    listing: Listing;
    host: User;
    guest: User;
    otherUser: User;
    isHost: boolean;
  };
  messages: Message[];
}

export default function ChatPage() {
  const params = useParams();
  const { data: session } = useSession();
  const supabase = useSupabaseClient();
  const conversationId = params.id as string;
  const tCommon = useTranslations('common');

  const [conversationData, setConversationData] = useState<ConversationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 獲取對話資料
  const fetchConversation = useCallback(async () => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}`);
      if (response.ok) {
        const data = await response.json();
        setConversationData(data);
      }
    } catch (error) {
      console.error('Error fetching conversation:', error);
    } finally {
      setIsLoading(false);
    }
  }, [conversationId]);

  // 初始載入對話資料
  useEffect(() => {
    fetchConversation();
  }, [fetchConversation]);

  // Supabase Realtime 訂閱
  useEffect(() => {
    if (!conversationId) return;

    // 訂閱此對話的新訊息
    const channel = supabase
      .channel(`chat:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          // 收到新訊息時，加入到訊息列表
          const newMessage = payload.new as Message;
          setConversationData((prev) => {
            if (!prev) return prev;
            // 避免重複加入（自己發送的訊息已經加入了）
            const exists = prev.messages.some((m) => m.id === newMessage.id);
            if (exists) return prev;
            return {
              ...prev,
              messages: [...prev.messages, newMessage],
            };
          });
        }
      )
      .subscribe();

    // 清理訂閱
    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, supabase]);

  // 滾動到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversationData?.messages]);

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('zh-TW', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-TW', {
      month: 'short',
      day: 'numeric',
    });
  };

  const handleSend = async () => {
    if (!inputMessage.trim() || isSending || !session?.user?.dbId) return;

    const messageContent = inputMessage.trim();
    setInputMessage('');
    setIsSending(true);

    // 樂觀更新：立即顯示訊息
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: Message = {
      id: tempId,
      conversation_id: conversationId,
      sender_id: session.user.dbId,
      content: messageContent,
      is_read: false,
      created_at: new Date().toISOString(),
    };

    setConversationData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        messages: [...prev.messages, optimisticMessage],
      };
    });

    try {
      const response = await fetch(`/api/conversations/${conversationId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: messageContent }),
      });

      if (response.ok) {
        const data = await response.json();
        // 用真實訊息替換臨時訊息
        setConversationData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            messages: prev.messages.map((m) =>
              m.id === tempId ? data : m
            ),
          };
        });
      } else {
        // 發送失敗，移除臨時訊息
        setConversationData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            messages: prev.messages.filter((m) => m.id !== tempId),
          };
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // 發送失敗，移除臨時訊息
      setConversationData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          messages: prev.messages.filter((m) => m.id !== tempId),
        };
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!conversationData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">找不到此對話</p>
      </div>
    );
  }

  const { conversation, messages } = conversationData;
  const { listing, otherUser } = conversation;
  const currentUserId = session?.user?.dbId;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <Header
        title={otherUser ? tCommon('chatWith', { name: otherUser.username }) : tCommon('chat')}
        showBack
      />

      <div className="flex-1 flex flex-col pt-14">
        {/* 安全警告 */}
        <div className="px-4 py-3 bg-white border-b border-gray-100">
          <SafetyBanner variant="chat" />
        </div>

        {/* 活動資訊摘要 */}
        <div className="px-4 py-3 bg-white border-b border-gray-100">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>{formatDate(listing.event_date)}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="truncate">{listing.meeting_location}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-gray-400 font-medium">¥</span>
              <span>{listing.asking_price_jpy?.toLocaleString()}/人</span>
            </div>
          </div>
        </div>

        {/* 訊息區域 */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 text-sm">開始對話吧！</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.sender_id === currentUserId;
              const sender = isMe
                ? (conversation.isHost ? conversation.host : conversation.guest)
                : otherUser;

              return (
                <div
                  key={msg.id}
                  className={`flex gap-2 ${isMe ? 'flex-row-reverse' : ''}`}
                >
                  {!isMe && <Avatar src={sender?.avatar_url} size="sm" />}

                  <div
                    className={`
                      max-w-[70%] rounded-2xl px-4 py-2
                      ${isMe
                        ? 'bg-indigo-500 text-white rounded-tr-sm'
                        : 'bg-white text-gray-900 rounded-tl-sm shadow-sm'}
                    `}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    <p
                      className={`
                        text-xs mt-1
                        ${isMe ? 'text-indigo-200' : 'text-gray-400'}
                      `}
                    >
                      {formatTime(msg.created_at)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 輸入區域 */}
        <div className="bg-white border-t border-gray-100 px-4 py-3 safe-area-bottom">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder={tCommon('inputMessage')}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isSending}
              className="
                flex-1 px-4 py-2 bg-gray-100 rounded-full
                focus:outline-none focus:ring-2 focus:ring-indigo-500
                text-sm disabled:opacity-50
              "
            />
            <Button
              onClick={handleSend}
              disabled={!inputMessage.trim() || isSending}
              className="!rounded-full !px-4"
            >
              {isSending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
