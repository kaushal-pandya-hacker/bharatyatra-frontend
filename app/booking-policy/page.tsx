import type { Metadata } from 'next';
import { LegalPageLayout, LegalSection } from '@/components/legal/LegalPageLayout';

export const metadata: Metadata = {
  title: 'Booking Policy | BharatYatra',
  description:
    'Official BharatYatra Booking Policy — Comprehensive rules regarding traveler identification, confirmation vouchers, check-in mandates, and payment settlement.',
  alternates: {
    canonical: 'https://bharatyatra.in/booking-policy/',
  },
};

const SECTIONS: LegalSection[] = [
  {
    id: 'confirmation',
    number: '01',
    title: 'Booking Confirmation & Vouchers',
    content: (
      <>
        <p>
          A booking on BharatYatra is legally confirmed only when payment authorization has been settled in full and an official digital Confirmation Voucher containing a unique reference number (e.g., BY-BK-XXXX) is issued to your registered email address and traveler dashboard.
        </p>
        <p>
          Presenting a digital or printed copy of this voucher along with government-approved photo identification is mandatory at all check-in points and boarding terminals.
        </p>
      </>
    ),
  },
  {
    id: 'traveler-id',
    number: '02',
    title: 'Traveler Identification & Name Discrepancies',
    content: (
      <>
        <p>
          All traveler names, age declarations, and identification credentials entered during the booking process must match exactly with official government photo identification (such as Aadhaar Card, Passport, Voter ID, or Indian Driving License).
        </p>
        <p className="p-3 bg-slate-100 rounded-xl text-xs">
          <strong>Protected Sanctuary Areas:</strong> Wildlife sanctuaries (such as Sasan Gir National Park) and border check-posts (such as Rann of Kutch Dhordo checkpoints) enforce strict identity verification. Boarding or entry refusal resulting from name mismatches is solely the traveler&apos;s responsibility.
        </p>
      </>
    ),
  },
  {
    id: 'checkin-checkout',
    number: '03',
    title: 'Hotel Check-In & Accommodation Rules',
    content: (
      <>
        <ul className="list-disc pl-5 space-y-1.5">
          <li><strong>Standard Hotel Timings:</strong> Check-in is typically 12:00 PM or 02:00 PM; check-out is 10:00 AM or 11:00 AM unless explicitly noted otherwise. Early check-in or late check-out is strictly subject to room availability and supplier discretion.</li>
          <li><strong>Child Policy:</strong> Children under 5 years generally stay complimentary using existing bedding. Additional beds or meals will incur extra charges as per individual property policy.</li>
          <li><strong>Primary Guest Mandate:</strong> The primary guest checking in must be at least 18 years of age and present a physical government ID.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'payment-terms',
    number: '04',
    title: 'Payment & Currency Settlement',
    content: (
      <>
        <p>
          All bookings are transacted in Indian National Rupees (INR / ₹). Prices displayed are inclusive of applicable Goods and Services Tax (GST) unless otherwise indicated. Payments are processed securely via RBI-regulated payment gateways supporting Cards, UPI, NetBanking, and verified digital wallets.
        </p>
      </>
    ),
  },
];

export default function BookingPolicyPage() {
  return (
    <LegalPageLayout
      title="Booking Policy"
      badge="Reservation Standards &amp; Terms"
      version="1.1"
      lastUpdated="November 2026"
      description="Official rules governing traveler identity accuracy, voucher validation, check-in requirements, and payment settlement across BharatYatra."
      sections={SECTIONS}
    />
  );
}

