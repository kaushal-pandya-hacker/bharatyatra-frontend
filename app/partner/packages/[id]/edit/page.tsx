'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import PackageEditorWizard from '@/components/partner/PackageEditorWizard';
import { TravelPackage } from '@/types/travel-partner';

export default function EditPackagePage() {
  const params = useParams();
  const id = params?.id as string;
  const [pkg, setPkg] = useState<TravelPackage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetch(`/api/v1/partner/packages/${id}`)
        .then((r) => r.json())
        .then((json) => {
          if (json.success && json.data) {
            setPkg(json.data);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <div className="w-8 h-8 border-2 border-[#FED65B] border-t-transparent rounded-full animate-spin" />
        <div className="text-xs text-slate-400 font-semibold">Loading package...</div>
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="p-8 bg-slate-900 border border-slate-800 rounded-3xl text-center">
        <div className="text-base font-bold text-white mb-2">Package Not Found</div>
        <p className="text-xs text-slate-400">Could not find package with identifier {id}.</p>
      </div>
    );
  }

  return <PackageEditorWizard initialPackage={pkg} isEditing={true} />;
}
