import { NextRequest, NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/auth/server-auth';
import { adminDataStore } from '@/lib/admin/admin-store';
import { getSupabaseServerClient } from '@/lib/supabase/client';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdminUser(req);
    if (auth.response) return auth.response;

    const { searchParams } = new URL(req.url);
    const rawStatus = searchParams.get('status') || undefined;
    const gateway = searchParams.get('gateway') || undefined;
    const bookingReference = searchParams.get('bookingReference') || undefined;
    const generalSearch = searchParams.get('search') || undefined;
    const searchTerm = bookingReference || generalSearch;

    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));

    // Normalize status filters
    // If frontend sends 'PAID', we should match both 'PAID' and 'SUCCESSFUL'
    let storeStatusFilter: string | undefined = undefined;
    if (rawStatus && rawStatus !== 'ALL') {
      if (rawStatus === 'PAID') {
        storeStatusFilter = 'SUCCESSFUL';
      } else {
        storeStatusFilter = rawStatus;
      }
    }

    let rawList = adminDataStore.getPayments({
      status: storeStatusFilter,
      gateway: gateway !== 'ALL' ? gateway : undefined,
      search: searchTerm,
    });

    // If store is empty, fallback to querying database
    if (rawList.length === 0) {
      try {
        const supabase = getSupabaseServerClient();
        let query = supabase
          .from('gateway_orders')
          .select('*')
          .order('created_at', { ascending: false });

        if (rawStatus && rawStatus !== 'ALL') {
          query = query.eq('status', rawStatus);
        }
        if (searchTerm) {
          query = query.or(`order_id.ilike.%${searchTerm}%,receipt.ilike.%${searchTerm}%,customer_name.ilike.%${searchTerm}%`);
        }

        const { data: dbOrders, error } = await query;
        if (!error && Array.isArray(dbOrders) && dbOrders.length > 0) {
          rawList = dbOrders.map((o: any) => ({
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
            status: (o.status === 'PAID' ? 'SUCCESSFUL' : o.status === 'FAILED' ? 'FAILED' : 'PENDING') as any,
            transactionDate: o.created_at || new Date().toISOString(),
          }));
        }
      } catch {
        // Table missing or empty -> remains genuine []
      }
    }

    // Secondary filter in memory to guarantee ALL status matching (PAID, CREATED, FAILED, REFUNDED)
    if (rawStatus && rawStatus !== 'ALL') {
      rawList = rawList.filter((p) => {
        const s = (p.status || '').toUpperCase();
        if (rawStatus === 'PAID') {
          return s === 'PAID' || s === 'SUCCESSFUL';
        }
        if (rawStatus === 'CREATED') {
          return s === 'CREATED' || s === 'INITIATED' || s === 'PENDING';
        }
        if (rawStatus === 'FAILED') {
          return s === 'FAILED';
        }
        if (rawStatus === 'REFUNDED') {
          return s === 'REFUNDED' || s === 'PARTIALLY_REFUNDED';
        }
        return s === rawStatus.toUpperCase();
      });
    }

    // Search filter if provided
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      rawList = rawList.filter(
        (p) =>
          (p.bookingReference || '').toLowerCase().includes(q) ||
          (p.transactionId || '').toLowerCase().includes(q) ||
          (p.customerName || '').toLowerCase().includes(q) ||
          (p.customerEmail || '').toLowerCase().includes(q) ||
          (p.gatewayReference || '').toLowerCase().includes(q)
      );
    }

    const total = rawList.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const skip = (page - 1) * limit;
    const paginatedSlice = rawList.slice(skip, skip + limit);

    // Format items so both frontend schemas are seamlessly supported
    const formattedItems = paginatedSlice.map((p) => {
      // Normalize status display
      const normalizedStatus =
        p.status === 'SUCCESSFUL' ? 'PAID' : p.status;

      return {
        id: p.id,
        gatewayOrderId: p.transactionId || p.id,
        transactionId: p.transactionId || p.id,
        gatewayTransactionId: p.gatewayReference || undefined,
        amountInr: Number(p.amount || 0),
        amount: Number(p.amount || 0),
        currency: 'INR',
        status: normalizedStatus,
        paymentMethod: p.method || 'UPI',
        method: p.method || 'UPI',
        createdAt: p.transactionDate || new Date().toISOString(),
        transactionDate: p.transactionDate || new Date().toISOString(),
        booking: {
          id: p.bookingId || p.id,
          bookingReference: p.bookingReference || p.transactionId || 'N/A',
          bookingType: 'TRAVEL_PRODUCT',
          user: {
            fullName: p.customerName || 'Registered Customer',
            email: p.customerEmail || '',
          },
        },
        bookingReference: p.bookingReference || p.transactionId || 'N/A',
        customerName: p.customerName || 'Registered Customer',
        customerEmail: p.customerEmail || '',
        gateway: p.gateway || 'BharatGateway™',
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        items: formattedItems,
        total,
        page,
        limit,
        totalPages,
      },
      count: total,
      items: formattedItems,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Failed to fetch payments.' },
      { status: 500 }
    );
  }
}
