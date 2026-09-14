export interface BusProvider {
  searchBuses(origin: string, destination: string, travelDate: string): Promise<any[]>;
  getSeatLayout(busId: string): Promise<any>;
  createBooking(params: any): Promise<any>;
  cancelBooking(bookingId: string): Promise<any>;
}
