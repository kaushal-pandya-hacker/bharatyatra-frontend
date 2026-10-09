'use client';

import React from 'react';
import { useAccessibility, TextSize } from '@/lib/accessibility/accessibility-context';
import { Language } from '@/lib/i18n/translations';

export function AccessibilityModal() {
  const {
    isSettingsOpen,
    closeSettings,
    textSize,
    setTextSize,
    highContrast,
    setHighContrast,
    reducedMotion,
    setReducedMotion,
    language,
    setLanguage,
    voiceAssistance,
    setVoiceAssistance,
    t,
  } = useAccessibility();

  if (!isSettingsOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="accessibility-modal-title"
    >
      <div className="bg-white border-2 border-slate-300 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-3xl text-blue-700">accessibility_new</span>
            <h2 id="accessibility-modal-title" className="text-xl sm:text-2xl font-black text-slate-900">
              {t.accessibility.title}
            </h2>
          </div>
          <button
            onClick={closeSettings}
            className="w-11 h-11 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center font-bold text-xl transition-colors focus:ring-4 focus:ring-blue-500/20"
            aria-label={t.accessibility.close}
          >
            ✕
          </button>
        </div>

        {/* 1. Language Preference */}
        <div className="space-y-3">
          <label className="block text-base font-bold text-slate-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-xl text-orange-600">translate</span>
            <span>{t.accessibility.language}</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { code: 'en', label: 'English' },
              { code: 'gu', label: 'ગુજરાતી' },
              { code: 'hi', label: 'हिन्दी' },
            ].map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code as Language)}
                className={`py-3.5 px-3 rounded-2xl text-base font-extrabold border-2 transition-all min-h-[48px] flex items-center justify-center ${
                  language === lang.code
                    ? 'bg-blue-700 text-white border-blue-700 shadow-md'
                    : 'bg-slate-50 text-slate-800 border-slate-300 hover:border-slate-400'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Text Size Controls */}
        <div className="space-y-3">
          <label className="block text-base font-bold text-slate-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-xl text-amber-600">format_size</span>
            <span>{t.accessibility.textSize}</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              { key: 'standard', label: t.accessibility.standard },
              { key: 'large', label: t.accessibility.large },
              { key: 'extra-large', label: t.accessibility.extraLarge },
            ].map((option) => (
              <button
                key={option.key}
                onClick={() => setTextSize(option.key as TextSize)}
                className={`py-3.5 px-3 rounded-2xl text-sm font-bold border-2 transition-all min-h-[48px] flex items-center justify-center text-center ${
                  textSize === option.key
                    ? 'bg-blue-700 text-white border-blue-700 shadow-md'
                    : 'bg-slate-50 text-slate-800 border-slate-300 hover:border-slate-400'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3. High Contrast Toggle */}
        <div className="flex items-center justify-between p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl">
          <div className="space-y-0.5">
            <span className="text-base font-bold text-slate-900 block">{t.accessibility.highContrast}</span>
            <span className="text-xs font-semibold text-slate-600">Sharper borders and higher text contrast</span>
          </div>
          <button
            onClick={() => setHighContrast(!highContrast)}
            className={`w-14 h-8 rounded-full p-1 transition-colors min-h-[32px] ${
              highContrast ? 'bg-blue-700' : 'bg-slate-300'
            }`}
            aria-pressed={highContrast}
          >
            <div
              className={`w-6 h-6 rounded-full bg-white transition-transform shadow-md ${
                highContrast ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* 4. Reduced Motion Toggle */}
        <div className="flex items-center justify-between p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl">
          <div className="space-y-0.5">
            <span className="text-base font-bold text-slate-900 block">{t.accessibility.reducedMotion}</span>
            <span className="text-xs font-semibold text-slate-600">Minimize animations and smooth movement</span>
          </div>
          <button
            onClick={() => setReducedMotion(!reducedMotion)}
            className={`w-14 h-8 rounded-full p-1 transition-colors min-h-[32px] ${
              reducedMotion ? 'bg-blue-700' : 'bg-slate-300'
            }`}
            aria-pressed={reducedMotion}
          >
            <div
              className={`w-6 h-6 rounded-full bg-white transition-transform shadow-md ${
                reducedMotion ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* 5. Voice Assistant Toggle */}
        <div className="flex items-center justify-between p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl">
          <div className="space-y-0.5">
            <span className="text-base font-bold text-slate-900 block">{t.accessibility.voiceAssistant}</span>
            <span className="text-xs font-semibold text-slate-600">Voice-assisted search & query guidance</span>
          </div>
          <button
            onClick={() => setVoiceAssistance(!voiceAssistance)}
            className={`w-14 h-8 rounded-full p-1 transition-colors min-h-[32px] ${
              voiceAssistance ? 'bg-blue-700' : 'bg-slate-300'
            }`}
            aria-pressed={voiceAssistance}
          >
            <div
              className={`w-6 h-6 rounded-full bg-white transition-transform shadow-md ${
                voiceAssistance ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Footer Actions */}
        <div className="pt-2">
          <button
            onClick={closeSettings}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-blue-600 text-white font-extrabold text-base shadow-lg hover:opacity-95 transition-all min-h-[52px]"
          >
            {t.accessibility.save}
          </button>
        </div>
      </div>
    </div>
  );
}
