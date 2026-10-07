export interface Occupancy {
  rooms: number;
  adults: number;
  children: number;
}

export interface HotelSearchCriteria {
  destination: string;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  rooms?: number;
  adults?: number;
  children?: number;
  occupancies?: Occupancy[];
  destinationCode?: string;
  latitude?: number;
  longitude?: number;
}

export interface NormalizedHotel {
  hotelId: string;
  name: string;
  image: string;
  category: string;
  address: string;
  destination: string;
  latitude: number;
  longitude: number;
  roomName: string;
  board: string;
  price: number;
  currency: string;
  cancellationPolicy: string;
  rateKey: string;
  provider: 'HBX' | string;
}

export interface CheckRateRequest {
  rateKey: string;
}

export interface CheckRateResult {
  status: 'AVAILABLE' | 'PRICE_CHANGED' | 'UNAVAILABLE';
  rateKey: string;
  price: number;
  currency: string;
  cancellationPolicy: string;
  message?: string;
}

export interface BookHotelRequest {
  rateKey: string;
  holder: {
    name: string;
    surname: string;
    email: string;
    phone: string;
  };
  paxDetails?: Array<{
    name: string;
    surname: string;
    type: 'AD' | 'CH';
  }>;
}

export interface BookingResult {
  bookingId: string;
  reference: string;
  status: 'CONFIRMED' | 'FAILED' | 'TEST_ONLY';
  hotelName: string;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  currency: string;
  holderName: string;
  cancellationPolicy: string;
  rawResponse?: any;
}

export interface CancelBookingResult {
  bookingId: string;
  status: 'CANCELLED' | 'FAILED';
  cancellationFlag: boolean;
  cancellationFee: number;
  currency: string;
  message?: string;
}

export interface SupplierErrorResponse {
  code: string;
  message: string;
  supplier: string;
  timestamp: string;
}
