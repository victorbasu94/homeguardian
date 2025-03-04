import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const HomesLoading: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((index) => (
        <div key={index} className="rounded-xl p-6 border border-gray-200 bg-white">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div>
                <Skeleton className="h-6 w-32 mb-1" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <Skeleton className="h-8 w-16 rounded-md" />
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
          </div>
          
          <Skeleton className="h-5 w-48 mb-4" />
          
          <div className="mt-4">
            <div className="flex justify-between items-center mb-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default HomesLoading;
