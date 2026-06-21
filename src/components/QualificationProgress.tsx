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
    primary: 'bg-primary text-white border-primary',
    secondary: 'bg-secondary text-white border-secondary',
    tertiary: 'bg-tertiary text-white border-tertiary',
  };

  const ringMap = {
    primary: 'ring-primary/30',
    secondary: 'ring-secondary/30',
    tertiary: 'ring-tertiary/30',
  };

  const activeColorMap = {
    primary: 'bg-primary',
    secondary: 'bg-secondary',
    tertiary: 'bg-tertiary',
  };

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="flex gap-1.5 items-center">
        {Array.from({ length: totalSteps }, (_, i) => {
          const status: StepStatus = i < currentStep ? 'completed' : i === currentStep ? 'active' : 'upcoming';
          return (
            <div
              key={i}
              className={cn(
                'w-4 h-4 rounded-full flex items-center justify-center transition-all duration-300 relative border text-[8px] font-bold',
                status === 'completed'
                  ? colorMap[color]
                  : status === 'active'
                  ? cn('border-2 bg-transparent ring-4 animate-pulse', color === 'primary' ? 'border-primary ring-primary/20' : color === 'secondary' ? 'border-secondary ring-secondary/20' : 'border-tertiary ring-tertiary/20')
                  : 'bg-surface-container border-outline-variant/30 text-transparent'
              )}
            >
              {status === 'completed' ? (
                <svg className="w-2.5 h-2.5 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              ) : status === 'active' ? (
                <span className={cn('w-1.5 h-1.5 rounded-full animate-ping', activeColorMap[color])} />
              ) : null}
            </div>
          );
        })}
      </div>
      <span className="font-label text-[10px] text-on-surface-variant/70 font-semibold uppercase tracking-wider">
        {currentStep}/{totalSteps} steps
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
              'h-1.5 w-6 rounded-full transition-all duration-300',
              i < currentStep 
                ? 'bg-primary' 
                : i === currentStep 
                ? 'bg-primary/50 animate-pulse ring-2 ring-primary/20' 
                : 'bg-outline-variant/30'
            )}
          />
        ))}
      </div>
      <span className="font-label text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
        {currentStep}/{totalSteps} steps qualified
      </span>
    </div>
  );
}
