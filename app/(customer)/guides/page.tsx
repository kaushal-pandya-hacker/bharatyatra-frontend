import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, Clock, BookOpen, ArrowRight, Compass, Sparkles, CheckCircle2 } from 'lucide-react';
import { GEO_GUIDES_DATA } from '@/lib/guides/guides-data';

export const metadata: Metadata = {
  title: 'Authoritative India & Gujarat Travel Guides | BharatYatra',
  description: 'Verified logistics, official permit procedures, aarti schedules, and travel planning intelligence for Gujarat and India. Researched from primary government sources.',
  alternates: {
    canonical: 'https://www.bharatyatra.in/guides/',
  },
  openGraph: {
    title: 'Authoritative India & Gujarat Travel Guides | BharatYatra',
    description: 'Verified logistics, official permit procedures, aarti schedules, and travel planning intelligence for Gujarat and India.',
    url: 'https://www.bharatyatra.in/guides/',
    siteName: 'BharatYatra',
    locale: 'en_IN',
    type: 'website',
  },
};

export default function GuidesHubPage() {
  const guides = Object.values(GEO_GUIDES_DATA);

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://www.bharatyatra.in',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Guides',
        item: 'https://www.bharatyatra.in/guides',
      },
    ],
  };

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'BharatYatra Field Travel Guides',
    description: 'Fact-checked logistical guides for Indian travel corridors and wildlife sanctuaries.',
    numberOfItems: guides.length,
    itemListElement: guides.map((g, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: g.title,
      url: g.canonicalUrl,
    })),
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />

      {/* Hero Header */}
      <section className="bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8 border-b border-emerald-800">
        <div className="max-w-6xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold tracking-wide uppercase mb-4">
            <ShieldCheck className="w-4 h-4" />
            Field-Verified Travel Intelligence
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4 max-w-3xl leading-tight">
            Authoritative Logistics & Planning Guides for India
          </h1>
          <p className="text-base sm:text-lg text-emerald-100/90 max-w-2xl leading-relaxed">
            Eliminate travel uncertainty with zero-fluff, fact-checked guides covering official government permit portals, sanctum aarti protocols, seasonal closures, and regional transit realities.
          </p>
          <div className="mt-6 flex flex-wrap gap-4 text-xs sm:text-sm text-emerald-200/80">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 100% Free & Open Access
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Primary Government Sources
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Zero Commercial Markup
            </span>
          </div>
        </div>
      </section>

      {/* Guides Grid */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {guides.map((guide) => (
            <article
              key={guide.slug}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col justify-between"
            >
              <div className="p-6">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                  <span className="font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                    {guide.tag}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {guide.readingTimeMinutes} min read
                  </span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 leading-snug mb-3 hover:text-emerald-700 transition-colors">
                  <Link href={`/guides/${guide.slug}`}>{guide.title}</Link>
                </h2>
                <p className="text-sm text-slate-600 line-clamp-3 mb-4 leading-relaxed">
                  {guide.subtitle}
                </p>

                {/* Key Facts Highlight */}
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs space-y-1.5 mb-4">
                  {guide.quickFacts.slice(0, 3).map((f, i) => (
                    <div key={i} className="flex justify-between text-slate-700">
                      <span className="text-slate-500">{f.label}:</span>
                      <span className="font-medium text-slate-900 text-right">{f.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Verified: {guide.lastVerifiedDate}</span>
                <Link
                  href={`/guides/${guide.slug}`}
                  className="font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 group"
                >
                  Read Full Guide
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* Informational Callout */}
        <div className="mt-12 bg-white rounded-2xl border border-emerald-200/60 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold text-xs uppercase tracking-wider mb-2">
              <Compass className="w-4 h-4" />
              Independent Travel Planning
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Need a personalized itinerary based on these ground realities?
            </h3>
            <p className="text-sm text-slate-600">
              Use BharatYatra's free AI trip planner. It automatically sequences temple darshans, warns of statutory park closures, and calculates minor-unit group expense splits.
            </p>
          </div>
          <Link
            href="/plan"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors whitespace-nowrap shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            Build Custom Itinerary
          </Link>
        </div>
      </main>
    </div>
  );
}
