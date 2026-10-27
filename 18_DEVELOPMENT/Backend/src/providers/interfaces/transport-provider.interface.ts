export type TransportTypeEnum = 'FLIGHT' | 'BUS' | 'TRAIN';

export interface TransportCapabilities {
  search: boolean;
  availability: boolean;
  pricing: boolean;
  booking: boolean;
  cancellation: boolean;
  seatSelection: boolean;
  baggage: boolean;
  confirmationMode: 'DIRECT' | 'REQUEST_CONFIRMATION';
}

export interface TransportSearchSegment {
  segmentOrder: number;
  carrierCode: string;
  carrierName: string;
  flightOrTrainNumber: string;
  originCode: string;
  originName: string;
  destinationCode: string;
  destinationName: string;
  departureTime: string;
  arrivalTime: string;
  durationMinutes: number;
  cabinClass?: string;
  baggageAllowance?: string;
  aircraftOrBusType?: string;
}

export interface NormalizedTransportItem {
  id: string;
  providerId: string;
  providerName: string;
  provider?: string;
  type: TransportTypeEnum;
  productType?: string;
  origin: string;
  originName?: string;
  destination: string;
  destinationName?: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  durationMinutes: number;
  segments: TransportSearchSegment[];
  price: number;
  currency: string;
  refundable: boolean;
  seatsAvailable: number;
  bookingAvailable: boolean;
  fareClass?: string;
  operatorName?: string;
  busType?: string;
  trainName?: string;
  trainNumber?: string;
  boardingPoints?: string[];
  droppingPoints?: string[];
  cancellationPolicy?: string;
  seatMapSupported?: boolean;
}

export interface UniversalTransportSearchInput {
  type: TransportTypeEnum;
  productType?: string;
  origin: string;
  destination: string;
  departureDate?: string;
  checkIn?: string;
  returnDate?: string;
  tripType?: 'ONE_WAY' | 'ROUND_TRIP' | 'MULTI_CITY';
  adults?: number;
  children?: number;
  infants?: number;
  passengers?: number;
  cabinClass?: string;
}

export interface NormalizedTransportSearchResult {
  searchId: string;
  type: TransportTypeEnum;
  productType?: string;
  origin: string;
  destination: string;
  departureDate: string;
  totalCount: number;
  items: NormalizedTransportItem[];
  providerId: string;
  providerName: string;
  provider?: string;
}

export interface TransportRevalidateInput {
  transportId: string;
  rateKey?: string;
  fareClass?: string;
  passengersCount: number;
}

export interface TransportRevalidateResult {
  status: 'AVAILABLE' | 'PRICE_CHANGED' | 'UNAVAILABLE';
  transportId: string;
  oldFare: number;
  newFare: number;
  currency: string;
  priceChanged: boolean;
  message?: string;
  revalidateKey?: string;
}

export interface TransportPassengerInput {
  passengerType: 'ADULT' | 'CHILD' | 'INFANT';
  title?: string;
  firstName: string;
  lastName: string;
  gender?: string;
  dateOfBirth?: string;
  nationality?: string;
  seatNumber?: string;
  idDocumentNumberMasked?: string;
}

export interface TransportBookingRequest {
  transportId: string;
  type: TransportTypeEnum;
  providerId: string;
  revalidateKey?: string;
  acceptPriceChange?: boolean;
  agreedFare: number;
  currency: string;
  passengers: TransportPassengerInput[];
  contactEmail: string;
  contactPhone: string;
  boardingPoint?: string;
  droppingPoint?: string;
  idempotencyKey?: string;
  requestId?: string;
}

export interface TransportBookingResult {
  chaloFarvaBookingId: string;
  bookingReference: string;
  supplierBookingId?: string;
  pnr?: string;
  providerId: string;
  providerName: string;
  type: TransportTypeEnum;
  status: 'CONFIRMED' | 'BOOKING_PENDING' | 'REQUEST_CONFIRMATION' | 'FAILED';
  confirmationMode: 'DIRECT' | 'REQUEST_CONFIRMATION';
  totalPrice: number;
  currency: string;
  segments: TransportSearchSegment[];
  passengers: TransportPassengerInput[];
  createdAt: string;
  message?: string;
}

export interface TransportCancellationRequest {
  chaloFarvaBookingId: string;
  pnrOrSupplierRef?: string;
  reason?: string;
}

export interface TransportCancellationResult {
  status: 'CANCELLED' | 'CANCELLATION_REQUESTED' | 'FAILED';
  chaloFarvaBookingId: string;
  pnr?: string;
  cancellationFee: number;
  refundAmount: number;
  currency: string;
  message: string;
}

export interface TransportBookingStatusResult {
  chaloFarvaBookingId: string;
  pnr?: string;
  status: string;
  supplierReference?: string;
  updatedAt: string;
}

export interface ITransportProvider {
  readonly providerId: string;
  readonly providerName: string;
  readonly supportedType: TransportTypeEnum;
  readonly capabilities: TransportCapabilities;

  search(input: UniversalTransportSearchInput): Promise<NormalizedTransportSearchResult>;
  getDetails(id: string): Promise<NormalizedTransportItem | null>;
  checkAvailability(id: string, options?: any): Promise<{ available: boolean; seatsLeft: number }>;
  getFare(id: string, fareClass?: string): Promise<{ price: number; currency: string }>;
  revalidate(input: TransportRevalidateInput): Promise<TransportRevalidateResult>;
  createBooking(request: TransportBookingRequest): Promise<TransportBookingResult>;
  cancelBooking(request: TransportCancellationRequest): Promise<TransportCancellationResult>;
  getBookingStatus(bookingIdOrRef: string): Promise<TransportBookingStatusResult>;
  healthCheck(): Promise<{ isConfigured: boolean; isHealthy: boolean; mode: string; details: string }>;
}
