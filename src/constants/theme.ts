export const colors = {
  light: {
    bg: '#faf9f7',
    surface: '#ffffff',
    surfaceSunken: '#f1f2ef',
    border: '#e6e5e0',
    text: '#1c1f1a',
    textSecondary: '#63695f',
    textTertiary: '#9a9f92',
    accent: '#2f6f4e',
    accentStrong: '#235a3e',
    accentSoft: '#e7f1ea',
    danger: '#b3493f',
  },
  dark: {
    bg: '#14160f',
    surface: '#1d201a',
    surfaceSunken: '#262922',
    border: '#33362c',
    text: '#edeee7',
    textSecondary: '#a6ab9d',
    textTertiary: '#767b6d',
    accent: '#6cc494',
    accentStrong: '#86d3a9',
    accentSoft: '#223327',
    danger: '#d97b70',
  },
  emotion: ['#c2564a', '#d99257', '#d3b355', '#8fb06a', '#3f8f63'] as const,
} as const;

export const spacing = { xs: 4, sm: 8, md: 12, base: 16, lg: 24, xl: 32, xxl: 48 } as const;

export const radius = { control: 12, card: 18, pill: 999 } as const;

export const typography = {
  display: { fontSize: 32, fontWeight: '700' as const },
  title: { fontSize: 20, fontWeight: '700' as const },
  subtitle: { fontSize: 16, fontWeight: '600' as const },
  body: { fontSize: 15, fontWeight: '400' as const },
  caption: { fontSize: 12.5, fontWeight: '400' as const },
  numeral: { fontSize: 34, fontWeight: '700' as const },
} as const;
