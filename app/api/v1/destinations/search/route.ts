/**
 * BharatYatra — Smart Destination Search & Contribution Discovery API
 * GET /api/v1/destinations/search?q=...&category=...&state=...
 *
 * Implements Phase 1 & Phase 4:
 * 1. Searches approved destinations (Curated Catalog + Published Community Places).
 * 2. Searches destinations submitted by the authenticated user (Pending / Under Review / Changes Requested).
 * 3. Never leaks unapproved destinations across users (Enforced server-side).
 * 4. Detects exact match to prevent duplicate submissions.
 * 5. Returns `canContribute: true` and `exactMatchFound: false` when a place is missing.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAllStateFolderItems } from '@/lib/tourism/state-folder-loader';
import { destinationPublishingEngine } from '@/lib/contributions/publishing-engine';
import { contributionService } from '@/lib/contributions/contribution-service';
import { requireServerUser } from '@/lib/auth/server-auth';

export const dynamic = 'force-dynamic';

export interface SearchDestinationResult {
  id: string;
  name: string;
  displayName: string;
  slug: string;
  state: string;
  city?: string;
  location: string;
  category: string;
  imageUrl: string;
  status: 'APPROVED' | 'PENDING' | 'UNDER_REVIEW' | 'CHANGES_REQUESTED' | 'REJECTED';
  isPersonalPending: boolean;
  canUseInPlan: boolean;
  contributorId?: string;
  contributorName?: string;
  latitude?: number;
  longitude?: number;
  shortDescription?: string;
  bestTimeToVisit?: string;
  estimatedVisitDuration?: string;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get('q') || searchParams.get('query') || '').trim();
    const categoryFilter = searchParams.get('category')?.trim() || 'ALL';
    const stateFilter = searchParams.get('state')?.trim() || 'ALL';

    // 1. Resolve Authenticated User (Optional for search, but required for personal pending lookup)
    let authenticatedUserId: string | null = null;
    let authenticatedUser: any = null;
    try {
      const auth = await requireServerUser(req);
      if (!auth.response && auth.user) {
        authenticatedUserId = auth.user.id;
        authenticatedUser = auth.user;
      }
    } catch {
      // Unauthenticated search is permitted (public catalog only)
    }

    const queryLower = q.toLowerCase();
    const queryNormalized = queryLower.replace(/[^\w\s]/g, '').trim();

    // 2. Aggregate Approved Public Catalog
    const approvedResults: SearchDestinationResult[] = [];
    const seenNames = new Set<string>();

    // 2a. Curated Knowledge Base States & Places
    const stateItems = getAllStateFolderItems();
    for (const st of stateItems) {
      if (stateFilter !== 'ALL' && st.name.toLowerCase() !== stateFilter.toLowerCase()) {
        continue;
      }
      for (const p of st.places) {
        const pName = p.name || p.displayName || '';
        const pDisplayName = p.displayName || pName;
        const matchesQuery =
          !q ||
          pName.toLowerCase().includes(queryLower) ||
          pDisplayName.toLowerCase().includes(queryLower) ||
          (p.stateName && p.stateName.toLowerCase().includes(queryLower)) ||
          (p.city && p.city.toLowerCase().includes(queryLower)) ||
          (p.district && p.district.toLowerCase().includes(queryLower)) ||
          (p.category && p.category.toLowerCase().includes(queryLower));

        const matchesCategory =
          categoryFilter === 'ALL' ||
          (p.category && p.category.toLowerCase().includes(categoryFilter.toLowerCase()));

        if (matchesQuery && matchesCategory) {
          seenNames.add(pName.toLowerCase().trim());
          approvedResults.push({
            id: `${st.slug}-${p.slug}`,
            name: p.name,
            displayName: p.displayName || p.name,
            slug: p.slug,
            state: p.stateName,
            city: p.city || p.district,
            location: p.location || p.district || p.city || p.stateName,
            category: p.category || 'Historical Place',
            imageUrl: p.imageUrl || '/places/aina-mahal.jpg',
            status: 'APPROVED',
            isPersonalPending: false,
            canUseInPlan: true,
          });
        }
      }
    }

    // 2b. Published Community Destinations
    const publishedCommunity = destinationPublishingEngine.getAllPublishedDestinations();
    for (const pub of publishedCommunity) {
      if (seenNames.has(pub.name.toLowerCase().trim())) continue;
      if (stateFilter !== 'ALL' && pub.state.toLowerCase() !== stateFilter.toLowerCase()) continue;
      if (categoryFilter !== 'ALL' && pub.category.toLowerCase() !== categoryFilter.toLowerCase()) continue;

      const matchesQuery =
        !q ||
        pub.name.toLowerCase().includes(queryLower) ||
        pub.state.toLowerCase().includes(queryLower) ||
        (pub.city && pub.city.toLowerCase().includes(queryLower)) ||
        (pub.category && pub.category.toLowerCase().includes(queryLower));

      if (matchesQuery) {
        seenNames.add(pub.name.toLowerCase().trim());
        approvedResults.push({
          id: pub.id,
          name: pub.name,
          displayName: pub.name,
          slug: pub.slug,
          state: pub.state,
          city: pub.city,
          location: `${pub.city ? pub.city + ', ' : ''}${pub.state}`,
          category: pub.category,
          imageUrl: pub.primaryImageUrl || (pub.images && pub.images[0]) || '/places/aina-mahal.jpg',
          status: 'APPROVED',
          isPersonalPending: false,
          canUseInPlan: true,
          latitude: pub.latitude,
          longitude: pub.longitude,
          shortDescription: pub.shortDescription,
          bestTimeToVisit: pub.bestTimeToVisit,
          estimatedVisitDuration: pub.estimatedVisitDuration,
        });
      }
    }

    // 3. User's Personal Pending Destinations (Phase 4 Security Rule)
    const personalResults: SearchDestinationResult[] = [];
    if (authenticatedUserId) {
      const userSubmissions = await contributionService.getUserContributions(authenticatedUserId);
      for (const sub of userSubmissions) {
        // Only include if NOT already approved globally (approved is in approvedResults)
        if (sub.status === 'APPROVED') continue;

        const subNameLower = sub.placeName.toLowerCase().trim();
        const matchesQuery =
          !q ||
          subNameLower.includes(queryLower) ||
          sub.state.toLowerCase().includes(queryLower) ||
          (sub.city && sub.city.toLowerCase().includes(queryLower)) ||
          sub.category.toLowerCase().includes(queryLower);

        const matchesCategory =
          categoryFilter === 'ALL' || sub.category.toLowerCase().includes(categoryFilter.toLowerCase());

        const matchesState =
          stateFilter === 'ALL' || sub.state.toLowerCase() === stateFilter.toLowerCase();

        if (matchesQuery && matchesCategory && matchesState) {
          personalResults.push({
            id: sub.id,
            name: sub.placeName,
            displayName: `${sub.placeName} (Your Submission)`,
            slug: sub.placeName.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-'),
            state: sub.state,
            city: sub.city,
            location: `${sub.city ? sub.city + ', ' : ''}${sub.state}`,
            category: sub.category,
            imageUrl: (sub.photos && sub.photos[0]) || '/places/aina-mahal.jpg',
            status: sub.status as any,
            isPersonalPending: true,
            canUseInPlan: true,
            contributorId: sub.contributorId,
            contributorName: sub.contributorName,
            latitude: sub.latitude,
            longitude: sub.longitude,
            shortDescription: sub.shortDescription,
            bestTimeToVisit: sub.bestTimeToVisit,
            estimatedVisitDuration: sub.estimatedVisitDuration,
          });
        }
      }
    }

    // 4. Combine results: Personal pending places for this user appear first, followed by approved places
    const combinedResults = [...personalResults, ...approvedResults];

    // 5. Check Exact Match
    let exactMatchFound = false;
    if (q) {
      exactMatchFound = combinedResults.some(
        (r) =>
          r.name.toLowerCase().trim() === queryLower ||
          r.name.toLowerCase().replace(/[^\w\s]/g, '').trim() === queryNormalized
      );
    }

    const canContribute = Boolean(q && !exactMatchFound && q.length >= 2);

    return NextResponse.json(
      {
        success: true,
        query: q,
        total: combinedResults.length,
        exactMatchFound,
        canContribute,
        results: combinedResults.slice(0, 50),
        personalCount: personalResults.length,
        approvedCount: approvedResults.length,
      },
      {
        status: 200,
        headers: authenticatedUserId
          ? { 'Cache-Control': 'private, no-store' }
          : { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' },
      }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err?.message || 'Failed to search destinations.',
        results: [],
        exactMatchFound: false,
        canContribute: false,
      },
      { status: 500 }
    );
  }
}
