'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  HololiveEvent,
  EventCategory,
  EVENT_CATEGORY_INFO,
  TicketPriceTier,
  TicketCountType,
  TICKET_COUNT_TYPE_INFO,
} from '@/types';
import { Calendar, MapPin, Image, Ticket, FileText, Plus, Trash2 } from 'lucide-react';

interface EventFormProps {
  initialData?: HololiveEvent;
  onSubmit: (data: Omit<HololiveEvent, 'id' | 'createdAt' | 'updatedAt'>) => void | Promise<void>;
  isEditing?: boolean;
}

// 預設票價等級列（5列）- 座位等級現在是自訂字串
const createDefaultPriceTiers = (): TicketPriceTier[] => [
  { seatGrade: 'SS', ticketCountType: 'solo', priceJPY: 0 },
  { seatGrade: 'S', ticketCountType: 'solo', priceJPY: 0 },
  { seatGrade: 'A', ticketCountType: 'solo', priceJPY: 0 },
  { seatGrade: 'A', ticketCountType: 'duo', priceJPY: 0 },
  { seatGrade: 'B', ticketCountType: 'solo', priceJPY: 0 },
];

export default function EventForm({ initialData, onSubmit, isEditing }: EventFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    artist: initialData?.artist || '',
    eventDate: initialData?.eventDate
      ? new Date(initialData.eventDate).toISOString().split('T')[0]
      : '',
    eventEndDate: initialData?.eventEndDate
      ? new Date(initialData.eventEndDate).toISOString().split('T')[0]
      : '',
    venue: initialData?.venue || '',
    venueAddress: initialData?.venueAddress || '',
    imageUrl: initialData?.imageUrl || '',
    description: initialData?.description || '',
    category: initialData?.category || 'concert',
    isActive: initialData?.isActive ?? true,
  });

  const [priceTiers, setPriceTiers] = useState<TicketPriceTier[]>(
    initialData?.ticketPriceTiers?.length ? initialData.ticketPriceTiers : createDefaultPriceTiers()
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // 票價等級操作
  const handlePriceTierChange = (index: number, field: keyof TicketPriceTier, value: string | number) => {
    setPriceTiers((prev) => {
      const updated = [...prev];
      if (field === 'priceJPY') {
        updated[index] = { ...updated[index], [field]: parseInt(value as string) || 0 };
      } else {
        updated[index] = { ...updated[index], [field]: value };
      }
      return updated;
    });
  };

  const addPriceTier = () => {
    setPriceTiers((prev) => [...prev, { seatGrade: '', ticketCountType: 'solo', priceJPY: 0 }]);
  };

  const removePriceTier = (index: number) => {
    if (priceTiers.length > 1) {
      setPriceTiers((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = '請輸入活動名稱';
    }
    if (!formData.artist.trim()) {
      newErrors.artist = '請輸入藝人/團體';
    }
    if (!formData.eventDate) {
      newErrors.eventDate = '請選擇活動日期';
    }
    if (!formData.venue.trim()) {
      newErrors.venue = '請輸入場地';
    }

    // 檢查至少有一個有效的票價（有座位等級名稱且價格大於0）
    const validPriceTiers = priceTiers.filter((tier) => tier.seatGrade.trim() !== '' && tier.priceJPY > 0);
    if (validPriceTiers.length === 0) {
      newErrors.priceTiers = '請至少設定一個票價（須填寫座位等級名稱和價格）';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;
    if (isSubmitting) return;

    setIsSubmitting(true);

    // 只保留有效的票價等級（有座位等級名稱且價格大於0）
    const validPriceTiers = priceTiers.filter((tier) => tier.seatGrade.trim() !== '' && tier.priceJPY > 0);

    try {
      await onSubmit({
        name: formData.name.trim(),
        artist: formData.artist.trim(),
        eventDate: new Date(formData.eventDate),
        eventEndDate: formData.eventEndDate ? new Date(formData.eventEndDate) : undefined,
        venue: formData.venue.trim(),
        venueAddress: formData.venueAddress.trim() || undefined,
        imageUrl: formData.imageUrl.trim() || undefined,
        description: formData.description.trim() || undefined,
        ticketPriceTiers: validPriceTiers,
        category: formData.category as EventCategory,
        isActive: formData.isActive,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const ticketCountTypes: TicketCountType[] = ['solo', 'duo'];

  return (
    <form onSubmit={handleSubmit} className="space-y-6 lg:space-y-8 w-full max-w-none">
      {/* 基本資訊 */}
      <section className="bg-white rounded-xl p-4 sm:p-6 lg:p-8 shadow-sm border border-gray-200">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 lg:mb-6 flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-500" />
          基本資訊
        </h2>
        <div className="grid gap-4 lg:gap-6 md:grid-cols-2">
          {/* 活動名稱 */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              活動名稱 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="例：hololive 5th fes. Capture the Moment"
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* 藝人/團體 */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              藝人/團體 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="artist"
              value={formData.artist}
              onChange={handleChange}
              placeholder="例：hololive, 星街すいせい, Suisei"
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                errors.artist ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            <p className="text-xs text-gray-500 mt-1">使用逗號（,）分隔多個標籤</p>
            {formData.artist && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.artist.split(',').map((tag, index) => {
                  const trimmedTag = tag.trim();
                  if (!trimmedTag) return null;
                  return (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700"
                    >
                      {trimmedTag}
                    </span>
                  );
                })}
              </div>
            )}
            {errors.artist && <p className="text-red-500 text-sm mt-1">{errors.artist}</p>}
          </div>

          {/* 分類 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">分類</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              {Object.entries(EVENT_CATEGORY_INFO).map(([key, info]) => (
                <option key={key} value={key}>
                  {info.label}
                </option>
              ))}
            </select>
          </div>

          {/* 描述 */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="活動簡介..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>
        </div>
      </section>

      {/* 時間地點 */}
      <section className="bg-white rounded-xl p-4 sm:p-6 lg:p-8 shadow-sm border border-gray-200">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 lg:mb-6 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-indigo-500" />
          時間地點
        </h2>
        <div className="grid gap-4 lg:gap-6 md:grid-cols-2">
          {/* 活動日期 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              活動日期 <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="eventDate"
              value={formData.eventDate}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                errors.eventDate ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.eventDate && <p className="text-red-500 text-sm mt-1">{errors.eventDate}</p>}
          </div>

          {/* 結束日期 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              結束日期（多日活動）
            </label>
            <input
              type="date"
              name="eventEndDate"
              value={formData.eventEndDate}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* 場地 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              場地 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="venue"
                value={formData.venue}
                onChange={handleChange}
                placeholder="例：幕張メッセ"
                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.venue ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            </div>
            {errors.venue && <p className="text-red-500 text-sm mt-1">{errors.venue}</p>}
          </div>

          {/* 場地地址 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              場地地址 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="venueAddress"
              value={formData.venueAddress}
              onChange={handleChange}
              placeholder="例：千葉県千葉市美浜区中瀬2-1"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </section>

      {/* 票價設定（價格天花板） */}
      <section className="bg-white rounded-xl p-4 sm:p-6 lg:p-8 shadow-sm border border-gray-200">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 lg:mb-6 flex items-center gap-2">
          <Ticket className="w-5 h-5 text-indigo-500" />
          票價設定（價格天花板）
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 mb-4">
          設定各座位等級與票種的最高價格，用戶發布同行時不可超過此價格
        </p>

        <div className="space-y-3">
          {/* 表頭 - 只在桌面顯示 */}
          <div className="hidden sm:grid grid-cols-12 gap-2 text-sm font-medium text-gray-600 pb-2 border-b">
            <div className="col-span-4">座位等級名稱（自訂）</div>
            <div className="col-span-4">票種類型</div>
            <div className="col-span-3">價格（日圓）</div>
            <div className="col-span-1"></div>
          </div>

          {/* 票價列表 */}
          {priceTiers.map((tier, index) => (
            <div key={index} className="relative">
              {/* 手機版 - 卡片式 */}
              <div className="sm:hidden bg-gray-50 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500">票價 #{index + 1}</span>
                  <button
                    type="button"
                    onClick={() => removePriceTier(index)}
                    disabled={priceTiers.length <= 1}
                    className="p-1 text-gray-400 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">座位等級名稱</label>
                    <input
                      type="text"
                      value={tier.seatGrade}
                      onChange={(e) => handlePriceTierChange(index, 'seatGrade', e.target.value)}
                      placeholder="例：SS、S、A、B"
                      className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">票種類型</label>
                    <select
                      value={tier.ticketCountType}
                      onChange={(e) => handlePriceTierChange(index, 'ticketCountType', e.target.value)}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-sm"
                    >
                      {ticketCountTypes.map((type) => (
                        <option key={type} value={type}>
                          {TICKET_COUNT_TYPE_INFO[type].label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">價格（日圓）</label>
                  <input
                    type="number"
                    value={tier.priceJPY || ''}
                    onChange={(e) => handlePriceTierChange(index, 'priceJPY', e.target.value)}
                    placeholder="0"
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
              </div>

              {/* 桌面版 - 表格式 */}
              <div className="hidden sm:grid grid-cols-12 gap-2 items-center">
                <div className="col-span-4">
                  <input
                    type="text"
                    value={tier.seatGrade}
                    onChange={(e) => handlePriceTierChange(index, 'seatGrade', e.target.value)}
                    placeholder="例：SS、S、A、B"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
                <div className="col-span-4">
                  <select
                    value={tier.ticketCountType}
                    onChange={(e) => handlePriceTierChange(index, 'ticketCountType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-sm"
                  >
                    {ticketCountTypes.map((type) => (
                      <option key={type} value={type}>
                        {TICKET_COUNT_TYPE_INFO[type].label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-3">
                  <input
                    type="number"
                    value={tier.priceJPY || ''}
                    onChange={(e) => handlePriceTierChange(index, 'priceJPY', e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
                <div className="col-span-1 flex justify-center">
                  <button
                    type="button"
                    onClick={() => removePriceTier(index)}
                    disabled={priceTiers.length <= 1}
                    className="p-1.5 text-gray-400 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* 新增按鈕 */}
          <button
            type="button"
            onClick={addPriceTier}
            className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium mt-2"
          >
            <Plus className="w-4 h-4" />
            新增票價等級
          </button>

          {errors.priceTiers && <p className="text-red-500 text-sm mt-2">{errors.priceTiers}</p>}
        </div>
      </section>

      {/* 其他 */}
      <section className="bg-white rounded-xl p-4 sm:p-6 lg:p-8 shadow-sm border border-gray-200">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 lg:mb-6 flex items-center gap-2">
          <Image className="w-5 h-5 text-indigo-500" />
          其他
        </h2>
        <div className="grid gap-4 lg:gap-6">
          {/* 圖片 URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">圖片 URL</label>
            <input
              type="url"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="https://..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* 啟用顯示 */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="isActive"
              id="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
              啟用顯示（關閉後前台不會顯示此活動）
            </label>
          </div>
        </div>
      </section>

      {/* 按鈕 */}
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push('/admin/events')}
          className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
        >
          取消
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? '處理中...' : (isEditing ? '儲存變更' : '新增活動')}
        </button>
      </div>
    </form>
  );
}
