import { QUALIFICATION_STEPS, type Conversation } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface QualificationProgressProps {
  conversation: Conversation;
  compact?: boolean;
}

export function QualificationProgress({ conversation, compact = false }: QualificationProgressProps) {
  const completedSteps = QUALIFICATION_STEPS.filter((step) => {
    if (step.field === 'collected_photos') {
      return conversation.collected_photos && conversation.collected_photos.length > 0;
    }
    return conversation[step.field] !== null && conversation[step.field] !== undefined;
  }).length;

  if (compact) {
    return (
      <div className="flex items-center gap-1.5">
        <div className="flex gap-0.5">
          {QUALIFICATION_STEPS.map((step) => {
            const isCompleted =
              step.field === 'collected_photos'
                ? conversation.collected_photos && conversation.collected_photos.length > 0
                : conversation[step.field] !== null && conversation[step.field] !== undefined;

            return (
              <div
                key={step.step}
                className={cn(
                  'h-1.5 w-4 rounded-full transition-colors',
                  isCompleted ? 'bg-green-500' : 'bg-gray-200'
                )}
              />
            );
          })}
        </div>
        <span className="text-xs text-gray-500">{completedSteps}/5</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Kwalificatie</span>
        <span className="text-sm text-gray-500">{completedSteps}/5</span>
      </div>

      {/* Progress bar */}
      <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-500"
          style={{ width: `${(completedSteps / 5) * 100}%` }}
        />
      </div>

      {/* Step list */}
      <div className="space-y-2">
        {QUALIFICATION_STEPS.map((step) => {
          const isCompleted =
            step.field === 'collected_photos'
              ? conversation.collected_photos && conversation.collected_photos.length > 0
              : conversation[step.field] !== null && conversation[step.field] !== undefined;

          const isCurrent = conversation.qualification_step === step.step;

          const value =
            step.field === 'collected_photos'
              ? conversation.collected_photos?.length
                ? `${conversation.collected_photos.length} ontvangen`
                : null
              : conversation[step.field];

          return (
            <div
              key={step.step}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                isCurrent && !isCompleted && 'bg-green-50 border border-green-200',
                isCompleted && 'text-gray-700',
                !isCompleted && !isCurrent && 'text-gray-400'
              )}
            >
              <div
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-full text-xs flex-shrink-0',
                  isCompleted
                    ? 'bg-green-500 text-white'
                    : isCurrent
                    ? 'bg-green-100 text-green-700 border border-green-300'
                    : 'bg-gray-100 text-gray-400'
                )}
              >
                {isCompleted ? <Check className="h-3.5 w-3.5" /> : step.step}
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-medium">
                  {step.icon} {step.label}
                </span>
                {isCompleted && value && (
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    {String(value)}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
