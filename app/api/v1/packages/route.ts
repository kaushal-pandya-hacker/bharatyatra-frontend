import { NextRequest, NextResponse } from 'next/server';
import { GET as handleGet } from '@/app/api/v1/travel-packages/route';

export async function GET(req: NextRequest) {
  return handleGet(req);
}
