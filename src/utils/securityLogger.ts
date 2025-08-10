// Security logging utilities for monitoring and auditing
import { supabase } from "@/integrations/supabase/client";

interface SecurityEvent {
  event_type: 'auth_attempt' | 'invalid_input' | 'xss_attempt' | 'rate_limit' | 'unauthorized_access';
  user_id?: string;
  details: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export function logSecurityEvent(event: SecurityEvent) {
  // Log to console for development
  console.warn(`[SECURITY] ${event.event_type}:`, {
    severity: event.severity,
    user_id: event.user_id,
    details: event.details,
    timestamp: new Date().toISOString()
  });

  // In production, you could send this to a security monitoring service
  // or log to a dedicated security table
}

export function detectXSSAttempt(input: string): boolean {
  const xssPatterns = [
    /<script\b/i,
    /<iframe\b/i,
    /<object\b/i,
    /<embed\b/i,
    /<svg\b.*onload/i,
    /<math\b/i,
    /javascript:/i,
    /vbscript:/i,
    /data:text\/html/i,
    /data:.*base64/i,
    /on\w+\s*=/i,
    /<img[^>]+src\s*=\s*["']javascript:/i,
    /<svg[^>]*onload/i,
    /expression\s*\(/i,
    /@import/i,
    /behavior\s*:/i,
    /&#x[0-9a-f]/i,
    /&#\d/i,
    /\\u[0-9a-f]{4}/i,
    /feed:/i,
    /livescript:/i,
  ];

  return xssPatterns.some(pattern => pattern.test(input));
}

export function logFailedAuthentication(email?: string, error?: string) {
  logSecurityEvent({
    event_type: 'auth_attempt',
    details: {
      email: email ? email.substring(0, 3) + '***' : 'unknown',
      error,
      ip: 'client-side', // In a real app, get from server
      user_agent: navigator.userAgent
    },
    severity: 'medium'
  });
}

export function logXSSAttempt(input: string, userId?: string) {
  logSecurityEvent({
    event_type: 'xss_attempt',
    user_id: userId,
    details: {
      input_length: input.length,
      detected_patterns: input.match(/<[^>]*>/g)?.slice(0, 5), // First 5 HTML tags
      timestamp: new Date().toISOString()
    },
    severity: 'high'
  });
}