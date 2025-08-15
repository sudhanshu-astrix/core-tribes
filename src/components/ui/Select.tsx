import React from 'react';
import { cn } from '../../lib/utils';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string; }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({ className, label, error, options, children, ...props }, ref) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-black dark:text-white">
          {label}
        </label>
      )}
      <select
        ref={ref}
        className={cn(
          'w-full rounded-lg border border-border dark:border-borderDark bg-lightCard dark:bg-darkCard text-black dark:text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent shadow-sm transition-all',
          error && 'border-error',
          className
        )}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-sm text-error">{error}</p>
      )}
    </div>
  );
});

Select.displayName = 'Select'; 