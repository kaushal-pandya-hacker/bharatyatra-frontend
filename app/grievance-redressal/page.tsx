import type { Metadata } from 'next';
import { LegalPageLayout, LegalSection } from '@/components/legal/LegalPageLayout';

export const metadata: Metadata = {
  title: 'Grievance Redressal Policy | BharatYatra',
  description:
    'Official BharatYatra Grievance Redressal Mechanism — Statutory compliance under Information Technology Rules 2021 and Consumer Protection (E-Commerce) Rules 2020.',
  alternates: {
    canonical: 'https://www.bharatyatra.in/grievance-redressal/',
  },
};

const SECTIONS: LegalSection[] = [
  {
    id: 'statutory-framework',
    number: '01',
    title: 'Statutory Compliance & Framework',
    content: (
      <>
        <p>
          In strict compliance with Rule 3(2) of the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021 and the Consumer Protection (E-Commerce) Rules, 2020, BharatYatra has instituted a formal and transparent Consumer Grievance Redressal Mechanism.
        </p>
      </>
    ),
  },
  {
    id: 'officer-details',
    number: '02',
    title: 'Designated Grievance Redressal Officer',
    content: (
      <>
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
          <p><strong>Designation:</strong> Chief Grievance &amp; Compliance Officer</p>
          <p><strong>Entity:</strong> BharatYatra Technologies</p>
          <p><strong>Office Address:</strong> Dwarka, Gujarat 361335, India</p>
          <p><strong>Dedicated Email:</strong> <a href="mailto:pandyakaushal294@gmail.com" className="text-blue-700 font-semibold underline">pandyakaushal294@gmail.com</a></p>
          <p><strong>Secondary Compliance Desk:</strong> <a href="mailto:engineering@bharatyatra.in" className="text-blue-700 underline">engineering@bharatyatra.in</a></p>
          <p><strong>Hotline:</strong> <a href="tel:+919624282521" className="text-blue-700 font-semibold underline">+91 96242 82521</a></p>
          <p><strong>Operating Hours:</strong> Monday through Saturday, 09:30 AM to 06:30 PM IST</p>
        </div>
      </>
    ),
  },
  {
    id: 'process-timelines',
    number: '03',
    title: 'Grievance Submission & Resolution Timelines',
    content: (
      <>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Step 1 (Submission):</strong> Submit your grievance stating your full legal name, registered mobile number, booking reference (if applicable), and detailed description of the dispute to <a href="mailto:pandyakaushal294@gmail.com" className="text-blue-700 underline">pandyakaushal294@gmail.com</a>.</li>
          <li><strong>Step 2 (Acknowledgment):</strong> Within <strong>48 hours</strong> of receipt, an official Grievance Ticket Number will be generated and issued to you with an assigned case officer.</li>
          <li><strong>Step 3 (Investigation &amp; Resolution):</strong> Our compliance team coordinates with relevant travel partners, hotel operators, or banking gateways to deliver a formal, written resolution within <strong>30 calendar days</strong>.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'escalation-matrix',
    number: '04',
    title: 'Escalation to Consumer Fora',
    content: (
      <>
        <p>
          If you remain dissatisfied with the decision of our Grievance Officer, you retain full statutory rights to approach the National Consumer Helpline (NCH), consumer dispute redressal commissions, or competent judicial courts in Ahmedabad, Gujarat, India.
        </p>
      </>
    ),
  },
];

export default function GrievanceRedressalPage() {
  return (
    <LegalPageLayout
      title="Grievance Redressal Policy"
      badge="Consumer Protection &amp; IT Rules 2021"
      version="1.1"
      lastUpdated="November 2026"
      description="Official statutory framework for lodging consumer complaints, dispute escalations, designated grievance officer contact details, and resolution timelines."
      sections={SECTIONS}
    />
  );
}

