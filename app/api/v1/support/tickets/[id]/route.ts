import { NextRequest, NextResponse } from 'next/server';
import { adminDataStore } from '@/lib/admin/admin-store';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ticket = adminDataStore.getTicketByIdOrNumber(params.id);
    if (!ticket) {
      return NextResponse.json(
        { success: false, message: 'Support ticket not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: ticket,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Error loading support ticket.' },
      { status: 500 }
    );
  }
}
