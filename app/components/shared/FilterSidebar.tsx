import { useState, useEffect } from 'react';
import { Filter, X } from './Icon';
import { ChevronDownIcon } from 'lucide-react';

interface FilterOption {
  id: string;
  label: string;
  checked?: boolean;
}

interface FilterGroup {
  id: string;
  name: string;
  code: string;
  options: FilterOption[];
}

interface ActiveFilterValue {
  code: string;
  name: string;
}

interface ActiveFilter {
  facetCode: string;
  facetName: string;
  values: ActiveFilterValue[];
}

interface FilterSidebarProps {
  filterSequenceType?: string;
  filterGroups: FilterGroup[];
  onFilterChange?: (
    groupId: string,
    optionId: string,
    checked: boolean,
  ) => void;
  onClearFilters?: () => void;
  activeFilters?: Record<string, ActiveFilter>;
  className?: string;
  showUsefulPrograms?: boolean;
  isCma?: boolean;
}

export function FilterSidebar({
  filterSequenceType = "other",
  filterGroups,
  onFilterChange,
  onClearFilters,
  activeFilters = {},
  isCma = false,
}: FilterSidebarProps) {
  console.log('filterGroups', filterGroups);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Define filter order configurations for different categories
  const getFilterOrder = (category: string | null): Record<string, number> => {
    // Default ordering (when category is null, undefined, or "Other")
    const defaultOrder: Record<string, number> = {
      'product type': 1,
      'subject': 2,
      'offer type': 3,
      'type': 3,
      'batch type': 4,
      'attempt': 5,
      'language': 6,
      'faculty': 7,
    };

    // Category-specific orderings
    const categoryOrders: Record<string, Record<string, number>> = {
      'ca-foundation': {
        'product type': 1,
        'attempt': 2,
        'mode type': 3,
        'batch type': 4,
        'subject': 5,
        'offer type': 6,
        'type': 6,
        // 'language': 7,
        'faculty': 8,
      },
      'ca-inter': {
        'product type': 1,
        'subject': 2,
        'offer type': 3,
        'type': 3,
        'batch type': 4,
        'attempt': 5,
        'language': 6,
        'faculty': 7,
      },
      'ca-final': {
        'product type': 1,
        'subject': 2,
        'offer type': 3,
        'type': 3,
        'batch type': 4,
        'attempt': 5,
        'language': 6,
        'faculty': 7,
      },
      'cma-inter': {
        'product type': 1,
        'subject': 2,
        'offer type': 3,
        'type': 3,
        'batch type': 4,
        'attempt': 5,
        'language': 6,
        'faculty': 7,
      },
      'cma-final': {
        'product type': 1,
        'subject': 2,
        'offer type': 3,
        'type': 3,
        'batch type': 4,
        'attempt': 5,
        'language': 6,
        'faculty': 7,
      },
      'subject-page': {
        'product type': 1,
        'faculty': 2,
        'offer type': 3,
        'type': 3,
        'batch type': 4,
        'attempt': 5,
        'language': 6,
        'subject': 7,
      },
      'course-page': {
        'product type': 1,
        'faculty': 2,
        'offer type': 3,
        'type': 3,
        'batch type': 4,
        'attempt': 5,
        'language': 6,
        'subject': 7,
      },
    };

    // Return category-specific order if exists, otherwise return default
    if (category && categoryOrders[category]) {
      return categoryOrders[category];
    }
    return defaultOrder;
  };

  // Get the appropriate filter order based on category
  const filterOrder = getFilterOrder(filterSequenceType || null);

  // Filter out groups with "-cma" in the id
  // const filteredGroups = filterGroups.filter((group) => {
  //   return !group.id.toLowerCase().includes('-cma');
  // });
  let filteredGroups: FilterGroup[] = [];
  if (isCma) {
    filteredGroups = filterGroups;
  } else {
    filteredGroups = filterGroups.filter((group) => {
      return !group.id.toLowerCase().includes('-cma');
    });
  }

  // Filter out groups that don't have an order in filterOrder
  const orderedGroups = filteredGroups.filter((group) => {
    const order = filterOrder[group.name?.toLowerCase() || ''];
    return order !== undefined;
  });

  // Sort filter groups based on the defined order (using name)
  const sortedFilterGroups = [...orderedGroups].sort((a, b) => {
    const orderA = filterOrder[a.name?.toLowerCase() || ''] ?? 999;
    const orderB = filterOrder[b.name?.toLowerCase() || ''] ?? 999;
    return orderA - orderB;
  });

  // Define option sort order for each filter group by category
  const getOptionSortOrder = (category: string | null, filterName: string): Record<string, number> => {
    console.log('category', category, 'filterName', filterName);
    const categoryOptionOrders: Record<string, Record<string, Record<string, number>>> = {
      'ca-foundation': {
        'product type': {
          'video lecture': 1,
          'books': 2,
        },
        'batch type': {
          'regular in depth': 1,
          'exam oriented': 2,
          'fast track': 3,
        },
        'subject': {
          'accounting': 1,
          'business laws': 2,
          'quantitative aptitude': 3,
          'business economics': 4,
        },
        'type': {
          'single': 1,
          'combo': 2,
        },
        'faculty': {
          'ca parag gupta': 1,
          'ca aman khedia': 2,
          'ca amol jain': 3,
          'cma abhijeet sengupta': 4,
        },
      },
      'ca-inter': {
        'product type': {
          'video lecture': 1,
          'books': 2,
        },
        'subject': {
          'advance accounting': 1,
          'corporate & other laws': 2,
          'direct tax': 3,
          'indirect tax': 4,
          'business economics': 5,
          'cost and management accounting': 6,
          'auditing and assurance': 7,
          'financial management': 8,
          'strategic management': 9,
        },
        'type': {
          'single': 1,
          'combo': 2,
        },
        'batch type': {
          'regular in depth': 1,
          'exam oriented': 2,
          'fast track': 3,
        },
        'language': {
          'hindi english': 1,
        },
      },
      'ca-final': {
        'product type': {
          'video lecture': 1,
          'books': 2,
        },
        'subject': {
          'financial reporting': 1,
          'advanced financial management': 2,
          'advanced auditing': 3,
          'spom-law': 4,
        },
        'type': {
          'single': 1,
          'combo': 2,
        },
        'batch type': {
          'regular in depth': 1,
          'exam oriented': 2,
          'fast track': 3,
        },
        'language': {
          'hindi english': 1,
        },
      },
      'subject-page': {
        'product type': {
          'video lecture': 1,
          'books': 2,
        },
      },
      'other': {
        'product type': {
          'video lecture': 1,
          'books': 2,
        },
        'subject': {
          'advance accounting': 1,
          'corporate & other laws': 2,
          'direct tax': 3,
          'indirect tax': 4,
          'business economics': 5,
      },
      },
    };

    if (category && categoryOptionOrders[category] && categoryOptionOrders[category][filterName.toLowerCase()]) {
      return categoryOptionOrders[category][filterName.toLowerCase()];
    }
    return {};
  };
  console.log('sortedFilterGroups', sortedFilterGroups);
  // Apply option sorting to each filter group (but preserve attempt sorting logic)
  const sortedFilterGroupsWithOptions = sortedFilterGroups.map((group) => {
    const isAttempt = (group.code || '').toLowerCase() === 'attempt';
    
    // Don't override attempt sorting - it has its own logic
    if (isAttempt) {
      return group;
    }
    
    const optionSortOrder = getOptionSortOrder(filterSequenceType || null, group.name);
    console.log('optionSortOrder', filterSequenceType);
    if (Object.keys(optionSortOrder).length > 0) {
      // Sort options based on the defined order
      const sortedOptions = [...group.options].sort((a, b) => {
        console.log('a.label', optionSortOrder[a.label?.toLowerCase() || '']);
        const orderA = optionSortOrder[a.label?.toLowerCase() || ''] ?? 999;
        const orderB = optionSortOrder[b.label?.toLowerCase() || ''] ?? 999;
        return orderA - orderB;
      });
      
      return {
        ...group,
        options: sortedOptions,
      };
    }
    
    return group;
  });
  const toggleFilters = () => {
    if (!isFiltersOpen) {
      setIsFiltersOpen(true);
      // Prevent body scroll when bottom sheet is open
      document.body.style.overflow = 'hidden';
      // Trigger animation after DOM update
      setTimeout(() => {
        setIsAnimating(true);
      }, 10);
    } else {
      setIsAnimating(false);
      setTimeout(() => {
        setIsFiltersOpen(false);
        document.body.style.overflow = '';
      }, 300);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleFilterChange = (
    groupId: string,
    optionId: string,
    checked: boolean,
  ) => {
    onFilterChange?.(groupId, optionId, checked);
  };

  const handleClearFilters = () => {
    onClearFilters?.();
  };

  const renderFilterContent = () => (
    <div className="space-y-4 w-full min-w-0">
      {sortedFilterGroupsWithOptions.map((group) => (
        <div
          key={group.id}
          className="rounded-lg border border-slate-200 bg-white p-4 w-full min-w-0"
        >
          <div className="text-sm font-medium mb-3 truncate">{group.name}</div>
          <div className="space-y-2 w-full min-w-0">
            {(() => {
              const isAttempt = (group.code || '').toLowerCase() === 'attempt';
              const monthOrder: Record<string, number> = {
                jan: 1,
                feb: 2,
                mar: 3,
                apr: 4,
                may: 5,
                jun: 6,
                jul: 7,
                aug: 8,
                sep: 9,
                oct: 10,
                nov: 11,
                dec: 12,
              };
              const parseYear = (label: string): number => {
                const m = label.match(/(\d{4})$/);
                return m ? parseInt(m[1], 10) : 0;
              };
              const parseMonth = (label: string): number => {
                const m = label.trim().slice(0, 3).toLowerCase();
                return monthOrder[m] || 0;
              };
              const sortedOptions = isAttempt
                ? [...group.options].sort((a, b) => {
                    const ya = parseYear(a.label);
                    const yb = parseYear(b.label);
                    if (ya !== yb) return ya - yb;
                    return parseMonth(a.label) - parseMonth(b.label);
                  })
                : group.options;
              return sortedOptions.map((option) => {
                const isChecked = activeFilters[group.id]?.values.some(v => v.code === option.id) || false;
                return (
                  <label
                    key={option.id}
                    className="flex items-start gap-3 cursor-pointer group w-full min-w-0"
                  >
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 mt-0.5 flex-shrink-0" 
                      checked={isChecked}
                      onChange={(e) =>
                        handleFilterChange(
                          group.code,
                          option.id,
                          e.target.checked,
                        )
                      }
                    />
                    <span className="text-sm leading-5 group-hover:text-slate-900 transition-colors break-words min-w-0 flex-1">
                      {option.label}
                    </span>
                  </label>
                );
              });
            })()}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <>
      <aside className="lg:col-span-3 w-full min-w-0">
        <div className="top-24 space-y-4 w-full">
          <div className="flex items-center justify-between w-full min-w-0">
            <h4 className="text-lg font-semibold tracking-tight truncate">Filters</h4>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handleClearFilters}
                className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900 transition-colors flex-shrink-0"
                title="Clear all filters"
              >
                <X className="h-4 w-4" />
                <span className="hidden sm:inline">Clear</span>
              </button>
              <button
                onClick={toggleFilters}
                className="lg:hidden inline-flex items-center gap-2 text-sm rounded-md border border-slate-200 px-3 py-1.5 hover:bg-slate-100 transition-colors font-medium flex-shrink-0"
              >
                <Filter />
                Filters
              </button>
            </div>
          </div>

          {/* Desktop view - always visible */}
          <div className="hidden lg:block w-full min-w-0">
            {renderFilterContent()}
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Sheet */}
      {isFiltersOpen && (
        <>
          {/* Backdrop */}
          <div
            className={`fixed inset-0 bg-black z-40 lg:hidden transition-opacity duration-300 ${
              isAnimating ? 'opacity-50' : 'opacity-0'
            }`}
            onClick={toggleFilters}
            aria-hidden="true"
          />

          {/* Bottom Sheet */}
          <div
            className={`fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white rounded-t-2xl shadow-2xl transform transition-transform duration-300 ease-out w-full max-w-full overflow-hidden ${
              isAnimating ? 'translate-y-0' : 'translate-y-full'
            }`}
            style={{ maxHeight: '90vh' }}
          >
            {/* Drag Handle */}
            <div className="flex justify-center pt-3 pb-2 flex-shrink-0">
              <div className="w-12 h-1.5 bg-slate-300 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 pb-4 border-b border-slate-200 flex-shrink-0 min-w-0">
              <h3 className="text-lg font-semibold text-slate-900 truncate flex-1 min-w-0">Filters</h3>
              <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                <button
                  onClick={handleClearFilters}
                  className="text-sm text-slate-600 hover:text-slate-900 transition-colors font-medium whitespace-nowrap"
                >
                  Clear All
                </button>
                <button
                  onClick={toggleFilters}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors flex-shrink-0 text-slate-600 hover:text-slate-900"
                  aria-label="Toggle filters"
                  title="Collapse filters"
                >
                  <ChevronDownIcon className="h-5 w-5" />
                  <span className="text-sm font-medium hidden sm:inline">Collapse</span>
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div 
              className="overflow-y-auto overflow-x-hidden px-4 py-4 w-full" 
              style={{ maxHeight: 'calc(90vh - 100px)' }}
            >
              {renderFilterContent()}
            </div>
          </div>
        </>
      )}
    </>
  );
}
