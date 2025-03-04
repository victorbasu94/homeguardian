
import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Shield, LogOut } from 'lucide-react';
import { handleLogout } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { toast } = useToast();
  
  const onLogout = () => {
    handleLogout();
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account."
    });
    // Redirect happens automatically through auth state change
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border/40 backdrop-blur-sm bg-background/80 sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="text-lg font-medium">HomeGuardian</span>
          </Link>
          
          <button
            onClick={onLogout}
            className="flex items-center space-x-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </header>
      
      <main className="flex-1">
        {children}
      </main>
      
      <footer className="py-6 border-t border-border/40 bg-muted/30">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} HomeGuardian. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
