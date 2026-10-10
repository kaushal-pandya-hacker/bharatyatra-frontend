'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav';
import { AccessibilityProvider } from '@/lib/accessibility/accessibility-context';
import { AccessibilityModal } from '@/components/accessibility/AccessibilityModal';
import { AuthProvider } from '@/lib/auth/auth-context';
import { BookingGuardProvider } from '@/components/booking/BookingGuardProvider';
import { DestinationSelectionProvider } from '@/lib/tourism/destination-selection-context';
import GlobalDestinationSelectionBar from '@/components/travel/GlobalDestinationSelectionBar';
import { NexiChatFloating } from '@/components/nexi/NexiChatFloating';

export function CustomerLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminPath = pathname?.startsWith('/bharatyatra-ops');

  if (isAdminPath) {
    return <>{children}</>;
  }

  return (
    <AccessibilityProvider>
      <AuthProvider>
        <BookingGuardProvider>
          <DestinationSelectionProvider>
            <Header />
            <main className="flex-1 pb-16 md:pb-0">{children}</main>
            <Footer />
            <MobileBottomNav />
            <GlobalDestinationSelectionBar />
            <AccessibilityModal />
            <NexiChatFloating />
          </DestinationSelectionProvider>
        </BookingGuardProvider>
      </AuthProvider>
    </AccessibilityProvider>
  );
}
