
import { Link } from 'react-router-dom';
import { ArrowRight, Wrench, Heart, Home, Lightbulb, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
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
  
  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial(prev => 
        prev === testimonials.length - 1 ? 0 : prev + 1
      );
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  const nextTestimonial = () => {
    setCurrentTestimonial(prev => 
      prev === testimonials.length - 1 ? 0 : prev + 1
    );
  };
  
  const prevTestimonial = () => {
    setCurrentTestimonial(prev => 
      prev === 0 ? testimonials.length - 1 : prev - 1
    );
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Use the shared Navbar component */}
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 bg-cover bg-center" style={{ 
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.65), rgba(0, 0, 0, 0.4)), url(https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80)',
          backgroundPosition: 'center 40%' 
        }}></div>
        
        <div className="container max-w-5xl mx-auto text-center z-10 px-4 animate-fade-in">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-white tracking-tight leading-tight font-outfit">
            Your Home, Protected by Smart Maintenance
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-10 font-manrope">
            Take the guesswork out of home care with personalized AI plans and timely reminders.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to="/register" 
              className="px-8 py-3 bg-primary text-white font-medium rounded-full hover:bg-primary/90 transition-all duration-300 hover:scale-105 shadow-lg font-manrope"
            >
              Start Protecting Your Home <ArrowRight className="ml-2 h-4 w-4 inline" />
            </Link>
          </div>
          
          {/* Trust Signals */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
            <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-white/90 text-sm flex items-center">
              <span className="mr-2">⚡</span> Powered by Secure AI
            </div>
            <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-white/90 text-sm flex items-center">
              <span className="mr-2">❤️</span> Loved by 10,000+ Homeowners
            </div>
          </div>
        </div>
      </div>
      
      {/* Value Proposition Section */}
      <div className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 font-outfit">Home Care, Made Simple</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-gray-50 p-8 rounded-xl text-center hover:shadow-md transition-all duration-300">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 text-primary mb-5 mx-auto">
                <Wrench className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-semibold mb-3 font-outfit">Avoid Costly Repairs</h3>
              <p className="text-gray-600 font-manrope">
                Stay ahead of issues with proactive tasks that prevent expensive emergency fixes.
              </p>
            </div>
            
            <div className="bg-gray-50 p-8 rounded-xl text-center hover:shadow-md transition-all duration-300">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 text-primary mb-5 mx-auto">
                <Heart className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-semibold mb-3 font-outfit">Stress-Free Living</h3>
              <p className="text-gray-600 font-manrope">
                Rest easy knowing your home is covered with a complete maintenance plan.
              </p>
            </div>
            
            <div className="bg-gray-50 p-8 rounded-xl text-center hover:shadow-md transition-all duration-300">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 text-primary mb-5 mx-auto">
                <Home className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-semibold mb-3 font-outfit">Tailored for You</h3>
              <p className="text-gray-600 font-manrope">
                Plans customized to your home's unique needs, age, and local environment.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* How It Works Section */}
      <div className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4 font-outfit">How It Works</h2>
          <p className="text-gray-600 text-center mx-auto max-w-2xl mb-12 font-manrope">
            Getting started with HomeGuardian is simple and quick
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="relative">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-5 mx-auto relative z-10">
                  <Home className="w-8 h-8" />
                </div>
                <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-gray-200 -z-0"></div>
              </div>
              <h3 className="text-xl font-semibold mb-3 font-outfit">Tell Us About Your Home</h3>
              <p className="text-gray-600 font-manrope">
                Answer a few questions about your property to help our AI understand your needs.
              </p>
            </div>
            
            <div className="text-center">
              <div className="relative">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-5 mx-auto relative z-10">
                  <Lightbulb className="w-8 h-8" />
                </div>
                <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-gray-200 -z-0"></div>
              </div>
              <h3 className="text-xl font-semibold mb-3 font-outfit">Receive Your Smart Plan</h3>
              <p className="text-gray-600 font-manrope">
                Get a personalized maintenance schedule based on your home's specific requirements.
              </p>
            </div>
            
            <div className="text-center">
              <div className="relative">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-5 mx-auto">
                  <CheckCircle className="w-8 h-8" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3 font-outfit">Follow Along with Ease</h3>
              <p className="text-gray-600 font-manrope">
                Track progress, receive reminders, and keep your home in perfect condition.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Testimonials Section */}
      <div className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16 font-outfit">What Homeowners Say</h2>
          
          <div className="relative max-w-3xl mx-auto">
            <div className="relative bg-gray-50 rounded-xl p-8 md:p-10 shadow-sm">
              <svg className="absolute text-gray-200 top-0 left-0 transform -translate-x-6 -translate-y-6 h-16 w-16 opacity-50" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M7.39762 10.3C7.39762 11.0733 7.14888 11.7 6.6514 12.18C6.15392 12.6333 5.52552 12.86 4.7662 12.86C3.84023 12.86 3.05263 12.5533 2.40342 11.94C1.75421 11.3266 1.42961 10.4467 1.42961 9.29999C1.42961 8.07332 1.83124 6.87332 2.63451 5.69999C3.4644 4.49999 4.54616 3.55332 5.87979 2.85999L6.6514 4.25999C5.98363 4.73999 5.41008 5.27332 4.93073 5.85999C4.45138 6.44666 4.19265 6.95332 4.15454 7.37999C4.15454 7.44666 4.17308 7.47999 4.21017 7.47999C4.26582 7.47999 4.31631 7.45999 4.36163 7.41999C4.43566 7.33999 4.5255 7.29999 4.63116 7.29999C4.7369 7.29999 4.84271 7.33999 4.94853 7.41999C5.05435 7.49999 5.14011 7.61999 5.20577 7.77999C5.2714 7.93999 5.30425 8.11332 5.30425 8.29999C5.30425 8.63999 5.22831 8.95332 5.07642 9.23999C4.9513 9.52666 4.77747 9.75999 4.55493 9.93999C4.36016 10.12 4.14637 10.2 3.91358 10.28C3.68075 10.36 3.44788 10.4 3.21497 10.4C3.3189 10.92 3.56293 11.3333 3.94709 11.64C4.35983 11.9467 4.80349 12.1 5.2785 12.1C5.56363 12.1 5.81598 12.0467 6.03557 11.94C6.25515 11.8333 6.43473 11.7 6.57431 11.54C6.71389 11.38 6.80997 11.2 6.86255 11C6.91512 10.8 6.94143 10.6133 6.94143 10.44C6.94143 10.2667 6.91783 10.0867 6.87062 9.89999C6.82342 9.71332 6.74107 9.53332 6.62355 9.35999C6.50603 9.18666 6.31244 9.05332 6.04277 8.95999C5.7731 8.86666 5.35292 8.81999 4.78212 8.81999V7.41999C5.46203 7.41999 6.05898 7.43999 6.57297 7.47999C7.08697 7.52 7.50234 7.63999 7.81909 7.83999C8.13585 8.04 8.3541 8.33999 8.47385 8.73999C8.59356 9.13999 8.6534 9.67332 8.6534 10.34V12.82H7.39762V10.3ZM14.6242 10.3C14.6242 11.0733 14.3755 11.7 13.878 12.18C13.3805 12.6333 12.7521 12.86 11.9928 12.86C11.0668 12.86 10.2792 12.5533 9.63 11.94C8.98079 11.3266 8.65619 10.4467 8.65619 9.29999C8.65619 8.07332 9.05782 6.87332 9.86109 5.69999C10.691 4.49999 11.7727 3.55332 13.1064 2.85999L13.878 4.25999C13.2102 4.73999 12.6366 5.27332 12.1573 5.85999C11.6779 6.44666 11.4192 6.95332 11.3811 7.37999C11.3811 7.44666 11.3996 7.47999 11.4367 7.47999C11.4924 7.47999 11.5429 7.45999 11.5882 7.41999C11.6622 7.33999 11.7521 7.29999 11.8577 7.29999C11.9634 7.29999 12.0693 7.33999 12.1751 7.41999C12.2809 7.49999 12.3667 7.61999 12.4323 7.77999C12.498 7.93999 12.5308 8.11332 12.5308 8.29999C12.5308 8.63999 12.4549 8.95332 12.303 9.23999C12.1778 9.52666 12.004 9.75999 11.7815 9.93999C11.5867 10.12 11.3729 10.2 11.1401 10.28C10.9073 10.36 10.6744 10.4 10.4415 10.4C10.5455 10.92 10.7895 11.3333 11.1736 11.64C11.5864 11.9467 12.03 12.1 12.505 12.1C12.7902 12.1 13.0425 12.0467 13.2621 11.94C13.4817 11.8333 13.6613 11.7 13.8009 11.54C13.9404 11.38 14.0365 11.2 14.0891 11C14.1417 10.8 14.168 10.6133 14.168 10.44C14.168 10.2667 14.1444 10.0867 14.0972 9.89999C14.05 9.71332 13.9677 9.53332 13.8501 9.35999C13.7326 9.18666 13.539 9.05332 13.2694 8.95999C12.9997 8.86666 12.5795 8.81999 12.0087 8.81999V7.41999C12.6886 7.41999 13.2856 7.43999 13.7996 7.47999C14.3136 7.52 14.7289 7.63999 15.0457 7.83999C15.3625 8.04 15.5807 8.33999 15.7004 8.73999C15.8202 9.13999 15.88 9.67332 15.88 10.34V12.82H14.6242V10.3Z" fill="currentColor"/>
              </svg>
              
              <div key={currentTestimonial} className="relative z-10 animate-fade-in">
                <p className="text-lg md:text-xl leading-relaxed mb-6 text-gray-700 italic font-manrope">
                  "{testimonials[currentTestimonial].quote}"
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gray-300"></div>
                  <div className="ml-3">
                    <p className="text-sm font-semibold font-outfit">{testimonials[currentTestimonial].name}</p>
                    <p className="text-xs text-gray-500 font-manrope">{testimonials[currentTestimonial].title}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center mt-6 space-x-2">
              <button 
                onClick={prevTestimonial}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-all duration-200"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              {testimonials.map((_, index) => (
                <button 
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-2.5 h-2.5 rounded-full mx-1 ${
                    currentTestimonial === index ? 'bg-primary' : 'bg-gray-300'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
              <button 
                onClick={nextTestimonial}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-all duration-200"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* FAQ Section */}
      <div className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16 font-outfit">Frequently Asked Questions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-3 font-outfit">How does HomeGuardian save me money?</h3>
              <p className="text-gray-600 font-manrope">
                By identifying maintenance issues before they become costly emergencies, 
                HomeGuardian helps you avoid expensive repairs and extends the lifespan of your home's systems.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-3 font-outfit">Is it easy to use?</h3>
              <p className="text-gray-600 font-manrope">
                Absolutely! Our intuitive interface makes it simple to follow your maintenance plan. 
                We send timely reminders and provide clear instructions for each task.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-3 font-outfit">How is my maintenance plan created?</h3>
              <p className="text-gray-600 font-manrope">
                Our AI analyzes details about your home's age, location, systems, and materials to create 
                a customized maintenance schedule that addresses your property's specific needs.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-3 font-outfit">Can I cancel my subscription?</h3>
              <p className="text-gray-600 font-manrope">
                Yes, you can cancel your subscription at any time. We offer a 30-day money-back guarantee 
                if you're not completely satisfied with our service.
              </p>
            </div>
          </div>
          
          <div className="text-center mt-10">
            <Link 
              to="/faq" 
              className="inline-flex items-center px-8 py-3 bg-primary text-white font-medium rounded-full hover:bg-primary/90 transition-all duration-300 hover:scale-105 shadow-md font-manrope"
            >
              View All FAQs <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="py-16 md:py-24 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-white font-outfit">Ready to protect your home?</h2>
          <p className="text-white/90 max-w-2xl mx-auto mb-8 font-manrope">
            Join thousands of homeowners who trust HomeGuardian to keep their homes in perfect condition.
          </p>
          <Link 
            to="/register" 
            className="inline-flex items-center px-8 py-3 bg-white text-primary font-medium rounded-full hover:bg-gray-100 transition-all duration-300 hover:scale-105 shadow-md font-manrope"
          >
            Get Started Now <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
      
      {/* Use the shared Footer component */}
      <Footer />
    </div>
  );
};

export default Index;
