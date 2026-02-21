'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

function Sheet({ open, onOpenChange, children }: SheetProps) {
  // Close on Escape
  React.useEffect(() => {
    if (!open) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onOpenChange]);

  // Prevent body scroll when open
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  return <>{children}</>;
}

function SheetOverlay({ onClick }: { onClick: () => void }) {
  return (
    <div
      className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity"
      onClick={onClick}
    />
  );
}

interface SheetContentProps extends React.HTMLAttributes<HTMLDivElement> {
  onClose: () => void;
  side?: 'left' | 'right' | 'top' | 'bottom';
}

function SheetContent({
  onClose,
  side = 'right',
  className,
  children,
  ...props
}: SheetContentProps) {
  const sideClasses = {
    left: 'inset-y-0 left-0 w-3/4 max-w-sm border-r',
    right: 'inset-y-0 right-0 w-3/4 max-w-sm border-l',
    top: 'inset-x-0 top-0 max-h-[85vh] border-b rounded-b-2xl',
    bottom: 'inset-x-0 bottom-0 max-h-[85vh] border-t rounded-t-2xl',
  };

  return (
    <>
      <SheetOverlay onClick={onClose} />
      <div
        className={cn(
          'fixed z-50 bg-white p-6 shadow-xl transition-transform duration-300',
          sideClasses[side],
          className
        )}
        {...props}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Sluiten</span>
        </button>
        {children}
      </div>
    </>
  );
}

function SheetHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col space-y-2 mb-4', className)} {...props} />;
}

function SheetTitle({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('text-lg font-semibold', className)} {...props} />;
}

export { Sheet, SheetContent, SheetHeader, SheetTitle };
