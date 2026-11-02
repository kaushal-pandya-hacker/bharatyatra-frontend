/**
 * BharatYatra Audio Notification System
 * Dual-layer playback (Preloaded HTML5 Audio + Web Audio API synthesizer fallback)
 * Handles modern browser autoplay restrictions with proactive user-gesture unlocking.
 */

let sharedAudioCtx: AudioContext | null = null;
let isAudioUnlocked = false;

// Preloaded HTML5 audio cache
const audioCache: Partial<Record<string, HTMLAudioElement>> = {};

const SOUND_PATHS = {
  notification: '/sounds/notification-chime.wav',
  message_sent: '/sounds/message-sent.wav',
  alert: '/sounds/alert.wav',
} as const;

export type SoundType = keyof typeof SOUND_PATHS;

/**
 * Initializes and unlocks the audio subsystem upon any user gesture on window.
 */
export function initAudioUnlocker(): void {
  if (typeof window === 'undefined' || isAudioUnlocked) return;

  const unlock = async () => {
    try {
      // 1. Unlock Web Audio API context
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

      if (AudioCtxClass && !sharedAudioCtx) {
        sharedAudioCtx = new AudioCtxClass();
      }

      if (sharedAudioCtx && sharedAudioCtx.state === 'suspended') {
        await sharedAudioCtx.resume();
      }

      // 2. Pre-warm HTML5 audio elements
      Object.entries(SOUND_PATHS).forEach(([key, src]) => {
        if (!audioCache[key]) {
          const audio = new Audio(src);
          audio.preload = 'auto';
          audioCache[key] = audio;
        }
      });

      isAudioUnlocked = true;
    } catch {
      // Keep trying on next gesture
    } finally {
      if (isAudioUnlocked) {
        window.removeEventListener('click', unlock);
        window.removeEventListener('keydown', unlock);
        window.removeEventListener('touchstart', unlock);
      }
    }
  };

  window.addEventListener('click', unlock, { once: false, passive: true });
  window.addEventListener('keydown', unlock, { once: false, passive: true });
  window.addEventListener('touchstart', unlock, { once: false, passive: true });
}

/**
 * Checks whether sound notifications are enabled in traveler/admin preferences.
 */
export function isSoundAlertsEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const val = localStorage.getItem('by_sound_alerts_enabled');
    return val !== 'false'; // Enabled by default
  } catch {
    return true;
  }
}

/**
 * Toggles or sets sound notifications preference.
 */
export function setSoundAlertsEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('by_sound_alerts_enabled', enabled ? 'true' : 'false');
  } catch {
    // Storage quota fallback
  }
}

/**
 * Pure Web Audio API synthesized fallback chime.
 * Used if static WAV fails or is blocked by network.
 */
function playSynthesizedChime(type: SoundType): void {
  try {
    const AudioCtxClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtxClass) return;

    if (!sharedAudioCtx) {
      sharedAudioCtx = new AudioCtxClass();
    }

    if (sharedAudioCtx.state === 'suspended') {
      sharedAudioCtx.resume().catch(() => {});
    }

    const ctx = sharedAudioCtx;
    const now = ctx.currentTime;

    if (type === 'message_sent') {
      // Crisp rising pop tone
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === 'alert') {
      // Multi-harmonic bell strike
      const fundamental = 830;
      [1, 1.5, 2].forEach((mult, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(fundamental * mult, now);
        const startGain = 0.4 / (idx + 1);
        gain.gain.setValueAtTime(startGain, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.6);
      });
    } else {
      // 3-Tone bright marimba chime (D5 -> F#5 -> A5)
      const notes = [
        { freq: 587.33, start: 0, dur: 0.35, gain: 0.45 },
        { freq: 739.99, start: 0.1, dur: 0.4, gain: 0.5 },
        { freq: 880.0, start: 0.2, dur: 0.55, gain: 0.65 },
      ];

      notes.forEach((note) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(note.freq, now + note.start);
        gain.gain.setValueAtTime(0.001, now + note.start);
        gain.gain.linearRampToValueAtTime(note.gain, now + note.start + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, now + note.start + note.dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + note.start);
        osc.stop(now + note.start + note.dur);
      });
    }
  } catch {
    // Web Audio blocked
  }
}

/**
 * Main function to trigger notification sounds.
 * Plays HTML5 audio if ready, falls back instantly to Web Audio synthesis.
 */
export async function playNotificationSound(type: SoundType = 'notification'): Promise<void> {
  if (typeof window === 'undefined') return;
  if (!isSoundAlertsEnabled()) return;

  const src = SOUND_PATHS[type];

  try {
    let audio = audioCache[type];
    if (!audio) {
      audio = new Audio(src);
      audio.preload = 'auto';
      audioCache[type] = audio;
    }

    audio.volume = 0.75;
    audio.currentTime = 0;
    const playPromise = audio.play();

    if (playPromise !== undefined) {
      playPromise.catch((_err) => {
        // Autoplay policy prevented HTML5 Audio or file pending; fallback to Web Audio
        playSynthesizedChime(type);
      });
    }
  } catch {
    playSynthesizedChime(type);
  }
}

/**
 * Force plays sound on direct user click (e.g. Test Sound button)
 * Guarantees browser audio context unlock.
 */
export async function testNotificationSound(type: SoundType = 'notification'): Promise<void> {
  if (typeof window === 'undefined') return;

  // Forcibly unlock AudioContext
  try {
    const AudioCtxClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtxClass && !sharedAudioCtx) {
      sharedAudioCtx = new AudioCtxClass();
    }
    if (sharedAudioCtx && sharedAudioCtx.state === 'suspended') {
      await sharedAudioCtx.resume();
    }
    isAudioUnlocked = true;
  } catch {
    // Ignore
  }

  // Play sound
  await playNotificationSound(type);
}

