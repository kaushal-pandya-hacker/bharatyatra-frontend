import { NextRequest, NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/auth/server-auth';
import { adminDataStore } from '@/lib/admin/admin-store';
import { partnerService } from '@/lib/partners/partner-service';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdminUser(req);
    if (auth.response) return auth.response;

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || undefined;
    const verificationStatus = searchParams.get('verificationStatus') || undefined;
    const status = searchParams.get('status') || undefined;

    let data = adminDataStore.getSuppliers({ search, verificationStatus, status });

    if (data.length === 0) {
      try {
        const agencies = await partnerService.getAgencies();
        if (agencies && Array.isArray(agencies) && agencies.length > 0) {
          data = agencies.map((a) => ({
            id: a.id,
            businessName: a.businessName,
            businessType: a.businessType || 'AGENCY',
            email: a.businessEmail,
            phone: a.contactPhone,
            city: a.city,
            totalInventoryCount: 0,
            verificationStatus: a.verificationStatus === 'APPROVED' ? 'VERIFIED' : (a.verificationStatus as any),
            status: a.verificationStatus === 'SUSPENDED' ? 'SUSPENDED' : 'ACTIVE',
            createdAt: a.createdAt,
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
      { success: false, message: err?.message || 'Failed to fetch suppliers.' },
      { status: 500 }
    );
  }
}

