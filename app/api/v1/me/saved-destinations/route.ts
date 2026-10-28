import { NextRequest, NextResponse } from 'next/server';
import { requireServerUser } from '@/lib/auth/server-auth';
import { UserDataStore } from '@/lib/user/user-store';

/**
 * GET /api/v1/me/saved-destinations
 * Retrieves all saved destinations for the authenticated user.
 */
export async function GET(req: NextRequest) {
  const auth = await requireServerUser(req);
  if (auth.response) return auth.response;

  try {
    const saved = await UserDataStore.getSavedDestinations(auth.user.id);
    return NextResponse.json({
      success: true,
      count: saved.length,
      data: saved,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch saved destinations' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/me/saved-destinations
 * Adds a destination to the authenticated user's wishlist.
 */
export async function POST(req: NextRequest) {
  const auth = await requireServerUser(req);
  if (auth.response) return auth.response;

  try {
    const body = await req.json();
    if (!body.destinationId) {
      return NextResponse.json(
        { success: false, error: 'destinationId is required' },
        { status: 400 }
      );
    }

    const saved = await UserDataStore.saveDestination(auth.user.id, {
      destinationId: body.destinationId,
      name: body.name || body.destinationName,
      data: body.data || {},
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Destination saved to wishlist.',
        data: saved,
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to save destination' },
      { status: 400 }
    );
  }
}

/**
 * DELETE /api/v1/me/saved-destinations
 * Removes a destination from the authenticated user's wishlist.
 */
export async function DELETE(req: NextRequest) {
  const auth = await requireServerUser(req);
  if (auth.response) return auth.response;

  try {
    const { searchParams } = new URL(req.url);
    const destinationId = searchParams.get('destinationId');
    if (!destinationId) {
      return NextResponse.json(
        { success: false, error: 'destinationId query parameter is required' },
        { status: 400 }
      );
    }

    const removed = await UserDataStore.removeSavedDestination(auth.user.id, destinationId);
    return NextResponse.json({
      success: true,
      message: removed ? 'Destination removed from wishlist.' : 'Destination not found in wishlist.',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to remove saved destination' },
      { status: 500 }
    );
  }
}

