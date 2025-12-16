'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/contexts/AppContext';
import { useAdmin } from '@/contexts/AdminContext';
import { useTranslations } from 'next-intl';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import {
  TicketType,
  SeatGrade,
  TicketCountType,
  SEAT_GRADE_INFO,
  TICKET_COUNT_TYPE_INFO,
  TICKET_TYPE_INFO,
  NATIONALITY_OPTIONS,
  LANGUAGE_OPTIONS,
  convertJPYtoTWD,
} from '@/types';
import {
  Calendar,
  MapPin,
  Clock,
  JapaneseYen,
  DollarSign,
  Check,
  AlertTriangle,
  Globe,
  Languages,
  Shirt,
  User,
  Ticket,
  Info,
} from 'lucide-react';

// 穿著快速標籤 keys
const CLOTHING_TAG_KEYS = [
  'tshirt', 'shirt', 'jacket', 'hoodie', 'hoodedJacket', 'suit', 'dress',
  'jeans', 'shorts', 'skirt', 'hat', 'mask', 'glasses', 'backpack',
  'crossbodyBag', 'handbag', 'itaBag', 'merchandise', 'penlight',
];

export default function CreateListingPage() {
  const router = useRouter();
  const { currentUser, addListing } = useApp();
  const { events } = useAdmin();
  const t = useTranslations('create');

  // 表單狀態
  const [eventName, setEventName] = useState('');
  const [artistTags, setArtistTags] = useState<string[]>([]);
  const [eventDate, setEventDate] = useState('');
  const [venue, setVenue] = useState('');
  const [venueAddress, setVenueAddress] = useState('');
  const [meetingTime, setMeetingTime] = useState('');
  const [meetingLocation, setMeetingLocation] = useState('');
  const [ticketType, setTicketType] = useState<TicketType | ''>('');
  const [seatGrade, setSeatGrade] = useState<SeatGrade | ''>('');
  const [ticketCountType, setTicketCountType] = useState<TicketCountType | ''>('');
  const [askingPriceTWD, setAskingPriceTWD] = useState('');
  const [hostNationality, setHostNationality] = useState('');
  const [hostLanguages, setHostLanguages] = useState<string[]>([]);
  const [identificationFeatures, setIdentificationFeatures] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // 從管理員活動獲取選項
  const eventOptions = useMemo(() => {
    return events
      .filter((e) => e.isActive)
      .map((event) => ({
        value: event.name,
        label: event.name,
      }));
  }, [events]);

  // 當選擇活動時，找到對應的管理員活動資料
  const selectedEvent = useMemo(() => {
    return events.find((e) => e.name === eventName);
  }, [events, eventName]);

  // 從活動取得可用的座位等級（根據已設定的票價）
  const availableSeatGrades = useMemo(() => {
    if (!selectedEvent?.ticketPriceTiers) return [];
    const grades = new Set(selectedEvent.ticketPriceTiers.map(t => t.seatGrade));
    return Array.from(grades) as SeatGrade[];
  }, [selectedEvent]);

  // 從活動取得可用的票種類型（根據座位等級）
  const availableTicketCountTypes = useMemo(() => {
    if (!selectedEvent?.ticketPriceTiers || !seatGrade) return [];
    const types = selectedEvent.ticketPriceTiers
      .filter(t => t.seatGrade === seatGrade)
      .map(t => t.ticketCountType);
    return Array.from(new Set(types)) as TicketCountType[];
  }, [selectedEvent, seatGrade]);

  // 獲取選定票價（自動從管理員設定獲取）
  const selectedPriceTier = useMemo(() => {
    if (!selectedEvent?.ticketPriceTiers || !seatGrade || !ticketCountType) return null;
    return selectedEvent.ticketPriceTiers.find(
      t => t.seatGrade === seatGrade && t.ticketCountType === ticketCountType
    );
  }, [selectedEvent, seatGrade, ticketCountType]);

  // 原價（日圓）- 從管理員設定自動取得
  const originalPriceJPY = selectedPriceTier?.priceJPY || 0;

  // 計算價格限制
  const priceCalc = useMemo(() => {
    const jpy = originalPriceJPY;
    const asking = parseInt(askingPriceTWD) || 0;
    const twdConverted = convertJPYtoTWD(jpy);

    // 如果是尋找同行者，價格上限為一半
    const isFindCompanion = ticketType === 'find_companion';
    const maxAllowed = isFindCompanion ? Math.round(twdConverted / 2) : twdConverted;

    const isValid = asking > 0 && asking <= maxAllowed;

    return {
      originalJPY: jpy,
      twdConverted,
      maxAllowed,
      isValid,
      asking,
      isFindCompanion,
    };
  }, [originalPriceJPY, askingPriceTWD, ticketType]);

  // 當座位等級改變時，重置票種類型
  useEffect(() => {
    setTicketCountType('');
  }, [seatGrade]);

  // 當票種類型改變時，檢查是否需要限制票券類型
  useEffect(() => {
    // 如果選了尋找同行者但不是二人票，清除選擇
    if (ticketType === 'find_companion' && ticketCountType !== 'duo') {
      setTicketType('');
    }
  }, [ticketCountType, ticketType]);

  // 表單驗證
  const isFormValid = useMemo(() => {
    return (
      eventName.trim() !== '' &&
      eventDate !== '' &&
      venue.trim() !== '' &&
      meetingTime !== '' &&
      meetingLocation.trim() !== '' &&
      originalPriceJPY > 0 &&
      priceCalc.isValid &&
      identificationFeatures.trim() !== '' &&
      hostLanguages.length > 0 &&
      ticketType !== '' &&
      seatGrade !== '' &&
      ticketCountType !== '' &&
      hostNationality !== ''
    );
  }, [eventName, eventDate, venue, meetingTime, meetingLocation, originalPriceJPY, priceCalc, identificationFeatures, hostLanguages, ticketType, seatGrade, ticketCountType, hostNationality]);

  const handleLanguageToggle = (lang: string) => {
    setHostLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  };

  // 處理活動選擇
  const handleEventSelect = (name: string) => {
    setEventName(name);
    setSeatGrade('');
    setTicketCountType('');
    setTicketType('');

    const event = events.find((e) => e.name === name);
    if (event) {
      if (event.artist) {
        const tags = event.artist.split(',').map((tag) => tag.trim()).filter((tag) => tag);
        setArtistTags(tags);
      } else {
        setArtistTags([]);
      }
      setVenue(event.venue || '');
      setVenueAddress(event.venueAddress || '');
    } else {
      setArtistTags([]);
      setVenue('');
      setVenueAddress('');
    }
  };

  // 添加穿著快速標籤
  const handleAddClothingTag = (tag: string) => {
    if (!identificationFeatures.includes(tag)) {
      setIdentificationFeatures((prev) =>
        prev ? `${prev}、${tag}` : tag
      );
    }
  };

  const handleSubmit = async () => {
    if (!currentUser || !isFormValid) return;

    setIsSubmitting(true);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const newListing = {
      id: `listing-${Date.now()}`,
      hostId: currentUser.id,
      eventName,
      artistTags,
      eventDate: new Date(eventDate),
      venue,
      meetingTime: new Date(`${eventDate}T${meetingTime}`),
      meetingLocation,
      originalPriceJPY,
      originalPriceTWD: priceCalc.twdConverted,
      askingPriceTWD: priceCalc.asking,
      totalSlots: ticketCountType === 'duo' ? 2 : 1,
      availableSlots: ticketCountType === 'duo' ? 1 : 0,
      ticketType: ticketType as TicketType,
      seatGrade: seatGrade as SeatGrade,
      ticketCountType: ticketCountType as TicketCountType,
      hostNationality,
      hostLanguages,
      identificationFeatures,
      status: 'open' as const,
      description: description || undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    addListing(newListing);
    setIsSubmitting(false);
    setShowSuccess(true);

    setTimeout(() => {
      router.push('/');
    }, 2000);
  };

  // 票券類型選項
  const ticketTypes: TicketType[] = ['find_companion', 'main_ticket_transfer', 'sub_ticket_transfer'];

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="text-center max-w-sm w-full">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('publishSuccess')}</h2>
          <p className="text-gray-500">{t('redirecting')}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title={t('title')} showBack />

      <div className="pt-14 pb-24 px-4 py-6">
        <div className="space-y-6 max-w-2xl mx-auto">

          {/* 重要提醒 */}
          <Card className="bg-amber-50 border-amber-200">
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-medium mb-1">{t('importantReminder')}</p>
                <p>{t('platformNotice')}</p>
              </div>
            </div>
          </Card>

          {/* 活動資訊 */}
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">{t('eventInfo')}</h3>

            <div className="space-y-4">
              <Select
                label={t('eventName')}
                placeholder={t('pleaseSelectEvent')}
                options={eventOptions}
                value={eventName}
                onChange={handleEventSelect}
                searchable
                required
              />

              {/* 藝人標籤預覽 */}
              {artistTags.length > 0 && (
                <div className="mt-2">
                  <label className="text-sm text-gray-500 mb-1 block">{t('artistGroup')}</label>
                  <div className="flex flex-wrap gap-2">
                    {artistTags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label={t('companionDate')}
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  leftIcon={<Calendar className="w-5 h-5" />}
                  required
                />
                <Input
                  label={t('gatherTime')}
                  type="time"
                  value={meetingTime}
                  onChange={(e) => setMeetingTime(e.target.value)}
                  leftIcon={<Clock className="w-5 h-5" />}
                  required
                />
              </div>

              {/* 活動現場地址（唯讀） */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('venueAddress')}
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={venueAddress || venue || t('pleaseSelectEvent')}
                    readOnly
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                  />
                </div>
                {!eventName && (
                  <p className="text-xs text-gray-500 mt-1">{t('autoFillAfterSelect')}</p>
                )}
              </div>

              {/* 同行集合地點 */}
              <Input
                label={t('meetingPoint')}
                placeholder={t('meetingPointPlaceholder')}
                value={meetingLocation}
                onChange={(e) => setMeetingLocation(e.target.value)}
                leftIcon={<MapPin className="w-5 h-5" />}
                required
              />
            </div>
          </Card>

          {/* 票券資訊 */}
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Ticket className="w-5 h-5 text-indigo-500" />
              {t('ticketInfo')}
            </h3>

            <div className="space-y-4">
              {/* 座位等級 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('seatGrade')} <span className="text-red-500">*</span>
                </label>
                {!selectedEvent ? (
                  <p className="text-sm text-gray-500">{t('pleaseSelectEvent')}</p>
                ) : availableSeatGrades.length === 0 ? (
                  <p className="text-sm text-amber-600">{t('noPriceSet')}</p>
                ) : (
                  <div className="grid grid-cols-4 gap-2">
                    {availableSeatGrades.map((grade) => (
                      <button
                        key={grade}
                        type="button"
                        onClick={() => setSeatGrade(grade)}
                        className={`
                          py-2 px-3 rounded-lg border-2 text-sm font-medium transition-all
                          ${seatGrade === grade
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                            : 'border-gray-200 hover:border-gray-300 text-gray-700'}
                        `}
                      >
                        {SEAT_GRADE_INFO[grade].label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 票種類型 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('ticketCountType')} <span className="text-red-500">*</span>
                </label>
                {!seatGrade ? (
                  <p className="text-sm text-gray-500">{t('pleaseSelectSeatGrade')}</p>
                ) : availableTicketCountTypes.length === 0 ? (
                  <p className="text-sm text-amber-600">{t('seatNoPriceSet')}</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {availableTicketCountTypes.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setTicketCountType(type)}
                        className={`
                          py-2 px-3 rounded-lg border-2 text-sm font-medium transition-all
                          ${ticketCountType === type
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                            : 'border-gray-200 hover:border-gray-300 text-gray-700'}
                        `}
                      >
                        {TICKET_COUNT_TYPE_INFO[type].label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 票價顯示（唯讀） */}
              {selectedPriceTier && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">{t('priceInfoByAdmin')}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">{t('originalPriceJPYLabel')}</span>
                      <p className="font-medium text-gray-900">¥{originalPriceJPY.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">{t('convertedTWDLabel')}</span>
                      <p className="font-medium text-gray-900">${priceCalc.twdConverted.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* 票券類型選擇 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('listingType')} <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {ticketTypes.map((type) => {
                    const info = TICKET_TYPE_INFO[type];
                    // 尋找同行者只有二人票可選
                    const isDisabled = type === 'find_companion' && ticketCountType !== 'duo';

                    return (
                      <label
                        key={type}
                        className={`
                          flex items-start gap-3 p-3 rounded-lg border-2 transition-colors
                          ${isDisabled
                            ? 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-50'
                            : ticketType === type
                              ? 'border-indigo-500 bg-indigo-50 cursor-pointer'
                              : 'border-gray-200 hover:border-gray-300 cursor-pointer'}
                        `}
                      >
                        <input
                          type="radio"
                          name="ticketType"
                          value={type}
                          checked={ticketType === type}
                          onChange={() => !isDisabled && setTicketType(type)}
                          disabled={isDisabled}
                          className="mt-0.5"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-sm">{info.label}</p>
                          <p className="text-xs text-gray-500">{info.description}</p>
                          {info.warning && (
                            <div className="flex items-center gap-1 mt-1 text-xs text-orange-600">
                              <AlertTriangle className="w-3 h-3" />
                              {info.warning}
                            </div>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          </Card>

          {/* 希望費用 */}
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-indigo-500" />
              {t('askingPriceSection')}
            </h3>

            <div className="space-y-4">
              {/* 價格上限說明 */}
              {selectedPriceTier && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    <Info className="w-4 h-4 inline mr-1" />
                    {priceCalc.isFindCompanion
                      ? t('companionPriceLimit').replace('${max}', priceCalc.maxAllowed.toLocaleString())
                      : t('priceLimit').replace('${max}', priceCalc.maxAllowed.toLocaleString())
                    }
                  </p>
                </div>
              )}

              <Input
                label={t('askingPriceTWD')}
                type="number"
                placeholder={priceCalc.maxAllowed > 0 ? t('maxPrice', { max: priceCalc.maxAllowed }) : t('pleaseSelectTicket')}
                value={askingPriceTWD}
                onChange={(e) => setAskingPriceTWD(e.target.value)}
                leftIcon={<DollarSign className="w-5 h-5" />}
                required
                disabled={!selectedPriceTier}
                error={
                  priceCalc.asking > 0 && !priceCalc.isValid
                    ? t('cannotExceed').replace('${max}', priceCalc.maxAllowed.toLocaleString())
                    : undefined
                }
              />

              {/* 價格驗證結果 */}
              {priceCalc.asking > 0 && priceCalc.isValid && (
                <div className="flex items-center gap-2 text-sm rounded-lg p-3 bg-green-50 text-green-700">
                  <Check className="w-5 h-5" />
                  <span>{t('priceValid')}</span>
                </div>
              )}
            </div>
          </Card>

          {/* 發布者資訊 */}
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-500" />
              {t('publisherInfo')}
            </h3>

            <div className="space-y-4">
              {/* 國籍 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                  <Globe className="w-4 h-4" />
                  {t('nationality')} <span className="text-red-500">*</span>
                </label>
                <select
                  value={hostNationality}
                  onChange={(e) => setHostNationality(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="">{t('selectNationality')}</option>
                  {NATIONALITY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 可用語言 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                  <Languages className="w-4 h-4" />
                  {t('languages')} <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGE_OPTIONS.map((lang) => (
                    <button
                      key={lang.value}
                      type="button"
                      onClick={() => handleLanguageToggle(lang.value)}
                      className={`
                        px-3 py-1.5 rounded-full text-sm font-medium transition-all
                        ${hostLanguages.includes(lang.value)
                          ? 'bg-indigo-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                      `}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
                {hostLanguages.length === 0 && (
                  <p className="text-red-500 text-sm mt-1">{t('selectAtLeastOneLanguage')}</p>
                )}
              </div>

              {/* 辨識特徵 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                  <Shirt className="w-4 h-4" />
                  {t('identificationFeatures')} <span className="text-red-500">*</span>
                </label>
                <Textarea
                  placeholder={t('identificationPlaceholder')}
                  value={identificationFeatures}
                  onChange={(e) => setIdentificationFeatures(e.target.value)}
                  rows={2}
                  maxLength={200}
                  showCount
                />
                {/* 快速標籤 */}
                <div className="mt-2">
                  <p className="text-xs text-gray-500 mb-2">{t('quickAdd')}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {CLOTHING_TAG_KEYS.map((tagKey) => (
                      <button
                        key={tagKey}
                        type="button"
                        onClick={() => handleAddClothingTag(t(`clothingTags.${tagKey}`))}
                        className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
                      >
                        + {t(`clothingTags.${tagKey}`)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* 其他注意事項 */}
          <Card>
            <Textarea
              label={t('otherNotes')}
              placeholder={t('otherNotesPlaceholder')}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              maxLength={500}
              showCount
            />
          </Card>
        </div>
      </div>

      {/* 底部提交按鈕 */}
      <div className="fixed bottom-16 left-0 right-0 lg:left-64 lg:bottom-0 bg-white border-t border-gray-100 px-4 py-3 safe-area-bottom">
        <div className="max-w-2xl mx-auto">
          <Button
            fullWidth
            onClick={handleSubmit}
            disabled={!isFormValid}
            loading={isSubmitting}
          >
            {t('publish')}
          </Button>
        </div>
      </div>
    </div>
  );
}
