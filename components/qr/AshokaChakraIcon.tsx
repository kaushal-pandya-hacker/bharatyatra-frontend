'use client';

import React from 'react';

interface AshokaChakraIconProps {
  className?: string;
  size?: number;
  color?: string;
}

export function AshokaChakraIcon({
  className = 'w-6 h-6',
  size = 24,
  color = '#000080',
}: AshokaChakraIconProps) {
  // Pre-calculated 24 spokes (every 15 degrees from center 50,50 with radius 40)
  const spokes = Array.from({ length: 24 }, (_, i) => {
    const angle = (i * 15 * Math.PI) / 180;
    const x2 = 50 + 38 * Math.cos(angle);
    const y2 = 50 + 38 * Math.sin(angle);
    return { id: i, x2, y2 };
  });

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Ashoka Chakra Decorative Motif"
    >
      {/* Outer Rim */}
      <circle cx="50" cy="50" r="46" stroke={color} strokeWidth="4" />
      <circle cx="50" cy="50" r="41" stroke={color} strokeWidth="1.5" strokeOpacity="0.4" />
      
      {/* 24 Spokes */}
      {spokes.map((spoke) => (
        <line
          key={spoke.id}
          x1="50"
          y1="50"
          x2={spoke.x2}
          y2={spoke.y2}
          stroke={color}
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      ))}

      {/* Inner Hub and Center Pin */}
      <circle cx="50" cy="50" r="10" stroke={color} strokeWidth="2.5" fill="white" />
      <circle cx="50" cy="50" r="4" fill={color} />
    </svg>
  );
}

