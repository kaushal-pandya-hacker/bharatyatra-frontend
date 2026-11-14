'use client';

import React from 'react';
import { AppGate } from '@/components/auth/AppGate';
import ContributePlaceForm from '@/components/contributions/ContributePlaceForm';

export default function DashboardContributePlacePage() {
  return (
    <AppGate>
      <ContributePlaceForm originPath="dashboard" />
    </AppGate>
  );
}

