/**
 * BharatYatra AI 2.0 — Recommendation Feedback & Personalization API (v1)
 * REST endpoint for recording LIKE, DISLIKE, SAVE, NOT_INTERESTED, ALREADY_VISITED actions
 * and resetting learned user personalization signals.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  travelRecommendationEngine,
  FeedbackEvent,
} from '@/lib/ai-planner/travel-recommendation-engine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, userId } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameter: userId.' },
        { status: 400 }
      );
    }

    // Reset personalization action
    if (action === 'RESET' || action === 'RESET_PERSONALIZATION') {
      const resetProfile = travelRecommendationEngine.resetPersonalization(userId);
      return NextResponse.json(
        {
          success: true,
          message: 'Learned personalization signals successfully reset to explicit defaults.',
          data: resetProfile,
        },
        { status: 200 }
      );
    }

    // Record feedback event
    const event: FeedbackEvent = {
      eventId: body.eventId || `fb_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      userId,
      itemType: body.itemType || 'destination',
      itemId: body.itemId,
      action: body.action || 'LIKE',
      timestamp: body.timestamp || new Date().toISOString(),
      context: body.context,
    };

    if (!event.itemId) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameter: itemId.' },
        { status: 400 }
      );
    }

    const updatedProfile = travelRecommendationEngine.recordFeedback(event);

    return NextResponse.json(
      {
        success: true,
        message: `Feedback recorded: ${event.action} for ${event.itemId}.`,
        data: updatedProfile,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to process feedback event.',
      },
      { status: 500 }
    );
  }
}

