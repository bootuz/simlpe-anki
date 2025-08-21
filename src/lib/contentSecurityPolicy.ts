// Content Security Policy utilities for enhanced security

// Client-side CSP directives (can be set via meta tags)
export const CSP_CLIENT_DIRECTIVES = {
  'default-src': "'self' *.lovable.app *.lovable.dev",
  'script-src': "'self' 'unsafe-inline' 'unsafe-eval' *.lovable.app *.lovable.dev", // Allow inline for dev
  'style-src': "'self' 'unsafe-inline' *.lovable.app *.lovable.dev",
  'img-src': "'self' data: https: *.lovable.app *.lovable.dev",
  'font-src': "'self' data: *.lovable.app *.lovable.dev",
  'connect-src': "'self' https://ibukptkjdbsbsnizyoyr.supabase.co wss://ibukptkjdbsbsnizyoyr.supabase.co *.lovable.app *.lovable.dev ws: wss:",
  'frame-src': "'self' *.lovable.app *.lovable.dev",
  'object-src': "'none'",
  'base-uri': "'self'",
  'form-action': "'self'",
} as const;

// Server-only CSP directives (must be set via HTTP headers)
export const CSP_SERVER_ONLY_DIRECTIVES = {
  'frame-ancestors': "'self' *.lovable.app *.lovable.dev",
} as const;

// Combined CSP directives for server-side configuration
export const CSP_DIRECTIVES = {
  ...CSP_CLIENT_DIRECTIVES,
  ...CSP_SERVER_ONLY_DIRECTIVES,
} as const;

export function generateCSPHeader(nonce?: string, clientOnly = false): string {
  // Use client-only directives when setting via meta tags
  const directives = clientOnly ? CSP_CLIENT_DIRECTIVES : CSP_DIRECTIVES;
  
  return Object.entries(directives)
    .map(([directive, value]) => {
      // Add nonce to script-src if provided
      if (directive === 'script-src' && nonce) {
        return `${directive} ${value} 'nonce-${nonce}'`;
      }
      return `${directive} ${value}`;
    })
    .join('; ');
}

// Generate secure nonce for CSP
export function generateCSPNonce(): string {
  return generateSecureToken().substring(0, 16);
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

// Advanced rate limiting utility for client-side protection
const requestCounts = new Map<string, { count: number; resetTime: number; violations: number }>();

export function checkClientRateLimit(key: string, maxRequests = 10, windowMs = 60000): boolean {
  const now = Date.now();
  const current = requestCounts.get(key);

  if (!current || now > current.resetTime) {
    requestCounts.set(key, { count: 1, resetTime: now + windowMs, violations: 0 });
    return true;
  }

  if (current.count >= maxRequests) {
    current.violations++;
    
    // Progressive penalties for repeated violations
    const penaltyMultiplier = Math.min(current.violations, 5);
    const extendedWindow = windowMs * penaltyMultiplier;
    current.resetTime = now + extendedWindow;
    
    return false;
  }

  current.count++;
  return true;
}

// Session security utilities
export function validateSessionIntegrity(): boolean {
  const sessionStart = sessionStorage.getItem('session_start');
  const maxSessionTime = 8 * 60 * 60 * 1000; // 8 hours
  
  if (!sessionStart) {
    sessionStorage.setItem('session_start', Date.now().toString());
    return true;
  }
  
  const elapsed = Date.now() - parseInt(sessionStart);
  return elapsed < maxSessionTime;
}

export function generateSecureToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Enhanced input validation for critical operations
export function validateCriticalOperation(operation: string, userId?: string): boolean {
  if (!userId) return false;
  
  const operationKey = `critical_op_${userId}_${operation}`;
  const maxCriticalOps = 5; // Max 5 critical operations per minute
  const windowMs = 60000; // 1 minute
  
  return checkClientRateLimit(operationKey, maxCriticalOps, windowMs);
}

// Monitor for suspicious patterns
export function detectSuspiciousActivity(userActions: Array<{ action: string; timestamp: number }>): boolean {
  const now = Date.now();
  const recentActions = userActions.filter(a => now - a.timestamp < 30000); // Last 30 seconds
  
  // Too many actions in short time
  if (recentActions.length > 20) return true;
  
  // Repeated identical actions
  const actionCounts = recentActions.reduce((acc, action) => {
    acc[action.action] = (acc[action.action] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return Object.values(actionCounts).some(count => count > 10);
}