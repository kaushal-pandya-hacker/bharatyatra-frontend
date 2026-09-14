export interface HotelSearchInput {
  destinationSlug: string;
  checkInDate: string;
  checkOutDate: string;
  guestsCount: number;
}

export interface HotelProvider {
  searchHotels(input: HotelSearchInput): Promise<any[]>;
  getHotelDetails(hotelId: string): Promise<any>;
  checkAvailability(hotelId: string, roomTypeId: string): Promise<boolean>;
  createBooking(params: any): Promise<any>;
  cancelBooking(bookingId: string): Promise<any>;
}
