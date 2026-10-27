import { NextRequest, NextResponse } from 'next/server';
import { GatewayClient } from '@/lib/gateway/gateway-client';

export async function GET(request: NextRequest) {
  try {
    const status = await GatewayClient.getObservabilityStatus();
    return NextResponse.json({ success: true, data: status });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch observability status' },
      { status: 500 },
    );
  }
}
