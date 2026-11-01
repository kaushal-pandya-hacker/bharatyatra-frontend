import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Megaphone,
  FileText,
  Mail,
  Download,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Media & Press Room | BharatYatra',
  description:
    'Official BharatYatra Press Room — Press releases, media coverage, brand assets, and media contact inquiries.',
  alternates: {
    canonical: 'https://bharatyatra.in/press/',
  },
};

export default function PressPage() {
  const releases = [
    {
      date: 'October 2026',
      title: 'BharatYatra Launches Next-Gen AI Travel Platform Integrating 100 Iconic Landmarks',
      excerpt:
        'Pioneering hyper-personalized multi-modal transit coordination and ground-verified heritage itineraries across Gujarat and India.',
    },
    {
      date: 'September 2026',
      title: 'BharatYatra Partners with Local Transport Networks to Digitize Heritage Pilgrimage Trails',
      excerpt:
        'Enabling seamless pilgrimage route planning across Somnath, Dwarka, Ambaji, and Palitana with real-time transit telemetry.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-[#102B4E] selection:bg-[#FF9933]/20 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Header */}
        <header className="text-center space-y-4 pt-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 shadow-2xs">
            <Megaphone className="w-4 h-4 text-amber-600" />
            <span className="text-[11px] font-bold tracking-widest text-[#102B4E] uppercase">
              Newsroom &amp; Media Kit
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#102B4E] tracking-tight">
            Media &amp; Press Room
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
            Latest announcements, official press releases, platform milestones, and media resources for journalists and editors.
          </p>
        </header>

        {/* Press Releases List */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-[#102B4E]">Official Press Releases</h2>
          {releases.map((rel, idx) => (
            <div
              key={idx}
              className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-2"
            >
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider block">
                {rel.date}
              </span>
              <h3 className="text-base sm:text-lg font-bold text-[#102B4E]">
                {rel.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {rel.excerpt}
              </p>
            </div>
          ))}
        </div>

        {/* Media Inquiries Box */}
        <div className="bg-[#0b1c30] text-slate-300 p-8 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Mail className="w-4 h-4" />
            <span>Media Relations Desk</span>
          </div>
          <h3 className="text-xl font-bold text-white">Press Contacts &amp; Interviews</h3>
          <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
            For media inquiries, executive interview requests, high-resolution brand assets, or data insights on Indian travel trends, please reach out to our communications desk:
          </p>
          <div className="pt-2 text-xs">
            <a
              href="mailto:engineering@bharatyatra.in?subject=Press%20Inquiry"
              className="inline-flex items-center gap-2 font-bold text-white hover:text-amber-400 transition-colors"
            >
              <span>engineering@bharatyatra.in</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

