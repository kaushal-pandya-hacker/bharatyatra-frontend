'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, MapPin, Calendar, Users, Wallet } from 'lucide-react';

export function AIPlannerWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [destination, setDestination] = useState('');
  const [dates, setDates] = useState('');
  const [travellers, setTravellers] = useState('2 Travellers');
  const [budget, setBudget] = useState('MID_RANGE');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      router.push('/trips/demo-trip-id-123');
    }, 1500);
  };

  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-brand-primary" />
          <h2 className="text-lg font-bold font-heading text-slate-900">AI Trip Planner</h2>
        </div>
        <span className="text-xs font-semibold text-slate-500">Step {step} of 4</span>
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <label className="block text-sm font-medium text-slate-700">Where in Gujarat do you want to explore?</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. Kutch Rann Utsav, Sasan Gir, Somnath"
              className="pl-9"
            />
          </div>
          <div className="flex gap-2 pt-2">
            {['Kutch Rann Utsav', 'Sasan Gir', 'Somnath & Dwarka'].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setDestination(preset)}
                className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600 hover:bg-brand-primary/10 hover:text-brand-primary"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <label className="block text-sm font-medium text-slate-700">When are you travelling?</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              value={dates}
              onChange={(e) => setDates(e.target.value)}
              placeholder="Select dates (e.g. Nov 10 - Nov 14)"
              className="pl-9"
            />
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <label className="block text-sm font-medium text-slate-700">Who is travelling?</label>
          <div className="grid grid-cols-2 gap-3">
            {['Solo', 'Couple', 'Family with Kids', 'Group of Friends'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setTravellers(type)}
                className={`rounded-lg border p-3 text-left text-sm font-medium transition-all ${
                  travellers === type ? 'border-brand-primary bg-brand-primary/5 text-brand-primary' : 'border-slate-200 text-slate-700'
                }`}
              >
                <Users className="h-4 w-4 mb-1 text-slate-400" />
                {type}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <label className="block text-sm font-medium text-slate-700">Select Budget Preference</label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'BUDGET', label: 'Budget', desc: '< ₹10,000' },
              { id: 'MID_RANGE', label: 'Mid-Range', desc: '₹10k - ₹25k' },
              { id: 'LUXURY', label: 'Luxury', desc: '> ₹25,000' },
            ].map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setBudget(b.id)}
                className={`rounded-lg border p-3 text-center transition-all ${
                  budget === b.id ? 'border-brand-primary bg-brand-primary/5 text-brand-primary' : 'border-slate-200 text-slate-700'
                }`}
              >
                <Wallet className="h-4 w-4 mx-auto mb-1 text-slate-400" />
                <div className="text-sm font-semibold">{b.label}</div>
                <div className="text-[10px] text-slate-500">{b.desc}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-4">
        {step > 1 ? (
          <Button variant="outline" size="sm" onClick={() => setStep(step - 1)}>
            Back
          </Button>
        ) : <div />}

        {step < 4 ? (
          <Button size="sm" onClick={() => setStep(step + 1)}>
            Continue
          </Button>
        ) : (
          <Button size="sm" onClick={handleGenerate} disabled={isGenerating} className="gap-2">
            <Sparkles className="h-4 w-4" />
            {isGenerating ? 'Generating Trip...' : 'Generate My Trip'}
          </Button>
        )}
      </div>
    </div>
  );
}
