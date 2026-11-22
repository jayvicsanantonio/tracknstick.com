// The habit form's icon choice: a searchable grid of icons, one radio each, named in plain words.
// Shows which icon is chosen, and scrolls it into view so an edited habit's icon is never hidden.

import {
  memo,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Search } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@shared/components/ui/radio-group';
import { Label } from '@shared/components/ui/label';
import HabitsIcons from '@/icons/habits';

type IconName = keyof typeof HabitsIcons;

interface IconPickerProps {
  selectedIcon: IconName | undefined;
  onIconChange: (icon: IconName) => void;
  label?: string;
}

/** An icon's key in plain words: "GlassWater" reads "Glass water". */
function iconLabel(name: string): string {
  const words = name.replace(/([a-z])([A-Z0-9])/g, '$1 $2').split(' ');
  return [words[0], ...words.slice(1).map((word) => word.toLowerCase())].join(
    ' ',
  );
}

const ICONS = (Object.keys(HabitsIcons) as IconName[]).map((name) => ({
  name,
  label: iconLabel(name),
  Icon: HabitsIcons[name],
}));

const IconPicker = memo(function IconPicker({
  selectedIcon,
  onIconChange,
  label = 'Icon',
}: IconPickerProps) {
  const searchId = useId();
  const [query, setQuery] = useState('');
  const selectedRef = useRef<HTMLLabelElement>(null);

  const handleValueChange = useCallback(
    (value: string) => {
      onIconChange(value as IconName);
    },
    [onIconChange],
  );

  const shown = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return needle
      ? ICONS.filter(({ label: iconName }) =>
          iconName.toLowerCase().includes(needle),
        )
      : ICONS;
  }, [query]);

  // An edited habit's icon can sit far down the grid; bring it into view
  // once, when the picker opens. jsdom has no scrollIntoView.
  useEffect(() => {
    selectedRef.current?.scrollIntoView?.({ block: 'nearest' });
    // Only on mount: scrolling on every pick would move the grid under the
    // pointer.
  }, []);

  const SelectedIcon = selectedIcon ? HabitsIcons[selectedIcon] : null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <Label className="text-sm font-semibold text-(--color-brand-text) dark:text-(--color-brand-text-light)">
          {label}
          <span className="text-(--color-error)">*</span>
        </Label>
        <span
          role="status"
          className="inline-flex min-w-0 items-center gap-1.5 rounded-full bg-(--color-brand-primary)/10 px-2.5 py-1 text-xs font-medium text-(--color-brand-text) dark:text-(--color-brand-text-light)"
        >
          {SelectedIcon && selectedIcon ? (
            <>
              <SelectedIcon aria-hidden="true" className="size-3.5 shrink-0" />
              <span className="truncate">{iconLabel(selectedIcon)}</span>
            </>
          ) : (
            'None chosen'
          )}
        </span>
      </div>

      <div className="relative">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-(--color-text-secondary)"
        />
        <label htmlFor={searchId} className="sr-only">
          Search icons
        </label>
        <input
          id={searchId}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          // Enter would submit the habit form this field sits in.
          onKeyDown={(event) => {
            if (event.key === 'Enter') event.preventDefault();
          }}
          placeholder={`Search ${ICONS.length} icons`}
          className="h-11 w-full rounded-xl border-2 border-(--color-border-primary) bg-(--color-surface) pr-3 pl-9 text-base text-(--color-foreground) outline-none placeholder:text-(--color-text-secondary) focus-visible:border-(--color-ring) focus-visible:ring-2 focus-visible:ring-(--color-ring)/40 sm:h-10 sm:text-sm dark:bg-(--color-surface-secondary)"
        />
      </div>

      {/* A fixed-height scroll area of whole rows; the fade at its foot
          shows there are more icons below. Once it reaches either end, a
          scroll carries on to the form around it. */}
      <div className="max-h-[13.5rem] overflow-y-auto rounded-xl [mask-image:linear-gradient(to_bottom,black_calc(100%-1.5rem),transparent)] p-0.5 pb-4 sm:max-h-[10.5rem]">
        {shown.length === 0 ? (
          <p className="py-6 text-center text-sm text-(--color-text-secondary)">
            No icons match “{query.trim()}”
          </p>
        ) : (
          <RadioGroup
            // Six columns below sm keep each tile at 44px or more on a
            // 360px phone; seven made them about 38px.
            className="grid grid-cols-6 gap-2 sm:grid-cols-10 md:grid-cols-12"
            value={selectedIcon}
            onValueChange={handleValueChange}
            aria-label={label}
          >
            {shown.map(({ name, label: iconName, Icon }) => (
              <Label
                key={name}
                ref={name === selectedIcon ? selectedRef : undefined}
                title={iconName}
                // relative: the visually hidden radio stays inside its tile,
                // so focusing it scrolls only the grid, never the dialog.
                className="relative flex aspect-square cursor-pointer items-center justify-center rounded-xl bg-(--color-surface) text-(--color-brand-primary) ring-1 ring-(--color-border-primary) transition-[background-color,color,box-shadow,transform] ring-inset hover:bg-(--color-brand-primary)/10 active:scale-95 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-(--color-ring) has-[[data-state=checked]]:bg-(--color-brand-primary) has-[[data-state=checked]]:text-(--color-primary-foreground) has-[[data-state=checked]]:shadow-md has-[[data-state=checked]]:ring-(--color-brand-primary) motion-reduce:transition-none sm:aspect-auto sm:h-11 dark:bg-(--color-surface-secondary) dark:has-[[data-state=checked]]:bg-(--color-brand-primary)"
              >
                {/* The icon is only a picture, so the radio carries the name */}
                <RadioGroupItem
                  value={name}
                  id={`icon-${name}`}
                  aria-label={iconName}
                  className="sr-only"
                />
                <Icon aria-hidden="true" className="size-5" />
              </Label>
            ))}
          </RadioGroup>
        )}
      </div>
    </div>
  );
});

export default IconPicker;
