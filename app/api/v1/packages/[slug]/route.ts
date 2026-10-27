import { NextRequest, NextResponse } from 'next/server';
import { GET as handleGet } from '@/app/api/v1/travel-packages/[slug]/route';

export async function GET(
  req: NextRequest,
  context: { params: { slug: string } }
) {
  return handleGet(req, context);
}
