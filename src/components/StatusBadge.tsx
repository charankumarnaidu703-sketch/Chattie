import { Badge } from '@/components/ui/badge';
import { getStatusColor, getStatusLabel } from '@/lib/types';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge className={cn(getStatusColor(status), className)} variant="outline">
      {getStatusLabel(status)}
    </Badge>
  );
}
