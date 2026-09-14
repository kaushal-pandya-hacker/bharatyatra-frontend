import { Injectable, Logger, BadRequestException } from '@nestjs/common';

export enum ExperimentDecision {
  SHIP = 'SHIP',
  ITERATE = 'ITERATE',
  ROLLBACK = 'ROLLBACK',
  STOP = 'STOP',
}

export interface Experiment {
  id: string;
  name: string;
  hypothesis: string;
  controlDescription: string;
  variantDescription: string;
  targetAudience: string;
  primaryMetric: string;
  secondaryMetrics: string[];
  guardrailMetrics: string[];
  durationDays: number;
  decisionCriteria: string;
  rollbackCondition: string;
  status: 'ACTIVE' | 'CONCLUDED' | 'ROLLED_BACK';
  decision?: ExperimentDecision;
  variantAssignmentHash: string;
}

export interface ExperimentAssignment {
  userId: string;
  experimentId: string;
  variant: 'CONTROL' | 'VARIANT_A' | 'VARIANT_B';
  assignedAt: string;
}

@Injectable()
export class ExperimentsService {
  private readonly logger = new Logger(ExperimentsService.name);
  private experiments: Map<string, Experiment> = new Map();
  private assignments: Map<string, ExperimentAssignment> = new Map();

  constructor() {
    this.seedInitialExperiments();
  }

  private seedInitialExperiments() {
    const defaultExperiments: Experiment[] = [
      {
        id: 'exp-001',
        name: 'AI Trip Planner - 1-Click Gujarat Itinerary Accept',
        hypothesis: 'Adding a prominent 1-click itinerary accept CTA increases checkout progression by 15%',
        controlDescription: 'Standard 2-step accept and customize modal',
        variantDescription: 'Sticky 1-click Instant Book CTA with auto-selected top Gujarati hotel & bus options',
        targetAudience: 'Gujarat Hub Visitors',
        primaryMetric: 'AI_ITINERARY_ACCEPTED to CHECKOUT_STARTED Conversion Rate',
        secondaryMetrics: ['Time to Checkout', 'My Trip Saves'],
        guardrailMetrics: ['Zero payment tampering', 'Booking cancellation rate < 2%'],
        durationDays: 14,
        decisionCriteria: 'Primary metric increases by >= 10% with 95% statistical significance',
        rollbackCondition: 'Booking error rate increases by > 0.5%',
        status: 'CONCLUDED',
        decision: ExperimentDecision.SHIP,
        variantAssignmentHash: 'hash-exp-001',
      },
      {
        id: 'exp-002',
        name: 'Adaptive AI - Weather Delay Alternative Toast UI',
        hypothesis: 'Displaying real-time weather disruption alternatives as interactive sticky toasts increases adaptation approval rate to > 85%',
        controlDescription: 'Standard push notification + email alert',
        variantDescription: 'In-app interactive glassmorphic toast with instant 1-tap rebooking',
        targetAudience: 'Active Trip Travellers in Kutch & Diu',
        primaryMetric: 'ADAPTATION_ACCEPTED Rate',
        secondaryMetrics: ['User Satisfaction Score (CSAT)'],
        guardrailMetrics: ['Zero unauthorized financial charges'],
        durationDays: 21,
        decisionCriteria: 'Adaptation approval rate >= 85%',
        rollbackCondition: 'User complaint ticket rate > 1%',
        status: 'ACTIVE',
        variantAssignmentHash: 'hash-exp-002',
      },
    ];

    for (const exp of defaultExperiments) {
      this.experiments.set(exp.id, exp);
    }
  }

  public registerExperiment(exp: Experiment): Experiment {
    if (this.experiments.has(exp.id)) {
      throw new BadRequestException(`Experiment with ID ${exp.id} already exists`);
    }
    this.experiments.set(exp.id, exp);
    this.logger.log(`Registered experiment: ${exp.name} (${exp.id})`);
    return exp;
  }

  public getExperiment(id: string): Experiment {
    const exp = this.experiments.get(id);
    if (!exp) {
      throw new BadRequestException(`Experiment ${id} not found`);
    }
    return exp;
  }

  public listExperiments(): Experiment[] {
    return Array.from(this.experiments.values());
  }

  public assignUserVariant(userId: string, experimentId: string): ExperimentAssignment {
    const exp = this.getExperiment(experimentId);
    const key = `${userId}:${experimentId}`;
    if (this.assignments.has(key)) {
      return this.assignments.get(key)!;
    }

    // Deterministic hash based assignment
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = (hash << 5) - hash + userId.charCodeAt(i);
      hash |= 0;
    }
    const variant: 'CONTROL' | 'VARIANT_A' = Math.abs(hash) % 2 === 0 ? 'CONTROL' : 'VARIANT_A';

    const assignment: ExperimentAssignment = {
      userId,
      experimentId,
      variant,
      assignedAt: new Date().toISOString(),
    };
    this.assignments.set(key, assignment);
    return assignment;
  }

  public concludeExperiment(id: string, decision: ExperimentDecision): Experiment {
    const exp = this.getExperiment(id);
    exp.status = decision === ExperimentDecision.ROLLBACK ? 'ROLLED_BACK' : 'CONCLUDED';
    exp.decision = decision;
    this.experiments.set(id, exp);
    this.logger.log(`Concluded experiment ${id} with decision: ${decision}`);
    return exp;
  }
}
