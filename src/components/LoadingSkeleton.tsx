import { Skeleton } from '@/components/ui/skeleton';

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border border-gray-200 bg-white p-6">
            <Skeleton className="h-4 w-24 mb-3" />
            <Skeleton className="h-8 w-16 mb-1" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>
      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <Skeleton className="h-5 w-40 mb-4" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-4 py-3 border-b border-gray-100">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ConversationListSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-3 mb-2">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-4 w-32 mb-1" />
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-3 w-full mt-2" />
          <div className="flex gap-0.5 mt-3">
            {[1, 2, 3, 4, 5].map((j) => (
              <Skeleton key={j} className="h-1.5 w-4 rounded-full" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function ChatSkeleton() {
  return (
    <div className="space-y-4 p-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
          <Skeleton
            className={`h-12 rounded-2xl ${i % 2 === 0 ? 'w-48' : 'w-56'}`}
          />
        </div>
      ))}
    </div>
  );
}
