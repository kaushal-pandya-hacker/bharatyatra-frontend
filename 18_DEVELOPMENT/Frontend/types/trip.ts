export type TripStatus = 'DRAFT' | 'PLANNING' | 'READY' | 'BOOKED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'ARCHIVED';
export type ItemType = 'ATTRACTION' | 'HOTEL_STAY' | 'BUS_TRANSIT' | 'RESTAURANT' | 'ACTIVITY';

export interface Trip {
  tripId: string;
  userId: string;
  title: string;
  originCity: string;
  primaryDestinationId?: string;
  startDate: string;
  endDate: string;
  totalBudgetInr?: number;
  estimatedCostInr?: number;
  travellerCount: number;
  tripStatus: TripStatus;
  createdAt: string;
}

export interface ItineraryItem {
  itemId: string;
  dayId: string;
  sequenceOrder: number;
  itemType: ItemType;
  title: string;
  startTime: string;
  endTime: string;
  estimatedCost: number;
  lockedByUser: boolean;
  bookingStatus: 'UNBOOKED' | 'BOOKING_PENDING' | 'CONFIRMED' | 'FAILED';
}

export interface ItineraryDay {
  dayId: string;
  versionId: string;
  dayNumber: number;
  date: string;
  overnightDestinationId?: string;
  items: ItineraryItem[];
}
