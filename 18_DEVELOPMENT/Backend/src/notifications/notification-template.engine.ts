import { Injectable, Logger } from '@nestjs/common';

export interface RenderedTemplate {
  templateId: string;
  version: string;
  locale: string;
  subject: string;
  title: string;
  body: string;
}

export interface NotificationTemplate {
  templateId: string;
  version: string;
  supportedLocales: string[];
  content: Record<string, { subject: string; title: string; body: string }>;
}

@Injectable()
export class NotificationTemplateEngine {
  private readonly logger = new Logger(NotificationTemplateEngine.name);

  // Immutable Versioned Template Registry
  private templates: Map<string, NotificationTemplate> = new Map();

  constructor() {
    this.registerDefaultTemplates();
    this.logger.log('Notification Template Engine Initialized');
  }

  render(
    templateId: string,
    version: string,
    locale: 'en' | 'gu' | 'hi' = 'en',
    variables: Record<string, any> = {},
  ): RenderedTemplate {
    const key = `${templateId}_${version}`;
    const tpl = this.templates.get(key);

    if (!tpl) {
      this.logger.warn(`Template ${key} not found. Falling back to default notification renderer.`);
      return {
        templateId,
        version,
        locale: 'en',
        subject: variables.subject || 'Chalo Farva Update',
        title: variables.title || 'Notification',
        body: variables.message || variables.body || 'You have a new update regarding your trip.',
      };
    }

    const localized = tpl.content[locale] || tpl.content['en'];
    return {
      templateId,
      version,
      locale,
      subject: this.interpolate(localized.subject, variables),
      title: this.interpolate(localized.title, variables),
      body: this.interpolate(localized.body, variables),
    };
  }

  private interpolate(content: string, vars: Record<string, any>): string {
    return content.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key) => {
      return vars[key] !== undefined && vars[key] !== null ? String(vars[key]) : `{{${key}}}`;
    });
  }

  private registerDefaultTemplates() {
    // 1. BOOKING_CONFIRMED v1.0
    this.templates.set('booking_confirmed_v1.0', {
      templateId: 'booking_confirmed',
      version: 'v1.0',
      supportedLocales: ['en', 'gu', 'hi'],
      content: {
        en: {
          subject: 'Booking Confirmed - Ref: {{booking_reference}}',
          title: 'Your Booking is Confirmed!',
          body: 'Hello {{user_name}}, your booking for {{service_name}} on {{date}} is confirmed. Booking Ref: {{booking_reference}}.',
        },
        gu: {
          subject: 'બુકિંગ કન્ફર્મ થયું - સંદર્ભ: {{booking_reference}}',
          title: 'તમારું બુકિંગ કન્ફર્મ થઈ ગયું છે!',
          body: 'નમસ્તે {{user_name}}, {{service_name}} માટે {{date}} ના રોજ તમારું બુકિંગ કન્ફર્મ થયું છે. બુકિંગ સંદર્ભ: {{booking_reference}}.',
        },
        hi: {
          subject: 'बुकिंग की पुष्टि - संदर्भ: {{booking_reference}}',
          title: 'आपकी बुकिंग की पुष्टि हो गई है!',
          body: 'नमस्ते {{user_name}}, {{service_name}} के लिए {{date}} को आपकी बुकिंग की पुष्टि हो गई है। बुकिंग संदर्भ: {{booking_reference}}.',
        },
      },
    });

    // 2. PAYMENT_SUCCESS v1.0
    this.templates.set('payment_success_v1.0', {
      templateId: 'payment_success',
      version: 'v1.0',
      supportedLocales: ['en', 'gu', 'hi'],
      content: {
        en: {
          subject: 'Payment Received - ₹{{amount}}',
          title: 'Payment Successful',
          body: 'Payment of ₹{{amount}} for Txn Ref {{txn_reference}} was received successfully.',
        },
        gu: {
          subject: 'ચુકવણી પ્રાપ્ત થઈ - ₹{{amount}}',
          title: 'ચુકવણી સફળ રહી',
          body: '₹{{amount}} ની ચુકવણી વ્યવહાર સંદર્ભ {{txn_reference}} માટે સફળતાપૂર્વક પ્રાપ્ત થઈ છે.',
        },
        hi: {
          subject: 'भुगतान प्राप्त हुआ - ₹{{amount}}',
          title: 'भुगतान सफल',
          body: 'लेन-देन संदर्भ {{txn_reference}} के लिए ₹{{amount}} का भुगतान सफलतापूर्वक प्राप्त हुआ।',
        },
      },
    });

    // 3. REFUND_COMPLETED v1.0
    this.templates.set('refund_completed_v1.0', {
      templateId: 'refund_completed',
      version: 'v1.0',
      supportedLocales: ['en', 'gu', 'hi'],
      content: {
        en: {
          subject: 'Refund Processed - ₹{{amount}}',
          title: 'Refund Credit Initiated',
          body: 'Refund of ₹{{amount}} for Refund Ref {{refund_reference}} has been processed to your original payment method.',
        },
        gu: {
          subject: 'રિફંડ પ્રક્રિયા પૂર્ણ - ₹{{amount}}',
          title: 'રિફંડ જમા પ્રક્રિયા શરૂ થઈ',
          body: 'રિફંડ સંદર્ભ {{refund_reference}} માટે ₹{{amount}} નું રિફંડ તમારા મૂળ ચુકવણી ખાતામાં જમા કરી દેવામાં આવ્યું છે.',
        },
        hi: {
          subject: 'रिफंड संसाधित हुआ - ₹{{amount}}',
          title: 'रिफंड क्रेडिट शुरू किया गया',
          body: 'रिफंड संदर्भ {{refund_reference}} के लिए ₹{{amount}} का रिफंड आपके मूल भुगतान खाते में संसाधित कर दिया गया है।',
        },
      },
    });

    // 4. ADAPTATION_PROPOSED v1.0
    this.templates.set('adaptation_proposed_v1.0', {
      templateId: 'adaptation_proposed',
      version: 'v1.0',
      supportedLocales: ['en', 'gu', 'hi'],
      content: {
        en: {
          subject: 'Itinerary Alert: {{reason}}',
          title: 'Trip Adaptation Suggested',
          body: 'Due to {{reason}}, we suggest updating your plan at {{destination}}. Affected activity: {{affected_activity}}. Proposed alternative: {{proposed_alternative}}.',
        },
        gu: {
          subject: 'પ્રવાસ ચેતવણી: {{reason}}',
          title: 'પ્રવાસ યોજનામાં ફેરફારનું સુચન',
          body: '{{reason}} ના કારણે, અમે {{destination}} ખાતે તમારી યોજના અપડેટ કરવાનું સૂચન કરીએ છીએ. અસરગ્રસ્ત પ્રવૃત્તિ: {{affected_activity}}.',
        },
        hi: {
          subject: 'यात्रा अलर्ट: {{reason}}',
          title: 'यात्रा अनुकूलन का सुझाव',
          body: '{{reason}} के कारण, हम {{destination}} में आपकी योजना को अपडेट करने का सुझाव देते हैं। प्रभावित गतिविधि: {{affected_activity}}.',
        },
      },
    });

    // 5. TRIP_REMINDER v1.0
    this.templates.set('trip_reminder_v1.0', {
      templateId: 'trip_reminder',
      version: 'v1.0',
      supportedLocales: ['en', 'gu', 'hi'],
      content: {
        en: {
          subject: 'Upcoming Trip Reminder: {{trip_name}}',
          title: 'Your Trip Starts Soon!',
          body: 'Get ready! Your trip to {{destination}} starts on {{date}} at {{time}}.',
        },
        gu: {
          subject: 'આગામી પ્રવાસ સ્મૃતિપત્ર: {{trip_name}}',
          title: 'તમારો પ્રવાસ ટૂંક સમયમાં શરૂ થાય છે!',
          body: 'તૈયાર રહો! {{destination}} માટેનો તમારો પ્રવાસ {{date}} ના રોજ {{time}} વાગ્યે શરૂ થાય છે.',
        },
        hi: {
          subject: 'आगामी यात्रा अनुस्मारक: {{trip_name}}',
          title: 'आपकी यात्रा जल्द ही शुरू हो रही है!',
          body: 'तैयार हो जाइए! {{destination}} की आपकी यात्रा {{date}} को {{time}} बजे शुरू हो रही है।',
        },
      },
    });
  }
}
