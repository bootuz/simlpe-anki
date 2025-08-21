import { useEffect, useCallback, useRef } from 'react';
import { SecurityLogger } from '@/utils/securityLogger';
import { validateSessionIntegrity, detectSuspiciousActivity } from '@/lib/contentSecurityPolicy';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface UserAction {
  action: string;
  timestamp: number;
}

export function useSecurityMonitor() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const userActionsRef = useRef<UserAction[]>([]);
  const lastSecurityCheckRef = useRef<number>(Date.now());

  // Disable aggressive monitoring in development
  const isDevelopment = import.meta.env.DEV;

  // Track user actions (less aggressive in dev)
  const trackAction = useCallback((action: string) => {
    if (isDevelopment) return; // Skip tracking in development
    
    const timestamp = Date.now();
    userActionsRef.current.push({ action, timestamp });
    
    // Keep only recent actions (last 5 minutes)
    const fiveMinutesAgo = timestamp - 5 * 60 * 1000;
    userActionsRef.current = userActionsRef.current.filter(a => a.timestamp > fiveMinutesAgo);
    
    // Check for suspicious activity
    if (detectSuspiciousActivity(userActionsRef.current)) {
      SecurityLogger.logSecurityViolation('suspicious_activity_detected', {
        actionsCount: userActionsRef.current.length,
        userId: user?.id
      });
      
      toast({
        title: 'Security Warning',
        description: 'Unusual activity detected. Please refresh the page.',
        variant: 'destructive'
      });
    }
  }, [user?.id, toast, isDevelopment]);

  // Periodic security checks
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      
      // Check session integrity every 5 minutes
      if (now - lastSecurityCheckRef.current > 5 * 60 * 1000) {
        lastSecurityCheckRef.current = now;
        
        if (!validateSessionIntegrity()) {
          SecurityLogger.logSessionEvent('timeout', { userId: user?.id });
          toast({
            title: 'Session Expired',
            description: 'Your session has expired for security reasons.',
            variant: 'destructive'
          });
          signOut();
          return;
        }
      }
      
      // Clear old security events periodically
      const events = SecurityLogger.getSecurityEvents();
      const oneDayAgo = now - 24 * 60 * 60 * 1000;
      const recentEvents = events.filter((e: any) => new Date(e.timestamp).getTime() > oneDayAgo);
      
      if (recentEvents.length < events.length) {
        localStorage.setItem('security_events', JSON.stringify(recentEvents));
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [user?.id, signOut, toast]);

  // Monitor for XSS attempts in DOM (disabled in development)
  useEffect(() => {
    if (isDevelopment) return;
    
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            
            // Check for suspicious script injections
            if (element.tagName === 'SCRIPT' || element.querySelector('script')) {
              SecurityLogger.logXSSAttempt('DOM script injection detected', 'DOM_MUTATION');
            }
            
            // Check for suspicious event handlers
            const attributes = element.attributes;
            if (attributes) {
              for (let i = 0; i < attributes.length; i++) {
                const attr = attributes[i];
                if (attr.name.startsWith('on')) {
                  SecurityLogger.logXSSAttempt(`Event handler injection: ${attr.name}`, 'DOM_ATTRIBUTE');
                }
              }
            }
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['onclick', 'onload', 'onerror', 'onmouseover']
    });

    return () => observer.disconnect();
  }, [isDevelopment]);

  // Monitor network requests for suspicious activity
  useEffect(() => {
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      const [url, options] = args;
      
      // Log data access for monitoring
      if (typeof url === 'string' && url.includes('supabase.co')) {
        const method = options?.method || 'GET';
        SecurityLogger.logDataAccess('supabase_api', method as any, undefined, user?.id);
      }
      
      return originalFetch(...args);
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [user?.id]);

  return {
    trackAction,
    getSecurityEvents: SecurityLogger.getSecurityEvents,
    clearSecurityEvents: SecurityLogger.clearSecurityEvents
  };
}
