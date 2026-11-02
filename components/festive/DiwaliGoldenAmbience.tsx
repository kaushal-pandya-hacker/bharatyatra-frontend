'use client';

import React, { useMemo } from 'react';
import { useDiwali } from '@/lib/campaigns/diwali-context';

interface DiwaliGoldenAmbienceProps {
  density?: 'low' | 'medium' | 'high';
  className?: string;
}

export function DiwaliGoldenAmbience({
  density = 'medium',
  className = '',
}: DiwaliGoldenAmbienceProps) {
  const { reducedMotion } = useDiwali();

  const particleCount = density === 'low' ? 14 : density === 'high' ? 36 : 22;

  // Generate deterministic particle coordinates to avoid hydration mismatch
  const particles = useMemo(() => {
    return Array.from({ length: particleCount }).map((_, i) => {
      const left = ((i * 29) % 96) + 2;
      const top = ((i * 47) % 92) + 4;
      const size = (i % 3) + 2; // 2px to 4px
      const duration = (i % 4) + 4; // 4s to 7s
      const delay = (i % 3) * 1.2;
      const opacity = ((i % 5) + 3) / 10; // 0.3 to 0.7
      return { id: i, left, top, size, duration, delay, opacity };
    });
  }, [particleCount]);

  if (reducedMotion) {
    return null;
  }

  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none z-10 select-none ${className}`}
      aria-hidden="true"
    >
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute rounded-full bg-gradient-to-t from-amber-400 to-yellow-200 animate-pulse shadow-[0_0_8px_rgba(245,189,79,0.8)]"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            opacity: p.opacity,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

