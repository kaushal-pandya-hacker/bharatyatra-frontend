'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { isBookingServiceAvailable } from '@/lib/booking-availability';
import { BookingUnavailableModal } from './BookingUnavailableModal';

interface BookingGuardContextType {
  guardBooking: (
    serviceType: string,
    onAvailableCallback?: () => void,
    customDescription?: string,
    customUrl?: string,
  ) => boolean;
  openUnavailableModal: (
    serviceType: string,
    customDescription?: string,
    customUrl?: string,
  ) => void;
  closeUnavailableModal: () => void;
}

const BookingGuardContext = createContext<BookingGuardContextType | undefined>(undefined);

export function BookingGuardProvider({ children }: { children: ReactNode }) {
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    serviceName: string;
    serviceDescription?: string;
    makeMyTripUrl?: string;
  }>({
    isOpen: false,
    serviceName: 'Hotel',
  });

  const openUnavailableModal = (
    serviceType: string,
    customDescription?: string,
    customUrl?: string,
  ) => {
    const formattedName = serviceType
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase());

    const defaultDesc = `${formattedName} booking is currently unavailable on BharatYatra. Please continue with MakeMyTrip to complete your booking.`;

    setModalState({
      isOpen: true,
      serviceName: formattedName,
      serviceDescription: customDescription || defaultDesc,
      makeMyTripUrl: customUrl,
    });
  };

  const closeUnavailableModal = () => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

  const guardBooking = (
    serviceType: string,
    onAvailableCallback?: () => void,
    customDescription?: string,
    customUrl?: string,
  ): boolean => {
    const check = isBookingServiceAvailable(serviceType);

    if (!check.available) {
      openUnavailableModal(serviceType, customDescription, customUrl);
      return false;
    }

    if (onAvailableCallback) {
      onAvailableCallback();
    }
    return true;
  };

  return (
    <BookingGuardContext.Provider
      value={{ guardBooking, openUnavailableModal, closeUnavailableModal }}
    >
      {children}
      <BookingUnavailableModal
        isOpen={modalState.isOpen}
        onClose={closeUnavailableModal}
        serviceName={modalState.serviceName}
        serviceDescription={modalState.serviceDescription}
        makeMyTripUrl={modalState.makeMyTripUrl}
      />
    </BookingGuardContext.Provider>
  );
}

export function useBookingGuard() {
  const context = useContext(BookingGuardContext);
  if (!context) {
    throw new Error('useBookingGuard must be used within a BookingGuardProvider');
  }
  return context;
}
