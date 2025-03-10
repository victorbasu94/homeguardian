import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Shield, ChevronDown, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-background/95 backdrop-blur-md shadow-sm border-b border-border/20' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo - always links to root */}
          <Link to="/" className="flex items-center gap-2 z-10">
            <Shield className={`h-5 w-5 ${isScrolled ? 'text-primary' : 'text-white'}`} />
            <span className={`text-base font-medium ${isScrolled ? 'text-foreground' : 'text-white'}`}>
              HomeGuardian
            </span>
          </Link>

          {/* Mobile menu button */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)} 
            className={`md:hidden ${isScrolled ? 'text-foreground' : 'text-white'}`}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Desktop navigation - centered */}
          <nav className="hidden md:flex items-center justify-center flex-1 mx-4">
            <div className="flex items-center space-x-8">
              <Link 
                to="/how-it-works" 
                className={`font-medium text-sm transition-colors ${
                  isActive('/how-it-works') 
                    ? (isScrolled ? 'text-foreground' : 'text-white') 
                    : (isScrolled ? 'text-muted-foreground hover:text-foreground' : 'text-white/80 hover:text-white')
                }`}
              >
                How It Works
              </Link>
              
              <Link 
                to="/pricing" 
                className={`font-medium text-sm transition-colors ${
                  isActive('/pricing') 
                    ? (isScrolled ? 'text-foreground' : 'text-white') 
                    : (isScrolled ? 'text-muted-foreground hover:text-foreground' : 'text-white/80 hover:text-white')
                }`}
              >
                Pricing
              </Link>
              
              <Link 
                to="/faq" 
                className={`font-medium text-sm transition-colors ${
                  isActive('/faq') 
                    ? (isScrolled ? 'text-foreground' : 'text-white') 
                    : (isScrolled ? 'text-muted-foreground hover:text-foreground' : 'text-white/80 hover:text-white')
                }`}
              >
                FAQ
              </Link>
            </div>
          </nav>
            
          <div className="flex items-center space-x-4">
            {user ? (
              <Link to="/dashboard">
                <Button 
                  size="default"
                  className={`${
                    isScrolled 
                      ? 'bg-primary text-white hover:bg-primary-dark' 
                      : 'bg-white text-primary hover:bg-white/90'
                  }`}
                >
                  Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className={`font-medium ${
                      isScrolled ? 'text-foreground hover:text-primary' : 'text-white hover:text-white/80'
                    }`}
                  >
                    Log In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button 
                    size="sm"
                    className={`${
                      isScrolled 
                        ? 'bg-primary text-white hover:bg-primary-dark' 
                        : 'bg-white text-primary hover:bg-white/90'
                    }`}
                  >
                    Open Account
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div 
        className={`md:hidden transition-all duration-300 overflow-hidden ${
          isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 pt-2 pb-6 bg-background border-t border-border/20 space-y-1">
          <Link 
            to="/how-it-works" 
            className={`block py-2 text-base font-medium ${isActive('/how-it-works') ? 'text-primary' : 'text-foreground'}`}
            onClick={closeMenu}
          >
            How It Works
          </Link>
          <Link 
            to="/pricing" 
            className={`block py-2 text-base font-medium ${isActive('/pricing') ? 'text-primary' : 'text-foreground'}`}
            onClick={closeMenu}
          >
            Pricing
          </Link>
          <Link 
            to="/faq" 
            className={`block py-2 text-base font-medium ${isActive('/faq') ? 'text-primary' : 'text-foreground'}`}
            onClick={closeMenu}
          >
            FAQ
          </Link>
          
          <div className="pt-4 border-t border-border/20 flex flex-col space-y-3">
            {user ? (
              <Link 
                to="/dashboard" 
                className="w-full"
                onClick={closeMenu}
              >
                <Button className="w-full">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="w-full"
                  onClick={closeMenu}
                >
                  <Button variant="outline" className="w-full">
                    Log In
                  </Button>
                </Link>
                <Link 
                  to="/register" 
                  className="w-full"
                  onClick={closeMenu}
                >
                  <Button className="w-full">
                    Open Account
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
