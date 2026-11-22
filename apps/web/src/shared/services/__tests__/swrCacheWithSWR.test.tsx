// Covers the saved cache as SWR reads it at launch: last time's data shows at once, not a loading state.
// SWR then asks the API again in the background, with the saved data on screen meanwhile.

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import useSWR, { SWRConfig, type Cache } from 'swr';
import { createPersistentCache } from '@shared/services/swrCache';
import { API_CACHE_OWNER_KEY } from '@shared/constants/apiCache';

const KEY = '/api/v1/habits?date=2026-11-21';

/** Shows a request's state as a screen would; its fetcher never answers. */
function Habits() {
  const { data, isLoading } = useSWR<string[]>(
    KEY,
    (): Promise<string[]> => new Promise(() => undefined),
  );
  return <p>{isLoading ? 'Loading…' : (data ?? []).join(', ')}</p>;
}

describe('the saved cache, read by SWR', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem(API_CACHE_OWNER_KEY, 'user_a');
  });

  it("shows last time's data at once, while the API is asked again", () => {
    const before = createPersistentCache();
    before.set(KEY, { data: ['Read', 'Walk'], isLoading: false });
    window.dispatchEvent(new Event('pagehide'));

    const cache = createPersistentCache();
    render(
      <SWRConfig value={{ provider: () => cache as Cache }}>
        <Habits />
      </SWRConfig>,
    );

    expect(screen.getByText('Read, Walk')).toBeInTheDocument();
    expect(screen.queryByText('Loading…')).not.toBeInTheDocument();
  });
});
