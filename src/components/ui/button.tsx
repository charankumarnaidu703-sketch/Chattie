import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
  {
    variants: {
      variant: {
        default: 'bg-primary text-on-primary shadow hover:bg-primary-container focus-visible:ring-primary',
        destructive: 'bg-error text-on-error shadow-sm hover:bg-error/90 focus-visible:ring-error',
        outline: 'border border-outline-variant/30 bg-surface-container-lowest shadow-sm hover:bg-surface-container hover:text-on-background',
        secondary: 'bg-surface-container text-on-background shadow-sm hover:bg-surface-container-high',
        ghost: 'hover:bg-surface-container hover:text-on-background',
        link: 'text-primary underline-offset-4 hover:underline',
        warning: 'bg-secondary text-on-secondary shadow-sm hover:bg-secondary-container focus-visible:ring-secondary',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-12 rounded-lg px-8 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
