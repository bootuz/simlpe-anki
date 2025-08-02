import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export const LoadingSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-5 w-16" />
            </div>
            <Skeleton className="h-8 w-8" />
          </div>
          
          <div className="space-y-3">
            <div>
              <Skeleton className="h-3 w-12 mb-1" />
              <Skeleton className="h-16 w-full" />
            </div>
            
            <div>
              <Skeleton className="h-3 w-12 mb-1" />
              <Skeleton className="h-16 w-full" />
            </div>
          </div>
          
          <div className="pt-2 border-t">
            <Skeleton className="h-3 w-24" />
          </div>
        </Card>
      ))}
    </div>
  );
};