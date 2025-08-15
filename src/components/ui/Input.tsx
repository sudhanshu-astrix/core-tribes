import React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, label, error, ...props }, ref) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-black dark:text-white">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={cn(
          'w-full rounded-lg border border-border dark:border-borderDark bg-lightCard dark:bg-darkCard text-black dark:text-white placeholder:text-lightTextSecondary dark:placeholder:text-blackSecondary px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent shadow-sm transition-all',
          error && 'border-error',
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-sm text-error">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input'; 