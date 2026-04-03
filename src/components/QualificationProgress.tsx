import { cn } from '@/lib/utils';

type StepStatus = 'completed' | 'active' | 'upcoming';

interface QualificationProgressProps {
  currentStep: number;
  totalSteps?: number;
  className?: string;
  color?: 'primary' | 'secondary' | 'tertiary';
}

export function QualificationProgress({
  currentStep,
  totalSteps = 5,
  className,
  color = 'primary',
}: QualificationProgressProps) {
  const colorMap = {
    primary: 'bg-primary',
    secondary: 'bg-secondary',
    tertiary: 'bg-tertiary',
  };

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="flex gap-1">
        {Array.from({ length: totalSteps }, (_, i) => {
          const status: StepStatus = i < currentStep ? 'completed' : i === currentStep ? 'active' : 'upcoming';
          return (
            <div
              key={i}
              className={cn(
                'w-2 h-2 rounded-full transition-colors',
                status === 'completed' || status === 'active'
                  ? colorMap[color]
                  : 'bg-outline-variant/30'
              )}
            />
          );
        })}
      </div>
      <span className="font-label text-[10px] text-on-surface-variant/70 font-semibold uppercase">
        {currentStep}/{totalSteps} stappen
      </span>
    </div>
  );
}

/** Bar-style progress for conversation detail */
export function QualificationProgressBar({
  currentStep,
  totalSteps = 5,
  className,
}: QualificationProgressProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <div className="flex gap-1.5">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div
            key={i}
            className={cn(
              'h-1.5 w-6 rounded-full transition-colors',
              i < currentStep ? 'bg-primary' : 'bg-outline-variant/30'
            )}
          />
        ))}
      </div>
      <span className="font-label text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
        {currentStep}/{totalSteps} stappen gekwalificeerd
      </span>
    </div>
  );
}
