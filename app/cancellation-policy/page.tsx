import type { Metadata } from 'next';
import { LegalPageLayout, LegalSection } from '@/components/legal/LegalPageLayout';

export const metadata: Metadata = {
  title: 'Cancellation Policy | BharatYatra',
  description:
    'Official BharatYatra Cancellation Policy — Detailed guidelines on booking cancellation windows, supplier cancellation terms, timelines, and customer procedures.',
  alternates: {
    canonical: 'https://bharatyatra.in/cancellation-policy/',
  },
};

const SECTIONS: LegalSection[] = [
  {
    id: 'scope',
    number: '01',
    title: 'Scope & Applicability',
    content: (
      <>
        <p>
          This Cancellation Policy governs all cancellation requests for travel arrangements initiated or booked through BharatYatra (accessible via https://bharatyatra.in). BharatYatra operates as an electronic technology intermediary facilitating travel reservations across verified independent suppliers, including hotels, bus operators (including GSRTC), rail routing (IRCTC), domestic airlines, and cultural heritage experiences.
        </p>
        <p>
          By confirming a booking on BharatYatra, you acknowledge that cancellation eligibility and penalty schedules are governed by the specific fare rules and supplier conditions associated with each respective travel service item.
        </p>
      </>
    ),
  },
  {
    id: 'how-to-cancel',
    number: '02',
    title: 'How to Submit a Cancellation Request',
    content: (
      <>
        <p>
          Travellers may submit cancellation requests through the following verified methods:
        </p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li><strong>Self-Service Dashboard:</strong> Log in to your BharatYatra account, navigate to <em>My Bookings</em>, select the relevant reservation, and click &ldquo;Request Cancellation&rdquo;.</li>
          <li><strong>Direct Operations Support:</strong> Send an email with your Booking Reference (e.g., BY-BK-XXXX) to <a href="mailto:pandyakaushal294@gmail.com" className="text-blue-700 underline">pandyakaushal294@gmail.com</a> from your registered email address.</li>
          <li><strong>Instant WhatsApp Concierge:</strong> Reach our traveler support concierge at <a href="tel:+919624282521" className="text-blue-700 underline">+91 96242 82521</a> for real-time verification.</li>
        </ul>
        <p>
          Cancellation timestamp is formally recorded at the moment the request is received by our operations system.
        </p>
      </>
    ),
  },
  {
    id: 'supplier-rules',
    number: '03',
    title: 'Category-Wise Cancellation Rules',
    content: (
      <>
        <p>
          Because BharatYatra aggregates multiple travel modes, cancellation rules differ by service category:
        </p>
        <div className="space-y-3 pt-1">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <h4 className="font-bold text-[#102B4E] mb-1">Hotels, Resorts &amp; Heritage Haveli</h4>
            <p className="text-xs">
              <strong>Free Cancellation:</strong> Available up to 48 to 72 hours before scheduled check-in for refundable rate plans. Non-refundable promotional rates and peak holiday dates (e.g., Rann Utsav Full Moon, Diwali, New Year) are non-refundable once booked.
            </p>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <h4 className="font-bold text-[#102B4E] mb-1">Bus Transfers &amp; GSRTC Express</h4>
            <p className="text-xs">
              Cancellations requested &gt; 24 hours prior to departure incur nominal supplier cancellation fees (typically 10%–25%). Cancellations within 12–24 hours incur 50% fees. No refunds are permitted within 12 hours of departure or for missed departures.
            </p>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <h4 className="font-bold text-[#102B4E] mb-1">Flight Transfers</h4>
            <p className="text-xs">
              Domestic flight cancellations are strictly subject to airline fare conditions and Directorate General of Civil Aviation (DGCA) regulations. Airline cancellation fees and statutory airport passenger fee refunds apply.
            </p>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <h4 className="font-bold text-[#102B4E] mb-1">Curated Tour Packages &amp; Safari Permits</h4>
            <p className="text-xs">
              Government wildlife permits (such as Sasan Gir Forest Lion Safari and Devalia Park entry) are non-transferable and strictly non-refundable per Gujarat Forest Department regulations. Custom package itineraries are subject to prepaid supplier commitments.
            </p>
          </div>
        </div>
      </>
    ),
  },
  {
    id: 'non-refundable',
    number: '04',
    title: 'Non-Refundable Services & Fees',
    content: (
      <>
        <p>
          The following charges and services are strictly non-refundable:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Platform technology convenience fees and gateway handling charges, except when cancellation results directly from a platform technical failure.</li>
          <li>Government taxes, sanctuary entry permits, monument entry tickets, and darshan pass fees already disbursed to state authorities.</li>
          <li>No-show situations where the traveler fails to arrive at the designated departure point or accommodation without prior written notice.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'force-majeure',
    number: '05',
    title: 'Unforeseen Weather, Force Majeure & Natural Disasters',
    content: (
      <>
        <p>
          In the event of severe weather events (monsoon floods, cyclones), regional road washouts, sudden governmental sanctuary closures, or strikes beyond reasonable control, BharatYatra will coordinate directly with on-ground operators to provide alternative travel dates or partial credits subject to operator consent.
        </p>
      </>
    ),
  },
];

export default function CancellationPolicyPage() {
  return (
    <LegalPageLayout
      title="Cancellation Policy"
      badge="Official BharatYatra Policy"
      version="1.1"
      lastUpdated="November 2026"
      description="Transparent, fair guidelines explaining cancellation timelines, operator terms, and step-by-step procedures across all BharatYatra travel products."
      sections={SECTIONS}
    />
  );
}

