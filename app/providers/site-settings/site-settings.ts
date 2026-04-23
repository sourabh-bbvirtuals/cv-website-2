import type { QueryOptions } from '~/graphqlWrapper';
import { getCollectionBySlug } from '../collections/collections';

export interface PolicyLink {
  id: string;
  title: string;
  link: string;
  slug: string;
}

export interface Helpline {
  id: string;
  icon: string;
  text: string;
}

export interface SiteAddress {
  icon: string;
  text: string;
}

export interface SocialLink {
  id: string;
  icon: string;
  link: string;
}

export interface SubscribeYoutube {
  text: string;
  link: string;
}

export interface CompanyInfo {
  name?: string;
  logo?: string;
  description?: string;
  copyright?: string;
  supportEmail?: string;
  contactEmail?: string;
  paymentLogo?: string;
}

export interface WhatsappQuickConnect {
  name: string;
  phone: string;
  link: string;
}

export interface FeatureStrip {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export interface SiteSettingsData {
  logo?: string;
  policyLinks: PolicyLink[];
  helpline: Helpline[];
  address: SiteAddress;
  socialLinks: SocialLink[];
  subscribeYoutube: SubscribeYoutube;
  companyInfo?: CompanyInfo;
  whatsappQuickConnect: WhatsappQuickConnect;
}

export const DEFAULT_SITE_SETTINGS: SiteSettingsData = {
  logo: '/assets/logo.png',
  policyLinks: [
    {
      id: '1',
      title: 'Privacy & Terms',
      link: '#',
      slug: 'privacy-and-terms',
    },
    {
      id: '2',
      title: 'Refund and Return Policy',
      link: '#',
      slug: 'refund-and-return',
    },
  ],
  helpline: [
    {
      id: '1',
      icon: 'mail',
      text: 'support@commercevirtuals.com',
    },
    {
      id: '2',
      icon: 'phone',
      text: '+91 6291 040 600',
    },
  ],
  address: {
    icon: 'map-pin',
    text: 'Address',
  },
  socialLinks: [
    {
      id: 'youtube',
      icon: 'youtube',
      link: '#',
    },
    {
      id: 'instagram',
      icon: 'instagram',
      link: '#',
    },
    {
      id: 'twitter',
      icon: 'twitter',
      link: '#',
    },
    {
      id: 'facebook',
      icon: 'facebook',
      link: '#',
    },
  ],
  subscribeYoutube: {
    text: 'Subscribe Youtube channel',
    link: '#',
  },
  companyInfo: {
    name: 'Commerce Virtuals',
    logo: '/assets/logo.png',
    description: 'Best Online Commerce Classes',
    copyright: 'Copyright © 2026 Commerce Virtuals. All rights Reserved.',
    paymentLogo:
      'https://www.shift4shop.com/images/credit-card-logos/cc-sm-5.png',
  },
  whatsappQuickConnect: {
    name: 'Commerce Virtuals',
    phone: '916291040600',
    link: 'https://wa.me/916291040600?text=Hi+Commerce+Virtuals%2C+I%27d+like+to+know+more+about+courses.',
  },
};

export async function getSiteSettingsData(
  options: QueryOptions,
): Promise<SiteSettingsData | null> {
  try {
    // Try site-settings collection first
    const result = await getCollectionBySlug('site-settings', options);

    if (result.collection?.customFields?.customData) {
      const settingsData = JSON.parse(
        result.collection.customFields.customData,
      );
      return {
        logo: settingsData.logo,
        policyLinks: settingsData.policyLinks || [],
        helpline: settingsData.helpline || [],
        address: settingsData.address,
        socialLinks: settingsData.socialLinks || [],
        subscribeYoutube: settingsData.subscribeYoutube,
        companyInfo: settingsData.companyInfo,
        whatsappQuickConnect: settingsData.whatsappQuickConnect,
      };
    }

    console.log('⚠️ No site settings or store details found');
    return DEFAULT_SITE_SETTINGS;
  } catch (error) {
    console.log('❌ Error fetching site-settings collection:', error);
    return null;
  }
}
