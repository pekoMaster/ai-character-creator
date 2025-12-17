'use client';

import { useRouter } from 'next/navigation';
import { useAdmin } from '@/contexts/AdminContext';
import EventForm from '@/components/admin/EventForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewEventPage() {
  const router = useRouter();
  const { addEvent } = useAdmin();

  const handleSubmit = async (data: Parameters<typeof addEvent>[0]) => {
    const result = await addEvent(data);
    if (result) {
      router.push('/admin/events');
    } else {
      alert('新增活動失敗，請檢查控制台錯誤訊息');
    }
  };

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
          <h1 className="text-2xl font-bold text-gray-900">新增活動</h1>
          <p className="text-gray-500 text-sm mt-1">建立新的 HOLOLIVE 活動</p>
        </div>
      </div>

      {/* Form */}
      <EventForm onSubmit={handleSubmit} />
    </div>
  );
}
