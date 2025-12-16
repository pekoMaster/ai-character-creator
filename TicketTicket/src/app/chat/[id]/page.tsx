'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useApp } from '@/contexts/AppContext';
import Header from '@/components/layout/Header';
import SafetyBanner from '@/components/ui/SafetyBanner';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import { Send, Calendar, MapPin, DollarSign } from 'lucide-react';

export default function ChatPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { listings, messages, currentUser, getUserById, addMessage } = useApp();

  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const listingId = params.id as string;
  const otherUserId = searchParams.get('with');

  const listing = listings.find((l) => l.id === listingId);
  const otherUser = otherUserId ? getUserById(otherUserId) : undefined;

  // 取得此對話的訊息
  const conversationMessages = messages.filter((m) => m.conversationId === listingId);

  // 滾動到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversationMessages]);

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('zh-TW', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('zh-TW', {
      month: 'short',
      day: 'numeric',
    });
  };

  const handleSend = () => {
    if (!inputMessage.trim() || !currentUser) return;

    const newMessage = {
      id: `msg-${Date.now()}`,
      conversationId: listingId,
      senderId: currentUser.id,
      content: inputMessage.trim(),
      createdAt: new Date(),
      isRead: false,
    };

    addMessage(newMessage);
    setInputMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">找不到此對話</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <Header
        title={otherUser ? `與 ${otherUser.username} 聊天` : '聊天'}
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
              <span>{formatDate(listing.eventDate)}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="truncate">{listing.meetingLocation}</span>
            </div>
            <div className="flex items-center gap-1">
              <DollarSign className="w-4 h-4 text-gray-400" />
              <span>${listing.askingPriceTWD}/人</span>
            </div>
          </div>
        </div>

        {/* 訊息區域 */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {conversationMessages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 text-sm">開始對話吧！</p>
            </div>
          ) : (
            conversationMessages.map((msg) => {
              const isMe = msg.senderId === currentUser?.id;
              const sender = getUserById(msg.senderId);

              return (
                <div
                  key={msg.id}
                  className={`flex gap-2 ${isMe ? 'flex-row-reverse' : ''}`}
                >
                  {!isMe && <Avatar src={sender?.avatarUrl} size="sm" />}

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
                      {formatTime(msg.createdAt)}
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
              placeholder="輸入訊息..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="
                flex-1 px-4 py-2 bg-gray-100 rounded-full
                focus:outline-none focus:ring-2 focus:ring-indigo-500
                text-sm
              "
            />
            <Button
              onClick={handleSend}
              disabled={!inputMessage.trim()}
              className="!rounded-full !px-4"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
