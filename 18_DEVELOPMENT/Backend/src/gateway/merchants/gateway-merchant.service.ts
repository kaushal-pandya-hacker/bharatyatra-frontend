import { Injectable, Logger, NotFoundException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';

export interface CreateMerchantDto {
  businessName: string;
  legalEntityName: string;
  contactEmail: string;
  contactPhone: string;
  websiteUrl?: string;
  gstin?: string;
  panNumber?: string;
}

export interface MerchantRecord {
  id: string;
  merchantCode: string;
  businessName: string;
  legalEntityName: string;
  contactEmail: string;
  contactPhone: string;
  websiteUrl?: string;
  gstin?: string;
  panNumber?: string;
  kycStatus: 'APPROVED' | 'PENDING' | 'REJECTED';
  defaultCurrency: string;
  isActive: boolean;
  createdAt: string;
}

export interface ApiCredentialRecord {
  id: string;
  merchantId: string;
  keyName: string;
  publishableKey: string;
  secretKeyHash: string;
  secretKeyPrefix: string;
  environment: 'SIMULATED' | 'LIVE';
  permissions: string[];
  isRevoked: boolean;
  expiresAt?: string;
  createdAt: string;
}

export interface GeneratedKeyResponse {
  credentialId: string;
  publishableKey: string;
  secretKeyPlaintext: string; // ONLY returned once upon creation
  permissions: string[];
  environment: string;
}

@Injectable()
export class GatewayMerchantService {
  private readonly logger = new Logger(GatewayMerchantService.name);
  private readonly merchants = new Map<string, MerchantRecord>();
  private readonly credentials = new Map<string, ApiCredentialRecord>(); // credId -> record
  private readonly publishableKeyIndex = new Map<string, string>(); // pk -> credId
  private readonly secretKeyHashIndex = new Map<string, string>(); // hash -> credId

  constructor() {
    // Seed default developer test merchant for out-of-the-box local usage
    this.seedDefaultMerchant();
  }

  private seedDefaultMerchant() {
    const defaultMerchantId = 'merch_default_bharat_001';
    const merchant: MerchantRecord = {
      id: defaultMerchantId,
      merchantCode: 'MERCH_DEFAULT',
      businessName: 'BharatYatra Travel & Retail Labs',
      legalEntityName: 'BharatYatra Tech Solutions Pvt Ltd',
      contactEmail: 'engineering@bharatyatra.in',
      contactPhone: '+919876543210',
      websiteUrl: 'https://bharatyatra.in',
      gstin: '24AAAAA0000A1Z5',
      panNumber: 'ABCDE1234F',
      kycStatus: 'APPROVED',
      defaultCurrency: 'INR',
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    this.merchants.set(defaultMerchantId, merchant);

    // Seed default test API keys: pk_test_bharat_sim / sk_test_bharat_sim
    const pk = 'pk_test_bharat_sim_9481928491823918';
    const sk = 'sk_test_bharat_sim_secret_key_84918294819284';
    const skHash = this.hashSecretKey(sk);

    const cred: ApiCredentialRecord = {
      id: 'cred_default_001',
      merchantId: defaultMerchantId,
      keyName: 'Default Integration Key',
      publishableKey: pk,
      secretKeyHash: skHash,
      secretKeyPrefix: sk.substring(0, 12),
      environment: 'SIMULATED',
      permissions: ['orders:create', 'orders:read', 'refunds:create', 'webhooks:manage'],
      isRevoked: false,
      createdAt: new Date().toISOString(),
    };

    this.credentials.set(cred.id, cred);
    this.publishableKeyIndex.set(pk, cred.id);
    this.secretKeyHashIndex.set(skHash, cred.id);

    this.logger.log(`[MERCHANT] Seeded default merchant ${defaultMerchantId} with Publishable Key: ${pk}`);
  }

  createMerchant(dto: CreateMerchantDto): { merchant: MerchantRecord; defaultKeys: GeneratedKeyResponse } {
    const merchantId = `merch_${crypto.randomBytes(8).toString('hex')}`;
    const code = `MERCH_${Math.floor(100000 + Math.random() * 900000)}`;

    const merchant: MerchantRecord = {
      id: merchantId,
      merchantCode: code,
      businessName: dto.businessName,
      legalEntityName: dto.legalEntityName,
      contactEmail: dto.contactEmail,
      contactPhone: dto.contactPhone,
      websiteUrl: dto.websiteUrl,
      gstin: dto.gstin,
      panNumber: dto.panNumber,
      kycStatus: 'APPROVED', // Sandbox simulator is auto-approved
      defaultCurrency: 'INR',
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    this.merchants.set(merchantId, merchant);
    const keys = this.generateApiCredentials(merchantId, 'Primary API Key');

    this.logger.log(`[MERCHANT] Registered new merchant ${merchant.businessName} (${merchantId})`);
    return { merchant, defaultKeys: keys };
  }

  getMerchant(merchantId: string): MerchantRecord {
    const merchant = this.merchants.get(merchantId);
    if (!merchant) {
      throw new NotFoundException(`Merchant with ID ${merchantId} not found.`);
    }
    return merchant;
  }

  generateApiCredentials(
    merchantId: string,
    keyName: string = 'API Key',
    customPermissions?: string[],
    expiresInDays?: number,
  ): GeneratedKeyResponse {
    const merchant = this.getMerchant(merchantId);
    const credId = `cred_${crypto.randomBytes(8).toString('hex')}`;
    const publishableKey = `pk_test_${crypto.randomBytes(16).toString('hex')}`;
    const secretKeyPlaintext = `sk_test_${crypto.randomBytes(24).toString('hex')}`;
    const secretKeyHash = this.hashSecretKey(secretKeyPlaintext);

    const permissions = customPermissions || ['orders:create', 'orders:read', 'refunds:create', 'webhooks:manage'];
    const expiresAt = expiresInDays ? new Date(Date.now() + expiresInDays * 86400000).toISOString() : undefined;

    const record: ApiCredentialRecord = {
      id: credId,
      merchantId,
      keyName,
      publishableKey,
      secretKeyHash,
      secretKeyPrefix: secretKeyPlaintext.substring(0, 10),
      environment: 'SIMULATED',
      permissions,
      isRevoked: false,
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
      createdAt: new Date().toISOString(),
    };

    this.credentials.set(credId, record);
    this.publishableKeyIndex.set(publishableKey, credId);
    this.secretKeyHashIndex.set(secretKeyHash, credId);

    this.logger.log(`[MERCHANT] Generated API keys for Merchant ${merchantId} (Prefix: ${record.secretKeyPrefix}...)`);

    return {
      credentialId: credId,
      publishableKey,
      secretKeyPlaintext,
      permissions,
      environment: 'SIMULATED',
    };
  }

  validateKey(key: string): { merchantId: string; permissions: string[]; isSecretKey: boolean; credentialId: string } {
    if (!key) {
      throw new UnauthorizedException('Missing API key in request header.');
    }

    let credId: string | undefined;
    const isSecretKey = key.startsWith('sk_');

    if (key.startsWith('pk_')) {
      credId = this.publishableKeyIndex.get(key);
    } else if (key.startsWith('sk_')) {
      const hash = this.hashSecretKey(key);
      credId = this.secretKeyHashIndex.get(hash);
    } else {
      throw new UnauthorizedException('Unrecognized API key format. Expected pk_test_... or sk_test_...');
    }

    if (!credId) {
      throw new UnauthorizedException(`Invalid ${isSecretKey ? 'secret' : 'publishable'} API key.`);
    }

    const cred = this.credentials.get(credId);
    if (!cred) {
      throw new UnauthorizedException('API key record not found.');
    }

    if (cred.isRevoked) {
      throw new UnauthorizedException('API key has been revoked.');
    }

    if (cred.expiresAt && new Date(cred.expiresAt) < new Date()) {
      throw new UnauthorizedException('API key has expired.');
    }

    return {
      merchantId: cred.merchantId,
      permissions: cred.permissions,
      isSecretKey,
      credentialId: cred.id,
    };
  }

  revokeKey(merchantId: string, credentialId: string): boolean {
    const cred = this.credentials.get(credentialId);
    if (!cred || cred.merchantId !== merchantId) {
      throw new NotFoundException(`API credential ${credentialId} not found for this merchant.`);
    }

    cred.isRevoked = true;
    this.credentials.set(credentialId, cred);
    this.logger.warn(`[MERCHANT SECURITY] API Key ${credentialId} (Prefix: ${cred.secretKeyPrefix}...) revoked by merchant ${merchantId}.`);
    return true;
  }

  hashSecretKey(secret: string): string {
    return crypto.createHash('sha256').update(secret).digest('hex');
  }

  listMerchants(): MerchantRecord[] {
    return Array.from(this.merchants.values());
  }

  listCredentials(merchantId: string): Omit<ApiCredentialRecord, 'secretKeyHash'>[] {
    return Array.from(this.credentials.values())
      .filter(c => c.merchantId === merchantId)
      .map(({ secretKeyHash, ...rest }) => rest);
  }
}
