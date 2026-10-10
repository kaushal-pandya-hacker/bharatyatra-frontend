'use client';
import { CloudRain, AlertTriangle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface AdaptiveAlertBannerProps {
  title: string;
  description: string;
  onReviewProposal: () => void;
}

export function AdaptiveAlertBanner({ title, description, onReviewProposal }: AdaptiveAlertBannerProps) {
  return (
    <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-amber-900 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-amber-200 p-2 text-amber-800">
          <CloudRain className="h-5 w-5" />
        </div>
        <div>
          <h4 className="text-sm font-semibold flex items-center gap-1.5">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            {title}
          </h4>
          <p className="text-xs text-amber-800 mt-0.5">{description}</p>
        </div>
      </div>
      <Button
        size="sm"
        onClick={onReviewProposal}
        className="bg-amber-600 hover:bg-amber-700 text-white shrink-0 gap-1"
      >
        Review 1 Recommended Change
        <ArrowRight className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
