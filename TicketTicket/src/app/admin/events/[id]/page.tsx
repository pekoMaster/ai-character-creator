'use client';

import { useRouter, useParams } from 'next/navigation';
import { useAdmin } from '@/contexts/AdminContext';
import EventForm from '@/components/admin/EventForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { HololiveEvent } from '@/types';

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const { getEvent, updateEvent } = useAdmin();

  const eventId = params.id as string;
  const event = getEvent(eventId);

  const handleSubmit = async (data: Omit<HololiveEvent, 'id' | 'createdAt' | 'updatedAt'>) => {
    await updateEvent(eventId, data);
    router.push('/admin/events');
  };

  if (!event) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">找不到此活動</p>
        <Link
          href="/admin/events"
          className="text-indigo-600 hover:text-indigo-800 font-medium"
        >
          返回活動列表
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/events"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">編輯活動</h1>
          <p className="text-gray-500 text-sm mt-1">{event.name}</p>
        </div>
      </div>

      {/* Form */}
      <EventForm initialData={event} onSubmit={handleSubmit} isEditing />
    </div>
  );
}
