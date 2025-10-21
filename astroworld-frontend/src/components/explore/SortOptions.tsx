import React from 'react';
import type { LucideIcon } from 'lucide-react';

export interface SortOption {
  value: string;
  label: string;
  icon: LucideIcon;
}

interface SortOptionsProps {
  options: SortOption[];
  selectedValue: string;
  onSelectionChange: (value: string) => void;
  className?: string;
}

const SortOptions: React.FC<SortOptionsProps> = ({
  options,
  selectedValue,
  onSelectionChange,
  className = ""
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {options.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          onClick={() => onSelectionChange(value)}
          className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
            selectedValue === value
              ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
              : 'bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
          }`}
        >
          <Icon className="w-4 h-4" />
          <span className="text-sm font-medium">{label}</span>
        </button>
      ))}
    </div>
  );
};

export default SortOptions;