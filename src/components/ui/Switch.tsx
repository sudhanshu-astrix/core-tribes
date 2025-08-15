import React from 'react';
import { cn } from '../../lib/utils';

interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const Switch: React.FC<SwitchProps> = ({ checked, onChange, className, ...props }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    tabIndex={0}
    className={cn(
      'relative inline-flex h-6 w-12 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent',
      checked ? 'bg-accent shadow-card' : 'bg-border dark:bg-borderDark',
      className
    )}
    onClick={() => onChange(!checked)}
    {...props}
  >
    <span
      className={cn(
        'inline-block h-5 w-5 transform rounded-full bg-white shadow-card transition-transform duration-200',
        checked ? 'translate-x-6' : 'translate-x-1'
      )}
    />
  </button>
); 