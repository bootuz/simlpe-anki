// Design System Color Tokens
// Extracted from index.css and organized for TypeScript usage

export const colorTokens = {
  // Base semantic colors (HSL values)
  background: {
    light: '240 20% 99%',
    dark: '222.2 84% 4.9%',
  },
  foreground: {
    light: '240 10% 15%',
    dark: '210 40% 98%',
  },
  
  // Primary brand colors
  primary: {
    light: '262 83% 58%',  // Purple
    dark: '210 40% 98%',
    foreground: {
      light: '240 50% 99%',
      dark: '222.2 47.4% 11.2%',
    },
  },
  
  // Secondary brand colors
  secondary: {
    light: '240 30% 95%',
    dark: '217.2 32.6% 17.5%',
    foreground: {
      light: '240 10% 15%',
      dark: '210 40% 98%',
    },
  },
  
  // Accent colors
  accent: {
    light: '217 91% 60%',  // Blue
    dark: '217.2 32.6% 17.5%',
    foreground: {
      light: '240 50% 99%',
      dark: '210 40% 98%',
    },
  },
  
  // State colors
  destructive: {
    light: '0 84.2% 60.2%',
    dark: '0 62.8% 30.6%',
    foreground: {
      light: '210 40% 98%',
      dark: '210 40% 98%',
    },
  },
  
  warning: {
    light: '38 92% 50%',
    dark: '48 96% 89%',
    foreground: {
      light: '48 96% 89%',
      dark: '20 14.3% 4.1%',
    },
  },
  
  // Surface colors
  card: {
    light: '240 50% 99%',
    dark: '222.2 84% 4.9%',
    foreground: {
      light: '240 10% 15%',
      dark: '210 40% 98%',
    },
  },
  
  popover: {
    light: '240 50% 99%',
    dark: '222.2 84% 4.9%',
    foreground: {
      light: '240 10% 15%',
      dark: '210 40% 98%',
    },
  },
  
  // Muted colors
  muted: {
    light: '240 20% 96%',
    dark: '217.2 32.6% 17.5%',
    foreground: {
      light: '240 5% 45%',
      dark: '215 20.2% 65.1%',
    },
  },
  
  // Border colors
  border: {
    light: '214.3 31.8% 91.4%',
    dark: '217.2 32.6% 17.5%',
  },
  
  input: {
    light: '214.3 31.8% 91.4%',
    dark: '217.2 32.6% 17.5%',
  },
  
  ring: {
    light: '222.2 84% 4.9%',
    dark: '212.7 26.8% 83.9%',
  },
  
  // Custom flashcard colors
  flashcard: {
    front: '262 83% 58%',  // Primary purple
    back: '217 91% 60%',   // Accent blue
    shadow: '240 50% 85%',
  },
  
  // Sidebar colors
  sidebar: {
    background: {
      light: '0 0% 98%',
      dark: '240 5.9% 10%',
    },
    foreground: {
      light: '240 5.3% 26.1%',
      dark: '240 4.8% 95.9%',
    },
    primary: {
      light: '240 5.9% 10%',
      dark: '224.3 76.3% 48%',
    },
    primaryForeground: {
      light: '0 0% 98%',
      dark: '0 0% 100%',
    },
    accent: {
      light: '240 4.8% 95.9%',
      dark: '240 3.7% 15.9%',
    },
    accentForeground: {
      light: '240 5.9% 10%',
      dark: '240 4.8% 95.9%',
    },
    border: {
      light: '220 13% 91%',
      dark: '240 3.7% 15.9%',
    },
    ring: {
      light: '217.2 91.2% 59.8%',
      dark: '217.2 91.2% 59.8%',
    },
  },
} as const;

// Semantic color aliases for common use cases
export const semanticColors = {
  success: {
    light: '142 76% 36%',  // Green
    dark: '142 71% 45%',
    foreground: {
      light: '355.7 100% 97.3%',
      dark: '0 0% 98%',
    },
  },
  info: {
    light: '217 91% 60%',  // Blue (same as accent)
    dark: '217 91% 60%',
    foreground: {
      light: '240 50% 99%',
      dark: '210 40% 98%',
    },
  },
  error: {
    light: '0 84.2% 60.2%',  // Red (same as destructive)
    dark: '0 62.8% 30.6%',
    foreground: {
      light: '210 40% 98%',
      dark: '210 40% 98%',
    },
  },
} as const;

// Utility function to get color value by theme
export const getColorValue = (
  colorPath: string,
  theme: 'light' | 'dark' = 'light'
): string => {
  const pathArray = colorPath.split('.');
  let current: any = colorTokens;
  
  for (const key of pathArray) {
    current = current[key];
    if (!current) return '';
  }
  
  if (typeof current === 'object' && current[theme]) {
    return current[theme];
  }
  
  return typeof current === 'string' ? current : '';
};

// CSS custom property helpers
export const getCSSVariable = (token: string): string => {
  return `hsl(var(--${token}))`;
};

export const setColorCSSVariable = (token: string, value: string): string => {
  return `--${token}: ${value};`;
};