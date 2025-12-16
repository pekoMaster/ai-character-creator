'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Home, Search, PlusCircle, MessageCircle, User } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();
  const t = useTranslations('nav');

  const navItems = [
    { href: '/', label: t('home'), icon: Home },
    { href: '/explore', label: t('explore'), icon: Search },
    { href: '/create', label: t('create'), icon: PlusCircle },
    { href: '/messages', label: t('messages'), icon: MessageCircle },
    { href: '/profile', label: t('profile'), icon: User },
  ];

  // 在聊天頁面等特定頁面隱藏底部導覽
  const hiddenPaths = ['/chat'];
  const shouldHide = hiddenPaths.some((path) => pathname.startsWith(path));

  if (shouldHide) return null;

  return (
    <nav
      className="
        fixed bottom-0 left-0 right-0 z-40
        bg-white border-t border-gray-200
        safe-area-bottom
        lg:hidden
      "
    >
      <div className="flex items-center justify-around h-16">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;

          return (
            <Link
              key={href}
              href={href}
              className={`
                flex flex-col items-center justify-center
                w-full h-full gap-1
                transition-colors duration-200
                ${isActive ? 'text-indigo-500' : 'text-gray-400 hover:text-gray-600'}
              `}
            >
              <Icon
                className={`w-6 h-6 ${href === '/create' ? 'w-7 h-7' : ''}`}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
