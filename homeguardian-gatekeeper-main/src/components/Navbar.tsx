import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShieldCheck, ArrowRight, User } from 'lucide-react';
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
        isScrolled ? 'bg-[#F5F5F5]/95 backdrop-blur-md shadow-md border-b border-[#D4C7A9]/30' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2 z-10">
            <ShieldCheck className={`h-6 w-6 ${isScrolled ? 'text-[#1A2526]' : 'text-white'} stroke-[1.5px]`} />
            <span className={`text-xl font-bold ${isScrolled ? 'text-[#1A2526]' : 'text-white'}`}>
              HomeGuardian
            </span>
          </Link>

          {/* Mobile menu button */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)} 
            className={`md:hidden ${isScrolled ? 'text-[#1A2526]' : 'text-white'}`}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} className="stroke-[1.5px]" /> : <Menu size={24} className="stroke-[1.5px]" />}
          </button>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className={`font-medium text-base transition-colors ${
                isActive('/') 
                  ? (isScrolled ? 'text-[#1A2526]' : 'text-white font-semibold') 
                  : (isScrolled ? 'text-[#4A4A4A] hover:text-[#A3BFFA]' : 'text-white/90 hover:text-white')
              }`}
            >
              Home
            </Link>
            <Link 
              to="/how-it-works" 
              className={`font-medium text-base transition-colors ${
                isActive('/how-it-works') 
                  ? (isScrolled ? 'text-[#1A2526]' : 'text-white font-semibold') 
                  : (isScrolled ? 'text-[#4A4A4A] hover:text-[#A3BFFA]' : 'text-white/90 hover:text-white')
              }`}
            >
              How It Works
            </Link>
            <Link 
              to="/pricing" 
              className={`font-medium text-base transition-colors ${
                isActive('/pricing') 
                  ? (isScrolled ? 'text-[#1A2526]' : 'text-white font-semibold') 
                  : (isScrolled ? 'text-[#4A4A4A] hover:text-[#A3BFFA]' : 'text-white/90 hover:text-white')
              }`}
            >
              Pricing
            </Link>
            <Link 
              to="/faq" 
              className={`font-medium text-base transition-colors ${
                isActive('/faq') 
                  ? (isScrolled ? 'text-[#1A2526]' : 'text-white font-semibold') 
                  : (isScrolled ? 'text-[#4A4A4A] hover:text-[#A3BFFA]' : 'text-white/90 hover:text-white')
              }`}
            >
              FAQ
            </Link>
            
            <div className="flex items-center space-x-4">
              {user ? (
                <Link 
                  to="/dashboard" 
                  className={`flex items-center space-x-2 text-base font-medium transition-colors ${
                    isScrolled ? 'text-[#A3BFFA] hover:text-[#A3BFFA]/80' : 'text-white hover:text-[#A3BFFA]'
                  }`}
                >
                  <User className="h-4 w-4 stroke-[1.5px]" />
                  <span>Dashboard</span>
                </Link>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className={`text-base font-medium transition-colors ${
                      isScrolled ? 'text-[#A3BFFA] hover:text-[#A3BFFA]/80' : 'text-white hover:text-[#A3BFFA]'
                    }`}
                  >
                    Log In
                  </Link>
                  <Link 
                    to="/register" 
                    className="bg-[#A3BFFA] text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-[#A3BFFA]/90 transition-all duration-300 flex items-center"
                  >
                    Get Started <ArrowRight className="ml-2 h-4 w-4 stroke-[1.5px]" />
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-[#F5F5F5] noise-texture">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center mb-6">
              <Link to="/" className="flex items-center gap-2" onClick={closeMenu}>
                <ShieldCheck className="h-6 w-6 text-[#1A2526] stroke-[1.5px]" />
                <span className="text-xl font-bold text-[#1A2526]">HomeGuardian</span>
              </Link>
              <button 
                onClick={closeMenu} 
                className="text-[#1A2526]"
                aria-label="Close menu"
              >
                <X size={24} className="stroke-[1.5px]" />
              </button>
            </div>
            
            <nav className="flex flex-col space-y-4">
              <Link 
                to="/" 
                className="text-lg font-medium text-[#1A2526]"
                onClick={closeMenu}
              >
                Home
              </Link>
              <Link 
                to="/how-it-works" 
                className="text-lg font-medium text-[#1A2526]"
                onClick={closeMenu}
              >
                How It Works
              </Link>
              <Link 
                to="/pricing" 
                className="text-lg font-medium text-[#1A2526]"
                onClick={closeMenu}
              >
                Pricing
              </Link>
              <Link 
                to="/faq" 
                className="text-lg font-medium text-[#1A2526]"
                onClick={closeMenu}
              >
                FAQ
              </Link>
              
              <div className="pt-4 flex flex-col space-y-3">
                {user ? (
                  <Link 
                    to="/dashboard" 
                    className="flex items-center space-x-2 text-lg font-medium text-[#A3BFFA]"
                    onClick={closeMenu}
                  >
                    <User className="h-5 w-5 stroke-[1.5px]" />
                    <span>Dashboard</span>
                  </Link>
                ) : (
                  <>
                    <Link 
                      to="/login" 
                      className="text-lg font-medium text-[#A3BFFA]"
                      onClick={closeMenu}
                    >
                      Log In
                    </Link>
                    <Link 
                      to="/register" 
                      className="bg-[#A3BFFA] text-white px-3 py-2 rounded-lg text-base font-medium hover:bg-[#A3BFFA]/90 transition-all duration-300 inline-flex items-center w-fit"
                      onClick={closeMenu}
                    >
                      Get Started <ArrowRight className="ml-2 h-4 w-4 stroke-[1.5px]" />
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
