// Design System Typography Tokens

export const fontFamilies = {
  sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
  mono: ['JetBrains Mono', 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'monospace'],
} as const;

export const fontSizes = {
  xs: ['0.75rem', { lineHeight: '1rem' }],     // 12px
  sm: ['0.875rem', { lineHeight: '1.25rem' }], // 14px  
  base: ['1rem', { lineHeight: '1.5rem' }],    // 16px
  lg: ['1.125rem', { lineHeight: '1.75rem' }], // 18px
  xl: ['1.25rem', { lineHeight: '1.75rem' }],  // 20px
  '2xl': ['1.5rem', { lineHeight: '2rem' }],   // 24px
  '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
  '4xl': ['2.25rem', { lineHeight: '2.5rem' }],   // 36px
  '5xl': ['3rem', { lineHeight: '1' }],           // 48px
  '6xl': ['3.75rem', { lineHeight: '1' }],        // 60px
  '7xl': ['4.5rem', { lineHeight: '1' }],         // 72px
} as const;

export const fontWeights = {
  thin: '100',
  extralight: '200',
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
  black: '900',
} as const;

export const letterSpacing = {
  tighter: '-0.05em',
  tight: '-0.025em',
  normal: '0em',
  wide: '0.025em',
  wider: '0.05em',
  widest: '0.1em',
} as const;

// Semantic typography scales
export const textStyles = {
  // Display text - for large headings
  display: {
    '2xl': {
      fontSize: fontSizes['7xl'][0],
      lineHeight: fontSizes['7xl'][1].lineHeight,
      fontWeight: fontWeights.extrabold,
      letterSpacing: letterSpacing.tight,
    },
    xl: {
      fontSize: fontSizes['6xl'][0],
      lineHeight: fontSizes['6xl'][1].lineHeight,
      fontWeight: fontWeights.extrabold,
      letterSpacing: letterSpacing.tight,
    },
    lg: {
      fontSize: fontSizes['5xl'][0],
      lineHeight: fontSizes['5xl'][1].lineHeight,
      fontWeight: fontWeights.bold,
      letterSpacing: letterSpacing.tight,
    },
    md: {
      fontSize: fontSizes['4xl'][0],
      lineHeight: fontSizes['4xl'][1].lineHeight,
      fontWeight: fontWeights.bold,
      letterSpacing: letterSpacing.tight,
    },
    sm: {
      fontSize: fontSizes['3xl'][0],
      lineHeight: fontSizes['3xl'][1].lineHeight,
      fontWeight: fontWeights.bold,
      letterSpacing: letterSpacing.normal,
    },
  },
  
  // Headings
  heading: {
    h1: {
      fontSize: fontSizes['4xl'][0],
      lineHeight: fontSizes['4xl'][1].lineHeight,
      fontWeight: fontWeights.bold,
      letterSpacing: letterSpacing.tight,
    },
    h2: {
      fontSize: fontSizes['3xl'][0],
      lineHeight: fontSizes['3xl'][1].lineHeight,
      fontWeight: fontWeights.bold,
      letterSpacing: letterSpacing.tight,
    },
    h3: {
      fontSize: fontSizes['2xl'][0],
      lineHeight: fontSizes['2xl'][1].lineHeight,
      fontWeight: fontWeights.semibold,
      letterSpacing: letterSpacing.normal,
    },
    h4: {
      fontSize: fontSizes.xl[0],
      lineHeight: fontSizes.xl[1].lineHeight,
      fontWeight: fontWeights.semibold,
      letterSpacing: letterSpacing.normal,
    },
    h5: {
      fontSize: fontSizes.lg[0],
      lineHeight: fontSizes.lg[1].lineHeight,
      fontWeight: fontWeights.medium,
      letterSpacing: letterSpacing.normal,
    },
    h6: {
      fontSize: fontSizes.base[0],
      lineHeight: fontSizes.base[1].lineHeight,
      fontWeight: fontWeights.medium,
      letterSpacing: letterSpacing.wide,
    },
  },
  
  // Body text
  body: {
    lg: {
      fontSize: fontSizes.lg[0],
      lineHeight: fontSizes.lg[1].lineHeight,
      fontWeight: fontWeights.normal,
      letterSpacing: letterSpacing.normal,
    },
    md: {
      fontSize: fontSizes.base[0],
      lineHeight: fontSizes.base[1].lineHeight,
      fontWeight: fontWeights.normal,
      letterSpacing: letterSpacing.normal,
    },
    sm: {
      fontSize: fontSizes.sm[0],
      lineHeight: fontSizes.sm[1].lineHeight,
      fontWeight: fontWeights.normal,
      letterSpacing: letterSpacing.normal,
    },
  },
  
  // Labels and UI text
  label: {
    lg: {
      fontSize: fontSizes.base[0],
      lineHeight: fontSizes.base[1].lineHeight,
      fontWeight: fontWeights.medium,
      letterSpacing: letterSpacing.normal,
    },
    md: {
      fontSize: fontSizes.sm[0],
      lineHeight: fontSizes.sm[1].lineHeight,
      fontWeight: fontWeights.medium,
      letterSpacing: letterSpacing.normal,
    },
    sm: {
      fontSize: fontSizes.xs[0],
      lineHeight: fontSizes.xs[1].lineHeight,
      fontWeight: fontWeights.medium,
      letterSpacing: letterSpacing.wide,
    },
  },
  
  // Caption and small text
  caption: {
    lg: {
      fontSize: fontSizes.sm[0],
      lineHeight: fontSizes.sm[1].lineHeight,
      fontWeight: fontWeights.normal,
      letterSpacing: letterSpacing.normal,
    },
    md: {
      fontSize: fontSizes.xs[0],
      lineHeight: fontSizes.xs[1].lineHeight,
      fontWeight: fontWeights.normal,
      letterSpacing: letterSpacing.normal,
    },
  },
  
  // Code and monospace
  code: {
    lg: {
      fontSize: fontSizes.base[0],
      lineHeight: fontSizes.base[1].lineHeight,
      fontWeight: fontWeights.normal,
      fontFamily: fontFamilies.mono.join(', '),
    },
    md: {
      fontSize: fontSizes.sm[0],
      lineHeight: fontSizes.sm[1].lineHeight,
      fontWeight: fontWeights.normal,
      fontFamily: fontFamilies.mono.join(', '),
    },
    sm: {
      fontSize: fontSizes.xs[0],
      lineHeight: fontSizes.xs[1].lineHeight,
      fontWeight: fontWeights.normal,
      fontFamily: fontFamilies.mono.join(', '),
    },
  },
} as const;

// Utility function to get typography styles
export const getTextStyle = (category: keyof typeof textStyles, variant: string) => {
  const styles = textStyles[category] as any;
  return styles[variant] || {};
};

// CSS class name helpers for common typography patterns
export const typographyClasses = {
  // Heading classes
  h1: 'text-4xl font-bold tracking-tight',
  h2: 'text-3xl font-bold tracking-tight', 
  h3: 'text-2xl font-semibold',
  h4: 'text-xl font-semibold',
  h5: 'text-lg font-medium',
  h6: 'text-base font-medium tracking-wide',
  
  // Body text classes
  'body-lg': 'text-lg leading-relaxed',
  'body-md': 'text-base leading-normal',
  'body-sm': 'text-sm leading-normal',
  
  // Label classes
  'label-lg': 'text-base font-medium',
  'label-md': 'text-sm font-medium',
  'label-sm': 'text-xs font-medium tracking-wide',
  
  // Caption classes
  'caption-lg': 'text-sm text-muted-foreground',
  'caption-md': 'text-xs text-muted-foreground',
  
  // Code classes
  'code-lg': 'text-base font-mono',
  'code-md': 'text-sm font-mono',
  'code-sm': 'text-xs font-mono',
  
  // Display classes for large text
  'display-2xl': 'text-7xl font-extrabold tracking-tight',
  'display-xl': 'text-6xl font-extrabold tracking-tight',
  'display-lg': 'text-5xl font-bold tracking-tight',
  'display-md': 'text-4xl font-bold tracking-tight',
  'display-sm': 'text-3xl font-bold',
} as const;