import { NextRequest, NextResponse } from 'next/server';
import { partnerService, DatabaseTableMissingError } from '@/lib/partners/partner-service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      packageSlug,
      customerName,
      customerEmail,
      customerPhone,
      travellers = 2,
      travelDate,
      specialRequests,
    } = body;

    const bookingReference = `BY-PKG-${Math.floor(100000 + Math.random() * 900000)}`;

    // Resolve package to calculate price and commission if it's a partner package
    let partnerPkg = null;
    try {
      partnerPkg = await partnerService.getPackageBySlug(packageSlug);
    } catch (e: any) {
      if (!(e instanceof DatabaseTableMissingError)) {
        throw e;
      }
    }
    let bookingAmount = 25000;

    if (partnerPkg) {
      const pricePerPerson = Number(partnerPkg.discountedPrice || partnerPkg.basePrice);
      bookingAmount = Math.round(pricePerPerson * Number(travellers) * 1.05);

      // Trigger deterministic commission ledger accrual
      await partnerService.processBookingCommission({
        bookingId: bookingReference,
        packageId: partnerPkg.id,
        packageSlug,
        bookingAmount,
        idempotencyKey: `COMM-${bookingReference}-${partnerPkg.id}`,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Booking request created successfully.',
      booking: {
        bookingReference,
        status: 'REQUESTED',
        customerName,
        customerEmail,
        customerPhone,
        travellers,
        travelDate,
        totalPriceInr: bookingAmount,
        specialRequests,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
