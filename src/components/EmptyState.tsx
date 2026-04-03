import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  message: string;
  subMessage?: string;
  className?: string;
}

export function EmptyState({ message, subMessage, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4', className)}>
      <p className="font-headline font-semibold text-on-surface-variant text-center">{message}</p>
      {subMessage && (
        <p className="text-sm text-outline text-center mt-2 max-w-xs leading-relaxed">{subMessage}</p>
      )}
    </div>
  );
}
