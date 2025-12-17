'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAdmin } from '@/contexts/AdminContext';
import { Lock, LogOut, Ticket, Menu, X, Calendar, Home, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const NAV_ITEMS = [
  { href: '/admin/events', label: '活動管理', icon: Calendar },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { isAuthenticated, login, logout } = useAdmin();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (login(password)) {
      setPassword('');
    } else {
      setError('密碼錯誤');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-gray-800 rounded-2xl p-8 shadow-xl">
            <div className="flex items-center justify-center gap-2 mb-8">
              <Ticket className="w-10 h-10 text-indigo-400" />
              <span className="text-2xl font-bold text-white">Admin</span>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  管理員密碼
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="請輸入密碼"
                    className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    autoFocus
                  />
                </div>
              </div>

              {error && (
                <p className="text-red-400 text-sm text-center">{error}</p>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors"
              >
                登入
              </button>
            </form>

            <p className="text-gray-500 text-xs text-center mt-6">
              HOLOLIVE 活動管理系統
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Desktop Sidebar - Fixed */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-gray-900">
        {/* Sidebar Header */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-800">
          <Ticket className="w-8 h-8 text-indigo-400" />
          <div>
            <h1 className="font-bold text-white">HOLOLIVE</h1>
            <p className="text-xs text-gray-500">活動管理系統</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors
                  ${isActive
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'}
                `}
              >
                <Icon className="w-5 h-5" />
                {item.label}
                {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-800">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <Home className="w-5 h-5" />
            返回前台
          </Link>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors mt-1"
          >
            <LogOut className="w-5 h-5" />
            登出
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 bg-gray-900 text-white z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Ticket className="w-6 h-6 text-indigo-400" />
            <span className="font-bold">Admin</span>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-gray-400 hover:text-white"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`
          lg:hidden fixed top-0 left-0 z-50 h-full w-64 bg-gray-900 transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-800">
          <Ticket className="w-8 h-8 text-indigo-400" />
          <div>
            <h1 className="font-bold text-white">HOLOLIVE</h1>
            <p className="text-xs text-gray-500">活動管理系統</p>
          </div>
        </div>

        <nav className="p-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors
                  ${isActive
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'}
                `}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <Home className="w-5 h-5" />
            返回前台
          </Link>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors mt-1"
          >
            <LogOut className="w-5 h-5" />
            登出
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        {/* Desktop Header */}
        <header className="hidden lg:block bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center justify-between px-8 py-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {NAV_ITEMS.find((item) => pathname.startsWith(item.href))?.label || '管理後台'}
            </h2>
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                返回前台
              </Link>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                登出
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="pt-14 lg:pt-0 p-4 lg:p-8 min-h-screen w-full">
          <div className="w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
