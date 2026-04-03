/// <reference types="@remix-run/dev" />
/// <reference types="@cloudflare/workers-types" />

// Google Analytics gtag types
declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string | Date,
      config?: Record<string, any>
    ) => void;
  }
}

export {};
