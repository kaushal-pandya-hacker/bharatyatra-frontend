'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  ArrowLeft,
  Mail,
  PhoneCall,
  Clock,
  MapPin,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { SMART_QR_CONFIG } from '@/lib/config/smart-qr-config';

export interface LegalSection {
  id: string;
  number: string;
  title: string;
  content: React.ReactNode;
}

interface LegalPageLayoutProps {
  title: string;
  badge: string;
  lastUpdated: string;
  version: string;
  description: string;
  sections: LegalSection[];
}

export function LegalPageLayout({
  title,
  badge,
  lastUpdated,
  version,
  description,
  sections,
}: LegalPageLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-[#102B4E] selection:bg-[#FF9933]/20 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[#102B4E] transition-colors py-2 px-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>

          <span className="text-[11px] font-semibold text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-lg">
            Version {version} • {lastUpdated}
          </span>
        </div>

        {/* Page Header */}
        <header className="space-y-3 pt-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200/90 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="text-[11px] font-bold tracking-widest text-[#102B4E] uppercase">
              {badge}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#102B4E] tracking-tight">
            {title}
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">
            {description}
          </p>
        </header>

        {/* Table of Contents Pill Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
            Document Index
          </span>
          <div className="flex flex-wrap gap-2">
            {sections.map((sec) => (
              <a
                key={sec.id}
                href={`#${sec.id}`}
                className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#102B4E] hover:text-white text-slate-700 transition-colors"
              >
                {sec.number}. {sec.title}
              </a>
            ))}
          </div>
        </div>

        {/* Sections Content */}
        <div className="space-y-6">
          {sections.map((sec) => (
            <article
              key={sec.id}
              id={sec.id}
              className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs scroll-mt-24 space-y-4"
            >
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <span className="text-xs font-black text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md">
                  {sec.number}
                </span>
                <h2 className="text-lg font-bold text-[#102B4E]">
                  {sec.title}
                </h2>
              </div>
              <div className="text-xs sm:text-sm text-slate-600 leading-relaxed space-y-3">
                {sec.content}
              </div>
            </article>
          ))}
        </div>

        {/* Grievance & Official Contacts Box */}
        <div className="bg-[#0b1c30] text-slate-300 p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <FileText className="w-4 h-4" />
            <span>Questions or Legal Inquiries</span>
          </div>
          <h3 className="text-lg font-bold text-white">
            Official Grievance &amp; Compliance Office
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
            For formal policy inquiries, cancellation escalations, or data privacy requests, our compliance team is available through the official registered channels:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
              <span className="text-[10px] text-slate-400 block font-semibold mb-1">EMAIL SUPPORT</span>
              <a href="mailto:pandyakaushal294@gmail.com" className="font-bold text-white hover:text-amber-400 transition-colors block truncate">
                pandyakaushal294@gmail.com
              </a>
              <a href="mailto:engineering@bharatyatra.in" className="text-slate-400 hover:text-amber-400 transition-colors block truncate mt-0.5">
                engineering@bharatyatra.in
              </a>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
              <span className="text-[10px] text-slate-400 block font-semibold mb-1">TELEPHONE HOTLINE</span>
              <a href="tel:+919624282521" className="font-bold text-white hover:text-amber-400 transition-colors block">
                +91 96242 82521
              </a>
              <span className="text-slate-400 block mt-0.5">Mon - Sun: 08:00 AM - 10:00 PM IST</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
              <span className="text-[10px] text-slate-400 block font-semibold mb-1">REGISTERED OFFICE</span>
              <span className="font-bold text-white block">BharatYatra Technologies</span>
              <span className="text-slate-400 block mt-0.5">{SMART_QR_CONFIG.contact.address}</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-xs text-slate-500 pt-2">
          <p>© 2026 BharatYatra Technologies. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}

