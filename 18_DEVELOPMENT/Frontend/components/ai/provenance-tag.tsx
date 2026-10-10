import { Badge } from '@/components/ui/badge';
import { ShieldCheck, Zap, Sparkles } from 'lucide-react';

export interface ProvenanceTagProps {
  type: 'VERIFIED' | 'LIVE' | 'AI_SUGGESTED';
}

export function ProvenanceTag({ type }: ProvenanceTagProps) {
  if (type === 'VERIFIED') {
    return (
      <Badge variant="verified" className="gap-1">
        <ShieldCheck className="h-3 w-3" />
        Verified Platform Data
      </Badge>
    );
  }

  if (type === 'LIVE') {
    return (
      <Badge variant="live" className="gap-1">
        <Zap className="h-3 w-3" />
        Live Provider Data
      </Badge>
    );
  }

  return (
    <Badge variant="ai" className="gap-1">
      <Sparkles className="h-3 w-3" />
      AI Recommendation
    </Badge>
  );
}
