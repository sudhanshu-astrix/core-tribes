import React from 'react';
import { cn } from '../../lib/utils';

interface AvatarProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  objectFit?: 'cover' | 'contain';
}

export const Avatar: React.FC<AvatarProps> = ({ className, size = 'md', objectFit = 'cover', ...props }) => {
  const sizes = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-20 w-20',
    xl: 'h-24 w-24',
  };
  return (
    <img
      className={cn(
        'rounded-full border-2 border-border dark:border-borderDark shadow-card',
        `object-${objectFit}`,
        sizes[size],
        className
      )}
      {...props}
    />
  );
};