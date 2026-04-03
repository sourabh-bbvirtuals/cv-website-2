interface TopFiltersProps {
  showTopFilter: boolean;
  topFilterType: string;
  topFilterFacet: string;
  availableTopFilterGroupValues: any[];
  topCollectionFilter: any[];
  selectedMainFilter: string;
  selectedSubFilter: string;
  mainFilterFromUrl: string;
  subFilterFromUrl: string;
  currentSubFiltersCount: number;
  activeFilters: Record<string, any>;
  onFilterChange: (groupCode: string, optionCode: string, checked: boolean) => void;
  updateTopFilterSelectionParams: (collectionSlug: string, isSubFilter: boolean) => void;
  computeGridColsClass: (count: number, min: number, max: number) => string;
  searchParams: URLSearchParams;
  setSearchParams: (params: URLSearchParams) => void;
}

export function TopFilters({
  showTopFilter,
  topFilterType,
  topFilterFacet,
  availableTopFilterGroupValues,
  topCollectionFilter,
  selectedMainFilter,
  selectedSubFilter,
  mainFilterFromUrl,
  subFilterFromUrl,
  currentSubFiltersCount,
  activeFilters,
  onFilterChange,
  updateTopFilterSelectionParams,
  computeGridColsClass,
  searchParams,
  setSearchParams,
}: TopFiltersProps) {
  // Facet-based top filter
  const renderFacetFilter = () => {
    if (
      !showTopFilter ||
      topFilterType !== 'facet' ||
      !availableTopFilterGroupValues ||
      availableTopFilterGroupValues.length === 0
    ) {
      return null;
    }

    return (
      <div
        className={`grid gap-4 ${
          availableTopFilterGroupValues.length >= 3
            ? `md:grid-cols-${availableTopFilterGroupValues.length}`
            : 'md:grid-cols-2'
        }`}
      >
        {availableTopFilterGroupValues.map((filterValue: any, index: number) => {
          const gradients = [
            'bg-gradient-to-r from-indigo-600 to-sky-600',
            'bg-gradient-to-r from-slate-900 to-slate-700',
            'bg-gradient-to-r from-amber-600 to-orange-600',
          ];
          const isSelected =
            topFilterFacet &&
            activeFilters[topFilterFacet as string]?.values.some(
              (v: any) => v.code === filterValue.code,
            );
          return (
            <div
              key={filterValue.id}
              className={`rounded-lg border border-slate-200 ${
                gradients[index % gradients.length]
              } text-white p-4 cursor-pointer transition-transform hover:scale-105 ${
                isSelected ? 'ring-2 ring-white ring-opacity-50' : ''
              }`}
              onClick={() => {
                // For top filters, the hook handles single selection automatically
                // Just select the clicked item - the hook will replace all other values
                onFilterChange(
                  topFilterFacet || '',
                  filterValue.code,
                  true,
                );
              }}
            >
              <div className="text-xs font-medium">
                {filterValue.name?.toUpperCase() ||
                  filterValue.code?.toUpperCase()}
              </div>
              <div className="mt-1 text-xl font-semibold tracking-tight">
                {filterValue.name || filterValue.code}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Collection-based top filter
  const renderCollectionFilter = () => {
    if (
      !showTopFilter ||
      topFilterType !== 'collection' ||
      !topCollectionFilter ||
      topCollectionFilter.length === 0
    ) {
      return null;
    }

    return (
      <div className="mt-8 bg-gray-50 rounded-lg">
        <div className="space-y-6">
          <div>
            <div
              className={`grid grid-cols-2 md:grid-cols-3 gap-3 ${computeGridColsClass(
                topCollectionFilter?.length || 0,
                2,
                6,
              )}`}
            >
              {topCollectionFilter.map((filterGroup: any, index: number) => {
                const isSelected =
                  selectedMainFilter === filterGroup.mainFilter.slug;
                const gradients = [
                  'bg-gradient-to-r from-indigo-600 to-sky-600',
                  'bg-gradient-to-r from-slate-900 to-slate-700',
                  'bg-gradient-to-r from-amber-600 to-orange-600',
                ];

                return (
                  <div
                    key={filterGroup.mainFilter.slug}
                    className={`group relative rounded-lg border border-slate-200 ${
                      gradients[index % gradients.length]
                    } text-white p-0 cursor-pointer transition-transform hover:scale-105 ${
                      isSelected ? 'ring-4 ring-white/70' : ''
                    }`}
                    onClick={() => {
                      // Always select the clicked main filter (no toggle)
                      // If already selected, it will remain selected
                      updateTopFilterSelectionParams(
                        filterGroup.mainFilter.slug || '',
                        false,
                      );
                    }}
                  >
                    {!isSelected && (
                      <div className="absolute inset-0 rounded-lg bg-black/15 group-hover:bg-black/10 transition-colors pointer-events-none" />
                    )}
                    {isSelected && (
                      <div className="absolute top-2 right-2 bg-white rounded-full p-1 ring-2 ring-indigo-500/30 shadow-sm">
                        <svg
                          className="w-4 h-4 text-indigo-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    )}
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-semibold text-white">
                          {filterGroup.mainFilter.name}
                        </h3>
                        {isSelected && (
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
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                      <p className="text-xs text-white/80">
                        Explore options
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {(selectedMainFilter || mainFilterFromUrl) && (
            <div className="mt-4">
              <div className="mb-4"></div>

              <div
                className={`grid grid-cols-2 md:grid-cols-3 gap-2 ${computeGridColsClass(
                  currentSubFiltersCount,
                  2,
                  5,
                )}`}
              >
                {(() => {
                  // Find the selected main filter and get its sub-filters
                  const currentMainFilter =
                    selectedMainFilter || mainFilterFromUrl;
                  const selectedFilterGroup = topCollectionFilter.find(
                    (group: any) =>
                      group.mainFilter.slug === currentMainFilter,
                  );

                  const subFilters = selectedFilterGroup?.subFilters || [];

                  return subFilters.map((subFilter: any, index: number) => {
                    const isSubSelected = selectedSubFilter === subFilter.slug;
                    return (
                      <div
                        key={subFilter.slug}
                        className={`relative border rounded-lg p-3 pl-4 cursor-pointer transition-all duration-200 shadow-sm hover:shadow hover:scale-[1.02] ${
                          isSubSelected
                            ? 'border-2 border-indigo-600 bg-indigo-50 text-indigo-900 shadow-md'
                            : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100 text-slate-900'
                        }`}
                        role="button"
                        tabIndex={0}
                        aria-pressed={isSubSelected}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            // Always select the clicked sub filter (no toggle)
                            updateTopFilterSelectionParams(
                              subFilter.slug || '',
                              true,
                            );
                          }
                        }}
                        onClick={() => {
                          // Always select the clicked sub filter (no toggle)
                          // If already selected, it will remain selected
                          updateTopFilterSelectionParams(
                            subFilter.slug || '',
                            true,
                          );
                        }}
                      >
                        {isSubSelected && (
                          <span className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-l-lg" />
                        )}
                        <div className={`flex items-center justify-between text-sm font-medium`}>
                          <div className="flex items-center gap-2">
                            {isSubSelected && (
                              <svg
                                className="w-4 h-4 text-indigo-700"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            )}
                            <span>{subFilter.name}</span>
                          </div>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>

              {/* No subfilters message */}
              {(() => {
                const currentMainFilter = selectedMainFilter || mainFilterFromUrl;
                const selectedFilterGroup = topCollectionFilter.find(
                  (group: any) =>
                    group.mainFilter.slug === currentMainFilter,
                );
                const subFilters = selectedFilterGroup?.subFilters || [];

                if (subFilters.length === 0) {
                  return (
                    <div className="text-center py-8">
                      <p className="text-sm text-gray-500">
                        No subcategories available
                      </p>
                    </div>
                  );
                }
                return null;
              })()}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {renderFacetFilter()}
      {renderCollectionFilter()}
    </>
  );
}
