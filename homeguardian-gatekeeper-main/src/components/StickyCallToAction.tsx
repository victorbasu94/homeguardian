import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield } from 'lucide-react';

interface StickyCallToActionProps {
  showOnMobile?: boolean;
  showOnDesktop?: boolean;
  text?: string;
  link?: string;
}

const StickyCallToAction = ({
  showOnMobile = true,
  showOnDesktop = true,
  text = 'Guard My Home Now!',
  link = '/register'
}: StickyCallToActionProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show CTA after user has scrolled down 300px
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsVisible(scrollPosition > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!showOnMobile && window.innerWidth < 768) return null;
  if (!showOnDesktop && window.innerWidth >= 768) return null;

  return (
    <div 
      className={`transition-all duration-500 transform ${
        isVisible 
          ? 'translate-y-0 opacity-100' 
          : 'translate-y-20 opacity-0 pointer-events-none'
      }`}
    >
      <Link 
        to={link}
        className={`sticky-cta flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full font-medium text-xl hover:bg-primary-dark transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 shadow-button hover:shadow-button-hover ${
          showOnMobile ? 'md:w-auto w-full fixed bottom-6 left-4 right-4 md:static justify-center md:justify-start' : 'hidden md:flex'
        }`}
      >
        <Shield className="w-5 h-5" />
        {text} <ArrowRight className="w-5 h-5" />
      </Link>
    </div>
  );
};

export default StickyCallToAction; 