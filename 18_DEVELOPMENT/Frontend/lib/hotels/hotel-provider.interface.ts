import {
  HotelSearchCriteria,
  NormalizedHotel,
  CheckRateRequest,
  CheckRateResult,
  BookHotelRequest,
  BookingResult,
  CancelBookingResult,
} from './types';

/**
 * Supplier Abstraction Interface for Hotel Search & Booking Services.
 * Allows seamless switching or multi-sourcing between HBX, Amadeus, or internal inventories.
 */
export interface HotelProvider {
  readonly providerName: string;

  /**
   * Searches available hotel rates given search criteria.
   */
  searchHotels(criteria: HotelSearchCriteria): Promise<NormalizedHotel[]>;

  /**
   * Re-evaluates rate availability and price before booking (CheckRate).
   */
  checkRate(request: CheckRateRequest): Promise<CheckRateResult>;

  /**
   * Executes hotel room booking.
   */
  bookHotel(request: BookHotelRequest): Promise<BookingResult>;

  /**
   * Retrieves booking status by ID or reference.
   */
  getBookingDetails(bookingId: string): Promise<BookingResult>;

  /**
   * Cancels a confirmed booking.
   */
  cancelBooking(bookingId: string): Promise<CancelBookingResult>;
}
