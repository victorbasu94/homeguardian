import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Shield, LogOut, User, Settings, Home, Bell } from 'lucide-react';
import { handleLogout } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import StickyCallToAction from './StickyCallToAction';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
  showStickyCallToAction?: boolean;
}

const Layout = ({ children, showStickyCallToAction = false }: LayoutProps) => {
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
    <div className="min-h-screen flex flex-col bg-softWhite">
      <header className="border-b border-gray-100 backdrop-blur-sm bg-white/90 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <Shield className="h-7 w-7 text-primary" />
            <span className="text-xl font-bold font-poppins text-primary">MaintainMint</span>
          </Link>
          
          <div className="flex items-center space-x-6">
            <Link to="/dashboard" className="text-neutral hover:text-primary transition-colors duration-300 flex items-center gap-2">
              <Home className="h-5 w-5" />
              <span className="hidden md:inline">Dashboard</span>
            </Link>
            
            <Link to="/notifications" className="text-neutral hover:text-primary transition-colors duration-300 flex items-center gap-2 relative">
              <Bell className="h-5 w-5" />
              <span className="hidden md:inline">Notifications</span>
              <span className="absolute -top-1 -right-1 bg-secondary text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">3</span>
            </Link>
            
            <Link to="/profile" className="text-neutral hover:text-primary transition-colors duration-300 flex items-center gap-2">
              <User className="h-5 w-5" />
              <span className="hidden md:inline">Profile</span>
            </Link>
            
            <Link to="/settings" className="text-neutral hover:text-primary transition-colors duration-300 flex items-center gap-2">
              <Settings className="h-5 w-5" />
              <span className="hidden md:inline">Settings</span>
            </Link>
            
            <button
              onClick={onLogout}
              className="flex items-center gap-2 text-neutral hover:text-secondary transition-colors duration-300 ml-2"
            >
              <LogOut className="h-5 w-5" />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>
      
      <main className="flex-1">
        {children}
        
        {showStickyCallToAction && <StickyCallToAction />}
      </main>
      
      <Footer />
    </div>
  );
};

export default Layout;
