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
  
  // Enhanced XSS prevention - check for dangerous HTML elements and attributes
  const dangerousPatterns = [
    /<script\b/i,
    /<iframe\b/i,
    /<object\b/i,
    /<embed\b/i,
    /<link\b/i,
    /<meta\b/i,
    /<form\b/i,
    /javascript:/i,
    /on\w+\s*=/i, // onclick, onerror, onload, etc.
    /<\s*\/?\s*\w+\s+[^>]*\bon\w+\s*=/i, // any tag with event handlers
  ];
  
  for (const pattern of dangerousPatterns) {
    if (pattern.test(content)) {
      return { isValid: false, error: "Invalid content detected" };
    }
  }
  
  return { isValid: true };
}

export function sanitizeCardContent(content: string): string {
  return content
    .trim()
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/&/g, '&amp;') // Fix ampersand encoding order
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, ''); // Remove event handlers
}

// Additional security utilities
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/\.{2,}/g, '_')
    .substring(0, 255);
}

export function validateDeckName(name: string): { isValid: boolean; error?: string } {
  if (!name.trim()) {
    return { isValid: false, error: "Deck name cannot be empty" };
  }
  
  if (name.length > 100) {
    return { isValid: false, error: "Deck name must be less than 100 characters" };
  }
  
  // Check for potentially dangerous characters
  if (/[<>\"'&]/.test(name)) {
    return { isValid: false, error: "Deck name contains invalid characters" };
  }
  
  return { isValid: true };
}

export function validateFolderName(name: string): { isValid: boolean; error?: string } {
  if (!name.trim()) {
    return { isValid: false, error: "Folder name cannot be empty" };
  }
  
  if (name.length > 100) {
    return { isValid: false, error: "Folder name must be less than 100 characters" };
  }
  
  // Check for potentially dangerous characters
  if (/[<>\"'&]/.test(name)) {
    return { isValid: false, error: "Folder name contains invalid characters" };
  }
  
  return { isValid: true };
}
