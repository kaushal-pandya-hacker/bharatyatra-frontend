import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ShieldCheck,
  Clock,
  Calendar,
  ArrowLeft,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Info,
  MapPin,
  Sparkles,
  BookOpen,
  Share2,
} from 'lucide-react';
import { GEO_GUIDES_DATA, GuideArticle } from '@/lib/guides/guides-data';

interface GuidePageProps {
  params: {
    slug: string;
  };
}

export function generateStaticParams() {
  return Object.keys(GEO_GUIDES_DATA).map((slug) => ({
    slug,
  }));
}

export function generateMetadata({ params }: GuidePageProps): Metadata {
  const guide = GEO_GUIDES_DATA[params.slug];
  if (!guide) {
    return {
      title: 'Guide Not Found | BharatYatra',
    };
  }

  return {
    title: `${guide.title} | BharatYatra Official Travel Guide`,
    description: guide.metaDescription,
    alternates: {
      canonical: guide.canonicalUrl,
    },
    openGraph: {
      title: guide.title,
      description: guide.metaDescription,
      url: guide.canonicalUrl,
      siteName: 'BharatYatra',
      locale: 'en_IN',
      type: 'article',
      images: [
        {
          url: guide.heroImage,
          width: 1200,
          height: 630,
          alt: guide.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: guide.title,
      description: guide.metaDescription,
      images: [guide.heroImage],
    },
  };
}

export default function GuideDetailPage({ params }: GuidePageProps) {
  const guide: GuideArticle | undefined = GEO_GUIDES_DATA[params.slug];

  if (!guide) {
    notFound();
  }

  // Schema.org Article JSON-LD
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.title,
    description: guide.metaDescription,
    image: `https://www.bharatyatra.in${guide.heroImage}`,
    datePublished: '2026-11-20T10:00:00+05:30',
    dateModified: '2026-11-20T12:00:00+05:30',
    author: {
      '@type': 'Organization',
      name: guide.author.name,
      url: 'https://www.bharatyatra.in',
    },
    publisher: {
      '@type': 'Organization',
      name: 'BharatYatra',
      url: 'https://www.bharatyatra.in',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.bharatyatra.in/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': guide.canonicalUrl,
    },
  };

  // Schema.org BreadcrumbList JSON-LD
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
      {
        '@type': 'ListItem',
        position: 3,
        name: guide.title,
        item: guide.canonicalUrl,
      },
    ],
  };

  // Schema.org FAQPage JSON-LD
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: guide.faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.answer,
      },
    })),
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Breadcrumb Bar */}
      <nav aria-label="Breadcrumb" className="bg-white border-b border-slate-200 py-3 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex items-center gap-2 text-xs text-slate-500 overflow-x-auto whitespace-nowrap">
          <Link href="/" className="hover:text-emerald-700">Home</Link>
          <span>/</span>
          <Link href="/guides" className="hover:text-emerald-700">Guides</Link>
          <span>/</span>
          <span className="text-slate-800 font-medium truncate max-w-xs sm:max-w-md">{guide.title}</span>
        </div>
      </nav>

      {/* Hero Header */}
      <header className="bg-gradient-to-br from-emerald-950 via-teal-900 to-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-emerald-800">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              {guide.category}
            </span>
            <span className="text-xs text-emerald-200/80 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {guide.readingTimeMinutes} min read
            </span>
            <span className="text-xs text-emerald-200/80 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Last Verified: {guide.lastVerifiedDate}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4 leading-tight">
            {guide.title}
          </h1>
          <p className="text-base sm:text-lg text-emerald-100/90 max-w-3xl leading-relaxed">
            {guide.subtitle}
          </p>

          <div className="mt-6 pt-6 border-t border-emerald-800/60 flex flex-wrap items-center justify-between gap-4 text-xs text-emerald-200/90">
            <div>
              <span className="text-emerald-400 font-medium">Researched by:</span> {guide.author.name} ({guide.author.role})
            </div>
            <div>
              <span className="text-emerald-400 font-medium">Fact-Checked by:</span> {guide.editor.name}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Free Access & Non-Commercial Disclaimer */}
        <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 sm:p-5 mb-8 text-xs sm:text-sm text-emerald-900 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">100% Free & Open Access — No Registration Required:</span> BharatYatra is an independent travel technology platform. We do not sell VIP darshan passes, collect state taxes, or charge booking markups. All permits and accommodations must be reserved directly through the official government or trust channels listed below.
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Article Body (8 cols) */}
          <main className="lg:col-span-8 space-y-8">
            {/* Quick Facts Card Grid */}
            <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                Key Logistical Facts at a Glance
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                {guide.quickFacts.map((fact, i) => (
                  <div key={i} className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="text-slate-500 font-medium">{fact.label}</div>
                    <div className="text-slate-900 font-bold mt-0.5">{fact.value}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* Sections */}
            {guide.sections.map((section) => (
              <section
                key={section.id}
                id={section.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm scroll-mt-24"
              >
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100">
                  {section.title}
                </h2>
                <div className="prose prose-slate max-w-none text-sm sm:text-base leading-relaxed space-y-4">
                  {section.content.split('\n\n').map((paragraph, pIdx) => {
                    // Check for bullet lists
                    if (paragraph.startsWith('- ') || paragraph.startsWith('1. ')) {
                      const items = paragraph.split('\n');
                      return (
                        <ul key={pIdx} className="list-disc pl-5 space-y-1.5 text-slate-700">
                          {items.map((item, iIdx) => (
                            <li key={iIdx}>
                              {item.replace(/^[-*]|\d+\.\s*/, '').trim()}
                            </li>
                          ))}
                        </ul>
                      );
                    }
                    return (
                      <p key={pIdx} className="text-slate-700">
                        {paragraph}
                      </p>
                    );
                  })}
                </div>
              </section>
            ))}

            {/* FAQ Section */}
            <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-6 pb-3 border-b border-slate-100">
                Frequently Asked Logistical Questions
              </h2>
              <div className="space-y-4">
                {guide.faqs.map((faq, idx) => (
                  <div key={idx} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base mb-1.5">
                      {faq.question}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </main>

          {/* Sidebar / Sticky Actions (4 cols) */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Table of Contents */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm sticky top-24">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 text-slate-500">
                Table of Contents
              </h3>
              <nav className="space-y-2 text-xs sm:text-sm">
                {guide.sections.map((s) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className="block text-slate-600 hover:text-emerald-700 transition-colors py-1 pl-2 border-l-2 border-transparent hover:border-emerald-600"
                  >
                    {s.title}
                  </a>
                ))}
              </nav>

              {/* Primary Sources */}
              <div className="mt-6 pt-5 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 text-slate-500">
                  Primary Verification Sources
                </h4>
                <ul className="space-y-1.5 text-xs">
                  {guide.primarySources.map((source, i) => (
                    <li key={i}>
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-700 hover:text-emerald-800 flex items-center justify-between group"
                      >
                        <span className="truncate">{source.name}</span>
                        <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-emerald-600 shrink-0 ml-1" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Related Destinations */}
              <div className="mt-6 pt-5 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 text-slate-500">
                  Related Destinations
                </h4>
                <div className="space-y-2">
                  {guide.relatedDestinations.map((dest, i) => (
                    <Link
                      key={i}
                      href={`/destinations/${dest.slug}`}
                      className="block p-2 rounded-lg bg-slate-50 hover:bg-emerald-50 border border-slate-100 hover:border-emerald-200 transition-colors"
                    >
                      <div className="font-semibold text-slate-900 text-xs">{dest.name}</div>
                      <div className="text-[11px] text-slate-500">{dest.region}</div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* BharatYatra Planning CTA */}
              <div className="mt-6 pt-5 border-t border-slate-100 bg-gradient-to-br from-emerald-50 to-teal-50 -mx-5 -mb-5 p-5 rounded-b-2xl border-t border-emerald-100">
                <h4 className="font-bold text-emerald-950 text-xs sm:text-sm mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  Plan This Route with AI
                </h4>
                <p className="text-[11px] text-emerald-800 mb-3 leading-relaxed">
                  Generate a day-by-day customized itinerary respecting these aarti hours, buffer zones, and fuel stops.
                </p>
                <div className="flex flex-col gap-2">
                  <Link
                    href="/plan"
                    className="w-full text-center py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-sm"
                  >
                    Launch Free AI Planner
                  </Link>
                  <Link
                    href="/expenses"
                    className="w-full text-center py-2 px-3 rounded-lg bg-white hover:bg-slate-50 text-emerald-800 font-semibold text-xs border border-emerald-200 transition-colors"
                  >
                    Group Expense Splitter (₹)
                  </Link>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
