import React from 'react';
import { ReactNode, HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  isInteractive?: boolean;
}

export const Card: React.FC<CardProps> = ({ className, ...props }) => (
  <div
    role="region"
    aria-label="Card"
    className={cn(
      'bg-[#FAFAFA] dark:bg-[#1A1A1A] rounded-2xl shadow-card border border-gray-200 dark:border-gray-700 p-2 min-h-[180px] transition-shadow hover:shadow-lg',
      className 
    )}
    {...props}
  />
);

export function CardHeader({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('p-6 border-b border-gray-200 dark:border-gray-700', className)}>
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h3 className={cn('text-lg font-semibold text-black dark:text-white', className)}>
      {children}
    </h3>
  );
}

export const CardContent: React.FC<HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={cn('p-6', className)} {...props} />
);

export function CardFooter({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('p-6 border-t border-gray-200 dark:border-gray-700', className)}>
      {children}
    </div>
  );
}