import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Security utility functions
export function validateCardContent(content: string): { isValid: boolean; error?: string } {
  if (!content.trim()) {
    return { isValid: false, error: "Content cannot be empty" };
  }
  
  if (content.length > 1000) {
    return { isValid: false, error: "Content must be less than 1000 characters" };
  }
  
  // Basic XSS prevention - check for script tags
  if (content.toLowerCase().includes('<script')) {
    return { isValid: false, error: "Invalid content detected" };
  }
  
  return { isValid: true };
}

export function sanitizeCardContent(content: string): string {
  return content
    .trim()
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}
