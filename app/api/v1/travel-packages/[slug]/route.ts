import { NextRequest, NextResponse } from 'next/server';
import { partnerService, DatabaseTableMissingError } from '@/lib/partners/partner-service';
import { ALL_INDIA_PACKAGES } from '@/data/india-packages.data';

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;

    // Check partner packages with publication enforcement
    try {
      const partnerPkg = await partnerService.getPackageBySlug(slug, true);
      if (partnerPkg) {
        return NextResponse.json({
          success: true,
          data: partnerPkg,
        });
      }
    } catch (e: any) {
      if (!(e instanceof DatabaseTableMissingError)) {
        throw e;
      }
    }

    // Check master packages
    const catalogPkg = ALL_INDIA_PACKAGES.find(
      (p) => p.slug === slug || (p as any).id === slug
    );

    if (catalogPkg) {
      return NextResponse.json({
        success: true,
        data: catalogPkg,
      });
    }

    return NextResponse.json(
      { success: false, message: `Package with slug '${slug}' not found or not published.` },
      { status: 404 }
    );
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
