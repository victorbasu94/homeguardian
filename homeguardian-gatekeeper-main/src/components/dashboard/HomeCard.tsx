
import { Home as HomeIcon, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export interface HomeData {
  id: string;
  name: string;
  address: string;
  year_built: number;
  square_feet: number;
  image_url?: string;
}

interface HomeCardProps {
  home: HomeData;
  className?: string;
}

const HomeCard = ({ home, className }: HomeCardProps) => {
  return (
    <div 
      className={cn(
        "group relative bg-white border border-border/50 shadow-sm rounded-lg overflow-hidden transition-all hover:shadow-md hover:border-primary/20",
        className
      )}
    >
      <div className="aspect-video bg-muted/30 relative">
        {home.image_url ? (
          <img 
            src={home.image_url} 
            alt={home.name} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <HomeIcon className="w-12 h-12 opacity-50" />
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold line-clamp-1 mb-1">{home.name}</h3>
        <p className="text-sm text-muted-foreground line-clamp-1 mb-3">{home.address}</p>
        
        <div className="grid grid-cols-2 gap-2 text-sm mb-4">
          <div className="flex flex-col">
            <span className="text-muted-foreground">Built</span>
            <span className="font-medium">{home.year_built}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground">Size</span>
            <span className="font-medium">{home.square_feet} sq ft</span>
          </div>
        </div>
        
        <Link 
          to={`/homes/${home.id}`} 
          className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          aria-label={`View details for ${home.name}`}
        >
          View details
          <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </div>
    </div>
  );
};

export default HomeCard;
