import React, { useState } from 'react';
import { cn } from '../../lib/utils';

interface AccordionProps {
  children: React.ReactNode;
}

export const Accordion: React.FC<AccordionProps> & { Item: typeof AccordionItem } = ({ children }) => (
  <div className="divide-y divide-border dark:divide-borderDark rounded-xl shadow-card bg-lightCard dark:bg-darkCard">
    {children}
  </div>
);

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ title, children }) => {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        className={cn(
          'w-full flex justify-between items-center px-6 py-4 text-lg font-semibold focus:outline-none transition-colors',
          open ? 'text-accent' : 'text-black dark:text-white'
        )}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        {title}
        <span className={cn('ml-2 transition-transform', open ? 'rotate-90 text-accent' : 'rotate-0 text-gray-600 dark:text-gray-400')}>
          ▶
        </span>
      </button>
      {open && <div className="px-6 pb-6 pt-2 text-base text-gray-600 dark:text-gray-400">{children}</div>}
    </div>
  );
};

Accordion.Item = AccordionItem; 