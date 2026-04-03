import { cn } from '@/lib/utils';

type StatusType = 'active' | 'paused' | 'qualified' | 'closed';

const statusConfig: Record<StatusType, { label: string; color: string }> = {
  active: {
    label: 'Bot actief',
    color: 'text-primary bg-primary/10 border-primary/20',
  },
  paused: {
    label: 'Bot gepauzeerd',
    color: 'text-secondary bg-secondary/10 border-secondary/20',
  },
  qualified: {
    label: 'Volledig gekwalificeerd',
    color: 'text-tertiary bg-tertiary/10 border-tertiary/20',
  },
  closed: {
    label: 'Gesloten',
    color: 'text-outline bg-outline/10 border-outline/20',
  },
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status as StatusType] ?? statusConfig.closed;

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-tight border',
        config.color,
        className
      )}
    >
      {config.label}
    </span>
  );
}

export function StatusDot({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    active: 'bg-primary',
    paused: 'bg-secondary',
    qualified: 'bg-tertiary',
    closed: 'bg-outline',
  };

  return (
    <div className={cn('w-3 h-3 rounded-full', colorMap[status] || 'bg-outline')} />
  );
}
