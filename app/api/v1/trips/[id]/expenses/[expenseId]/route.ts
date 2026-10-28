import { NextRequest, NextResponse } from 'next/server';
import { requireServerUser } from '@/lib/auth/server-auth';
import { UserDataStore } from '@/lib/user/user-store';

interface RouteContext {
  params: {
    id: string;
    expenseId: string;
  };
}

/**
 * DELETE /api/v1/trips/[id]/expenses/[expenseId]
 * Deletes a real expense from the trip.
 * Enforces server-side authorization check.
 */
export async function DELETE(req: NextRequest, { params }: RouteContext) {
  const auth = await requireServerUser(req);
  if (auth.response) return auth.response;

  try {
    const { id: tripId, expenseId } = params;
    const deleted = await UserDataStore.deleteTripExpense(tripId, expenseId, auth.user.id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Expense not found or unauthorized to delete.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Expense deleted successfully.',
    });
  } catch (err: any) {
    const isDbError = err?.name === 'DatabasePersistenceError' || err?.code === 'DATABASE_PERSISTENCE_ERROR';
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Failed to delete expense.',
        code: isDbError ? 'DATABASE_ERROR' : 'INTERNAL_ERROR',
      },
      { status: isDbError ? 503 : 500 }
    );
  }
}
