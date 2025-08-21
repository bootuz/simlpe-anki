import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    // Configure security headers for development server
    headers: {
      // More permissive CSP for development
      'Content-Security-Policy': mode === 'development' 
        ? "default-src 'self' *.lovable.app *.lovable.dev *.sandbox.lovable.dev; script-src 'self' 'unsafe-inline' 'unsafe-eval' *.lovable.app *.lovable.dev *.sandbox.lovable.dev; style-src 'self' 'unsafe-inline' *.lovable.app *.lovable.dev *.sandbox.lovable.dev; img-src 'self' data: https: *.lovable.app *.lovable.dev *.sandbox.lovable.dev; font-src 'self' data: *.lovable.app *.lovable.dev *.sandbox.lovable.dev; connect-src 'self' https://ibukptkjdbsbsnizyoyr.supabase.co wss://ibukptkjdbsbsnizyoyr.supabase.co *.lovable.app *.lovable.dev *.sandbox.lovable.dev ws: wss:; frame-src 'self' *.lovable.app *.lovable.dev *.sandbox.lovable.dev; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self' *.lovable.app *.lovable.dev *.sandbox.lovable.dev;"
        : "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://ibukptkjdbsbsnizyoyr.supabase.co wss://ibukptkjdbsbsnizyoyr.supabase.co; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self' *.lovable.app *.lovable.dev *.sandbox.lovable.dev;",
      // Security headers that must be set via HTTP headers
      'X-Frame-Options': mode === 'development' ? 'ALLOWALL' : 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      // Additional security headers
      'Strict-Transport-Security': mode === 'production' ? 'max-age=31536000; includeSubDomains' : undefined,
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
    }
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
