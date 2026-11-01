'use client';

import React, { useState } from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Send,
  MessageSquare,
  Sparkles,
  Instagram,
} from 'lucide-react';
import { SMART_QR_CONFIG } from '@/lib/config/smart-qr-config';
import { AshokaChakraIcon } from '@/components/qr/AshokaChakraIcon';

export default function ContactUsPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'GENERAL_INQUIRY',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{
    id?: string;
    enquiryReference?: string;
    whatsAppDirectUrl?: string;
    emailNotificationStatus?: string;
    whatsappNotificationStatus?: string;
  } | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch('/api/v1/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setSubmissionResult(json.data);
        setIsSubmitted(true);
        if (typeof window !== 'undefined') {
          try {
            const cleanEmail = formData.email.trim().toLowerCase();
            localStorage.setItem('by_user_email', cleanEmail);
            localStorage.setItem('by_last_enquiry_email', cleanEmail);
            if (json.data?.enquiryReference) {
              localStorage.setItem('by_last_enquiry_ref', json.data.enquiryReference);
            }
          } catch {
            // Storage quota or private browsing fallback
          }
        }
      } else {
        setSubmitError(json.message || 'Failed to submit inquiry. Please try again.');
      }
    } catch {
      setSubmitError('Unable to connect to the server. Please try calling or messaging on WhatsApp directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-[#102B4E] selection:bg-[#FF9933]/20 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        


        {/* Page Header */}
        <header className="text-center space-y-3 pt-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200/90 shadow-2xs">
            <AshokaChakraIcon size={14} color="#000080" />
            <span className="text-[11px] font-bold tracking-widest text-[#102B4E] uppercase">
              Official Contact &amp; Traveler Assistance
            </span>
            <AshokaChakraIcon size={14} color="#000080" />
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#102B4E] tracking-tight">
            Connect with Our Team
          </h1>
          <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
            Have questions about your upcoming trip, custom travel packages, ground operations, or business partnerships? We are here to help.
          </p>
        </header>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 sm:gap-8 items-start">
          
          {/* Direct Verified Contact Channels (2 Cols) */}
          <div className="md:col-span-2 space-y-4">
            
            {/* Phone Card */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2">
              <div className="w-10 h-10 rounded-xl bg-[#FFF4E6] border border-[#FF9933]/30 flex items-center justify-center text-[#FF7700]">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  Direct Phone Call
                </span>
                <a
                  href={`tel:${SMART_QR_CONFIG.contact.phone}`}
                  className="text-base font-extrabold text-[#102B4E] hover:text-[#FF7700] transition-colors block mt-0.5"
                >
                  {SMART_QR_CONFIG.contact.phoneDisplay}
                </a>
                <p className="text-xs text-slate-500 mt-1">
                  Instant line to operations and traveler concierge.
                </p>
              </div>
            </div>

            {/* WhatsApp Card */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2">
              <div className="w-10 h-10 rounded-xl bg-[#E8F5E9] border border-[#138808]/30 flex items-center justify-center text-[#138808]">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  Instant WhatsApp
                </span>
                <a
                  href={SMART_QR_CONFIG.contact.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base font-extrabold text-[#138808] hover:underline block mt-0.5"
                >
                  Chat on WhatsApp
                </a>
                <p className="text-xs text-slate-500 mt-1">
                  Average response time: under 15 minutes.
                </p>
              </div>
            </div>

            {/* Email Card */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2">
              <div className="w-10 h-10 rounded-xl bg-[#EBF2FA] border border-[#102B4E]/25 flex items-center justify-center text-[#102B4E]">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  Official Email
                </span>
                <a
                  href={`mailto:${SMART_QR_CONFIG.contact.email}`}
                  className="text-sm font-bold text-[#102B4E] hover:text-blue-700 transition-colors block mt-0.5 break-all"
                >
                  {SMART_QR_CONFIG.contact.email}
                </a>
                <a
                  href={`mailto:${SMART_QR_CONFIG.contact.supportEmail}`}
                  className="text-xs text-slate-500 hover:text-blue-700 transition-colors block mt-0.5 break-all"
                >
                  {SMART_QR_CONFIG.contact.supportEmail}
                </a>
              </div>
            </div>

            {/* Official Instagram Card */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2">
              <div className="w-10 h-10 rounded-xl bg-pink-50 border border-pink-200/50 flex items-center justify-center text-pink-600">
                <Instagram className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  Official Instagram
                </span>
                <a
                  href={SMART_QR_CONFIG.social.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-bold text-[#102B4E] hover:text-pink-600 transition-colors block mt-0.5 break-all"
                >
                  {SMART_QR_CONFIG.social.instagramHandle}
                </a>
                <p className="text-xs text-slate-500 mt-1">
                  Destination stories, travel inspiration &amp; official announcements.
                </p>
              </div>
            </div>

            {/* Address & Hours */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3 text-xs text-slate-600">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span>{SMART_QR_CONFIG.contact.address}</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span>{SMART_QR_CONFIG.contact.workingHours}</span>
              </div>
            </div>
          </div>

          {/* Interactive Inquiry Form (3 Cols) */}
          <div className="md:col-span-3 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm">
            {isSubmitted ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 bg-[#E8F5E9] text-[#138808] rounded-full mx-auto flex items-center justify-center shadow-inner">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <div>
                  <span className="inline-block px-3.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 text-xs font-mono font-black rounded-full uppercase tracking-wider mb-2">
                    Enquiry Reference: #{submissionResult?.enquiryReference || 'BY-ENQ-RECORDED'}
                  </span>
                  <h3 className="text-xl font-bold text-[#102B4E]">Enquiry Successfully Submitted</h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                  Thank you for contacting BharatYatra! Your enquiry has been successfully submitted. Our support team will get back to you soon.
                </p>

                {/* Instant WhatsApp Action */}
                {submissionResult?.whatsAppDirectUrl && (
                  <div className="pt-2">
                    <a
                      href={submissionResult.whatsAppDirectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all active:scale-[0.99]"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Chat on WhatsApp Directly (+91 96242 82521)</span>
                    </a>
                    <p className="text-[11px] text-slate-500 mt-1.5">
                      Click to open pre-filled enquiry directly on WhatsApp for instant 15-minute response.
                    </p>
                  </div>
                )}

                <div className="pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSubmitted(false);
                      setSubmissionResult(null);
                      setFormData({ name: '', email: '', phone: '', subject: 'GENERAL_INQUIRY', message: '' });
                    }}
                    className="text-xs font-bold text-[#102B4E] hover:text-[#FF7700] underline"
                  >
                    Send Another Inquiry
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {submitError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold">
                    {submitError}
                  </div>
                )}
                <div>
                  <h2 className="text-lg font-bold text-[#102B4E]">Send an Instant Message</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Fill out the form below and an operations specialist will connect with you.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Kaushal Pandya"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#102B4E] focus:ring-1 focus:ring-[#102B4E] text-xs font-medium text-slate-800 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="name@example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#102B4E] focus:ring-1 focus:ring-[#102B4E] text-xs font-medium text-slate-800 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 96242 82521"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#102B4E] focus:ring-1 focus:ring-[#102B4E] text-xs font-medium text-slate-800 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Topic / Inquiry Type
                    </label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#102B4E] focus:ring-1 focus:ring-[#102B4E] text-xs font-medium text-slate-800 bg-white transition-colors"
                    >
                      <option value="GENERAL_INQUIRY">General Inquiry</option>
                      <option value="AI_TRIP_PLANNER">AI Trip Planner Help</option>
                      <option value="TOUR_PACKAGE">Tour Package Booking</option>
                      <option value="TRAVEL_PARTNER">Travel Partner Partnership</option>
                      <option value="BUSINESS_CARD_FEEDBACK">Business Card QR Inquiries</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Your Message *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us about your trip plans, dates, number of travelers, or questions..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#102B4E] focus:ring-1 focus:ring-[#102B4E] text-xs font-medium text-slate-800 transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-5 rounded-xl bg-[#102B4E] hover:bg-blue-950 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99] disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Sending Message...' : 'Send Message'}</span>
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-xs text-slate-500 pt-4">
          <p>© 2026 BharatYatra. Sovereign Tourism Authority Partner. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}

