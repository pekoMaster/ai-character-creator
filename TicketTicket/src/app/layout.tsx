import type { Metadata, Viewport } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import './globals.css';
import { AppProvider } from '@/contexts/AppContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { AdminProvider } from '@/contexts/AdminContext';
import SessionProvider from '@/components/providers/SessionProvider';
import ReCaptchaProvider from '@/components/providers/ReCaptchaProvider';
import BottomNav from '@/components/layout/BottomNav';
import SideNav from '@/components/layout/SideNav';
import DisclaimerModal from '@/components/layout/DisclaimerModal';
import LanguageModal from '@/components/layout/LanguageModal';

export const metadata: Metadata = {
  title: 'TicketTicket - Concert Companion Matching',
  description: 'Find your concert companion and enjoy live music together',
  keywords: ['concert', 'companion', 'matching', 'ticket', 'live music'],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className="antialiased bg-gray-50">
        <NextIntlClientProvider messages={messages}>
          <SessionProvider>
            <ReCaptchaProvider>
              <LanguageProvider>
              <AppProvider>
                <AdminProvider>
                  <LanguageModal />
                  <DisclaimerModal />
                  <div className="flex">
                    <SideNav />
                    <main className="flex-1 min-h-screen pb-20 lg:pb-0 lg:ml-64">
                      <div className="lg:max-w-4xl lg:mx-auto">
                        {children}
                      </div>
                    </main>
                  </div>
                  <BottomNav />
                </AdminProvider>
              </AppProvider>
              </LanguageProvider>
            </ReCaptchaProvider>
          </SessionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
