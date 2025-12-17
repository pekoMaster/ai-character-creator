'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Avatar from '@/components/ui/Avatar';
import { PHONE_COUNTRY_CODES } from '@/types';
import {
  User,
  Camera,
  Phone,
  MessageCircle,
  Check,
  Loader2,
  X,
} from 'lucide-react';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  customAvatarUrl?: string;
  phoneCountryCode?: string;
  phoneNumber?: string;
  lineId?: string;
  discordId?: string;
  showLine?: boolean;
  showDiscord?: boolean;
}

export default function ProfileSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const t = useTranslations('profileSettings');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form state
  const [username, setUsername] = useState('');
  const [phoneCountryCode, setPhoneCountryCode] = useState('+81');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [lineId, setLineId] = useState('');
  const [discordId, setDiscordId] = useState('');
  const [showLine, setShowLine] = useState(false);
  const [showDiscord, setShowDiscord] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/profile/settings');
    }
  }, [status, router]);

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/profile');
        if (response.ok) {
          const data = await response.json();
          setProfile(data);
          // Initialize form state
          setUsername(data.username || '');
          setPhoneCountryCode(data.phoneCountryCode || '+81');
          setPhoneNumber(data.phoneNumber || '');
          setLineId(data.lineId || '');
          setDiscordId(data.discordId || '');
          setShowLine(data.showLine || false);
          setShowDiscord(data.showDiscord || false);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user?.dbId) {
      fetchProfile();
    }
  }, [session]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);

    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          phoneCountryCode: phoneNumber ? phoneCountryCode : null,
          phoneNumber: phoneNumber || null,
          lineId: lineId || null,
          discordId: discordId || null,
          showLine,
          showDiscord,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setSaveMessage({ type: 'success', text: t('saveSuccess') });
        setTimeout(() => setSaveMessage(null), 3000);
      } else {
        const error = await response.json();
        setSaveMessage({ type: 'error', text: error.error || t('saveError') });
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      setSaveMessage({ type: 'error', text: t('saveError') });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setSaveMessage({ type: 'error', text: 'Only image files are allowed' });
      return;
    }

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      setSaveMessage({ type: 'error', text: 'Image size must be less than 2MB' });
      return;
    }

    setIsUploading(true);
    setSaveMessage(null);

    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch('/api/profile/avatar', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setProfile((prev) => prev ? { ...prev, customAvatarUrl: data.avatarUrl } : null);
        setSaveMessage({ type: 'success', text: t('saveSuccess') });
        setTimeout(() => setSaveMessage(null), 3000);
      } else {
        const error = await response.json();
        setSaveMessage({ type: 'error', text: error.error || t('saveError') });
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      setSaveMessage({ type: 'error', text: t('saveError') });
    } finally {
      setIsUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveAvatar = async () => {
    setIsUploading(true);
    setSaveMessage(null);

    try {
      const response = await fetch('/api/profile/avatar', {
        method: 'DELETE',
      });

      if (response.ok) {
        setProfile((prev) => prev ? { ...prev, customAvatarUrl: undefined } : null);
        setSaveMessage({ type: 'success', text: t('saveSuccess') });
        setTimeout(() => setSaveMessage(null), 3000);
      } else {
        const error = await response.json();
        setSaveMessage({ type: 'error', text: error.error || t('saveError') });
      }
    } catch (error) {
      console.error('Error removing avatar:', error);
      setSaveMessage({ type: 'error', text: t('saveError') });
    } finally {
      setIsUploading(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title={t('title')} showBack />
        <div className="pt-14 flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      </div>
    );
  }

  const displayAvatarUrl = profile?.customAvatarUrl || profile?.avatarUrl;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title={t('title')} showBack />

      <div className="pt-14 pb-24 px-4 py-6 max-w-2xl mx-auto space-y-6">
        {/* Save Message */}
        {saveMessage && (
          <div
            className={`p-3 rounded-lg flex items-center gap-2 ${
              saveMessage.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {saveMessage.type === 'success' ? (
              <Check className="w-5 h-5" />
            ) : (
              <X className="w-5 h-5" />
            )}
            <span className="text-sm font-medium">{saveMessage.text}</span>
          </div>
        )}

        {/* Basic Info Section */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-indigo-500" />
            <h2 className="text-lg font-semibold text-gray-900">{t('basicInfo')}</h2>
          </div>

          {/* Avatar */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              <Avatar src={displayAvatarUrl} size="xl" className="w-24 h-24" />
              <button
                onClick={handleAvatarClick}
                disabled={isUploading}
                className="absolute bottom-0 right-0 w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-indigo-600 transition-colors disabled:opacity-50"
              >
                {isUploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Camera className="w-4 h-4" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">{t('uploadHint')}</p>
            {profile?.customAvatarUrl && (
              <button
                onClick={handleRemoveAvatar}
                disabled={isUploading}
                className="text-sm text-red-500 hover:text-red-600 mt-2"
              >
                {t('removeAvatar')}
              </button>
            )}
          </div>

          {/* Username */}
          <Input
            label={t('username')}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder={t('usernamePlaceholder')}
            maxLength={50}
          />
        </Card>

        {/* Contact Info Section */}
        <Card>
          <div className="flex items-center gap-2 mb-2">
            <Phone className="w-5 h-5 text-indigo-500" />
            <h2 className="text-lg font-semibold text-gray-900">{t('contactInfo')}</h2>
          </div>
          <p className="text-sm text-gray-500 mb-4">{t('contactInfoHint')}</p>

          {/* Phone */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">{t('phone')}</label>
            <p className="text-xs text-gray-500 mb-2">{t('phoneHint')}</p>
            <div className="flex gap-2">
              <select
                value={phoneCountryCode}
                onChange={(e) => setPhoneCountryCode(e.target.value)}
                className="w-32 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              >
                {PHONE_COUNTRY_CODES.map((code) => (
                  <option key={code.value} value={code.value}>
                    {code.label} {code.country}
                  </option>
                ))}
              </select>
              <Input
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder={t('phoneNumberPlaceholder')}
                className="flex-1"
                maxLength={15}
              />
            </div>
          </div>
        </Card>

        {/* Linked Accounts Section */}
        <Card>
          <div className="flex items-center gap-2 mb-2">
            <MessageCircle className="w-5 h-5 text-indigo-500" />
            <h2 className="text-lg font-semibold text-gray-900">{t('linkedAccounts')}</h2>
          </div>
          <p className="text-sm text-gray-500 mb-4">{t('linkedAccountsHint')}</p>

          {/* LINE ID */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <svg className="w-5 h-5 text-[#00B900]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                </svg>
                <label className="text-sm font-medium text-gray-700">{t('lineId')}</label>
              </div>
              <Input
                value={lineId}
                onChange={(e) => setLineId(e.target.value)}
                placeholder={t('lineIdPlaceholder')}
                maxLength={100}
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-gray-600">{t('showOnProfile')}</span>
                <button
                  type="button"
                  onClick={() => setShowLine(!showLine)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    showLine ? 'bg-indigo-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      showLine ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <div className="flex items-center gap-3 mb-2">
                <svg className="w-5 h-5 text-[#5865F2]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
                </svg>
                <label className="text-sm font-medium text-gray-700">{t('discordId')}</label>
              </div>
              <Input
                value={discordId}
                onChange={(e) => setDiscordId(e.target.value)}
                placeholder={t('discordIdPlaceholder')}
                maxLength={100}
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-gray-600">{t('showOnProfile')}</span>
                <button
                  type="button"
                  onClick={() => setShowDiscord(!showDiscord)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    showDiscord ? 'bg-indigo-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      showDiscord ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-4">{t('visibilityNote')}</p>
        </Card>

        {/* Save Button */}
        <div className="fixed bottom-16 left-0 right-0 lg:left-64 lg:bottom-0 bg-white border-t border-gray-100 px-4 py-3 safe-area-bottom">
          <div className="max-w-2xl mx-auto">
            <Button fullWidth onClick={handleSave} loading={isSaving}>
              {isSaving ? t('saving') : t('save')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
