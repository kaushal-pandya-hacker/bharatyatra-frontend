import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:4000');
const DEFAULT_MERCHANT_KEY = process.env.GATEWAY_DEFAULT_SECRET_KEY || 'sk_test_bharat_sim_secret_key_84918294819284';

export async function GET(req: NextRequest) {
  try {
    const apiKey = req.headers.get('x-api-key') || DEFAULT_MERCHANT_KEY;

    const res = await fetch(`${BACKEND_URL}/api/v1/gateway/merchants/profile`, {
      method: 'GET',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    const data = await res.json().catch(() => null);
    return NextResponse.json(data || { success: false, error: 'Bad gateway response' }, {
      status: res.status,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Gateway profile proxy failed' },
      { status: 502 },
    );
  }
}
