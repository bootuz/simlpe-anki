// CVA Variant Utilities

import { clsx, type ClassValue } from "clsx";
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
};

// Utility for merging variant classes
export const mergeVariants = (...variants: (ClassValue | undefined)[]): string => {
  return cn(...variants.filter(Boolean));
};

// State variants for interactive elements
export const stateVariants = {
  hover: {
    none: "",
    subtle: "hover:bg-accent/50",
    accent: "hover:bg-accent hover:text-accent-foreground",
    primary: "hover:bg-primary/90",
    destructive: "hover:bg-destructive/90",
  },
  
  focus: {
    none: "",
    ring: "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    primary: "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
    destructive: "focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2",
  },
  
  disabled: {
    none: "",
    default: "disabled:opacity-50 disabled:pointer-events-none",
    subtle: "disabled:opacity-30 disabled:pointer-events-none",
  },
};