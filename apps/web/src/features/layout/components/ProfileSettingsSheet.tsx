// Native iOS Profile & Settings bottom sheet for mobile.
// Houses Clerk account actions, Appearance (System / Light / Dark), Haptics & Sound toggles,
// and app info — replacing the website header controls and mobile copyright footer.

import { memo } from 'react';
import { useClerk, useUser } from '@clerk/clerk-react';
import {
  ChevronRight,
  LogOut,
  Smartphone,
  UserCog,
  Volume2,
} from 'lucide-react';
import { DialogDescription, DialogTitle } from '@shared/components/ui/dialog';
import IosSheet from '@shared/components/ui/ios-sheet';
import IosSegmentedControl from '@shared/components/ui/ios-segmented-control';
import IosSwitch from '@shared/components/ui/ios-switch';
import { IosHapticTarget } from '@shared/components/ui/ios-haptic-target';
import { useTheme } from '@shared/hooks/useTheme';
import {
  usePreferences,
  type HapticStrength,
} from '@shared/hooks/usePreferences';
import { isIosDevice, triggerHaptic } from '@shared/utils/haptics';
import type { ThemePreference } from '@shared/types/theme';

interface ProfileSettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const APPEARANCE_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

const HAPTIC_STRENGTH_OPTIONS: { value: HapticStrength; label: string }[] = [
  { value: 'subtle', label: 'Subtle' },
  { value: 'prominent', label: 'Prominent' },
];

const ProfileSettingsSheet = memo(function ProfileSettingsSheet({
  open,
  onOpenChange,
}: ProfileSettingsSheetProps) {
  const { preference, setMode } = useTheme();
  const {
    hapticsEnabled,
    hapticStrength,
    soundEnabled,
    setHapticsEnabled,
    setHapticStrength,
    setSoundEnabled,
  } = usePreferences();
  const { user } = useUser();
  const clerk = useClerk();
  const year = new Date().getFullYear();

  const fullName =
    user?.fullName ??
    user?.firstName ??
    user?.primaryEmailAddress?.emailAddress ??
    'Account';
  const email = user?.primaryEmailAddress?.emailAddress;
  const imageUrl = user?.imageUrl;

  const handleManageAccount = () => {
    triggerHaptic('light');
    onOpenChange(false);
    clerk?.openUserProfile?.();
  };

  const handleSignOut = () => {
    triggerHaptic('warning');
    onOpenChange(false);
    void clerk?.signOut?.({ redirectUrl: '/' });
  };

  const header = (
    <div className="flex items-center justify-between border-b border-(--color-border-primary)/50 px-4 pb-3">
      <span className="w-14" aria-hidden="true" />
      <DialogTitle className="text-[17px] font-semibold tracking-tight text-(--color-foreground)">
        Settings
      </DialogTitle>
      <button
        type="button"
        onClick={() => onOpenChange(false)}
        className="flex min-h-9 w-14 items-center justify-end text-[17px] font-semibold text-(--color-brand-primary) active:opacity-60"
      >
        Done
      </button>
    </div>
  );

  return (
    <IosSheet open={open} onOpenChange={onOpenChange} header={header}>
      <DialogDescription className="sr-only">
        Manage your account, appearance, haptic feedback, and sound settings.
      </DialogDescription>

      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain px-4 pt-5 pb-[max(env(safe-area-inset-bottom),1.5rem)]">
        {/* Account section */}
        <section aria-label="Account" className="space-y-2">
          <div className="ios-grouped-card overflow-hidden rounded-2xl">
            <div className="flex items-center gap-3.5 px-4 py-3.5">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt=""
                  className="size-12 shrink-0 rounded-full object-cover ring-1 ring-(--color-border-primary)/60"
                />
              ) : (
                <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-(--color-brand-primary)/15 text-lg font-bold text-(--color-brand-primary)">
                  {fullName.slice(0, 1).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-[17px] font-semibold text-(--color-foreground)">
                  {fullName}
                </p>
                {email && email !== fullName ? (
                  <p className="truncate text-[13px] text-(--color-text-secondary)">
                    {email}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="ml-4 h-[0.5px] bg-(--color-border-primary)/60" />

            <IosHapticTarget className="block w-full">
              <button
                type="button"
                onClick={handleManageAccount}
                className="flex min-h-12 w-full items-center gap-3 px-4 py-2.5 text-left transition-colors active:bg-(--color-active-surface)/50"
              >
                <span className="flex size-7 items-center justify-center rounded-lg bg-(--color-brand-primary)/15 text-(--color-brand-primary)">
                  <UserCog aria-hidden="true" className="size-4" />
                </span>
                <span className="flex-1 text-[16px] text-(--color-foreground)">
                  Manage Account
                </span>
                <ChevronRight
                  aria-hidden="true"
                  className="size-4 text-(--color-text-secondary)/70"
                />
              </button>
            </IosHapticTarget>
          </div>
        </section>

        {/* Appearance section */}
        <section aria-label="Appearance" className="space-y-2">
          <h3 className="px-3 text-[12px] font-semibold tracking-wider text-(--color-text-secondary) uppercase">
            Appearance
          </h3>
          <div className="ios-grouped-card rounded-2xl p-3">
            <IosSegmentedControl
              options={APPEARANCE_OPTIONS}
              value={preference}
              onChange={setMode}
              layoutId="settings-appearance-segment"
              ariaLabel="Appearance theme"
            />
          </div>
        </section>

        {/* Feedback section */}
        <section aria-label="Feedback" className="space-y-2">
          <h3 className="px-3 text-[12px] font-semibold tracking-wider text-(--color-text-secondary) uppercase">
            Feedback
          </h3>
          <div className="ios-grouped-card overflow-hidden rounded-2xl">
            <div className="flex min-h-12 items-center gap-3 px-4 py-2.5">
              <span className="flex size-7 items-center justify-center rounded-lg bg-(--color-brand-primary)/15 text-(--color-brand-primary)">
                <Smartphone aria-hidden="true" className="size-4" />
              </span>
              <label
                htmlFor="pref-haptics"
                className="flex-1 text-[16px] text-(--color-foreground)"
              >
                Haptic Feedback
              </label>
              <IosSwitch
                id="pref-haptics"
                checked={hapticsEnabled}
                onCheckedChange={setHapticsEnabled}
                ariaLabel="Haptic Feedback"
                hapticStyle="success"
                nativeSwitchBehavior="onEnableOnly"
              />
            </div>

            {/* iOS Safari's native switch exposes only a single fixed light Taptic pulse,
                so Haptic Strength is shown only on platforms with variable vibration control. */}
            {hapticsEnabled && !isIosDevice() ? (
              <>
                <div className="ml-14 h-[0.5px] bg-(--color-border-primary)/60" />
                <div className="space-y-2 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[14px] font-medium text-(--color-foreground)">
                      Haptic Strength
                    </span>
                    <span className="text-[12px] text-(--color-text-secondary)">
                      Tap to preview
                    </span>
                  </div>
                  <IosSegmentedControl
                    options={HAPTIC_STRENGTH_OPTIONS}
                    value={hapticStrength}
                    onChange={setHapticStrength}
                    layoutId="settings-haptic-strength-segment"
                    ariaLabel="Haptic strength"
                    hapticStyle="heavy"
                  />
                </div>
              </>
            ) : null}

            <div className="ml-14 h-[0.5px] bg-(--color-border-primary)/60" />

            <div className="flex min-h-12 items-center gap-3 px-4 py-2.5">
              <span className="flex size-7 items-center justify-center rounded-lg bg-(--color-brand-primary)/15 text-(--color-brand-primary)">
                <Volume2 aria-hidden="true" className="size-4" />
              </span>
              <label
                htmlFor="pref-sounds"
                className="flex-1 text-[16px] text-(--color-foreground)"
              >
                Sound Effects
              </label>
              <IosSwitch
                id="pref-sounds"
                checked={soundEnabled}
                onCheckedChange={setSoundEnabled}
                ariaLabel="Sound Effects"
              />
            </div>
          </div>
        </section>

        {/* Sign Out */}
        <section aria-label="Session">
          <div className="ios-grouped-card overflow-hidden rounded-2xl">
            <IosHapticTarget className="block w-full">
              <button
                type="button"
                onClick={handleSignOut}
                className="flex min-h-12 w-full items-center justify-center gap-2 px-4 py-2.5 text-[16px] font-semibold text-(--color-destructive) transition-colors active:bg-(--color-destructive)/10"
              >
                <LogOut aria-hidden="true" className="size-4" />
                Sign Out
              </button>
            </IosHapticTarget>
          </div>
        </section>

        {/* App info footer (relocated from the web footer on mobile) */}
        <p className="pt-1 text-center text-[12px] text-(--color-text-secondary)/80">
          Track N&apos; Stick · © {year}
        </p>
      </div>
    </IosSheet>
  );
});

export default ProfileSettingsSheet;
