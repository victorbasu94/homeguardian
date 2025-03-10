import { Link, useNavigate } from 'react-router-dom';
import { Shield, LogOut, User, Bell, Settings } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const DashboardNavbar = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  
  const onLogout = () => {
    logout();
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account."
    });
    navigate('/login');
  };
  
  const getInitials = (email: string) => {
    return email
      .split('@')[0]
      .substring(0, 2)
      .toUpperCase();
  };
  
  return (
    <header className="border-b border-border bg-white sticky top-0 z-50 h-16">
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center space-x-2">
          <Shield className="h-5 w-5 text-primary" />
          <span className="text-base font-medium">HomeGuardian</span>
        </Link>
        
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <Bell className="h-5 w-5" />
          </Button>
          
          <Button variant="ghost" size="icon" className="text-muted-foreground" onClick={() => navigate('/settings')}>
            <Settings className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center space-x-3 pl-2 border-l border-border">
            <Avatar className="h-8 w-8 bg-primary/10">
              <AvatarFallback className="text-primary text-xs">
                {user?.email ? getInitials(user.email) : 'U'}
              </AvatarFallback>
            </Avatar>
            
            <button
              onClick={onLogout}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Log out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardNavbar; 