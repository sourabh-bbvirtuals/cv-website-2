/**
 * Generic utility to push events to window.dataLayer
 * window.dataLayer is already initialized in root.tsx via Google Tag Manager
 */

declare global {
  interface Window {
    dataLayer?: any[];
  }
}

/**
 * Push data to Google Analytics dataLayer
 * @param data - Any data object to push to dataLayer
 */
export const pushToDataLayer = (data: any) => {
  if (typeof window !== "undefined") {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(data);
  }
};

