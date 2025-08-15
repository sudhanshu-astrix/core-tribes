import React from 'react';
import { cn } from '../../lib/utils';

export const Table: React.FC<React.TableHTMLAttributes<HTMLTableElement>> & {
  Head: typeof TableHead;
  Body: typeof TableBody;
  Row: typeof TableRow;
  Header: typeof TableHeader;
  Cell: typeof TableCell;
} = ({ className, ...props }) => (
  <div className="overflow-x-auto rounded-xl shadow-card bg-lightCard dark:bg-darkCard">
    <table className={cn('min-w-full text-base', className)} {...props} />
  </div>
);

const TableHead: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ className, ...props }) => (
  <thead className={cn('bg-accent/10 text-accent', className)} {...props} />
);

const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ className, ...props }) => (
  <tbody className={cn('', className)} {...props} />
);

const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({ className, ...props }) => (
  <tr className={cn('hover:bg-lightBg dark:hover:bg-darkBg transition-colors', className)} {...props} />
);

const TableHeader: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({ className, ...props }) => (
  <th className={cn('px-6 py-3 text-left font-semibold', className)} {...props} />
);

const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({ className, ...props }) => (
  <td className={cn('px-6 py-3', className)} {...props} />
);

Table.Head = TableHead;
Table.Body = TableBody;
Table.Row = TableRow;
Table.Header = TableHeader;
Table.Cell = TableCell; 