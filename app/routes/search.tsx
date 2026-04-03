import { json } from '@remix-run/server-runtime';
import type { LoaderFunctionArgs } from '@remix-run/server-runtime';
import {
  useLoaderData,
  Link,
  useSearchParams,
  MetaFunction,
} from '@remix-run/react';
import { useMemo, useState } from 'react';
import { search } from '~/providers/products/products';
import Layout from '~/components/Layout';
import { APP_META_TITLE } from '~/constants';
import { ControlsBar } from '~/components/shared';

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    {
      title: data?.q
        ? `Search: "${data.q}" - ${APP_META_TITLE}`
        : `Search - ${APP_META_TITLE}`,
    },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const q = url.searchParams.get('q') || '';

  if (!q.trim()) {
    return json({ items: [], totalItems: 0, q: '' });
  }

  try {
    const result = await search(
      { input: { term: q.trim(), groupByProduct: true, take: 24 } },
      { request },
    );
    return json({
      items: result.search.items,
      totalItems: result.search.totalItems,
      q,
    });
  } catch {
    return json({ items: [], totalItems: 0, q });
  }
}

function formatPrice(priceWithTax: any): string {
  if (!priceWithTax) return '';
  if (
    priceWithTax.__typename === 'SinglePrice' ||
    priceWithTax.value !== undefined
  ) {
    const rupees = Math.round(priceWithTax.value / 100);
    return `₹${rupees.toLocaleString('en-IN')}`;
  }
  if (priceWithTax.min !== undefined) {
    const min = Math.round(priceWithTax.min / 100);
    const max = Math.round(priceWithTax.max / 100);
    if (min === max) return `₹${min.toLocaleString('en-IN')}`;
    return `₹${min.toLocaleString('en-IN')} – ₹${max.toLocaleString('en-IN')}`;
  }
  return '';
}

export default function SearchPage() {
  const { items, totalItems, q } = useLoaderData<typeof loader>();
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const [sort, setSort] = useState('default');

  const getPrice = (item: any) => {
    if (!item.priceWithTax) return 0;
    if (
      item.priceWithTax.value !== undefined &&
      item.priceWithTax.value !== null
    ) {
      return item.priceWithTax.value;
    }
    if (item.priceWithTax.min !== undefined && item.priceWithTax.min !== null) {
      return item.priceWithTax.min;
    }
    return 0;
  };

  const sortedItems = useMemo(() => {
    let resultItems = [...items];
    if (sort === 'price-low-to-high') {
      resultItems.sort((a, b) => getPrice(a) - getPrice(b));
    } else if (sort === 'price-high-to-low') {
      resultItems.sort((a, b) => getPrice(b) - getPrice(a));
    }
    return resultItems;
  }, [items, sort]);

  return (
    <Layout>
      <div className="mx-auto max-w-[1340px] px-4 sm:px-6 lg:px-8 py-8 font-['Inter',_sans-serif]">
        {/* Header */}
        <div className="mb-8">
          {q ? (
            <>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1c212f] tracking-tight">
                Search results for <span className="text-[#4aaeed]">"{q}"</span>
              </h1>
              <p className="text-sm font-medium text-gray-500 mt-2">
                We found {totalItems} {totalItems === 1 ? 'result' : 'results'}{' '}
                for your search
              </p>
            </>
          ) : (
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1c212f] tracking-tight">
              Search products
            </h1>
          )}
        </div>

        {items.length > 0 && (
          <div className="mb-6">
            <ControlsBar
              totalItems={items.length}
              layout={layout}
              setLayout={setLayout}
              sort={sort}
              setSort={setSort}
              appliedPaginationLimit={24}
              appliedPaginationPage={1}
              allowedPaginationLimits={new Set([24, 48, 72])}
            />
          </div>
        )}

        {/* Results */}
        {sortedItems.length > 0 ? (
          <div
            className={
              layout === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'
                : 'flex flex-col gap-4'
            }
          >
            {sortedItems.map((item: any) => (
              <Link
                key={item.productId}
                to={`/product/${item.slug}`}
                className={`group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-xl hover:border-[#4aaeed]/30 transition-all duration-300 ${
                  layout === 'list'
                    ? 'flex flex-row gap-6 p-2'
                    : 'flex flex-col'
                }`}
              >
                <div
                  className={`relative overflow-hidden ${
                    layout === 'list'
                      ? 'w-48 shrink-0 rounded-lg'
                      : 'w-full bg-slate-50'
                  }`}
                >
                  {item.productAsset?.preview ? (
                    <img
                      src={`${item.productAsset.preview}?w=400`}
                      alt={item.productName}
                      className="w-full h-auto object-contain group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full aspect-[4/3] bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center text-slate-300">
                      No image
                    </div>
                  )}
                </div>
                <div
                  className={`flex-1 flex flex-col ${
                    layout === 'list' ? 'py-2 pr-4' : 'p-4'
                  }`}
                >
                  <h3 className="text-base font-bold text-[#1c212f] leading-snug line-clamp-2 group-hover:text-[#4aaeed] transition-colors mb-2">
                    {item.productName}
                  </h3>
                  <div className="mt-auto">
                    {item.priceWithTax && (
                      <p className="text-lg font-extrabold text-[#1c212f]">
                        {formatPrice(item.priceWithTax)}
                      </p>
                    )}
                    <div className="mt-4">
                      <span className="text-[11px] font-bold text-[#4aaeed] uppercase tracking-widest bg-[#4aaeed]/5 px-2 py-1 rounded">
                        View details
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : q ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🔍</div>
            <h2 className="text-lg font-semibold text-slate-700 mb-2">
              No results found
            </h2>
            <p className="text-slate-500 text-sm">
              We couldn't find any products matching "{q}". Try different
              keywords.
            </p>
          </div>
        ) : null}
      </div>
    </Layout>
  );
}
