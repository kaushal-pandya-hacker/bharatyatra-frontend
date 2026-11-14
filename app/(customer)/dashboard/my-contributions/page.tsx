'use client';

import React from 'react';
import { AppGate } from '@/components/auth/AppGate';
import UserContributionsView from '@/components/contributions/UserContributionsView';

export default function DashboardMyContributionsPage() {
  return (
    <AppGate>
      <UserContributionsView originPath="dashboard" />
    </AppGate>
  );
}

