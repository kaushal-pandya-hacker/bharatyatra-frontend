import { NextRequest, NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/auth/server-auth';
import { adminDataStore } from '@/lib/admin/admin-store';
import { getSupabaseServerClient } from '@/lib/supabase/client';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdminUser(req);
    if (auth.response) return auth.response;

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || undefined;
    const type = searchParams.get('type') || undefined;
    const search = searchParams.get('search') || undefined;

    let data = adminDataStore.getBookings({ status, type, search });

    if (data.length === 0) {
      try {
        const supabase = getSupabaseServerClient();
        let query = supabase.from('user_bookings').select('*').order('created_at', { ascending: false });
        if (status && status !== 'ALL') query = query.eq('status', status);
        if (type && type !== 'ALL') query = query.eq('booking_type', type);
        const { data: dbBookings, error } = await query;
        if (!error && Array.isArray(dbBookings) && dbBookings.length > 0) {
          data = dbBookings.map((b: any) => ({
            id: b.id,
            bookingReference: b.booking_reference || b.id,
            customerName: b.customer_name || 'Registered Customer',
            customerEmail: b.customer_email || '',
            customerPhone: b.customer_phone || '',
            type: (b.booking_type || 'HOTEL') as any,
            supplierId: b.supplier_id || '',
            supplierName: b.supplier_name || 'BharatYatra Partner',
            travelDate: b.start_date || '',
            destination: b.destination || '',
            amount: Number(b.total_amount_inr || 0),
            paymentStatus: (b.payment_status || 'PENDING') as any,
            status: (b.status || 'PENDING') as any,
            confirmationReference: b.confirmation_reference || '',
            refundStatus: (b.refund_status || 'NONE') as any,
            timeline: [],
            createdAt: b.created_at || new Date().toISOString(),
          }));
        }
      } catch {
        // Table missing or empty -> remains genuine []
      }
    }

    return NextResponse.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Failed to fetch bookings.' },
      { status: 500 }
    );
  }
}
