import { VendureCourse2Product } from '~/providers/course2';
import { useEffect, useMemo, useState } from 'react';
import {
  ReceiptIcon,
  CheckIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  TagIcon,
} from 'lucide-react';

interface ProductSummaryProps {
  product: VendureCourse2Product;
  attempt?: string;
  formData: Record<string, string>; // Dynamic form data based on actual fields
  onAddToCart: () => void;
  isAddingToCart?: boolean;
  addToCartSuccess?: boolean;
  onCartClick?: () => void;
  totalPrice: number;
  validationErrors?: Record<string, string>;
}

export function ProductSummary({
  attempt,
  product,
  formData,
  onAddToCart,
  isAddingToCart = false,
  addToCartSuccess = false,
  onCartClick,
  totalPrice,
  validationErrors = {},
}: ProductSummaryProps) {
  // Helper function to check if all prerequisites are met (mobile, attempt, and options/variant)
  const canShowVariantAndPrice = () => {
    // Check mobile number (must be 10 digits)
    const mobileValid = formData.mobile && formData.mobile.length === 10;

    // Check attempt is selected
    const attemptSelected = formData.attempt && formData.attempt.trim() !== '';

    if (!mobileValid || !attemptSelected) {
      return false;
    }

    // For combo products, check if variant is selected
    if (product.facetProperties?.type?.value?.toLowerCase() === 'combo') {
      return !!formData.selectedVariant;
    }

    // For non-combo products, check if all options are selected
    const allOptionsSelected = product.optionProperties.every(
      (optionProperty) =>
        formData[`option_${optionProperty.id}`] &&
        formData[`option_${optionProperty.id}`].trim() !== '',
    );

    return allOptionsSelected;
  };

  // Helper function to get selected variant
  const getSelectedVariant = () => {
    // For combo products, use direct variant selection
    if (product.facetProperties?.type?.value?.toLowerCase() === 'combo') {
      if (!formData.selectedVariant) return null;
      return product.variantProperties.find(
        (v) => v.id === formData.selectedVariant,
      );
    }

    // For non-combo products, use option combinations
    const selectedOptionIds = product.optionProperties
      .map((optionProperty) => formData[`option_${optionProperty.id}`])
      .filter(Boolean);

    if (selectedOptionIds.length === 0) return null;

    // Find variant that matches all selected options
    return product.variantProperties.find((variant) => {
      const variantOptionIds = variant.options.map((option) => option.id);
      return selectedOptionIds.every((selectedId) =>
        variantOptionIds.includes(selectedId),
      );
    });
  };

  // Helper function to format price in rupees
  const formatPrice = (price: number, reduceByOne: boolean = false) => {
    // Subtract Rs. 1 from display price
    const adjustedPrice = reduceByOne
      ? Math.max(0, price - 1)
      : Math.max(0, price);
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(adjustedPrice);
  };

  // Calculate min/max price from all variants for the "starting from" display
  const allVariantPrices = product.variantProperties
    .map((v) => (v.priceWithTax ? Math.round(v.priceWithTax / 100) : 0))
    .filter((p) => p > 0);
  const minVariantPrice =
    allVariantPrices.length > 0 ? Math.min(...allVariantPrices) : 0;
  const maxVariantPrice =
    allVariantPrices.length > 0 ? Math.max(...allVariantPrices) : 0;

  // Calculate selected variant price
  const [variantPrice, setVariantPrice] = useState(0);
  const totalOfferDiscount = useMemo(() => {
    if (!product?.offers || product.offers.length === 0) return 0;
    console.log('product.offers', product.offers);

    // Use variantPrice as base price for percentage discount calculation
    const basePrice = variantPrice;

    return product.offers?.reduce((sum, offer) => {
      if (
        offer?.discountType?.toLowerCase() === 'percentage' &&
        offer?.discountValue
      ) {
        // Calculate percentage discount: (discountValue / 100) * basePrice
        const percentageDiscount = (offer.discountValue / 100) * basePrice;
        return sum + percentageDiscount;
      } else {
        // Fixed discount: use discountAmount directly
        return sum + (offer?.discountAmount || 0);
      }
    }, 0);
  }, [product?.offers, variantPrice]);

  useEffect(() => {
    let price = 0;
    const selectedVariant = getSelectedVariant();

    if (selectedVariant && selectedVariant.priceWithTax) {
      price = Math.round(selectedVariant.priceWithTax / 100);
    }

    setVariantPrice(price);
  }, [formData, product]);

  const isVariantPriceReady = canShowVariantAndPrice() && variantPrice > 0;
  const finalDisplayPrice = isVariantPriceReady
    ? Math.max(0, totalPrice - totalOfferDiscount)
    : null;

  // Button rendering logic (shared between combo and non-combo)
  const renderAddToCartButton = () => {
    if (product.facetProperties?.type?.value?.toLowerCase() === 'combo') {
      const isVariantSelected = !!formData.selectedVariant;
      return (
        <button
          onClick={onAddToCart}
          disabled={isAddingToCart || !isVariantSelected}
          className={`w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-white text-sm font-semibold transition-colors ${
            isAddingToCart || !isVariantSelected
              ? 'bg-neutral-400 cursor-not-allowed'
              : addToCartSuccess
              ? 'bg-green-600 hover:bg-green-700'
              : 'bg-slate-900 hover:bg-slate-800'
          }`}
        >
          {isAddingToCart ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Adding...
            </>
          ) : addToCartSuccess ? (
            <>
              <CheckIcon className="w-4 h-4" />
              Added to Cart!
            </>
          ) : !isVariantSelected ? (
            <>
              <ShoppingBagIcon className="w-4 h-4" />
              Select Variant
            </>
          ) : (
            <>
              <ShoppingBagIcon className="w-4 h-4" />
              Add To Cart
            </>
          )}
        </button>
      );
    } else {
      const allOptionsSelected = product.optionProperties.every(
        (optionProperty) =>
          formData[`option_${optionProperty.id}`] &&
          formData[`option_${optionProperty.id}`].trim() !== '',
      );

      return (
        <button
          onClick={onAddToCart}
          disabled={isAddingToCart || !allOptionsSelected}
          className={`w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-white text-sm font-semibold transition-colors ${
            isAddingToCart || !allOptionsSelected
              ? 'bg-neutral-400 cursor-not-allowed'
              : addToCartSuccess
              ? 'bg-green-600 hover:bg-green-700'
              : 'bg-slate-900 hover:bg-slate-800'
          }`}
        >
          {isAddingToCart ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Adding...
            </>
          ) : addToCartSuccess ? (
            <>
              <CheckIcon className="w-4 h-4" />
              Added to Cart!
            </>
          ) : !allOptionsSelected ? (
            <>
              <ShoppingBagIcon className="w-4 h-4" />
              Select All Options
            </>
          ) : (
            <>
              <ShoppingBagIcon className="w-4 h-4" />
              Add To Cart
            </>
          )}
        </button>
      );
    }
  };

  return (
    <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
      {/* ── Price Hero – always visible ── */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-700 px-5 py-5 text-white">
        {isVariantPriceReady && finalDisplayPrice !== null ? (
          <>
            <div className="text-xs font-medium uppercase tracking-wider text-slate-400 mb-1">
              Your Price
            </div>
            <div className="text-4xl font-bold tracking-tight">
              {formatPrice(finalDisplayPrice)}
            </div>
            {totalOfferDiscount > 0 && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm text-slate-400 line-through">
                  {formatPrice(variantPrice, true)}
                </span>
                <span className="inline-flex items-center gap-1 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full font-medium">
                  <TagIcon className="w-3 h-3" />-
                  {formatPrice(totalOfferDiscount)} off
                </span>
              </div>
            )}
          </>
        ) : minVariantPrice > 0 ? (
          <>
            <div className="text-xs font-medium uppercase tracking-wider text-slate-400 mb-1">
              {allVariantPrices.length > 1 &&
              minVariantPrice !== maxVariantPrice
                ? 'Starting from'
                : 'Price'}
            </div>
            <div className="text-4xl font-bold tracking-tight">
              {formatPrice(minVariantPrice, true)}
              {allVariantPrices.length > 1 &&
                minVariantPrice !== maxVariantPrice && (
                  <span className="text-2xl font-semibold text-slate-300">
                    {' '}
                    – {formatPrice(maxVariantPrice, true)}
                  </span>
                )}
            </div>
            <div className="mt-2 text-xs text-slate-400">
              Fill the form to confirm your exact price
            </div>
          </>
        ) : (
          <div className="text-sm text-slate-400">
            Select options to see pricing
          </div>
        )}
      </div>

      {/* ── Order Details ── */}
      <div className="px-5 py-4">
        <div className="flex items-center gap-2 mb-3">
          <ReceiptIcon className="w-4 h-4 text-neutral-500" />
          <span className="text-sm font-semibold text-neutral-700">
            Order Details
          </span>
        </div>

        <dl className="text-sm space-y-2">
          {/* Display facet properties */}
          {Object.entries(product.facetProperties).map(([key, facet]) =>
            (key === 'attempt' || key === 'attempt-cma') && attempt ? (
              <div
                key={key}
                className="grid grid-cols-[1fr_auto] items-center gap-3"
              >
                <dt className="text-neutral-500">{facet.name}</dt>
                <dd className="font-medium text-neutral-900 text-right">
                  {attempt}
                </dd>
              </div>
            ) : (
              <div
                key={key}
                className="grid grid-cols-[1fr_auto] items-center gap-3"
              >
                <dt className="text-neutral-500">{facet.name}</dt>
                <dd className="font-medium text-neutral-900 text-right">
                  {facet.value}
                </dd>
              </div>
            ),
          )}

          {/* Display selected options or variant for combo products */}
          {product.facetProperties?.type?.value?.toLowerCase() === 'combo' ? (
            canShowVariantAndPrice() ? (
              <div className="grid grid-cols-[1fr_auto] items-center gap-3">
                <dt className="text-neutral-500">Variant</dt>
                <dd className="text-right">
                  {formData.selectedVariant ? (
                    <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                      <span className="mr-1">✅</span>
                      {getSelectedVariant()?.name || 'Selected'}
                      {variantPrice > 0 && (
                        <span className="ml-1 text-green-600">
                          ({formatPrice(variantPrice)})
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200">
                      <span className="mr-1">⚠️</span>
                      Not selected
                    </div>
                  )}
                </dd>
              </div>
            ) : null
          ) : (
            product.optionProperties.map((optionProperty) => {
              const selectedOptionId = formData[`option_${optionProperty.id}`];
              const selectedOption = selectedOptionId
                ? optionProperty.options.find(
                    (opt) => opt.id === selectedOptionId,
                  )
                : null;

              return (
                <div
                  key={optionProperty.id}
                  className="grid grid-cols-[1fr_auto] items-center gap-3"
                >
                  <dt className="text-neutral-500">{optionProperty.name}</dt>
                  <dd className="font-medium text-neutral-900 text-right">
                    {selectedOption ? (
                      selectedOption.name
                    ) : (
                      <span className="text-neutral-400 text-xs">
                        Not selected
                      </span>
                    )}
                  </dd>
                </div>
              );
            })
          )}

          {/* Display hardcoded book selection */}
          {!product.optionProperties.some((op) => (op as any).isBooks) &&
            formData.book && (
              <div className="grid grid-cols-[1fr_auto] items-center gap-3">
                <dt className="text-neutral-500">Books</dt>
                <dd className="font-medium text-neutral-900 text-right">
                  {formData.book}
                </dd>
              </div>
            )}
        </dl>

        {/* Exact price breakdown — shown only after all fields are complete */}
        {isVariantPriceReady && (
          <div className="mt-3 pt-3 border-t border-neutral-100 space-y-1.5">
            {variantPrice > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-500">Variant Price</span>
                <span className="font-medium text-neutral-800">
                  {formatPrice(variantPrice)}
                </span>
              </div>
            )}
            {totalOfferDiscount > 0 && (
              <div className="flex items-center justify-between text-sm text-green-600">
                <span>Discount Applied</span>
                <span className="font-medium">
                  -{formatPrice(totalOfferDiscount)}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between text-sm font-semibold border-t border-neutral-100 pt-2">
              <span>Total</span>
              <span className="text-base">
                {formatPrice(Math.max(0, totalPrice - totalOfferDiscount))}
              </span>
            </div>
          </div>
        )}

        {/* ── Add to Cart + View Cart ── */}
        <div className="mt-4">
          {/* Validation errors */}
          {Object.keys(validationErrors).length > 0 && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="text-sm text-red-600">
                <p className="font-medium mb-1">
                  Please fix the following errors:
                </p>
                <ul className="list-disc list-inside space-y-1">
                  {Object.entries(validationErrors).map(([field, error]) => (
                    <li key={field}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          {renderAddToCartButton()}
          {addToCartSuccess && onCartClick && (
            <button
              onClick={onCartClick}
              className="mt-2 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-neutral-300 text-neutral-700 text-sm font-medium hover:bg-neutral-50 transition-colors"
            >
              <ShoppingCartIcon className="w-4 h-4" />
              View Cart
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
