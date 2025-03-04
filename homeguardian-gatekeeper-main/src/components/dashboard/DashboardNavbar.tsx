import { Link, useNavigate } from 'react-router-dom';
import { Shield, LogOut } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';

const DashboardNavbar = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  const onLogout = () => {
    logout();
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account."
    });
    navigate('/login');
  };
  
  return (
    <header className="border-b border-border/40 backdrop-blur-sm bg-background/95 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center space-x-2">
          <Shield className="h-6 w-6 text-primary" />
          <span className="text-lg font-medium">HomeGuardian</span>
        </Link>
        
        <button
          onClick={onLogout}
          className="flex items-center space-x-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Log out</span>
        </button>
      </div>
    </header>
  );
};

export default DashboardNavbar; 