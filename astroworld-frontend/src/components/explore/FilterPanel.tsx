import React from 'react';
import { Filter } from 'lucide-react';
import SearchBar from './SearchBar';
import SortOptions, { type SortOption } from './SortOptions';

export interface FilterConfig {
  search: string;
  category: string;
  dateRange: string;
  sortBy: string;
}

interface FilterPanelProps {
  filters: FilterConfig;
  onFiltersChange: (filters: FilterConfig) => void;
  sortOptions: SortOption[];
  activeTab: string;
  showFilters: boolean;
  onToggleFilters: () => void;
  categoryOptions?: { value: string; label: string }[];
  dateRangeOptions?: { value: string; label: string }[];
  className?: string;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFiltersChange,
  sortOptions,
  activeTab,
  showFilters,
  onToggleFilters,
  categoryOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'astrophysics', label: 'Astrophysics' },
    { value: 'cosmology', label: 'Cosmology' },
    { value: 'planetary', label: 'Planetary Science' },
    { value: 'stellar', label: 'Stellar Physics' },
    { value: 'galactic', label: 'Galactic Astronomy' }
  ],
  dateRangeOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'year', label: 'This Year' }
  ],
  className = ""
}) => {
  const handleSearchChange = (search: string) => {
    onFiltersChange({ ...filters, search });
  };

  const handleSortChange = (sortBy: string) => {
    onFiltersChange({ ...filters, sortBy });
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({ ...filters, category: e.target.value });
  };

  const handleDateRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({ ...filters, dateRange: e.target.value });
  };

  return (
    <div className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50 sticky top-8 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Filters
        </h3>
        <button
          onClick={onToggleFilters}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <Filter className="w-4 h-4" />
        </button>
      </div>

      <div className={`space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Search
          </label>
          <SearchBar
            value={filters.search}
            onChange={handleSearchChange}
            placeholder={`Search ${activeTab}...`}
          />
        </div>

        {/* Sort Options */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Sort By
          </label>
          <SortOptions
            options={sortOptions}
            selectedValue={filters.sortBy}
            onSelectionChange={handleSortChange}
          />
        </div>

        {/* Categories - Dynamic based on active tab */}
        {activeTab === 'papers' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <select
              value={filters.category}
              onChange={handleCategoryChange}
              className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 dark:text-white"
            >
              {categoryOptions.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Date Range
          </label>
          <select
            value={filters.dateRange}
            onChange={handleDateRangeChange}
            className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 dark:text-white"
          >
            {dateRangeOptions.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Clear Filters */}
        <button
          onClick={() => onFiltersChange({
            search: '',
            category: 'all',
            dateRange: 'all',
            sortBy: 'recent'
          })}
          className="w-full p-3 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
        >
          Clear All Filters
        </button>
      </div>
    </div>
  );
};

export default FilterPanel;