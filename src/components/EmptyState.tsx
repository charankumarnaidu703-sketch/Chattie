import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  message: string;
  subMessage?: string;
  className?: string;
}

export function EmptyState({ icon: Icon, message, subMessage, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-4 text-center', className)}>
      <div className="mb-6 flex items-center justify-center">
        {Icon ? (
          <div className="p-4 rounded-full bg-surface-container-low border border-outline-variant/10 text-primary">
            <Icon className="h-10 w-10 animate-pulse" />
          </div>
        ) : (
          /* Premium Organic Gardening SVG Illustration (Plant in a Pot) */
          <svg className="w-24 h-24 text-primary/40 animate-pulse" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 80V50" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            {/* Leaves */}
            <path d="M50 60C42 55 25 55 25 38C25 22 42 28 50 48" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" fillOpacity="0.05" />
            <path d="M50 52C58 47 75 47 75 30C75 14 58 20 50 40" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" fillOpacity="0.05" />
            <path d="M50 70C40 66 32 62 32 52C32 42 40 40 50 58" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" fillOpacity="0.05" />
            {/* Flower Pot */}
            <path d="M35 76H65L60 94H40L35 76Z" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
            <line x1="32" y1="76" x2="68" y2="76" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
          </svg>
        )}
      </div>
      <h3 className="font-headline font-extrabold text-on-background text-lg max-w-sm tracking-tight">{message}</h3>
      {subMessage && (
        <p className="text-sm text-outline text-center mt-2 max-w-sm leading-relaxed font-body">{subMessage}</p>
      )}
    </div>
  );
}
