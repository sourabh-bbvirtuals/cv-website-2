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


export interface WhatsappQuickConnect {
    name: string;
    phone: string;
    link: string;
}

export interface FooterData {
    logo?: string;
    policyLinks?: PolicyLink[];
    helpline?: Helpline[];
    address?: SiteAddress;
    socialLinks?: SocialLink[];
    subscribeYoutube?: SubscribeYoutube;
    whatsappQuickConnect?: WhatsappQuickConnect;
}

export const DEFAULT_SITE_SETTINGS: FooterData = {
    "logo": "/assets/logo.png",
    "policyLinks": [
        {
            "id": "1",
            "title": "Privacy & Terms",
            "link": "#",
            "slug": "privacy-and-terms"
        },
        {
            "id": "2",
            "title": "Refund and Return Policy",
            "link": "#",
            "slug": "refund-and-return"
        }
    ],
    "helpline": [
        {
            "id": "1",
            "icon": "mail",
            "text": "techsupport@gmail.com"
        },
        {
            "id": "2",
            "icon": "phone",
            "text": "+91 9999999999"
        }
    ],
    "address": {
        "icon": "map-pin",
        "text": "Address"
    },
    "socialLinks": [
        {
            "id": "youtube",
            "icon": "youtube",
            "link": "#"
        },
        {
            "id": "instagram",
            "icon": "instagram",
            "link": "#"
        },
        {
            "id": "twitter",
            "icon": "twitter",
            "link": "#"
        },
        {
            "id": "facebook",
            "icon": "facebook",
            "link": "#"
        }
    ],
    "subscribeYoutube": {
        "text": "Subscribe Youtube channel",
        "link": "#"
    },
    "whatsappQuickConnect": {
        "name": "Commerce Virtuals",
        "phone": "919999999999",
        "link": "https://wa.me/919999999999?text=Hi+Commerce+Virtuals%2C+I%27d+like+to+know+more+about+courses."
    }
};

export async function getFooterData(
    options: QueryOptions,
): Promise<FooterData | null> {
    try {
        const result = await getCollectionBySlug('footer', options);

        if (result.collection?.customFields?.customData) {
            const footerData = JSON.parse(result.collection.customFields.customData);
            return {
                logo: footerData.logo || "",
                policyLinks: footerData.policyLinks || [],
                helpline: footerData.helpline || [],
                address: footerData.address,
                socialLinks: footerData.socialLinks || [],
                subscribeYoutube: footerData.subscribeYoutube,
                whatsappQuickConnect: footerData.whatsappQuickConnect,
            };
        }
        return DEFAULT_SITE_SETTINGS;
    } catch (error) {
        console.log('❌ Error fetching site-settings collection:', error);
        return null;
    }
}
