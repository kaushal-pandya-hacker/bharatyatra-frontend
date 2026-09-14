import { Injectable, Logger } from '@nestjs/common';

export type BetaUserGroup = 'INTERNAL_TEAM' | 'TRUSTED_TESTERS' | 'BETA_USERS' | 'EXPANDED_BETA' | 'PUBLIC';

export interface FeatureFlagConfig {
  flagKey: string;
  name: string;
  description: string;
  enabled: boolean;
  rolloutPercentage: number; // 0, 5, 10, 25, 50, 100
  targetGroups: BetaUserGroup[];
}

@Injectable()
export class FeatureFlagsService {
  private readonly logger = new Logger(FeatureFlagsService.name);

  // In-memory Feature Flag Registry with safe defaults
  private readonly flags: Map<string, FeatureFlagConfig> = new Map();

  constructor() {
    this.registerDefaultFlags();
    this.logger.log('Feature Flags Service Initialized');
  }

  getFlags(): FeatureFlagConfig[] {
    return Array.from(this.flags.values());
  }

  getFlag(flagKey: string): FeatureFlagConfig | undefined {
    return this.flags.get(flagKey);
  }

  updateFlag(flagKey: string, updates: Partial<FeatureFlagConfig>): FeatureFlagConfig {
    const flag = this.flags.get(flagKey);
    if (!flag) {
      throw new Error(`Feature flag ${flagKey} not found`);
    }
    const updated = { ...flag, ...updates };
    this.flags.set(flagKey, updated);
    this.logger.log(`Updated Feature Flag ${flagKey}: enabled=${updated.enabled}, rollout=${updated.rolloutPercentage}%`);
    return updated;
  }

  isFeatureEnabled(flagKey: string, userId?: string, userGroup: BetaUserGroup = 'PUBLIC'): boolean {
    const flag = this.flags.get(flagKey);
    if (!flag) return false;

    // Kill-switch check
    if (!flag.enabled) return false;

    // Target group check
    if (flag.targetGroups.length > 0 && !flag.targetGroups.includes(userGroup) && !flag.targetGroups.includes('PUBLIC')) {
      return false;
    }

    // Rollout percentage check
    if (flag.rolloutPercentage >= 100) return true;
    if (flag.rolloutPercentage <= 0) return false;

    if (userId) {
      // Deterministic hash based rollout allocation
      const hash = this.simpleHash(`${userId}_${flagKey}`);
      return (hash % 100) < flag.rolloutPercentage;
    }

    return true;
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }

  private registerDefaultFlags() {
    const defaultFlags: FeatureFlagConfig[] = [
      {
        flagKey: 'ai_trip_planner',
        name: 'AI Trip Planner Engine',
        description: 'Generates complete multi-day itineraries using Python FastAPI microservice',
        enabled: true,
        rolloutPercentage: 100,
        targetGroups: ['INTERNAL_TEAM', 'TRUSTED_TESTERS', 'BETA_USERS', 'EXPANDED_BETA', 'PUBLIC'],
      },
      {
        flagKey: 'adaptive_ai',
        name: 'Adaptive AI Real-Time Trip Orchestration',
        description: 'Monitors weather/traffic alerts and generates non-cost alternative proposals',
        enabled: true,
        rolloutPercentage: 100,
        targetGroups: ['INTERNAL_TEAM', 'TRUSTED_TESTERS', 'BETA_USERS', 'EXPANDED_BETA', 'PUBLIC'],
      },
      {
        flagKey: 'hotel_booking',
        name: 'Hotel Accommodation Booking',
        description: 'Live availability and room reservation checkout',
        enabled: true,
        rolloutPercentage: 100,
        targetGroups: ['INTERNAL_TEAM', 'TRUSTED_TESTERS', 'BETA_USERS', 'EXPANDED_BETA', 'PUBLIC'],
      },
      {
        flagKey: 'bus_booking',
        name: 'GSRTC & Private Bus Booking',
        description: 'Express bus seat selection and ticketing',
        enabled: true,
        rolloutPercentage: 100,
        targetGroups: ['INTERNAL_TEAM', 'TRUSTED_TESTERS', 'BETA_USERS', 'EXPANDED_BETA', 'PUBLIC'],
      },
      {
        flagKey: 'activity_booking',
        name: 'Activity & Permit Booking',
        description: 'Gir Safari and attraction slot reservation',
        enabled: true,
        rolloutPercentage: 50,
        targetGroups: ['INTERNAL_TEAM', 'TRUSTED_TESTERS', 'BETA_USERS'],
      },
      {
        flagKey: 'packages',
        name: 'Curated Travel Packages',
        description: 'Bundled hotel + transport + activity packages',
        enabled: true,
        rolloutPercentage: 50,
        targetGroups: ['INTERNAL_TEAM', 'TRUSTED_TESTERS', 'BETA_USERS'],
      },
      {
        flagKey: 'whatsapp_notifications',
        name: 'WhatsApp Business Notifications',
        description: 'Sends vouchers and itinerary updates via Meta Business API',
        enabled: true,
        rolloutPercentage: 100,
        targetGroups: ['INTERNAL_TEAM', 'TRUSTED_TESTERS', 'BETA_USERS', 'EXPANDED_BETA', 'PUBLIC'],
      },
      {
        flagKey: 'auto_adaptation',
        name: 'Autonomous Adaptation (Costless Only)',
        description: 'Auto-applies zero-cost itinerary updates without requiring click',
        enabled: false, // Default DISABLED for safety during beta
        rolloutPercentage: 0,
        targetGroups: ['INTERNAL_TEAM'],
      },
    ];

    for (const flag of defaultFlags) {
      this.flags.set(flag.flagKey, flag);
    }
  }
}
