import { CheckIcon, PlusIcon } from 'lucide-react';
import { formatPrice } from '~/providers/cart/vendureCart';

export interface RelatedItemCardData {
  id: string;
  title: string;
  subtitle?: string;
  price: number;
  currencyCode: string;
  tags: string[];
  productId?: string | null;
  productSlug?: string | null;
  variantId?: string;
  variantName?: string | null;
  faculties?: Array<{
    name: string;
    image: string;
    description: string;
  }>;
  mobile?: string | null;
  sellerSku?: string | null;
}

export interface RelatedItemCardProps {
  item: RelatedItemCardData;
  onAdd: (item: RelatedItemCardData) => void;
  isAdded?: boolean;
}

function getInitialsFromTitle(title: string): string {
  const words = title.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return 'R';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

export function RelatedItemCard({ item, onAdd, isAdded = false }: RelatedItemCardProps) {
  const initials = getInitialsFromTitle(item.title);

  return (
    <div className="flex w-full flex-col gap-3 rounded-lg border border-gray-200 bg-white p-3 shadow-sm transition hover:border-blue-200 hover:shadow">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-semibold uppercase tracking-wide text-indigo-700">
          {initials}
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">
            {item.title}
          </h3>
          {item.subtitle ? (
            <p className="text-xs text-gray-500 line-clamp-2">{item.subtitle}</p>
          ) : null}
        </div>
      </div>
      {item.tags && item.tags.length > 0 ? (
        <div className="flex flex-wrap gap-1.5 text-[11px] text-gray-600">
          {item.tags.map((tag, index) => (
            <span
              key={`${item.id}-tag-${index}`}
              className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5"
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}
      <div className="flex items-center justify-between border-t border-gray-200 pt-2">
        <span className="text-base font-semibold text-gray-900">
          {formatPrice(item.price, item.currencyCode, true)}
        </span>
        <button
          type="button"
          onClick={() => onAdd(item)}
          disabled={isAdded}
          className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors ${
            isAdded
              ? 'bg-emerald-50 text-emerald-600'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          {isAdded ? (
            <>
              <CheckIcon className="h-3.5 w-3.5" />
              Added
            </>
          ) : (
            <>
              <PlusIcon className="h-3.5 w-3.5" />
              Add to cart
            </>
          )}
        </button>
      </div>
    </div>
  );
}

