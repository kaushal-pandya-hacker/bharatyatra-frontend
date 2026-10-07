import { NextRequest, NextResponse } from 'next/server';
import { POST as handlePlanPost } from '@/app/api/v1/trips/plan/route';

export async function POST(req: NextRequest) {
  return handlePlanPost(req);
}
