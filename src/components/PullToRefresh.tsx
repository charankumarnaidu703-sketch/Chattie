'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface PullToRefreshProps {
  children: React.ReactNode;
}

export function PullToRefresh({ children }: PullToRefreshProps) {
  const router = useRouter();
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const touchStartRef = useRef<number | null>(null);
  const PULL_THRESHOLD = 80; // px

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      // Only pull to refresh if we are at the top of the page
      if (window.scrollY === 0) {
        touchStartRef.current = e.touches[0].clientY;
      } else {
        touchStartRef.current = null;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (touchStartRef.current === null || isRefreshing) return;

      const currentY = e.touches[0].clientY;
      const diff = currentY - touchStartRef.current;

      if (diff > 0) {
        // Resistance formula for pull
        const distance = Math.min(diff * 0.4, PULL_THRESHOLD + 20);
        setPullDistance(distance);
        
        // Prevent default browser refresh/pull if possible
        if (e.cancelable && distance > 10) {
          e.preventDefault();
        }
      }
    };

    const handleTouchEnd = () => {
      if (touchStartRef.current === null || isRefreshing) return;

      if (pullDistance >= PULL_THRESHOLD) {
        triggerRefresh();
      } else {
        // Snap back
        setPullDistance(0);
      }
      touchStartRef.current = null;
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [pullDistance, isRefreshing]);

  const triggerRefresh = () => {
    setIsRefreshing(true);
    setPullDistance(PULL_THRESHOLD);
    
    // Trigger Next.js router refresh to fetch new server data
    router.refresh();
    
    // Simulate cooldown
    setTimeout(() => {
      setIsRefreshing(false);
      setPullDistance(0);
    }, 1000);
  };

  return (
    <div className="relative">
      {/* Pull indicator */}
      <div
        className="flex items-center justify-center overflow-hidden transition-all duration-200"
        style={{
          height: `${pullDistance}px`,
          opacity: pullDistance > 0 ? 1 : 0,
        }}
      >
        <div className="bg-surface-container shadow-ambient rounded-full p-2.5 flex items-center justify-center border border-outline-variant/10">
          <Loader2
            className={`h-5 w-5 text-primary ${isRefreshing ? 'animate-spin' : ''}`}
            style={{
              transform: isRefreshing ? undefined : `rotate(${pullDistance * 4.5}deg)`,
            }}
          />
        </div>
      </div>
      
      {/* Content wrapper */}
      <div>{children}</div>
    </div>
  );
}
