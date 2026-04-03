import React from 'react';
import { Skeleton } from '../ui/skeleton';

export function ProductSkeleton() {
  return (
    <div
      className="flex flex-col w-full h-full bg-white border rounded-xl max-w-xs sm:max-w-md mx-auto"
      aria-busy="true"
    >
      {/* Card Content */}
      <div className="flex-1 p-4">
        {/* Responsive Image Placeholder */}
        <div className="relative w-full border aspect-square rounded-2xl overflow-hidden">
          <Skeleton className="w-full h-full" />
        </div>

        {/* Title Placeholder */}
        <Skeleton className="h-5 lg:h-6 w-3/4 my-4" />

        {/* Language & Books Info Placeholders */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2 border p-1.5 max-w-max rounded-xl">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="border p-1.5 rounded-xl max-w-max">
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </div>

      {/* Divider Placeholder */}
      <Skeleton className="border-l mt-1 border-b max-w-[90%] w-full mx-auto h-px" />

      {/* Card Footer Placeholder */}
      <div className="flex flex-wrap items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-24" />
        </div>
        <Skeleton className="w-full sm:w-24 h-10 mt-4 sm:mt-0 p-2 px-4 rounded-xl" />
      </div>
    </div>
  );
}

export function ProductSkeletonGrid() {
  return (
    <>
      {/* Desktop grid */}
      <div className="hidden md:grid px-8 grid-cols-1 sm:grid-cols-2 sm:px-10 md:grid-cols-2 md:px-20 lg:grid-cols-2 lg:px-30 xl:grid-cols-3 xl:px-1 gap-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <ProductSkeleton key={index} />
        ))}
      </div>

      {/* Mobile grid */}
      <div className="flex md:hidden gap-6 px-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="flex-shrink-0 w-[280px] sm:w-[300px] snap-center"
          >
            <ProductSkeleton />
          </div>
        ))}
      </div>
    </>
  );
}
