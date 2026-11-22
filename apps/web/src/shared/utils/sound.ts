// The app's feedback sounds, played through Web Audio at once when asked for.
// On iOS they mix with the user's own music and follow the silent switch, as a native app's sounds do.

import habitOnUrl from '@/assets/audio/habit-toggled-on.mp3';
import habitOffUrl from '@/assets/audio/habit-toggled-off.mp3';
import allDoneUrl from '@/assets/audio/completed-all-habits.mp3';

const SOUND_URLS = {
  'habit-on': habitOnUrl,
  'habit-off': habitOffUrl,
  'all-done': allDoneUrl,
} as const;

export type SoundName = keyof typeof SOUND_URLS;

/** Safari's Audio Session API, which lib.dom does not describe yet. */
type NavigatorWithAudioSession = Navigator & {
  audioSession?: { type: string };
};

let context: AudioContext | null = null;
const buffers = new Map<SoundName, Promise<AudioBuffer | null>>();

/**
 * The one audio context, made on first use; null where Web Audio is missing.
 *
 * Before it is made, the page's audio session becomes "ambient": iOS then
 * plays these sounds over the user's music or podcast instead of pausing it,
 * and keeps quiet when the phone is set to silent. An <audio> element would
 * take over the phone's audio and stop whatever was playing.
 */
function audioContext(): AudioContext | null {
  if (context) return context;
  if (typeof AudioContext === 'undefined') return null;
  const { audioSession } = navigator as NavigatorWithAudioSession;
  if (audioSession) audioSession.type = 'ambient';
  context = new AudioContext();
  return context;
}

/** The sound's decoded audio, fetched and decoded once. */
function buffer(audio: AudioContext, name: SoundName) {
  let decoded = buffers.get(name);
  if (!decoded) {
    decoded = fetch(SOUND_URLS[name])
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status} for ${SOUND_URLS[name]}`);
        }
        return response.arrayBuffer();
      })
      .then((bytes) => audio.decodeAudioData(bytes))
      .catch((error: unknown) => {
        console.error(`Could not load the ${name} sound:`, error);
        return null;
      });
    buffers.set(name, decoded);
  }
  return decoded;
}

/** Fetches and decodes every sound, so the first one plays without a wait. */
export function preloadSounds(): void {
  const audio = audioContext();
  if (!audio) return;
  for (const name of Object.keys(SOUND_URLS) as SoundName[]) {
    void buffer(audio, name);
  }
}

/**
 * Plays the sound now. Call it from the tap itself: iOS lets audio start only
 * within a user's gesture, so the context is woken before anything awaits.
 */
export function playSound(name: SoundName): void {
  const audio = audioContext();
  if (!audio) return;
  if (audio.state === 'suspended') void audio.resume();
  void buffer(audio, name).then((decoded) => {
    if (!decoded) return;
    const source = audio.createBufferSource();
    source.buffer = decoded;
    source.connect(audio.destination);
    source.start();
  });
}
