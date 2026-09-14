export interface WeatherProvider {
  getDestinationWeather(regionSlug: string): Promise<any>;
}

export interface NotificationProvider {
  sendEmail(to: string, subject: string, body: string): Promise<any>;
  sendSMS(to: string, message: string): Promise<any>;
  sendWhatsApp(to: string, templateName: string, params: any): Promise<any>;
}
