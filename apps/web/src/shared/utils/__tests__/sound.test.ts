// Covers the app's feedback sounds: played through Web Audio the moment they are asked for.
// On iOS they mix with the user's own music, as a native app's sounds do, instead of stopping it.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

interface FakeSource {
  buffer: unknown;
  connect: ReturnType<typeof vi.fn>;
  start: ReturnType<typeof vi.fn>;
}

let contexts: FakeAudioContext[] = [];
let sessionTypeAtCreation: string | undefined;

class FakeAudioContext {
  state: AudioContextState = 'suspended';
  destination = { name: 'speakers' };
  sources: FakeSource[] = [];
  resume = vi.fn(() => {
    this.state = 'running';
    return Promise.resolve();
  });
  decodeAudioData = vi.fn((bytes: string) =>
    Promise.resolve({ decodedFrom: bytes }),
  );
  createBufferSource = vi.fn(() => {
    const source: FakeSource = {
      buffer: null,
      connect: vi.fn(),
      start: vi.fn(),
    };
    this.sources.push(source);
    return source;
  });

  constructor() {
    sessionTypeAtCreation = (
      navigator as Navigator & { audioSession?: { type: string } }
    ).audioSession?.type;
    contexts.push(this);
  }
}

/** A fresh copy of the module, so each test starts with no sounds loaded. */
async function loadSounds() {
  vi.resetModules();
  return import('@shared/utils/sound');
}

describe('sounds', () => {
  beforeEach(() => {
    contexts = [];
    sessionTypeAtCreation = undefined;
    vi.stubGlobal('AudioContext', FakeAudioContext);
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string) =>
        Promise.resolve({
          ok: true,
          arrayBuffer: () => Promise.resolve(`bytes of ${url}`),
        }),
      ),
    );
    Object.defineProperty(navigator, 'audioSession', {
      configurable: true,
      value: { type: 'auto' },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    Reflect.deleteProperty(navigator, 'audioSession');
  });

  it("asks iOS to mix them with the user's music before any sound is made", async () => {
    const { playSound } = await loadSounds();

    playSound('habit-on');

    expect(sessionTypeAtCreation).toBe('ambient');
  });

  it('plays a sound through Web Audio', async () => {
    const { playSound } = await loadSounds();

    playSound('habit-on');

    const [context] = contexts;
    await vi.waitFor(() => expect(context.sources).toHaveLength(1));
    const [source] = context.sources;
    // The fake decoder answers with the bytes it was given, which name the file.
    const { decodedFrom } = source.buffer as { decodedFrom: string };
    expect(decodedFrom).toMatch(/^bytes of .*habit-toggled-on/);
    expect(source.connect).toHaveBeenCalledWith(context.destination);
    expect(source.start).toHaveBeenCalled();
  });

  it('wakes the audio within the tap that plays it, as iOS requires', async () => {
    const { playSound } = await loadSounds();

    playSound('habit-off');

    // Synchronously, while the tap still counts as the user's gesture.
    expect(contexts[0].resume).toHaveBeenCalled();
  });

  it('decodes each sound once, ahead of its first use, when preloaded', async () => {
    const { preloadSounds, playSound } = await loadSounds();

    preloadSounds();
    const [context] = contexts;
    await vi.waitFor(() =>
      expect(context.decodeAudioData).toHaveBeenCalledTimes(3),
    );
    playSound('all-done');
    playSound('all-done');

    await vi.waitFor(() => expect(context.sources).toHaveLength(2));
    expect(context.decodeAudioData).toHaveBeenCalledTimes(3);
    expect(contexts).toHaveLength(1);
  });

  it('stays silent, without failing, where Web Audio is missing', async () => {
    vi.stubGlobal('AudioContext', undefined);
    const { playSound, preloadSounds } = await loadSounds();

    expect(() => {
      preloadSounds();
      playSound('habit-on');
    }).not.toThrow();
  });

  it('reports a sound that cannot be loaded, and still plays the others', async () => {
    const error = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string) =>
        url.includes('habit-toggled-off')
          ? Promise.resolve({ ok: false, status: 404 })
          : Promise.resolve({
              ok: true,
              arrayBuffer: () => Promise.resolve(`bytes of ${url}`),
            }),
      ),
    );
    const { playSound } = await loadSounds();

    playSound('habit-off');
    playSound('habit-on');

    const [context] = contexts;
    await vi.waitFor(() => expect(context.sources).toHaveLength(1));
    await vi.waitFor(() =>
      expect(error).toHaveBeenCalledWith(
        'Could not load the habit-off sound:',
        expect.any(Error),
      ),
    );
    error.mockRestore();
  });
});
