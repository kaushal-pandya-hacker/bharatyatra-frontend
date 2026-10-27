import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';

export interface EvaluateRiskParams {
  orderId: string;
  merchantId: string;
  amountMinor: number;
  ipAddress?: string;
  customerEmail?: string;
  method: string;
  methodDetails?: any;
}

export interface RiskEvaluationResult {
  riskScore: number; // 0 (Safe) to 100 (Critical Fraud)
  action: 'ALLOW' | 'FLAG' | 'BLOCK';
  triggeredRules: string[];
  alertId?: string;
}

export interface FraudAlertRecord {
  id: string;
  orderId: string;
  merchantId: string;
  riskScore: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  ruleName: string;
  actionTaken: string;
  details: any;
  createdAt: string;
}

@Injectable()
export class GatewayFraudService {
  private readonly logger = new Logger(GatewayFraudService.name);
  private readonly ipAttempts = new Map<string, number[]>(); // IP -> timestamps
  private readonly alerts: FraudAlertRecord[] = [];

  // High Value Order Threshold: ₹1,00,000 = 10,000,000 paise
  private readonly HIGH_VALUE_THRESHOLD_PAISE = 10000000;
  private readonly VELOCITY_WINDOW_MS = 60 * 1000; // 1 minute
  private readonly MAX_VELOCITY_PER_MINUTE = 5;

  async evaluateTransactionRisk(params: EvaluateRiskParams): Promise<RiskEvaluationResult> {
    const triggeredRules: string[] = [];
    let riskScore = 0;
    const now = Date.now();

    // 1. IP Velocity Check
    if (params.ipAddress) {
      const timestamps = this.ipAttempts.get(params.ipAddress) || [];
      const recent = timestamps.filter(t => now - t < this.VELOCITY_WINDOW_MS);
      recent.push(now);
      this.ipAttempts.set(params.ipAddress, recent);

      if (recent.length > this.MAX_VELOCITY_PER_MINUTE) {
        triggeredRules.push('RULE_IP_VELOCITY_EXCEEDED');
        riskScore += 45;
      }
    }

    // 2. High-Value Order Anomaly
    if (params.amountMinor >= this.HIGH_VALUE_THRESHOLD_PAISE) {
      triggeredRules.push('RULE_HIGH_VALUE_ANOMALY');
      riskScore += 30;
    }

    // 3. Known Simulator Test Fraud Scenarios
    if (params.methodDetails?.simulatedScenario === 'FRAUD_BLOCKED') {
      triggeredRules.push('RULE_SIMULATED_KNOWN_FRAUD_TRIGGER');
      riskScore += 95;
    }

    // 4. Temporary Email Domain Heuristic
    if (params.customerEmail && (params.customerEmail.includes('tempmail') || params.customerEmail.includes('10minutemail'))) {
      triggeredRules.push('RULE_DISPOSABLE_EMAIL_DETECTED');
      riskScore += 25;
    }

    // Cap risk score between 0 and 100
    riskScore = Math.min(100, Math.max(0, riskScore));

    let action: 'ALLOW' | 'FLAG' | 'BLOCK' = 'ALLOW';
    if (riskScore >= 75) {
      action = 'BLOCK';
    } else if (riskScore >= 40) {
      action = 'FLAG';
    }

    let alertId: string | undefined;
    if (action === 'BLOCK' || action === 'FLAG') {
      alertId = `frd_${crypto.randomBytes(8).toString('hex')}`;
      const alert: FraudAlertRecord = {
        id: alertId,
        orderId: params.orderId,
        merchantId: params.merchantId,
        riskScore,
        severity: riskScore >= 75 ? 'CRITICAL' : 'MEDIUM',
        ruleName: triggeredRules.join(', '),
        actionTaken: action,
        details: {
          amountMinor: params.amountMinor,
          ipAddress: params.ipAddress,
          customerEmail: params.customerEmail,
        },
        createdAt: new Date().toISOString(),
      };
      this.alerts.push(alert);
      this.logger.warn(
        `[FRAUD MONITOR] Alert ${alertId} generated for Order ${params.orderId} (Score: ${riskScore}, Action: ${action}, Rules: ${triggeredRules.join(', ')})`,
      );
    }

    return {
      riskScore,
      action,
      triggeredRules,
      alertId,
    };
  }

  getAlerts(merchantId?: string): FraudAlertRecord[] {
    if (merchantId) {
      return this.alerts.filter(a => a.merchantId === merchantId);
    }
    return this.alerts;
  }
}
