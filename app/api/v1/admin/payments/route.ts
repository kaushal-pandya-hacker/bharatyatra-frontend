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
    const gateway = searchParams.get('gateway') || undefined;
    const search = searchParams.get('search') || undefined;

    let data = adminDataStore.getPayments({ status, gateway, search });

    if (data.length === 0) {
      try {
        const supabase = getSupabaseServerClient();
        const { data: dbOrders, error } = await supabase.from('gateway_orders').select('*').order('created_at', { ascending: false });
        if (!error && Array.isArray(dbOrders) && dbOrders.length > 0) {
          data = dbOrders.map((o: any) => ({
            id: o.id,
            transactionId: o.order_id || o.id,
            bookingId: o.booking_id || '',
            bookingReference: o.receipt || o.order_id,
            customerName: o.customer_name || 'Customer',
            customerEmail: o.customer_email || '',
            gateway: 'BharatGateway™' as const,
            method: (o.payment_method || 'UPI') as any,
            amount: Number(o.amount || 0),
            gatewayReference: o.gateway_payment_id || '',
            status: o.status === 'PAID' ? 'SUCCESSFUL' : o.status === 'FAILED' ? 'FAILED' : 'PENDING',
            transactionDate: o.created_at || new Date().toISOString(),
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
      { success: false, message: err?.message || 'Failed to fetch payments.' },
      { status: 500 }
    );
  }
}

