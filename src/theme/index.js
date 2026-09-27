// Warm-charcoal theme: soft graphite cards on a near-black canvas, one warm
// gold accent, pastel status tints, and glowing gradient "feature" cards.
// All type is Inter — large, tight, and sentence-case.

export const colors = {
  // Surfaces — near-black canvas with lifted graphite cards
  bg: '#131313',
  surface: '#212121',
  surfaceRaised: '#2B2B2B',
  glass: 'rgba(255,255,255,0.08)',
  overlay: 'rgba(10,9,8,0.72)',

  // Borders — barely there; cards read by luminance, not outlines
  border: 'rgba(255,255,255,0.06)',
  hairline: 'rgba(255,255,255,0.12)',
  borderStrong: 'rgba(255,255,255,0.26)',

  // Text
  text: '#F7F5F2',
  textSoft: '#D6D3CE',
  textMuted: '#9C9892',
  textFaint: '#67645F',

  // Light pill — the "4 Risks →" style button: near-white fill, dark text
  pill: '#F7F5F2',
  pillText: '#151515',

  // Accent — warm gold, used for highlights, progress and "normal" states
  accent: '#EAC98C',
  accentText: '#1B160E',
  accentDim: 'rgba(234,201,140,0.14)',
  accentBorder: 'rgba(234,201,140,0.42)',
  // Two-stop gold used for the active tab and other "lit" controls; the same
  // light the hero card's halo is painted with.
  accentGradient: ['#F6DDAA', '#E3AE5E'],

  // Semantic pastels
  positive: '#A9DDA2',
  positiveDim: 'rgba(169,221,162,0.14)',
  negative: '#F1A5A0',
  negativeDim: 'rgba(241,165,160,0.14)',
};

export const radius = {
  xs: 12,
  sm: 16,
  md: 22,
  lg: 28,
  xl: 34,
  pill: 999,
};

export const space = { 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 10: 40, 14: 56 };
export const GUTTER = 16;
export const SECTION_GAP = 24;
// Gap between stacked cards — tight, so a list of cards reads as one group.
export const CARD_GAP = 8;

export const shadows = {
  floating: { shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 24, shadowOffset: { width: 0, height: 8 }, elevation: 12 },
  modal: { shadowColor: '#000', shadowOpacity: 0.55, shadowRadius: 32, shadowOffset: { width: 0, height: -4 }, elevation: 16 },
};

export const type = {
  // The giant "41" number
  hero: { fontFamily: 'Inter_700Bold', fontSize: 64, lineHeight: 72, letterSpacing: -3 },
  display: { fontFamily: 'Inter_600SemiBold', fontSize: 40, lineHeight: 46, letterSpacing: -1.6 },
  title: { fontFamily: 'Inter_500Medium', fontSize: 26, lineHeight: 30, letterSpacing: -0.9 },
  heading: { fontFamily: 'Inter_500Medium', fontSize: 18, lineHeight: 23, letterSpacing: -0.4 },
  // Card metric values ("4487.0 µL")
  value: { fontFamily: 'Inter_400Regular', fontSize: 26, lineHeight: 32, letterSpacing: -0.9, fontVariant: ['tabular-nums'] },
  body: { fontFamily: 'Inter_400Regular', fontSize: 15, lineHeight: 21, letterSpacing: -0.2 },
  label: { fontFamily: 'Inter_500Medium', fontSize: 14, lineHeight: 18, letterSpacing: -0.2 },
  // Small muted descriptor ("Recommendations", "Neutrophils")
  overline: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 17, letterSpacing: -0.1 },
  caption: { fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 16 },
  numeric: { fontFamily: 'Inter_500Medium', fontVariant: ['tabular-nums'], letterSpacing: -0.4 },
};

// Shared layout constants so the pinned "Add transaction" button, the
// floating tab bar, and scroll-view bottom padding can never drift apart.
export const NAV = { TAB_BAR_HEIGHT: 64, TAB_BAR_GAP: 12, TAB_BAR_INSET: GUTTER };

// Vertical space the floating tab bar occupies, measured from the bottom of
// the screen and including the device's safe-area inset.
export const tabBarClearance = (insetBottom = 0) =>
  NAV.TAB_BAR_HEIGHT + NAV.TAB_BAR_GAP + insetBottom;

// Bottom fade behind a pinned action button: solid under the button and
// fading out above it, so nothing shows through while the button is dimmed.
export const scrim = {
  colors: ['rgba(19,19,19,0)', colors.bg, colors.bg],
  locations: [0, 0.45, 1],
};

export default colors;
