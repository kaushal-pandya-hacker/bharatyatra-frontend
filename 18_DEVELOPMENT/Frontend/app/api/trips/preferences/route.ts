import { NextRequest } from 'next/server';
import { GET as handleGet, POST as handlePost } from '@/app/api/v1/trips/preferences/route';

export async function GET(req: NextRequest) {
  return handleGet(req);
}

export async function POST(req: NextRequest) {
  return handlePost(req);
}
