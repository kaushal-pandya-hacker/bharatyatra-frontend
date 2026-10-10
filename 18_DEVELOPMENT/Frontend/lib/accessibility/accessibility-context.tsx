'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, translations, Translations } from '@/lib/i18n/translations';

export type TextSize = 'standard' | 'large' | 'extra-large';

interface AccessibilityContextType {
  textSize: TextSize;
  setTextSize: (size: TextSize) => void;
  highContrast: boolean;
  setHighContrast: (enabled: boolean) => void;
  reducedMotion: boolean;
  setReducedMotion: (enabled: boolean) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  voiceAssistance: boolean;
  setVoiceAssistance: (enabled: boolean) => void;
  isSettingsOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;
  t: Translations;
}

const AccessibilityContext = createContext<AccessibilityContextType>({
  textSize: 'standard',
  setTextSize: () => {},
  highContrast: false,
  setHighContrast: () => {},
  reducedMotion: false,
  setReducedMotion: () => {},
  language: 'en',
  setLanguage: () => {},
  voiceAssistance: false,
  setVoiceAssistance: () => {},
  isSettingsOpen: false,
  openSettings: () => {},
  closeSettings: () => {},
  t: translations.en,
});

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [textSize, setTextSizeState] = useState<TextSize>('standard');
  const [highContrast, setHighContrastState] = useState<boolean>(false);
  const [reducedMotion, setReducedMotionState] = useState<boolean>(false);
  const [language, setLanguageState] = useState<Language>('en');
  const [voiceAssistance, setVoiceAssistanceState] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  useEffect(() => {
    // Restore saved preferences
    try {
      const savedTextSize = localStorage.getItem('by_text_size') as TextSize;
      if (savedTextSize && ['standard', 'large', 'extra-large'].includes(savedTextSize)) {
        setTextSizeState(savedTextSize);
      }

      const savedContrast = localStorage.getItem('by_high_contrast');
      if (savedContrast !== null) {
        setHighContrastState(savedContrast === 'true');
      }

      const savedMotion = localStorage.getItem('by_reduced_motion');
      if (savedMotion !== null) {
        setReducedMotionState(savedMotion === 'true');
      }

      const savedLang = localStorage.getItem('by_language') as Language;
      if (savedLang && ['en', 'gu', 'hi'].includes(savedLang)) {
        setLanguageState(savedLang);
      }

      const savedVoice = localStorage.getItem('by_voice');
      if (savedVoice !== null) {
        setVoiceAssistanceState(savedVoice === 'true');
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    // Apply text size scale and high contrast to document root
    const root = document.documentElement;

    let scale = '100%';
    if (textSize === 'large') scale = '115%';
    if (textSize === 'extra-large') scale = '130%';

    root.style.setProperty('--app-text-scale', scale);
    root.style.fontSize = scale === '100%' ? '' : scale;

    if (highContrast) {
      root.classList.add('high-contrast-mode');
    } else {
      root.classList.remove('high-contrast-mode');
    }

    if (reducedMotion) {
      root.classList.add('reduced-motion-mode');
    } else {
      root.classList.remove('reduced-motion-mode');
    }
  }, [textSize, highContrast, reducedMotion]);

  const setTextSize = (size: TextSize) => {
    setTextSizeState(size);
    try {
      localStorage.setItem('by_text_size', size);
    } catch (e) {}
  };

  const setHighContrast = (enabled: boolean) => {
    setHighContrastState(enabled);
    try {
      localStorage.setItem('by_high_contrast', String(enabled));
    } catch (e) {}
  };

  const setReducedMotion = (enabled: boolean) => {
    setReducedMotionState(enabled);
    try {
      localStorage.setItem('by_reduced_motion', String(enabled));
    } catch (e) {}
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('by_language', lang);
    } catch (e) {}
  };

  const setVoiceAssistance = (enabled: boolean) => {
    setVoiceAssistanceState(enabled);
    try {
      localStorage.setItem('by_voice', String(enabled));
    } catch (e) {}
  };

  const currentTranslations = translations[language] || translations.en;

  return (
    <AccessibilityContext.Provider
      value={{
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
        isSettingsOpen,
        openSettings: () => setIsSettingsOpen(true),
        closeSettings: () => setIsSettingsOpen(false),
        t: currentTranslations,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  return useContext(AccessibilityContext);
}
