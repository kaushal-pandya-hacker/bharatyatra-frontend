import { Injectable, Logger } from '@nestjs/common';

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

@Injectable()
export class CircuitBreakerService {
  private readonly logger = new Logger(CircuitBreakerService.name);
  private failureCounts: Map<string, number> = new Map();
  private circuitStates: Map<string, CircuitState> = new Map();
  private lastFailureTimes: Map<string, number> = new Map();

  private readonly failureThreshold = 5;
  private readonly resetTimeoutMs = 30000; // 30 seconds

  getState(providerId: string): CircuitState {
    const state = this.circuitStates.get(providerId) || 'CLOSED';
    const lastFailure = this.lastFailureTimes.get(providerId) || 0;

    if (state === 'OPEN' && Date.now() - lastFailure > this.resetTimeoutMs) {
      this.logger.log(`[Circuit Breaker] Reset timeout passed for '${providerId}'. Transitioning OPEN -> HALF_OPEN`);
      this.circuitStates.set(providerId, 'HALF_OPEN');
      return 'HALF_OPEN';
    }

    return state;
  }

  recordSuccess(providerId: string) {
    this.failureCounts.set(providerId, 0);
    this.circuitStates.set(providerId, 'CLOSED');
  }

  recordFailure(providerId: string) {
    const current = (this.failureCounts.get(providerId) || 0) + 1;
    this.failureCounts.set(providerId, current);
    this.lastFailureTimes.set(providerId, Date.now());

    if (current >= this.failureThreshold) {
      this.logger.warn(`[Circuit Breaker OPENED] Provider '${providerId}' failed ${current} consecutive times.`);
      this.circuitStates.set(providerId, 'OPEN');
    }
  }

  canExecute(providerId: string): boolean {
    const state = this.getState(providerId);
    return state !== 'OPEN';
  }
}
