import { ListFilter, LayoutGrid, List } from 'lucide-react';
import { useEffect } from 'react';

interface ControlsBarProps {
  facetValueCount?: number;
  appliedPaginationLimit: number;
  appliedPaginationPage: number;
  totalItems: number;
  allowedPaginationLimits: Set<number>;
  onOpenFilters?: () => void;
  layout: 'grid' | 'list';
  setLayout: (layout: 'grid' | 'list') => void;
  layoutOptions?: Array<'grid' | 'list'>;
  sort: string;
  setSort: (sort: string) => void;
}

export function ControlsBar({
  facetValueCount = 0,
  appliedPaginationLimit,
  appliedPaginationPage,
  totalItems,
  allowedPaginationLimits,
  onOpenFilters,
  layout,
  setLayout,
  layoutOptions = ['grid', 'list'],
  sort,
  setSort,
}: ControlsBarProps) {
  const hasPrev = appliedPaginationPage > 1;
  const hasNext = appliedPaginationPage * appliedPaginationLimit < totalItems;
  const canGrid = layoutOptions.includes('grid');
  const canList = layoutOptions.includes('list');

  useEffect(() => {
    if (!layoutOptions.includes(layout)) {
      setLayout(layoutOptions[0] ?? 'grid');
    }
  }, [layout, layoutOptions, setLayout]);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-3 rounded-xl">
      <div className="flex items-center gap-4 w-full sm:w-auto">
        {onOpenFilters && (
          <button
            type="button"
            onClick={onOpenFilters}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-[#1c212f] rounded-lg transition-colors lg:hidden"
          >
            <ListFilter className="h-4 w-4" aria-hidden="true" />
            <span>
              Filters{facetValueCount > 0 ? ` (${facetValueCount})` : ''}
            </span>
          </button>
        )}

        {/* Layout Switcher */}
        {(canGrid || canList) && (
          <div className="flex items-center gap-1 p-1">
            {canGrid && (
              <button
                type="button"
                onClick={() => setLayout('grid')}
                className={`p-1.5 rounded-md transition-all ${
                  layout === 'grid'
                    ? 'bg-white text-[#4aaeed] shadow-sm'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            )}
            {canList && (
              <button
                type="button"
                onClick={() => setLayout('list')}
                className={`p-1.5 rounded-md transition-all ${
                  layout === 'list'
                    ? 'bg-white text-[#4aaeed] shadow-sm'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="h-9 w-40 rounded-lg px-3 text-sm font-bold text-[#1c212f] outline-none border-none focus:ring-0 transition-all cursor-pointer"
          >
            <option value="default">Sort by Default</option>
            <option value="price-low-to-high">Price: Low to High</option>
            <option value="price-high-to-low">Price: High to Low</option>
            <option value="newest">Newest First</option>
          </select>
        </div>

        {/* Pagination controls */}
        <div className="flex items-center gap-2 ml-auto">
          <select
            name="limit"
            defaultValue={appliedPaginationLimit}
            className="h-9 w-auto rounded-lg px-2 text-xs font-bold text-[#1c212f] outline-none border-none focus:ring-0"
          >
            {Array.from(allowedPaginationLimits).map((x) => (
              <option key={x} value={x}>
                {x} / page
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1">
            <button
              type="submit"
              name="page"
              value={appliedPaginationPage - 1}
              disabled={!hasPrev}
              className={`inline-flex items-center justify-center w-9 h-9 rounded-lg transition-all ${
                hasPrev
                  ? 'bg-white text-[#1c212f] hover:text-[#4aaeed] shadow-sm cursor-pointer'
                  : 'bg-gray-50 text-gray-300 cursor-not-allowed'
              }`}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              type="submit"
              name="page"
              value={appliedPaginationPage + 1}
              disabled={!hasNext}
              className={`inline-flex items-center justify-center w-9 h-9 rounded-lg transition-all ${
                hasNext
                  ? 'bg-white text-[#1c212f] hover:text-[#4aaeed] shadow-sm cursor-pointer'
                  : 'bg-gray-50 text-gray-300 cursor-not-allowed'
              }`}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
