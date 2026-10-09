'use client';

import GroupExpensesPage from '../trips/[id]/expenses/ExpensesClient';
import { ProtectedRoute } from '@/lib/auth/protected-route';

export default function ExpensesStandalonePage() {
  return (
    <ProtectedRoute>
      <GroupExpensesPage params={{ id: '1' }} />
    </ProtectedRoute>
  );
}
