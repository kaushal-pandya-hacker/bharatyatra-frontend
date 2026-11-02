import { NextRequest, NextResponse } from 'next/server';
import { webPushEngine } from '@/lib/notifications/web-push-engine';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId') || 'usr_customer_demo';
  const prefs = webPushEngine.getPreferences(userId);

  // Return both camelCase client SDK format and backend format
  return NextResponse.json({
    tripReminders: prefs.tripNotifications,
    bookingUpdates: prefs.bookingNotifications,
    tripUpdates: prefs.tripNotifications,
    aiUpdates: prefs.tripNotifications,
    marketing: prefs.marketingNotifications,
    // Engine native fields
    pushEnabled: prefs.pushEnabled,
    tripNotifications: prefs.tripNotifications,
    bookingNotifications: prefs.bookingNotifications,
    tripCompletion: prefs.tripCompletion,
    reviewResponses: prefs.reviewResponses,
    marketingNotifications: prefs.marketingNotifications,
  });
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const userId = body.userId || 'usr_customer_demo';

    // Map any incoming frontend keys to engine keys
    const updates: any = {};
    if (typeof body.tripReminders === 'boolean') updates.tripNotifications = body.tripReminders;
    if (typeof body.tripUpdates === 'boolean') updates.tripNotifications = body.tripUpdates;
    if (typeof body.bookingUpdates === 'boolean') updates.bookingNotifications = body.bookingUpdates;
    if (typeof body.marketing === 'boolean') updates.marketingNotifications = body.marketing;
    if (typeof body.pushEnabled === 'boolean') updates.pushEnabled = body.pushEnabled;
    if (typeof body.tripNotifications === 'boolean') updates.tripNotifications = body.tripNotifications;
    if (typeof body.bookingNotifications === 'boolean') updates.bookingNotifications = body.bookingNotifications;
    if (typeof body.tripCompletion === 'boolean') updates.tripCompletion = body.tripCompletion;
    if (typeof body.reviewResponses === 'boolean') updates.reviewResponses = body.reviewResponses;
    if (typeof body.marketingNotifications === 'boolean') updates.marketingNotifications = body.marketingNotifications;

    const saved = webPushEngine.updatePreferences(userId, updates);

    return NextResponse.json({
      success: true,
      tripReminders: saved.tripNotifications,
      bookingUpdates: saved.bookingNotifications,
      tripUpdates: saved.tripNotifications,
      aiUpdates: saved.tripNotifications,
      marketing: saved.marketingNotifications,
      pushEnabled: saved.pushEnabled,
      tripNotifications: saved.tripNotifications,
      bookingNotifications: saved.bookingNotifications,
      tripCompletion: saved.tripCompletion,
      reviewResponses: saved.reviewResponses,
      marketingNotifications: saved.marketingNotifications,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Error updating preferences.' },
      { status: 500 }
    );
  }
}

