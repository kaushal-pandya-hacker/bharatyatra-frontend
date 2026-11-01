import { NextRequest, NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/auth/server-auth';
import { enquiryStore, ContactEnquiry } from '@/lib/enquiries/enquiry-store';
import { adminDataStore } from '@/lib/admin/admin-store';
import { notificationStore } from '@/lib/notifications/notification-store';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdminUser(req);
    if (auth.response) return auth.response;

    // 1. Fetch recent enquiries from enquiry store
    const allEnquiries = await enquiryStore.getEnquiries();
    const enquiryStats = await enquiryStore.getStats();

    // 2. Fetch support tickets from admin store
    const supportTickets = adminDataStore.getSupportTickets();
    const openTicketsCount = supportTickets.filter((t) => t.status === 'OPEN').length;

    // 3. Fetch in-app admin notifications
    const adminNotifs = notificationStore.getNotifications({
      email: 'admin@bharatyatra.com',
      limit: 15,
    });

    // 4. Transform into unified alerts list (take top 10 newest)
    const alerts = allEnquiries.slice(0, 10).map((enq: ContactEnquiry) => ({
      id: `enq-${enq.id}`,
      type: 'ENQUIRY',
      title: `Website Enquiry from ${enq.fullName}`,
      reference: enq.enquiryReference,
      category: enq.inquiryType,
      message: enq.message,
      email: enq.email,
      phone: enq.phone,
      status: enq.status,
      createdAt: enq.createdAt,
      href: '/admin/enquiries',
    }));

    return NextResponse.json({
      success: true,
      unreadCount: enquiryStats.newCount + openTicketsCount,
      newEnquiriesCount: enquiryStats.newCount,
      openTicketsCount,
      enquiryStats,
      alerts,
      notifications: adminNotifs,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Error loading admin notifications' },
      { status: 500 }
    );
  }
}
