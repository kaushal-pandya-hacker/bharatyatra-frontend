import { Injectable, Logger } from '@nestjs/common';
import { WeatherProvider, NotificationProvider } from '../interfaces/weather-notification.interface';

@Injectable()
export class MockWeatherProvider implements WeatherProvider {
  private readonly logger = new Logger(MockWeatherProvider.name);
  public readonly isDevelopmentMock = true;

  async getDestinationWeather(regionSlug: string): Promise<any> {
    this.logger.log(`[DEVELOPMENT MOCK] Fetching mock weather advisory for ${regionSlug}`);
    return {
      provider: 'DEVELOPMENT MOCK - WEATHER SERVICE',
      region: regionSlug,
      condition: 'SUNNY',
      tempCelsius: 28,
      weatherAlert: null,
      isDevelopmentMock: true
    };
  }
}

@Injectable()
export class MockNotificationProvider implements NotificationProvider {
  private readonly logger = new Logger(MockNotificationProvider.name);
  public readonly isDevelopmentMock = true;

  async sendEmail(to: string, subject: string, body: string): Promise<any> {
    this.logger.log(`[DEVELOPMENT MOCK - EMAIL] To: ${to} | Subject: ${subject}`);
    return { status: 'MOCK_SENT', isDevelopmentMock: true };
  }

  async sendSMS(to: string, message: string): Promise<any> {
    this.logger.log(`[DEVELOPMENT MOCK - SMS] To: ${to} | Message: ${message}`);
    return { status: 'MOCK_SENT', isDevelopmentMock: true };
  }

  async sendWhatsApp(to: string, templateName: string, params: any): Promise<any> {
    this.logger.log(`[DEVELOPMENT MOCK - WHATSAPP] To: ${to} | Template: ${templateName}`);
    return { status: 'MOCK_SENT', isDevelopmentMock: true };
  }
}
