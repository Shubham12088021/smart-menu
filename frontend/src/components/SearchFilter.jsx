import { Search, Filter, X } from 'lucide-react';
import { useState } from 'react';

export default function SearchFilter({ onSearch, onFilter, categories = [], activeFilters = {} }) {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = (value) => {
    setQuery(value);
    onSearch(value);
  };

  const toggleFilter = (key, value) => {
    onFilter(key, value);
  };

  return (
    <div className="space-y-3">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search menu items..."
          className="w-full pl-11 pr-20 py-3 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
        />
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-colors ${
            showFilters ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <Filter className="w-5 h-5" />
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="flex flex-wrap gap-2 animate-fade-in">
          <button
            onClick={() => toggleFilter('is_veg', true)}
            className={`badge text-sm py-1.5 px-3 rounded-xl cursor-pointer transition-all ${
              activeFilters.is_veg === true
                ? 'bg-green-500 text-white shadow-md'
                : 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 hover:bg-green-100'
            }`}
          >
            🟢 Veg
          </button>
          <button
            onClick={() => toggleFilter('is_veg', false)}
            className={`badge text-sm py-1.5 px-3 rounded-xl cursor-pointer transition-all ${
              activeFilters.is_veg === false
                ? 'bg-red-500 text-white shadow-md'
                : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 hover:bg-red-100'
            }`}
          >
            🔴 Non-Veg
          </button>
          <button
            onClick={() => toggleFilter('is_spicy', true)}
            className={`badge text-sm py-1.5 px-3 rounded-xl cursor-pointer transition-all ${
              activeFilters.is_spicy
                ? 'bg-orange-500 text-white shadow-md'
                : 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400 hover:bg-orange-100'
            }`}
          >
            🌶️ Spicy
          </button>
          <button
            onClick={() => toggleFilter('is_bestseller', true)}
            className={`badge text-sm py-1.5 px-3 rounded-xl cursor-pointer transition-all ${
              activeFilters.is_bestseller
                ? 'bg-amber-500 text-white shadow-md'
                : 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 hover:bg-amber-100'
            }`}
          >
            ⭐ Bestseller
          </button>
          {Object.keys(activeFilters).length > 0 && (
            <button
              onClick={() => { onFilter('clear'); }}
              className="badge text-sm py-1.5 px-3 rounded-xl cursor-pointer bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200"
            >
              <X className="w-3 h-3 mr-1" /> Clear
            </button>
          )}
        </div>
      )}
    </div>
  );
}
