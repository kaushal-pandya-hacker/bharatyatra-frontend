/**
 * BharatYatra — Smart QR Landing Page Master Configuration
 * Centralized, typed source of truth for all Smart QR landing page settings,
 * brand identity, tricolour design parameters, routing actions, and contact channels.
 */

export interface SmartQrButtonConfig {
  id: string;
  order: number;
  label: string;
  subtitle: string;
  destinationUrl: string;
  isExternal?: boolean;
  iconName: 'Sparkles' | 'MapPin' | 'Compass' | 'Instagram' | 'Building2' | 'PhoneCall';
  themeColor: 'saffron' | 'green' | 'navy';
  badgeText?: string;
  analyticsEvent: string;
}

export interface SmartQrConfig {
  brand: {
    name: string;
    subNameGujarati: string;
    tagline: string;
    headline: string;
    subtitle: string;
    description: string;
    websiteUrl: string;
    landingPageUrl: string;
    logoUrl: string;
    colors: {
      saffron: string;
      saffronLight: string;
      white: string;
      indiaGreen: string;
      indiaGreenLight: string;
      deepNavy: string;
      navyLight: string;
      ashokaBlue: string;
    };
  };
  buttons: SmartQrButtonConfig[];
  contact: {
    phone: string;
    phoneDisplay: string;
    whatsappUrl: string;
    email: string;
    supportEmail: string;
    address: string;
    workingHours: string;
  };
  social: {
    instagramUrl: string;
    instagramHandle: string;
    twitterHandle: string;
  };
  qrCode: {
    destinationUrl: string;
    errorCorrectionLevel: 'H' | 'Q' | 'M' | 'L';
    defaultSize: number;
    businessCardSpec: {
      cardHeading: string;
      cardSubheading: string;
      brandName: string;
      displayDomain: string;
    };
  };
}

const PRODUCTION_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.bharatyatra.in';
const INSTAGRAM_URL = process.env.NEXT_PUBLIC_INSTAGRAM_URL || 'https://www.instagram.com/bharat.yatra29?rpxt=MXJnMnQ2NG9sa2duYg==';

export const SMART_QR_CONFIG: SmartQrConfig = {
  brand: {
    name: 'BharatYatra',
    subNameGujarati: 'ભારત યાત્રા',
    tagline: 'DISCOVER INDIA. TRAVEL BETTER.',
    headline: 'Your Journey Starts Here.',
    subtitle: 'One scan. Endless possibilities. Explore incredible India with BharatYatra.',
    description: 'Explore incredible destinations, discover unforgettable experiences and plan your next journey across India with BharatYatra.',
    websiteUrl: PRODUCTION_SITE_URL,
    landingPageUrl: `${PRODUCTION_SITE_URL}/qr/`,
    logoUrl: '/logo.png',
    colors: {
      saffron: '#FF9933',
      saffronLight: '#FFF4E6',
      white: '#FFFFFF',
      indiaGreen: '#138808',
      indiaGreenLight: '#E8F5E9',
      deepNavy: '#102B4E',
      navyLight: '#EBF2FA',
      ashokaBlue: '#000080',
    },
  },

  // EXACT SIX PRIMARY BUTTONS (In precise order mandated by specification)
  buttons: [
    {
      id: 'plan-your-trip',
      order: 1,
      label: 'PLAN YOUR TRIP',
      subtitle: "Create your personalized travel itinerary with BharatYatra's AI Trip Planner.",
      destinationUrl: '/plan',
      isExternal: false,
      iconName: 'Sparkles',
      themeColor: 'saffron',
      badgeText: 'AI Trip Constructor',
      analyticsEvent: 'qr_plan_your_trip_click',
    },
    {
      id: 'explore-destinations',
      order: 2,
      label: 'EXPLORE DESTINATIONS',
      subtitle: 'Discover destinations, attractions and experiences across India.',
      destinationUrl: '/destinations',
      isExternal: false,
      iconName: 'MapPin',
      themeColor: 'navy',
      badgeText: '36 States & UTs',
      analyticsEvent: 'qr_explore_destinations_click',
    },
    {
      id: 'explore-tour-packages',
      order: 3,
      label: 'EXPLORE TOUR PACKAGES',
      subtitle: 'Find and explore available travel packages.',
      destinationUrl: '/packages',
      isExternal: false,
      iconName: 'Compass',
      themeColor: 'green',
      badgeText: 'Curated Circuits',
      analyticsEvent: 'qr_explore_packages_click',
    },
    {
      id: 'follow-instagram',
      order: 4,
      label: 'FOLLOW INSTAGRAM',
      subtitle: 'Get travel inspiration, destination videos, updates and offers.',
      destinationUrl: INSTAGRAM_URL,
      isExternal: true,
      iconName: 'Instagram',
      themeColor: 'saffron',
      badgeText: '@bharat.yatra29',
      analyticsEvent: 'qr_follow_instagram_click',
    },
    {
      id: 'become-travel-partner',
      order: 5,
      label: 'BECOME A TRAVEL PARTNER',
      subtitle: 'Join our travel partner network and grow with BharatYatra.',
      destinationUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSewIzuJ-bHesdiGlYuPijBvVF4AhYSdvb158GA4cgsKXIzYyQ/viewform',
      isExternal: true,
      iconName: 'Building2',
      themeColor: 'navy',
      badgeText: '🤝 PARTNER NETWORK',
      analyticsEvent: 'qr_become_partner_click',
    },
    {
      id: 'contact-us',
      order: 6,
      label: 'CONTACT US',
      subtitle: 'Have questions? Connect with our team.',
      destinationUrl: '/contact',
      isExternal: false,
      iconName: 'PhoneCall',
      themeColor: 'green',
      badgeText: '24x7 Direct Concierge',
      analyticsEvent: 'qr_contact_us_click',
    },
  ],

  contact: {
    phone: '+919624282521',
    phoneDisplay: '+91 96242 82521',
    whatsappUrl: 'https://wa.me/919624282521?text=Hello%20BharatYatra%20Team%2C%20I%20am%20connecting%20from%20the%20official%20business%20card%20QR.',
    email: 'pandyakaushal294@gmail.com',
    supportEmail: 'engineering@bharatyatra.in',
    address: 'Dholka, Ahmedabad, Gujarat 382225, India',
    workingHours: 'Mon - Sun: 24x7 Digital Assistance',
  },

  social: {
    instagramUrl: INSTAGRAM_URL,
    instagramHandle: '@bharat.yatra29',
    twitterHandle: '@bharatyatra',
  },

  qrCode: {
    destinationUrl: `${PRODUCTION_SITE_URL}/qr/`,
    errorCorrectionLevel: 'H', // High (30% recovery) for print reliability & durability
    defaultSize: 1024,
    businessCardSpec: {
      cardHeading: 'SCAN TO EXPLORE INDIA',
      cardSubheading: 'Your next adventure starts here.',
      brandName: 'BHARATYATRA',
      displayDomain: 'bharatyatra.in',
    },
  },
};

