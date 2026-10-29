import { NextRequest, NextResponse } from 'next/server';
import { partnerService, DatabaseTableMissingError } from '@/lib/partners/partner-service';
import { ALL_INDIA_PACKAGES } from '@/data/india-packages.data';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const state = searchParams.get('state') || undefined;
    const category = searchParams.get('category') || undefined;

    // Public query rule: Only return packages that are approved & published by active approved agencies
    let partnerPackages: any[] = [];
    try {
      partnerPackages = await partnerService.getPackages({
        onlyPublic: true,
        state,
        category,
      });
    } catch (e: any) {
      if (e instanceof DatabaseTableMissingError) {
        console.warn('[travel-packages API] Note: Partner database table pending migration, serving catalog packages.');
      } else {
        throw e;
      }
    }

    // Merge with master catalog
    const merged = [...partnerPackages, ...ALL_INDIA_PACKAGES];

    return NextResponse.json(
      {
        success: true,
        count: merged.length,
        data: merged,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
