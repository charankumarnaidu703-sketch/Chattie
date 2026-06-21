import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary/10 text-primary',
        secondary: 'border-transparent bg-surface-container-high text-on-surface-variant',
        destructive: 'border-transparent bg-error/10 text-error',
        outline: 'text-on-surface-variant border-outline-variant/10',
        success: 'border-transparent bg-primary/10 text-primary',
        warning: 'border-transparent bg-secondary/10 text-secondary',
        info: 'border-transparent bg-tertiary/10 text-tertiary',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
