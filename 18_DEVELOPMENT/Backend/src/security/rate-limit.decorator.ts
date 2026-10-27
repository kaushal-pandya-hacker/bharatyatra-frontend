import { SetMetadata } from '@nestjs/common';

export interface RateLimitOptions {
  points: number;       // Maximum allowed requests in the time window
  duration: number;     // Window duration in seconds
  keyPrefix?: string;   // Optional custom prefix for tracking
  byAccount?: boolean;  // Also track by account identifier (email/phone)
  skipIfAuthorized?: boolean; // Skip rate limiting for verified internal service tokens
}

export const RATE_LIMIT_METADATA_KEY = 'RATE_LIMIT_METADATA_KEY';
export const RateLimit = (options: RateLimitOptions) => SetMetadata(RATE_LIMIT_METADATA_KEY, options);
