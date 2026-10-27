import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

export interface HBXAuthHeaders {
  'Api-key': string;
  'X-Signature': string;
  'Accept': string;
  'Content-Type': string;
  'Accept-Encoding': string;
}

@Injectable()
export class HotelbedsClientService {
  private readonly logger = new Logger(HotelbedsClientService.name);

  constructor(private readonly configService: ConfigService) {}

  /**
   * Generates official Hotelbeds (HBX Group) authentication headers.
   * SHA256 Signature = SHA256(apiKey + apiSecret + timestampInSeconds)
   */
  public getAuthHeaders(overrideKey?: string, overrideSecret?: string): HBXAuthHeaders {
    const apiKey = overrideKey || this.configService.get<string>('HBX_API_KEY') || process.env.HBX_API_KEY || '7b6104baaa08b6bb38a84ff5f006323c';
    const apiSecret = overrideSecret || this.configService.get<string>('HBX_API_SECRET') || process.env.HBX_API_SECRET || 'apVQNw8hvS';

    if (!apiKey || !apiSecret) {
      this.logger.error('[SECURITY ALERT] Hotelbeds API credentials (HBX_API_KEY / HBX_API_SECRET) missing in backend configuration.');
      throw new HttpException('Hotelbeds provider credentials not configured', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const dataToHash = apiKey + apiSecret + timestamp;
    const signature = crypto.createHash('sha256').update(dataToHash).digest('hex');

    return {
      'Api-key': apiKey,
      'X-Signature': signature,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Accept-Encoding': 'gzip',
    };
  }

  public getBaseUrl(): string {
    return this.configService.get<string>('HBX_BASE_URL') || process.env.HBX_BASE_URL || 'https://api.test.hotelbeds.com';
  }

  /**
   * Execute an authenticated HTTP request to Hotelbeds API with timeout, retry, and sanitized error handling.
   */
  public async request<T = any>(
    path: string,
    method: 'GET' | 'POST' | 'DELETE' = 'GET',
    body?: any,
    timeoutMs = 8000,
    retries = 1,
  ): Promise<{ data: T; status: number }> {
    const baseUrl = this.getBaseUrl();
    const url = `${baseUrl}${path.startsWith('/') ? path : '/' + path}`;

    // Sanitized log output
    const safeKeyPrefix = (process.env.HBX_API_KEY || '7b61').substring(0, 4);
    this.logger.log(`[Hotelbeds Request] ${method} ${url} | Key: ${safeKeyPrefix}*** | Timeout: ${timeoutMs}ms`);

    let lastError: Error | null = null;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const headers = this.getAuthHeaders();
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);

        const response = await fetch(url, {
          method,
          headers: headers as any,
          body: body ? JSON.stringify(body) : undefined,
          signal: controller.signal,
        });

        clearTimeout(timer);

        const textResponse = await response.text();
        let parsedData: any = {};
        try {
          parsedData = textResponse ? JSON.parse(textResponse) : {};
        } catch {
          parsedData = { raw: textResponse };
        }

        if (response.ok) {
          return { data: parsedData as T, status: response.status };
        }

        // Handle Hotelbeds API Error response without exposing secrets
        const errMessage = parsedData?.error?.message || parsedData?.message || textResponse.substring(0, 200);
        this.logger.warn(`[Hotelbeds API Error] ${method} ${url} -> HTTP ${response.status}: ${errMessage}`);

        if (response.status >= 500 && attempt < retries) {
          this.logger.log(`[Hotelbeds Retry] Retrying request (Attempt ${attempt + 2}/${retries + 1})...`);
          await new Promise((res) => setTimeout(res, 500 * (attempt + 1)));
          continue;
        }

        return { data: parsedData as T, status: response.status };
      } catch (err: any) {
        const isAbort = err?.name === 'AbortError';
        lastError = isAbort
          ? new Error(`Hotelbeds API timeout after ${timeoutMs}ms`)
          : new Error(`Hotelbeds network error: ${err?.message || err}`);

        if (attempt < retries && !isAbort) {
          this.logger.log(`[Hotelbeds Retry] Network failure, retrying (Attempt ${attempt + 2}/${retries + 1})...`);
          await new Promise((res) => setTimeout(res, 500 * (attempt + 1)));
          continue;
        }
      }
    }

    throw lastError || new Error('Hotelbeds API request failed');
  }
}
