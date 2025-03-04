
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Shield } from 'lucide-react';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

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
        isScrolled ? 'bg-white/90 backdrop-blur-sm shadow-sm' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link to="/" className="flex items-center gap-2 z-10">
            <Shield className={`h-7 w-7 ${isScrolled ? 'text-primary' : 'text-white'}`} />
            <span className={`text-xl font-bold font-outfit ${isScrolled ? 'text-primary' : 'text-white'}`}>
              HomeGuardian
            </span>
          </Link>

          {/* Mobile menu button */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)} 
            className={`md:hidden ${isScrolled ? 'text-primary' : 'text-white'}`}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className={`font-medium text-sm transition-colors ${
                isActive('/') 
                  ? (isScrolled ? 'text-primary' : 'text-white font-semibold') 
                  : (isScrolled ? 'text-gray-700 hover:text-primary' : 'text-white/90 hover:text-white')
              }`}
            >
              Home
            </Link>
            <Link 
              to="/how-it-works" 
              className={`font-medium text-sm transition-colors ${
                isActive('/how-it-works') 
                  ? (isScrolled ? 'text-primary' : 'text-white font-semibold') 
                  : (isScrolled ? 'text-gray-700 hover:text-primary' : 'text-white/90 hover:text-white')
              }`}
            >
              How It Works
            </Link>
            <Link 
              to="/pricing" 
              className={`font-medium text-sm transition-colors ${
                isActive('/pricing') 
                  ? (isScrolled ? 'text-primary' : 'text-white font-semibold') 
                  : (isScrolled ? 'text-gray-700 hover:text-primary' : 'text-white/90 hover:text-white')
              }`}
            >
              Pricing
            </Link>
            <Link 
              to="/faq" 
              className={`font-medium text-sm transition-colors ${
                isActive('/faq') 
                  ? (isScrolled ? 'text-primary' : 'text-white font-semibold') 
                  : (isScrolled ? 'text-gray-700 hover:text-primary' : 'text-white/90 hover:text-white')
              }`}
            >
              FAQ
            </Link>
            
            <div className="flex items-center space-x-4">
              <Link 
                to="/login" 
                className={`text-sm font-medium transition-colors ${
                  isScrolled ? 'text-primary hover:text-primary-dark' : 'text-white'
                }`}
              >
                Log In
              </Link>
              <Link 
                to="/register" 
                className={`text-sm px-4 py-2 rounded-full font-medium transition-all duration-300 ${
                  isScrolled 
                    ? 'bg-primary text-white hover:bg-primary-dark' 
                    : 'bg-white text-primary hover:bg-white/90'
                }`}
              >
                Sign Up
              </Link>
            </div>
          </nav>
        </div>
      </div>

      {/* Mobile menu */}
      <div 
        className={`md:hidden fixed inset-0 bg-primary z-40 transition-transform duration-300 ease-in-out transform ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full pt-20 px-6">
          <nav className="flex flex-col space-y-6 mt-8">
            <Link to="/" onClick={closeMenu} className="text-white font-medium text-xl">
              Home
            </Link>
            <Link to="/how-it-works" onClick={closeMenu} className="text-white font-medium text-xl">
              How It Works
            </Link>
            <Link to="/pricing" onClick={closeMenu} className="text-white font-medium text-xl">
              Pricing
            </Link>
            <Link to="/faq" onClick={closeMenu} className="text-white font-medium text-xl">
              FAQ
            </Link>
          </nav>
          
          <div className="mt-auto mb-12 flex flex-col space-y-4">
            <Link 
              to="/login" 
              onClick={closeMenu}
              className="text-white font-medium text-center py-3"
            >
              Log In
            </Link>
            <Link 
              to="/register" 
              onClick={closeMenu}
              className="bg-white text-primary rounded-full font-medium text-center py-3"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
