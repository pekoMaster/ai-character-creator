'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Home, Search, PlusCircle, MessageCircle, User, Ticket } from 'lucide-react';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';

export default function SideNav() {
  const pathname = usePathname();
  const t = useTranslations('nav');

  const navItems = [
    { href: '/', label: t('home'), icon: Home },
    { href: '/explore', label: t('explore'), icon: Search },
    { href: '/create', label: t('create'), icon: PlusCircle },
    { href: '/messages', label: t('messages'), icon: MessageCircle },
    { href: '/profile', label: t('profile'), icon: User },
  ];

  // 在聊天頁面等特定頁面隱藏導覽
  const hiddenPaths = ['/chat'];
  const shouldHide = hiddenPaths.some((path) => pathname.startsWith(path));

  if (shouldHide) return null;

  return (
    <aside
      className="
        hidden lg:flex flex-col
        fixed left-0 top-0 bottom-0
        w-64 bg-white border-r border-gray-200
        z-40
      "
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-100">
        <Ticket className="w-8 h-8 text-indigo-500" />
        <span className="text-xl font-bold text-gray-900">TicketTicket</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-2">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;

            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl
                    transition-all duration-200
                    ${isActive
                      ? 'bg-indigo-50 text-indigo-600 font-semibold'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                  `}
                >
                  <Icon
                    className={`w-5 h-5 ${href === '/create' ? 'w-6 h-6' : ''}`}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  <span className="text-sm">{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-gray-100 space-y-3">
        <LanguageSwitcher />
        <p className="text-xs text-gray-400 text-center">
          TicketTicket v1.0.0
        </p>
      </div>
    </aside>
  );
}
