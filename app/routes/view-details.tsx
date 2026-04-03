import { MetaFunction, useLoaderData } from '@remix-run/react';
import { useState, useMemo, useEffect } from 'react';
import { DataFunctionArgs, json } from '@remix-run/server-runtime';
import { APP_META_TITLE } from '~/constants';
import Layout from '~/components/Layout';
import {
  DownloadIcon,
  SmartphoneIcon,
  MonitorIcon,
  LaptopIcon,
  AppleIcon,
  ExternalLinkIcon,
  ArrowLeftIcon,
  MessageCircleIcon,
  UsersIcon,
  FolderIcon,
  LinkIcon,
  CopyIcon,
  CheckIcon,
  FileTextIcon,
  BookOpenIcon,
} from 'lucide-react';
import { SocialIcon } from '~/components/shared/SocialIcons';
import { Link } from '@remix-run/react';
import { getOrderByCode } from '~/providers/orders/order';
import { getProductBySlug } from '~/providers/products';
import { ComboOrderResources } from '~/components/account/ComboOrderResources';

export const meta: MetaFunction = () => {
  return [
    {
      title: `View Details - ${APP_META_TITLE}`,
    },
    {
      name: 'description',
      content: 'View your order details and download links',
    },
  ];
};

export async function loader({ request }: DataFunctionArgs) {
  const url = new URL(request.url);
  const orderCode = url.searchParams.get('orderCode');

  if (!orderCode) {
    throw new Response('Order code is required', { status: 400 });
  }

  const order = await getOrderByCode(orderCode, { request });

  if (!order) {
    throw new Response('Order not found', { status: 404 });
  }
  const orderLines = order.lines;

  // Get unique product slugs from order lines
  const orderLinesData = orderLines.map((line: any) => {
    return {
      id: line.productVariant.product.id,
      title: line.productVariant.product.name,
      slug: line.productVariant.product.slug,
    };
  });

  // Get unique slugs to avoid duplicate API calls
  const uniqueSlugs = [...new Set(orderLinesData.map((item) => item.slug))];

  // Fetch all products by their slugs
  const allProducts = await Promise.all(
    uniqueSlugs.map((slug) => getProductBySlug(slug, { request })),
  );

  console.log('orderLinesData', JSON.stringify(orderLinesData, null, 2));
  console.log('allProducts', JSON.stringify(allProducts, null, 2));
  let isComboExistsInOrder = false;
  const productResources = allProducts.map((productQuery: any) => {
    const product = productQuery.product;
    const typeFacet = product?.facetValues?.find(
      (fv: any) => fv?.facet?.code?.toLowerCase() === 'type',
    );
    const facetTypeValue = typeFacet?.code || typeFacet?.name || null;

    // Safely parse additionalFeatures from customFields
    let additionalFeatures = null;
    try {
      if (product?.customFields?.additionalFeatures) {
        additionalFeatures =
          typeof product.customFields.additionalFeatures === 'string'
            ? JSON.parse(product.customFields.additionalFeatures)
            : product.customFields.additionalFeatures;
      }
    } catch (error) {
      console.error('Error parsing additionalFeatures:', error);
      additionalFeatures = null;
    }
    if (!isComboExistsInOrder) {
      isComboExistsInOrder = (facetTypeValue || '').toLowerCase() === 'combo';
    }
    return {
      id: product?.id,
      name: product?.name,
      slug: product?.slug,
      isCombo: (facetTypeValue || '').toLowerCase() === 'combo',
      otherLinks: additionalFeatures?.otherLinks || null,
      socialLinks: additionalFeatures?.socialLinks || null,
      singleProductAdditionalData:
        additionalFeatures?.singleProductAdditionalData || null,
    };
  });
  console.log('productResources', JSON.stringify(productResources, null, 2));

  return json({
    order,
    productResources,
    isComboExistsInOrder,
  });
}

export default function ViewDetails() {
  const { order, productResources, isComboExistsInOrder } =
    useLoaderData<typeof loader>();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Check if payment is settled
  const isPaymentSettled =
    order.state === 'PaymentSettled' ||
    order.state === 'PartiallyShipped' ||
    order.state === 'Shipped' ||
    order.state === 'Delivered' ||
    order.state === 'PartiallyDelivered' ||
    order.state === 'Fulfilled';

  // Extract combo product data for combo orders
  const comboProduct = isComboExistsInOrder
    ? productResources.find(
        (pr: any) => pr.isCombo && pr.singleProductAdditionalData,
      )
    : null;
  const comboProducts = comboProduct?.singleProductAdditionalData || [];

  // Generate per-line resources based on actual order data
  const perLineResources = (order.lines || []).map((line: any, idx: number) => {
    const productName =
      line.productVariant?.product?.name ||
      line.productVariant?.name ||
      `Product ${idx + 1}`;

    // Find the corresponding product resource for this line
    const productSlug = line.productVariant?.product?.slug;
    const productResource = productResources.find(
      (pr) => pr.slug === productSlug,
    );

    const otherLinks =
      productResource?.otherLinks?.map((otherLink: any) => {
        const formattedUrl = otherLink.url;
        return {
          title: otherLink.title,
          url: formattedUrl,
          icon: otherLink.title.toLowerCase(),
          description: otherLink.url,
          platform: otherLink.title,
        };
      }) || null;
    // Get product socialLinks
    const socialLinks =
      productResource?.socialLinks?.map((socialLink: any) => {
        let formattedUrl = socialLink.url;

        // Format URL based on platform
        if (!socialLink.url.startsWith('http')) {
          switch (socialLink.title.toLowerCase()) {
            case 'youtube':
              formattedUrl = socialLink.url.startsWith('https://youtube.com')
                ? socialLink.url
                : `https://youtube.com/${socialLink.url}`;
              break;
            case 'instagram':
              formattedUrl = socialLink.url.startsWith('http')
                ? socialLink.url
                : `https://${socialLink.url}`;
              break;
            case 'facebook':
              formattedUrl = socialLink.url.startsWith('http')
                ? socialLink.url
                : `https://${socialLink.url}`;
              break;
            case 'telegram':
              formattedUrl = socialLink.url.startsWith('http')
                ? socialLink.url
                : `https://${socialLink.url}`;
              break;
            case 'whatsapp':
              formattedUrl = socialLink.url.startsWith('http')
                ? socialLink.url
                : `https://${socialLink.url}`;
              break;
            default:
              formattedUrl = socialLink.url.startsWith('http')
                ? socialLink.url
                : `https://${socialLink.url}`;
          }
        }

        return {
          title: socialLink.title,
          url: formattedUrl,
          icon: socialLink.title.toLowerCase(),
          description: socialLink.url,
          platform: socialLink.title,
          type: 'study_group',
        };
      }) || null;

    return {
      lineId: line.id,
      productName,
      quantity: line.quantity,
      otherLinks,
      socialLinks,
    };
  });

  const appLinks =
    productResources.length > 0
      ? productResources.find(
          (productResource: any) => productResource.otherLinks?.length > 0,
        )?.otherLinks
      : [];
  const appDownloadLinks = Array.isArray(appLinks)
    ? appLinks.map((app: any) => {
        return {
          title: app.title,
          url: app.url,
          icon: app.title.toLowerCase(),
          description: app.url,
          platform: app.title.toLowerCase(),
          installGuideUrl: app.installGuideUrl,
        };
      })
    : null;
  // Determine grid columns for Apps based on count
  const appCount = appDownloadLinks ? appDownloadLinks.length : 0;
  const appsGridColsClass = `md:grid-cols-${appCount > 1 ? appCount : 1}`;

  const handleCopy = async (
    url: string,
    key: string,
    e?: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1500);
    } catch (err) {
      // no-op
    }
  };

  const getIconForPlatform = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'android':
        return <SmartphoneIcon className="w-6 h-6 text-indigo-600" />;
      case 'ios':
        return <AppleIcon className="w-6 h-6 text-indigo-600" />;
      case 'windows':
        return <MonitorIcon className="w-6 h-6 text-indigo-600" />;
      case 'macos':
        return <LaptopIcon className="w-6 h-6 text-indigo-600" />;
      default:
        return <DownloadIcon className="w-6 h-6 text-indigo-600" />;
    }
  };

  const getIconForSocialLink = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'whatsapp':
        return (
          <SocialIcon
            iconName="message-circle"
            className="w-6 h-6 text-green-500"
          />
        );
      case 'telegram':
        return (
          <SocialIcon
            iconName="message-circle"
            className="w-6 h-6 text-indigo-500"
          />
        );
      case 'instagram':
        return (
          <SocialIcon iconName="instagram" className="w-6 h-6 text-pink-500" />
        );
      case 'facebook':
        return (
          <SocialIcon iconName="facebook" className="w-6 h-6 text-indigo-600" />
        );
      case 'youtube':
        return (
          <SocialIcon iconName="youtube" className="w-6 h-6 text-red-500" />
        );
      case 'google drive':
        return <FolderIcon className="w-6 h-6 text-indigo-600" />;
      case 'discord':
        return <UsersIcon className="w-6 h-6 text-indigo-500" />;
      case 'twitter':
        return (
          <SocialIcon iconName="twitter" className="w-6 h-6 text-indigo-400" />
        );
      case 'linkedin':
        return (
          <SocialIcon iconName="linkedin" className="w-6 h-6 text-indigo-700" />
        );
      case 'tiktok':
        return <MessageCircleIcon className="w-6 h-6 text-black" />;
      case 'snapchat':
        return <MessageCircleIcon className="w-6 h-6 text-yellow-500" />;
      default:
        return <LinkIcon className="w-6 h-6 text-gray-600" />;
    }
  };

  return (
    <Layout>
      <div className="bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <Link
              to="/account/history"
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Back to Purchase History
            </Link>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Your Course Resources
                </h1>
                <p className="text-gray-600 mt-2">
                  Download apps and join study groups for your purchased course
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Order Number</p>
                <p className="text-xl xl:text-2xl font-bold text-lightgray">
                  #{order.id}
                </p>
              </div>
            </div>
          </div>

          {/* Coming Soon Message */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <LinkIcon className="w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Course Details Coming Soon
            </h3>
            <p className="text-gray-600 mb-4 max-w-md mx-auto">
              Your course resources, download links, and study group access will
              be available within{' '}
              <strong className="text-gray-900">24 to 48 hours</strong>.
            </p>
            <p className="text-sm text-gray-500">
              You will receive an email notification once your course details
              are ready. Thank you for your patience!
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <Link
              to="/account/history"
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Back to Purchase History
            </Link>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Your Course Resources
                </h1>
                <p className="text-gray-600 mt-2">
                  Download apps and join study groups for your purchased course
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Order Number</p>
                <p className="text-xl xl:text-2xl font-bold text-lightgray">
                  #{order.id}
                </p>
              </div>
            </div>
          </div>

          {/* Combo Order Resources (Tab View) */}
          {isPaymentSettled &&
            isComboExistsInOrder &&
            comboProducts.length > 0 && (
              <ComboOrderResources
                comboProducts={comboProducts}
                onCopy={handleCopy}
                copiedKey={copiedKey}
              />
            )}

          {/* Regular Order Resources (Non-Combo) */}
          {!isComboExistsInOrder && (
            <>
              {/* App Download Links */}
              {/* {isPaymentSettled && Array.isArray(appDownloadLinks) && appDownloadLinks?.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl xl:text-2xl font-bold text-lightgray">
                    Download Your Apps
                  </h2>
                  <p className="text-gray-700 mt-1">
                    Access your purchased content on your preferred platform.
                  </p>
                </div>
              </div>

              <div className="">
                <div className={`grid grid-cols-1 gap-4 ${appsGridColsClass}`}>
                  {appDownloadLinks?.map((app: any, index: number) => (
                    <a
                      key={index}
                      href={app.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex flex-col items-center text-center gap-3 p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all duration-200 bg-gradient-to-b from-white to-gray-50 hover:from-blue-50 hover:to-blue-100"
                    >
                      <div className="bg-white rounded-xl shadow-sm flex items-center justify-center border border-gray-200 group-hover:border-blue-300 group-hover:shadow-md transition-all duration-200 w-10 h-10">
                        {getIconForPlatform(app.platform)}
                      </div>
                      <div className="flex-1 w-full">
                        <h3 className="text-base font-semibold text-gray-900 group-hover:text-indigo-600 mb-1">
                          {app.title}
                        </h3>
                        {app.platform && (
                          <div className="mb-1">
                            <span className="inline-block px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] uppercase tracking-wide">
                              {app.platform}
                            </span>
                          </div>
                        )}
                        {app.description && (
                          <p className="text-xs text-gray-700 mb-2 leading-relaxed">
                            {app.description}
                          </p>
                        )}
                        <div className="flex items-center justify-center gap-2">
                          <a
                            href={app.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLinkIcon className="w-3.5 h-3.5" />
                            Open
                          </a>
                          {'installGuideUrl' in app &&
                            (app as any).installGuideUrl && (
                              <a
                                href={(app as any).installGuideUrl}
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
                            onClick={(e) =>
                              handleCopy(app.url, `app-${index}`, e)
                            }
                            className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-800"
                            aria-label="Copy app link"
                          >
                            {copiedKey === `app-${index}` ? (
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
                  ))}
                </div>
              </div>
            </div>
          )} */}
              {/* Resources by Product (per order line) */}
              {isPaymentSettled &&
                perLineResources.filter(
                  (res: any) => res.socialLinks && res.socialLinks.length > 0,
                ).length > 0 && (
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 mt-8">
                    <div className="mb-6">
                      <h2 className="text-xl xl:text-2xl font-bold text-lightgray">
                        Resources
                      </h2>
                      <p className="text-gray-700 mt-1">
                        Access your course resources and social links.
                      </p>
                    </div>
                    <div className="space-y-6">
                      {perLineResources
                        .filter(
                          (res: any) =>
                            res.socialLinks && res.socialLinks.length > 0,
                        )
                        .map((res: any) => (
                          <div
                            key={res.lineId}
                            className="border border-gray-200 rounded-xl p-4"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                  {res.productName}
                                </h3>
                              </div>
                            </div>
                            {res.socialLinks && res.socialLinks.length > 0 && (
                              <div className="mt-4">
                                <h4 className="text-sm font-medium text-gray-900 mb-2">
                                  Social Links
                                </h4>
                                <ul className="rounded-lg border border-gray-200 divide-y divide-gray-200 overflow-hidden bg-white">
                                  {res.socialLinks.map(
                                    (link: any, idx: number) => (
                                      <li key={`${res.lineId}-sg-${idx}`}>
                                        <a
                                          href={link.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors cursor-pointer"
                                        >
                                          <div className="flex items-center justify-center w-8 h-8 rounded-md border border-gray-200 bg-white flex-shrink-0">
                                            {getIconForSocialLink(
                                              link.platform,
                                            )}
                                          </div>
                                          <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2 min-w-0">
                                              <span className="text-sm font-semibold text-gray-900 truncate">
                                                {link.title}
                                              </span>
                                              {link.platform && (
                                                <span className="inline-block px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-[10px] uppercase tracking-wide flex-shrink-0 whitespace-nowrap">
                                                  {link.platform}
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                          <ExternalLinkIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                        </a>
                                      </li>
                                    ),
                                  )}
                                </ul>
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                )}

              {/* No Resources Available */}
              {(!Array.isArray(appDownloadLinks) ||
                appDownloadLinks?.length === 0) &&
                perLineResources.filter(
                  (res: any) => res.socialLinks && res.socialLinks.length > 0,
                ).length === 0 && (
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <LinkIcon className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No Resources Available
                    </h3>
                    <p className="text-gray-600 mb-4">
                      There are currently no download links or social links
                      available for this order.
                    </p>
                  </div>
                )}
            </>
          )}

          {/* No Resources Available for Combo Orders */}
          {isPaymentSettled &&
            isComboExistsInOrder &&
            comboProducts.length === 0 && (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <LinkIcon className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Resources Available
                </h3>
                <p className="text-gray-600 mb-4">
                  There are currently no download links or social links
                  available for this combo order.
                </p>
                <p className="text-sm text-gray-500">
                  Please contact support if you believe this is an error.
                </p>
              </div>
            )}
        </div>
      </div>
    </Layout>
  );
}
