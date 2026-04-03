import { Skeleton } from '~/components/ui/skeleton';

export function BlogCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <Skeleton className="aspect-[2/1] w-full rounded-none" />
      <div className="p-6">
        <Skeleton className="h-3 w-48 mb-2" />
        <Skeleton className="h-6 w-full mb-3" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-3/4 mb-4" />
        <hr className="border-gray-100 my-4" />
        <div className="flex justify-between">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    </div>
  );
}
