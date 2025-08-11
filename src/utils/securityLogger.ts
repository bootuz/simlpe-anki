// Enhanced security logging with comprehensive monitoring and alerting
export class SecurityLogger {
  private static logToConsole(level: 'info' | 'warn' | 'error', event: string, data?: any) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      event,
      data,
      userAgent: navigator.userAgent,
      url: window.location.href,
      sessionId: this.getSessionId()
    };
    
    console[level](`[SECURITY ${level.toUpperCase()}]`, logEntry);
    
    // Store critical security events in localStorage for analysis
    if (level === 'error') {
      this.storeCriticalEvent(logEntry);
    }
  }

  private static getSessionId(): string {
    let sessionId = sessionStorage.getItem('security_session_id');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem('security_session_id', sessionId);
    }
    return sessionId;
  }

  private static storeCriticalEvent(logEntry: any) {
    try {
      const events = JSON.parse(localStorage.getItem('security_events') || '[]');
      events.push(logEntry);
      // Keep only last 50 events to prevent storage overflow
      if (events.length > 50) {
        events.splice(0, events.length - 50);
      }
      localStorage.setItem('security_events', JSON.stringify(events));
    } catch (e) {
      console.error('Failed to store security event:', e);
    }
  }

  static logXSSAttempt(input: string, location: string) {
    this.logToConsole('error', 'XSS_ATTEMPT_DETECTED', {
      input: input.substring(0, 100) + (input.length > 100 ? '...' : ''),
      location,
      inputLength: input.length,
      patterns: this.detectMaliciousPatterns(input)
    });
  }

  private static detectMaliciousPatterns(input: string): string[] {
    const patterns = [
      'script', 'javascript:', 'data:', 'vbscript:', 'on\\w+\\s*=',
      'expression\\s*\\(', 'behavior\\s*:', '@import', 'iframe', 'object', 'embed'
    ];
    return patterns.filter(pattern => new RegExp(pattern, 'i').test(input));
  }

  static logRateLimitExceeded(identifier: string, maxRequests: number, windowMs: number) {
    this.logToConsole('warn', 'RATE_LIMIT_EXCEEDED', {
      identifier,
      maxRequests,
      windowMs,
      timestamp: Date.now(),
      consecutiveViolations: this.incrementViolationCount(identifier)
    });
  }

  private static incrementViolationCount(identifier: string): number {
    const key = `violations_${identifier}`;
    const count = parseInt(localStorage.getItem(key) || '0') + 1;
    localStorage.setItem(key, count.toString());
    
    // Auto-clear after 1 hour
    setTimeout(() => {
      localStorage.removeItem(key);
    }, 3600000);
    
    return count;
  }

  static logAuthenticationEvent(event: 'login' | 'logout' | 'signup' | 'failed_login', details?: any) {
    this.logToConsole(event === 'failed_login' ? 'warn' : 'info', `AUTH_${event.toUpperCase()}`, {
      ...details,
      timestamp: Date.now(),
      ip: this.getClientIP()
    });
  }

  private static getClientIP(): string {
    // This would need to be implemented with a service or headers
    return 'client_ip_not_available';
  }

  static logDataAccess(table: string, operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE', recordCount?: number, userId?: string) {
    this.logToConsole('info', 'DATA_ACCESS', {
      table,
      operation,
      recordCount,
      userId,
      timestamp: Date.now()
    });
  }

  static logSecurityViolation(violation: string, details?: any) {
    this.logToConsole('error', 'SECURITY_VIOLATION', {
      violation,
      details,
      timestamp: Date.now(),
      severity: this.calculateSeverity(violation)
    });
  }

  private static calculateSeverity(violation: string): 'low' | 'medium' | 'high' | 'critical' {
    const criticalPatterns = ['xss', 'sql_injection', 'privilege_escalation'];
    const highPatterns = ['auth_bypass', 'data_leak', 'unauthorized_access'];
    const mediumPatterns = ['rate_limit', 'invalid_input', 'suspicious_activity'];
    
    const lowerViolation = violation.toLowerCase();
    
    if (criticalPatterns.some(p => lowerViolation.includes(p))) return 'critical';
    if (highPatterns.some(p => lowerViolation.includes(p))) return 'high';
    if (mediumPatterns.some(p => lowerViolation.includes(p))) return 'medium';
    return 'low';
  }

  static logDatabaseEvent(event: 'connection_failure' | 'query_error' | 'rls_violation', details?: any) {
    this.logToConsole('error', `DATABASE_${event.toUpperCase()}`, {
      ...details,
      timestamp: Date.now()
    });
  }

  static logSessionEvent(event: 'timeout' | 'hijack_attempt' | 'concurrent_login', details?: any) {
    this.logToConsole('warn', `SESSION_${event.toUpperCase()}`, {
      ...details,
      timestamp: Date.now()
    });
  }

  // Get stored security events for analysis
  static getSecurityEvents(): any[] {
    try {
      return JSON.parse(localStorage.getItem('security_events') || '[]');
    } catch {
      return [];
    }
  }

  // Clear security events
  static clearSecurityEvents(): void {
    localStorage.removeItem('security_events');
  }
}

// Legacy function exports for backward compatibility
export function detectXSSAttempt(input: string): boolean {
  const xssPatterns = [
    /<script\b/i, /<iframe\b/i, /<object\b/i, /<embed\b/i, /<svg\b.*onload/i,
    /<math\b/i, /javascript:/i, /vbscript:/i, /data:text\/html/i, /data:.*base64/i,
    /on\w+\s*=/i, /<img[^>]+src\s*=\s*["']javascript:/i, /<svg[^>]*onload/i,
    /expression\s*\(/i, /@import/i, /behavior\s*:/i, /&#x[0-9a-f]/i,
    /&#\d/i, /\\u[0-9a-f]{4}/i, /feed:/i, /livescript:/i,
  ];
  return xssPatterns.some(pattern => pattern.test(input));
}

export function logFailedAuthentication(email?: string, error?: string) {
  SecurityLogger.logAuthenticationEvent('failed_login', {
    email: email ? email.substring(0, 3) + '***' : 'unknown',
    error,
    user_agent: navigator.userAgent
  });
}

export function logXSSAttempt(input: string, userId?: string) {
  SecurityLogger.logXSSAttempt(input, userId || 'unknown');
}