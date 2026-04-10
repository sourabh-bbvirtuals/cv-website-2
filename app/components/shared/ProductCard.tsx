import { Star } from '~/components/shared/Icon';
import { useEffect, useState } from 'react';
import { Icon } from './Icon';
import { MessageCircleIcon, ImageIcon } from 'lucide-react';
import { ProcessedFacet } from '~/providers/products/productsWithFacets';

interface ProductCardProps {
  id: string;
  name?: string;
  slug?: string;
  image?: string;
  price?: {
    value?: number;
    min?: number;
    max?: number;
  };
  currency?: string;
  pricing: {
    current: string;
    original?: string;
  };
  faculty?: Array<{
    slug: string;
    name: string;
    image: string;
  }>;
  productFacets?: ProcessedFacet[];
  sellerSku?: string | null; // For additional product data
  onBuyNow?: (newTab: boolean) => void;
  gridFacets?: Array<string>;
  coverImage?: boolean;
  orderNumber: number;
  isFeatured: boolean;
  totalDiscount: number;
}

export function ProductCard({
  id,
  name,
  slug,
  price,
  currency,
  pricing,
  faculty,
  productFacets,
  sellerSku,
  onBuyNow,
  gridFacets = ['attempt', 'batch-type', 'product-type', 'language'],
  coverImage = false,
  image,
  orderNumber,
  isFeatured,
  totalDiscount,
}: ProductCardProps) {
  // Extract subject information from productFacets
  const subjectFacet = productFacets?.find(
    (facet) =>
      facet.code.toLowerCase() === 'subject' ||
      facet.name.toLowerCase().includes('subject'),
  );
  const subject = subjectFacet?.values || [];

  // Smooth right-to-left avatar carousel when there are more than 4 faculties
  const [slideIndex, setSlideIndex] = useState(0);
  const [instantReset, setInstantReset] = useState(false);
  const AVATAR_STEP_PX = 52; // 48px avatar + 4px gap (gap-1)
  const VISIBLE_COUNT = 4;

  useEffect(() => {
    if (!faculty || faculty.length <= VISIBLE_COUNT) return;
    const timer = setInterval(() => {
      setSlideIndex((prev) => {
        const next = prev + 1;
        // Use duplicated list for seamless loop; reset after one full original length
        if (next > faculty.length) {
          setInstantReset(true);
          return 0;
        }
        return next;
      });
    }, 2000);
    return () => clearInterval(timer);
  }, [faculty]);

  useEffect(() => {
    if (!instantReset) return;
    const t = setTimeout(() => setInstantReset(false), 50);
    return () => clearTimeout(t);
  }, [instantReset]);

  const formatPrice = (priceValue: number, currencyCode: string = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(priceValue);
  };

  // Get the display price (convert paise to rupees) - always show minimum price
  // const getDisplayPrice = (): string => {
  //   if (price) {
  //     if ('min' in price && price.min !== undefined) {
  //       // Price range: convert paise to rupees and get minimum price only
  //       // Subtract Rs. 1 from display price
  //       const minPriceInRupees = Math.max(0, Math.round(price.min / 100) - 1);
  //       return formatPrice(minPriceInRupees, currency);
  //     } else if ('value' in price && price.value !== undefined) {
  //       // Single price: convert paise to rupees
  //       // Subtract Rs. 1 from display price
  //       const priceInRupees = Math.max(0, Math.round(price.value / 100) - 1);
  //       return formatPrice(priceInRupees, currency);
  //     }
  //   }
  //   // If pricing.current is in paise, convert to rupees
  //   if (pricing && pricing.current) {
  //     const current = Number(pricing.current);
  //     if (!isNaN(current)) {
  //       // Subtract Rs. 1 from display price
  //       const priceInRupees = Math.max(0, Math.round(current / 100) - 1);
  //       return formatPrice(priceInRupees, currency);
  //     }
  //     return pricing.current;
  //   }
  //   return '0';
  // };

  const getSellingPrice = (): string => {
    if (price) {
      if ('min' in price && price.min !== undefined) {
        // Price range: convert paise to rupees and get minimum price only
        // Subtract Rs. 1 from display price
        const minPriceInRupees = Math.max(0, Math.round(price.min / 100) - 1);
        return formatPrice(minPriceInRupees - totalDiscount, currency);
      } else if ('value' in price && price.value !== undefined) {
        // Single price: convert paise to rupees
        // Subtract Rs. 1 from display price
        const priceInRupees = Math.max(0, Math.round(price.value / 100) - 1);
        return formatPrice(priceInRupees - totalDiscount, currency);
      }
    }
    return '0';
  };
  const getOriginalPrice = (): string => {
    if (price) {
      if ('min' in price && price.min !== undefined) {
        // Price range: convert paise to rupees and get minimum price only
        // Subtract Rs. 1 from display price
        const minPriceInRupees = Math.max(0, Math.round(price.min / 100) - 1);
        return formatPrice(minPriceInRupees, currency);
      } else if ('value' in price && price.value !== undefined) {
        // Single price: convert paise to rupees
        // Subtract Rs. 1 from display price
        const priceInRupees = Math.max(0, Math.round(price.value / 100) - 1);
        return formatPrice(priceInRupees, currency);
      }
    }
    return '0';
  };

  const handleWhatsApp = () => {
    if (!id || !slug) {
      console.warn('Product missing required fields for WhatsApp contact:', {
        id,
        slug,
      });
      return;
    }

    // Get WhatsApp configuration
    const phoneNumber = '917773977747'; // Default phone number
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const productUrl = `${baseUrl}/courses2/product/${slug}`;

    // Create message with product details
    const message = `Hi Commerce Virtuals, I am interested in this course and I want to get connected with you for more details and offerings. plz get back to me asap.

PID: ${id}
SKU: ${sellerSku || 'N/A'}
PRODUCT-URL: ${productUrl}`;

    // Open WhatsApp with the message
    window.open(
      `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`,
      '_blank',
    );
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow w-full flex flex-col relative">
      {/* Featured Badge */}
      {isFeatured && totalDiscount <= 0 && (
        <div className="absolute -top-2 right-2 z-10">
          <div className="bg-indigo-600 text-white px-2 py-1 rounded-full shadow-sm flex items-center gap-1">
            <Star className="h-3 w-3 fill-current" />
            <span className="text-[8px] font-medium">Featured</span>
          </div>
        </div>
      )}

      {totalDiscount > 0 && (
        <div className="absolute -top-2 right-2 z-10">
          <div className="bg-indigo-600 text-white px-2 py-1 rounded-full shadow-sm flex items-center gap-1">
            <Star className="h-3 w-3 fill-current" />
            <span className="text-[8px] font-medium">Offer</span>
          </div>
        </div>
      )}

      {/* Product Title */}
      <h3
        className="text-base font-semibold text-slate-900 mb-4 leading-tight"
        title={name || ''}
      >
        <span className="md:line-clamp-2 break-words">{name || ''}</span>
      </h3>

      {/* Key Details Grid */}
      {!coverImage && (
        <div className="grid grid-cols-2 gap-2 mb-8 h-[80px]">
          {gridFacets &&
            gridFacets.length > 0 &&
            productFacets &&
            gridFacets
              .map((gridFacet: string) => {
                // Find matching facet in productFacets
                const matchingFacet = productFacets.find(
                  (facet) =>
                    facet.code.replace('-cma', '').toLowerCase() ===
                      gridFacet.toLowerCase() ||
                    facet.name.toLowerCase() === gridFacet.toLowerCase(),
                );
                return matchingFacet;
              })
              .filter((item) => item !== undefined) // Remove items where no matching facet found
              .map((item) => {
                const isAttemptFacet =
                  (item.code && item.code.toLowerCase() === 'attempt') ||
                  (item.name && item.name.toLowerCase() === 'attempt');

                const formatAttempt = (label: string): string => {
                  // Expect formats like "May 2026" → "May'26"
                  const match = label.match(/^(\w+)\s+(\d{4})$/);
                  if (!match) return label;
                  const month = match[1];
                  const year = match[2].slice(-2);
                  return `${month}'${year}`;
                };

                const rawNames = item.values.map((value: any) => value.name);
                const shouldShorten = isAttemptFacet && item.values.length >= 3;
                const displayNames = shouldShorten
                  ? rawNames.map(formatAttempt)
                  : rawNames;

                const titleText = displayNames.join('/ ');

                return (
                  <div
                    key={item.name}
                    className="rounded-lg border border-slate-200 bg-slate-50 p-2 flex flex-col"
                  >
                    <p className="text-[11px] uppercase tracking-wide text-slate-500 mb-1 flex-shrink-0">
                      {item.name}
                    </p>
                    <p
                      className="text-[13px] font-medium text-slate-900 truncate flex-1"
                      title={titleText}
                    >
                      {titleText}
                    </p>
                  </div>
                );
              })}
        </div>
      )}
      {coverImage && (
        <div className="w-full h-[200px] overflow-hidden rounded-lg bg-slate-100">
          {image ? (
            <img
              src={image}
              alt={name || ''}
              className="w-full h-full object-fill"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="w-full h-[200px] flex items-center justify-center text-slate-400">
              <ImageIcon className="h-8 w-8" />
            </div>
          )}
        </div>
      )}
      {/* Instructor + Price */}
      <div className="flex items-center justify-between my-4 h-[70px]">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {faculty && faculty.length > 0 ? (
            faculty.length === 1 ? (
              // Single faculty: show image and name
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <img
                  src={faculty[0].image}
                  alt={faculty[0].name}
                  className="h-14 w-14 rounded-full object-cover flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {faculty[0].name}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {subject && subject.length > 0 ? (
                      <>
                        {subject[0].name}
                        {subject.length > 1 && (
                          <span
                            className="ml-1 text-[7px] font-normal text-slate-400 cursor-help"
                            title={`+${subject.length - 1} more: ${subject
                              .slice(1)
                              .map((s) => s.name)
                              .join(', ')}`}
                          >
                            +{subject.length - 1} more
                          </span>
                        )}
                      </>
                    ) : null}
                  </p>
                </div>
              </div>
            ) : // Multiple faculties: smooth RTL carousel when > 4, otherwise static
            faculty.length > 4 ? (
              <div className="min-w-0 flex-1">
                <div
                  className="overflow-hidden"
                  style={{ width: `${VISIBLE_COUNT * AVATAR_STEP_PX - 4}px` }}
                >
                  <div
                    className="flex gap-1"
                    style={{
                      transform: `translateX(-${
                        slideIndex * AVATAR_STEP_PX
                      }px)`,
                      transition: instantReset
                        ? 'none'
                        : 'transform 400ms ease-in-out',
                      willChange: 'transform',
                    }}
                  >
                    {[...faculty, ...faculty].map((f, index) => {
                      const isClone = index >= faculty.length;
                      return (
                        <img
                          key={`${f.slug || f.name}-${index}`}
                          src={f.image}
                          alt={f.name}
                          className="h-12 w-12 rounded-full object-cover flex-shrink-0 border border-slate-200"
                          title={isClone ? '' : f.name}
                          aria-hidden={isClone}
                          tabIndex={-1}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-1 min-w-0 flex-1">
                {faculty.slice(0, 4).map((f, index) => (
                  <img
                    key={f.slug || `${f.name}-${index}`}
                    src={f.image}
                    alt={f.name}
                    className="h-12 w-12 rounded-full object-cover flex-shrink-0 border border-slate-200"
                    title={f.name}
                  />
                ))}
              </div>
            )
          ) : null}
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-xs text-slate-500">Starting at</p>
          <p className="text-base font-bold text-slate-900">
            {getSellingPrice()}
          </p>
          {totalDiscount > 0 && (
            <p className="text-xs text-slate-500 line-through">
              {getOriginalPrice()}
            </p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 mb-4">
        <button
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 text-white px-3 py-2 text-sm font-medium hover:bg-indigo-700 transition-colors cursor-pointer"
          onClick={(e) => {
            if (e.ctrlKey || e.metaKey) {
              // Open in new tab
              e.preventDefault();
              onBuyNow?.(true);
            } else {
              // Normal click behavior
              onBuyNow?.(false);
            }
          }}
        >
          <Icon name="shopping-bag" size={14} className="h-4 w-4" />
          Buy Now
        </button>
        <button
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          onClick={handleWhatsApp}
        >
          <MessageCircleIcon className="h-4 w-4 text-emerald-600" />
          WhatsApp
        </button>
      </div>

      {/* Trust Badges */}
      {/* <div className="flex items-center justify-between text-xs text-slate-600">
        <div className="flex items-center gap-1">
          <Icon
            name="shield-check"
            size={14}
            className="h-3.5 w-3.5 text-slate-500"
          />
          <span>Verified</span>
        </div>
        <div className="flex items-center gap-1">
          <Icon name="clock" size={14} className="h-3.5 w-3.5 text-slate-500" />
          <span>Lifetime</span>
        </div>
        <div className="flex items-center gap-1">
          <Icon
            name="download"
            size={14}
            className="h-3.5 w-3.5 text-slate-500"
          />
          <span>Offline</span>
        </div>
      </div> */}
      {sellerSku && sellerSku.trim() !== '' && (
        <div className="mt-2">
          <span
            className="inline-block text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full border border-slate-200 truncate max-w-full"
            title={sellerSku}
          >
            {sellerSku}
          </span>
        </div>
      )}
    </div>
  );
}
