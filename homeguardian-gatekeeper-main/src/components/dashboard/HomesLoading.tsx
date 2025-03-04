
import { Home as HomeIcon } from "lucide-react";

const HomesLoading = () => {
  // Create an array of 6 placeholders
  const placeholders = Array(6).fill(null);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {placeholders.map((_, index) => (
        <div key={index} className="bg-white border border-border/30 rounded-lg overflow-hidden shadow-sm">
          <div className="aspect-video bg-muted/20 flex items-center justify-center">
            <HomeIcon className="w-12 h-12 text-muted-foreground/30 animate-pulse" />
          </div>
          
          <div className="p-4 space-y-3">
            <div className="h-6 bg-muted/30 rounded-md animate-pulse" />
            <div className="h-4 bg-muted/20 rounded-md w-3/4 animate-pulse" />
            
            <div className="grid grid-cols-2 gap-2 pt-2">
              <div className="space-y-1">
                <div className="h-4 bg-muted/20 rounded-md w-1/2 animate-pulse" />
                <div className="h-5 bg-muted/30 rounded-md w-1/3 animate-pulse" />
              </div>
              <div className="space-y-1">
                <div className="h-4 bg-muted/20 rounded-md w-1/2 animate-pulse" />
                <div className="h-5 bg-muted/30 rounded-md w-2/3 animate-pulse" />
              </div>
            </div>
            
            <div className="pt-2">
              <div className="h-5 bg-muted/30 rounded-md w-1/3 animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default HomesLoading;
