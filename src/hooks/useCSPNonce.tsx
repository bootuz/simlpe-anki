import { useState, useEffect } from 'react';
import { generateCSPNonce, generateCSPHeader } from '@/lib/contentSecurityPolicy';

export function useCSPNonce() {
  const [nonce, setNonce] = useState<string>('');

  useEffect(() => {
    // Generate new nonce on mount and periodically refresh
    const refreshNonce = () => {
      const newNonce = generateCSPNonce();
      setNonce(newNonce);
      
      // Update CSP meta tag if it exists
      const metaTag = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
      if (metaTag) {
        const currentCSP = metaTag.getAttribute('content') || '';
        const updatedCSP = currentCSP.replace(/nonce-[a-zA-Z0-9]+/g, `nonce-${newNonce}`);
        metaTag.setAttribute('content', updatedCSP);
      }
    };

    refreshNonce();
    
    // Refresh nonce every 30 minutes for security
    const interval = setInterval(refreshNonce, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return nonce;
}