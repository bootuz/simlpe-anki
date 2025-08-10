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
  
// Enhanced XSS prevention - comprehensive dangerous pattern detection
  const dangerousPatterns = [
    // HTML elements
    /<script\b/i,
    /<iframe\b/i,
    /<object\b/i,
    /<embed\b/i,
    /<link\b/i,
    /<meta\b/i,
    /<form\b/i,
    /<svg\b/i,
    /<math\b/i,
    // Protocol handlers
    /javascript:/i,
    /data:text\/html/i,
    /vbscript:/i,
    /data:.*base64/i,
    // Event handlers
    /on\w+\s*=/i,
    /<\s*\/?\s*\w+\s+[^>]*\bon\w+\s*=/i,
    // CSS injection
    /expression\s*\(/i,
    /behavior\s*:/i,
    /@import/i,
    /binding\s*:/i,
    // Data URLs and other protocols
    /data:image\/svg\+xml/i,
    /feed:/i,
    /livescript:/i,
    // Additional XSS vectors
    /&#x/i, // Hex entities
    /&#\d/i, // Decimal entities
    /\\\w+/i, // Backslash escapes
  ];
  
  for (const pattern of dangerousPatterns) {
    if (pattern.test(content)) {
      return { isValid: false, error: "Invalid content detected" };
    }
  }
  
  return { isValid: true };
}

export function sanitizeCardContent(content: string): string {
  // First normalize the content
  let sanitized = content.trim();
  
  // Remove dangerous protocols and scripts
  sanitized = sanitized
    .replace(/javascript:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/data:text\/html/gi, '')
    .replace(/data:.*base64/gi, '')
    .replace(/on\w+\s*=/gi, '') // Remove all event handlers
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/<iframe\b[^>]*>/gi, '') // Remove iframe tags
    .replace(/<object\b[^>]*>/gi, '') // Remove object tags
    .replace(/<embed\b[^>]*>/gi, '') // Remove embed tags
    .replace(/<link\b[^>]*>/gi, '') // Remove link tags
    .replace(/<meta\b[^>]*>/gi, '') // Remove meta tags
    .replace(/expression\s*\([^)]*\)/gi, '') // Remove CSS expressions
    .replace(/@import[^;]*/gi, ''); // Remove CSS imports
  
  // HTML encode remaining content
  return sanitized
    .replace(/&/g, '&amp;') // Must be first to avoid double encoding
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;'); // Also encode forward slashes
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
