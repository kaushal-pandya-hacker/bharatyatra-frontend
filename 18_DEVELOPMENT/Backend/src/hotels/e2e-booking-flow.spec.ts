import { ConfigService } from '@nestjs/config';
import { HotelbedsClientService } from '../providers/hotelbeds/hotelbeds-client.service';
import { HotelbedsHotelProvider } from '../providers/hotelbeds/hotelbeds-hotel.provider';

describe('Full End-to-End Hotel Customer Journey Test', () => {
  it('executes complete flow: Search -> Details -> CheckRate -> Sandbox Booking -> Cancellation', async () => {
    const configService = new ConfigService({
      HBX_API_KEY: process.env.HBX_API_KEY || '7b6104baaa08b6bb38a84ff5f006323c',
      HBX_API_SECRET: process.env.HBX_API_SECRET || 'apVQNw8hvS',
      HBX_BASE_URL: process.env.HBX_BASE_URL || 'https://api.test.hotelbeds.com',
    });

    const client = new HotelbedsClientService(configService);
    const provider = new HotelbedsHotelProvider(client);

    // Stage 1: Hotel Search
    console.log('--- E2E STAGE 1: SEARCH HOTELS ---');
    const searchResults = await provider.searchHotels({
      destination: 'Ahmedabad',
      checkIn: '2026-11-15',
      checkOut: '2026-11-17',
      rooms: 1,
      adults: 2,
    });

    expect(searchResults).toBeDefined();
    expect(searchResults.length).toBeGreaterThan(0);
    const selectedHotel = searchResults[0];
    console.log(`[STAGE 1 PASS] Found ${searchResults.length} hotels. Selected: "${selectedHotel.name}" (Code: ${selectedHotel.hotelId})`);

    // Stage 2: Hotel Details
    console.log('--- E2E STAGE 2: HOTEL DETAILS ---');
    const details = await provider.getHotelDetails(selectedHotel.hotelId);
    expect(details).toBeDefined();
    expect(details?.hotelId).toBe(selectedHotel.hotelId);
    console.log(`[STAGE 2 PASS] Retrieved property details for ${details?.name}. Rooms count: ${details?.rooms.length}`);

    // Stage 3: Price & Availability Recheck
    console.log('--- E2E STAGE 3: PRICE RECHECK ---');
    const rateKey = selectedHotel.rooms[0]?.rateKey || `RATEKEY_${selectedHotel.hotelId}_DELUXE`;
    const rateCheck = await provider.checkRates(rateKey);
    expect(rateCheck.status).toBe('AVAILABLE');
    console.log(`[STAGE 3 PASS] Rate check status: ${rateCheck.status}, Price: ₹${rateCheck.netPrice} ${rateCheck.currency}`);

    // Stage 4: Execute Sandbox Booking
    console.log('--- E2E STAGE 4: SANDBOX BOOKING EXECUTION ---');
    const bookingResult = await provider.createBooking({
      rateKey: rateCheck.rateKey || rateKey,
      holder: {
        name: 'Kaushal',
        surname: 'Pandya',
        email: 'kaushal@chalo-farva.in',
        phone: '+919825100492',
      },
      paxDetails: [
        { roomId: 1, type: 'AD', name: 'Kaushal', surname: 'Pandya', title: 'Mr' },
        { roomId: 1, type: 'AD', name: 'Pooja', surname: 'Patel', title: 'Ms' },
      ],
      clientReference: `CF-E2E-${Date.now()}`,
    });

    expect(bookingResult).toBeDefined();
    expect(bookingResult.chaloFarvaBookingId).toBeDefined();
    expect(bookingResult.supplierReference).toBeDefined();
    console.log(`[STAGE 4 PASS] Booking Confirmed! BharatYatra Ref: ${bookingResult.chaloFarvaBookingId}, Supplier Ref: ${bookingResult.supplierReference}`);

    // Stage 5: Cancellation Flow
    console.log('--- E2E STAGE 5: CANCELLATION ---');
    const cancelResult = await provider.cancelBooking(bookingResult.supplierReference, true);
    expect(cancelResult.status).toBe('CANCELLED');
    expect(cancelResult.cancellationFlag).toBe(true);
    console.log(`[STAGE 5 PASS] Reservation ${bookingResult.supplierReference} successfully cancelled! Message: ${cancelResult.message}`);
  }, 25000);
});
