// CVA Variant Utilities

import { type ClassValue } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Helper for creating compound variants easily
export const createCompoundVariant = (
  conditions: Record<string, any>,
  className: ClassValue
) => ({
  ...conditions,
  class: className,
});

// Common variant patterns
export const commonVariants = {
  // Size variants commonly used across components
  sizes: {
    xs: "text-xs",
    sm: "text-sm", 
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
  },
  
  // Color variants for semantic meanings
  semanticColors: {
    default: "text-foreground",
    muted: "text-muted-foreground",
    primary: "text-primary",
    secondary: "text-secondary-foreground",
    destructive: "text-destructive",
    success: "text-green-600 dark:text-green-400",
    warning: "text-yellow-600 dark:text-yellow-400",
    info: "text-blue-600 dark:text-blue-400",
  },
  
  // Background variants
  backgrounds: {
    default: "bg-background",
    muted: "bg-muted",
    card: "bg-card",
    primary: "bg-primary text-primary-foreground",
    secondary: "bg-secondary text-secondary-foreground",
    destructive: "bg-destructive text-destructive-foreground",
    success: "bg-green-600 text-white",
    warning: "bg-yellow-600 text-white",
    info: "bg-blue-600 text-white",
  },
  
  // Border variants
  borders: {
    none: "border-0",
    default: "border border-border",
    muted: "border border-muted",
    primary: "border border-primary",
    destructive: "border border-destructive",
    dashed: "border border-dashed border-border",
  },
  
  // Shadow variants  
  shadows: {
    none: "shadow-none",
    sm: "shadow-sm",
    default: "shadow",
    md: "shadow-md",
    lg: "shadow-lg",
    xl: "shadow-xl",
    inner: "shadow-inner",
  },
  
  // Spacing variants
  spacing: {
    none: "p-0",
    xs: "p-1",
    sm: "p-2", 
    md: "p-4",
    lg: "p-6",
    xl: "p-8",
  },
  
  // Rounded variants
  rounded: {
    none: "rounded-none",
    sm: "rounded-sm",
    default: "rounded",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    full: "rounded-full",
  },
};

// Utility for merging variant classes
export const mergeVariants = (...variants: (ClassValue | undefined)[]): string => {
  return cn(...variants.filter(Boolean));
};

// Helper for responsive variants
export const createResponsiveVariant = (
  baseClass: string,
  breakpoints: Partial<Record<'sm' | 'md' | 'lg' | 'xl' | '2xl', string>>
): string => {
  const responsiveClasses = [baseClass];
  
  Object.entries(breakpoints).forEach(([breakpoint, className]) => {
    if (className) {
      responsiveClasses.push(`${breakpoint}:${className}`);
    }
  });
  
  return responsiveClasses.join(' ');
};

// State variants for interactive elements
export const stateVariants = {
  hover: {
    none: "",
    subtle: "hover:bg-accent/50",
    accent: "hover:bg-accent hover:text-accent-foreground",
    primary: "hover:bg-primary/90",
    destructive: "hover:bg-destructive/90",
    scale: "hover:scale-105 transition-transform",
    lift: "hover:-translate-y-1 transition-transform",
    glow: "hover:shadow-lg hover:shadow-primary/25 transition-shadow",
  },
  
  focus: {
    none: "",
    ring: "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    primary: "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
    destructive: "focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2",
  },
  
  active: {
    none: "",
    scale: "active:scale-95 transition-transform",
    primary: "active:bg-primary/80",
    destructive: "active:bg-destructive/80",
  },
  
  disabled: {
    none: "",
    default: "disabled:opacity-50 disabled:pointer-events-none",
    subtle: "disabled:opacity-30 disabled:pointer-events-none",
  },
};

// Animation variants
export const animationVariants = {
  transition: {
    none: "",
    all: "transition-all duration-200",
    colors: "transition-colors duration-200",
    transform: "transition-transform duration-200", 
    opacity: "transition-opacity duration-200",
    shadow: "transition-shadow duration-300",
  },
  
  loading: {
    spin: "animate-spin",
    pulse: "animate-pulse",
    bounce: "animate-bounce",
    ping: "animate-ping",
  },
  
  entrance: {
    fadeIn: "animate-fade-in",
    scaleIn: "animate-scale-in",
    slideUp: "animate-slide-up",
    slideDown: "animate-slide-down",
  },
};

// Utility for creating theme-aware variants
export const createThemeVariant = (
  lightClass: string,
  darkClass: string
): string => {
  return `${lightClass} dark:${darkClass}`;
};

// Predefined component variant patterns
export const componentPatterns = {
  button: {
    base: "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
    sizes: {
      sm: "h-9 px-3",
      md: "h-10 px-4 py-2", 
      lg: "h-11 px-8",
    },
  },
  
  input: {
    base: "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
    sizes: {
      sm: "h-8 px-2 text-xs",
      md: "h-10 px-3 py-2",
      lg: "h-12 px-4 py-3",
    },
  },
  
  card: {
    base: "rounded-lg border bg-card text-card-foreground shadow-sm",
    variants: {
      elevated: "shadow-lg",
      interactive: "cursor-pointer hover:shadow-md transition-shadow",
    },
  },
};