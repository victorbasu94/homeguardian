import { Link } from 'react-router-dom';
import { ArrowRight, Check, Cog, Home, Quote, ShieldCheck, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const testimonials = [
  {
    quote: "HomeGuardian caught a leak I'd have missed—saved me thousands!",
    name: "Sarah Johnson",
    title: "Homeowner, Atlanta"
  },
  {
    quote: "Finally, peace of mind about home maintenance without the headaches.",
    name: "Michael Chen",
    title: "Homeowner, Boston"
  },
  {
    quote: "The personalized maintenance schedule is a game-changer for our historic home.",
    name: "Emma Rodriguez",
    title: "Homeowner, Denver"
  }
];

const Index = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [showScrollArrow, setShowScrollArrow] = useState(true);
  
  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial(prev => 
        prev === testimonials.length - 1 ? 0 : prev + 1
      );
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Handle scroll for arrow visibility
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const heroHeight = window.innerHeight;
      
      if (scrollPosition > heroHeight * 0.5) {
        setShowScrollArrow(false);
      } else {
        setShowScrollArrow(true);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F5]">
      {/* Use the shared Navbar component */}
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Overlay */}
        <div className="absolute inset-0 bg-[#1A2526]/40 z-10"></div>
        
        {/* 
          VIDEO OPTION:
          To use a video background:
          1. Create a 'videos' folder in the public directory
          2. Add your 'home.mp4' file to that folder
          3. Uncomment the video element below and comment out the image element
        */}
        {/* 
        <video 
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          src="/videos/home.mp4"
        ></video>
        */}
        
        {/* 
          IMAGE OPTION (currently active):
          Using a reliable image URL as fallback until video is available
        */}
        <img 
          className="absolute inset-0 w-full h-full object-cover"
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80" 
          alt="Beautiful modern home exterior"
        />
        
        <div className="container max-w-5xl mx-auto text-center z-20 px-4 animate-fade animate-slide-up">
          <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight leading-tight mb-2">
            Protecting Your Home, <span className="relative inline-block">
              <span className="relative z-10 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">Effortlessly</span>
              <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/15 to-white/0 blur-lg -z-10 rounded-lg"></span>
              <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-white/0 via-white/90 to-white/0"></span>
            </span>
          </h1>
          <p className="font-secondary text-xl md:text-2xl text-white/80 max-w-2xl mx-auto mb-8">
            AI-powered maintenance for peace of mind
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link 
              to="/register" 
              className="bg-[#A3BFFA] text-white px-4 py-2 rounded-lg text-base font-medium hover:bg-[#B3C8FC] transition-all duration-300 flex items-center hover:scale-105 animate-pulse"
              style={{ animationDuration: '3s' }}
            >
              Get Started <ArrowRight className="ml-2 h-4 w-4 stroke-[1.5px]" />
            </Link>
          </div>
        </div>
        
        {/* Scroll Down Arrow */}
        <div 
          className={`fixed bottom-4 right-4 z-50 transition-opacity duration-500 ${
            showScrollArrow ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <ChevronDown 
            className="w-6 h-6 text-[#A3BFFA] animate-bounce cursor-pointer" 
            onClick={() => {
              window.scrollTo({
                top: window.innerHeight,
                behavior: 'smooth'
              });
            }}
          />
        </div>
      </div>
      
      {/* Features Section */}
      <div className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-4xl font-bold text-center mb-8 text-[#1A2526]">Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
            <div className="bg-gradient-to-br from-[#D4C7A9]/20 to-[#F5F5F5] p-3 rounded-xl shadow-md border border-[#4A4A4A]/10 noise-texture h-[350px] flex flex-col animate-fade animate-slide-up" style={{ animationDelay: '0s' }}>
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-[#A3BFFA]/10 text-[#A3BFFA] mb-3 mx-auto">
                <ShieldCheck className="w-6 h-6 stroke-[1.5px]" />
              </div>
              <h3 className="text-xl md:text-2xl font-semibold mb-2 text-[#1A2526] text-center">Predictive Alerts</h3>
              <p className="text-[#4A4A4A] text-sm flex-grow text-center px-2">
                Smart AI detection identifies potential issues before they become problems. Get timely alerts tailored to your home's unique needs.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-[#D4C7A9]/20 to-[#F5F5F5] p-3 rounded-xl shadow-md border border-[#4A4A4A]/10 noise-texture h-[350px] flex flex-col animate-fade animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-[#A3BFFA]/10 text-[#A3BFFA] mb-3 mx-auto">
                <Cog className="w-6 h-6 stroke-[1.5px]" />
              </div>
              <h3 className="text-xl md:text-2xl font-semibold mb-2 text-[#1A2526] text-center">Maintenance Tips</h3>
              <p className="text-[#4A4A4A] text-sm flex-grow text-center px-2">
                Expert guidance at your fingertips. Simple, step-by-step instructions make home maintenance effortless for any homeowner.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-[#D4C7A9]/20 to-[#F5F5F5] p-3 rounded-xl shadow-md border border-[#4A4A4A]/10 noise-texture h-[350px] flex flex-col animate-fade animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-[#A3BFFA]/10 text-[#A3BFFA] mb-3 mx-auto">
                <Home className="w-6 h-6 stroke-[1.5px]" />
              </div>
              <h3 className="text-xl md:text-2xl font-semibold mb-2 text-[#1A2526] text-center">Home Insights</h3>
              <p className="text-[#4A4A4A] text-sm flex-grow text-center px-2">
                Track your home's health and maintenance history. See how your care efforts protect and enhance your investment over time.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Testimonials Section */}
      <div className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-4xl font-bold text-center mb-8 text-[#1A2526]">What Homeowners Say</h2>
          
          <div className="relative max-w-3xl mx-auto animate-bounce-in">
            <div className="relative bg-gradient-to-br from-[#D4C7A9]/30 to-[#F5F5F5] rounded-xl p-3 md:p-4 shadow-md border border-[#4A4A4A]/10 noise-texture">
              <Quote className="absolute text-[#4A4A4A] top-3 left-3 h-6 w-6 stroke-[1.5px] opacity-30" />
              
              <div key={currentTestimonial} className="relative z-10 px-8 pt-6 animate-fade">
                <p className="font-secondary text-xl leading-relaxed mb-4 text-[#1A2526] italic">
                  "{testimonials[currentTestimonial].quote}"
                </p>
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-[#A3BFFA]/30"></div>
                  <div className="ml-3">
                    <p className="text-sm font-semibold text-[#1A2526]">{testimonials[currentTestimonial].name}</p>
                    <p className="text-xs text-[#4A4A4A]">{testimonials[currentTestimonial].title}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center mt-4 space-x-2">
              {testimonials.map((_, index) => (
                <button 
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-2 h-2 rounded-full mx-1 ${
                    currentTestimonial === index ? 'bg-[#A3BFFA]' : 'bg-[#D4C7A9]'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="py-12 md:py-16 bg-gradient-to-br from-[#A3BFFA]/10 to-[#F5F5F5]">
        <div className="container mx-auto px-4 text-center animate-fade" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-2xl md:text-4xl font-bold mb-3 text-[#1A2526]">Ready to Protect Your Home?</h2>
          <p className="text-[#4A4A4A] max-w-2xl mx-auto mb-6">
            Join thousands of homeowners who trust HomeGuardian for smarter, simpler home maintenance.
          </p>
          <Link 
            to="/register" 
            className="bg-[#A3BFFA] text-white px-4 py-2 rounded-lg text-base font-medium hover:bg-[#B3C8FC] transition-all duration-300 inline-flex items-center hover:scale-105 animate-pulse"
            style={{ animationDuration: '3s' }}
          >
            Get Started Today <Check className="ml-2 h-4 w-4 stroke-[1.5px]" />
          </Link>
        </div>
      </div>
      
      {/* Use the shared Footer component instead of custom footer */}
      <Footer />
    </div>
  );
};

export default Index;
