'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
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
  TicketCountType,
  TICKET_COUNT_TYPE_INFO,
  TICKET_TYPE_INFO,
  NATIONALITY_OPTIONS,
  LANGUAGE_OPTIONS,
  SubsidyDirection,
  getSeatGradeColor,
} from '@/types';
import {
  Calendar,
  MapPin,
  Clock,
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
  const { data: session } = useSession();
  const { addListing } = useApp();
  const { events } = useAdmin();
  const t = useTranslations('create');
  const tCommon = useTranslations('common');

  // 表單狀態
  const [eventName, setEventName] = useState('');
  const [artistTags, setArtistTags] = useState<string[]>([]);
  const [eventDate, setEventDate] = useState('');
  const [venue, setVenue] = useState('');
  const [venueAddress, setVenueAddress] = useState('');
  const [meetingTime, setMeetingTime] = useState('');
  const [meetingLocation, setMeetingLocation] = useState('');
  const [ticketType, setTicketType] = useState<TicketType | ''>('');
  const [seatGrade, setSeatGrade] = useState<string>('');
  const [ticketCountType, setTicketCountType] = useState<TicketCountType | ''>('');
  const [askingPriceJPY, setAskingPriceJPY] = useState('');
  const [hostNationality, setHostNationality] = useState('');
  const [hostLanguages, setHostLanguages] = useState<string[]>([]);
  const [identificationFeatures, setIdentificationFeatures] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // 換票專用欄位
  const [exchangeEventName, setExchangeEventName] = useState('');
  const [exchangeSeatGrade, setExchangeSeatGrade] = useState('');
  const [subsidyAmount, setSubsidyAmount] = useState('');
  const [subsidyDirection, setSubsidyDirection] = useState<SubsidyDirection | ''>('');

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

  // 從活動取得可用的座位等級（根據已設定的票價）- 現在返回字串陣列
  const availableSeatGrades = useMemo(() => {
    if (!selectedEvent?.ticketPriceTiers) return [];
    const grades = new Set(selectedEvent.ticketPriceTiers.map(t => t.seatGrade));
    return Array.from(grades);
  }, [selectedEvent]);

  // 換票用：獲取所有活動的所有可用座位等級
  const allAvailableSeatGrades = useMemo(() => {
    const allGrades = new Set<string>();
    events.forEach(event => {
      event.ticketPriceTiers?.forEach(tier => {
        allGrades.add(tier.seatGrade);
      });
    });
    return Array.from(allGrades);
  }, [events]);

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

  // 計算價格限制（統一使用日圓）
  const priceCalc = useMemo(() => {
    const jpy = originalPriceJPY;
    const asking = parseInt(askingPriceJPY) || 0;

    // 如果是尋找同行者，價格上限為一半
    const isFindCompanion = ticketType === 'find_companion';
    const maxAllowed = isFindCompanion ? Math.round(jpy / 2) : jpy;

    const isValid = asking > 0 && asking <= maxAllowed;

    return {
      originalJPY: jpy,
      maxAllowed,
      isValid,
      asking,
      isFindCompanion,
    };
  }, [originalPriceJPY, askingPriceJPY, ticketType]);

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

  // 是否為換票模式
  const isExchangeMode = ticketType === 'ticket_exchange';

  // 換票補貼金額驗證（不超過票價一半）
  const subsidyValidation = useMemo(() => {
    const max = Math.round(originalPriceJPY / 2);
    const amount = parseInt(subsidyAmount) || 0;
    if (!isExchangeMode) return { isValid: true, maxAllowed: max, amount: 0 };
    return {
      isValid: amount >= 0 && amount <= max,
      maxAllowed: max,
      amount,
    };
  }, [isExchangeMode, originalPriceJPY, subsidyAmount]);

  // 表單驗證
  const isFormValid = useMemo(() => {
    const baseValid = (
      eventName.trim() !== '' &&
      eventDate !== '' &&
      venue.trim() !== '' &&
      meetingTime !== '' &&
      meetingLocation.trim() !== '' &&
      identificationFeatures.trim() !== '' &&
      hostLanguages.length > 0 &&
      ticketType !== '' &&
      seatGrade !== '' &&
      ticketCountType !== '' &&
      hostNationality !== ''
    );

    if (isExchangeMode) {
      // 換票模式驗證
      return baseValid &&
        exchangeEventName.trim() !== '' &&
        exchangeSeatGrade !== '' &&
        subsidyValidation.isValid &&
        subsidyDirection !== '';
    } else {
      // 一般模式驗證
      return baseValid && originalPriceJPY > 0 && priceCalc.isValid;
    }
  }, [eventName, eventDate, venue, meetingTime, meetingLocation, identificationFeatures, hostLanguages, ticketType, seatGrade, ticketCountType, hostNationality, isExchangeMode, exchangeEventName, exchangeSeatGrade, subsidyValidation, subsidyDirection, originalPriceJPY, priceCalc]);

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
    if (!session?.user?.dbId || !isFormValid) return;

    setIsSubmitting(true);

    try {
      // 準備提交資料
      const listingData: Parameters<typeof addListing>[0] = {
        eventName,
        artistTags,
        eventDate,
        venue,
        meetingTime: `${eventDate}T${meetingTime}`,
        meetingLocation,
        originalPriceJPY: isExchangeMode ? originalPriceJPY : originalPriceJPY,
        askingPriceJPY: isExchangeMode ? 0 : priceCalc.asking,
        totalSlots: ticketCountType === 'duo' ? 2 : 1,
        ticketType: ticketType as TicketType,
        seatGrade: seatGrade,
        ticketCountType: ticketCountType as TicketCountType,
        hostNationality,
        hostLanguages,
        identificationFeatures,
        description: description || undefined,
      };

      // 如果是換票模式，添加換票相關欄位
      if (isExchangeMode) {
        Object.assign(listingData, {
          exchangeEventName,
          exchangeSeatGrade,
          subsidyAmount: subsidyValidation.amount,
          subsidyDirection: subsidyDirection as SubsidyDirection,
        });
      }

      const result = await addListing(listingData);

      if (result) {
        setShowSuccess(true);
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } else {
        alert(tCommon('publishFailed'));
      }
    } catch (error) {
      console.error('Error creating listing:', error);
      alert(tCommon('publishFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // 票券類型選項（包含換票，母票轉讓暫時停用）
  const ticketTypes: TicketType[] = ['find_companion', 'main_ticket_transfer', 'sub_ticket_transfer', 'ticket_exchange'];

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
                label={t('meetingPointWithHint', { defaultValue: '同行集合地點（線上交換請直接寫線上）' })}
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
                  <div className="flex flex-wrap gap-2">
                    {availableSeatGrades.map((grade) => (
                      <button
                        key={grade}
                        type="button"
                        onClick={() => setSeatGrade(grade)}
                        className={`
                          py-2 px-4 rounded-lg border-2 text-sm font-medium transition-all
                          ${seatGrade === grade
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                            : 'border-gray-200 hover:border-gray-300 text-gray-700'}
                        `}
                      >
                        {grade}
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
                  <div className="text-sm">
                    <span className="text-gray-500">{t('originalPriceJPYLabel')}</span>
                    <p className="font-medium text-gray-900 text-lg">¥{originalPriceJPY.toLocaleString()}</p>
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
                    const isFindCompanionDisabled = type === 'find_companion' && ticketCountType !== 'duo';
                    // 母票轉讓暫時停用
                    const isMainTicketDisabled = info.disabled === true;
                    const isDisabled = isFindCompanionDisabled || isMainTicketDisabled;

                    // 使用翻譯或預設標籤
                    const label = t(`ticketTypes.${type}`, { defaultValue: info.label });
                    const desc = t(`ticketTypes.${type}Desc`, { defaultValue: info.description });
                    const warning = info.warning ? t(`ticketTypes.${type}Warning`, { defaultValue: info.warning }) : undefined;

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
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900 text-sm">{label}</p>
                            {isMainTicketDisabled && (
                              <span className="px-1.5 py-0.5 text-xs bg-gray-200 text-gray-600 rounded">
                                {t('comingSoon', { defaultValue: '即將開放' })}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">{desc}</p>
                          {warning && (
                            <div className="flex items-center gap-1 mt-1 text-xs text-orange-600">
                              <AlertTriangle className="w-3 h-3" />
                              {warning}
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

          {/* 換票專用欄位 - 只在換票模式顯示 */}
          {isExchangeMode && (
            <Card>
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-orange-500 text-lg">🔄</span>
                {t('exchangeSection', { defaultValue: '換票設定' })}
              </h3>

              <div className="space-y-4">
                {/* 想換的活動 */}
                <Select
                  label={t('exchangeEvent', { defaultValue: '想換的活動' })}
                  placeholder={t('selectExchangeEvent', { defaultValue: '選擇想換的活動' })}
                  options={eventOptions}
                  value={exchangeEventName}
                  onChange={setExchangeEventName}
                  searchable
                  required
                />

                {/* 想換的票種等級 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('exchangeSeatGrade', { defaultValue: '想換的票種等級' })} <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {/* 任意選項 */}
                    <button
                      type="button"
                      onClick={() => setExchangeSeatGrade('any')}
                      className={`
                        py-2 px-4 rounded-lg border-2 text-sm font-medium transition-all
                        ${exchangeSeatGrade === 'any'
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'}
                      `}
                    >
                      {t('anyGrade', { defaultValue: '任意' })}
                    </button>
                    {/* 動態票種等級按鈕 */}
                    {allAvailableSeatGrades.map((grade) => (
                      <button
                        key={grade}
                        type="button"
                        onClick={() => setExchangeSeatGrade(grade)}
                        className={`
                          py-2 px-4 rounded-lg border-2 text-sm font-medium transition-all
                          ${exchangeSeatGrade === grade
                            ? 'border-orange-500 bg-orange-50 text-orange-700'
                            : 'border-gray-200 hover:border-gray-300 text-gray-700'}
                        `}
                      >
                        {grade}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 補貼金額 */}
                <Input
                  label={t('subsidyAmount', { defaultValue: '補貼金額（日圓）' })}
                  type="number"
                  placeholder={t('subsidyAmountPlaceholder', { defaultValue: `最高 ¥${subsidyValidation.maxAllowed.toLocaleString()}（票價一半）` })}
                  value={subsidyAmount}
                  onChange={(e) => setSubsidyAmount(e.target.value)}
                  leftIcon={<span className="text-gray-400 font-medium">¥</span>}
                  error={
                    (subsidyValidation.amount || 0) > 0 && !subsidyValidation.isValid
                      ? t('subsidyExceedsLimit', { defaultValue: `不可超過票價一半 ¥${subsidyValidation.maxAllowed.toLocaleString()}` })
                      : undefined
                  }
                />
                <p className="text-xs text-gray-500 -mt-2">
                  {t('subsidyAmountHint', { defaultValue: '如不需補貼可填 0' })}
                </p>

                {/* 補貼方向 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('subsidyDirection', { defaultValue: '補貼方向' })} <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSubsidyDirection('i_pay_you')}
                      className={`
                        py-3 px-4 rounded-lg border-2 text-sm font-medium transition-all
                        ${subsidyDirection === 'i_pay_you'
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'}
                      `}
                    >
                      {t('iPayYou', { defaultValue: '我補貼對方' })}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSubsidyDirection('you_pay_me')}
                      className={`
                        py-3 px-4 rounded-lg border-2 text-sm font-medium transition-all
                        ${subsidyDirection === 'you_pay_me'
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'}
                      `}
                    >
                      {t('youPayMe', { defaultValue: '對方補貼我' })}
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* 希望費用 - 非換票模式才顯示 */}
          {!isExchangeMode && (
            <Card>
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-indigo-500 font-bold text-lg">¥</span>
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
                  label={t('askingPriceJPY')}
                  type="number"
                  placeholder={priceCalc.maxAllowed > 0 ? t('maxPrice', { max: priceCalc.maxAllowed }) : t('pleaseSelectTicket')}
                  value={askingPriceJPY}
                  onChange={(e) => setAskingPriceJPY(e.target.value)}
                  leftIcon={<span className="text-gray-400 font-medium">¥</span>}
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
          )}

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
