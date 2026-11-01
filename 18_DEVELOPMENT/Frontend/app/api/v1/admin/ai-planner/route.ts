import { NextRequest, NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/auth/server-auth';
import { adminDataStore } from '@/lib/admin/admin-store';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdminUser(req);
    if (auth.response) return auth.response;

    const config = adminDataStore.getAiConfig();

    return NextResponse.json({
      success: true,
      data: config,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Failed to fetch AI configuration.' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await requireAdminUser(req);
    if (auth.response) return auth.response;

    const body = await req.json();
    const { action, rules } = body;

    if (action === 'REINDEX') {
      const kb = adminDataStore.reindexAiKnowledgeBase(auth.user.email);
      return NextResponse.json({
        success: true,
        message: 'AI Knowledge Base reindexed successfully.',
        data: kb,
      });
    }

    if (rules) {
      const updated = adminDataStore.updateAiRules(rules, auth.user.email);
      return NextResponse.json({
        success: true,
        message: 'AI Planner recommendation & pricing rules updated.',
        data: updated,
      });
    }

    return NextResponse.json({ success: false, message: 'Invalid action or missing rules payload.' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Failed to update AI configuration.' },
      { status: 500 }
    );
  }
}

