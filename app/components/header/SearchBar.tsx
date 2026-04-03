import { useEffect, useRef, useState } from 'react';
import { useFetcher, useNavigate } from '@remix-run/react';
import { SearchIcon, XIcon } from 'lucide-react';

interface SearchItem {
  productId: string;
  productName: string;
  slug: string;
  productAsset?: { preview: string };
  priceWithTax?: any;
}

function formatPrice(priceWithTax: any): string {
  if (!priceWithTax) return '';
  if (
    priceWithTax.__typename === 'SinglePrice' ||
    priceWithTax.value !== undefined
  ) {
    const rupees = Math.round(priceWithTax.value / 100) - 1;
    return `₹${rupees.toLocaleString('en-IN')}`;
  }
  if (priceWithTax.min !== undefined) {
    const min = Math.round(priceWithTax.min / 100) - 1;
    return `₹${min.toLocaleString('en-IN')}`;
  }
  return '';
}

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const fetcher = useFetcher<{ items: SearchItem[]; totalItems: number }>();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 2) {
      setShowDropdown(false);
      return;
    }
    debounceRef.current = setTimeout(() => {
      fetcher.load(`/api/search?q=${encodeURIComponent(query.trim())}`);
      setShowDropdown(true);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setShowDropdown(false);
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleResultClick = (slug: string) => {
    setShowDropdown(false);
    setQuery('');
    navigate(`/product/${slug}`);
  };

  const items = fetcher.data?.items || [];
  const totalItems = fetcher.data?.totalItems || 0;

  return (
    <div ref={containerRef} className="relative flex-1 max-w-xl">
      <form onSubmit={handleSubmit} className="relative"></form>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute top-full mt-1 left-0 right-0 bg-white rounded-xl border border-gray-200 shadow-xl z-50 overflow-hidden">
          {fetcher.state === 'loading' ? (
            <div className="px-4 py-3 text-sm text-gray-500">Searching...</div>
          ) : items.length > 0 ? (
            <>
              <ul>
                {items.map((item) => (
                  <li key={item.productId}>
                    <button
                      type="button"
                      onClick={() => handleResultClick(item.slug)}
                      className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-gray-50"
                    >
                      <div className="w-10 h-10 rounded-md bg-gray-100 overflow-hidden shrink-0">
                        {item.productAsset?.preview ? (
                          <img
                            src={item.productAsset.preview}
                            alt={item.productName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <SearchIcon className="w-4 h-4 text-gray-300" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-800 truncate">
                          {item.productName}
                        </div>
                        {item.priceWithTax && (
                          <div className="text-xs text-[#4aaeed] font-semibold">
                            {formatPrice(item.priceWithTax)}
                          </div>
                        )}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
              {totalItems > items.length && (
                <button
                  type="button"
                  onClick={() => {
                    setShowDropdown(false);
                    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
                  }}
                  className="w-full cursor-pointer border-t border-gray-100 px-4 py-2.5 text-center text-sm font-medium text-[#4aaeed] transition-colors hover:bg-gray-50"
                >
                  View all {totalItems} results for "{query}"
                </button>
              )}
            </>
          ) : (
            <div className="px-4 py-3 text-sm text-gray-500">
              No results for "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
