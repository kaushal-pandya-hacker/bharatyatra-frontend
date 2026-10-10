'use client';

import React from 'react';
import {
  Building,
  Bus,
  Plane,
  Train,
  Compass,
  Car,
  Calendar,
  MapPin,
  CheckCircle,
  ShieldCheck,
} from 'lucide-react';

export interface UniversalConfirmationCardProps {
  productType: 'HOTEL' | 'FLIGHT' | 'BUS' | 'TRAIN' | 'ACTIVITY' | 'TRANSFER' | string;
  bookingReference: string;
  supplierReference: string;
  productName: string;
  checkIn: string;
  checkOut?: string;
  rateName?: string;
  boardName?: string;
  holderName: string;
  totalPrice: number;
  currency?: string;
  status: string;
  cancellationPolicy?: string;
}

export default function UniversalConfirmationCard({
  productType,
  bookingReference,
  supplierReference,
  productName,
  checkIn,
  checkOut,
  rateName,
  boardName,
  holderName,
  totalPrice,
  currency = 'INR',
  status,
  cancellationPolicy = 'Standard Policy',
}: UniversalConfirmationCardProps) {
  const getProductIcon = () => {
    switch (productType?.toUpperCase()) {
      case 'HOTEL':
        return <Building className="w-6 h-6 text-amber-500" />;
      case 'BUS':
        return <Bus className="w-6 h-6 text-blue-500" />;
      case 'FLIGHT':
        return <Plane className="w-6 h-6 text-indigo-500" />;
      case 'TRAIN':
        return <Train className="w-6 h-6 text-emerald-500" />;
      case 'ACTIVITY':
        return <Compass className="w-6 h-6 text-purple-500" />;
      case 'TRANSFER':
        return <Car className="w-6 h-6 text-orange-500" />;
      default:
        return <Building className="w-6 h-6 text-amber-500" />;
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200">
            {getProductIcon()}
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{productType} Reservation</span>
            <h3 className="text-xl font-bold text-slate-900">{productName}</h3>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
          {status}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
        <div>
          <span className="text-slate-500 block">Date / Departure</span>
          <span className="font-bold text-slate-900 flex items-center gap-1 mt-1">
            <Calendar className="w-4 h-4 text-slate-400" /> {checkIn} {checkOut ? ` → ${checkOut}` : ''}
          </span>
        </div>
        <div>
          <span className="text-slate-500 block">Selection / Tier</span>
          <span className="font-bold text-slate-900 block mt-1">{rateName || 'Standard'}</span>
          {boardName && <span className="text-slate-500 block">{boardName}</span>}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-slate-100 text-xs">
        <div>
          <span className="text-slate-500 block">BharatYatra Reference: <strong className="text-slate-900 font-mono">{bookingReference}</strong></span>
          <span className="text-slate-500 block">Supplier Reference: <strong className="text-amber-600 font-mono">{supplierReference}</strong></span>
        </div>
        <div className="text-right">
          <span className="text-slate-500 block">Total Amount Paid</span>
          <span className="text-xl font-extrabold text-amber-600">₹{totalPrice.toLocaleString('en-IN')} {currency}</span>
        </div>
      </div>
    </div>
  );
}
