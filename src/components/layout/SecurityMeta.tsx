import { useEffect } from 'react';
import { generateCSPHeader } from '@/lib/contentSecurityPolicy';
import { useCSPNonce } from '@/hooks/useCSPNonce';

export function SecurityMeta() {
  const nonce = useCSPNonce();

  useEffect(() => {
    if (!nonce) return;

    // Create or update CSP meta tag
    let metaTag = document.querySelector('meta[http-equiv="Content-Security-Policy"]') as HTMLMetaElement;
    
    if (!metaTag) {
      metaTag = document.createElement('meta');
      metaTag.setAttribute('http-equiv', 'Content-Security-Policy');
      document.head.appendChild(metaTag);
    }

    // Use client-only CSP directives for meta tag (frame-ancestors requires HTTP header)
    const cspHeader = generateCSPHeader(nonce, true);
    metaTag.setAttribute('content', cspHeader);

    // Add security headers via meta tags (only those that can be set via meta tags)
    const securityHeaders = [
      { name: 'X-Content-Type-Options', content: 'nosniff' },
      // Note: X-Frame-Options must be set via HTTP headers (now configured in vite.config.ts)
      { name: 'X-XSS-Protection', content: '1; mode=block' },
      { name: 'Referrer-Policy', content: 'strict-origin-when-cross-origin' }
    ];

    securityHeaders.forEach(({ name, content }) => {
      let existingTag = document.querySelector(`meta[http-equiv="${name}"]`) as HTMLMetaElement;
      if (!existingTag) {
        existingTag = document.createElement('meta');
        existingTag.setAttribute('http-equiv', name);
        document.head.appendChild(existingTag);
      }
      existingTag.setAttribute('content', content);
    });
  }, [nonce]);

  return null; // This component only manages meta tags
}