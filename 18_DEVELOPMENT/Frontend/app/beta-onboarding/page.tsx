'use client';

import React from 'react';
import Link from 'next/link';

export default function BetaOnboardingPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0F172A', color: '#F8FAFC', padding: '3rem 1.5rem', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', background: '#1E293B', padding: '2.5rem', borderRadius: '12px', border: '1px solid #334155' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <span style={{ fontSize: '2rem' }}>🚀</span>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>Welcome to Chalo Farva Beta</h1>
            <span style={{ fontSize: '0.85rem', color: '#38BDF8', fontWeight: 600 }}>Controlled Beta Release v1.0</span>
          </div>
        </div>

        <p style={{ color: '#CBD5E1', fontSize: '1.05rem', lineHeight: '1.6', marginBottom: '2rem' }}>
          Thank you for joining our closed beta group! Chalo Farva is Gujarat&apos;s AI-powered travel platform designed to take you seamlessly from <strong>Discover → Plan → Book → Adapt → Enjoy</strong>.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2.5rem' }}>
          <div style={{ background: '#0F2942', padding: '1.25rem', borderRadius: '8px', borderLeft: '4px solid #0284C7' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', color: '#38BDF8' }}>1. Discover & Plan with AI</h3>
            <p style={{ margin: 0, fontSize: '0.95rem', color: '#94A3B8' }}>
              Explore 24 cataloged Gujarat destinations (Statue of Unity, Somnath, Gir, Dwarka, Rann of Kutch). Specify your dates, travel style, and budget to generate a validated day-by-day itinerary.
            </p>
          </div>

          <div style={{ background: '#0F2942', padding: '1.25rem', borderRadius: '8px', borderLeft: '4px solid #059669' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', color: '#34D399' }}>2. Live Bookings & Verification</h3>
            <p style={{ margin: 0, fontSize: '0.95rem', color: '#94A3B8' }}>
              Book hotels, GSRTC express buses, and safari permits directly. Payments use secure sandbox processing with automated 100% refund reconciliation.
            </p>
          </div>

          <div style={{ background: '#0F2942', padding: '1.25rem', borderRadius: '8px', borderLeft: '4px solid #7C3AED' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', color: '#A78BFA' }}>3. Real-Time Adaptive AI</h3>
            <p style={{ margin: 0, fontSize: '0.95rem', color: '#94A3B8' }}>
              During your trip, Adaptive AI monitors weather disruptions, monsoon closures, and traffic delays to suggest non-cost alternative activities.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link
            href="/"
            style={{
              background: '#0284C7',
              color: '#FFF',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            Start Exploring Gujarat →
          </Link>
          <Link
            href="/feedback"
            style={{
              background: '#334155',
              color: '#F8FAFC',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Give Beta Feedback 💬
          </Link>
        </div>
      </div>
    </div>
  );
}
