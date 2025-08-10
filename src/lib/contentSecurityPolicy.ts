// Content Security Policy utilities for enhanced security
export const CSP_DIRECTIVES = {
  'default-src': "'self'",
  'script-src': "'self' 'unsafe-inline'", // Note: Consider removing unsafe-inline in production
  'style-src': "'self' 'unsafe-inline'",
  'img-src': "'self' data: https:",
  'font-src': "'self' data:",
  'connect-src': "'self' https://ibukptkjdbsbsnizyoyr.supabase.co wss://ibukptkjdbsbsnizyoyr.supabase.co",
  'frame-src': "'none'",
  'object-src': "'none'",
  'base-uri': "'self'",
  'form-action': "'self'",
  'frame-ancestors': "'none'",
} as const;

export function generateCSPHeader(): string {
  return Object.entries(CSP_DIRECTIVES)
    .map(([directive, value]) => `${directive} ${value}`)
    .join('; ');
}

// Input sanitization for user-generated content
export function sanitizeForDisplay(content: string): string {
  return content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// Validate URLs to prevent malicious redirects
export function isValidURL(url: string): boolean {
  try {
    const parsedURL = new URL(url);
    // Only allow http, https, and mailto protocols
    return ['http:', 'https:', 'mailto:'].includes(parsedURL.protocol);
  } catch {
    return false;
  }
}

// Rate limiting utility for client-side protection
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function checkClientRateLimit(key: string, maxRequests = 10, windowMs = 60000): boolean {
  const now = Date.now();
  const current = requestCounts.get(key);

  if (!current || now > current.resetTime) {
    requestCounts.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (current.count >= maxRequests) {
    return false;
  }

  current.count++;
  return true;
}