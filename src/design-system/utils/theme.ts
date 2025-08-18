// Theme Utilities

import { colorTokens } from '../tokens/colors';

export type Theme = 'light' | 'dark';

// Theme switching utilities
export const getTheme = (): Theme => {
  if (typeof window === 'undefined') return 'light';
  
  const stored = localStorage.getItem('theme');
  if (stored === 'light' || stored === 'dark') return stored;
  
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const setTheme = (theme: Theme): void => {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('theme', theme);
  
  const root = window.document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(theme);
};

export const toggleTheme = (): Theme => {
  const current = getTheme();
  const next = current === 'light' ? 'dark' : 'light';
  setTheme(next);
  return next;
};

// CSS variable helpers for runtime theme values
export const getCSSVariableValue = (variable: string): string => {
  if (typeof window === 'undefined') return '';
  return getComputedStyle(document.documentElement).getPropertyValue(`--${variable}`).trim();
};

export const setCSSVariable = (variable: string, value: string): void => {
  if (typeof window === 'undefined') return;
  document.documentElement.style.setProperty(`--${variable}`, value);
};

// Generate CSS variables for color tokens
export const generateCSSVariables = (theme: Theme): Record<string, string> => {
  const variables: Record<string, string> = {};
  
  // Flatten color tokens and generate CSS variables
  const flattenColors = (obj: any, prefix: string = '') => {
    Object.entries(obj).forEach(([key, value]) => {
      const cssKey = prefix ? `${prefix}-${key}` : key;
      
      if (typeof value === 'object' && value !== null) {
        // Check if it's a theme object (has light/dark keys)
        if ('light' in value && 'dark' in value) {
          variables[cssKey] = (value as any)[theme];
        } else {
          // Recursively flatten nested objects
          flattenColors(value, cssKey);
        }
      } else if (typeof value === 'string') {
        variables[cssKey] = value;
      }
    });
  };
  
  flattenColors(colorTokens);
  
  return variables;
};

// Apply theme variables to document
export const applyThemeVariables = (theme: Theme): void => {
  if (typeof window === 'undefined') return;
  
  const variables = generateCSSVariables(theme);
  
  Object.entries(variables).forEach(([key, value]) => {
    setCSSVariable(key, value);
  });
};

// Initialize theme on app startup
export const initializeTheme = (): void => {
  const theme = getTheme();
  setTheme(theme);
  applyThemeVariables(theme);
};

// Hook for theme detection (for React components)
export const useThemeDetection = (): { theme: Theme; systemPreference: Theme } => {
  const getSystemPreference = (): Theme =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  
  return {
    theme: getTheme(),
    systemPreference: getSystemPreference(),
  };
};