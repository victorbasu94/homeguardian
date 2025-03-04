import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Shield, ArrowRight, User } from 'lucide-react';
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
        isScrolled ? 'bg-white/95 backdrop-blur-sm shadow-card' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-20 md:h-24">
          <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2 z-10">
            <Shield className={`h-8 w-8 ${isScrolled ? 'text-primary' : 'text-white'}`} />
            <span className={`text-2xl font-bold font-poppins ${isScrolled ? 'text-primary' : 'text-white'}`}>
              HomeGuardian
            </span>
          </Link>

          {/* Mobile menu button */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)} 
            className={`md:hidden ${isScrolled ? 'text-primary' : 'text-white'}`}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center space-x-10">
            <Link 
              to="/" 
              className={`font-medium text-base transition-colors hover:text-secondary ${
                isActive('/') 
                  ? (isScrolled ? 'text-primary' : 'text-white font-semibold') 
                  : (isScrolled ? 'text-neutral hover:text-primary' : 'text-white/90 hover:text-white')
              }`}
            >
              Home
            </Link>
            <Link 
              to="/how-it-works" 
              className={`font-medium text-base transition-colors hover:text-secondary ${
                isActive('/how-it-works') 
                  ? (isScrolled ? 'text-primary' : 'text-white font-semibold') 
                  : (isScrolled ? 'text-neutral hover:text-primary' : 'text-white/90 hover:text-white')
              }`}
            >
              How It Works
            </Link>
            <Link 
              to="/pricing" 
              className={`font-medium text-base transition-colors hover:text-secondary ${
                isActive('/pricing') 
                  ? (isScrolled ? 'text-primary' : 'text-white font-semibold') 
                  : (isScrolled ? 'text-neutral hover:text-primary' : 'text-white/90 hover:text-white')
              }`}
            >
              Pricing
            </Link>
            <Link 
              to="/faq" 
              className={`font-medium text-base transition-colors hover:text-secondary ${
                isActive('/faq') 
                  ? (isScrolled ? 'text-primary' : 'text-white font-semibold') 
                  : (isScrolled ? 'text-neutral hover:text-primary' : 'text-white/90 hover:text-white')
              }`}
            >
              FAQ
            </Link>
            
            <div className="flex items-center space-x-6">
              {user ? (
                <Link 
                  to="/dashboard" 
                  className={`flex items-center space-x-2 text-base font-medium transition-colors ${
                    isScrolled ? 'text-primary hover:text-primary-dark' : 'text-white hover:text-secondary'
                  }`}
                >
                  <User className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className={`text-base font-medium transition-colors ${
                      isScrolled ? 'text-primary hover:text-primary-dark' : 'text-white hover:text-secondary'
                    }`}
                  >
                    Log In
                  </Link>
                  <Link 
                    to="/register" 
                    className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4`}
                  >
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-background">
          <div className="container mx-auto px-4 py-6">
            <div className="flex justify-between items-center mb-8">
              <Link to="/" className="flex items-center gap-2" onClick={closeMenu}>
                <Shield className="h-8 w-8 text-primary" />
                <span className="text-2xl font-bold text-primary font-poppins">HomeGuardian</span>
              </Link>
              <button 
                onClick={closeMenu} 
                className="text-primary"
                aria-label="Close menu"
              >
                <X size={28} />
              </button>
            </div>
            
            <nav className="flex flex-col space-y-6">
              <Link 
                to="/" 
                className="text-xl font-medium text-foreground"
                onClick={closeMenu}
              >
                Home
              </Link>
              <Link 
                to="/how-it-works" 
                className="text-xl font-medium text-foreground"
                onClick={closeMenu}
              >
                How It Works
              </Link>
              <Link 
                to="/pricing" 
                className="text-xl font-medium text-foreground"
                onClick={closeMenu}
              >
                Pricing
              </Link>
              <Link 
                to="/faq" 
                className="text-xl font-medium text-foreground"
                onClick={closeMenu}
              >
                FAQ
              </Link>
              
              <div className="pt-6 flex flex-col space-y-4">
                {user ? (
                  <Link 
                    to="/dashboard" 
                    className="flex items-center space-x-2 text-xl font-medium text-primary"
                    onClick={closeMenu}
                  >
                    <User className="h-5 w-5" />
                    <span>Dashboard</span>
                  </Link>
                ) : (
                  <>
                    <Link 
                      to="/login" 
                      className="text-xl font-medium text-primary"
                      onClick={closeMenu}
                    >
                      Log In
                    </Link>
                    <Link 
                      to="/register" 
                      className="inline-flex items-center justify-center rounded-md text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-12 py-2 px-4"
                      onClick={closeMenu}
                    >
                      Get Started <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
