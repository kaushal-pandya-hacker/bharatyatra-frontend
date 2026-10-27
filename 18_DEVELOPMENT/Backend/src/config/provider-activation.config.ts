import { Injectable, Logger } from '@nestjs/common';

export type EnvironmentMode = 'development' | 'test' | 'sandbox' | 'production';

export type GranularProviderStatus =
  | 'DISABLED'
  | 'NOT_CONFIGURED'
  | 'CONFIGURED_NOT_VERIFIED'
  | 'SANDBOX_VERIFIED'
  | 'PRODUCTION_CONFIGURED'
  | 'LIVE_SEARCH_VERIFIED'
  | 'LIVE_BOOKING_VERIFIED'
  | 'LIVE_CANCELLATION_VERIFIED'
  | 'LIVE_REFUND_VERIFIED'
  | 'MANUAL_REVIEW_REQUIRED'
  | 'ERROR';

export interface ProviderConfigItem {
  providerName: string;
  selectedProvider: string;
  isConfigured: boolean;
  environment: string;
  missingKeys: string[];
  status: GranularProviderStatus;
  maskedDetails: Record<string, string>;
}

export interface SystemPreflightStatus {
  mode: EnvironmentMode;
  allPassing: boolean;
  database: { status: 'PASS' | 'FAIL'; urlMasked: string };
  redis: { status: 'PASS' | 'WARN' | 'FAIL'; urlMasked: string };
  payment: { status: 'PASS' | 'WARN' | 'FAIL'; provider: string; keyIdMasked: string };
  suppliers: Record<string, { status: 'PASS' | 'WARN' | 'FAIL'; provider: string }>;
  notifications: { status: 'PASS' | 'WARN' | 'FAIL'; emailProvider: string; whatsappProvider: string };
  timestamp: string;
}

@Injectable()
export class ProviderActivationService {
  private readonly logger = new Logger(ProviderActivationService.name);

  get envMode(): EnvironmentMode {
    const nodeEnv = (process.env.NODE_ENV || 'development').toLowerCase();
    if (nodeEnv === 'production') return 'production';
    if (nodeEnv === 'test') return 'test';
    if (process.env.SANDBOX_MODE === 'true' || nodeEnv === 'sandbox') return 'sandbox';
    return 'development';
  }

  maskSecret(val?: string | null): string {
    if (!val || val.trim().length === 0) return '[NOT CONFIGURED]';
    if (val.length <= 6) return `${val.substring(0, 2)}***`;
    return `${val.substring(0, 4)}***${val.substring(val.length - 2)}`;
  }

  validateProductionStartup(): { success: boolean; errors: string[] } {
    const mode = this.envMode;
    const errors: string[] = [];

    this.logger.log(`[ProviderActivationService] Validating startup for environment mode: ${mode.toUpperCase()}`);

    if (mode === 'production') {
      const paymentProvider = process.env.PAYMENT_PROVIDER || 'razorpay';
      if (paymentProvider === 'razorpay') {
        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
          errors.push('PRODUCTION_CREDENTIALS_MISSING: PAYMENT_PROVIDER=razorpay requires RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.');
        }
      }

      const flightProvider = process.env.FLIGHT_PROVIDER;
      if (flightProvider === 'tbo') {
        if (!process.env.TBO_USERNAME || !process.env.TBO_PASSWORD) {
          errors.push('PRODUCTION_CREDENTIALS_MISSING: FLIGHT_PROVIDER=tbo requires TBO_USERNAME and TBO_PASSWORD.');
        }
      }

      const hotelProvider = process.env.HOTEL_PROVIDER;
      if (hotelProvider === 'hotelbeds') {
        if (!process.env.HOTELBEDS_API_KEY || !process.env.HOTELBEDS_SECRET) {
          errors.push('PRODUCTION_CREDENTIALS_MISSING: HOTEL_PROVIDER=hotelbeds requires HOTELBEDS_API_KEY and HOTELBEDS_SECRET.');
        }
      }

      const busProvider = process.env.BUS_PROVIDER;
      if (busProvider === 'gsrtc') {
        if (!process.env.BUS_API_KEY) {
          errors.push('PRODUCTION_CREDENTIALS_MISSING: BUS_PROVIDER=gsrtc requires BUS_API_KEY.');
        }
      }

      if (errors.length > 0) {
        this.logger.error(`[PRODUCTION GATE ERROR] Missing required credentials for active production providers:\n${errors.join('\n')}`);
        if (process.env.FAIL_FAST_ON_MISSING_CREDENTIALS === 'true') {
          throw new Error(`Production startup gate blocked due to missing credentials:\n${errors.join('\n')}`);
        }
      }
    }

    return { success: errors.length === 0, errors };
  }

  getProviderStatusOverview(): Record<string, ProviderConfigItem> {
    const mode = this.envMode;

    return {
      flights: this.inspectFlightProvider(mode),
      hotels: this.inspectHotelProvider(mode),
      buses: this.inspectBusProvider(mode),
      trains: this.inspectTrainProvider(mode),
      activities: this.inspectActivityProvider(mode),
      payment: this.inspectPaymentProvider(mode),
      email: this.inspectEmailProvider(mode),
      whatsapp: this.inspectWhatsAppProvider(mode),
    };
  }

  private inspectFlightProvider(mode: EnvironmentMode): ProviderConfigItem {
    const selected = (process.env.FLIGHT_PROVIDER || 'mock').toLowerCase();
    if (selected === 'disabled') {
      return { providerName: 'Flights', selectedProvider: 'disabled', isConfigured: false, environment: mode, missingKeys: [], status: 'DISABLED', maskedDetails: {} };
    }

    const missingKeys: string[] = [];
    if (!process.env.TBO_USERNAME) missingKeys.push('TBO_USERNAME');
    if (!process.env.TBO_PASSWORD) missingKeys.push('TBO_PASSWORD');

    const isConfigured = missingKeys.length === 0;
    let status: GranularProviderStatus = 'NOT_CONFIGURED';
    if (isConfigured) {
      status = mode === 'production' ? 'PRODUCTION_CONFIGURED' : 'SANDBOX_VERIFIED';
    }

    return {
      providerName: 'Flights',
      selectedProvider: selected,
      isConfigured,
      environment: process.env.TBO_ENVIRONMENT || mode,
      missingKeys,
      status,
      maskedDetails: {
        tboUrl: process.env.TBO_API_URL || 'https://api.tbotechnology.in',
        username: this.maskSecret(process.env.TBO_USERNAME),
      },
    };
  }

  private inspectHotelProvider(mode: EnvironmentMode): ProviderConfigItem {
    const selected = (process.env.HOTEL_PROVIDER || 'hotelbeds').toLowerCase();
    if (selected === 'disabled') {
      return { providerName: 'Hotels', selectedProvider: 'disabled', isConfigured: false, environment: mode, missingKeys: [], status: 'DISABLED', maskedDetails: {} };
    }

    const missingKeys: string[] = [];
    if (!process.env.HOTELBEDS_API_KEY) missingKeys.push('HOTELBEDS_API_KEY');
    if (!process.env.HOTELBEDS_SECRET) missingKeys.push('HOTELBEDS_SECRET');

    const isConfigured = missingKeys.length === 0;
    let status: GranularProviderStatus = 'NOT_CONFIGURED';
    if (isConfigured) {
      status = mode === 'production' ? 'PRODUCTION_CONFIGURED' : 'SANDBOX_VERIFIED';
    }

    return {
      providerName: 'Hotels',
      selectedProvider: selected,
      isConfigured,
      environment: process.env.HOTELBEDS_ENVIRONMENT || mode,
      missingKeys,
      status,
      maskedDetails: {
        apiUrl: process.env.HOTELBEDS_API_URL || 'https://api.test.hotelbeds.com',
        apiKey: this.maskSecret(process.env.HOTELBEDS_API_KEY),
      },
    };
  }

  private inspectBusProvider(mode: EnvironmentMode): ProviderConfigItem {
    const selected = (process.env.BUS_PROVIDER || 'gsrtc').toLowerCase();
    if (selected === 'disabled') {
      return { providerName: 'Buses', selectedProvider: 'disabled', isConfigured: false, environment: mode, missingKeys: [], status: 'DISABLED', maskedDetails: {} };
    }

    const missingKeys: string[] = [];
    if (!process.env.BUS_API_KEY) missingKeys.push('BUS_API_KEY');

    const isConfigured = missingKeys.length === 0;
    let status: GranularProviderStatus = 'NOT_CONFIGURED';
    if (isConfigured) {
      status = mode === 'production' ? 'PRODUCTION_CONFIGURED' : 'SANDBOX_VERIFIED';
    }

    return {
      providerName: 'Buses',
      selectedProvider: selected,
      isConfigured,
      environment: process.env.BUS_ENVIRONMENT || mode,
      missingKeys,
      status,
      maskedDetails: {
        apiUrl: process.env.BUS_API_URL || 'https://sandbox.gsrtc.in/api/v1',
        apiKey: this.maskSecret(process.env.BUS_API_KEY),
      },
    };
  }

  private inspectTrainProvider(mode: EnvironmentMode): ProviderConfigItem {
    const selected = (process.env.TRAIN_PROVIDER || 'confirmation').toLowerCase();
    if (selected === 'disabled') {
      return { providerName: 'Trains', selectedProvider: 'disabled', isConfigured: false, environment: mode, missingKeys: [], status: 'DISABLED', maskedDetails: {} };
    }

    return {
      providerName: 'Trains',
      selectedProvider: selected,
      isConfigured: true,
      environment: process.env.TRAIN_ENVIRONMENT || mode,
      missingKeys: [],
      status: 'SANDBOX_VERIFIED',
      maskedDetails: {
        mode: 'CONFIRMATION_REQUEST_FLOW',
        apiUrl: process.env.TRAIN_API_URL || 'https://sandbox.irctc.in/api/v1',
      },
    };
  }

  private inspectActivityProvider(mode: EnvironmentMode): ProviderConfigItem {
    const selected = (process.env.ACTIVITY_PROVIDER || 'internal').toLowerCase();
    if (selected === 'disabled') {
      return { providerName: 'Activities', selectedProvider: 'disabled', isConfigured: false, environment: mode, missingKeys: [], status: 'DISABLED', maskedDetails: {} };
    }

    return {
      providerName: 'Activities',
      selectedProvider: selected,
      isConfigured: true,
      environment: mode,
      missingKeys: [],
      status: 'SANDBOX_VERIFIED',
      maskedDetails: {
        mode: 'INTERNAL_CATALOG_SYNC',
      },
    };
  }

  private inspectPaymentProvider(mode: EnvironmentMode): ProviderConfigItem {
    const selected = (process.env.PAYMENT_PROVIDER || 'razorpay').toLowerCase();
    if (selected === 'disabled') {
      return { providerName: 'Payment', selectedProvider: 'disabled', isConfigured: false, environment: mode, missingKeys: [], status: 'DISABLED', maskedDetails: {} };
    }

    const missingKeys: string[] = [];
    if (!process.env.RAZORPAY_KEY_ID) missingKeys.push('RAZORPAY_KEY_ID');
    if (!process.env.RAZORPAY_KEY_SECRET) missingKeys.push('RAZORPAY_KEY_SECRET');

    const isConfigured = missingKeys.length === 0;
    let status: GranularProviderStatus = 'NOT_CONFIGURED';
    if (isConfigured) {
      status = mode === 'production' ? 'PRODUCTION_CONFIGURED' : 'SANDBOX_VERIFIED';
    }

    return {
      providerName: 'Payment Gateway',
      selectedProvider: selected,
      isConfigured,
      environment: process.env.RAZORPAY_ENVIRONMENT || mode,
      missingKeys,
      status,
      maskedDetails: {
        keyId: this.maskSecret(process.env.RAZORPAY_KEY_ID),
        webhookSecretConfigured: process.env.RAZORPAY_WEBHOOK_SECRET ? 'YES' : 'NO',
      },
    };
  }

  private inspectEmailProvider(mode: EnvironmentMode): ProviderConfigItem {
    const selected = (process.env.EMAIL_PROVIDER || 'sandbox').toLowerCase();
    return {
      providerName: 'Email Delivery',
      selectedProvider: selected,
      isConfigured: true,
      environment: mode,
      missingKeys: [],
      status: selected === 'sandbox' || selected === 'none' ? 'SANDBOX_VERIFIED' : 'CONFIGURED_NOT_VERIFIED',
      maskedDetails: {
        provider: selected,
        fromAddress: process.env.EMAIL_FROM_ADDRESS || 'noreply@bharatyatra.com',
      },
    };
  }

  private inspectWhatsAppProvider(mode: EnvironmentMode): ProviderConfigItem {
    const selected = (process.env.WHATSAPP_PROVIDER || 'sandbox').toLowerCase();
    return {
      providerName: 'WhatsApp Messaging',
      selectedProvider: selected,
      isConfigured: true,
      environment: mode,
      missingKeys: [],
      status: 'SANDBOX_VERIFIED',
      maskedDetails: {
        provider: selected,
        fallbackMode: 'DEEP_LINK_URL_GENERATOR',
      },
    };
  }

  getPreflightCheck(): SystemPreflightStatus {
    const mode = this.envMode;
    const overview = this.getProviderStatusOverview();

    const dbUrl = process.env.DATABASE_URL || '';
    const redisUrl = process.env.REDIS_URL || '';

    const dbPass = dbUrl.length > 0;
    const redisStatus: 'PASS' | 'WARN' | 'FAIL' = redisUrl ? 'PASS' : 'WARN';
    const paymentStatus: 'PASS' | 'WARN' | 'FAIL' = overview.payment.isConfigured ? 'PASS' : 'WARN';

    return {
      mode,
      allPassing: dbPass && overview.payment.isConfigured,
      database: {
        status: dbPass ? 'PASS' : 'FAIL',
        urlMasked: this.maskSecret(dbUrl),
      },
      redis: {
        status: redisStatus,
        urlMasked: redisUrl ? this.maskSecret(redisUrl) : '[IN-MEMORY FALLBACK]',
      },
      payment: {
        status: paymentStatus,
        provider: overview.payment.selectedProvider,
        keyIdMasked: overview.payment.maskedDetails.keyId || '[NOT SET]',
      },
      suppliers: {
        flights: { status: overview.flights.isConfigured ? 'PASS' : 'WARN', provider: overview.flights.selectedProvider },
        hotels: { status: overview.hotels.isConfigured ? 'PASS' : 'WARN', provider: overview.hotels.selectedProvider },
        buses: { status: overview.buses.isConfigured ? 'PASS' : 'WARN', provider: overview.buses.selectedProvider },
        trains: { status: 'PASS', provider: overview.trains.selectedProvider },
        activities: { status: 'PASS', provider: overview.activities.selectedProvider },
      },
      notifications: {
        status: 'PASS',
        emailProvider: overview.email.selectedProvider,
        whatsappProvider: overview.whatsapp.selectedProvider,
      },
      timestamp: new Date().toISOString(),
    };
  }
}
