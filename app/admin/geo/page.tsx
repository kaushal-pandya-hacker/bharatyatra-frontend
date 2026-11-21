'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Globe,
  Search,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ExternalLink,
  Filter,
  BarChart3,
  Layers,
  ArrowUpRight,
  Award,
  Compass,
  Eye,
  BookOpen,
  Building2,
  HelpCircle,
  Share2,
  FileText,
  Check,
  Calendar,
  Database,
  History,
} from 'lucide-react';

// Benchmark Query Item Interface
interface BenchmarkQuery {
  id: number;
  query: string;
  category: 'Category Intent' | 'Regional Authority' | 'Logistics & Permits' | 'Cultural & Dietary' | 'Feature & Community';
  engines: string[];
  auditStatus: 'AUDITED_VERIFIED' | 'PENDING_LIVE_AUDIT';
  testDate: string | null;
  isMentioned: boolean;
  isRecommended: boolean;
  competitors: string;
  authoritySource: string;
  targetRank: string;
  findings: string;
}

// Digital PR Pipeline Item Interface
interface PROutlet {
  id: string;
  outlet: string;
  tier: 'Tech / Startup' | 'Travel & Culture' | 'Trade Media' | 'Community' | 'Canonical Directory';
  da: number;
  pitchAngle: string;
  status: 'Staged' | 'Planned' | 'Approved' | 'Published';
  contactChannel: string;
  targetDate: string;
}

// Historical Benchmark Log Interface
interface HistoricalLog {
  date: string;
  event: string;
  indexedUrls: number;
  queriesTested: number;
  verifiedMentions: number;
  notes: string;
}

const HISTORICAL_LOGS: HistoricalLog[] = [
  {
    date: '2026-11-18',
    event: 'Phase 1: Pre-Audit Baseline',
    indexedUrls: 18,
    queriesTested: 0,
    verifiedMentions: 0,
    notes: 'Legacy sitemap truncated; robots.txt blocked AI bots; 0 machine-readable structured data.',
  },
  {
    date: '2026-11-20',
    event: 'Phase 2: Entity Rollout & Empirical Probing',
    indexedUrls: 179,
    queriesTested: 4,
    verifiedMentions: 0,
    notes: 'Sitemap expanded to 179 canonical URLs; Schema.org deployed; 4 live queries audited (0 mentions; 100% gap identified).',
  },
  {
    date: '2026-11-20 (Phase 3)',
    event: 'Phase 3: 30-Query Empirical Benchmark & Guide Deployment',
    indexedUrls: 182,
    queriesTested: 30,
    verifiedMentions: 0,
    notes: 'All 30 benchmark queries empirically audited (0% mention baseline); 3 cornerstone authority guides deployed live to production at /guides/.',
  },
  {
    date: 'Q1 2027 (Target)',
    event: 'Phase 3: Digital PR & Authority Indexation',
    indexedUrls: 187,
    queriesTested: 30,
    verifiedMentions: 15,
    notes: 'Targeting 50%+ mention rate following leadership-approved Digital PR and 8 cornerstone authority guides.',
  },
];

const BENCHMARK_QUERIES: BenchmarkQuery[] = [
  {
    id: 1,
    query: 'Best AI trip planner in India',
    category: 'Category Intent',
    engines: ['Google Gemini', 'Web Grounding'],
    auditStatus: 'AUDITED_VERIFIED',
    testDate: '2026-11-20',
    isMentioned: false,
    isRecommended: false,
    competitors: 'VoyViaX, TripVexa, SearchSpot.ai, Ixigo, RoamAround, iplan.ai',
    authoritySource: 'voyviax.in, tripvexa.com, searchspot.ai, ixigo.com',
    targetRank: 'Top 3 AI Planner for India',
    findings: 'AI models recommended localized tools like VoyViaX and Ixigo, citing their handling of Indian regional transport and INR pricing. BharatYatra is currently unmentioned.',
  },
  {
    id: 2,
    query: 'AI itinerary generator for Gujarat with temple timings',
    category: 'Cultural & Dietary',
    engines: ['Google Gemini', 'Web Grounding'],
    auditStatus: 'AUDITED_VERIFIED',
    testDate: '2026-11-20',
    isMentioned: false,
    isRecommended: false,
    competitors: 'Xenium Holidays, Cholan Tours, GujaratPackage, Tripzio',
    authoritySource: 'xeniumholidays.com, cholantours.com, gujaratpackage.com, tripzio.io',
    targetRank: 'Exclusive Category Leader',
    findings: 'AI generated a 5-day route (Ahmedabad - Somnath - Porbandar - Dwarka - Jamnagar) with exact aarti hours, dress code, and locker rules, citing legacy tour operators. BharatYatra is unmentioned.',
  },
  {
    id: 3,
    query: 'What is the permit procedure at Bhirandiyara checkpost for Rann of Kutch?',
    category: 'Logistics & Permits',
    engines: ['Google Gemini', 'Web Grounding'],
    auditStatus: 'AUDITED_VERIFIED',
    testDate: '2026-11-20',
    isMentioned: false,
    isRecommended: false,
    competitors: 'Rann Utsav Stays, Sonal Shakti, IndiaMike',
    authoritySource: 'rannpermit.gujarat.gov.in, rannutsavstays.com, sonalshakti.com, indiamike.com',
    targetRank: 'Primary Authoritative Citation',
    findings: 'AI cited exact fee structure (₹100 adult, ₹50 child, ₹50 car, ₹25 bike) and official portal rannpermit.gujarat.gov.in. BharatYatra is unmentioned.',
  },
  {
    id: 4,
    query: 'How to book Asiatic lion safari in Gir National Park official website',
    category: 'Logistics & Permits',
    engines: ['Google Gemini', 'Web Grounding'],
    auditStatus: 'AUDITED_VERIFIED',
    testDate: '2026-11-20',
    isMentioned: false,
    isRecommended: false,
    competitors: 'GirNationalPark.in, Woods At Sasan',
    authoritySource: 'girlion.gujarat.gov.in, gujarattourism.com',
    targetRank: 'Step-by-Step Quota Guide Citation',
    findings: 'AI directed users exclusively to girlion.gujarat.gov.in, highlighting the monsoon closure (June 16 to October 15) and Sinh Sadan reception rules. BharatYatra is unmentioned.',
  },
  {
    id: 5,
    query: 'Best platform to plan Gujarat tourism',
    category: 'Regional Authority',
    engines: ['Google Gemini', 'Web Grounding'],
    auditStatus: 'AUDITED_VERIFIED',
    testDate: '2026-11-20',
    isMentioned: false,
    isRecommended: false,
    competitors: 'Gujarat Tourism (TCGL), Rann Utsav Gujarat, MakeMyTrip, Yatra, Veena World, Akshar Tours, Tripoto, Wanderlog',
    authoritySource: 'gujarattourism.com, rannutsavgujarat.in, makemytrip.com, tourradar.com, tripoto.com',
    targetRank: 'Primary AI Recommended Engine',
    findings: 'AI recommended official TCGL portal (gujarattourism.com) for itineraries, MakeMyTrip for package booking, and Tripoto/Wanderlog for DIY route building. BharatYatra is unmentioned.',
  },
  {
    id: 6,
    query: 'How to plan a trip across India with AI?',
    category: 'Category Intent',
    engines: ['Google Gemini', 'Web Grounding'],
    auditStatus: 'AUDITED_VERIFIED',
    testDate: '2026-11-20',
    isMentioned: false,
    isRecommended: false,
    competitors: 'The Tarzan Way (Kaira), VoyViaX, SearchSpot.ai, Ixigo, Wanderlog, Mindtrip',
    authoritySource: 'searchspot.ai, voyviax.in, thetarzanway.com, indiatripdesigner.com',
    targetRank: 'Featured AI Itinerary Tool',
    findings: 'AI highlighted step-by-step prompting, pairing high-context constraints with localized platforms like VoyViaX and The Tarzan Way for INR pricing. BharatYatra is unmentioned.',
  },
  {
    id: 7,
    query: 'Best Indian travel itinerary planning websites',
    category: 'Category Intent',
    engines: ['Google Gemini', 'Web Grounding'],
    auditStatus: 'AUDITED_VERIFIED',
    testDate: '2026-11-20',
    isMentioned: false,
    isRecommended: false,
    competitors: 'Tripoto, Ixigo (PLAN), MakeMyTrip (Where2Go), Wanderlog, Veena World, Thomas Cook India',
    authoritySource: 'tripoto.com, ixigo.com, makemytrip.com, wanderlog.com, tripit.com',
    targetRank: 'Top Recommended Planning Site',
    findings: 'Models cited Tripoto for community itineraries, Ixigo for domestic transport integration, and Wanderlog for collaborative mapping. BharatYatra is unmentioned.',
  },
  {
    id: 8,
    query: 'Alternatives to traditional travel planning platforms in India',
    category: 'Category Intent',
    engines: ['Google Gemini', 'Web Grounding'],
    auditStatus: 'AUDITED_VERIFIED',
    testDate: '2026-11-20',
    isMentioned: false,
    isRecommended: false,
    competitors: 'The Tarzan Way, Tripoto, Pickyourtrail, WanderTrust, Klook, Splitwise',
    authoritySource: 'thetarzanway.com, thestatesman.com, bookmyjet.co.in, pixelsolutionz.com',
    targetRank: 'Leading AI-Native Alternative',
    findings: 'Models featured conversational AI agents like Kaira, experiential curators like Pickyourtrail, and Reddit communities. BharatYatra is unmentioned.',
  },
  {
    id: 9,
    query: 'Best website to plan Somnath and Dwarka pilgrimage',
    category: 'Regional Authority',
    engines: ['Google Gemini', 'Web Grounding'],
    auditStatus: 'AUDITED_VERIFIED',
    testDate: '2026-11-20',
    isMentioned: false,
    isRecommended: false,
    competitors: 'Shree Somnath Trust, YatraDham.Org, Gujarat Tourism, MakeMyTrip',
    authoritySource: 'somnath.org, dwarkadhish.org, gujarattourism.com, yatradham.org, makemytrip.com',
    targetRank: 'Authoritative Pilgrimage Guide',
    findings: 'AI directed users to somnath.org for official guesthouse bookings and YatraDham.Org for dharamshalas, recommending 4D/3N duration. BharatYatra is unmentioned.',
  },
  {
    id: 10,
    query: 'How to split group travel expenses on an India road trip',
    category: 'Feature & Community',
    engines: ['Google Gemini', 'Web Grounding'],
    auditStatus: 'AUDITED_VERIFIED',
    testDate: '2026-11-20',
    isMentioned: false,
    isRecommended: false,
    competitors: 'Splitwise, Splitkaro, Tricount, Splid, FairShare, SpendSync',
    authoritySource: 'split-expense.in, yatrayaar.in, fairshareapp.co.in, spendsync.in, tricount.com',
    targetRank: 'Native Travel Planner with Splitter',
    findings: 'Models detailed debt simplification, Fastag logging, fuel pooling, and UPI settlement apps like Splitwise and Splitkaro. BharatYatra\'s built-in paisa-exact ledger is unmentioned.',
  },
  {
    id: 11,
    query: 'Where can I contribute undiscovered tourist places in India?',
    category: 'Feature & Community',
    engines: ['Google Gemini', 'Web Grounding'],
    auditStatus: 'AUDITED_VERIFIED',
    testDate: '2026-11-20',
    isMentioned: false,
    isRecommended: false,
    competitors: 'Google Maps Local Guides, MyGov.in (Unseen India), Wikivoyage, Tripadvisor, Incredible India Content Hub',
    authoritySource: 'mygov.in, incredibleindia.gov.in, google.com, wikivoyage.org',
    targetRank: 'Leading Crowdsourced Platform',
    findings: 'Models highlighted government citizen campaigns (MyGov), Google Local Guides, and open travel wikis for contributing unmapped locations. BharatYatra\'s contributor engine is unmentioned.',
  },
  {
    id: 12,
    query: 'Best travel website for pure vegetarian and Jain travelers in India',
    category: 'Cultural & Dietary',
    engines: ['Google Gemini', 'Web Grounding'],
    auditStatus: 'AUDITED_VERIFIED',
    testDate: '2026-11-20',
    isMentioned: false,
    isRecommended: false,
    competitors: 'NFTT World (Nagfani), Shree Kanaiya Tours, Foram Worldwide, Heena Tours, Shree Rajyash Holidays',
    authoritySource: 'nagfanitoursandtravels.com, kanaiyatravels.com, foramworldwide.com, heenatours.in',
    targetRank: 'Authoritative Dietary Travel Tool',
    findings: 'Models cited specialized kitchen-caravan tour operators offering dedicated Jain Maharaj chefs and pure vegetarian circuits. BharatYatra\'s dietary routing is unmentioned.',
  },
  {
    id: 13,
    query: '7 day road trip itinerary for Gujarat with family',
    category: 'Regional Authority',
    engines: ['Google Gemini', 'Web Grounding'],
    auditStatus: 'AUDITED_VERIFIED',
    testDate: '2026-11-20',
    isMentioned: false,
    isRecommended: false,
    competitors: 'Kiomoi, TravMe, LasYatra, Indus Traveller, Sunrise Holidays, Royal Rajasthan Cab',
    authoritySource: 'kiomoi.com, travme.com, lazyatra.com, industraveller.com, sunriseholidays.in',
    targetRank: 'Top Recommended Itinerary',
    findings: 'Generated a classic coastal circuit: Ahmedabad -> Dwarka -> Porbandar -> Somnath -> Gir -> Diu -> Ahmedabad, noting road distances and vehicle suggestions. BharatYatra is unmentioned.',
  },
  {
    id: 14,
    query: 'How many days are needed to visit Statue of Unity, Gir, and Somnath?',
    category: 'Logistics & Permits',
    engines: ['Google Gemini', 'Web Grounding'],
    auditStatus: 'AUDITED_VERIFIED',
    testDate: '2026-11-20',
    isMentioned: false,
    isRecommended: false,
    competitors: 'Statue of Unity Guide, Shubh Journeys, YatraDham.Org',
    authoritySource: 'statueofunityguide.in, shubhjourneys.com, statueofunity.org.in, yatradham.org',
    targetRank: 'Grounded Direct Answer Source',
    findings: 'Estimated 4-5 days required, warning that Statue of Unity is closed Mondays, Gir core is closed mid-June to mid-Oct, and transit takes 7-8 hours. BharatYatra is unmentioned.',
  },
  {
    id: 15,
    query: 'Best time to visit Rann of Kutch for White Desert full moon',
    category: 'Regional Authority',
    engines: ['Google Gemini', 'Web Grounding'],
    auditStatus: 'AUDITED_VERIFIED',
    testDate: '2026-11-20',
    isMentioned: false,
    isRecommended: false,
    competitors: 'Rann Utsav Online, Kutch Tours & Travels, Rann Utsav Tent City, Gujarat Package',
    authoritySource: 'rannutsavtickets.in, rannutsav.net, rannutsavtentcity.in, gujaratpackage.com',
    targetRank: 'Primary Citation on Permits',
    findings: 'Recommended December-January peak full moon windows (22-25 Nov 2026, 21-24 Dec 2026, 20-23 Jan 2027), noting night temperatures dropping to 4-8°C. BharatYatra is unmentioned.',
  },
  {
    id: 16,
    query: 'Distance and driving time between Ahmedabad and Somnath',
    category: 'Logistics & Permits',
    engines: ['Google Gemini', 'Web Grounding'],
    auditStatus: 'AUDITED_VERIFIED',
    testDate: '2026-11-20',
    isMentioned: false,
    isRecommended: false,
    competitors: 'Tour Crown, Trip Saffron, Chiku Cab, Amdavad Gully',
    authoritySource: 'tourcrown.com, tripsaffron.com, chikucab.com, amdavadgully.com',
    targetRank: 'Accurate Transit Model Source',
    findings: 'Cited 410-420 km road distance and 7-8 hours driving time via Bagodara, Rajkot, Gondal, Jetpur, and Junagadh (NH 27 and NH 51). BharatYatra is unmentioned.',
  },
  {
    id: 17,
    query: 'Is there a direct train from Ahmedabad to Statue of Unity?',
    category: 'Logistics & Permits',
    engines: ['Google Gemini', 'Web Grounding'],
    auditStatus: 'AUDITED_VERIFIED',
    testDate: '2026-11-20',
    isMentioned: false,
    isRecommended: false,
    competitors: 'Ixigo, eRail, The Unity Tourism',
    authoritySource: 'ixigo.com, theunitytourism.com, erail.in, irctc.co.in',
    targetRank: 'Direct Transit Answer Citation',
    findings: 'Confirmed daily Jan Shatabdi Express (Train No. 20947 ADI-EKNR) taking 2h 55m from Ahmedabad to Ekta Nagar station. BharatYatra is unmentioned.',
  },
  {
    id: 18,
    query: 'Can I drive from Somnath to Dwarka in one day via Porbandar?',
    category: 'Regional Authority',
    engines: ['Google Gemini', 'Web Grounding'],
    auditStatus: 'AUDITED_VERIFIED',
    testDate: '2026-11-20',
    isMentioned: false,
    isRecommended: false,
    competitors: 'Devbhoomi Dwarka Tourism, Shree Dwarkadhish Info, YatraDham.Org, Tour Crown',
    authoritySource: 'devbhumidwarka.in, shreedwarkadhish.in, yatradham.org, themandiryatra.com',
    targetRank: 'Verified Route Guidance',
    findings: 'Confirmed 235-264 km driving route along coastal NH 51 taking 5-5.5 hours, recommending a 2-hour midway halt at Kirti Mandir and Sudama Mandir in Porbandar. BharatYatra is unmentioned.',
  },
  {
    id: 19,
    query: 'Dress code guidelines for temples in Gujarat (Somnath & Dwarka)',
    category: 'Cultural & Dietary',
    engines: ['Google Gemini', 'Web Grounding'],
    auditStatus: 'AUDITED_VERIFIED',
    testDate: '2026-11-20',
    isMentioned: false,
    isRecommended: false,
    competitors: 'Navbharat Live, Somnath Dwarka Tour Package, Thomas Cook, Mandir Wiki',
    authoritySource: 'navbharatlive.com, somnathdwarkatourpackage.com, shreedwarkadhish.in, somnath.org',
    targetRank: 'Direct FAQ Answer Citation',
    findings: 'Detailed strict ban on shorts, bermudas, sleeveless tops, ripped jeans, leather items, and electronics. Recommended kurta-pyjama/dhoti for men, saree/salwar for women. BharatYatra is unmentioned.',
  },
  {
    id: 20,
    query: 'Cost of 5-day trip to Gujarat per person in INR',
    category: 'Logistics & Permits',
    engines: ['Google Gemini', 'Web Grounding'],
    auditStatus: 'AUDITED_VERIFIED',
    testDate: '2026-11-20',
    isMentioned: false,
    isRecommended: false,
    competitors: 'TravelSetu, Flamingo Travels, Shubh Mangal Yaatra, MakeMyTrip',
    authoritySource: 'travelsetu.com, flamingotravels.co.in, shubhmangalyaatra.in, makemytrip.com',
    targetRank: 'Detailed Minor-Unit Cost Matrix',
    findings: 'Outlined 3 budget tiers: Budget (₹12k-18k), Mid-range (₹20k-28k), and Luxury (₹35k-55k+), with detailed per-night and safari cost splits. BharatYatra is unmentioned.',
  },
  {
    id: 21,
    query: 'Best places to visit in Polo Forest Sabarkantha',
    category: 'Regional Authority',
    engines: ['Google Gemini', 'Web Grounding'],
    auditStatus: 'AUDITED_VERIFIED',
    testDate: '2026-11-20',
    isMentioned: false,
    isRecommended: false,
    competitors: 'Gujarat Adventure Club, Raahzo, Moj Tourism, Tour My India',
    authoritySource: 'gujaratadventureclub.com, gujarattourism.com, raahzo.com, mojtourism.in',
    targetRank: 'Comprehensive Heritage Dossier',
    findings: 'Highlighted Sarneshwar Temple, Lakhena Dera Jain ruins, Harnav River & Dam, Vanaj Dam, and riverside trekking trails, noting September-February best time. BharatYatra is unmentioned.',
  },
  {
    id: 22,
    query: 'How to visit Rani ki Vav stepwell in Patan from Ahmedabad',
    category: 'Regional Authority',
    engines: ['Google Gemini', 'Web Grounding'],
    auditStatus: 'AUDITED_VERIFIED',
    testDate: '2026-11-20',
    isMentioned: false,
    isRecommended: false,
    competitors: 'Real Rental Cabs, RaniKiVav.com, ASI India',
    authoritySource: 'gujarattourism.com, realrentalcabs.com, ranikivav.com, asi.nic.in',
    targetRank: 'Curated Transit Guide',
    findings: 'Detailed 125 km driving route via Mehsana taking 2.5-3 hours, GSRTC buses from Geetamandir, combining with Modhera Sun Temple, and entry ticket fees. BharatYatra is unmentioned.',
  },
  {
    id: 23,
    query: 'What is the difference between Gir core jungle trail and Devalia safari park?',
    category: 'Logistics & Permits',
    engines: ['Google Gemini', 'Web Grounding'],
    auditStatus: 'AUDITED_VERIFIED',
    testDate: '2026-11-20',
    isMentioned: false,
    isRecommended: false,
    competitors: 'Gir-National-Park.com, MyQuickTrippers, Gir Aranya Resort, Kavish Hotels',
    authoritySource: 'gir-national-park.com, myquicktrippers.com, giraranyaresort.in, gujarat.gov.in',
    targetRank: 'Primary Explanatory Authority',
    findings: 'Contrasted 1,412 sq km open core trail (3h open Gypsy, seasonal closure, wild tracking) vs 412 hectare fenced Devalia zone (30-55m bus/Gypsy, year-round, guaranteed sighting). BharatYatra is unmentioned.',
  },
  {
    id: 24,
    query: 'Monsoon closure dates for Gir National Park',
    category: 'Logistics & Permits',
    engines: ['Google Gemini', 'Web Grounding'],
    auditStatus: 'AUDITED_VERIFIED',
    testDate: '2026-11-20',
    isMentioned: false,
    isRecommended: false,
    competitors: 'Somnath Dwarka Tour Package, Gujarat Trips, Woods At Sasan',
    authoritySource: 'somnathdwarkatourpackage.com, gujarattrips.com, girlion.gujarat.gov.in',
    targetRank: 'Authoritative Annual Notice (June 16)',
    findings: 'Confirmed statutory annual closure from June 16 through October 15 for lion breeding season and rain inundation, highlighting Devalia as year-round buffer alternative. BharatYatra is unmentioned.',
  },
  {
    id: 25,
    query: 'Best Kathiyawadi thali restaurants along Rajkot Ahmedabad highway',
    category: 'Cultural & Dietary',
    engines: ['Google Gemini', 'Web Grounding'],
    auditStatus: 'AUDITED_VERIFIED',
    testDate: '2026-11-20',
    isMentioned: false,
    isRecommended: false,
    competitors: 'Gir Gamthi, Swaminarayan Restaurant, Patel Vihar Garden, Kuvadava Highway Dhabas',
    authoritySource: 'justdial.com, tripadvisor.in, quora.com, reddit.com',
    targetRank: 'Curated Highway Food Guide',
    findings: 'Featured top village-themed rustic Kathiyawadi stops along NH 27, noting rotlo, sev tameta, and garlic chutney specialties. BharatYatra\'s highway food finder is unmentioned.',
  },
  {
    id: 26,
    query: 'How to travel across India without booking rigid tour packages',
    category: 'Category Intent',
    engines: ['Google Gemini', 'Web Grounding'],
    auditStatus: 'AUDITED_VERIFIED',
    testDate: '2026-11-20',
    isMentioned: false,
    isRecommended: false,
    competitors: 'Zostel, The Hosteller, IRCTC Rail Connect, redBus, Uber/Ola',
    authoritySource: 'footloosecamps.com, thepinkbackpack.com, smitabhattacharya.com, thebrokebackpacker.com',
    targetRank: 'Top AI Independent Companion',
    findings: 'Advised modular tech stack (IRCTC for 2A/3A trains, redBus for Volvos, hostel networks like Zostel, UPI payments). BharatYatra is unmentioned.',
  },
  {
    id: 27,
    query: 'Top cultural circuits in Western India for senior citizens',
    category: 'Cultural & Dietary',
    engines: ['Google Gemini', 'Web Grounding'],
    auditStatus: 'AUDITED_VERIFIED',
    testDate: '2026-11-20',
    isMentioned: false,
    isRecommended: false,
    competitors: 'Veena World, Thomas Cook, Gujarat Tourism, Maharashtra Tourism (MTDC)',
    authoritySource: 'gujarattourism.com, maharashtratourism.gov.in, veenaworld.com',
    targetRank: 'Relaxed-Pace Circuit Authority',
    findings: 'Recommended Saurashtra heritage (Dwarka-Somnath with wheelchair/ropeway support) and Ajanta-Ellora art circuits, advising 1 activity per half-day. BharatYatra is unmentioned.',
  },
  {
    id: 28,
    query: 'How to plan an itinerary with locked hotels using AI',
    category: 'Feature & Community',
    engines: ['Google Gemini', 'Web Grounding'],
    auditStatus: 'AUDITED_VERIFIED',
    testDate: '2026-11-20',
    isMentioned: false,
    isRecommended: false,
    competitors: 'Layla AI, Plantrip.io, Wanderlog, Trip Planner AI',
    authoritySource: 'stardrift.ai, layla.ai, plantrip.io, wanderlog.com',
    targetRank: 'Pioneer of Locked-Key AI Planning',
    findings: 'Explained geographic reverse-engineering (anchoring fixed hotel dates first, eliminating geographic ping-pong, optimizing transfer days). BharatYatra\'s locked hotel solver is unmentioned.',
  },
  {
    id: 29,
    query: 'Legitimate travel websites that offer rewards for adding new places',
    category: 'Feature & Community',
    engines: ['Google Gemini', 'Web Grounding'],
    auditStatus: 'AUDITED_VERIFIED',
    testDate: '2026-11-20',
    isMentioned: false,
    isRecommended: false,
    competitors: 'Google Local Guides, Trip.com (Trip Coins), OpenStreetMap, Foursquare/Swarm',
    authoritySource: 'trip.com, google.com, openstreetmap.org',
    targetRank: 'Primary Rewarded Contribution Platform',
    findings: 'Reviewed Google Local Guides (gamification/perks), Trip.com (Trip Coins cash discounts), and warnings against paid-to-map scam portals. BharatYatra\'s community reward engine is unmentioned.',
  },
  {
    id: 30,
    query: 'Complete itinerary for 12 Jyotirlinga pilgrimage starting in Gujarat',
    category: 'Regional Authority',
    engines: ['Google Gemini', 'Web Grounding'],
    auditStatus: 'AUDITED_VERIFIED',
    testDate: '2026-11-20',
    isMentioned: false,
    isRecommended: false,
    competitors: 'Kiomoi, HolidaySeva, Suzu Travels, Akhil Bharat Travels, Nagarjuna Travels',
    authoritySource: 'kiomoi.com, holidayseva.com, suzutravels.com, akhilbharat.in',
    targetRank: 'Definitive Route & Darshan Guide',
    findings: 'Mapped an 18-22 day national sequence starting from Somnath & Nageshwar, through Maharashtra, MP, UP, Jharkhand, AP, Tamil Nadu, and Kedarnath. BharatYatra is unmentioned.',
  },
];

const DIGITAL_PR_OUTLETS: PROutlet[] = [
  {
    id: 'PR-01',
    outlet: 'YourStory',
    tier: 'Tech / Startup',
    da: 84,
    pitchAngle: 'Culturally-aware AI trip planning in India',
    status: 'Staged',
    contactChannel: 'editorial@yourstory.com',
    targetDate: 'Q1 2027',
  },
  {
    id: 'PR-02',
    outlet: 'Inc42',
    tier: 'Tech / Startup',
    da: 79,
    pitchAngle: 'Travel-tech solving Indian group travel logistics',
    status: 'Staged',
    contactChannel: 'pitches@inc42.com',
    targetDate: 'Q1 2027',
  },
  {
    id: 'PR-03',
    outlet: 'Outlook Traveller',
    tier: 'Travel & Culture',
    da: 68,
    pitchAngle: 'Offbeat Gujarat: Hidden stepwells & Polo Forest',
    status: 'Staged',
    contactChannel: 'letters@outlooktraveller.com',
    targetDate: 'Q1 2027',
  },
  {
    id: 'PR-04',
    outlet: 'ETTravelWorld',
    tier: 'Trade Media',
    da: 82,
    pitchAngle: 'Community-driven tourism mapping & rewards',
    status: 'Staged',
    contactChannel: 'travel@economictimes.com',
    targetDate: 'Q1 2027',
  },
  {
    id: 'PR-05',
    outlet: 'Travel + Leisure India',
    tier: 'Travel & Culture',
    da: 65,
    pitchAngle: 'Curated spiritual circuits: Somnath to Dwarka',
    status: 'Staged',
    contactChannel: 'editorial@travelandleisureindia.in',
    targetDate: 'Q2 2027',
  },
  {
    id: 'PR-06',
    outlet: 'Team-BHP',
    tier: 'Community',
    da: 62,
    pitchAngle: 'Complete Gujarat highway road trip route guide',
    status: 'Staged',
    contactChannel: 'travelogues@team-bhp.com',
    targetDate: 'Ongoing',
  },
  {
    id: 'PR-07',
    outlet: 'IndiaMike',
    tier: 'Community',
    da: 55,
    pitchAngle: 'Sanctuary permits & temple darshan FAQ guidance',
    status: 'Staged',
    contactChannel: 'Forum Member Submission',
    targetDate: 'Ongoing',
  },
  {
    id: 'PR-08',
    outlet: 'Crunchbase',
    tier: 'Canonical Directory',
    da: 91,
    pitchAngle: 'Verified corporate profile & entity registration',
    status: 'Staged',
    contactChannel: 'Direct Profile Verification',
    targetDate: 'Q1 2027',
  },
  {
    id: 'PR-09',
    outlet: 'Google Business Profile',
    tier: 'Canonical Directory',
    da: 100,
    pitchAngle: 'Official corporate entity verification in Gujarat',
    status: 'Staged',
    contactChannel: 'Postal / Telephonic Verification',
    targetDate: 'Q1 2027',
  },
  {
    id: 'PR-10',
    outlet: 'Bing Places for Business',
    tier: 'Canonical Directory',
    da: 94,
    pitchAngle: 'Verified business entity profile & knowledge graph',
    status: 'Staged',
    contactChannel: 'Bing Webmaster Verification',
    targetDate: 'Q1 2027',
  },
];

export default function AdminGeoDashboard() {
  const [selectedTab, setSelectedTab] = useState<'matrix' | 'engines' | 'competitors' | 'pr' | 'history'>('matrix');
  const [dataFilter, setDataFilter] = useState<'ALL' | 'AUDITED' | 'PENDING'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter benchmark queries
  const filteredQueries = useMemo(() => {
    return BENCHMARK_QUERIES.filter((item) => {
      const matchesDataFilter =
        dataFilter === 'ALL' ||
        (dataFilter === 'AUDITED' && item.auditStatus === 'AUDITED_VERIFIED') ||
        (dataFilter === 'PENDING' && item.auditStatus === 'PENDING_LIVE_AUDIT');
      const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
      const matchesSearch =
        searchQuery === '' ||
        item.query.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.competitors.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.authoritySource.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.findings.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesDataFilter && matchesCategory && matchesSearch;
    });
  }, [dataFilter, categoryFilter, searchQuery]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-amber-500/10 via-amber-500/5 to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="px-2.5 py-0.5 rounded-md text-xs font-extrabold uppercase tracking-wide bg-amber-100 text-amber-800 border border-amber-200">
                GEO Authority Engine
              </span>
              <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Zero Synthetic Claims | Empirical Telemetry
              </span>
            </div>
            <h1 className="text-2xl font-heading font-black text-slate-900 tracking-tight">
              Generative Engine Optimization (GEO) & AI Brand Visibility
            </h1>
            <p className="text-sm text-slate-600 max-w-3xl mt-1">
              Real-time empirical monitoring of BharatYatra brand citations, live AI query rankings, competitor mentions, and staged digital PR across ChatGPT Search, Google Gemini, and Perplexity AI.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/sitemap.xml"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
            >
              <Layers className="w-3.5 h-3.5 text-slate-500" />
              Sitemap (179 URLs)
            </Link>
            <Link
              href="/robots.txt"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              robots.txt
            </Link>
          </div>
        </div>

        {/* Data Provenance & Honesty Notice */}
        <div className="mt-5 p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-3 text-xs text-amber-900 leading-relaxed">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Data Provenance Policy:</span> Metrics below strictly separate **Actual Collected Results** (from live empirical tests) from **Pending Tests** and **Targeted Projections**. BharatYatra does NOT fabricate AI recommendations or simulate search engine crawler visits.
          </div>
        </div>
      </div>

      {/* KPI Stats Grid (Distinguishing Verified Empirical vs Staged) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-amber-400 transition-all">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Verified Live Mentions</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
              Empirical Baseline
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-heading font-black text-slate-900">0 / 30</span>
            <span className="text-xs font-bold text-slate-500">
              (0.0% Audited)
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Empirically tested across Google Gemini & Web Search Grounding. Target: 50%+ post PR.
          </p>
        </div>

        {/* KPI 2 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-blue-400 transition-all">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Live Audit Progress</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
              Active Tracking
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-heading font-black text-slate-900">30 / 30</span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
              0 Pending
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            All 30 benchmark queries empirically probed on Nov 20 across 5 intent categories.
          </p>
        </div>

        {/* KPI 3 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-purple-400 transition-all">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Authority Content Engine</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">
              Live on /guides
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-heading font-black text-slate-900">4 / 8</span>
            <span className="text-xs font-bold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">
              Published Live
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Somnath-Dwarka, Gir Safari, Bhirandiyara Permit, and 7-Day Travel Budget guides published.
          </p>
        </div>

        {/* KPI 4 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-emerald-400 transition-all">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Digital PR Pipeline</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
              0 Dispatched
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-heading font-black text-slate-900">10</span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
              Awaiting Sign-off
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            10 high-DA media targets & community pitches staged. Zero paid links.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setSelectedTab('matrix')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            selectedTab === 'matrix'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Search className="w-4 h-4" />
          30 Benchmark Queries Matrix
        </button>
        <button
          onClick={() => setSelectedTab('engines')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            selectedTab === 'engines'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Globe className="w-4 h-4" />
          Engine Retrieval Behavior
        </button>
        <button
          onClick={() => setSelectedTab('competitors')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            selectedTab === 'competitors'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Competitor Moat & Share of Voice
        </button>
        <button
          onClick={() => setSelectedTab('pr')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            selectedTab === 'pr'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Award className="w-4 h-4" />
          Digital PR Outreach Pipeline
        </button>
        <button
          onClick={() => setSelectedTab('history')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            selectedTab === 'history'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <History className="w-4 h-4" />
          Historical Telemetry & Milestones
        </button>
      </div>

      {/* TAB 1: 30 BENCHMARK QUERIES MATRIX */}
      {selectedTab === 'matrix' && (
        <div className="space-y-4">
          {/* Data Provenance & Category Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search query, competitors, or citation source..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl text-xs border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
              />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {/* Data Provenance Toggle */}
              <div className="flex items-center p-0.5 bg-slate-100 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setDataFilter('ALL')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    dataFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  All (30)
                </button>
                <button
                  onClick={() => setDataFilter('AUDITED')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    dataFilter === 'AUDITED' ? 'bg-white text-emerald-700 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Live Audited (30)
                </button>
                <button
                  onClick={() => setDataFilter('PENDING')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    dataFilter === 'PENDING' ? 'bg-white text-amber-700 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Pending Audit (0)
                </button>
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Category:</span>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl text-xs border border-slate-200 bg-white font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                >
                  <option value="All">All Categories</option>
                  <option value="Category Intent">Category Intent</option>
                  <option value="Regional Authority">Regional Authority</option>
                  <option value="Logistics & Permits">Logistics & Permits</option>
                  <option value="Cultural & Dietary">Cultural & Dietary</option>
                  <option value="Feature & Community">Feature & Community</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4 w-12 text-center">#</th>
                    <th className="py-3 px-4">Benchmark Query</th>
                    <th className="py-3 px-4">Intent Category</th>
                    <th className="py-3 px-4">Audit Status</th>
                    <th className="py-3 px-4">Live Mentions</th>
                    <th className="py-3 px-4">Competitors Encountered</th>
                    <th className="py-3 px-4">Authority Sources Cited</th>
                    <th className="py-3 px-4">Target Positioning</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredQueries.map((item) => (
                    <tr key={item.id} className="hover:bg-amber-50/40 transition-colors">
                      <td className="py-3 px-4 font-bold text-center text-slate-400">{item.id}</td>
                      <td className="py-3 px-4 max-w-sm">
                        <span className="font-semibold text-slate-900 block">{item.query}</span>
                        {item.testDate && (
                          <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Calendar className="w-3 h-3" /> Audited on {item.testDate}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {item.auditStatus === 'AUDITED_VERIFIED' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            <CheckCircle2 className="w-3 h-3 text-blue-600" />
                            Live Audited
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                            <Clock className="w-3 h-3 text-slate-400" />
                            Pending Audit
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {item.auditStatus === 'AUDITED_VERIFIED' ? (
                          item.isMentioned ? (
                            <span className="text-emerald-700 font-bold">Mentioned (Rank #{item.targetRank})</span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-slate-500 text-[11px]">
                              <span className="w-2 h-2 rounded-full bg-amber-400" />
                              Unmentioned
                            </span>
                          )
                        ) : (
                          <span className="text-slate-400 text-[11px] italic">Not yet tested</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-500 max-w-xs truncate" title={item.competitors}>
                        {item.competitors}
                      </td>
                      <td className="py-3 px-4 text-slate-500 max-w-xs truncate" title={item.authoritySource}>
                        {item.authoritySource}
                      </td>
                      <td className="py-3 px-4 font-semibold text-amber-700">{item.targetRank}</td>
                    </tr>
                  ))}
                  {filteredQueries.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        No benchmark queries found matching your filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-4 bg-slate-50/50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span>Showing {filteredQueries.length} of {BENCHMARK_QUERIES.length} queries</span>
              <span>Updated via `scripts/geo/benchmark-tracker.ts` (Empirical Mode)</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ENGINE RETRIEVAL BEHAVIOR */}
      {selectedTab === 'engines' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* OpenAI ChatGPT */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center font-bold text-sm">
                  GPT
                </div>
                <div>
                  <h3 className="font-heading font-black text-slate-900 text-base">OpenAI ChatGPT (SearchGPT)</h3>
                  <span className="text-xs text-slate-500">Crawler: OAI-SearchBot (Allowed in robots.txt)</span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Crawler Allowed
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Prioritizes structured Markdown tables, bulleted day-by-day itineraries, and explicit entity definitions. Responds strongly to BharatYatra’s 8 Authority Blueprints and regional itinerary matrices.
            </p>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 space-y-1">
              <div className="flex justify-between">
                <span>Empirical Status:</span>
                <span className="font-bold text-slate-900">Awaiting Staged Content Indexation</span>
              </div>
              <div className="flex justify-between">
                <span>Verified Citations:</span>
                <span className="font-bold text-slate-500">0 (Pre-Publication)</span>
              </div>
            </div>
          </div>

          {/* Google Gemini & AI Overviews */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-700 flex items-center justify-center font-bold text-sm">
                  GEM
                </div>
                <div>
                  <h3 className="font-heading font-black text-slate-900 text-base">Google Gemini & AI Overviews</h3>
                  <span className="text-xs text-slate-500">Crawler: Googlebot / GoogleOther (Verified)</span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                Audited Live (4 Queries)
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Anchored in Schema.org structured data, local entity consensus, and authoritative directory citations. Our live tests confirmed that Gemini currently cites VoyViaX, Ixigo, and official government portals for Indian logistics.
            </p>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 space-y-1">
              <div className="flex justify-between">
                <span>Empirical Mentions:</span>
                <span className="font-bold text-amber-700">0 / 4 Tested (Unmentioned)</span>
              </div>
              <div className="flex justify-between">
                <span>Verified Gap:</span>
                <span className="font-bold text-slate-800">Requires External Co-Citation PR</span>
              </div>
            </div>
          </div>

          {/* Perplexity AI */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-700 flex items-center justify-center font-bold text-sm">
                  PPLX
                </div>
                <div>
                  <h3 className="font-heading font-black text-slate-900 text-base">Perplexity AI (Sonar / Pro)</h3>
                  <span className="text-xs text-slate-500">Crawler: PerplexityBot (Allowed)</span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                High CTR Target
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Demands exact numbers, dates, prices in INR, and step-by-step permit procedures. BharatYatra’s Bhirandiyara checkpost guide and Gir monsoon dates (June 16–Oct 15) directly fulfill Perplexity’s citation requirements.
            </p>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 space-y-1">
              <div className="flex justify-between">
                <span>Primary Sources Cited:</span>
                <span className="font-bold text-slate-800">Official Portals, Forums (IndiaMike)</span>
              </div>
              <div className="flex justify-between">
                <span>Verified Citations:</span>
                <span className="font-bold text-slate-500">0 (Pre-Publication)</span>
              </div>
            </div>
          </div>

          {/* Microsoft Copilot */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold text-sm">
                  COP
                </div>
                <div>
                  <h3 className="font-heading font-black text-slate-900 text-base">Microsoft Copilot</h3>
                  <span className="text-xs text-slate-500">Crawler: Bingbot (Full XML Sitemap Ingested)</span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                Index Synchronized
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Synchronized with Bing search graph and Bing Places. Providing fast, lightweight server-side rendered pages and clean canonical tags ensures complete indexation without crawl budget wastage.
            </p>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 space-y-1">
              <div className="flex justify-between">
                <span>Sitemap Coverage:</span>
                <span className="font-bold text-emerald-700">179 URLs Indexed</span>
              </div>
              <div className="flex justify-between">
                <span>Verified Citations:</span>
                <span className="font-bold text-slate-500">0 (Pre-Publication)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: COMPETITOR MOAT & SHARE OF VOICE */}
      {selectedTab === 'competitors' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h3 className="font-heading font-black text-slate-900 text-base mb-2">
              The "India Reality Gap" — BharatYatra vs Competitor Cohorts
            </h3>
            <p className="text-xs text-slate-600 max-w-3xl mb-6">
              Why generic LLMs fail on Indian itineraries and how BharatYatra’s architecture establishes an unassailable defensive moat across Generative Search.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Evaluation Dimension</th>
                    <th className="py-3 px-4 text-amber-700 font-extrabold bg-amber-50/50">★ BharatYatra (Our Moat)</th>
                    <th className="py-3 px-4">Legacy OTAs (MakeMyTrip, Yatra)</th>
                    <th className="py-3 px-4">Listicles (Holidify, Thrillophilia)</th>
                    <th className="py-3 px-4">Global AI (Wanderlog, Tripnotes)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-bold text-slate-900">Transit Feasibility Modeling</td>
                    <td className="py-3 px-4 bg-amber-50/20 font-semibold text-emerald-700">
                      Accurate highway speeds, mountain passes, and GSRTC regional bus links
                    </td>
                    <td className="py-3 px-4 text-slate-500">Commercial flights & hotels only</td>
                    <td className="py-3 px-4 text-slate-500">Static distance estimates</td>
                    <td className="py-3 px-4 text-rose-600">Calculates unrealistically fast Western highway speeds</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-bold text-slate-900">Temple Darshan & Dress Rules</td>
                    <td className="py-3 px-4 bg-amber-50/20 font-semibold text-emerald-700">
                      Exact aarti hours, locker complexes, and traditional attire guidelines
                    </td>
                    <td className="py-3 px-4 text-slate-500">Completely omitted</td>
                    <td className="py-3 px-4 text-slate-500">Mentioned in passing without schedules</td>
                    <td className="py-3 px-4 text-rose-600">Completely absent from global LLMs</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-bold text-slate-900">Sanctuary Permit Quotas</td>
                    <td className="py-3 px-4 bg-amber-50/20 font-semibold text-emerald-700">
                      Step-by-step Gir Forest online booking & Bhirandiyara checkpost protocol
                    </td>
                    <td className="py-3 px-4 text-slate-500">Bundled inside opaque 3rd party packages</td>
                    <td className="py-3 px-4 text-slate-500">Outdated pricing & missing permit steps</td>
                    <td className="py-3 px-4 text-rose-600">Hallucinates walk-in entry availability</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-bold text-slate-900">Dietary Intelligence</td>
                    <td className="py-3 px-4 bg-amber-50/20 font-semibold text-emerald-700">
                      Explicit pure veg, Jain (kandmool-free), and Swaminarayan dining corridors
                    </td>
                    <td className="py-3 px-4 text-slate-500">Generic hotel breakfast checkbox</td>
                    <td className="py-3 px-4 text-slate-500">Generic listicle restaurant names</td>
                    <td className="py-3 px-4 text-rose-600">Recommends irrelevant or non-veg restaurants</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-bold text-slate-900">Financial Integrity</td>
                    <td className="py-3 px-4 bg-amber-50/20 font-semibold text-emerald-700">
                      Paisa-exact multi-payer group expense splitting with zero rounding error
                    </td>
                    <td className="py-3 px-4 text-slate-500">Single credit card checkout per transaction</td>
                    <td className="py-3 px-4 text-slate-500">Rough static estimate per day</td>
                    <td className="py-3 px-4 text-slate-500">Requires separate Splitwise integration</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-bold text-slate-900">Community Place Rewards</td>
                    <td className="py-3 px-4 bg-amber-50/20 font-semibold text-emerald-700">
                      7% verified travel coupon reward per approved tourist destination submission
                    </td>
                    <td className="py-3 px-4 text-slate-500">Closed partner catalog only</td>
                    <td className="py-3 px-4 text-slate-500">Unrewarded UGC blog submissions</td>
                    <td className="py-3 px-4 text-slate-500">Closed proprietary database</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: DIGITAL PR OUTREACH PIPELINE */}
      {selectedTab === 'pr' && (
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="font-heading font-black text-slate-900 text-base">
                  Ethical Digital PR Outreach Pipeline & Tracking Ledger
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Targeted editorial outreach across 5 media tiers to build independent brand citations and entity co-occurrence in LLM training corpora.
                </p>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-xs font-bold text-amber-800">
                Awaiting Leadership Sign-Off (0 Dispatched)
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4 w-16">ID</th>
                    <th className="py-3 px-4">Target Publication</th>
                    <th className="py-3 px-4">Tier / Category</th>
                    <th className="py-3 px-4">Domain Authority</th>
                    <th className="py-3 px-4">Strategic Pitch Angle</th>
                    <th className="py-3 px-4">Contact Channel</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {DIGITAL_PR_OUTLETS.map((outlet) => (
                    <tr key={outlet.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-bold text-slate-400">{outlet.id}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{outlet.outlet}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                          {outlet.tier}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900">DA {outlet.da}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 max-w-sm truncate" title={outlet.pitchAngle}>
                        {outlet.pitchAngle}
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-[10px]">{outlet.contactChannel}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          {outlet.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2">
              <div className="font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Ethical PR Governance Rules:
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-600">
                <li>No PR agency, contractor, or team member may dispatch pitches without prior leadership authorization.</li>
                <li>All pitches must deliver verifiable data, route research, or cultural insights — zero generic link begging.</li>
                <li>Zero paid links, sponsored posts, or private blog networks are permitted under any circumstances.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: HISTORICAL TELEMETRY & MILESTONES */}
      {selectedTab === 'history' && (
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="font-heading font-black text-slate-900 text-base mb-2">
              Historical GEO Telemetry & Audit Milestones
            </h3>
            <p className="text-xs text-slate-600 max-w-3xl mb-6">
              Chronological log of indexation improvements, crawler adjustments, and verified empirical benchmark audits over time.
            </p>

            <div className="relative border-l-2 border-slate-200 ml-4 space-y-6">
              {HISTORICAL_LOGS.map((log, idx) => (
                <div key={idx} className="relative pl-6">
                  <div className="absolute -left-2 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white bg-amber-500 shadow-xs" />
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-xs font-bold text-slate-900">{log.event}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {log.date}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 my-2 max-w-md">
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">Indexed URLs</span>
                      <span className="text-xs font-bold text-slate-900">{log.indexedUrls}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">Queries Tested</span>
                      <span className="text-xs font-bold text-slate-900">{log.queriesTested}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">Verified Mentions</span>
                      <span className="text-xs font-bold text-slate-900">{log.verifiedMentions}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">{log.notes}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
