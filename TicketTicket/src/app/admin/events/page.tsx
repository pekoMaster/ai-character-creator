'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useAdmin } from '@/contexts/AdminContext';
import { EVENT_CATEGORY_INFO } from '@/types';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Calendar,
  MapPin,
  Eye,
  EyeOff,
} from 'lucide-react';

export default function AdminEventsPage() {
  const { events, deleteEvent, updateEvent } = useAdmin();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // 篩選活動
  const filteredEvents = useMemo(() => {
    return events
      .filter((event) => {
        const matchesSearch =
          event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.venue.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory =
          filterCategory === 'all' || event.category === filterCategory;

        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());
  }, [events, searchTerm, filterCategory]);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const handleDelete = (id: string) => {
    deleteEvent(id);
    setDeleteConfirm(null);
  };

  const toggleActive = (id: string, currentStatus: boolean) => {
    updateEvent(id, { isActive: !currentStatus });
  };

  return (
    <div className="space-y-4 lg:space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 lg:hidden">活動管理</h1>
          <p className="text-gray-500 text-xs sm:text-sm lg:text-base">
            共 {events.length} 個活動，顯示 {filteredEvents.length} 個
          </p>
        </div>
        <Link
          href="/admin/events/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors text-sm sm:text-base"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          新增活動
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜尋活動名稱、藝人、場地..."
              className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            />
          </div>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-sm"
          >
            <option value="all">全部分類</option>
            {Object.entries(EVENT_CATEGORY_INFO).map(([key, info]) => (
              <option key={key} value={key}>
                {info.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Empty State */}
      {filteredEvents.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 sm:p-12 text-center">
          <p className="text-gray-500">
            {searchTerm || filterCategory !== 'all'
              ? '沒有符合條件的活動'
              : '尚未新增任何活動'}
          </p>
        </div>
      ) : (
        <>
          {/* Mobile Card View */}
          <div className="sm:hidden space-y-3">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">{event.name}</h3>
                    <p className="text-sm text-gray-500 truncate">{event.artist}</p>
                  </div>
                  <span
                    className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full shrink-0 ${
                      EVENT_CATEGORY_INFO[event.category].color
                    }`}
                  >
                    {EVENT_CATEGORY_INFO[event.category].label}
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-1.5 mb-3 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                    <span>
                      {formatDate(event.eventDate)}
                      {event.eventEndDate && ` ~ ${formatDate(event.eventEndDate)}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="truncate">{event.venue}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <button
                    onClick={() => toggleActive(event.id, event.isActive)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-full transition-colors ${
                      event.isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {event.isActive ? (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        顯示中
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        已隱藏
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-1">
                    <Link
                      href={`/admin/events/${event.id}`}
                      className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    {deleteConfirm === event.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(event.id)}
                          className="px-2.5 py-1.5 text-xs bg-red-600 text-white rounded-lg"
                        >
                          確認
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="px-2.5 py-1.5 text-xs bg-gray-200 text-gray-700 rounded-lg"
                        >
                          取消
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(event.id)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      活動
                    </th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      藝人
                    </th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      日期
                    </th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      場地
                    </th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      分類
                    </th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      狀態
                    </th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredEvents.map((event) => (
                    <tr key={event.id} className="hover:bg-gray-50">
                      <td className="px-4 lg:px-6 py-4">
                        <p className="font-medium text-gray-900 truncate max-w-[200px] lg:max-w-[300px]">
                          {event.name}
                        </p>
                      </td>
                      <td className="px-4 lg:px-6 py-4">
                        <span className="text-sm text-gray-700 truncate max-w-[150px] lg:max-w-[200px] block">{event.artist}</span>
                      </td>
                      <td className="px-4 lg:px-6 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-gray-700 whitespace-nowrap">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {formatDate(event.eventDate)}
                          {event.eventEndDate && (
                            <span className="text-gray-400">
                              ~ {formatDate(event.eventEndDate)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-gray-700">
                          <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                          <span className="truncate max-w-[120px] lg:max-w-[180px]">{event.venue}</span>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4">
                        <span
                          className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full whitespace-nowrap ${
                            EVENT_CATEGORY_INFO[event.category].color
                          }`}
                        >
                          {EVENT_CATEGORY_INFO[event.category].label}
                        </span>
                      </td>
                      <td className="px-4 lg:px-6 py-4">
                        <button
                          onClick={() => toggleActive(event.id, event.isActive)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full transition-colors whitespace-nowrap ${
                            event.isActive
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          }`}
                        >
                          {event.isActive ? (
                            <>
                              <Eye className="w-3.5 h-3.5" />
                              顯示中
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3.5 h-3.5" />
                              已隱藏
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-4 lg:px-6 py-4">
                        <div className="flex items-center justify-end gap-1 lg:gap-2">
                          <Link
                            href={`/admin/events/${event.id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                            <span className="hidden lg:inline">編輯</span>
                          </Link>
                          {deleteConfirm === event.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleDelete(event.id)}
                                className="px-3 py-1.5 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700"
                              >
                                確認
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                className="px-3 py-1.5 text-xs bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                              >
                                取消
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirm(event.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span className="hidden lg:inline">刪除</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
