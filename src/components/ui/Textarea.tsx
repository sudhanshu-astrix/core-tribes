import { TextareaHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/utils';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-black dark:text-white">
            {label}
          </label>
        )}
        <textarea
          className={cn(
            'w-full px-4 py-2 rounded-md bg-lightCard dark:bg-darkCard',
            'border border-lightCard/50 dark:border-darkCard/50',
            'text-black dark:text-white',
            'placeholder:text-lightTextSecondary dark:placeholder:text-blackSecondary',
            'focus:outline-none focus:ring-2 focus:ring-[#BBF10A]/50',
            'min-h-[100px] resize-y',
            error && 'border-error',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="text-sm text-error">{error}</p>
        )}
      </div>
    );
  }
); 