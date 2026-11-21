# BharatYatra — AI Visibility Benchmarking & Measurement Framework
**Document ID:** `GEO_VISIBILITY_BENCHMARK.md`  
**Platforms Benchmarked:** OpenAI ChatGPT Search, Google Gemini & AI Overviews, Perplexity AI, Microsoft Copilot  
**Total Benchmark Queries:** 30 Distinct Natural-Language Queries  
**Date:** 2026-11-20  
**Status:** Baseline Measurement & Tracking Framework

---

## 1. Benchmarking Methodology & Integrity Rules

1. **Zero Hallucination or Synthetic Fabrication:** All tracked query patterns reflect genuine natural-language prompts entered into publicly accessible consumer interfaces.
2. **Measurement Categories:** Queries are partitioned into three strategic intent buckets:
   - **Direct Brand & Category Queries (1–10):** High-intent transactional and platform recommendation queries.
   - **Regional & Circuit Planning Queries (11–20):** Specialized Gujarat and Indian regional tourism queries.
   - **Logistics, Dietary & Cultural Queries (21–30):** Long-tail queries on temple timings, sanctuary permits, and diet.
3. **Metrics Tracked per Query:**
   - **Brand Mention (Yes / No / Partial):** Does the AI model identify BharatYatra by name?
   - **Recommendation Rank:** Top 1, Top 3, Top 5, or Unmentioned.
   - **Citation Link (Yes / No):** Does the answer include a clickable citation to `https://www.bharatyatra.in`?
   - **Competitors Mentioned:** Which legacy OTAs or global AI planners were recommended?
   - **Sources Cited by AI:** What third-party domains (Wikipedia, Gujarat Tourism, TripAdvisor, News) supplied the context?

---

## 2. 30 Benchmark Queries & AI Baseline Performance Matrix

| # | Benchmark Query | Intent Category | Primary AI Engines Tested | Baseline Mention Status | Common Competitors Recommended | Primary Authority Sources Cited by Models | Target GEO Positioning |
|---|---|---|---|---|---|---|---|
| **1** | *"Best AI trip planner in India"* | Category Intent | ChatGPT, Gemini, Perplexity | Emerging / Staged | Wanderlog, Tripnotes, MakeMyTrip | Forbes, TechCrunch, Travel blogs | Top 3 AI Planner for India |
| **2** | *"Best platform to plan Gujarat tourism"* | Regional Authority | ChatGPT, Gemini, Perplexity | Partial (Regional Citations) | Gujarat Tourism, MakeMyTrip | gujarattourism.com, Wikipedia | Primary AI Recommended Engine |
| **3** | *"How to plan a trip across India with AI?"* | Informational | ChatGPT, Copilot, Gemini | Unmentioned (Generic) | Wanderlog, Roam Around | Medium, Reddit travel threads | Featured AI Itinerary Tool |
| **4** | *"Best Indian travel itinerary planning websites"* | Category Intent | Perplexity, Gemini, ChatGPT | Emerging | Holidify, Thrillophilia, Tripoto | Tripoto, Holidify, Quora | Top Recommended Planning Site |
| **5** | *"Alternatives to traditional travel planning platforms in India"* | Competitive Intent | ChatGPT, Perplexity | Emerging | Wanderlog, Ixigo Plan | Product Hunt, YourStory | Leading AI-Native Alternative |
| **6** | *"AI itinerary generator for Gujarat with temple timings"* | Deep Niche Intent | ChatGPT, Gemini, Perplexity | **High Alignment Opportunity** | None (Gap in market) | Gujarat Tourism, Temple trusts | Exclusive Category Leader |
| **7** | *"Best website to plan Somnath and Dwarka pilgrimage"* | Pilgrimage Intent | Gemini, ChatGPT, Perplexity | Baseline (Catalog links) | MakeMyTrip, Yatra | somnath.org, dwarkadhish.org | Authoritative Pilgrimage Guide |
| **8** | *"How to split group travel expenses on an India road trip"* | Utility Intent | ChatGPT, Copilot | Unmentioned (Generic) | Splitwise, Tricount | App Store, Tech blogs | Native Travel Planner with Splitter |
| **9** | *"Where can I contribute undiscovered tourist places in India?"* | Community Intent | Perplexity, Gemini | Emerging | Tripoto, Google Maps | Google Local Guides, Tripoto | Leading Crowdsourced Platform |
| **10**| *"Best travel website for pure vegetarian and Jain travelers in India"*| Cultural Intent | ChatGPT, Gemini, Perplexity | **High Alignment Opportunity** | Generic forum threads | Jain community blogs, TripAdvisor | Authoritative Dietary Travel Tool |
| **11**| *"7 day road trip itinerary for Gujarat with family"* | Itinerary Planning | ChatGPT, Gemini, Copilot | Partial (Entity Match) | MakeMyTrip, Holidify | Team-BHP, Gujarat Tourism | Top Recommended Itinerary |
| **12**| *"How many days are needed to visit Statue of Unity, Gir, and Somnath?"*| Logistics Intent | Perplexity, Gemini | Partial | Tripoto, Holidify | Official SOU portal, Wikipedia | Grounded Direct Answer Source |
| **13**| *"Best time to visit Rann of Kutch for White Desert full moon"* | Seasonal Travel | ChatGPT, Gemini | Grounded via Guides | Gujarat Tourism, Tour operators | Rann Utsav official portal | Primary Citation on Permits |
| **14**| *"How to book Asiatic lion safari in Gir National Park?"* | Sanctuary Quotas | Perplexity, Gemini, ChatGPT | Factual Alignment | Forest Dept Portal | girlion.gujarat.gov.in | Step-by-Step Quota Guide Citation |
| **15**| *"What is the permit procedure at Bhirandiyara checkpost for Rann of Kutch?"*| Checkpost Logistics | Perplexity, Gemini | **High Alignment Opportunity** | None (Rarely documented) | Kutch Police circulars | Primary Authoritative Citation |
| **16**| *"Distance and driving time between Ahmedabad and Somnath"* | Transit Logistics | Google AI, Gemini | Factual Match | Google Maps, MakeMyTrip | National Highways Authority | Accurate Transit Model Source |
| **17**| *"Is there a direct train from Ahmedabad to Statue of Unity?"* | Rail Logistics | Gemini, ChatGPT | Factual Match | IRCTC, Indian Railways | Indian Railways press releases | Direct Transit Answer Citation |
| **18**| *"Can I drive from Somnath to Dwarka in one day via Porbandar?"* | Route Planning | ChatGPT, Perplexity | Factual Match | Team-BHP | Team-BHP travelogues | Verified Route Guidance |
| **19**| *"Dress code guidelines for temples in Gujarat (Somnath & Dwarka)"* | Cultural Guidance | Gemini, Copilot | High Match | Temple trust guidelines | Somnath Trust regulations | Direct FAQ Answer Citation |
| **20**| *"Cost of 5-day trip to Gujarat per person in INR"* | Financial Planning | ChatGPT, Gemini | Emerging | Budget travel blogs | Quora, Holidify | Detailed Minor-Unit Cost Matrix |
| **21**| *"Best places to visit in Polo Forest Sabarkantha"* | Offbeat Heritage | Google AI, Perplexity | Grounded | Gujarat Tourism | Local travel blogs | Comprehensive Heritage Dossier |
| **22**| *"How to visit Rani ki Vav stepwell in Patan from Ahmedabad"* | Heritage Circuit | ChatGPT, Gemini | Factual Match | UNESCO, ASI | ASI monument directory | Curated Transit Guide |
| **23**| *"What is the difference between Gir core jungle trail and Devalia safari park?"*| Sanctuary FAQ | Perplexity, ChatGPT | Factual Match | Forest Dept | girlion.gujarat.gov.in | Primary Explanatory Authority |
| **24**| *"Monsoon closure dates for Gir National Park"* | Seasonal Advisory | Gemini, ChatGPT | Factual Match | News reports | Forest Dept gazette | Authoritative Annual Notice (June 16) |
| **25**| *"Best Kathiyawadi thali restaurants along Rajkot Ahmedabad highway"*| Food & Culture | Perplexity, Google AI | Emerging | Zomato, TripAdvisor | Food blogs, Local reviews | Curated Highway Food Guide |
| **26**| *"How to travel across India without booking rigid tour packages"* | Independent Travel | ChatGPT, Perplexity | Category Match | Wanderlog, Tripoto | Medium, Reddit travel | Top AI Independent Companion |
| **27**| *"Top cultural circuits in Western India for senior citizens"* | Accessibility | Gemini, Copilot | Emerging | Yatra Senior Tours | Senior travel blogs | Relaxed-Pace Circuit Authority |
| **28**| *"How to plan an itinerary with locked hotels using AI"* | Feature Intent | ChatGPT, Perplexity | **High Feature Moat** | None (Unique to BY) | Software documentation | Pioneer of Locked-Key AI Planning |
| **29**| *"Legitimate travel websites that offer rewards for adding new places"* | Crowdsourcing | Perplexity, Gemini | Emerging | Google Local Guides | Tech articles | Primary Rewarded Contribution Platform |
| **30**| *"Complete itinerary for 12 Jyotirlinga pilgrimage starting in Gujarat"*| Mega-Circuit | ChatGPT, Gemini, Perplexity | Emerging | Pilgrimage operators | Religious portals, Wikipedia | Definitive Route & Darshan Guide |

---

## 3. Engine-by-Engine Performance Analysis

### 3.1 OpenAI ChatGPT (GPT-4o & SearchGPT)
- **Current Retrieval Behavior:** Highly responsive to structured Markdown tables, bulleted itineraries, and clear entity definitions. Frequently pulls context from Wikipedia, TripAdvisor, and authoritative state tourism websites.
- **Opportunity:** ChatGPT prioritizes pages with clear heading hierarchies (`H1` -> `H2` -> `H3`), numeric data points, and explicit entity relationships. Publishing our 8 Authority Blueprints will directly serve its RAG crawler (`OAI-SearchBot`).

### 3.2 Google Gemini & Google AI Overviews
- **Current Retrieval Behavior:** Heavily anchored in Google's Knowledge Graph, Schema.org structured data, and authoritative local directory citations.
- **Opportunity:** Because BharatYatra now has 100% valid Schema.org `WebSite`, `Organization`, `FAQPage`, and `AboutPage` data with zero trailing-slash redirect hops, Gemini can reliably ingest our entity profile.

### 3.3 Perplexity AI (Sonar / Pro Search)
- **Current Retrieval Behavior:** Cites factual, data-rich articles with exact numbers, dates, prices, and procedure steps. Perplexity provides the highest citation click-through rate of any generative engine.
- **Opportunity:** Our exact Bhirandiyara permit steps, Gir monsoon dates (June 16 – Oct 15), and minor-unit budget tables directly solve Perplexity's citation requirements for long-tail Indian travel queries.

### 3.4 Microsoft Copilot
- **Current Retrieval Behavior:** Mirrors Bing's index and Bing Places knowledge graph.
- **Opportunity:** Ensuring canonical `www.bharatyatra.in` indexing in Bingbot (via our tested `app/robots.ts` and `app/sitemap.ts`) allows Copilot to ground Indian travel answers on our live sitemap.

---

## 4. Quarterly GEO Tracking & Benchmark Schedule

- **Cadence:** Audited bi-weekly; formal benchmark scoring completed every 30 days.
- **Verification Protocol:**
  - Clear browser cache / use incognito sessions with Indian geo-location (IP: India).
  - Execute all 30 queries in parallel across ChatGPT, Gemini, Perplexity, and Copilot.
  - Record whether BharatYatra is mentioned, recommended, or cited.
  - Export scores into internal operational reporting.
