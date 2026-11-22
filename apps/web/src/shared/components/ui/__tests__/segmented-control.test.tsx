// Covers the segmented control: a row of tabs drawn as iOS draws one, with a thumb that slides to the choice.
// It is a Radix tab list, so its tabs keep their roles, names and keyboard behaviour.

import { describe, it, expect } from 'vitest';
import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tabs } from '@shared/components/ui/tabs';
import { SegmentedTabsList } from '@shared/components/ui/segmented-control';

const OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'archived', label: 'Archived' },
];

function Control() {
  const [value, setValue] = useState('all');
  return (
    <Tabs value={value} onValueChange={setValue}>
      <SegmentedTabsList value={value} options={OPTIONS} aria-label="Show" />
    </Tabs>
  );
}

/** The thumb's position, as the share of the track it has moved along. */
function thumbOffset() {
  const thumb = document.querySelector<HTMLElement>('[data-segment-thumb]');
  return thumb?.style.transform;
}

describe('SegmentedTabsList', () => {
  it('offers each choice as a tab, the current one selected', () => {
    render(<Control />);

    expect(screen.getByRole('tablist', { name: 'Show' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'All' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByRole('tab', { name: 'Archived' })).toHaveAttribute(
      'aria-selected',
      'false',
    );
  });

  it('slides the thumb under the choice made', async () => {
    render(<Control />);
    expect(thumbOffset()).toBe('translateX(0%)');

    await userEvent.click(screen.getByRole('tab', { name: 'Archived' }));

    expect(screen.getByRole('tab', { name: 'Archived' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(thumbOffset()).toBe('translateX(200%)');
  });

  it('sizes the thumb to one choice', () => {
    render(<Control />);

    const thumb = document.querySelector<HTMLElement>('[data-segment-thumb]');
    // One column of the track, inside its 2px padding on each side, in the
    // form the browser writes the value back in.
    const oneColumn = document.createElement('span').style;
    oneColumn.width = `calc((100% - 4px) / ${OPTIONS.length})`;
    expect(thumb?.style.width).toBe(oneColumn.width);
  });
});
