/**
 * BharatYatra — Admin Onboarding & Travel Profile Analytics API
 * GET /api/admin/onboarding-analytics
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireServerUser } from '@/lib/auth/server-auth';
import { UserDataStore } from '@/lib/user/user-store';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireServerUser(req);
    // Allow admin access or internal authenticated check
    if (auth.user && (auth.user.role as string) !== 'ADMIN' && (auth.user.role as string) !== 'SUPERADMIN') {
      // Check admin_token header fallback
      const adminToken = req.headers.get('authorization')?.replace('Bearer ', '');
      if (!adminToken) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized: Admin privileges required.' },
          { status: 403 }
        );
      }
    }

    const { users } = await UserDataStore.getAdminUsers({ limit: 200 });

    let completedCount = 0;
    let skippedCount = 0;
    let incompleteCount = 0;

    const groupDistribution: Record<string, number> = {
      Family: 0,
      Couple: 0,
      Friends: 0,
      Solo: 0,
      'Group tour': 0,
      Corporate: 0,
      Other: 0,
    };

    const transportDistribution: Record<string, number> = {
      road_trip: 0,
      book_transport: 0,
      mixed: 0,
      not_sure: 0,
    };

    const bookingDistribution: Record<string, number> = {
      hotels: 0,
      transportation: 0,
      experiences: 0,
      complete_package: 0,
      arrange_myself: 0,
    };

    const accommodationDistribution: Record<string, number> = {
      standard: 0,
      budget: 0,
      luxury: 0,
      resorts: 0,
      homestays: 0,
      hostels: 0,
    };

    const budgetDistribution: Record<string, number> = {
      'Under ₹10,000': 0,
      '₹10,000–₹25,000': 0,
      '₹25,000–₹50,000': 0,
      '₹50,000–₹1,00,000': 0,
      'Above ₹1,00,000': 0,
      'Not decided': 0,
    };

    const interestCounts: Record<string, number> = {};
    const recentProfiles: any[] = [];

    for (const u of users) {
      try {
        const prefs = await UserDataStore.getPreferences(u.id);
        const status = (prefs as any).onboardingStatus || 'NOT_STARTED';

        if (status === 'COMPLETED') completedCount++;
        else if (status === 'SKIPPED') skippedCount++;
        else incompleteCount++;

        const group = (prefs as any).groupType || 'Family';
        groupDistribution[group] = (groupDistribution[group] || 0) + 1;

        const mode = (prefs as any).travelModePreference || 'road_trip';
        transportDistribution[mode] = (transportDistribution[mode] || 0) + 1;

        const bookings: string[] = (prefs as any).bookingPreferences || [];
        bookings.forEach((b) => {
          bookingDistribution[b] = (bookingDistribution[b] || 0) + 1;
        });

        const accoms: string[] = (prefs as any).accommodationTypes || [];
        accoms.forEach((a) => {
          accommodationDistribution[a] = (accommodationDistribution[a] || 0) + 1;
        });

        const budgetRange = (prefs as any).budgetRange || '25k_50k';
        if (budgetRange.includes('under') || budgetRange.includes('5k_10k')) budgetDistribution['Under ₹10,000']++;
        else if (budgetRange.includes('10k_25k')) budgetDistribution['₹10,000–₹25,000']++;
        else if (budgetRange.includes('25k_50k')) budgetDistribution['₹25,000–₹50,000']++;
        else if (budgetRange.includes('50k_100k')) budgetDistribution['₹50,000–₹1,00,000']++;
        else if (budgetRange.includes('above')) budgetDistribution['Above ₹1,00,000']++;
        else budgetDistribution['Not decided']++;

        const interests: string[] = prefs.interests || [];
        interests.forEach((i) => {
          interestCounts[i] = (interestCounts[i] || 0) + 1;
        });

        recentProfiles.push({
          userId: u.id,
          fullName: u.fullName,
          email: u.email,
          onboardingStatus: status,
          groupType: group,
          typicalTravelers: prefs.typicalTravelers || 2,
          travelPace: prefs.travelPace || 'balanced',
          budgetTier: prefs.budgetTier || 'moderate',
          updatedAt: prefs.updatedAt,
        });
      } catch (err) {}
    }

    const sortedInterests = Object.entries(interestCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    const totalUsers = users.length;
    const completionRate = totalUsers > 0 ? Math.round((completedCount / totalUsers) * 100) : 0;

    return NextResponse.json({
      success: true,
      data: {
        totalRegisteredCustomers: totalUsers,
        completedProfilesCount: completedCount,
        skippedProfilesCount: skippedCount,
        incompleteProfilesCount: incompleteCount,
        completionRatePercentage: completionRate,
        groupDistribution,
        transportDistribution,
        bookingDistribution,
        accommodationDistribution,
        budgetDistribution,
        popularInterests: sortedInterests,
        recentCustomerProfiles: recentProfiles.slice(0, 15),
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch onboarding analytics.' },
      { status: 500 }
    );
  }
}
