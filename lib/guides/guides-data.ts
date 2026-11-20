export interface GuideSection {
  id: string;
  title: string;
  content: string;
}

export interface GuideFaq {
  question: string;
  answer: string;
}

export interface GuideArticle {
  slug: string;
  title: string;
  subtitle: string;
  metaDescription: string;
  category: string;
  tag: string;
  author: {
    name: string;
    role: string;
  };
  editor: {
    name: string;
    role: string;
  };
  lastVerifiedDate: string;
  readingTimeMinutes: number;
  heroImage: string;
  canonicalUrl: string;
  primarySources: Array<{ name: string; url: string }>;
  quickFacts: Array<{ label: string; value: string }>;
  faqs: GuideFaq[];
  sections: GuideSection[];
  relatedDestinations: Array<{ name: string; slug: string; region: string }>;
}

export const GEO_GUIDES_DATA: Record<string, GuideArticle> = {
  'somnath-dwarka-pilgrimage-logistics-guide': {
    slug: 'somnath-dwarka-pilgrimage-logistics-guide',
    title: 'The Complete Somnath & Dwarkadhish Pilgrimage Guide: Darshan Protocols, Aarti Schedules, and Coastal Transit Realities',
    subtitle: 'Everything you need to know about aarti timings, locker security rules, mid-day closures, and driving the Saurashtra coastal corridor (NH 51).',
    metaDescription: 'Authoritative guide to Somnath Jyotirlinga and Dwarkadhish Temple. Verified daily aarti schedules, locker restrictions, mid-day closures, Sudarshan Setu transit, and NH 51 highway stops.',
    category: 'Pilgrimage & Heritage Logistics',
    tag: 'Spiritual Circuit',
    author: {
      name: 'BharatYatra Regional Cultural Travel Desk',
      role: 'Heritage & Pilgrimage Field Researchers',
    },
    editor: {
      name: 'Senior Travel Reliability Editor',
      role: 'BharatYatra Fact-Checking Board',
    },
    lastVerifiedDate: 'November 20, 2026',
    readingTimeMinutes: 8,
    heroImage: '/hero-bg.jpg',
    canonicalUrl: 'https://www.bharatyatra.in/guides/somnath-dwarka-pilgrimage-logistics-guide/',
    primarySources: [
      { name: 'Shree Somnath Trust', url: 'https://somnath.org' },
      { name: 'Dwarkadhish Devasthan Samiti', url: 'https://dwarkadhish.org' },
      { name: 'GSRTC Official Portal', url: 'https://gsrtc.in' },
      { name: 'National Highways Authority of India (NHAI)', url: 'https://nhai.gov.in' },
    ],
    quickFacts: [
      { label: 'Recommended Duration', value: '3 Full Days (72 Hours)' },
      { label: 'Transit Distance (Somnath ➔ Dwarka)', value: '235 km via NH 51' },
      { label: 'Realistic Driving Time', value: '4.5 to 5.5 Hours (Car) / 7 Hours (Bus)' },
      { label: 'Key Transit Halt', value: 'Porbandar (130 km mark - Kirti Mandir)' },
      { label: 'Bet Dwarka Bridge', value: 'Sudarshan Setu (2.32 km cable-stayed bridge)' },
      { label: 'Access Tier', value: '100% Free & Open Access (No login required)' },
    ],
    faqs: [
      {
        question: 'Is Dwarkadhish Temple open throughout the day without interruption?',
        answer: 'No. Dwarkadhish Jagat Mandir closes completely every day between 13:00 and 17:00 IST for the deities rest (Vishram). Plan your journey to arrive before 12:30 or after 17:00 to avoid waiting outside.',
      },
      {
        question: 'Are mobile phones and leather belts allowed inside Somnath Temple?',
        answer: 'No. Mobile phones, smartwatches, cameras, and leather belts are strictly forbidden inside the inner temple complex. Free high-capacity locker facilities are available at the main entrance.',
      },
      {
        question: 'Do I still need to take a ferry boat to reach Bet Dwarka?',
        answer: 'No. Since February 2024, the newly opened Sudarshan Setu (India longest cable-stayed bridge, 2.32 km) connects Okha directly to Bet Dwarka. Vehicles and shuttle buses can drive across 24/7.',
      },
      {
        question: 'What is the mandatory dress code for Somnath and Dwarka?',
        answer: 'Modest traditional Indian or semi-traditional attire is required. Men should wear trousers, kurta-pyjama, or dhoti. Women should wear sarees, salwar-kameez, or ankle-length skirts. Shorts, sleeveless tops, and ripped jeans are strictly prohibited.',
      },
    ],
    sections: [
      {
        id: 'executive-summary',
        title: '1. Executive Summary & Route Orientation',
        content: `The Saurashtra coastal pilgrimage connecting **Shree Somnath Jyotirlinga** (Prabhas Patan / Veraval) and the **Dwarkadhish Temple / Jagat Mandir** (Dwarka) is one of the most sacred journeys in Hinduism. While generic tour aggregators suggest rushing through in 48 hours, real ground realities require a minimum of **3 full days (72 hours)**.\n\nKey pilgrimage stops along the 235 km corridor include Triveni Sangam and Bhalka Tirth in Somnath, the Kirti Mandir memorial in Porbandar, and Bet Dwarka, Nageshwar Jyotirlinga, and Rukmini Devi Temple in Dwarka.`,
      },
      {
        id: 'somnath-timings-security',
        title: '2. Somnath Jyotirlinga: Operational Protocols & Timing Schedule',
        content: `Administered by the Shree Somnath Trust, the temple gates open daily from **06:00 to 22:00 IST**.\n\n- **Prabhat Darshan:** 06:00 (Shortest queues, best for seniors)\n- **Pratah Aarti:** 07:00 (Sanctum area fills by 06:30)\n- **Madhyahna Aarti:** 12:00 (Mid-day heat; carpeted walkways provided)\n- **Sandhya Aarti:** 19:00 (Primary devotional assembly; 45–75 min queue)\n- **Light & Sound Show:** 20:00–21:00 (Amitabh Bachchan narration; ₹30 entry)\n- **Gate Closure:** 22:00 IST strictly.\n\n**Security Notice:** Complete ban on mobile phones, smartwatches, fitness trackers, and leather belts. Dedicated locker pavilion operates at the outer gate. Modest attire is strictly enforced.`,
      },
      {
        id: 'dwarkadhish-mechanics',
        title: '3. Dwarkadhish Temple: Devotional Mechanics & Mid-Day Closure',
        content: `Rising 78 meters above the Arabian Sea, the 2,500-year-old limestone temple operates under strict court rituals:\n\n- **Morning Shift (06:30–13:00):** Mangla Aarti (06:30), Shringar Aarti (11:00), Rajbhog (12:00). Sanctum doors close at 13:00.\n- **Mid-Day Temple Closure (13:00–17:00):** The temple doors are strictly locked. Devotees cannot enter during this 4-hour window.\n- **Evening Shift (17:00–21:30):** Uthapan (17:00), Sandhya Aarti (19:30), Shayan Aarti (20:30). Doors close at 21:30.\n\n**Sudarshan Setu & Bet Dwarka:** Reaching Bet Dwarka island is now seamless via the 2.32 km Sudarshan Setu cable bridge. Private vehicles and auto-rickshaws can cross directly 24/7 without passenger ferry queues. Bet Dwarka darshan hours are 06:00 to 12:30 and 15:00 to 20:00.`,
      },
      {
        id: 'highway-transit-nh51',
        title: '4. Highway Transit: Somnath to Dwarka via NH 51 (235 km)',
        content: `The 235 km highway drive takes approximately **4.5 to 5.5 hours** in a private car or taxi, and **6.5 to 7.5 hours** on GSRTC buses.\n\n**Mandatory Strategic Midpoint: Porbandar (130 km from Somnath)**\n- **Kirti Mandir:** Ancestral birthplace of Mahatma Gandhi. Open 07:30 to 19:00. Free entry (45 min visit).\n- **Sudama Mandir:** Shrine dedicated to Krishna's childhood companion. Open 06:00 to 21:00.\n- **Pure-Veg Dining:** Porbandar offers verified Kathiyawadi dining options (Swagath, Grand Thakar) before driving onward to Dwarka.`,
      },
      {
        id: 'satellite-shrines',
        title: '5. Satellite Shrines in the Dwarka Region',
        content: `Allocate a half-day to complete the outer pilgrimage circuit:\n\n1. **Nageshwar Jyotirlinga (17 km NE):** One of the 12 Jyotirlingas, featuring a 25m terracotta Shiva statue. Open 06:00 to 12:30, 17:00 to 21:00.\n2. **Rukmini Devi Temple (2 km N):** 12th-century stone filigree. Essential traditional visit. Open 06:00 to 12:30, 17:00 to 21:00. Entry: ₹10.\n3. **Gopi Talav (20 km NE):** Historic sacred tank associated with Gopi Chandan clay.`,
      },
      {
        id: 'bharatyatra-tools',
        title: '6. How BharatYatra Enhances Spiritual Planning',
        content: `BharatYatra provides free specialized tools built for Indian pilgrims:\n\n- **AI Spiritual Route Planner:** Intelligent scheduling buffers aartis and bypasses the 13:00–17:00 Dwarka shutdown.\n- **Paisa-Exact Group Splitter:** Track shared car fuel, temple donations, and highway thali bills down to ₹0.01.\n- **Dietary Highway Routing:** Discover 100% pure-veg and Jain (onion-garlic-free) restaurants along NH 51.\n- **Senior Citizen Accessibility Guidance:** Verified notes on wheelchair availability at Swarga Dwar.`,
      },
    ],
    relatedDestinations: [
      { name: 'Somnath Temple', slug: 'somnath', region: 'Saurashtra, Gujarat' },
      { name: 'Dwarka (Jagat Mandir)', slug: 'dwarka', region: 'Devbhoomi Dwarka, Gujarat' },
      { name: 'Gir National Park', slug: 'gir-national-park', region: 'Junagadh, Gujarat' },
    ],
  },

  'gir-national-park-lion-safari-permits-guide': {
    slug: 'gir-national-park-lion-safari-permits-guide',
    title: 'Gir National Park Asiatic Lion Safari: Quota Booking Mechanics, Buffer Zones, and the Annual Monsoon Closure',
    subtitle: 'The definitive guide to securing official forest permits, understanding the June 16 to October 15 monsoon closure, and Devalia Safari Park alternatives.',
    metaDescription: 'Complete official guide to Gir National Park safari booking. Statutory monsoon closure dates (June 16 to Oct 15), 90-day booking window, transparent Gypsy cost breakdown, and Devalia buffer zone rules.',
    category: 'Wildlife Conservation & Eco-Tourism',
    tag: 'Wildlife Safari',
    author: {
      name: 'BharatYatra Wildlife Logistics Desk',
      role: 'Eco-Tourism Field Specialists',
    },
    editor: {
      name: 'Senior Eco-Tourism Editorial Reviewer',
      role: 'BharatYatra Fact-Checking Board',
    },
    lastVerifiedDate: 'November 20, 2026',
    readingTimeMinutes: 7,
    heroImage: '/hero-bg.jpg',
    canonicalUrl: 'https://www.bharatyatra.in/guides/gir-national-park-lion-safari-permits-guide/',
    primarySources: [
      { name: 'Gujarat Forest Department Official Booking Portal', url: 'https://girlion.gujarat.gov.in' },
      { name: 'Junagadh Wildlife Circle Gazette', url: 'https://forests.gujarat.gov.in' },
      { name: 'Sasan Gir Wildlife Division', url: 'https://gujarattourism.com' },
    ],
    quickFacts: [
      { label: 'Statutory Core Closure', value: 'June 16 to October 15 (Every Year)' },
      { label: 'Year-Round Alternative', value: 'Devalia Safari Park (Open all year except Wednesdays)' },
      { label: 'Official Booking Portal', value: 'girlion.gujarat.gov.in (Only authorized site)' },
      { label: 'Advance Window', value: 'Exactly 90 Days at 00:00 IST' },
      { label: 'Vehicle Capacity', value: 'Max 6 Adults + 1 Child per Gypsy' },
      { label: 'Total Cost per Gypsy', value: '₹3,500 – ₹4,300 (Split among up to 6 pax)' },
    ],
    faqs: [
      {
        question: 'Is Gir National Park open in July or August for lion safaris?',
        answer: 'No. The core Gir Jungle Trail is legally closed every year from June 16 through October 15 under the Wildlife Protection Act for animal breeding and monsoon flood inundation. Only the fenced Devalia Safari Park buffer zone remains open.',
      },
      {
        question: 'Where can I book official Gir safari permits without agent markups?',
        answer: 'Permits must ONLY be booked via the official Gujarat Forest Department portal: girlion.gujarat.gov.in. Third-party websites charging ₹10,000–₹15,000 are commercial resellers with heavy markups.',
      },
      {
        question: 'What happens if the ID card number on my permit does not match my physical card?',
        answer: 'At the Sinh Sadan entry gate, Forest Department wardens cross-examine original physical IDs against the e-permit. Any mismatch in name, ID number, or card type results in immediate permit cancellation without refund.',
      },
      {
        question: 'What is the difference between Gir Jungle Trail and Devalia Safari Park?',
        answer: 'Gir Jungle Trail is an open, unconstrained 3-hour wilderness safari across 1,412 sq km where sightings depend on natural tracking. Devalia is a 412-hectare fenced interpretation zone where sightings are guaranteed during a 30-55 minute bus or gypsy ride.',
      },
    ],
    sections: [
      {
        id: 'wildlife-context',
        title: '1. Introduction: The Last Bastion of the Asiatic Lion',
        content: `Spanning 1,412 square kilometers across Junagadh, Gir Somnath, and Amreli districts, **Gir National Park** is the sole surviving natural habitat of the Asiatic Lion (*Panthera leo persica*). The wild lion population stands at over 674 individuals across the Greater Gir ecosystem.\n\nSecuring a safari requires navigating statutory seasonal closures, strict 90-day booking quotas, and zero-tolerance identity checks.`,
      },
      {
        id: 'monsoon-closure-rules',
        title: '2. The Annual Monsoon Closure: Legal Dates & Buffer Alternatives',
        content: `**Statutory Forest Department Rule:** The core **Gir Jungle Safari is strictly CLOSED from June 16 through October 15** every year.\n\n- **Breeding Cycle:** Prohibits human and vehicle disturbances during lion mating and cub-rearing.\n- **Road Inundation:** Forest tracks crossing the Hiran, Machhundri, and Raval rivers become washed out.\n\n**All-Season Alternative: Devalia Safari Park (Gir Interpretation Zone)**\nLocated 12 km from Sasan Gir, Devalia is open year-round **except every Wednesday**. This 412-hectare fenced sanctuary houses wild-bred lions, leopards, and chital, offering guaranteed sightings via forest department safari mini-buses or open Gypsies.`,
      },
      {
        id: 'permit-booking-mechanics',
        title: '3. Official Permit Booking Mechanics: Step-by-Step',
        content: `The **ONLY** authorized portal is: **\`https://girlion.gujarat.gov.in\`**\n\n- **90-Day Advance Window:** Opens at 00:00 IST exactly 90 days ahead. Peak dates (Diwali, Christmas/New Year, April-May) sell out in minutes.\n- **Daily Shifts:** Shift 1 (06:00–09:00, best for summer patrols), Shift 2 (09:00–12:00), Shift 3 (15:00–18:00, best for evening light).\n- **Capacity:** Max 6 adults + 1 child (3–12 yrs) per Gypsy.\n- **Strict Photo ID Verification:** Physical original ID (Aadhaar, Passport, Voter ID, or Driving License) must be presented at Sinh Sadan gate. Zero discrepancy tolerated.`,
      },
      {
        id: 'transparent-cost-breakdown',
        title: '4. Transparent On-Ground Cost Breakdown (Per Gypsy in INR)',
        content: `A complete Gypsy safari for Indian citizens costs **₹3,500 to ₹4,300 total**:\n\n- **Forest Dept Entry Permit:** ₹800–₹1,000 (weekday) / ₹1,000–₹1,200 (weekend) paid online.\n- **Registered Open Gypsy Hire:** ₹2,200–₹2,500 paid on-spot at Sinh Sadan.\n- **Mandatory Eco-Guide Fee:** ₹500–₹600 paid on-spot directly to the guide.\n- **DSLR Camera Fee (>70mm lens):** ₹200 per camera.\n\n*Split among 6 travelers, an authentic open-safari experience costs only **₹600 to ₹720 per person**.*`,
      },
      {
        id: 'transit-and-access',
        title: '5. Transit Realities & Reaching Sasan Gir',
        content: `- **From Somnath:** 45 km north along Veraval–Sasan road (1 hr 15 mins).\n- **From Rajkot Airport:** 155 km via Junagadh (3.5 hours).\n- **From Ahmedabad:** 360 km via NH 47 and NH 151 (7 to 8 hours).\n- **Nearest Broad-Gauge Railhead:** Junagadh Junction (JND), 55 km away.`,
      },
      {
        id: 'bharatyatra-wildlife-tools',
        title: '6. How BharatYatra Enhances Wildlife Planning',
        content: `- **Automated Seasonal Closure Warning:** Intelligently redirects users requesting June 16–Oct 15 dates to Devalia or Velavadar.\n- **Official Direct Deep-Linking:** Directs travelers directly to the state booking gateway, preventing agent markups.\n- **Multi-Payer Gypsy Splitter:** Log vehicle hire, permits, and guide gratuity with exact minor-unit group expense accounting.`,
      },
    ],
    relatedDestinations: [
      { name: 'Gir National Park', slug: 'gir-national-park', region: 'Junagadh, Gujarat' },
      { name: 'Somnath Temple', slug: 'somnath', region: 'Saurashtra, Gujarat' },
      { name: 'Velavadar Blackbuck National Park', slug: 'velavadar', region: 'Bhavnagar, Gujarat' },
    ],
  },

  'rann-of-kutch-bhirandiyara-permit-procedure': {
    slug: 'rann-of-kutch-bhirandiyara-permit-procedure',
    title: 'Rann of Kutch Entry Permits: Bhirandiyara Checkpost Clearance, Online Application, and Full Moon Logistics',
    subtitle: 'Complete verified guide to obtaining mandatory border zone permits, navigating Bhirandiyara checkpost, and planning around lunar cycles.',
    metaDescription: 'Official permit guidelines for Rann of Kutch White Desert. Bhirandiyara checkpost clearance, official online portal step-by-step, standardized fee table (₹100/adult), and full moon planning tips.',
    category: 'Border Tourism & Desert Route Protocols',
    tag: 'Desert Logistics',
    author: {
      name: 'BharatYatra Desert Logistics Desk',
      role: 'Border Route Field Analysts',
    },
    editor: {
      name: 'Senior Border Tourism Editorial Reviewer',
      role: 'BharatYatra Fact-Checking Board',
    },
    lastVerifiedDate: 'November 20, 2026',
    readingTimeMinutes: 7,
    heroImage: '/hero-bg.jpg',
    canonicalUrl: 'https://www.bharatyatra.in/guides/rann-of-kutch-bhirandiyara-permit-procedure/',
    primarySources: [
      { name: 'Gujarat Police / Forest Department Rann Permit Portal', url: 'https://rannpermit.gujarat.gov.in' },
      { name: 'Kutch West District Police Headquarters', url: 'https://kutchpolicewest.gujarat.gov.in' },
      { name: 'Tourism Corporation of Gujarat Ltd (TCGL)', url: 'https://gujarattourism.com' },
    ],
    quickFacts: [
      { label: 'Checkpost Location', value: 'Bhirandiyara (55 km north of Bhuj on SH 45)' },
      { label: 'Official Online Portal', value: 'rannpermit.gujarat.gov.in' },
      { label: 'Permit Fee (Adult Indian)', value: '₹100 per person' },
      { label: 'Vehicle Fee (Car / Taxi)', value: '₹50 per vehicle' },
      { label: 'Two-Wheeler Fee', value: '₹25 per bike/scooter' },
      { label: 'Full Moon Window', value: '5 Days (2 days before, peak night, 2 days after)' },
    ],
    faqs: [
      {
        question: 'Does my Rann Utsav tent booking include the police security permit?',
        answer: 'No. A hotel or tent city reservation is a private commercial transaction and does NOT replace the mandatory state police entry permit. Every vehicle must show a scanned QR permit at Bhirandiyara checkpost.',
      },
      {
        question: 'Can I apply for the Rann of Kutch permit online?',
        answer: 'Yes. You can apply 24 to 72 hours in advance at rannpermit.gujarat.gov.in. Upload your ID photo, enter your vehicle plate number, pay via UPI, and download the QR-coded PDF to your phone before leaving Bhuj.',
      },
      {
        question: 'Why should I download the permit PDF before leaving Bhuj?',
        answer: 'Cellular reception (Jio, Airtel, Vi) drops significantly between Bhirandiyara and Dhordo. Taking an offline screenshot or saving the PDF to your phone ensures you can display the QR code even without internet.',
      },
      {
        question: 'What are the night temperatures in the White Desert during winter?',
        answer: 'Winter night temperatures routinely drop to 4°C to 8°C (39°F to 46°F) with strong wind chill across the open salt pans. Heavy woolens, thermals, windcheaters, and gloves are essential after 20:00 IST.',
      },
    ],
    sections: [
      {
        id: 'border-context',
        title: '1. Introduction: The White Salt Desert & Security Context',
        content: `The **Great Rann of Kutch** spans over 7,500 square kilometers of blinding white salt crust. Because it directly abuts the sensitive international border with Pakistan, the salt flat north of the Bhuj-Khavda highway is a **restricted border security zone**.\n\nNo individual or vehicle is permitted past the **Bhirandiyara Police Checkpost** without an authorized government permit.`,
      },
      {
        id: 'permit-mandate',
        title: '2. Why Rann of Kutch Requires a Mandatory Security Permit',
        content: `A hotel booking at Dhordo Tent City does **NOT** substitute for the Gujarat Police security permit. Security officers at Bhirandiyara operate under border defense directives and will turn back vehicles without verified permits.`,
      },
      {
        id: 'standard-fee-table',
        title: '3. Official Fee Structure (In Indian Rupees ₹)',
        content: `Standardized by the Gujarat State Home and Forest Departments:\n\n- **Adult (Indian National, 12+ yrs):** ₹100\n- **Child (Indian National, 6–12 yrs):** ₹50 (Under 6 free)\n- **Foreign Nationals:** ₹100 + mandatory physical passport verification\n- **Two-Wheeler (Motorcycle/Scooter):** ₹25\n- **Four-Wheeler (Car/SUV/Taxi):** ₹50\n- **Bus / Tempo Traveller:** ₹100\n\n*A family of four (2 adults, 1 child aged 8, 1 infant) in a personal car pays exactly **₹300.00**.*`,
      },
      {
        id: 'how-to-apply',
        title: '4. How to Obtain the Entry Permit: Online vs Offline',
        content: `**Method A: Online Application (Highly Recommended)**\nApply 24–72 hours prior at **\`https://rannpermit.gujarat.gov.in\`**:\n1. Verify mobile number via OTP.\n2. Select visit date and sector.\n3. Upload clear photo ID (Aadhaar, Voter ID, Driving License, or Passport).\n4. Enter vehicle registration number (ask your Bhuj cab driver beforehand).\n5. Pay via UPI and download the QR-coded PDF.\n6. **Save an offline screenshot before leaving Bhuj due to patchy mobile coverage.**\n\n**Method B: Bhirandiyara Checkpost Counter (55 km north of Bhuj)**\nOpen 08:00 to 20:00 daily. Physical queues on holiday weekends can take **45 to 90 minutes**, risking missed sunsets.`,
      },
      {
        id: 'transit-and-cultural-stop',
        title: '5. Transit Realities: From Bhuj to the White Desert (82 km)',
        content: `Travel time along State Highway 45 is **1 hour 45 minutes to 2 hours**.\n\n**Bhirandiyara Cultural Stop:** While your vehicle permit is scanned, sample fresh, warm **Kutchi Mawa** (slow-caramelized milk sweet) prepared fresh by local halwais.`,
      },
      {
        id: 'full-moon-logistics',
        title: '6. The Full Moon Phenomenon: Planning Around Lunar Cycles',
        content: `Extended nighttime access into the salt flats is granted during the **5 days surrounding the monthly full moon (Purnima)**: 2 days before, the peak full moon night, and 2 days after.\n\n**Temperature Warning:** Night temperatures drop to **4°C to 8°C** with sharp wind chill. Pack heavy woolens, windproof jackets, and beanies.`,
      },
      {
        id: 'bharatyatra-desert-tools',
        title: '7. How BharatYatra Elevates Kutch Travel Logistics',
        content: `- **AI Sunset Route Calculator:** Calculates exact departure time from Bhuj (no later than 15:30) to clear Bhirandiyara without missing sunset.\n- **Paisa-Exact Group Ledger:** Track the ₹300 permit, SH 45 fuel, and mawa stops with transparent group splits.\n- **Northern Kutch Sequencing:** Effortlessly connects Dhordo with **Kalo Dungar (Black Hill, 462m)** and **Dholavira UNESCO Site** via the Road to Heaven.`,
      },
    ],
    relatedDestinations: [
      { name: 'Rann of Kutch & Dhordo', slug: 'rann-of-kutch', region: 'Kutch, Gujarat' },
      { name: 'Dholavira Harappan Site', slug: 'dholavira', region: 'Khadir Bet, Kutch' },
      { name: 'Kalo Dungar (Black Hill)', slug: 'kalo-dungar', region: 'Khavda, Kutch' },
    ],
  },
};
