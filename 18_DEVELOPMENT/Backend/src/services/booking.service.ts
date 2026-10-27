export interface CreateBookingInput {
  userId: string;
  tripId?: string;
  bookingType: 'BUS' | 'HOTEL' | 'ACTIVITY' | 'PACKAGE';
  providerId: string;
  itemDetails: Record<string, any>;
  amountInr: number;
}

export class BookingService {
  public static async createBooking(input: CreateBookingInput) {
    const bookingReference = `CF-BK-${Date.now().toString(36).toUpperCase()}`;

    // Provider Entity Mapping & Adapter Dispatch
    const providerMapping = {
      providerId: input.providerId,
      bookingType: input.bookingType,
      providerReference: `EXT-${Math.floor(Math.random() * 1000000)}`,
      syncStatus: 'SYNCED'
    };

    return {
      bookingId: `bk_${Date.now()}`,
      bookingReference,
      userId: input.userId,
      bookingType: input.bookingType,
      status: 'CONFIRMED',
      totalAmountInr: input.amountInr,
      providerMapping,
      createdAt: new Date().toISOString()
    };
  }

  public static async getBookingById(bookingId: string) {
    return {
      bookingId,
      bookingReference: 'CF-BK-SAMPLE123',
      bookingType: 'BUS',
      status: 'CONFIRMED',
      itemDetails: {
        operator: 'GSRTC Express',
        origin: 'Ahmedabad',
        destination: 'Somnath',
        departureTime: '22:00 IST',
        seatNumbers: ['A12', 'A13']
      },
      totalAmountInr: 1250,
      createdAt: new Date().toISOString()
    };
  }
}
