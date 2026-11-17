import { NextRequest, NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/auth/server-auth';
import { enquiryStore } from '@/lib/enquiries/enquiry-store';
import { adminDataStore } from '@/lib/admin/admin-store';
import { notificationStore } from '@/lib/notifications/notification-store';

export const dynamic = 'force-dynamic';

interface AdminAlertItem {
  id: string;
  type: 'REGISTRATION' | 'BOOKING' | 'PAYMENT_FAILED' | 'COMMUNITY' | 'ENQUIRY' | 'REFUND' | 'CANCELLATION' | 'EMERGENCY' | 'SYSTEM';
  title: string;
  reference: string;
  category: string;
  message: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  status: 'UNREAD' | 'READ';
  createdAt: string;
  href: string;
}

// In-memory read tracking for administrative notifications
const readAlertIds = new Set<string>();

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdminUser(req);
    if (auth.response) return auth.response;

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || 'ALL';

    const alerts: AdminAlertItem[] = [];

    // 1. Enquiries
    try {
      const allEnquiries = await enquiryStore.getEnquiries();
      allEnquiries.slice(0, 5).forEach((enq) => {
        alerts.push({
          id: `enq-${enq.id}`,
          type: 'ENQUIRY',
          title: `Website Enquiry: ${enq.fullName}`,
          reference: enq.enquiryReference,
          category: enq.inquiryType,
          message: enq.message,
          severity: 'INFO',
          status: readAlertIds.has(`enq-${enq.id}`) ? 'READ' : 'UNREAD',
          createdAt: enq.createdAt,
          href: '/admin/enquiries',
        });
      });
    } catch {}

    // 2. Support Tickets
    try {
      const tickets = adminDataStore.getSupportTickets();
      tickets.filter((t) => t.status === 'OPEN').slice(0, 5).forEach((t) => {
        alerts.push({
          id: `tkt-${t.id}`,
          type: 'EMERGENCY',
          title: `Open Support Ticket: #${t.ticketNumber}`,
          reference: t.ticketNumber,
          category: t.category,
          message: `${t.customerName}: ${t.subject}`,
          severity: t.priority === 'URGENT' || t.priority === 'HIGH' ? 'CRITICAL' : 'WARNING',
          status: readAlertIds.has(`tkt-${t.id}`) ? 'READ' : 'UNREAD',
          createdAt: t.createdAt,
          href: '/admin/support',
        });
      });
    } catch {}

    // 3. Bookings & Cancellations
    try {
      const bookings = adminDataStore.getBookings();
      bookings.slice(0, 4).forEach((b) => {
        if (b.status === 'CANCELLED') {
          alerts.push({
            id: `bk-${b.id}`,
            type: 'CANCELLATION',
            title: `Booking Cancelled: #${b.bookingReference}`,
            reference: b.bookingReference,
            category: b.type,
            message: `${b.customerName} cancelled reservation for ${b.destination}`,
            severity: 'WARNING',
            status: readAlertIds.has(`bk-${b.id}`) ? 'READ' : 'UNREAD',
            createdAt: b.createdAt,
            href: '/admin/bookings',
          });
        } else {
          alerts.push({
            id: `bk-${b.id}`,
            type: 'BOOKING',
            title: `New Booking Confirmed: #${b.bookingReference}`,
            reference: b.bookingReference,
            category: b.type,
            message: `${b.customerName} booked ${b.destination} (₹${b.amount.toLocaleString('en-IN')})`,
            severity: 'INFO',
            status: readAlertIds.has(`bk-${b.id}`) ? 'READ' : 'UNREAD',
            createdAt: b.createdAt,
            href: '/admin/bookings',
          });
        }
      });
    } catch {}

    // 4. Failed Payments & Refunds
    try {
      const refunds = adminDataStore.getRefunds();
      refunds.filter((r) => r.status === 'REQUESTED' || r.status === 'PROCESSING').forEach((r) => {
        alerts.push({
          id: `ref-${r.id}`,
          type: 'REFUND',
          title: `Refund Action Required: #${r.refundReference}`,
          reference: r.refundReference,
          category: 'FINANCE',
          message: `${r.customerName} requested refund of ₹${r.amount.toLocaleString('en-IN')}`,
          severity: 'WARNING',
          status: readAlertIds.has(`ref-${r.id}`) ? 'READ' : 'UNREAD',
          createdAt: r.requestedAt,
          href: '/admin/refunds',
        });
      });
    } catch {}

    // 5. Trip Emergencies
    try {
      const trips = adminDataStore.getTrips();
      trips.filter((t) => t.emergencyFlag).forEach((t) => {
        alerts.push({
          id: `trip-emg-${t.id}`,
          type: 'EMERGENCY',
          title: `Trip Assistance Alert: ${t.title}`,
          reference: t.id,
          category: 'TRIP_SAFETY',
          message: t.emergencyNote || 'Customer flagged for active itinerary assistance',
          severity: 'CRITICAL',
          status: readAlertIds.has(`trip-emg-${t.id}`) ? 'READ' : 'UNREAD',
          createdAt: t.updatedAt,
          href: '/admin/trips/live',
        });
      });
    } catch {}

    // Sort by latest first
    alerts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    let filtered = alerts;
    if (category !== 'ALL') {
      filtered = alerts.filter((a) => a.type === category);
    }

    const unreadCount = alerts.filter((a) => a.status === 'UNREAD').length;

    return NextResponse.json({
      success: true,
      unreadCount,
      categories: ['ALL', 'BOOKING', 'ENQUIRY', 'REFUND', 'CANCELLATION', 'EMERGENCY'],
      alerts: filtered,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Error loading admin notifications' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/admin/notifications
 * Mark a single alert or all alerts as read.
 */
export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdminUser(req);
    if (auth.response) return auth.response;

    const body = await req.json();
    const { action, alertId } = body;

    if (action === 'MARK_ALL_READ') {
      // Mark all current known alerts as read
      const allEnquiries = await enquiryStore.getEnquiries();
      allEnquiries.forEach((e) => readAlertIds.add(`enq-${e.id}`));
      adminDataStore.getSupportTickets().forEach((t) => readAlertIds.add(`tkt-${t.id}`));
      adminDataStore.getBookings().forEach((b) => readAlertIds.add(`bk-${b.id}`));
      adminDataStore.getRefunds().forEach((r) => readAlertIds.add(`ref-${r.id}`));
      adminDataStore.getTrips().forEach((t) => readAlertIds.add(`trip-emg-${t.id}`));
      return NextResponse.json({ success: true, message: 'All notifications marked as read' });
    }

    if (alertId) {
      readAlertIds.add(alertId);
      return NextResponse.json({ success: true, message: `Notification ${alertId} marked as read` });
    }

    return NextResponse.json({ success: false, error: 'Invalid notification action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Failed to update notification status' },
      { status: 500 }
    );
  }
}
