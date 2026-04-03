interface ActiveFiltersIndicatorProps {
  activeFilters: Record<string, any>;
  isFiltering: boolean;
  onClearFilters: () => void;
  onFilterChange: (groupCode: string, optionCode: string, checked: boolean) => void;
}

export function ActiveFiltersIndicator({
  activeFilters,
  isFiltering,
  onClearFilters,
  onFilterChange,
}: ActiveFiltersIndicatorProps) {
  if (Object.keys(activeFilters).length === 0) {
    return null;
  }

  return (
    <div className="bg-indigo-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-indigo-900">
            Active Filters:
          </span>
          {isFiltering && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
          )}
          <div className="flex flex-wrap gap-2">
            {Object.entries(activeFilters)
              .filter(([groupCode]) => !groupCode.toLowerCase().includes('-cma'))
              .map(([groupCode, filter]) => {
                return filter.values.map((value: any) => (
                  <span
                    key={`${groupCode}-${value.code}`}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full"
                  >
                    {filter.facetName}: {value.name}
                    <button
                      onClick={() =>
                        onFilterChange(
                          groupCode,
                          value.code,
                          false,
                        )
                      }
                      className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                    >
                      ×
                    </button>
                  </span>
                ));
              })}
          </div>
        </div>
        <button
          onClick={onClearFilters}
          className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
        >
          Clear All
        </button>
      </div>
    </div>
  );
}
