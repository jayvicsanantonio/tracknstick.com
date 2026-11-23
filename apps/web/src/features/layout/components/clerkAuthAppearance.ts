// The Clerk sign-in and sign-up forms styled as the app's own: brand buttons, rounded fields, theme colours.
// Shared by the welcome page's inline form on tablet and desktop and its sheet on phones.

import type { ComponentProps } from 'react';
import type { SignIn } from '@clerk/clerk-react';

type Appearance = NonNullable<ComponentProps<typeof SignIn>['appearance']>;

export const clerkAuthAppearance = {
  layout: {
    socialButtonsPlacement: 'top',
    socialButtonsVariant: 'blockButton',
  },
  variables: {
    borderRadius: '0.875rem',
    spacingUnit: '0.75rem',
  },
  elements: {
    card: 'bg-transparent sm:!bg-transparent sm:!pt-0 border-0 !shadow-none p-0 w-full max-w-none !border-0 !outline-0',
    cardBox:
      'bg-transparent border-0 !shadow-none p-0 w-full max-w-none !rounded-none !border-0 !outline-0',
    headerTitle: 'hidden',
    headerSubtitle: 'hidden',
    form: 'space-y-3 w-full',
    formContainer: 'space-y-3 w-full',
    formButtonPrimary:
      'bg-(--color-brand-primary) hover:bg-(--color-brand-secondary) dark:bg-(--color-brand-secondary) dark:hover:bg-(--color-brand-primary) text-(--color-text-inverse) sm:!text-(--color-text-inverse) rounded-2xl font-semibold shadow-none transition-all duration-150 w-full min-h-[50px] py-3 px-4 text-base touch-manipulation active:scale-[0.98]',
    formButtonSecondary:
      'text-(--color-brand-primary) hover:text-(--color-brand-secondary) font-medium w-full min-h-[48px] py-3 px-4 text-base touch-manipulation',
    socialButtonsBlockButton:
      'bg-(--color-card) border border-(--color-border-primary) dark:border-white/20 sm:dark:!border-white/20 hover:bg-(--color-hover-surface) rounded-2xl transition-all duration-150 text-(--color-foreground) dark:text-white !text-(--color-foreground) dark:!text-white !border-1 !border-solid min-h-[50px] py-3 px-4 shadow-none active:scale-[0.98] touch-manipulation flex items-center justify-center gap-2.5',
    socialButtonsBlockButtonText:
      'text-(--color-foreground) dark:text-white font-medium text-base',
    socialButtonsIconButton:
      'text-(--color-foreground) dark:text-white w-5 h-5 flex-shrink-0',
    formFieldInput:
      'bg-(--color-card) sm:!bg-(--color-card) border border-(--color-border-primary) rounded-2xl focus:border-(--color-brand-primary) focus:ring-2 focus:ring-(--color-brand-primary)/20 text-(--color-foreground) dark:text-white placeholder:text-(--color-text-secondary) dark:placeholder:!text-gray-300 w-full min-h-[48px] py-3 px-4 text-base transition-all duration-150 touch-manipulation shadow-none',
    formFieldLabel:
      'text-(--color-foreground) dark:text-white font-medium text-sm mb-1.5 block',
    formField: 'w-full space-y-1',
    formFieldRow: 'w-full',
    formFieldInputShowPasswordButton:
      'text-(--color-text-secondary) dark:text-gray-400 hover:text-(--color-foreground) dark:hover:text-white p-3 min-h-[48px] min-w-[48px] flex items-center justify-center touch-manipulation',
    formFieldErrorText:
      'text-red-500 dark:text-red-400 text-xs sm:text-sm mt-1',
    formFieldSuccessText:
      'text-green-500 dark:text-green-400 text-xs sm:text-sm mt-1',
    formFieldWarningText:
      'text-orange-500 dark:text-orange-400 text-xs sm:text-sm mt-1',
    formFieldAction:
      'text-xs sm:text-sm text-(--color-brand-primary) hover:text-(--color-brand-secondary)',
    formResendCodeLink:
      'text-xs sm:text-sm text-(--color-brand-primary) hover:text-(--color-brand-secondary) underline',
    dividerLine:
      'bg-(--color-border-primary) sm:!bg-(--color-border-primary) my-3 sm:my-4',
    dividerText: 'text-(--color-text-secondary) text-sm px-4',
    otpCodeFieldInput:
      'w-12 h-12 sm:w-14 sm:h-14 text-center text-base sm:text-lg font-semibold border border-(--color-border-primary) rounded-xl focus:border-(--color-brand-primary) focus:ring-2 focus:ring-(--color-brand-primary)/20 bg-(--color-card) touch-manipulation',
    otpCodeFieldInputs: 'flex gap-2 sm:gap-3 justify-center',
    alertText:
      'text-sm p-3 sm:p-4 rounded-xl bg-(--color-surface) border border-(--color-border-primary)',
    identityPreviewText:
      'text-(--color-foreground) dark:text-white text-sm sm:text-base',
    identityPreviewEditButton:
      'text-(--color-brand-primary) hover:text-(--color-brand-secondary) text-sm min-h-[44px] flex items-center justify-center touch-manipulation',
    footer:
      'text-center mt-4 text-sm text-(--color-text-secondary) sm:![background:transparent]',
    footerAction:
      'text-sm text-(--color-text-secondary) sm:flex sm:items-center sm:justify-center sm:gap-1',
    footerActionText: 'text-sm text-(--color-text-secondary)',
    footerActionLink:
      'text-sm text-(--color-brand-primary) hover:text-(--color-brand-secondary) min-h-[44px] inline-flex items-center justify-center touch-manipulation sm:min-h-0 sm:font-semibold',
    spinner: 'w-5 h-5 sm:w-6 sm:h-6',
    alternativeMethods: 'space-y-2 sm:space-y-3 mt-4',
    alternativeMethodsBlockButton:
      'w-full min-h-[48px] py-3 px-4 text-base rounded-2xl border border-(--color-border-primary) hover:bg-(--color-hover-surface) transition-all touch-manipulation active:scale-[0.98]',
  },
} satisfies Appearance;

const { elements } = clerkAuthAppearance;

/**
 * The same, for the phone's sheet. Clerk's own "Sign up" and "Sign in" links
 * would leave the page for Clerk's hosted pages, so the sheet hides them and
 * offers its own switch instead. On a phone Clerk's own card, field and
 * footer surfaces win over the shared classes, which force theirs only from
 * the sm breakpoint up, so the sheet forces them at every size.
 */
export const clerkAuthSheetAppearance = {
  ...clerkAuthAppearance,
  elements: {
    ...elements,
    card: `${elements.card} !bg-transparent`,
    cardBox: `${elements.cardBox} !bg-transparent`,
    formFieldInput: `${elements.formFieldInput} !bg-(--color-card)`,
    dividerLine: `${elements.dividerLine} !bg-(--color-border-primary)`,
    footer: `${elements.footer} ![background:transparent]`,
    footerAction: '!hidden',
  },
} satisfies Appearance;
