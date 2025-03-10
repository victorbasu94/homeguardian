import { Link } from 'react-router-dom';
import { ArrowRight, Check, Cog, Home, Quote, ShieldCheck, ChevronDown, Calendar, Wrench, Shield, CreditCard, Zap, CheckCircle, Star } from 'lucide-react';
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '@/components/ui/button';

const testimonials = [
  {
    quote: "MaintainMint caught a leak I'd have missed—saved me thousands!",
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
              className="bg-[#A3BFFA] text-white px-4 py-2 rounded-lg text-base font-medium hover:bg-[#B3C8FC] transition-all duration-300 flex items-center hover:scale-105"
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
      
      {/* Features Section - Mercury Style */}
      <div className="py-16 bg-[#F5F5F5]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold mb-4 text-[#1A2526]">Turn home maintenance chaos into confidence</h2>
            <p className="text-[#4A4A4A] max-w-2xl mx-auto">
              Stop worrying about what you might be missing. MaintainMint transforms overwhelming home care into simple, manageable steps.
            </p>
          </div>
          
          {/* Two-column feature cards layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Feature Card 1 */}
            <div className="bg-white rounded-lg border border-[#4A4A4A]/10 shadow-sm overflow-hidden flex flex-col">
              <div className="p-8 pb-0 flex-grow">
                <div className="bg-[#F5F5F5] rounded-lg p-6 mb-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 bg-[#A3BFFA]/20 p-1.5 rounded-md">
                        <Calendar className="h-4 w-4 text-[#A3BFFA]" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">HVAC Filter Replacement</h4>
                        <p className="text-xs text-[#4A4A4A]">Due in 3 days - June 15, 2024</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="mt-1 bg-[#A3BFFA]/20 p-1.5 rounded-md">
                        <Wrench className="h-4 w-4 text-[#A3BFFA]" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">Gutter Cleaning</h4>
                        <p className="text-xs text-[#4A4A4A]">Due in 2 weeks - June 30, 2024</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="mt-1 bg-[#A3BFFA]/20 p-1.5 rounded-md">
                        <Shield className="h-4 w-4 text-[#A3BFFA]" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">Smoke Detector Test</h4>
                        <p className="text-xs text-[#4A4A4A]">Due in 3 weeks - July 7, 2024</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-[#4A4A4A]/10">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-[#4A4A4A]">Repeat this reminder</span>
                      <div className="h-5 w-10 bg-[#A3BFFA]/20 rounded-full relative">
                        <div className="absolute top-0.5 left-0.5 h-4 w-4 bg-[#A3BFFA] rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <h3 className="text-2xl font-semibold mb-4 text-[#1A2526]">Plan for your home's future, not just its present</h3>
                <p className="text-[#4A4A4A] mb-6">Know exactly what to do and when to do it. Our smart maintenance system catches problems before they become expensive disasters.</p>
              </div>
              
              <div className="p-8 pt-0 mt-auto">
                <Link to="/how-it-works">
                  <Button variant="outline" className="gap-2 border-[#A3BFFA] text-[#A3BFFA] hover:bg-[#A3BFFA]/10 w-full">
                    Preventative Maintenance
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Feature Card 2 - NEW */}
            <div className="bg-white rounded-lg border border-[#4A4A4A]/10 shadow-sm overflow-hidden flex flex-col">
              <div className="p-8 pb-0 flex-grow">
                <div className="bg-[#F5F5F5] rounded-lg p-6 mb-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 bg-[#A3BFFA]/20 p-1.5 rounded-md">
                        <Cog className="h-4 w-4 text-[#A3BFFA]" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium">HVAC Filter Replacement</h4>
                        <div className="mt-2 space-y-2">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-3.5 w-3.5 text-[#A3BFFA]" />
                            <p className="text-xs text-[#4A4A4A]">Turn off HVAC system</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-3.5 w-3.5 text-[#A3BFFA]" />
                            <p className="text-xs text-[#4A4A4A]">Locate filter compartment</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-3.5 w-3.5 text-[#A3BFFA]" />
                            <p className="text-xs text-[#4A4A4A]">Remove old filter</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-3.5 w-3.5 text-[#A3BFFA]" />
                            <p className="text-xs text-[#4A4A4A]">Insert new 16x20x1 filter</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-[#4A4A4A]/10">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-[#4A4A4A]">View video tutorial</span>
                      <ArrowRight className="h-3.5 w-3.5 text-[#A3BFFA]" />
                    </div>
                  </div>
                </div>
                
                <h3 className="text-2xl font-semibold mb-4 text-[#1A2526]">Clear how-to guides, personalized for your home</h3>
                <p className="text-[#4A4A4A] mb-6">Step-by-step instructions tailored to your specific home systems and appliances. Never wonder "how do I do this?" again.</p>
              </div>
              
              <div className="p-8 pt-0 mt-auto">
                <Link to="/how-it-works">
                  <Button variant="outline" className="gap-2 border-[#A3BFFA] text-[#A3BFFA] hover:bg-[#A3BFFA]/10 w-full">
                    Explore Guides
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Feature Card 3 */}
            <div className="bg-white rounded-lg border border-[#4A4A4A]/10 shadow-sm overflow-hidden flex flex-col">
              <div className="p-8 pb-0 flex-grow">
                <div className="bg-[#F5F5F5] rounded-lg p-6 mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-[#A3BFFA]/20 p-1.5 rounded-md">
                      <CreditCard className="h-4 w-4 text-[#A3BFFA]" />
                    </div>
                    <h4 className="text-sm font-medium">Trusted Professionals</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Plumbers</span>
                      <span className="text-sm font-medium">12 nearby</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Electricians</span>
                      <span className="text-sm font-medium">8 nearby</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">HVAC Specialists</span>
                      <span className="text-sm font-medium">5 nearby</span>
                    </div>
                    <div className="h-2 bg-[#F5F5F5] border border-[#4A4A4A]/10 rounded-full overflow-hidden mt-2">
                      <div className="h-full bg-[#A3BFFA] rounded-full" style={{ width: '90%' }}></div>
                    </div>
                  </div>
                </div>
                
                <h3 className="text-2xl font-semibold mb-4 text-[#1A2526]">Need help in a hurry? Get connected to pros near you</h3>
                <p className="text-[#4A4A4A] mb-6">Instant access to vetted, reliable professionals in your area who can solve your home maintenance emergencies.</p>
              </div>
              
              <div className="p-8 pt-0 mt-auto">
                <Link to="/how-it-works">
                  <Button variant="outline" className="gap-2 border-[#A3BFFA] text-[#A3BFFA] hover:bg-[#A3BFFA]/10 w-full">
                    Find Local Pros
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          
          {/* Additional Feature Section */}
          <div className="mt-16 text-center">
            <h2 className="text-3xl font-semibold mb-16 text-[#1A2526]">All your home maintenance needs. Zero complexity.</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              {[
                {
                  title: "Personalized maintenance schedules",
                  description: "Custom plans based on your home's age, location, and specific systems",
                  link: "Explore Smart Planning",
                  icon: <CheckCircle className="h-5 w-5 text-[#A3BFFA]" />
                },
                {
                  title: "Timely reminders that actually help",
                  description: "Never miss critical maintenance with smart notifications",
                  link: "See How It Works",
                  icon: <Calendar className="h-5 w-5 text-[#A3BFFA]" />
                },
                {
                  title: "Track and manage maintenance costs",
                  description: "See where your money goes and plan for future expenses",
                  link: "Explore Cost Tracking",
                  icon: <CreditCard className="h-5 w-5 text-[#A3BFFA]" />
                },
                {
                  title: "DIY guides and professional help",
                  description: "Step-by-step instructions or instant pro connections when needed",
                  link: "View Resources",
                  icon: <Zap className="h-5 w-5 text-[#A3BFFA]" />
                }
              ].map((feature, i) => (
                <div key={i} className="text-left">
                  <div className="mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-medium mb-2 text-[#1A2526]">{feature.title}</h3>
                  <p className="text-[#4A4A4A] text-sm mb-4">{feature.description}</p>
                  <Link to="/how-it-works" className="text-[#A3BFFA] text-sm font-medium flex items-center gap-1 hover:underline">
                    {feature.link}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Pricing Section - Mercury Style */}
      <div className="py-20 bg-white border-y border-[#4A4A4A]/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold mb-4 text-[#1A2526]">Simple, transparent pricing</h2>
            <p className="text-[#4A4A4A] max-w-2xl mx-auto">
              Choose the plan that's right for your home. No hidden fees, no surprises.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Basic Plan */}
            <div className="bg-white rounded-lg border border-[#4A4A4A]/10 shadow-sm overflow-hidden flex flex-col">
              <div className="p-6 border-b border-[#4A4A4A]/10">
                <h3 className="text-xl font-semibold mb-2 text-[#1A2526]">Basic</h3>
                <div className="flex items-baseline mb-4">
                  <span className="text-3xl font-bold text-[#1A2526]">$9</span>
                  <span className="text-sm text-[#4A4A4A] ml-1">/month</span>
                </div>
                <p className="text-sm text-[#4A4A4A]">Perfect for new homeowners just getting started.</p>
              </div>
              
              <div className="p-6 flex-grow">
                <ul className="space-y-3">
                  {[
                    'Maintenance reminders',
                    'Basic home inventory',
                    'DIY maintenance guides',
                    'Email support'
                  ].map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-[#A3BFFA] shrink-0 mt-0.5" />
                      <span className="text-sm text-[#1A2526]">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="p-6 pt-0 mt-auto">
                <Link to="/register">
                  <Button variant="outline" className="gap-2 border-[#A3BFFA] text-[#A3BFFA] hover:bg-[#A3BFFA]/10 w-full">
                    Get Started
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Pro Plan - Highlighted */}
            <div className="bg-white rounded-lg border-2 border-[#A3BFFA] shadow-md overflow-hidden flex flex-col relative">
              <div className="absolute top-0 right-0 bg-[#A3BFFA] text-white text-xs font-medium px-3 py-1 rounded-bl-lg">
                Most Popular
              </div>
              
              <div className="p-6 border-b border-[#4A4A4A]/10">
                <h3 className="text-xl font-semibold mb-2 text-[#1A2526]">Pro</h3>
                <div className="flex items-baseline mb-4">
                  <span className="text-3xl font-bold text-[#1A2526]">$19</span>
                  <span className="text-sm text-[#4A4A4A] ml-1">/month</span>
                </div>
                <p className="text-sm text-[#4A4A4A]">Ideal for most homeowners with active maintenance needs.</p>
              </div>
              
              <div className="p-6 flex-grow">
                <ul className="space-y-3">
                  {[
                    'Everything in Basic',
                    'Seasonal maintenance plans',
                    'Professional service finder',
                    'Maintenance cost tracking',
                    'Priority email & chat support'
                  ].map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-[#A3BFFA] shrink-0 mt-0.5" />
                      <span className="text-sm text-[#1A2526]">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="p-6 pt-0 mt-auto">
                <Link to="/register">
                  <Button className="gap-2 bg-[#A3BFFA] hover:bg-[#A3BFFA]/90 text-white w-full">
                    Get Started
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Premium Plan */}
            <div className="bg-white rounded-lg border border-[#4A4A4A]/10 shadow-sm overflow-hidden flex flex-col">
              <div className="p-6 border-b border-[#4A4A4A]/10">
                <h3 className="text-xl font-semibold mb-2 text-[#1A2526]">Premium</h3>
                <div className="flex items-baseline mb-4">
                  <span className="text-3xl font-bold text-[#1A2526]">$39</span>
                  <span className="text-sm text-[#4A4A4A] ml-1">/month</span>
                </div>
                <p className="text-sm text-[#4A4A4A]">For homeowners with complex or multiple properties.</p>
              </div>
              
              <div className="p-6 flex-grow">
                <ul className="space-y-3">
                  {[
                    'Everything in Pro',
                    'Multiple property support',
                    'Advanced maintenance analytics',
                    'Dedicated account manager',
                    'Priority phone support',
                    'Custom maintenance workflows'
                  ].map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-[#A3BFFA] shrink-0 mt-0.5" />
                      <span className="text-sm text-[#1A2526]">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="p-6 pt-0 mt-auto">
                <Link to="/register">
                  <Button variant="outline" className="gap-2 border-[#A3BFFA] text-[#A3BFFA] hover:bg-[#A3BFFA]/10 w-full">
                    Get Started
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <p className="text-sm text-[#4A4A4A] mb-4">All plans include a 14-day free trial. No credit card required.</p>
            <Link to="/pricing" className="text-[#A3BFFA] text-sm font-medium inline-flex items-center hover:underline">
              Compare all features
              <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
      
      {/* Testimonials Section - Mercury Style */}
      <div className="py-20 bg-white border-y border-[#4A4A4A]/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold mb-4 text-[#1A2526]">What our customers say</h2>
            <p className="text-[#4A4A4A] max-w-2xl mx-auto">
              Join thousands of homeowners who trust MaintainMint
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                quote: "MaintainMint caught a leak I'd have missed—saved me thousands!",
                author: "Sarah Johnson",
                role: "Homeowner, Atlanta"
              },
              {
                quote: "Finally, peace of mind about home maintenance without the headaches.",
                author: "Michael Chen",
                role: "Homeowner, Boston"
              },
              {
                quote: "The personalized maintenance schedule is a game-changer for our historic home.",
                author: "Emma Rodriguez",
                role: "Homeowner, Denver"
              }
            ].map((testimonial, i) => (
              <div key={i} className="bg-white p-6 rounded-lg border border-[#4A4A4A]/10 shadow-sm">
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-4 w-4 fill-[#A3BFFA] text-[#A3BFFA]" />
                  ))}
                </div>
                <p className="mb-4 text-[#1A2526]">"{testimonial.quote}"</p>
                <div>
                  <div className="font-medium text-[#1A2526]">{testimonial.author}</div>
                  <div className="text-sm text-[#4A4A4A]">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* CTA Section - Mercury Style */}
      <div className="py-20 bg-[#A3BFFA]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-semibold text-white mb-6">Ready to protect your home?</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of homeowners who trust MaintainMint for smarter, simpler home maintenance.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto">
            <Link 
              to="/register" 
              className="bg-white text-[#A3BFFA] px-6 py-3 rounded-lg text-base font-medium hover:bg-white/90 transition-all duration-300"
            >
              Get Started Now
            </Link>
            <Link 
              to="/how-it-works" 
              className="border border-white text-white px-6 py-3 rounded-lg text-base font-medium hover:bg-white/10 transition-all duration-300"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
      
      {/* Use the shared Footer component instead of custom footer */}
      <Footer />
    </div>
  );
};

export default Index;
