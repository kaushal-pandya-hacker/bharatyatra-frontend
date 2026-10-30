'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav';
import { AccessibilityProvider } from '@/lib/accessibility/accessibility-context';
import { AuthProvider } from '@/lib/auth/auth-context';
import { BookingGuardProvider } from '@/components/booking/BookingGuardProvider';
import { DestinationSelectionProvider } from '@/lib/tourism/destination-selection-context';
import { NexiProvider } from '@/lib/nexi/nexi-context';
import GlobalDestinationSelectionBar from '@/components/travel/GlobalDestinationSelectionBar';

import { AccessibilityModal } from '@/components/accessibility/AccessibilityModal';

import { NexiChatFloating } from '@/components/nexi/NexiChatFloating';

export function CustomerLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const cleanPath = pathname ? pathname.replace(/\/+$/, '') : '';
  const isAdminPath = cleanPath.startsWith('/bharatyatra-ops');
  const isTripDashboard = cleanPath !== '/trips' && cleanPath.startsWith('/trips/');

  if (isAdminPath) {
    return <>{children}</>;
  }

  if (isTripDashboard) {
    return (
      <AccessibilityProvider>
        <AuthProvider>
          <BookingGuardProvider>
            <DestinationSelectionProvider>
              <NexiProvider>
                <div className="min-h-screen">{children}</div>
                <AccessibilityModal />
                <NexiChatFloating />
              </NexiProvider>
            </DestinationSelectionProvider>
          </BookingGuardProvider>
        </AuthProvider>
      </AccessibilityProvider>
    );
  }

  return (
    <AccessibilityProvider>
      <AuthProvider>
        <BookingGuardProvider>
          <DestinationSelectionProvider>
            <NexiProvider>
              <Header />
              <div className="flex-1 pb-16 lg:pb-0">{children}</div>
              <Footer />
              <MobileBottomNav />
              <GlobalDestinationSelectionBar />
              <AccessibilityModal />
              <NexiChatFloating />
            </NexiProvider>
          </DestinationSelectionProvider>
        </BookingGuardProvider>
      </AuthProvider>
    </AccessibilityProvider>
  );
}
