// Zero-latency habit sound player.
// Triggers playback synchronously inside the tap gesture so iOS Safari never blocks
// audio across async network boundaries, and respects the user's Sound preference.

import toggleOnSound from '@/assets/audio/habit-toggled-on.mp3';
import toggleOffSound from '@/assets/audio/habit-toggled-off.mp3';
import completedAllHabits from '@/assets/audio/completed-all-habits.mp3';
import { getPreferences } from '@shared/hooks/usePreferences';

export type HabitSoundKind = 'on' | 'off' | 'allDone';

const SOUND_URLS: Record<HabitSoundKind, string> = {
  on: toggleOnSound,
  off: toggleOffSound,
  allDone: completedAllHabits,
};

let audioContext: AudioContext | null = null;
const decodedBuffers = new Map<HabitSoundKind, AudioBuffer>();
let preloadStarted = false;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctor =
    window.AudioContext ??
    (window as Window & { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctor) return null;
  if (!audioContext) {
    try {
      audioContext = new Ctor();
    } catch {
      return null;
    }
  }
  return audioContext;
}

/** Pre-decodes the three habit audio assets into memory for instant playback. */
function preloadHabitSounds(): void {
  if (preloadStarted || typeof fetch !== 'function') return;
  const ctx = getAudioContext();
  if (!ctx) return;
  preloadStarted = true;

  (Object.keys(SOUND_URLS) as HabitSoundKind[]).forEach((kind) => {
    void fetch(SOUND_URLS[kind])
      .then((res) => (res.ok ? res.arrayBuffer() : null))
      .then((buf) => (buf ? ctx.decodeAudioData(buf) : null))
      .then((decoded) => {
        if (decoded) decodedBuffers.set(kind, decoded);
      })
      .catch(() => {
        // Fallback to HTMLAudioElement on playback
      });
  });
}

/**
 * Plays a habit interaction sound synchronously within the user's tap gesture.
 */
export function playHabitSound(kind: HabitSoundKind): void {
  if (typeof window === 'undefined') return;
  if (!getPreferences().soundEnabled) return;

  const ctx = getAudioContext();
  const buffer = decodedBuffers.get(kind);
  if (ctx && buffer) {
    try {
      if (ctx.state === 'suspended') {
        void ctx.resume();
      }
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(0);
      return;
    } catch {
      // Fall through to HTMLAudioElement
    }
  }

  // Trigger preload for subsequent taps and play immediately via HTMLAudioElement.
  preloadHabitSounds();
  if (typeof Audio === 'undefined') return;
  try {
    const audio = new Audio(SOUND_URLS[kind]);
    void Promise.resolve(audio.play()).catch(() => {
      // Silently ignore autoplay restrictions
    });
  } catch {
    // Ignore in environments without media playback
  }
}
