import type { Metadata } from 'next';
import { LegalPageLayout, LegalSection } from '@/components/legal/LegalPageLayout';

export const metadata: Metadata = {
  title: 'Refund Policy | BharatYatra',
  description:
    'Official BharatYatra Refund Policy — Transparent information on refund processing timelines, settlement methods, payment reversals, and consumer procedures.',
  alternates: {
    canonical: 'https://bharatyatra.in/refund-policy/',
  },
};

const SECTIONS: LegalSection[] = [
  {
    id: 'principles',
    number: '01',
    title: 'Core Refund Principles',
    content: (
      <>
        <p>
          At BharatYatra, every eligible refund is processed with complete transparency and financial integrity. We ensure that eligible refunds resulting from approved cancellations, double debits, or operator service failures are remitted back to travelers strictly in compliance with Reserve Bank of India (RBI) guidelines.
        </p>
      </>
    ),
  },
  {
    id: 'timelines',
    number: '02',
    title: 'Refund Processing & Banking Timelines',
    content: (
      <>
        <p>
          Once a refund request is approved by our operations audit desk:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Platform Authorization:</strong> Refund orders are verified and dispatched to our banking gateway within 24 to 48 business hours.</li>
          <li><strong>Source Credit Turnaround:</strong> Banks and card networks typically credit the funds to your original payment method within <strong>5 to 7 business days</strong>.</li>
          <li><strong>UPI &amp; NetBanking:</strong> UPI refunds frequently reflect within 24 to 48 hours depending on issuing bank settlement batches.</li>
        </ul>
        <p className="p-3 bg-amber-50 text-amber-900 rounded-xl border border-amber-200 text-xs">
          <strong>Important Note:</strong> Refunds are remitted exclusively back to the original source payment instrument (card, UPI ID, or bank account) used during checkout. Third-party cash or alternative account payouts are not permitted under Anti-Money Laundering (AML) regulations.
        </p>
      </>
    ),
  },
  {
    id: 'failed-transactions',
    number: '03',
    title: 'Failed Payments & Double Debits',
    content: (
      <>
        <p>
          If your account is debited during checkout but the platform fails to issue a booking confirmation voucher (due to momentary bank gateway timeouts or network interruption):
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>The payment gateway initiates an automated reconciliation.</li>
          <li>Debited funds are automatically reversed to your bank account within 3 to 5 business days without requiring manual application.</li>
          <li>If the credit does not reflect after 5 business days, email our finance desk at <a href="mailto:pandyakaushal294@gmail.com" className="text-blue-700 underline">pandyakaushal294@gmail.com</a> with your bank transaction UTR / Reference Number for priority investigation.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'partial-refunds',
    number: '04',
    title: 'Partial Refunds & Supplier Deductions',
    content: (
      <>
        <p>
          Where a multi-service itinerary is cancelled partially (e.g., retaining hotel stay but cancelling bus transfer), refunds are calculated on an itemized basis after deducting applicable supplier cancellation charges and applicable statutory taxes.
        </p>
      </>
    ),
  },
  {
    id: 'escalations',
    number: '05',
    title: 'Refund Dispute Escalation',
    content: (
      <>
        <p>
          If you believe a refund has been calculated incorrectly or delayed past standard banking timelines, please contact our Grievance Desk at <a href="mailto:pandyakaushal294@gmail.com" className="text-blue-700 underline">pandyakaushal294@gmail.com</a> or phone <a href="tel:+919624282521" className="text-blue-700 underline">+91 96242 82521</a>. We guarantee a formal response within 48 hours.
        </p>
      </>
    ),
  },
];

export default function RefundPolicyPage() {
  return (
    <LegalPageLayout
      title="Refund Policy"
      badge="Financial Settlement Terms"
      version="1.1"
      lastUpdated="November 2026"
      description="Clear, authoritative guidelines on refund eligibility, 5–7 business days banking credit turnaround, failed payment auto-reversals, and consumer dispute procedures."
      sections={SECTIONS}
    />
  );
}
