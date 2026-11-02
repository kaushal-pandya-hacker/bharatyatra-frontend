/**
 * BharatYatra — Diwali Festive Campaign Store & Engine
 * Manages configuration, start/end date expiration, hero text,
 * promotional categories, and festive interaction controls.
 */

import fs from 'fs';
import path from 'path';

export interface DiwaliOfferCategory {
  id: string;
  title: string;
  description: string;
  categoryKey: string;
  image: string;
  startingPriceLabel: string;
  exploreHref: string;
  badge: string;
}

export interface DiwaliDestinationHighlight {
  slug: string;
  name: string;
  state: string;
  category: string; // 'Himalayan Escapes' | 'Royal Rajasthan' | 'Spiritual India' | 'Coastal Getaways' | 'Gujarat Heritage' | 'Northeast Adventures' | 'South India Experiences'
  tagline: string;
  image: string;
  rating: string;
  idealDuration: string;
}

export interface DiwaliCampaignConfig {
  isEnabled: boolean;
  campaignName: string;
  startDate: string; // ISO string
  endDate: string; // ISO string
  banner: {
    isEnabled: boolean;
    text: string;
    actionText: string;
    actionHref: string;
  };
  hero: {
    badge: string;
    offerHeadline: string;
    heading: string;
    tagline: string;
    description: string;
    primaryCta: string;
    primaryCtaHref: string;
    secondaryCta: string;
    secondaryCtaHref: string;
    brandSignature: string;
  };
  offersSection: {
    heading: string;
    description: string;
    categories: DiwaliOfferCategory[];
  };
  destinationsSection: {
    heading: string;
    description: string;
    categories: string[];
    featuredDestinations: DiwaliDestinationHighlight[];
  };
  aiPlanner: {
    festiveGreeting: string;
    festiveBadge: string;
  };
  popup: {
    isEnabled: boolean;
    title: string;
    message: string;
    ctaText: string;
    ctaHref: string;
  };
  updatedAt: string;
}

const CAMPAIGN_FILE = path.join(process.cwd(), 'data', 'diwali_campaign.json');

const DEFAULT_CAMPAIGN_CONFIG: DiwaliCampaignConfig = {
  isEnabled: true,
  campaignName: 'BharatYatra Diwali Festive Special 2026',
  startDate: '2026-10-15T00:00:00.000Z',
  endDate: '2026-11-30T23:59:59.000Z',
  banner: {
    isEnabled: true,
    text: '🪔 THIS DIWALI, EXPLORE INDIA. CELEBRATE EVERY JOURNEY.',
    actionText: 'Plan Your Diwali Trip',
    actionHref: '/plan',
  },
  hero: {
    badge: '✨ BHARATYATRA DIWALI SPECIAL',
    offerHeadline: 'CELEBRATE DIWALI WITH THE BEST TRAVEL OFFERS!',
    heading: 'Make This Diwali a Journey to Remember.',
    tagline: 'THIS DIWALI, EXPLORE INDIA. CELEBRATE EVERY JOURNEY.',
    description:
      'From the mountains of the Himalayas to the beautiful beaches of Goa, discover India and create memories this festive season.',
    primaryCta: 'PLAN YOUR DIWALI TRIP',
    primaryCtaHref: '/plan',
    secondaryCta: 'EXPLORE INDIA',
    secondaryCtaHref: '/destinations',
    brandSignature: 'BHARATYATRA — Discover India. Experience More.',
  },
  offersSection: {
    heading: 'Your Festive Journey Starts Here',
    description: 'Make this Diwali unforgettable with journeys across incredible India.',
    categories: [
      {
        id: 'cat-hotels',
        title: 'Hotels & Stays',
        description: 'Verified heritage palaces, luxury havelis & festival view resorts.',
        categoryKey: 'STAYS',
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
        startingPriceLabel: 'DISCOVER EXCLUSIVE FESTIVE OFFERS',
        exploreHref: '/stays',
        badge: 'FESTIVE STAYS',
      },
      {
        id: 'cat-buses',
        title: 'Bus Journeys',
        description: 'Smooth intercity AC sleepers & multi-axle Volvo transit for homecoming & holidays.',
        categoryKey: 'BUSES',
        image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
        startingPriceLabel: 'DISCOVER EXCLUSIVE FESTIVE OFFERS',
        exploreHref: '/buses',
        badge: 'CONFIRMED SEATS',
      },
      {
        id: 'cat-packages',
        title: 'Tour Packages',
        description: 'Curated all-inclusive festival holiday circuits with verified ground coordination.',
        categoryKey: 'PACKAGES',
        image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80',
        startingPriceLabel: 'DISCOVER EXCLUSIVE FESTIVE OFFERS',
        exploreHref: '/packages',
        badge: 'ALL INCLUSIVE',
      },
      {
        id: 'cat-weekend',
        title: 'Weekend Getaways',
        description: 'Short restorative festive retreats within easy driving distance of major hubs.',
        categoryKey: 'WEEKEND',
        image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
        startingPriceLabel: 'DISCOVER EXCLUSIVE FESTIVE OFFERS',
        exploreHref: '/packages?type=Weekend',
        badge: 'QUICK BREAKS',
      },
      {
        id: 'cat-family',
        title: 'Family Holidays',
        description: 'Spacious multi-generation suites, private cabs & kid-friendly cultural trails.',
        categoryKey: 'FAMILY',
        image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=800&q=80',
        startingPriceLabel: 'DISCOVER EXCLUSIVE FESTIVE OFFERS',
        exploreHref: '/packages?type=Family',
        badge: 'FAMILY SPECIAL',
      },
      {
        id: 'cat-adventure',
        title: 'Adventure Trips',
        description: 'Desert camel safaris, Himalayan high-pass drives & white-water river expeditions.',
        categoryKey: 'ADVENTURE',
        image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80',
        startingPriceLabel: 'DISCOVER EXCLUSIVE FESTIVE OFFERS',
        exploreHref: '/packages?type=Adventure',
        badge: 'THRILL & NATURE',
      },
      {
        id: 'cat-spiritual',
        title: 'Religious & Spiritual Journeys',
        description: 'Deep darshan at Kashi, Dwarka, Somnath, Tirupati & Ayodhya during the holy festival.',
        categoryKey: 'SPIRITUAL',
        image: 'https://images.unsplash.com/photo-1571536802807-30451e3955d8?auto=format&fit=crop&w=800&q=80',
        startingPriceLabel: 'DISCOVER EXCLUSIVE FESTIVE OFFERS',
        exploreHref: '/packages?type=Pilgrimage',
        badge: 'SACRED TRAILS',
      },
      {
        id: 'cat-destinations',
        title: 'Popular Indian Destinations',
        description: 'Explore celebrated hubs across 36 States illuminated with festive lights.',
        categoryKey: 'DESTINATIONS',
        image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80',
        startingPriceLabel: 'DISCOVER EXCLUSIVE FESTIVE OFFERS',
        exploreHref: '/destinations',
        badge: 'ICONIC INDIA',
      },
    ],
  },
  destinationsSection: {
    heading: 'Celebrate Diwali Across Incredible India',
    description: 'Explore the country’s most celebrated destinations draped in golden lights and festive joy.',
    categories: [
      'Himalayan Escapes',
      'Royal Rajasthan',
      'Spiritual India',
      'Coastal Getaways',
      'Gujarat Heritage',
      'Northeast Adventures',
      'South India Experiences',
    ],
    featuredDestinations: [
      {
        slug: 'jaipur-city-palace-hawa-mahal',
        name: 'Jaipur & Amer Fort',
        state: 'Rajasthan',
        category: 'Royal Rajasthan',
        tagline: 'World-renowned Diwali light illumination over pink sandstone palaces.',
        image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=800&q=80',
        rating: '4.9 ★',
        idealDuration: '3-4 Days',
      },
      {
        slug: 'varanasi-ghats-kashi-vishwanath',
        name: 'Varanasi Dev Deepawali',
        state: 'Uttar Pradesh',
        category: 'Spiritual India',
        tagline: 'A million golden earthen diyas floating on sacred Mother Ganga.',
        image: 'https://images.unsplash.com/photo-1571536802807-30451e3955d8?auto=format&fit=crop&w=800&q=80',
        rating: '4.9 ★',
        idealDuration: '3 Days',
      },
      {
        slug: 'rann-of-kutch-white-desert',
        name: 'White Rann of Kutch',
        state: 'Gujarat',
        category: 'Gujarat Heritage',
        tagline: 'Endless moonlight salt desert, artisan crafts, and festive tent city.',
        image: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=800&q=80',
        rating: '4.8 ★',
        idealDuration: '3-4 Days',
      },
      {
        slug: 'dal-lake-srinagar',
        name: 'Srinagar & Dal Lake',
        state: 'Jammu & Kashmir',
        category: 'Himalayan Escapes',
        tagline: 'Autumn chinar leaves, snowline peaks, and glowing lakeside Shikaras.',
        image: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=800&q=80',
        rating: '4.9 ★',
        idealDuration: '4-5 Days',
      },
      {
        slug: 'alleppey-backwaters-houseboat',
        name: 'Alleppey Backwaters',
        state: 'Kerala',
        category: 'Coastal Getaways',
        tagline: 'Tranquil emerald waters and festive evening lights on traditional houseboats.',
        image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80',
        rating: '4.9 ★',
        idealDuration: '3 Days',
      },
      {
        slug: 'shillong-cherry-blossom',
        name: 'Shillong & Meghalaya',
        state: 'Meghalaya',
        category: 'Northeast Adventures',
        tagline: 'Scotland of the East, living root bridges, and festive hill melodies.',
        image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80',
        rating: '4.8 ★',
        idealDuration: '5 Days',
      },
      {
        slug: 'hampi-vijayanagara-ruins',
        name: 'Hampi & Tungabhadra',
        state: 'Karnataka',
        category: 'South India Experiences',
        tagline: 'UNESCO boulder heritage city illuminated under clear starlit festive skies.',
        image: 'https://images.unsplash.com/photo-1600100397608-f010e4210a4e?auto=format&fit=crop&w=800&q=80',
        rating: '4.8 ★',
        idealDuration: '3 Days',
      },
    ],
  },
  aiPlanner: {
    festiveGreeting:
      "Namaste! 🪔 Ready to make this Diwali unforgettable? Let's plan your next journey across India!",
    festiveBadge: '🪔 DIWALI FESTIVE EDITION',
  },
  popup: {
    isEnabled: true,
    title: 'Happy Diwali! 🪔',
    message:
      'May every journey bring you happiness, new experiences, and beautiful memories. Celebrate this festive season by exploring the wonders of Incredible India.',
    ctaText: 'Explore Diwali Offers',
    ctaHref: '/#diwali-offers',
  },
  updatedAt: new Date().toISOString(),
};

class DiwaliCampaignStore {
  private config: DiwaliCampaignConfig = DEFAULT_CAMPAIGN_CONFIG;
  private isLoaded = false;

  private ensureLoaded(): void {
    if (this.isLoaded) return;
    try {
      const dataDir = path.dirname(CAMPAIGN_FILE);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      if (fs.existsSync(CAMPAIGN_FILE)) {
        const raw = fs.readFileSync(CAMPAIGN_FILE, 'utf8');
        const parsed = JSON.parse(raw);
        this.config = {
          ...DEFAULT_CAMPAIGN_CONFIG,
          ...parsed,
          banner: { ...DEFAULT_CAMPAIGN_CONFIG.banner, ...(parsed.banner || {}) },
          hero: { ...DEFAULT_CAMPAIGN_CONFIG.hero, ...(parsed.hero || {}) },
          offersSection: {
            ...DEFAULT_CAMPAIGN_CONFIG.offersSection,
            ...(parsed.offersSection || {}),
          },
          destinationsSection: {
            ...DEFAULT_CAMPAIGN_CONFIG.destinationsSection,
            ...(parsed.destinationsSection || {}),
          },
          aiPlanner: { ...DEFAULT_CAMPAIGN_CONFIG.aiPlanner, ...(parsed.aiPlanner || {}) },
          popup: { ...DEFAULT_CAMPAIGN_CONFIG.popup, ...(parsed.popup || {}) },
        };
      } else {
        this.persist();
      }
    } catch (e) {
      console.error('[DiwaliCampaignStore] Load error:', e);
      this.config = DEFAULT_CAMPAIGN_CONFIG;
    }
    this.isLoaded = true;
  }

  private persist(): void {
    try {
      this.config.updatedAt = new Date().toISOString();
      fs.writeFileSync(CAMPAIGN_FILE, JSON.stringify(this.config, null, 2), 'utf8');
    } catch (e) {
      console.error('[DiwaliCampaignStore] Persist error:', e);
    }
  }

  public getConfig(): DiwaliCampaignConfig {
    this.ensureLoaded();
    return this.config;
  }

  /**
   * Evaluates if Diwali campaign is currently active:
   * Enabled flag is true AND current time is within [startDate, endDate].
   */
  public isCampaignActive(): boolean {
    this.ensureLoaded();
    if (!this.config.isEnabled) return false;

    const now = new Date();
    const start = new Date(this.config.startDate);
    const end = new Date(this.config.endDate);

    if (now < start || now > end) {
      return false;
    }

    return true;
  }

  public updateConfig(updates: Partial<DiwaliCampaignConfig>): DiwaliCampaignConfig {
    this.ensureLoaded();
    this.config = {
      ...this.config,
      ...updates,
      banner: updates.banner ? { ...this.config.banner, ...updates.banner } : this.config.banner,
      hero: updates.hero ? { ...this.config.hero, ...updates.hero } : this.config.hero,
      offersSection: updates.offersSection
        ? { ...this.config.offersSection, ...updates.offersSection }
        : this.config.offersSection,
      destinationsSection: updates.destinationsSection
        ? { ...this.config.destinationsSection, ...updates.destinationsSection }
        : this.config.destinationsSection,
      popup: updates.popup ? { ...this.config.popup, ...updates.popup } : this.config.popup,
      aiPlanner: updates.aiPlanner
        ? { ...this.config.aiPlanner, ...updates.aiPlanner }
        : this.config.aiPlanner,
    };
    this.persist();
    return this.config;
  }

  public setEnabled(enabled: boolean): DiwaliCampaignConfig {
    return this.updateConfig({ isEnabled: enabled });
  }
}

export const diwaliCampaignStore = new DiwaliCampaignStore();

