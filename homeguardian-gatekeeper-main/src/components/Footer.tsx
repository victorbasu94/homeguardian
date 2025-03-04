
import { Link } from 'react-router-dom';
import { Shield, ArrowUp, Mail, Phone } from 'lucide-react';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <footer className="bg-charcoal text-white pt-16 pb-8 relative">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Shield className="h-7 w-7 text-secondary" />
              <span className="text-xl font-bold font-outfit">HomeGuardian</span>
            </div>
            <p className="text-gray-300 mb-6 font-manrope">
              Your home's smart guardian, providing AI-driven maintenance plans to protect your biggest investment.
            </p>
            <div className="flex space-x-4">
              <a href="mailto:info@homeguardian.com" className="text-gray-300 hover:text-secondary transition-colors">
                <Mail size={20} />
              </a>
              <a href="tel:+1234567890" className="text-gray-300 hover:text-secondary transition-colors">
                <Phone size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-6 font-outfit">Quick Links</h3>
            <ul className="space-y-4">
              <li>
                <Link to="/" className="text-gray-300 hover:text-secondary transition-colors font-manrope">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-gray-300 hover:text-secondary transition-colors font-manrope">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-gray-300 hover:text-secondary transition-colors font-manrope">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-300 hover:text-secondary transition-colors font-manrope">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-6 font-outfit">Legal</h3>
            <ul className="space-y-4">
              <li>
                <Link to="/privacy" className="text-gray-300 hover:text-secondary transition-colors font-manrope">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-300 hover:text-secondary transition-colors font-manrope">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="text-gray-300 hover:text-secondary transition-colors font-manrope">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-6 font-outfit">Get Updates</h3>
            <p className="text-gray-300 mb-4 font-manrope">
              Subscribe to our newsletter for maintenance tips and updates.
            </p>
            <form className="flex flex-col space-y-3">
              <input
                type="email"
                placeholder="Your email"
                className="px-4 py-2 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-secondary"
              />
              <button
                type="submit"
                className="bg-secondary text-white rounded-md py-2 font-medium hover:bg-secondary-dark transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
        
        <div className="border-t border-gray-700 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm mb-4 md:mb-0 font-manrope">
            © {new Date().getFullYear()} HomeGuardian. All rights reserved.
          </p>
          <button
            onClick={scrollToTop}
            className="flex items-center gap-2 text-gray-300 hover:text-secondary transition-colors font-manrope"
          >
            Back to Top <ArrowUp size={16} />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
