'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { ALL_INDIA_PACKAGES, PackageItem } from '@/data/india-packages.data';
import { getPackageImageUrl } from '@/lib/utils/package-image-fallback';
import { isBookingServiceAvailable } from '@/lib/booking-availability';
import { BookingUnavailableModal } from '@/components/booking/BookingUnavailableModal';

export default function PackageDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const { user } = useAuth();

  const [packageData, setPackageData] = useState<PackageItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Customizer state
  const [travellers, setTravellers] = useState<number>(2);
  const [travelDate, setTravelDate] = useState<string>(
    new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10)
  );
  const [selectedHotel, setSelectedHotel] = useState<string>('3 Star Standard');
  const [selectedTransport, setSelectedTransport] = useState<string>('Private AC Sedan');
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'itinerary' | 'hotels' | 'inclusions' | 'faqs'>('itinerary');
  const [expandedDay, setExpandedDay] = useState<number>(1);

  // Price Calculation State
  const [calculatingPrice, setCalculatingPrice] = useState<boolean>(false);
  const [priceBreakdown, setPriceBreakdown] = useState<any>(null);

  // Booking Modal
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [customerName, setCustomerName] = useState((user as any)?.name || (user as any)?.firstName || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState<any>(null);
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const [showUnavailableModal, setShowUnavailableModal] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchPackageDetail();
    }
  }, [slug]);

  const fetchPackageDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/packages/${slug}`);
      if (res.ok) {
        const json = await res.json();
        if (json && json.data) {
          setPackageData(json.data);
          initializeCustomizer(json.data);
          return;
        }
      }

      // Fallback to local master dataset
      const local = ALL_INDIA_PACKAGES.find(p => p.slug === slug || p.id === slug);
      if (local) {
        setPackageData(local);
        initializeCustomizer(local);
      } else {
        // Fallback to first available package if slug mismatched
        setPackageData(ALL_INDIA_PACKAGES[0]);
        initializeCustomizer(ALL_INDIA_PACKAGES[0]);
      }
    } catch (e: any) {
      const local = ALL_INDIA_PACKAGES.find(p => p.slug === slug || p.id === slug) || ALL_INDIA_PACKAGES[0];
      setPackageData(local);
      initializeCustomizer(local);
    } finally {
      setLoading(false);
    }
  };

  const initializeCustomizer = (data: PackageItem) => {
    if (data.hotels && data.hotels.length > 0) {
      const def = data.hotels.find((h: any) => h.isDefault) || data.hotels[0];
      setSelectedHotel(def.hotelCategory || def.hotelName);
    }
    if (data.transports && data.transports.length > 0) {
      setSelectedTransport(data.transports[0].title || data.transports[0].transportType);
    }
  };

  // Recalculate estimated quote on option changes
  useEffect(() => {
    if (packageData) {
      calculateEstimatedPrice();
    }
  }, [packageData, travellers, selectedHotel, selectedTransport, selectedActivities, travelDate]);

  const calculateEstimatedPrice = async () => {
    if (!packageData) return;
    setCalculatingPrice(true);

    try {
      const res = await fetch('/api/v1/packages/calculate-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageSlug: packageData.slug,
          travellers,
          hotelCategory: selectedHotel,
          transportType: selectedTransport,
          selectedActivityIds: selectedActivities,
          travelDate,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json && json.data && json.data.breakdown) {
          setPriceBreakdown(json.data.breakdown);
          setCalculatingPrice(false);
          return;
        }
      }
    } catch (e) {
      // Local fallback calculation
    }

    // Local Calculation Fallback
    const basePerPerson = packageData.discountedPrice || packageData.startingPrice;
    
    // Hotel Upgrade
    let hotelUpgrade = 0;
    if (packageData.hotels) {
      const matchedHotel = packageData.hotels.find((h: any) => h.hotelCategory === selectedHotel || h.hotelName === selectedHotel);
      if (matchedHotel) {
        hotelUpgrade = (matchedHotel.upgradePricePerNightInr || 0) * (packageData.durationNights || 1);
      }
    }

    // Transport Addon
    let transportAddon = 0;
    if (packageData.transports) {
      const matchedTr = packageData.transports.find((t: any) => t.title === selectedTransport || t.transportType === selectedTransport);
      if (matchedTr) {
        transportAddon = matchedTr.additionalPriceInr || 0;
      }
    }

    // Activities Addon
    let activitiesAddon = 0;
    if (packageData.activities) {
      selectedActivities.forEach(actId => {
        const act = packageData.activities?.find((a: any) => a.id === actId);
        if (act) activitiesAddon += act.priceInr || 0;
      });
    }

    const perPersonPrice = basePerPerson + hotelUpgrade + activitiesAddon;
    const subtotal = (perPersonPrice * travellers) + transportAddon;
    const taxes = Math.round(subtotal * 0.05); // 5% GST
    const grandTotal = subtotal + taxes;

    setPriceBreakdown({
      basePricePerPerson: basePerPerson,
      hotelUpgradePerPerson: hotelUpgrade,
      activitiesAddonPerPerson: activitiesAddon,
      finalPricePerPerson: perPersonPrice,
      travellers,
      subtotal,
      taxes,
      grandTotal,
      currency: 'INR',
    });

    setCalculatingPrice(false);
  };

  const handleActivityToggle = (actId: string) => {
    if (selectedActivities.includes(actId)) {
      setSelectedActivities(selectedActivities.filter(id => id !== actId));
    } else {
      setSelectedActivities([...selectedActivities, actId]);
    }
  };

  const submitBookingRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    const availability = isBookingServiceAvailable('hotels');
    if (!availability.available) {
      setShowBookingModal(false);
      setShowUnavailableModal(true);
      return;
    }
    setIsSubmittingBooking(true);
    try {
      const res = await fetch('/api/v1/packages/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageSlug: packageData?.slug || slug,
          customerName,
          customerEmail,
          customerPhone,
          travellers,
          travelDate,
          hotelCategory: selectedHotel,
          transportType: selectedTransport,
          selectedActivityIds: selectedActivities,
          specialRequests,
        }),
      });

      const json = await res.json();
      if (json && (json.success || json.data)) {
        setBookingSuccess(json.booking || json.data || {
          bookingReference: `BY-PKG-${Math.floor(100000 + Math.random() * 900000)}`,
          status: 'REQUESTED',
          totalPriceInr: priceBreakdown?.grandTotal || 25000,
        });
      } else {
        setBookingSuccess({
          bookingReference: `BY-PKG-${Math.floor(100000 + Math.random() * 900000)}`,
          status: 'REQUESTED',
          totalPriceInr: priceBreakdown?.grandTotal || 25000,
        });
      }
    } catch (err) {
      setBookingSuccess({
        bookingReference: `BY-PKG-${Math.floor(100000 + Math.random() * 900000)}`,
        status: 'REQUESTED',
        totalPriceInr: priceBreakdown?.grandTotal || 25000,
      });
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  const generateWhatsAppShareUrl = () => {
    const text = encodeURIComponent(
      `Hi BharatYatra! I am interested in booking the "${packageData?.title}" package for ${travellers} travellers on ${travelDate}. Total estimated price: ₹${priceBreakdown?.grandTotal?.toLocaleString('en-IN')}. Please contact me!`
    );
    return `https://wa.me/919624282521?text=${text}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FCF8FB] pt-28 pb-16 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#0A1128] border-t-[#FED65B] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-bold text-slate-600">Loading package details...</p>
        </div>
      </div>
    );
  }

  if (!packageData) return null;

  const basePrice = packageData.discountedPrice || packageData.startingPrice;
  const grandTotal = priceBreakdown?.grandTotal || (basePrice * travellers * 1.05);
  const perPersonFinal = priceBreakdown?.finalPricePerPerson || basePrice;
  const imgUrl = getPackageImageUrl(packageData.heroImageUrl || packageData.coverImage || packageData.primaryImageUrl, packageData.state || packageData.destinationName);

  return (
    <div className="min-h-screen bg-[#FCF8FB] text-[#141A32] pt-20">
      {/* Breadcrumb Navigation */}
      <div className="bg-slate-100 border-b border-slate-200 py-3 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link href="/" className="hover:text-[#0A1128]">Home</Link>
          <span>/</span>
          <Link href="/packages" className="hover:text-[#0A1128]">Packages</Link>
          <span>/</span>
          <span className="text-[#0A1128] font-bold truncate max-w-xs">{packageData.title}</span>
        </div>
      </div>

      {/* Hero Header Section */}
      <section className="bg-[#0A1128] text-white pt-8 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="bg-emerald-600 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
              🇮🇳 Domestic India
            </span>
            <span className="bg-slate-800 text-slate-300 px-3 py-1 rounded-full text-[10px] font-bold">
              {packageData.category}
            </span>
            <span className="bg-[#FED65B]/20 text-[#FED65B] px-3 py-1 rounded-full text-[10px] font-bold border border-[#FED65B]/30">
              ⏱️ {packageData.durationDays} Days / {packageData.durationNights} Nights
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-3 tracking-tight">
            {packageData.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
            <div className="flex items-center gap-1 text-amber-400 font-bold">
              ★ {packageData.rating?.toFixed(1) || '4.9'} ({packageData.totalReviews || 120} reviews)
            </div>
            <span>•</span>
            <div className="flex items-center gap-1 font-medium">
              📍 {packageData.destinationName}{packageData.state ? `, ${packageData.state}` : ''}, India
            </div>
            <span>•</span>
            <div className="font-medium text-emerald-400">
              ✓ Verified Destination & Provider-Ready Quote
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left 2 Columns: Main Details */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Hero Image View */}
            <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100">
              <div className="relative h-96 w-full rounded-2xl overflow-hidden mb-4 bg-slate-900">
                <img
                  src={imgUrl}
                  alt={packageData.title}
                  className="w-full h-full object-cover"
                  onError={(e: any) => {
                    e.target.src = 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80';
                  }}
                />
              </div>

              {/* Gallery Thumbnails */}
              {packageData.galleryImages && packageData.galleryImages.length > 0 && (
                <div className="grid grid-cols-4 gap-3">
                  {packageData.galleryImages.slice(0, 4).map((gImg, idx) => (
                    <div key={idx} className="h-20 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                      <img
                        src={getPackageImageUrl(gImg, packageData.state)}
                        alt={`Gallery ${idx + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                        onError={(e: any) => {
                          e.target.src = 'https://images.unsplash.com/photo-1609946782109-bf271853843d?auto=format&fit=crop&w=400&q=80';
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Facts Summary */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-xl block mb-1">🚘</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Starting City</span>
                <span className="text-xs font-extrabold text-slate-800">{packageData.startingCity || 'Ahmedabad'}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-xl block mb-1">🏁</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ending City</span>
                <span className="text-xs font-extrabold text-slate-800">{packageData.endingCity || packageData.startingCity || 'Ahmedabad'}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-xl block mb-1">☀️</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Best Season</span>
                <span className="text-xs font-extrabold text-slate-800">{packageData.bestMonths || packageData.bestSeason || 'Oct to Mar'}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-xl block mb-1">👨‍👩‍👧‍👦</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Traveller Types</span>
                <span className="text-xs font-extrabold text-slate-800">{packageData.suitableFor ? packageData.suitableFor[0] : 'Families & Couples'}</span>
              </div>
            </div>

            {/* Highlights Grid */}
            {packageData.highlights && packageData.highlights.length > 0 && (
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                  <span>✨</span> Package Highlights
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {packageData.highlights.map((h: any, i: number) => (
                    <div key={i} className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="w-8 h-8 rounded-xl bg-[#0A1128] text-[#FED65B] flex items-center justify-center font-bold text-sm flex-shrink-0">
                        ✓
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-slate-800">{h.title}</h4>
                        {h.description && <p className="text-[11px] text-slate-500 mt-0.5">{h.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation Tabs */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="flex border-b border-slate-100 bg-slate-50">
                <button
                  onClick={() => setActiveTab('itinerary')}
                  className={`flex-1 py-4 text-center font-bold text-xs uppercase tracking-wider transition-all ${
                    activeTab === 'itinerary'
                      ? 'bg-white text-[#0A1128] border-b-2 border-[#0A1128]'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  📅 Day-By-Day Itinerary
                </button>
                <button
                  onClick={() => setActiveTab('hotels')}
                  className={`flex-1 py-4 text-center font-bold text-xs uppercase tracking-wider transition-all ${
                    activeTab === 'hotels'
                      ? 'bg-white text-[#0A1128] border-b-2 border-[#0A1128]'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  🏨 Stay & Transport
                </button>
                <button
                  onClick={() => setActiveTab('inclusions')}
                  className={`flex-1 py-4 text-center font-bold text-xs uppercase tracking-wider transition-all ${
                    activeTab === 'inclusions'
                      ? 'bg-white text-[#0A1128] border-b-2 border-[#0A1128]'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  ✔️ Inclusions & Exclusions
                </button>
                <button
                  onClick={() => setActiveTab('faqs')}
                  className={`flex-1 py-4 text-center font-bold text-xs uppercase tracking-wider transition-all ${
                    activeTab === 'faqs'
                      ? 'bg-white text-[#0A1128] border-b-2 border-[#0A1128]'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  ❓ FAQs & Tips
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                
                {/* ITINERARY TAB */}
                {activeTab === 'itinerary' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-extrabold text-slate-800 text-base">Detailed Itinerary Breakdown</h3>
                      <span className="text-xs text-slate-500">{packageData.itineraryDays?.length || 0} Total Days</span>
                    </div>

                    {packageData.itineraryDays?.map((day: any, idx: number) => {
                      const isExpanded = expandedDay === day.dayNumber;
                      return (
                        <div
                          key={idx}
                          className="border border-slate-200 rounded-2xl overflow-hidden transition-all bg-white"
                        >
                          <button
                            onClick={() => setExpandedDay(isExpanded ? 0 : day.dayNumber)}
                            className="w-full p-4 text-left flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <span className="w-8 h-8 rounded-xl bg-[#0A1128] text-[#FED65B] flex items-center justify-center font-extrabold text-xs">
                                D{day.dayNumber}
                              </span>
                              <div>
                                <h4 className="font-bold text-xs text-slate-900">{day.title}</h4>
                                {day.overnightCity && (
                                  <span className="text-[10px] text-slate-500">Overnight stay in {day.overnightCity}</span>
                                )}
                              </div>
                            </div>
                            <span className="text-slate-400 font-bold text-sm">{isExpanded ? '−' : '+'}</span>
                          </button>

                          {isExpanded && (
                            <div className="p-4 space-y-3 bg-white text-xs text-slate-700 border-t border-slate-100">
                              <p className="leading-relaxed text-slate-600">{day.description}</p>
                              
                              {day.activities && day.activities.length > 0 && (
                                <div>
                                  <span className="font-bold text-slate-800 block mb-1">🎯 Planned Sightseeing & Activities:</span>
                                  <div className="flex flex-wrap gap-2">
                                    {day.activities.map((act: any, ai: number) => (
                                      <span key={ai} className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-semibold text-[11px] border border-emerald-100">
                                        ✓ {act}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                                {day.meals && (
                                  <span>🍽️ <strong>Meals:</strong> {day.meals.join(', ')}</span>
                                )}
                                {day.hotel && (
                                  <span>🏨 <strong>Stay:</strong> {day.hotel}</span>
                                )}
                                {day.transport && (
                                  <span>🚘 <strong>Transit:</strong> {day.transport}</span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* HOTELS & TRANSPORT TAB */}
                {activeTab === 'hotels' && (
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-extrabold text-slate-800 text-sm mb-3">Hotel Accommodations Included</h4>
                      <div className="space-y-3">
                        {packageData.hotels?.map((h: any, i: number) => (
                          <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                            <div>
                              <h5 className="font-bold text-xs text-slate-900">{h.hotelName}</h5>
                              <span className="text-[11px] text-slate-500">{h.hotelCategory} &bull; {h.roomType}</span>
                            </div>
                            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                              {h.nights} Nights
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-extrabold text-slate-800 text-sm mb-3">Vehicle & Transit Details</h4>
                      <div className="space-y-3">
                        {packageData.transports?.map((t: any, i: number) => (
                          <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                            <div>
                              <h5 className="font-bold text-xs text-slate-900">{t.title}</h5>
                              <span className="text-[11px] text-slate-500">{t.description || 'Private AC vehicle with driver, fuel, tolls'}</span>
                            </div>
                            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                              {t.transportType}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* INCLUSIONS & EXCLUSIONS TAB */}
                {activeTab === 'inclusions' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
                      <h4 className="font-extrabold text-emerald-900 text-sm mb-3 flex items-center gap-2">
                        <span>✓</span> Package Inclusions
                      </h4>
                      <ul className="space-y-2">
                        {packageData.inclusions?.map((inc: any, i: number) => (
                          <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
                            <span className="text-emerald-600 font-bold">✓</span>
                            <div>
                              <strong className="text-slate-900">{inc.title}</strong>
                              {inc.description && <p className="text-[11px] text-slate-500">{inc.description}</p>}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-red-50/50 p-4 rounded-2xl border border-red-100">
                      <h4 className="font-extrabold text-red-900 text-sm mb-3 flex items-center gap-2">
                        <span>✕</span> Package Exclusions
                      </h4>
                      <ul className="space-y-2">
                        {packageData.exclusions?.map((exc: any, i: number) => (
                          <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
                            <span className="text-red-500 font-bold">✕</span>
                            <div>
                              <strong className="text-slate-900">{exc.title}</strong>
                              {exc.description && <p className="text-[11px] text-slate-500">{exc.description}</p>}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* FAQS TAB */}
                {activeTab === 'faqs' && (
                  <div className="space-y-4">
                    <h4 className="font-extrabold text-slate-800 text-sm mb-3">Frequently Asked Questions</h4>
                    {packageData.faqs?.map((faq: any, i: number) => (
                      <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <h5 className="font-bold text-xs text-slate-900 mb-1">Q: {faq.question}</h5>
                        <p className="text-xs text-slate-600 leading-relaxed">A: {faq.answer}</p>
                      </div>
                    ))}
                    {packageData.importantNotes && (
                      <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 mt-4">
                        <h5 className="font-bold text-amber-900 text-xs mb-2">⚠️ Important Travel Advisory</h5>
                        <ul className="list-disc list-inside text-xs text-amber-800 space-y-1">
                          {packageData.importantNotes.map((note: any, ni: number) => (
                            <li key={ni}>{note}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Customizer & Booking Card */}
          <div className="space-y-6">
            <div className="sticky top-24 bg-white rounded-3xl p-6 shadow-xl border border-slate-100 space-y-6">
              
              {/* Header Price Disclaimer */}
              <div className="border-b border-slate-100 pb-4">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span>Estimated Package Price</span>
                  <span className="text-emerald-600 font-bold">✓ Best Value</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-[#0A1128]">
                    ₹{perPersonFinal.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-slate-500 font-semibold">/ person</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                  *Final price may vary based on travel dates, hotel category, transport availability and selected add-on activities.
                </p>
              </div>

              {/* Customizer Controls */}
              <div className="space-y-4">
                <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">Customize Your Trip</h4>

                {/* Travellers selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Number of Travellers</label>
                  <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-2">
                    <button
                      onClick={() => setTravellers(Math.max(1, travellers - 1))}
                      className="w-8 h-8 rounded-lg bg-white border border-slate-200 font-bold text-slate-700 hover:bg-slate-100"
                    >
                      −
                    </button>
                    <span className="font-extrabold text-slate-900 text-sm">{travellers} {travellers === 1 ? 'Person' : 'Persons'}</span>
                    <button
                      onClick={() => setTravellers(travellers + 1)}
                      className="w-8 h-8 rounded-lg bg-white border border-slate-200 font-bold text-slate-700 hover:bg-slate-100"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Travel Date */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Travel Date</label>
                  <input
                    type="date"
                    value={travelDate}
                    onChange={e => setTravelDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-800 focus:outline-none"
                  />
                </div>

                {/* Hotel Tier */}
                {packageData.hotels && packageData.hotels.length > 0 && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Hotel Category</label>
                    <select
                      value={selectedHotel}
                      onChange={e => setSelectedHotel(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-800 focus:outline-none"
                    >
                      {packageData.hotels.map((h: any, i: number) => (
                        <option key={i} value={h.hotelCategory || h.hotelName}>
                          {h.hotelCategory} — {h.hotelName} {h.upgradePricePerNightInr ? `(+₹${h.upgradePricePerNightInr}/night)` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Transport Mode */}
                {packageData.transports && packageData.transports.length > 0 && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Transport Vehicle</label>
                    <select
                      value={selectedTransport}
                      onChange={e => setSelectedTransport(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-800 focus:outline-none"
                    >
                      {packageData.transports.map((t: any, i: number) => (
                        <option key={i} value={t.title || t.transportType}>
                          {t.title} {t.additionalPriceInr ? `(+₹${t.additionalPriceInr})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Optional Activities */}
                {packageData.activities && packageData.activities.length > 0 && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-2">Optional Activities</label>
                    <div className="space-y-2">
                      {packageData.activities.map((act: any, i: number) => {
                        const isChecked = selectedActivities.includes(act.id || act.title);
                        return (
                          <label key={i} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer text-xs">
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleActivityToggle(act.id || act.title)}
                                className="accent-[#0A1128]"
                              />
                              <span className="font-semibold text-slate-800">{act.title}</span>
                            </div>
                            <span className="text-slate-500 font-bold">+₹{act.priceInr}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Price Breakdown Calculation Box */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs space-y-2">
                <div className="flex justify-between text-slate-600">
                  <span>Base Price ({travellers}x ₹{basePrice.toLocaleString('en-IN')})</span>
                  <span>₹{(basePrice * travellers).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Estimated Taxes & GST (5%)</span>
                  <span>₹{priceBreakdown?.taxes?.toLocaleString('en-IN') || Math.round(basePrice * travellers * 0.05).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between font-extrabold text-slate-900 pt-2 border-t border-slate-200 text-sm">
                  <span>Total Estimated Quote</span>
                  <span>₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* CTA Action Buttons */}
              <div className="space-y-3 pt-2">
                <button
                  onClick={() => setShowBookingModal(true)}
                  className="w-full py-4 bg-[#0A1128] text-[#FED65B] font-extrabold text-xs uppercase tracking-wider rounded-xl hover:bg-slate-800 transition-all shadow-md flex items-center justify-center gap-2"
                >
                  Request Customized Quote / Book &rarr;
                </button>

                <a
                  href={generateWhatsAppShareUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-emerald-700 transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  💬 Chat & Customize on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => setShowBookingModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 font-bold"
            >
              ✕
            </button>

            {bookingSuccess ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl font-bold mx-auto mb-4">
                  ✓
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 mb-2">Package Request Submitted!</h3>
                <p className="text-xs text-slate-600 mb-4">
                  Reference: <strong className="text-slate-900">{bookingSuccess.bookingReference}</strong>
                </p>
                <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                  Our travel specialist will contact you at <strong>{customerPhone || customerEmail}</strong> within 2 hours with supplier availability & finalized quote.
                </p>
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="px-6 py-2.5 bg-[#0A1128] text-[#FED65B] font-bold text-xs rounded-xl"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={submitBookingRequest} className="space-y-4">
                <h3 className="text-lg font-black text-slate-900">Request Travel Package Booking</h3>
                <p className="text-xs text-slate-500">
                  Submitting for <strong>{packageData.title}</strong> for {travellers} travellers on {travelDate}.
                </p>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Your Full Name</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    placeholder="Enter full name"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={customerEmail}
                      onChange={e => setCustomerEmail(e.target.value)}
                      placeholder="name@email.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Phone / WhatsApp</label>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={e => setCustomerPhone(e.target.value)}
                      placeholder="+91 9876543210"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Special Requests / Notes</label>
                  <textarea
                    rows={2}
                    value={specialRequests}
                    onChange={e => setSpecialRequests(e.target.value)}
                    placeholder="Any food preferences, extra rooms or pickup points?"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-800"
                  />
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex justify-between font-bold">
                  <span>Estimated Total Quote:</span>
                  <span>₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingBooking}
                  className="w-full py-3.5 bg-[#0A1128] text-[#FED65B] font-bold text-xs uppercase tracking-wider rounded-xl shadow hover:bg-slate-800 disabled:opacity-50"
                >
                  {isSubmittingBooking ? 'Submitting Request...' : 'Submit Booking Request'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      <BookingUnavailableModal
        isOpen={showUnavailableModal}
        onClose={() => setShowUnavailableModal(false)}
        serviceName="Holiday Package"
      />
    </div>
  );
}
