"use client";

import React, { useEffect, useRef, useCallback } from "react";
import { Loader2, Sparkles } from "lucide-react";

interface InfiniteScrollTriggerProps {
  hasNextPage: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
  threshold?: number; // How far from bottom to trigger (in pixels)
  rootMargin?: string; // Intersection observer root margin
}

export function InfiniteScrollTrigger({
  hasNextPage,
  isLoadingMore,
  onLoadMore,
  threshold = 800, // Trigger when 800px from bottom
  rootMargin = "200px", // Start observing 200px before element comes into view
}: InfiniteScrollTriggerProps) {
  const triggerRef = useRef<HTMLDivElement>(null);
  const hasTriggeredRef = useRef(false);

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;

      if (
        entry.isIntersecting &&
        hasNextPage &&
        !isLoadingMore &&
        !hasTriggeredRef.current
      ) {
        hasTriggeredRef.current = true;
        console.log("🔄 Infinite scroll triggered via intersection observer");
        // Small delay to prevent rapid-fire requests
        setTimeout(() => {
          onLoadMore();
        }, 100);
      }
    },
    [hasNextPage, isLoadingMore, onLoadMore]
  );

  // Reset trigger flag when loading completes
  useEffect(() => {
    if (!isLoadingMore) {
      hasTriggeredRef.current = false;
    }
  }, [isLoadingMore]);

  // Set up intersection observer
  useEffect(() => {
    const element = triggerRef.current;
    if (!element || !hasNextPage) return;

    const observer = new IntersectionObserver(handleIntersection, {
      root: null, // Use viewport as root
      rootMargin, // Start observing before element is visible
      threshold: 0.1, // Trigger when 10% of element is visible
    });

    observer.observe(element);

    return () => {
      observer.unobserve(element);
      observer.disconnect();
    };
  }, [handleIntersection, hasNextPage, rootMargin]);

  // Alternative scroll-based trigger as fallback
  useEffect(() => {
    if (!hasNextPage || isLoadingMore) return;

    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      const distanceFromBottom = documentHeight - (scrollTop + windowHeight);

      if (distanceFromBottom < threshold && !hasTriggeredRef.current) {
        hasTriggeredRef.current = true;
        console.log("📜 Scroll-based infinite loading triggered");
        setTimeout(() => {
          onLoadMore();
        }, 100);
      }
    };

    const throttledHandleScroll = throttle(handleScroll, 200);

    window.addEventListener("scroll", throttledHandleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", throttledHandleScroll);
    };
  }, [hasNextPage, isLoadingMore, onLoadMore, threshold]);

  // Don't render anything if there are no more pages
  if (!hasNextPage) {
    return (
      <div className="flex flex-col items-center py-12 text-center">
        <Sparkles className="w-8 h-8 text-purple-500 mb-3 animate-pulse" />
        <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-1">
          You've reached the end!
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No more wallpapers to load
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Intersection observer trigger element */}
      <div
        ref={triggerRef}
        className="flex justify-center py-8"
        style={{ minHeight: "1px" }}
      >
        {isLoadingMore && (
          <div className="flex flex-col items-center space-y-4">
            
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
              <div
                className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className="w-2 h-2 bg-pink-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// Throttle function to limit how often scroll events fire
function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func.apply(null, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
