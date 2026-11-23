// The welcome page's headline and subtitle, which change with the theme.
// Shared by its phone layout and its tablet and desktop layout.

export function welcomeCopy(isDark: boolean): {
  title: string;
  subtitle: string;
} {
  return isDark
    ? {
        title: 'Defy Gravity',
        subtitle:
          'Build habits that stick. Calm, focused, and quietly powerful.',
      }
    : {
        title: 'Sparkle Up',
        subtitle:
          'Build habits that shine. Simple, friendly, and delightfully light.',
      };
}
