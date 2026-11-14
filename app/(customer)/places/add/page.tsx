'use client';

import React from 'react';
import { ProtectedRoute } from '@/lib/auth/protected-route';
import ContributePlaceForm from '@/components/contributions/ContributePlaceForm';

export default function AddPlacePage() {
  return (
    <ProtectedRoute>
      <ContributePlaceForm originPath="places" />
    </ProtectedRoute>
  );
}
