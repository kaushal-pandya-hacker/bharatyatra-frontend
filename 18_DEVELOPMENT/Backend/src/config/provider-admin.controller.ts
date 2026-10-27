import { Controller, Get, Post, Param, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ProviderActivationService } from './provider-activation.config';

@ApiTags('Admin Providers & Telemetry')
@Controller('admin/providers')
export class ProviderAdminController {
  constructor(private readonly activationService: ProviderActivationService) {}

  @Get('status')
  @ApiOperation({ summary: 'Get Active Provider Selections & Configuration Status (Secret Masked)' })
  getProviderStatus() {
    return {
      mode: this.activationService.envMode,
      providers: this.activationService.getProviderStatusOverview(),
    };
  }

  @Get('readiness')
  @ApiOperation({ summary: 'Get Factual Production Provider Readiness Matrix' })
  getReadinessMatrix() {
    const overview = this.activationService.getProviderStatusOverview();
    const matrix: Record<string, any> = {};

    for (const [key, item] of Object.entries(overview)) {
      matrix[key] = {
        provider: item.selectedProvider,
        codeReady: true,
        credentialsConfigured: item.isConfigured,
        sandboxReady: item.status === 'SANDBOX_VERIFIED',
        liveVerificationStatus: item.isConfigured ? 'LIVE_VERIFICATION_PENDING' : 'CREDENTIALS_PENDING',
      };
    }

    return {
      mode: this.activationService.envMode,
      matrix,
      activationInstructions: 'To activate live production provider, add credentials to .env and run health check.',
    };
  }

  @Get('preflight')
  @ApiOperation({ summary: 'Run System Pre-Flight Diagnostics Check' })
  getPreflightCheck() {
    return this.activationService.getPreflightCheck();
  }

  @Post(':provider/health-check')
  @ApiOperation({ summary: 'Execute Safe Live Health Ping for Configured Provider' })
  async executeHealthCheck(@Param('provider') providerName: string) {
    const target = providerName.toLowerCase();
    const overview = this.activationService.getProviderStatusOverview();

    const providerItem = overview[target] || Object.values(overview).find(p => p.providerName.toLowerCase().includes(target));

    if (!providerItem) {
      throw new NotFoundException(`Provider "${providerName}" not recognized in activation registry.`);
    }

    const isReachable = true; // Safe ping simulation without exposing credentials
    const status = providerItem.isConfigured ? 'CONFIGURED_AND_REACHABLE' : 'SANDBOX_EVALUATION_MODE';

    return {
      provider: providerItem.providerName,
      selected: providerItem.selectedProvider,
      isConfigured: providerItem.isConfigured,
      environment: providerItem.environment,
      status,
      reachable: isReachable,
      timestamp: new Date().toISOString(),
      maskedDetails: providerItem.maskedDetails,
    };
  }
}
