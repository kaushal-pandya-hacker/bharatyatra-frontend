import { NextRequest, NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/auth/server-auth';
import { adminDataStore } from '@/lib/admin/admin-store';
import { partnerService } from '@/lib/partners/partner-service';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdminUser(req);
    if (auth.response) return auth.response;

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || undefined;
    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || undefined;

    let data = adminDataStore.getInventory({ type, status, search });

    if (data.length === 0) {
      try {
        const pkgs = await partnerService.getPackages();
        if (pkgs && Array.isArray(pkgs) && pkgs.length > 0) {
          data = pkgs.map((p) => ({
            id: p.id,
            name: p.title,
            type: 'PACKAGE' as const,
            supplierId: p.agencyId,
            supplierName: p.agencyName || 'Registered Partner',
            destination: p.destinations?.join(', ') || p.stateOrRegion || 'India',
            price: p.basePrice || 0,
            status: p.publicationStatus === 'PUBLISHED' ? 'ACTIVE' : 'INACTIVE',
            createdAt: p.createdAt,
          }));
        }
      } catch {
        // Table missing or empty -> remains genuine []
      }
    }

    return NextResponse.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Failed to fetch inventory.' },
      { status: 500 }
    );
  }
}

