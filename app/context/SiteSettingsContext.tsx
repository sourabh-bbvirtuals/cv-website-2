import React, { createContext, useContext, useEffect, useState } from 'react';
import { SiteSettingsData } from '~/providers/site-settings';

const SiteSettingsContext = createContext<{
  siteSettings: SiteSettingsData | null;
} | null>(null);

export const useSiteSettings = () => {
  const context = useContext(SiteSettingsContext);
  if (!context)
    throw new Error('useSiteSettings must be used inside SiteSettingsProvider');
  return context;
};

export const SiteSettingsProvider: React.FC<{
  settings: SiteSettingsData | null;
  children: React.ReactNode;
}> = ({ settings, children }) => {

  return (
    <SiteSettingsContext.Provider
      value={{ siteSettings: settings }}
    >
      {children}
    </SiteSettingsContext.Provider>
  );
};
