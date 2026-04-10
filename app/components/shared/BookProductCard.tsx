import { MessageCircleIcon, ImageIcon } from 'lucide-react';
import { ProcessedFacet } from '~/providers/products/productsWithFacets';

interface BookProductCardProps {
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
  sellerSku?: string | null;
  totalDiscount: number;
  onBuyNow?: (newTab: boolean) => void;
}

export function BookProductCard({
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
  image,
  totalDiscount,
}: BookProductCardProps) {
  const formatPrice = (priceValue: number, currencyCode: string = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(priceValue);
  };

  // Get the display price (convert paise to rupees) - always show minimum price
  // const getDisplayPrice = () => {
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
    const message = `Hi Commerce Virtuals, I am interested in this book and I want to get connected with you for more details and offerings. plz get back to me asap.

PID: ${id}
SKU: ${sellerSku || 'N/A'}
PRODUCT-URL: ${productUrl}`;

    // Open WhatsApp with the message
    window.open(
      `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`,
      '_blank',
    );
  };

  // Extract faculty name for author display
  const author = faculty && faculty.length > 0 ? faculty[0].name : '';

  return (
    <div className="bg-[#FBFAF9] border border-[#E8E8E8] rounded-xl p-0 flex flex-col h-full">
      {/* Book Cover Image */}
      <div className="w-full h-48 rounded-t-lg overflow-hidden bg-[#F4F4F4]">
        {image ? (
          <img
            src={image}
            alt={name || ''}
            className="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">
            <ImageIcon className="h-12 w-12" />
          </div>
        )}
      </div>

      {/* Book Details */}
      <div className="space-y-1 px-3 pt-3 pb-2 flex-grow">
        <h3 className="font-bold text-black text-center text-sm leading-tight line-clamp-2">
          {name || ''}
        </h3>
        {author && (
          <p className="text-xs text-[#787878] text-center">{author}</p>
        )}
        {/* <p className="text-sm text-center font-bold text-[#1E88E5]">
          {getDisplayPrice()}
        </p> */}
        <div className="flex items-center justify-center gap-2">
          {totalDiscount > 0 && (
            <p className="text-xs text-center text-slate-500 line-through">
              {getOriginalPrice()}
            </p>
          )}
          <p className="text-sm text-center font-bold text-[#1E88E5]">
            {getSellingPrice()}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 px-3 mb-3">
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
          View Details
        </button>
        <button
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          onClick={handleWhatsApp}
        >
          <MessageCircleIcon className="h-4 w-4 text-emerald-600" />
          WhatsApp
        </button>
      </div>

      {/* SKU Badge */}
      {sellerSku && sellerSku.trim() !== '' && (
        <div className="px-3 mb-3">
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
