// The small "New" pill on an achievement earned since the user last opened the Progress page.
// Shared by the track rows, their levels, and the badge shelf.

import { memo } from 'react';

const NewMark = memo(function NewMark() {
  return (
    <span className="shrink-0 rounded-full bg-(--color-brand-primary) px-1.5 py-px text-[10px] leading-4 font-bold tracking-wide text-(--color-primary-foreground) uppercase">
      New
    </span>
  );
});

export default NewMark;
