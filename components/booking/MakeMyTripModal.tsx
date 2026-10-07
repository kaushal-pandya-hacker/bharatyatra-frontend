'use client';

import React from 'react';
import {
  getMakeMyTripHotelLink,
  getMakeMyTripBusLink,
  getMakeMyTripTrainLink,
  getMakeMyTripFlightLink,
} from '@/lib/makemytrip';
import { BookingUnavailableModal } from './BookingUnavailableModal';
import { ExternalLink } from 'lucide-react';

export interface MakeMyTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingType: 'hotel' | 'flight' | 'bus' | 'train' | 'package' | 'cab' | 'activity';
  title?: string;
  subtitle?: string;
  fromCity?: string;
  toCity?: string;
  priceInr?: number;
}

export function MakeMyTripBookingModal({
  isOpen,
  onClose,
  bookingType,
  title,
  fromCity,
  toCity,
}: MakeMyTripModalProps) {
  let directUrl = 'https://www.makemytrip.com/';
  let serviceName = 'Hotel';

  if (bookingType === 'hotel') {
    directUrl = getMakeMyTripHotelLink(title || toCity);
    serviceName = 'Hotel';
  } else if (bookingType === 'flight') {
    directUrl = getMakeMyTripFlightLink(fromCity, toCity);
    serviceName = 'Flight';
  } else if (bookingType === 'bus') {
    directUrl = getMakeMyTripBusLink(fromCity, toCity);
    serviceName = 'Bus';
  } else if (bookingType === 'train') {
    directUrl = getMakeMyTripTrainLink(fromCity, toCity);
    serviceName = 'Train';
  } else if (bookingType === 'cab') {
    directUrl = 'https://www.makemytrip.com/cabs/';
    serviceName = 'Cab';
  } else if (bookingType === 'activity') {
    directUrl = 'https://www.makemytrip.com/holidays-india/';
    serviceName = 'Activity';
  } else if (bookingType === 'package') {
    directUrl = getMakeMyTripHotelLink(title);
    serviceName = 'Package';
  }

  const serviceDescription = `${serviceName} booking is currently unavailable on BharatYatra. Please continue with MakeMyTrip to complete your booking.`;

  return (
    <BookingUnavailableModal
      isOpen={isOpen}
      onClose={onClose}
      serviceName={serviceName}
      serviceDescription={serviceDescription}
      makeMyTripUrl={directUrl}
    />
  );
}

export function MakeMyTripBookingBanner({
  bookingType = 'hotel',
  title = 'Book with MakeMyTrip',
  fromCity = 'Delhi',
  toCity = 'Mumbai',
}: Omit<MakeMyTripModalProps, 'isOpen' | 'onClose'>) {
  let directUrl = 'https://www.makemytrip.com/';
  if (bookingType === 'hotel') directUrl = getMakeMyTripHotelLink(title);
  else if (bookingType === 'flight') directUrl = getMakeMyTripFlightLink(fromCity, toCity);
  else if (bookingType === 'bus') directUrl = getMakeMyTripBusLink(fromCity, toCity);
  else if (bookingType === 'train') directUrl = getMakeMyTripTrainLink(fromCity, toCity);

  return (
    <a
      href={directUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-[#eb2226] hover:bg-[#d41c20] text-white font-extrabold text-sm shadow-md hover:shadow-red-600/30 transition-all border border-red-400/30 cursor-pointer text-center"
    >
      <span>Continue with MakeMyTrip</span>
      <ExternalLink className="w-4 h-4 shrink-0" />
    </a>
  );
}
