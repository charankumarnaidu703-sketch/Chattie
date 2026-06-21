'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import React from 'react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="hidden md:flex items-center gap-1.5 font-label text-xs font-semibold text-outline mb-4" aria-label="Breadcrumb">
      <Link
        href="/dashboard"
        className="flex items-center gap-1 hover:text-on-surface-variant transition-colors"
      >
        <Home className="h-3.5 w-3.5" />
        <span className="sr-only">Dashboard</span>
      </Link>

      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;

        return (
          <React.Fragment key={idx}>
            <ChevronRight className="h-3 w-3 text-outline-variant/60" aria-hidden="true" />
            {isLast || !item.href ? (
              <span className="text-on-surface-variant font-bold truncate max-w-[200px]" aria-current="page">
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="hover:text-on-surface-variant transition-colors truncate max-w-[150px]"
              >
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
