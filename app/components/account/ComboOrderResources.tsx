import React, { useState } from 'react';
import {
  DownloadIcon,
  SmartphoneIcon,
  MonitorIcon,
  LaptopIcon,
  AppleIcon,
  ExternalLinkIcon,
  CopyIcon,
  CheckIcon,
  BookOpenIcon,
  LinkIcon,
  MessageCircleIcon,
  UsersIcon,
  FolderIcon,
} from 'lucide-react';
import { SocialIcon } from '~/components/shared/SocialIcons';

interface ComboProduct {
  title: string;
  sku?: string;
  subject?: string;
  otherLinks?: Array<{ title: string; url: string; installGuideUrl?: string }>;
  socialLinks?: Array<{ title: string; url: string }>;
}

interface ComboOrderResourcesProps {
  comboProducts: ComboProduct[];
  onCopy: (url: string, key: string, e?: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  copiedKey: string | null;
}

export function ComboOrderResources({
  comboProducts,
  onCopy,
  copiedKey,
}: ComboOrderResourcesProps) {
  const [activeTab, setActiveTab] = useState(0);

  const getIconForPlatform = (platform: string) => {
    const platformLower = platform.toLowerCase();
    if (platformLower.includes('android') || platformLower.includes('mobile')) {
      return <SmartphoneIcon className="w-6 h-6 text-indigo-600" />;
    }
    if (platformLower.includes('ios') || platformLower.includes('iphone') || platformLower.includes('apple')) {
      return <AppleIcon className="w-6 h-6 text-indigo-600" />;
    }
    if (platformLower.includes('windows') || platformLower.includes('laptop')) {
      return <MonitorIcon className="w-6 h-6 text-indigo-600" />;
    }
    if (platformLower.includes('macos') || platformLower.includes('mac')) {
      return <LaptopIcon className="w-6 h-6 text-indigo-600" />;
    }
    return <DownloadIcon className="w-6 h-6 text-indigo-600" />;
  };

  const getIconForSocialLink = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'whatsapp':
        return <SocialIcon iconName="message-circle" className="w-6 h-6 text-green-500" />;
      case 'telegram':
        return <SocialIcon iconName="message-circle" className="w-6 h-6 text-indigo-500" />;
      case 'instagram':
        return <SocialIcon iconName="instagram" className="w-6 h-6 text-pink-500" />;
      case 'facebook':
        return <SocialIcon iconName="facebook" className="w-6 h-6 text-indigo-600" />;
      case 'youtube':
        return <SocialIcon iconName="youtube" className="w-6 h-6 text-red-500" />;
      case 'google drive':
        return <FolderIcon className="w-6 h-6 text-indigo-600" />;
      case 'discord':
        return <UsersIcon className="w-6 h-6 text-indigo-500" />;
      case 'twitter':
        return <SocialIcon iconName="twitter" className="w-6 h-6 text-indigo-400" />;
      case 'linkedin':
        return <SocialIcon iconName="linkedin" className="w-6 h-6 text-indigo-700" />;
      case 'tiktok':
        return <MessageCircleIcon className="w-6 h-6 text-black" />;
      case 'snapchat':
        return <MessageCircleIcon className="w-6 h-6 text-yellow-500" />;
      default:
        return <LinkIcon className="w-6 h-6 text-gray-600" />;
    }
  };

  const formatSocialUrl = (url: string, title: string): string => {
    if (!url) return url;
    if (url.startsWith('http')) return url;
    
    const titleLower = title.toLowerCase();
    switch (titleLower) {
      case 'youtube':
        if (url.startsWith('https://youtube.com') || url.startsWith('https://www.youtube.com')) {
          return url;
        }
        // Handle YouTube @username format
        if (url.startsWith('@')) {
          return `https://youtube.com/${url}`;
        }
        return `https://youtube.com/${url}`;
      case 'instagram':
        return `https://${url}`;
      case 'facebook':
        return `https://${url}`;
      case 'telegram':
        return url.startsWith('https://') || url.startsWith('http://') ? url : `https://${url}`;
      case 'whatsapp':
        return url.startsWith('https://') || url.startsWith('http://') ? url : `https://${url}`;
      default:
        return `https://${url}`;
    }
  };

  const getPlatformFromTitle = (title: string): string => {
    const titleLower = title.toLowerCase();
    if (titleLower.includes('android') || titleLower.includes('mobile')) return 'android';
    if (titleLower.includes('ios') || titleLower.includes('iphone') || titleLower.includes('apple')) return 'ios';
    if (titleLower.includes('windows') || titleLower.includes('laptop')) return 'windows';
    if (titleLower.includes('macos') || titleLower.includes('mac')) return 'macos';
    return 'download';
  };

  if (!comboProducts || comboProducts.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 flex flex-wrap">
        {comboProducts.map((product, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(index)}
            className={`px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === index
                ? 'text-gray-900 border-b-2 border-gray-900'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Product {index + 1}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {comboProducts.map((product, index) => {
        const hasOtherLinks = product.otherLinks && product.otherLinks.length > 0;
        const hasSocialLinks = product.socialLinks && product.socialLinks.length > 0;
        const hasContent = hasOtherLinks || hasSocialLinks;

        if (!hasContent && activeTab === index) {
          return (
            <div key={index} className={activeTab === index ? 'block' : 'hidden'}>
              <div className="p-8 space-y-4">
                {/* Product Title */}
                {product.title && (
                  <div className="border-b border-gray-200 pb-4 text-left">
                    <h3 className="text-xl font-semibold text-gray-900">{product.title}</h3>
                    {product.subject && (
                      <p className="text-base text-gray-700 my-2 font-medium">Subject: {product.subject}</p>
                    )}
                    {product.sku && (
                      <p className="text-sm text-gray-600 mt-1">SKU: {product.sku}</p>
                    )}
                  </div>
                )}
                <div className="text-center pt-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <LinkIcon className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No Resources Available
                  </h3>
                  <p className="text-gray-600">
                    There are currently no download links or social links available for this product.
                  </p>
                </div>
              </div>
            </div>
          );
        }

        return (
          <div key={index} className={activeTab === index ? 'block' : 'hidden'}>
            <div className="p-8 space-y-8">
              {/* Product Title */}
              {product.title && (
                <div className="border-b border-gray-200 pb-4">
                  <h3 className="text-xl font-semibold text-gray-900">{product.title}</h3>
                  {product.subject && (
                    <p className="text-base text-gray-700 mt-2 font-medium">Subject: {product.subject}</p>
                  )}
                  {product.sku && (
                    <p className="text-sm text-gray-600 mt-1">SKU: {product.sku}</p>
                  )}
                </div>
              )}

              {/* App Download Links (otherLinks) */}
              {hasOtherLinks && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    Download Links
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {product.otherLinks!.map((link, linkIndex) => {
                      const platform = getPlatformFromTitle(link.title);
                      const uniqueKey = `combo-${index}-other-${linkIndex}`;
                      
                      return (
                        <a
                          key={linkIndex}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex flex-col items-center text-center gap-3 p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all duration-200 bg-gradient-to-b from-white to-gray-50 hover:from-blue-50 hover:to-blue-100"
                        >
                          <div className="bg-white rounded-xl shadow-sm flex items-center justify-center border border-gray-200 group-hover:border-blue-300 group-hover:shadow-md transition-all duration-200 w-10 h-10">
                            {getIconForPlatform(link.title)}
                          </div>
                          <div className="flex-1 w-full">
                            <h5 className="text-base font-semibold text-gray-900 group-hover:text-indigo-600 mb-1">
                              {link.title}
                            </h5>
                            <div className="flex items-center justify-center gap-2 mt-2">
                              <a
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <ExternalLinkIcon className="w-3.5 h-3.5" />
                                Open
                              </a>
                              {link.installGuideUrl && (
                                <a
                                  href={link.installGuideUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-800"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <BookOpenIcon className="w-3.5 h-3.5" />
                                  Install Steps
                                </a>
                              )}
                              <button
                                type="button"
                                onClick={(e) => onCopy(link.url, uniqueKey, e)}
                                className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-800"
                                aria-label="Copy link"
                              >
                                {copiedKey === uniqueKey ? (
                                  <>
                                    <CheckIcon className="w-3.5 h-3.5 text-green-600" />
                                    Copied
                                  </>
                                ) : (
                                  <>
                                    <CopyIcon className="w-3.5 h-3.5" />
                                    Copy Link
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Social Links */}
              {hasSocialLinks && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    Social Links
                  </h4>
                  <ul className="rounded-lg border border-gray-200 divide-y divide-gray-200 overflow-hidden bg-white">
                    {product.socialLinks!.map((link, linkIndex) => {
                      const formattedUrl = formatSocialUrl(link.url, link.title);

                      return (
                        <li key={linkIndex}>
                          <a
                            href={formattedUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors cursor-pointer"
                          >
                            <div className="flex items-center justify-center w-8 h-8 rounded-md border border-gray-200 bg-white flex-shrink-0">
                              {getIconForSocialLink(link.title)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="text-sm font-semibold text-gray-900 truncate">
                                  {link.title}
                                </span>
                                <span className="inline-block px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-[10px] uppercase tracking-wide flex-shrink-0 whitespace-nowrap">
                                  {link.title}
                                </span>
                              </div>
                            </div>
                            <ExternalLinkIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

