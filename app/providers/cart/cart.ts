// Cart interfaces and utility functions for Vendure integration
// This file now only provides interfaces and utility functions
// Actual cart operations are handled by vendureCart.ts

// --- Interfaces ---

export interface CartItemConfiguration {
  label: string;
  value: string;
  price: number;
  isDiscount?: boolean;
}

export interface CartItemBadge {
  text: string;
  variant: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
}

export interface CartItem {
  id: string;
  productId: string;
  title: string;
  shortTitle: string;
  instructor: string;
  isCombo: boolean;
  images: string[];
  badge: CartItemBadge;
  attemptDate: string;
  basePrice: number;
  finalPrice: number;
  currency: string;
  configuration: Record<string, CartItemConfiguration>;
  description: string;
}

export interface CartSummary {
  subtotal: number;
  discount: number;
  total: number;
  currency: string;
}

export interface CartAnnouncement {
  text: string;
  variant: 'new' | 'info' | 'warning';
}

export interface CartData {
  items: CartItem[];
  summary: CartSummary;
  announcement: CartAnnouncement;
}

// --- Utility Functions ---

/**
 * Check if cart is empty
 */
export function isCartEmpty(cartData: CartData): boolean {
  return !cartData.items || cartData.items.length === 0;
}

/**
 * Format price for display
 */
export function formatPrice(price: number, currency: string = 'INR'): string {
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return formatter.format(price);
}

/**
 * Check if product should rotate images (for combo products)
 */
export function shouldRotateImages(item: CartItem): boolean {
  return item.isCombo && item.images && item.images.length > 1;
}

/**
 * Get next image index for rotation
 */
export function getNextImageIndex(currentIndex: number, totalImages: number): number {
  return (currentIndex + 1) % totalImages;
}

// Note: Legacy cart functions have been removed as we now use Vendure cart
// All cart operations are handled through vendureCart.ts and the cart route actions