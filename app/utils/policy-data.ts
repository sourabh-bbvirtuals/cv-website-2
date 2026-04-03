import type { QueryOptions } from '~/graphqlWrapper';
import { getCollectionBySlug } from '~/providers/collections/collections';

export interface PolicyBlock {
  title: string;
  text: string;
}

export interface PolicyData {
  title: string;
  blocks: PolicyBlock[];
}

const FALLBACK_POLICIES: Record<string, PolicyData> = {
  'privacy-and-terms': {
    title: 'Privacy Policy & Terms of Use',
    blocks: [
      {
        title: 'Introduction',
        text: 'Shubham Agrawal Classes ("we", "us", or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or purchase our courses. By using our services, you agree to the terms outlined in this policy.',
      },
      {
        title: 'Information We Collect',
        text: 'We collect personal information that you voluntarily provide when registering on our platform, placing an order, or contacting us. This includes your name, email address, phone number, billing address, and payment details. We also automatically collect certain technical data such as your IP address, browser type, device information, and usage patterns through cookies and similar technologies.',
      },
      {
        title: 'How We Use Your Information',
        text: 'We use the information we collect to: process and fulfill your course orders; provide access to purchased lectures, books, and study materials; send order confirmations, updates, and support communications; improve our website, courses, and overall user experience; comply with legal obligations and prevent fraud.',
      },
      {
        title: 'Data Security',
        text: 'We implement industry-standard security measures including SSL encryption, secure payment gateways, and restricted access controls to protect your personal information. However, no method of electronic transmission or storage is 100% secure, and we cannot guarantee absolute security.',
      },
      {
        title: 'Third-Party Services',
        text: 'We may share your information with trusted third-party service providers who assist us in operating our website, processing payments, and delivering courses. These providers are contractually obligated to keep your information confidential and use it only for the purposes we specify. We do not sell or rent your personal information to third parties.',
      },
      {
        title: 'Cookies',
        text: 'Our website uses cookies to enhance your browsing experience, analyze site traffic, and personalize content. You can control cookie preferences through your browser settings. Disabling cookies may affect certain features of our website.',
      },
      {
        title: 'Your Rights',
        text: 'You have the right to access, update, or delete your personal information at any time by contacting us. You may also opt out of marketing communications by using the unsubscribe link in our emails or by contacting our support team.',
      },
      {
        title: 'Terms of Use',
        text: 'All content on this platform, including video lectures, study materials, books, and test series, is the intellectual property of Shubham Agrawal Classes. Unauthorized copying, redistribution, screen recording, or sharing of any course content is strictly prohibited and may result in legal action. Your access to purchased courses is for personal use only and is non-transferable.',
      },
      {
        title: 'Changes to This Policy',
        text: 'We reserve the right to update this Privacy Policy at any time. Changes will be posted on this page with a revised effective date. Your continued use of our services after any changes constitutes your acceptance of the updated policy.',
      },
      {
        title: 'Contact Us',
        text: 'If you have any questions or concerns about this Privacy Policy or our data practices, please contact us through the support section on our website or reach out via WhatsApp.',
      },
    ],
  },
  'refund-and-return': {
    title: 'Refund & Return Policy',
    blocks: [
      {
        title: 'No Refund / No Return Policy',
        text: 'All sales made on Shubham Agrawal Classes are final. We do not offer refunds, returns, or exchanges on any purchases, including but not limited to video lectures, books, study materials, test series, and mentorship programs.',
      },
      {
        title: 'Why No Refunds?',
        text: 'Our products are digital in nature. Once a course or study material is purchased and access is granted, the content is immediately available for viewing or download. Due to the nature of digital goods, it is not possible to "return" them. Therefore, all purchases are non-refundable.',
      },
      {
        title: 'Before You Purchase',
        text: 'We encourage all students to carefully review the course details, syllabus, demo lectures (where available), and batch features before making a purchase. If you have any questions about a course or product, please reach out to our support team before placing your order.',
      },
      {
        title: 'Exceptional Circumstances',
        text: 'In rare cases such as duplicate payments or technical errors during the transaction, please contact our support team within 48 hours of the transaction with your order details and proof of payment. We will review and resolve such issues on a case-by-case basis at our sole discretion.',
      },
      {
        title: 'Course Access Issues',
        text: 'If you face any technical difficulties accessing your purchased course, our support team is available to help resolve the issue. Access-related problems do not qualify for a refund but will be addressed promptly to ensure uninterrupted learning.',
      },
      {
        title: 'Contact Us',
        text: 'For any queries related to your purchase or this policy, please reach out to our support team through the website or via WhatsApp. We are committed to resolving your concerns as quickly as possible.',
      },
    ],
  },
};

let policyDataCache: Record<string, PolicyData> | null = null;

export async function getPolicyBySlug(
  slug: string,
  options: QueryOptions,
): Promise<PolicyData | null> {
  try {
    if (policyDataCache && policyDataCache[slug]) {
      return policyDataCache[slug];
    }

    const result = await getCollectionBySlug(slug, options);
    if (
      result.collection?.__typename === 'Collection' &&
      result.collection?.customFields?.customData
    ) {
      const parsed = JSON.parse(result.collection.customFields.customData);
      if (parsed.blocks && parsed.blocks.length > 0) {
        const policy: PolicyData = {
          title: parsed.title || result.collection.name || slug,
          blocks: parsed.blocks,
        };
        if (!policyDataCache) policyDataCache = {};
        policyDataCache[slug] = policy;
        return policy;
      }
    }

    if (FALLBACK_POLICIES[slug]) {
      return FALLBACK_POLICIES[slug];
    }

    return null;
  } catch (error) {
    console.error('Error fetching policy data:', error);
    if (FALLBACK_POLICIES[slug]) {
      return FALLBACK_POLICIES[slug];
    }
    return null;
  }
}
