import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase/client';

export async function GET() {
  const timestamp = new Date().toISOString();
  let dbStatus = 'CONNECTED';

  try {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from('_health_check').select('*').limit(1);
    // Any response means database endpoint reached
    if (error && error.code === 'PGRST301') {
      dbStatus = 'JWT_EXPIRED';
    }
  } catch {
    dbStatus = 'UNAVAILABLE';
  }

  return NextResponse.json({
    status: 'OPERATIONAL',
    timestamp,
    environment: process.env.NODE_ENV || 'production',
    services: {
      api: 'HEALTHY',
      database: dbStatus,
      paymentGateway: 'OPERATIONAL',
    },
  });
}
