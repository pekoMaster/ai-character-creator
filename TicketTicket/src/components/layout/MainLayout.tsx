'use client';

import { usePathname } from 'next/navigation';
import BottomNav from '@/components/layout/BottomNav';
import SideNav from '@/components/layout/SideNav';
import DisclaimerModal from '@/components/layout/DisclaimerModal';
import LanguageModal from '@/components/layout/LanguageModal';
import LegalFooter from '@/components/layout/LegalFooter';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith('/admin');
  const isLoginPage = pathname === '/login';
  const isLegalPage = pathname.startsWith('/legal');

  // Admin pages have their own layout
  if (isAdminPage) {
    return <>{children}</>;
  }

  // Login and legal pages don't need the full navigation
  if (isLoginPage || isLegalPage) {
    return (
      <>
        <LanguageModal />
        <div className="min-h-screen">
          {children}
        </div>
      </>
    );
  }

  // Normal pages with full navigation
  return (
    <>
      <LanguageModal />
      <DisclaimerModal />
      <div className="flex min-h-screen">
        <SideNav />
        <div className="flex-1 flex flex-col lg:ml-64">
          <main className="flex-1 pb-20 lg:pb-0">
            <div className="lg:max-w-4xl lg:mx-auto">
              {children}
            </div>
          </main>
          {/* Desktop-only footer (mobile uses profile page for legal links) */}
          <div className="hidden lg:block">
            <LegalFooter />
          </div>
        </div>
      </div>
      <BottomNav />
    </>
  );
}
