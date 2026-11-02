'use client';

import React from 'react';

interface DiwaliDiyaProps {
  size?: number;
  className?: string;
  animate?: boolean;
}

export function DiwaliDiya({ size = 32, className = '', animate = true }: DiwaliDiyaProps) {
  return (
    <div
      className={`inline-flex items-center justify-center shrink-0 relative select-none ${className}`}
      style={{ width: size, height: size }}
      aria-label="Diwali Diya Lamp"
    >
      <svg
        viewBox="0 0 64 64"
        width={size}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible"
      >
        <defs>
          {/* Flame Gradient */}
          <radialGradient
            id="flameGlow"
            cx="50%"
            cy="50%"
            r="50%"
            fx="50%"
            fy="50%"
          >
            <stop offset="0%" stopColor="#FFF3B0" stopOpacity="0.95" />
            <stop offset="45%" stopColor="#F5BD4F" stopOpacity="0.8" />
            <stop offset="80%" stopColor="#F28C28" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#F28C28" stopOpacity="0" />
          </radialGradient>

          {/* Diya Clay Gradient */}
          <linearGradient id="clayGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C06C2E" />
            <stop offset="40%" stopColor="#8A3B14" />
            <stop offset="100%" stopColor="#5E260A" />
          </linearGradient>

          {/* Golden Rim Highlight */}
          <linearGradient id="goldRim" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#F5BD4F" />
            <stop offset="50%" stopColor="#FFF1B8" />
            <stop offset="100%" stopColor="#F5BD4F" />
          </linearGradient>
        </defs>

        {/* Outer Warm Flame Halo */}
        <circle
          cx="32"
          cy="22"
          r="16"
          fill="url(#flameGlow)"
          className={animate ? 'animate-pulse' : ''}
          style={{ animationDuration: '2.5s' }}
        />

        {/* Diya Clay Base */}
        <path
          d="M10 38C12 49 22 56 32 56C42 56 52 49 54 38C54 37 50 36 32 36C14 36 10 37 10 38Z"
          fill="url(#clayGradient)"
          stroke="#5E260A"
          strokeWidth="1.5"
        />

        {/* Golden Ornate Rim */}
        <ellipse
          cx="32"
          cy="37"
          rx="22"
          ry="4"
          fill="url(#goldRim)"
          stroke="#C06C2E"
          strokeWidth="1"
        />

        {/* Inner Oil Bed */}
        <ellipse
          cx="32"
          cy="37.5"
          rx="17"
          ry="2.5"
          fill="#4A1D08"
        />

        {/* Traditional Wick Base */}
        <path
          d="M31 37L32 30"
          stroke="#2A0F04"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* The Sacred Flame */}
        <path
          d="M32 10C35 18 38 22 36 28C34.5 32.5 29.5 32.5 28 28C26 22 29 18 32 10Z"
          fill="#F5BD4F"
          className={animate ? 'animate-bounce' : ''}
          style={{
            transformOrigin: '32px 28px',
            animationDuration: '1.8s',
          }}
        />

        {/* Core White Flame */}
        <path
          d="M32 16C33.5 20 35 23 34 26C33 28.5 31 28.5 30 26C29 23 30.5 20 32 16Z"
          fill="#FFFFFF"
          opacity="0.9"
        />
      </svg>
    </div>
  );
}

