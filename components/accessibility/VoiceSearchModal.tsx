'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAccessibility } from '@/lib/accessibility/accessibility-context';

interface VoiceSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VoiceSearchModal({ isOpen, onClose }: VoiceSearchModalProps) {
  const router = useRouter();
  const { t } = useAccessibility();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setIsListening(false);
      setTranscript('');
      return;
    }

    setIsListening(true);
    // Simulate or use Web Speech API
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      try {
        const SpeechRecognition = (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;

        recognition.onresult = (event: any) => {
          const current = event.resultIndex;
          const text = event.results[current][0].transcript;
          setTranscript(text);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.start();
        return () => {
          recognition.stop();
        };
      } catch (e) {
        setIsListening(true);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const sampleQueries = [
    'Find hotels in Ahmedabad',
    'Show my trips and bookings',
    'Plan a trip to Kashmir',
    'Search trains to Dwarka',
  ];

  const handleSelectQuery = (query: string) => {
    setTranscript(query);
    setTimeout(() => {
      onClose();
      if (query.toLowerCase().includes('hotel') || query.toLowerCase().includes('ahmedabad')) {
        router.push('/destinations/ahmedabad');
      } else if (query.toLowerCase().includes('trip') || query.toLowerCase().includes('booking')) {
        router.push('/my-trips');
      } else if (query.toLowerCase().includes('kashmir') || query.toLowerCase().includes('plan')) {
        router.push('/plan');
      } else {
        router.push(`/explore?q=${encodeURIComponent(query)}`);
      }
    }, 600);
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white border-2 border-slate-300 rounded-3xl max-w-lg w-full p-8 shadow-2xl space-y-6 text-center">
        <div className="flex justify-between items-center border-b border-slate-200 pb-4">
          <span className="text-sm font-black text-blue-700 uppercase tracking-wider flex items-center gap-2">
            <span className="material-symbols-outlined text-xl">mic</span>
            Voice Travel Assistant
          </span>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-slate-100 text-slate-800 font-bold text-lg hover:bg-slate-200"
          >
            ✕
          </button>
        </div>

        {/* Pulsing Mic Indicator */}
        <div className="py-6 flex flex-col items-center justify-center space-y-4">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center border-4 border-blue-600 shadow-xl">
              <span className="material-symbols-outlined text-5xl text-blue-700 animate-pulse">mic</span>
            </div>
            {isListening && (
              <span className="absolute inset-0 rounded-full border-4 border-blue-400 animate-ping opacity-75"></span>
            )}
          </div>
          <p className="text-xl font-black text-slate-900">
            {isListening ? t.home.voiceListening : 'Listening paused'}
          </p>
          {transcript && (
            <div className="p-4 rounded-2xl bg-blue-50 border-2 border-blue-300 text-slate-900 font-extrabold text-lg">
              “{transcript}”
            </div>
          )}
        </div>

        {/* Sample Voice Prompts for Elderly & Children */}
        <div className="space-y-3 pt-2 text-left">
          <span className="text-xs font-black text-slate-500 uppercase tracking-wider block">
            Or tap any sample query below:
          </span>
          <div className="grid grid-cols-1 gap-2">
            {sampleQueries.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectQuery(q)}
                className="p-3.5 rounded-2xl bg-slate-50 hover:bg-blue-50 border-2 border-slate-200 hover:border-blue-400 text-slate-900 font-bold text-sm text-left flex items-center justify-between transition-colors min-h-[48px]"
              >
                <span>🗣️ “{q}”</span>
                <span className="text-blue-700 font-extrabold">→</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
