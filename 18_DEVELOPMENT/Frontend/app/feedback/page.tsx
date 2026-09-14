'use client';

import React, { useState } from 'react';

export default function BetaFeedbackPage() {
  const [category, setCategory] = useState<string>('BUG');
  const [severity, setSeverity] = useState<string>('P3');
  const [message, setMessage] = useState<string>('');
  const [satisfaction, setSatisfaction] = useState<string>('SATISFIED');
  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSubmitted(true);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0F172A', color: '#F8FAFC', padding: '3rem 1.5rem', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '650px', margin: '0 auto', background: '#1E293B', padding: '2rem', borderRadius: '12px', border: '1px solid #334155' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>💬 Beta Feedback & Bug Reporting</h1>
        <p style={{ color: '#94A3B8', fontSize: '0.95rem', marginBottom: '2rem' }}>
          Help us refine Chalo Farva before public launch. Report bugs, travel data inaccuracies, or UX suggestions directly to our product team.
        </p>

        {submitted ? (
          <div style={{ background: '#064E3B', color: '#A7F3D0', padding: '1.5rem', borderRadius: '8px', textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 0.5rem 0' }}>Thank You for Your Feedback!</h3>
            <p style={{ margin: 0, fontSize: '0.95rem' }}>
              Your issue report has been logged and triaged by our SRE and Product Launch team.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#CBD5E1', marginBottom: '0.4rem' }}>
                Feedback Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ width: '100%', padding: '0.6rem', background: '#0F172A', border: '1px solid #334155', color: '#F8FAFC', borderRadius: '6px' }}
              >
                <option value="BUG">Software Bug / Error</option>
                <option value="BOOKING">Booking Issue</option>
                <option value="PAYMENT">Payment / Refund Issue</option>
                <option value="AI_QUALITY">AI Itinerary Quality</option>
                <option value="DATA_QUALITY">Incorrect Travel Information</option>
                <option value="UX">UI/UX Suggestion</option>
                <option value="NOTIFICATIONS">Notification Issue</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#CBD5E1', marginBottom: '0.4rem' }}>
                Severity
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                style={{ width: '100%', padding: '0.6rem', background: '#0F172A', border: '1px solid #334155', color: '#F8FAFC', borderRadius: '6px' }}
              >
                <option value="P0">P0 — Catastrophic / Financial Loss</option>
                <option value="P1">P1 — Critical Feature Blocked</option>
                <option value="P2">P2 — Major Workflow Issue</option>
                <option value="P3">P3 — Minor Bug / Data Error</option>
                <option value="P4">P4 — Cosmetic Suggestion</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#CBD5E1', marginBottom: '0.4rem' }}>
                Overall Beta Satisfaction
              </label>
              <select
                value={satisfaction}
                onChange={(e) => setSatisfaction(e.target.value)}
                style={{ width: '100%', padding: '0.6rem', background: '#0F172A', border: '1px solid #334155', color: '#F8FAFC', borderRadius: '6px' }}
              >
                <option value="VERY_SATISFIED">Very Satisfied 😄</option>
                <option value="SATISFIED">Satisfied 🙂</option>
                <option value="NEUTRAL">Neutral 😐</option>
                <option value="DISSATISFIED">Dissatisfied 🙁</option>
                <option value="VERY_DISSATISFIED">Very Dissatisfied 😡</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#CBD5E1', marginBottom: '0.4rem' }}>
                Detailed Description & Steps to Reproduce
              </label>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe what happened, expected result, and any error message..."
                style={{ width: '100%', padding: '0.6rem', background: '#0F172A', border: '1px solid #334155', color: '#F8FAFC', borderRadius: '6px', resize: 'vertical' }}
                required
              />
            </div>

            <button
              type="submit"
              style={{ background: '#0284C7', color: '#FFF', padding: '0.75rem', borderRadius: '6px', fontWeight: 700, border: 'none', cursor: 'pointer' }}
            >
              Submit Beta Report →
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
