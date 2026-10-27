'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Building2,
  FileCheck2,
  Compass,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  AlertCircle,
  UploadCloud,
  FileText,
  BadgeCheck,
  HelpCircle,
  Sparkles,
} from 'lucide-react';

export default function PartnerRegistrationPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedAgency, setSubmittedAgency] = useState<any>(null);

  // Form State
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('REGISTERED_OPERATOR');
  const [representativeName, setRepresentativeName] = useState('');
  const [businessEmail, setBusinessEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [stateCode, setStateCode] = useState('Gujarat');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [yearsInOperation, setYearsInOperation] = useState(5);
  const [businessDescription, setBusinessDescription] = useState('');

  // Identifiers
  const [gstin, setGstin] = useState('');
  const [pan, setPan] = useState('');
  const [tourismRegNumber, setTourismRegNumber] = useState('');

  // Service Coverage
  const [primaryRegion, setPrimaryRegion] = useState('Saurashtra & Kutch');
  const [selectedStates, setSelectedStates] = useState<string[]>(['Gujarat']);
  const [citiesServed, setCitiesServed] = useState('Somnath, Dwarka, Junagadh, Bhuj');
  const [packageCategories, setPackageCategories] = useState<string[]>([
    'Pilgrimage & Spiritual',
    'Heritage & Culture',
  ]);
  const [languagesSupported, setLanguagesSupported] = useState<string[]>([
    'Gujarati',
    'Hindi',
    'English',
  ]);
  const [customerSupportHours, setCustomerSupportHours] = useState('24/7 Helpline');

  // Commercial
  const [pricingModel, setPricingModel] = useState('Fixed Per-Person with Group Discounts');
  const [providesGroupTours, setProvidesGroupTours] = useState(true);
  const [providesPrivateTours, setProvidesPrivateTours] = useState(true);
  const [monthlyBookingCapacity, setMonthlyBookingCapacity] = useState(50);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [declaredAccurate, setDeclaredAccurate] = useState(false);

  // Verification Documents (Mock upload state with file metadata)
  const [uploadedDocs, setUploadedDocs] = useState<{ [key: string]: { name: string; size: string } }>({
    GST_CERTIFICATE: { name: 'GST_Registration_Certificate.pdf', size: '1.2 MB' },
    INCORPORATION_PROOF: { name: 'Udyam_Registration_Certificate.pdf', size: '850 KB' },
  });

  const handleDocMockUpload = (docKey: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedDocs((prev) => ({
        ...prev,
        [docKey]: {
          name: file.name,
          size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        },
      }));
    }
  };

  const toggleCategory = (cat: string) => {
    setPackageCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const toggleState = (st: string) => {
    setSelectedStates((prev) =>
      prev.includes(st) ? prev.filter((s) => s !== st) : [...prev, st]
    );
  };

  const toggleLanguage = (lang: string) => {
    setLanguagesSupported((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  };

  const validateStep1 = () => {
    if (!businessName.trim()) return 'Business name is required.';
    if (!representativeName.trim()) return "Representative's name is required.";
    if (!businessEmail.trim() || !businessEmail.includes('@')) return 'Valid business email is required.';
    if (!contactPhone.trim() || contactPhone.length < 8) return 'Valid contact phone is required.';
    if (!city.trim()) return 'City is required.';
    if (!businessDescription.trim()) return 'Please describe your agency and services.';
    return null;
  };

  const validateStep2 = () => {
    if (businessType === 'PVT_LTD' || businessType === 'LLP') {
      if (!gstin.trim() && !pan.trim()) {
        return 'Corporate entities must supply GSTIN or PAN identifier.';
      }
    }
    return null;
  };

  const handleNext = () => {
    setError(null);
    if (currentStep === 1) {
      const err = validateStep1();
      if (err) {
        setError(err);
        return;
      }
    }
    if (currentStep === 2) {
      const err = validateStep2();
      if (err) {
        setError(err);
        return;
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const handleBack = () => {
    setError(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!agreedToTerms || !declaredAccurate) {
      setError('Please acknowledge the partner agreement terms and confirm declaration accuracy.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        businessName,
        businessType,
        representativeName,
        businessEmail,
        contactPhone,
        address,
        city,
        stateCode,
        postalCode,
        websiteUrl,
        yearsInOperation: Number(yearsInOperation),
        businessDescription,
        registrationIdentifiers: {
          gstin: gstin || undefined,
          pan: pan || undefined,
          tourismRegNumber: tourismRegNumber || undefined,
        },
        serviceCoverage: {
          primaryRegion,
          statesServed: selectedStates,
          citiesServed: citiesServed.split(',').map((s) => s.trim()).filter(Boolean),
          packageCategories,
          languagesSupported,
          customerSupportHours,
        },
        commercialPreferences: {
          pricingModel,
          providesGroupTours,
          providesPrivateTours,
          monthlyBookingCapacity: Number(monthlyBookingCapacity),
          agreedToTerms,
        },
      };

      const res = await fetch('/api/v1/travel-partners/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Application submission failed.');
      }

      if (typeof window !== 'undefined' && json.data?.id) {
        localStorage.setItem('partner_agency_id', json.data.id);
      }

      setSubmittedAgency(json.data);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during submission.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submittedAgency) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 shadow-sm text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center text-4xl mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>

          <div className="space-y-2">
            <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full">
              Application Successfully Submitted
            </span>
            <h1 className="text-3xl font-extrabold text-slate-950 tracking-tight">
              Welcome to BharatYatra Partner Ecosystem
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed max-w-lg mx-auto">
              Your registration application for <strong className="text-slate-950">{submittedAgency.businessName}</strong> has been logged. Our operations verification team will review your business credentials within 1-2 business days.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-left space-y-3">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <span className="text-xs text-slate-500 font-medium">Application Reference:</span>
              <span className="text-sm font-mono font-bold text-slate-900 bg-white px-3 py-1 rounded-lg border border-slate-200">
                {submittedAgency.referenceNumber}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Registered Email:</span>
              <span className="text-slate-800 font-semibold">{submittedAgency.businessEmail}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Operating Region:</span>
              <span className="text-slate-800 font-semibold">{submittedAgency.city}, {submittedAgency.stateCode}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Current Lifecycle Status:</span>
              <span className="text-amber-800 font-bold bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                PENDING VERIFICATION
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Link
              href={`/partners/application-status?ref=${submittedAgency.referenceNumber}`}
              className="flex-1 py-3.5 bg-slate-950 text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-slate-800 transition-all shadow-sm flex items-center justify-center gap-2"
            >
              Check Application Status &rarr;
            </Link>
            <Link
              href="/"
              className="py-3.5 px-6 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-200 transition-all border border-slate-200"
            >
              Return to Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Hero Header */}
      <section className="border-b border-slate-200 bg-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-slate-100 text-slate-800 border border-slate-200 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-slate-600" /> B2B Partner Ecosystem
            </span>
            <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold px-3 py-1 rounded-full">
              Commission-Based Marketplace
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight">
            Register as a Verified Travel Partner
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-3xl leading-relaxed">
            Connect your agency to India&apos;s AI travel marketplace. Publish your customized tour packages, reach thousands of high-intent travellers, and manage departures with transparent contractual commissions.
          </p>

          {/* Stepper Navigation */}
          <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
            {[
              { num: 1, label: 'Business Profile', icon: Building2 },
              { num: 2, label: 'Verification Docs', icon: FileCheck2 },
              { num: 3, label: 'Service Coverage', icon: Compass },
              { num: 4, label: 'Terms & Submit', icon: ShieldCheck },
            ].map((step) => {
              const Icon = step.icon;
              const isActive = currentStep === step.num;
              const isPast = currentStep > step.num;
              return (
                <div
                  key={step.num}
                  className={`p-3 rounded-2xl border transition-all flex items-center gap-3 ${
                    isActive
                      ? 'bg-white border-slate-900 text-slate-950 shadow-sm'
                      : isPast
                      ? 'bg-emerald-50/60 border-emerald-200 text-emerald-800'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                      isActive
                        ? 'bg-slate-950 text-white'
                        : isPast
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {isPast ? '✓' : step.num}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Step 0{step.num}</div>
                    <div className="text-xs font-bold truncate">{step.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Registration Form Container */}
      <section className="max-w-5xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm space-y-8">
          
          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-2xl text-xs flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: BUSINESS INFORMATION */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#FED65B]" /> Business & Agency Information
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Provide your registered company profile and operational contact details.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Registered Business Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Somnath Heritage & Pilgrimage Tours Pvt Ltd"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-slate-800 focus:ring-2 focus:ring-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Business Entity Type *
                  </label>
                  <select
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-slate-800 focus:ring-2 focus:ring-slate-100"
                  >
                    <option value="REGISTERED_OPERATOR">Registered Tour Operator / Agency</option>
                    <option value="PVT_LTD">Private Limited (Pvt Ltd)</option>
                    <option value="LLP">Limited Liability Partnership (LLP)</option>
                    <option value="PARTNERSHIP">Partnership Firm</option>
                    <option value="PROPRIETORSHIP">Sole Proprietorship</option>
                    <option value="PUBLIC_LTD">Public Limited Company</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Authorized Representative Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={representativeName}
                    onChange={(e) => setRepresentativeName(e.target.value)}
                    placeholder="e.g. Rajeshbhai Patel"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-slate-800 focus:ring-2 focus:ring-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Official Business Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={businessEmail}
                    onChange={(e) => setBusinessEmail(e.target.value)}
                    placeholder="contact@agencyname.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-slate-800 focus:ring-2 focus:ring-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Contact Phone with Country Code *
                  </label>
                  <input
                    type="tel"
                    required
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+91 98250 12345"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-slate-800 focus:ring-2 focus:ring-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Operating State / UT *
                  </label>
                  <select
                    value={stateCode}
                    onChange={(e) => setStateCode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-slate-800 focus:ring-2 focus:ring-slate-100"
                  >
                    <option value="Gujarat">Gujarat</option>
                    <option value="Rajasthan">Rajasthan</option>
                    <option value="Uttarakhand">Uttarakhand</option>
                    <option value="Assam">Assam</option>
                    <option value="Kerala">Kerala</option>
                    <option value="Himachal Pradesh">Himachal Pradesh</option>
                    <option value="Jammu & Kashmir">Jammu & Kashmir</option>
                    <option value="Goa">Goa</option>
                    <option value="Madhya Pradesh">Madhya Pradesh</option>
                    <option value="All India">All India (Multi-State)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Headquarters City *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Somnath / Ahmedabad / Bhuj"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-slate-800 focus:ring-2 focus:ring-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Postal Code (PIN)
                  </label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="362268"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-slate-800 focus:ring-2 focus:ring-slate-100"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Office Street Address
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Near Temple Gate No. 2, Station Road, Prabhas Patan"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-slate-800 focus:ring-2 focus:ring-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Website URL (If Available)
                  </label>
                  <input
                    type="url"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://www.agencyname.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-slate-800 focus:ring-2 focus:ring-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Years in Operation
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={yearsInOperation}
                    onChange={(e) => setYearsInOperation(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-slate-800 focus:ring-2 focus:ring-slate-100"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Agency & Service Description *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={businessDescription}
                    onChange={(e) => setBusinessDescription(e.target.value)}
                    placeholder="Briefly describe your agency's expertise, fleet, tour specializations, and guest support capabilities..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-slate-800 focus:ring-2 focus:ring-slate-100 leading-relaxed"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: VERIFICATION & IDENTIFIERS */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="border-b border-slate-200 pb-4">
                <h2 className="text-xl font-bold text-slate-950 flex items-center gap-2">
                  <FileCheck2 className="w-5 h-5 text-slate-800" /> Business Verification & Document Uploads
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Upload verification evidence for your business type. Conditional requirements apply based on legal form.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    GSTIN (If Applicable)
                  </label>
                  <input
                    type="text"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value.toUpperCase())}
                    placeholder="24AAAAA0000A1Z5"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 font-mono focus:outline-none focus:bg-white focus:border-slate-800 focus:ring-2 focus:ring-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Business / PAN Number
                  </label>
                  <input
                    type="text"
                    value={pan}
                    onChange={(e) => setPan(e.target.value.toUpperCase())}
                    placeholder="AAAAA0000A"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 font-mono focus:outline-none focus:bg-white focus:border-slate-800 focus:ring-2 focus:ring-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    State Tourism Reg / License No.
                  </label>
                  <input
                    type="text"
                    value={tourismRegNumber}
                    onChange={(e) => setTourismRegNumber(e.target.value)}
                    placeholder="GUJ-TOUR-2024-XXXX"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 font-mono focus:outline-none focus:bg-white focus:border-slate-800 focus:ring-2 focus:ring-slate-100"
                  />
                </div>
              </div>

              {/* Upload Boxes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {[
                  {
                    key: 'GST_CERTIFICATE',
                    title: 'GST Certificate / Business Registration Evidence',
                    desc: 'Official registration document, Udyam certificate, or partnership deed.',
                  },
                  {
                    key: 'REP_ID_PROOF',
                    title: 'Authorized Representative ID Proof',
                    desc: 'Aadhaar / Passport / Driving License of authorized manager.',
                  },
                  {
                    key: 'TOURISM_LICENSE',
                    title: 'Tourism Board / Operator License (Optional)',
                    desc: 'State tourism accreditation or IATO / ADTOI membership copy.',
                  },
                  {
                    key: 'CANCELLED_CHEQUE',
                    title: 'Settlement Bank Account Evidence',
                    desc: 'Cancelled cheque or bank letterhead for payout verification.',
                  },
                ].map((doc) => {
                  const uploaded = uploadedDocs[doc.key];
                  return (
                    <div
                      key={doc.key}
                      className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                            <FileText className="w-4 h-4 text-slate-700" /> {doc.title}
                          </span>
                          {uploaded && (
                            <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              Attached
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{doc.desc}</p>
                      </div>

                      {uploaded ? (
                        <div className="p-2.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                          <span className="truncate text-slate-800 font-mono text-[11px]">{uploaded.name}</span>
                          <span className="text-slate-400 text-[10px] shrink-0 ml-2">{uploaded.size}</span>
                        </div>
                      ) : (
                        <label className="border-2 border-dashed border-slate-300 hover:border-slate-400 rounded-xl p-3 text-center cursor-pointer block transition-colors bg-white">
                          <UploadCloud className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                          <span className="text-[11px] text-slate-600 font-semibold block">Click to upload PDF / JPG</span>
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            className="hidden"
                            onChange={(e) => handleDocMockUpload(doc.key, e)}
                          />
                        </label>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-3 text-xs text-slate-600">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <p>
                  <strong>Secure Storage Notice:</strong> Verification files are stored in private encrypted storage and accessible solely to authorized BharatYatra compliance officers. Never uploaded publicly.
                </p>
              </div>
            </div>
          )}

          {/* STEP 3: SERVICE COVERAGE */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="border-b border-slate-200 pb-4">
                <h2 className="text-xl font-bold text-slate-950 flex items-center gap-2">
                  <Compass className="w-5 h-5 text-slate-800" /> Service Coverage & Tour Capabilities
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Define your primary operating regions, packages offered, and traveller support capacity.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Primary Regional Circuit
                  </label>
                  <input
                    type="text"
                    value={primaryRegion}
                    onChange={(e) => setPrimaryRegion(e.target.value)}
                    placeholder="e.g. Saurashtra & Kutch Pilgrimage Circuit"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-slate-800 focus:ring-2 focus:ring-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    States Served (Select all that apply)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['Gujarat', 'Rajasthan', 'Uttarakhand', 'Himachal Pradesh', 'Kashmir', 'Kerala', 'Assam', 'Madhya Pradesh'].map(
                      (st) => {
                        const isSelected = selectedStates.includes(st);
                        return (
                          <button
                            type="button"
                            key={st}
                            onClick={() => toggleState(st)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                              isSelected
                                ? 'bg-slate-950 text-white border-slate-950 shadow-sm'
                                : 'bg-slate-50 border-slate-200 text-slate-700 hover:text-slate-950 hover:bg-slate-100'
                            }`}
                          >
                            {isSelected ? '✓ ' : '+ '}
                            {st}
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Key Cities & Base Hubs Served
                  </label>
                  <input
                    type="text"
                    value={citiesServed}
                    onChange={(e) => setCitiesServed(e.target.value)}
                    placeholder="Somnath, Dwarka, Sasan Gir, Junagadh, Bhuj, Ahmedabad"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-slate-800 focus:ring-2 focus:ring-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Types of Tour Packages Offered
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'Pilgrimage & Spiritual',
                      'Heritage & Culture',
                      'Wildlife Safari',
                      'Beach Holidays',
                      'Desert Expeditions',
                      'Family Vacations',
                      'Honeymoon Specials',
                      'Custom Tailormade',
                    ].map((cat) => {
                      const isSelected = packageCategories.includes(cat);
                      return (
                        <button
                          type="button"
                          key={cat}
                          onClick={() => toggleCategory(cat)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                            isSelected
                              ? 'bg-slate-950 text-white border-slate-950 shadow-sm'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:text-slate-950 hover:bg-slate-100'
                          }`}
                        >
                          {isSelected ? '✓ ' : '+ '}
                          {cat}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Languages Supported by Staff & Guides
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['Gujarati', 'Hindi', 'English', 'Marathi', 'Bengali', 'Tamil', 'Telugu'].map((lang) => {
                      const isSelected = languagesSupported.includes(lang);
                      return (
                        <button
                          type="button"
                          key={lang}
                          onClick={() => toggleLanguage(lang)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                            isSelected
                              ? 'bg-slate-950 text-white border-slate-950 shadow-sm'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:text-slate-950 hover:bg-slate-100'
                          }`}
                        >
                          {isSelected ? '✓ ' : '+ '}
                          {lang}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Customer Support Availability
                  </label>
                  <input
                    type="text"
                    value={customerSupportHours}
                    onChange={(e) => setCustomerSupportHours(e.target.value)}
                    placeholder="e.g. 24/7 On-Tour Helpline, 8:00 AM - 10:00 PM Call Center"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-slate-800 focus:ring-2 focus:ring-slate-100"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: COMMERCIAL & TERMS ACKNOWLEDGEMENT */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="border-b border-slate-200 pb-4">
                <h2 className="text-xl font-bold text-slate-950 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-slate-800" /> Commercial Preferences & Agreement Acknowledgement
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Commission terms are governed strictly by the executed partner contract.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Preferred Pricing Model
                  </label>
                  <input
                    type="text"
                    value={pricingModel}
                    onChange={(e) => setPricingModel(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-slate-800 focus:ring-2 focus:ring-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Expected Monthly Traveller Capacity
                  </label>
                  <input
                    type="number"
                    value={monthlyBookingCapacity}
                    onChange={(e) => setMonthlyBookingCapacity(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-slate-800 focus:ring-2 focus:ring-slate-100"
                  />
                </div>

                <div className="sm:col-span-2 flex flex-wrap gap-4 pt-2">
                  <label className="flex items-center gap-2 text-xs text-slate-700 font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={providesGroupTours}
                      onChange={(e) => setProvidesGroupTours(e.target.checked)}
                      className="accent-slate-900 w-4 h-4"
                    />
                    Provide Fixed Group Departures
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-700 font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={providesPrivateTours}
                      onChange={(e) => setProvidesPrivateTours(e.target.checked)}
                      className="accent-slate-900 w-4 h-4"
                    />
                    Provide Private Customized Tours
                  </label>
                </div>
              </div>

              {/* Commission Policy Callout */}
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-xs">
                <div className="font-bold text-slate-950 flex items-center gap-1.5 text-sm">
                  <BadgeCheck className="w-4 h-4 text-emerald-600" /> Commission & Marketplace Policy Notice
                </div>
                <p className="text-slate-600 leading-relaxed">
                  BharatYatra operates on a contractual commission basis (Option A: Commission-based travel marketplace). Travel agencies supply and fulfil their own tour packages. BharatYatra provides discovery, package presentation, customer quotation coordination, and transparent commission accounting.
                </p>
                <p className="text-slate-500 leading-relaxed">
                  Upon application verification, an authorized operations agreement specifies your agreed commission rate (standard 10% on eligible completed bookings). Payouts are reconciled securely without speculative financial promises.
                </p>
              </div>

              {/* Checkboxes */}
              <div className="space-y-3 pt-2">
                <label className="flex items-start gap-3 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="accent-slate-900 w-4 h-4 mt-0.5 shrink-0"
                  />
                  <span>
                    I have reviewed and agree to the <strong>BharatYatra Partner Marketplace Terms</strong>, Privacy Notice, and commercial settlement policies.
                  </span>
                </label>

                <label className="flex items-start gap-3 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={declaredAccurate}
                    onChange={(e) => setDeclaredAccurate(e.target.checked)}
                    className="accent-slate-900 w-4 h-4 mt-0.5 shrink-0"
                  />
                  <span>
                    I solemnly declare that all provided business details, registrations, and representative authorizations are accurate and verifiable.
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs font-bold rounded-xl transition-all flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Previous Step
              </button>
            ) : (
              <Link
                href="/partners/application-status"
                className="text-xs text-slate-500 hover:text-slate-900 font-semibold"
              >
                Already applied? Track status &rarr;
              </Link>
            )}

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-8 py-3 bg-slate-950 hover:bg-slate-800 text-white text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center gap-2"
              >
                Continue &rarr;
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-10 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting Application...
                  </>
                ) : (
                  <>Submit Registration Application &rarr;</>
                )}
              </button>
            )}
          </div>
        </form>
      </section>
    </div>
  );
}
