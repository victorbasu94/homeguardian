
import { Home as HomeIcon, PlusCircle } from "lucide-react";
import { Link } from "react-router-dom";

interface HomesEmptyStateProps {
  error?: boolean;
}

const HomesEmptyState = ({ error = false }: HomesEmptyStateProps) => {
  return (
    <div className="bg-white border border-border/50 rounded-lg shadow-sm p-8 text-center">
      <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-muted/30 mb-4">
        <HomeIcon className="w-8 h-8 text-muted-foreground" />
      </div>
      
      <h3 className="text-xl font-semibold mb-2">
        {error ? "Couldn't load homes" : "No homes found"}
      </h3>
      
      <p className="text-muted-foreground max-w-md mx-auto mb-6">
        {error 
          ? "We encountered an error while loading your homes. Please try again later or contact support if the issue persists."
          : "You haven't added any homes to your HomeGuardian account yet. Add your first home to start protecting it."
        }
      </p>
      
      {!error && (
        <Link 
          to="/homes/new" 
          className="inline-flex items-center px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <PlusCircle className="mr-2 h-5 w-5" />
          Add Your First Home
        </Link>
      )}
      
      {error && (
        <button 
          onClick={() => window.location.reload()}
          className="inline-flex items-center px-4 py-2 rounded-md bg-muted text-foreground hover:bg-muted/80 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
};

export default HomesEmptyState;
