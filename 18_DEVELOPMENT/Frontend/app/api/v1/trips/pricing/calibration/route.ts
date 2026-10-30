/**
 * BharatYatra AI 2.0 — Pricing Calibration & Accuracy Intelligence API
 * Endpoints for retrieving accuracy metrics (MAE, MdAPE, WAPE, Over/Under rates),
 * outlier observations, regional coverage, and managing calibration rules.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  globalPricingCalibrationEngine,
  CalibrationAdjustmentRule,
} from '@/lib/ai-planner/pricing-calibration-engine';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action') || 'evaluation';

    if (action === 'rules') {
      const activeRules = globalPricingCalibrationEngine.getActiveRules();
      const history = globalPricingCalibrationEngine.getRuleHistory();
      return NextResponse.json({
        success: true,
        data: { activeRules, history },
      });
    }

    if (action === 'outliers') {
      const outliers = globalPricingCalibrationEngine.detectStatisticalOutliers();
      return NextResponse.json({
        success: true,
        data: { outliers, count: outliers.length },
      });
    }

    // Default: full accuracy evaluation
    const evaluation = globalPricingCalibrationEngine.evaluateAccuracy();
    return NextResponse.json({
      success: true,
      data: evaluation,
    });
  } catch (err: any) {
    console.error('Error in Calibration GET API:', err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Failed to retrieve pricing calibration evaluation',
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, ruleId, approverName, proposedRule } = body;

    if (action === 'propose') {
      if (!proposedRule) {
        return NextResponse.json(
          { success: false, error: 'proposedRule payload is required' },
          { status: 400 }
        );
      }
      const newRule = globalPricingCalibrationEngine.proposeRule(proposedRule);
      return NextResponse.json({
        success: true,
        data: newRule,
      });
    }

    if (action === 'activate') {
      if (!ruleId || !approverName) {
        return NextResponse.json(
          { success: false, error: 'ruleId and approverName are required for activation' },
          { status: 400 }
        );
      }
      const ok = globalPricingCalibrationEngine.activateRule(ruleId, approverName);
      return NextResponse.json({
        success: ok,
        message: ok ? `Rule ${ruleId} activated successfully` : `Rule ${ruleId} not found`,
      });
    }

    if (action === 'rollback') {
      if (!ruleId) {
        return NextResponse.json(
          { success: false, error: 'ruleId is required for rollback' },
          { status: 400 }
        );
      }
      const ok = globalPricingCalibrationEngine.rollbackRule(ruleId);
      return NextResponse.json({
        success: ok,
        message: ok ? `Rule ${ruleId} rolled back successfully` : `Rule ${ruleId} not active`,
      });
    }

    return NextResponse.json(
      { success: false, error: `Invalid action: ${action}` },
      { status: 400 }
    );
  } catch (err: any) {
    console.error('Error in Calibration POST API:', err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Failed to process calibration request',
      },
      { status: 500 }
    );
  }
}
