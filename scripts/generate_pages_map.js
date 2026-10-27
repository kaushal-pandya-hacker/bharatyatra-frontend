const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const appDir = path.join(root, 'app');

function getAllPageFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      getAllPageFiles(filePath, fileList);
    } else if (file === 'page.tsx') {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const allPages = getAllPageFiles(appDir);

function getRoute(relPath) {
  let r = '/' + relPath.replace(/^app[\\\/]/, '').replace(/[\\\/]page\.tsx$/, '').replace(/\\/g, '/');
  r = r.replace(/\/\([^)]+\)/g, '');
  if (r === '') r = '/';
  return r;
}

function getCategory(relPath) {
  const norm = relPath.replace(/\\/g, '/');
  if (norm.startsWith('app/admin/')) return 'Admin Portal (Super-Admin & Operations)';
  if (norm.startsWith('app/bharatyatra-ops/')) return 'BharatYatra Ops Control Center';
  if (norm.startsWith('app/partner/') || norm.startsWith('app/partners/')) return 'Travel Partner Ecosystem';
  if (norm.startsWith('app/supplier/')) return 'Supplier & Vendor Portal';
  if (norm.startsWith('app/payment-gateway/')) return 'BharatGateway FinTech Suite';
  if (norm.startsWith('app/auth/') || norm.includes('/login/') || norm.includes('/signup/') || norm.includes('/register/') || norm.includes('/onboarding/')) {
    return 'Authentication, Security & Onboarding';
  }
  if (norm.includes('/trips/')) return 'Trip Command Center, Splitter & Telemetry';
  if (norm.includes('/booking/') || norm.includes('/bookings/') || norm.includes('/checkout/') || norm.includes('/cart/') || norm.includes('/payment/')) {
    return 'Bookings, Checkout & Settlement';
  }
  return 'Customer Discovery, Itinerary & Travel Products';
}

function getAuthLevel(relPath, route) {
  const norm = relPath.replace(/\\/g, '/');
  if (norm.startsWith('app/admin/')) {
    if (route === '/admin/login') return 'Public';
    return 'Super Admin / Platform Ops';
  }
  if (norm.startsWith('app/bharatyatra-ops/')) {
    if (route === '/bharatyatra-ops/login') return 'Public';
    return 'Operations Lead';
  }
  if (norm.startsWith('app/partner/')) return 'Verified Travel Partner';
  if (norm.startsWith('app/partners/')) return 'Public / Prospective Partner';
  if (norm.startsWith('app/supplier/')) {
    if (route === '/supplier/login' || route === '/supplier/register') return 'Public';
    return 'Verified Supplier';
  }
  if (norm.startsWith('app/payment-gateway/admin')) return 'Finance Ops Admin';
  if (norm.startsWith('app/payment-gateway/merchant')) return 'Gateway Merchant';
  if (norm.startsWith('app/payment-gateway/')) return 'Public / Merchant';
  if (norm.includes('/profile') || norm.includes('/my-trips') || norm.includes('/saved') || norm.includes('/notifications')) {
    return 'Authenticated Traveler';
  }
  return 'Public / Traveler';
}

function getHumanTitle(relPath, route) {
  const norm = relPath.replace(/\\/g, '/');
  
  // Specific accurate overrides
  const map = {
    '/': 'BharatYatra Homepage & Hero Experience',
    '/home': 'Homepage Alternative Portal',
    '/explore': 'Interactive India Destination Discovery',
    '/destinations': 'Curated Destinations Directory',
    '/destinations/[id]': 'Single Destination Detail & Heritage Insights',
    '/plan': 'AI Intelligent Trip & Itinerary Planner',
    '/ai-planner': 'Autonomous AI Trip Generator',
    '/packages': 'Curated India Tour Packages Catalog',
    '/packages/[slug]': 'Package Detail & Day-by-Day Expedition Itinerary',
    '/stays': 'Stays, Heritage Havelis & Boutique Hotels Directory',
    '/stays/[id]': 'Stay Details, Room Selection & Amenities',
    '/hotels/[id]': 'Hotel Detail & Sovereign Room Booking',
    '/activities/[id]': 'Guided Activity, Safari & Excursion Details',
    '/experiences': 'Cultural, Adventure & Spiritual Experiences',
    '/experiences/[id]': 'Single Experience Details & Slot Booking',
    '/restaurants': 'Gastronomy & Local Dining Discovery',
    '/restaurants/[id]': 'Restaurant Details, Menus & Table Reservation',
    '/flights': 'Domestic & Regional Flights Search',
    '/flights/[id]': 'Flight Booking, Fare Classes & Seat Select',
    '/trains': 'IRCTC Rail Booking & Train Search',
    '/trains/[id]': 'Train Schedule, Coach Selection & Seat Availability',
    '/buses': 'Intercity Volvo & Electric Bus Booking',
    '/buses/[id]': 'Bus Seat Layout & Boarding Point Selection',
    '/circuits': 'Cultural & Thematic Circuit Journeys',
    '/circuits/[id]': 'Multi-Day Circuit Overview & Route Details',
    '/states': 'India States & Union Territories Exploration',
    '/states/[slug]': 'State Heritage, Culture & Circuit Guide',
    '/states/loading': 'State Transit Transition Screen',
    '/map': 'GIS Interactive India Tourism Map',
    '/cart': 'Universal Travel Cart & Multi-Item Disbursal',
    '/checkout': 'Expedition Checkout & Sovereign Guarantee',
    '/payment': 'Unified Payment Method Selection & Checkout',
    '/booking/redirect': 'Secure Payment Gateway Handoff Screen',
    '/booking/confirmation': 'Instant Booking Confirmation & Receipt',
    '/booking/success': 'Payment Succeeded & Sovereign Protection Engaged',
    '/booking/failed': 'Transaction Failed & Fallback Recovery Options',
    '/bookings': 'Traveler Booking History & Active Vouchers',
    '/bookings/[id]': 'Detailed Booking Voucher, QR Code & Cancel Options',
    '/bookings/[id]/pay': 'Direct Booking Invoice Payment',
    '/trips': 'My Expeditions & Trip Portfolio',
    '/my-trips': 'Saved Itineraries & Past Trips Catalog',
    '/trips/road-trip': 'Road Trip Vehicle Telematics & Fuel Calculator',
    '/trips/[id]': 'Trip Command Center Dashboard (Live Itinerary & Telematics)',
    '/trips/[id]/cost': 'Cost Intelligence & Expedition Budget Analytics',
    '/trips/[id]/expenses': 'Group Expense Splitter & Settlement Ledger',
    '/trips/[id]/expense': 'Single Expense Log & Receipt Vault',
    '/trips/[id]/settle': 'Expense Settlement Optimizer & UPI Payouts',
    '/trips/[id]/settlement': 'Settlement Clearance Matrix & Summary',
    '/trips/[id]/cancel/[bookingId]': 'Expedition Item Cancellation & Refund Calculator',
    '/profile': 'Traveler Profile & Sovereign Voyager ID',
    '/profile/notifications': 'Traveler Communication & Notification Preferences',
    '/notifications': 'Travel Alerts, Flight Changes & Live Telemetry',
    '/saved': 'Wishlist & Saved Places Collection',
    '/dashboard': 'Traveler Hub Dashboard & Next Expedition Overview',
    '/login': 'Traveler Phone/Email Authentication',
    '/signup': 'New Voyager Registration',
    '/register': 'Customer Account Creation',
    '/auth/callback': 'OAuth Callback & Session Verification',
    '/auth/verify-otp': 'Two-Factor SMS OTP Verification',
    '/beta-onboarding': 'Early Access Voyager Onboarding',
    '/onboarding/travel-profile': 'AI Travel Profile & Personalization Quiz',
    '/feedback': 'User Feedback & Net Promoter Score Submission',
    
    // Admin
    '/admin': 'Master Admin Platform Dashboard',
    '/admin/login': 'Admin Security Portal Login',
    '/admin/bookings': 'Global Booking Oversight & Inventory Matrix',
    '/admin/inventory': 'Fleet, Room & Ticket Inventory Management',
    '/admin/packages': 'Platform Package Oversight & Publishing',
    '/admin/packages/images': 'Package Media Asset Manager & Cloudinary Sync',
    '/admin/travel-packages': 'Travel Partner Package Approval Queue',
    '/admin/travel-packages/[id]/review': 'Partner Package Verification, Pricing & Audit',
    '/admin/travel-partners': 'Partner Directory, Verification & Tiers',
    '/admin/travel-partners/[id]': 'Partner KYC, Banking & Operational Dossier',
    '/admin/travel-partner-audit': 'Partner Audit Logs & Compliance Verification',
    '/admin/travel-commissions': 'Commission Rates, Tax Withholding & Tier Settings',
    '/admin/payments': 'Payment Transaction Ledger & Gateway Telemetry',
    '/admin/refunds': 'Refund Approvals, Chargebacks & Disputes',
    '/admin/settlements': 'Partner & Supplier Payout Settlement Engine',
    '/admin/suppliers': 'Supplier Ecosystem Directory',
    '/admin/suppliers/[id]': 'Supplier Performance & Contract Dossier',
    '/admin/audit-logs': 'System Security & Access Audit Trails',
    '/admin/communications': 'System SMS, WhatsApp & Email Notification Dispatch',
    '/admin/tourism': 'Tourism Board Liaison & Regulatory Reporting',

    // Ops
    '/bharatyatra-ops': 'BharatYatra Operations Center Overview',
    '/bharatyatra-ops/login': 'Operations Console Authentication',
    '/bharatyatra-ops/dashboard': 'Live Fleet, Traveler & Ground Patrol Telemetry',
    '/bharatyatra-ops/trips': 'Active Ground Trips & Emergency Oversight',
    '/bharatyatra-ops/trips/[id]': 'Emergency Ground Node & Incident Intervention',
    '/bharatyatra-ops/bookings': 'Real-Time Booking Dispatch & Manual Overrides',
    '/bharatyatra-ops/users': 'Customer Service & User Profile Investigation',
    '/bharatyatra-ops/users/[id]': 'Customer Support Ticket & Booking History',
    '/bharatyatra-ops/notifications': 'High-Priority SOS & Weather Alert Broadcaster',
    '/bharatyatra-ops/audit-logs': 'Ops Action Log & Incident Audit History',
    '/bharatyatra-ops/settings': 'Ops Shift Management & Emergency Node Configuration',

    // Travel Partner
    '/partner/dashboard': 'Partner Business Metrics, Bookings & Revenue',
    '/partner/packages': 'My Listed Tour Packages Catalog',
    '/partner/packages/new': 'Create Tour Package (Day-by-Day Itinerary Builder)',
    '/partner/packages/[id]/edit': 'Edit Package Details, Pricing & Availability',
    '/partner/bookings': 'Customer Bookings for Partner Packages',
    '/partner/commissions': 'Partner Commission Statements & Disbursals',
    '/partner/profile': 'Partner Agency Profile, Accreditations & Licenses',
    '/partner/notifications': 'Partner Booking Alerts & Admin Review Feedback',
    '/partner/settings': 'Bank Account, Tax Info (GST) & Payout Preferences',
    '/partners/register': 'Travel Partner Application & Onboarding',
    '/partners/application-status': 'Partner Verification & Application Status Tracker',

    // Supplier
    '/supplier': 'Supplier Gateway Landing',
    '/supplier/login': 'Supplier Portal Login',
    '/supplier/register': 'Supplier Application & Vendor Registration',
    '/supplier/dashboard': 'Supplier Inventory & Booking Fulfillment Dashboard',
    '/supplier/hotels': 'Hotel Property & Room Allocation Manager',
    '/supplier/activities': 'Activity & Guided Tour Slot Manager',
    '/supplier/restaurants': 'Dining Table & Dining Slot Allocation',
    '/supplier/inventory': 'Live Inventory Stock & Blackout Dates',
    '/supplier/bookings': 'Received Bookings & Traveler Arrival Verification',
    '/supplier/bookings/[id]': 'Booking Redemption & Voucher Check-in',
    '/supplier/payments': 'Supplier Net Settlement & Bank Invoices',
    '/supplier/profile': 'Vendor Business Profile, GST & Banking Details',

    // FinTech Payment Gateway
    '/payment-gateway': 'BharatGateway Developer & Enterprise Landing',
    '/payment-gateway/checkout/[orderId]': 'Hosted Universal Payment Gateway Checkout',
    '/payment-gateway/merchant': 'Merchant FinTech Dashboard, API Keys & Webhooks',
    '/payment-gateway/admin': 'BharatGateway Super-Admin & Reconciliation Engine',
    '/payment-gateway/docs': 'BharatGateway API Reference & Integration SDK Guide',
    '/payment-gateway/pricing': 'FinTech Pricing, Interchange Fees & Volume Tiers',
  };

  if (map[route]) return map[route];

  // Auto fallback
  const segs = route.split('/').filter(Boolean);
  return segs.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' > ');
}

// Build data list
const items = allPages.map(fullPath => {
  const relPath = path.relative(root, fullPath);
  const route = getRoute(relPath);
  const category = getCategory(relPath);
  const auth = getAuthLevel(relPath, route);
  const title = getHumanTitle(relPath, route);
  const forwardRel = relPath.replace(/\\/g, '/');

  return {
    title,
    route,
    relPath: forwardRel,
    fullPath,
    category,
    auth,
  };
});

// Sort by category, then by route
items.sort((a, b) => {
  if (a.category !== b.category) return a.category.localeCompare(b.category);
  return a.route.localeCompare(b.route);
});

// Group by category
const categories = {};
for (const item of items) {
  if (!categories[item.category]) categories[item.category] = [];
  categories[item.category].push(item);
}

// Generate Markdown
let md = `# BharatYatra — Complete Pages & Routes Directory\n\n`;
md += `> **Total Registered Pages:** **${items.length}**  \n`;
md += `> **Last Updated:** ${new Date().toISOString().split('T')[0]}  \n`;
md += `> **Coverage:** 100% of all Next.js App Router pages across Traveler Experience, Admin, Ops, Partner Ecosystem, FinTech BharatGateway, and Supplier Portals.\n\n`;

md += `## Table of Contents\n\n`;
for (const cat of Object.keys(categories)) {
  const anchor = cat.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  md += `- [${cat} (${categories[cat].length} pages)](#${anchor})\n`;
}
md += `\n---\n\n`;

for (const cat of Object.keys(categories)) {
  const list = categories[cat];
  const anchor = cat.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  md += `## ${cat}\n\n`;
  md += `| Page Name & Purpose | Route URL | File Location | Access Level |\n`;
  md += `| :--- | :--- | :--- | :--- |\n`;

  for (const page of list) {
    const safeUri = encodeURI(`file:///${page.fullPath.replace(/\\/g, '/')}`);
    const fileLink = `[\`${page.relPath}\`](${safeUri})`;
    md += `| **${page.title}** | \`${page.route}\` | ${fileLink} | \`${page.auth}\` |\n`;
  }
  md += `\n`;
}

md += `## Summary Statistics by Section\n\n`;
md += `| Section | Page Count | Primary Target Users |\n`;
md += `| :--- | :--- | :--- |\n`;
for (const cat of Object.keys(categories)) {
  let audience = 'Travelers';
  if (cat.includes('Admin')) audience = 'Super Admins & Executive Staff';
  else if (cat.includes('Ops')) audience = '24/7 Operations & Emergency Patrol';
  else if (cat.includes('Partner')) audience = 'DMC Operators & Verified Travel Partners';
  else if (cat.includes('Supplier')) audience = 'Hotels, Activity Guides & Fleet Owners';
  else if (cat.includes('FinTech')) audience = 'FinTech Integrators & Merchants';
  else if (cat.includes('Auth')) audience = 'All System Users';
  md += `| ${cat} | **${categories[cat].length}** | ${audience} |\n`;
}
md += `| **TOTAL COMPLETE REPOSITORY PAGES** | **${items.length}** | **Entire BharatYatra Platform** |\n\n`;

md += `## Route Parameters Legend\n\n`;
md += `- \`[id]\`: Dynamic entity identifier (Trip ID, Booking ID, Partner ID, Supplier ID, Restaurant ID, Stay ID, etc.)\n`;
md += `- \`[slug]\`: URL slug identifier (e.g. State slug \`gujarat\`, Package slug \`golden-triangle-luxury-expedition\`)\n`;
md += `- \`[orderId]\`: BharatGateway FinTech unique order transaction identifier\n`;
md += `- \`[bookingId]\`: Specific booking record being modified or cancelled\n`;

const outputPath = path.join(root, 'APP_PAGES_DIRECTORY.md');
fs.writeFileSync(outputPath, md, 'utf8');
console.log('Successfully generated APP_PAGES_DIRECTORY.md with ' + items.length + ' pages.');
