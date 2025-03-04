import { Link } from 'react-router-dom';
import { Shield, ArrowUp, Mail, Phone, Instagram, Twitter, Facebook, Linkedin } from 'lucide-react';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-white pt-20 pb-10 relative">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-16">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Shield className="h-8 w-8 text-white" />
              <span className="text-2xl font-bold font-poppins">HomeGuardian</span>
            </div>
            <p className="text-white/90 mb-8 font-inter text-base">
              Your home's smart guardian, providing personalized maintenance plans to protect your biggest investment.
            </p>
            <div className="flex space-x-5">
              <a href="https://instagram.com" className="text-white/80 hover:text-secondary transition-colors duration-300" aria-label="Instagram">
                <Instagram size={22} />
              </a>
              <a href="https://twitter.com" className="text-white/80 hover:text-secondary transition-colors duration-300" aria-label="Twitter">
                <Twitter size={22} />
              </a>
              <a href="https://facebook.com" className="text-white/80 hover:text-secondary transition-colors duration-300" aria-label="Facebook">
                <Facebook size={22} />
              </a>
              <a href="https://linkedin.com" className="text-white/80 hover:text-secondary transition-colors duration-300" aria-label="LinkedIn">
                <Linkedin size={22} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-6 font-poppins text-white">Quick Links</h3>
            <ul className="space-y-4">
              <li>
                <Link to="/" className="text-white/80 hover:text-secondary transition-colors duration-300 font-inter">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-white/80 hover:text-secondary transition-colors duration-300 font-inter">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-white/80 hover:text-secondary transition-colors duration-300 font-inter">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-white/80 hover:text-secondary transition-colors duration-300 font-inter">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-6 font-poppins text-white">Legal</h3>
            <ul className="space-y-4">
              <li>
                <Link to="/privacy" className="text-white/80 hover:text-secondary transition-colors duration-300 font-inter">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-white/80 hover:text-secondary transition-colors duration-300 font-inter">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="text-white/80 hover:text-secondary transition-colors duration-300 font-inter">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-6 font-poppins text-white">Get Updates</h3>
            <p className="text-white/80 mb-5 font-inter">
              Subscribe for maintenance tips and updates.
            </p>
            <form className="flex flex-col space-y-4">
              <input
                type="email"
                placeholder="Your email"
                className="px-4 py-3 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-secondary h-12"
                aria-label="Email for newsletter"
              />
              <button
                type="submit"
                className="bg-secondary text-white rounded-full py-3 font-medium hover:bg-secondary-dark transition-all duration-300 h-12 transform hover:scale-105"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
        
        <div className="border-t border-white/20 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-white/70 text-base mb-4 md:mb-0 font-inter">
            © {currentYear} HomeGuardian. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="mailto:info@homeguardian.com" className="text-white/70 hover:text-secondary transition-colors duration-300 flex items-center gap-2">
              <Mail size={18} /> info@homeguardian.com
            </a>
            <a href="tel:+1234567890" className="text-white/70 hover:text-secondary transition-colors duration-300 flex items-center gap-2">
              <Phone size={18} /> (123) 456-7890
            </a>
            <button
              onClick={scrollToTop}
              className="flex items-center gap-2 text-white/70 hover:text-secondary transition-colors duration-300 font-inter ml-4"
              aria-label="Back to top"
            >
              Back to Top <ArrowUp size={18} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
