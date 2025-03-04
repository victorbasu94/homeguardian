
import { useEffect } from 'react';
import { Home, Lightbulb, CheckCircle, Shield, Wrench, Clock } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// Helper component for process steps
const ProcessStep = ({ 
  icon: Icon, 
  step, 
  title, 
  description 
}: { 
  icon: React.ElementType; 
  step: number; 
  title: string; 
  description: string;
}) => (
  <div className="relative flex flex-col items-center text-center animate-fade-in" style={{ animationDelay: `${step * 100}ms` }}>
    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-secondary text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
      {step}
    </div>
    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
      <Icon className="w-10 h-10 text-primary" />
    </div>
    <h3 className="text-2xl font-bold mb-3 font-outfit">{title}</h3>
    <p className="text-gray-600 font-manrope">{description}</p>
  </div>
);

// Helper component for feature boxes
const FeatureBox = ({ 
  icon: Icon, 
  title, 
  description, 
  index 
}: { 
  icon: React.ElementType; 
  title: string; 
  description: string; 
  index: number;
}) => (
  <div 
    className="bg-white rounded-xl shadow-lg p-8 transform hover:scale-105 transition-all duration-300 border border-gray-100"
    style={{ animationDelay: `${index * 150}ms` }}
  >
    <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-6">
      <Icon className="w-8 h-8 text-primary" />
    </div>
    <h3 className="text-xl font-bold mb-3 font-outfit">{title}</h3>
    <p className="text-gray-600 font-manrope">{description}</p>
  </div>
);

const HowItWorks = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-primary-gradient text-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 font-outfit leading-tight">How HomeGuardian Works</h1>
            <p className="text-xl md:text-2xl mb-8 font-manrope text-white/90">
              Our AI-powered platform simplifies home maintenance, so you can protect your investment with ease.
            </p>
          </div>
        </div>
      </section>
      
      {/* Process Steps */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 font-outfit text-primary">Simple Process, Powerful Results</h2>
            <p className="text-lg text-gray-600 font-manrope">
              From setup to maintenance, we make caring for your home effortless with just three simple steps.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 max-w-5xl mx-auto relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-24 left-0 right-0 h-0.5 bg-gray-200 z-0"></div>
            
            <ProcessStep 
              icon={Home} 
              step={1} 
              title="Tell Us About Your Home" 
              description="Answer a few questions about your property's age, size, and features so we can tailor your maintenance plan."
            />
            
            <ProcessStep 
              icon={Lightbulb} 
              step={2} 
              title="Receive Your Smart Plan" 
              description="Our AI generates a personalized maintenance schedule based on your home's specific needs."
            />
            
            <ProcessStep 
              icon={CheckCircle} 
              step={3} 
              title="Follow Along with Ease" 
              description="Get timely reminders, simple instructions, and professional support whenever you need it."
            />
          </div>
        </div>
      </section>
      
      {/* Features Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 font-outfit text-primary">Smart Features for Every Home</h2>
            <p className="text-lg text-gray-600 font-manrope">
              HomeGuardian combines cutting-edge technology with practical home care solutions.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureBox 
              icon={Shield} 
              title="Preventive Protection" 
              description="Identify potential issues before they become costly problems with our predictive AI technology."
              index={0}
            />
            
            <FeatureBox 
              icon={Wrench} 
              title="Customized Care" 
              description="Maintenance plans tailored to your home's specific needs, age, location, and building materials."
              index={1}
            />
            
            <FeatureBox 
              icon={Clock} 
              title="Timely Reminders" 
              description="Never miss critical maintenance with smart notifications that keep you on schedule."
              index={2}
            />
            
            <FeatureBox 
              icon={Lightbulb} 
              title="Expert Guidance" 
              description="Step-by-step instructions and videos make even complex maintenance tasks approachable."
              index={3}
            />
            
            <FeatureBox 
              icon={Home} 
              title="Home Value Protection" 
              description="Maintain and potentially increase your property's value with proper, documented care."
              index={4}
            />
            
            <FeatureBox 
              icon={CheckCircle} 
              title="Peace of Mind" 
              description="Rest easy knowing your home is receiving the care it needs to stay safe and sound."
              index={5}
            />
          </div>
        </div>
      </section>
      
      {/* Call to Action */}
      <section className="py-20 bg-teal-coral-gradient text-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 font-outfit">Ready to Protect Your Home?</h2>
            <p className="text-xl mb-8 font-manrope">
              Join thousands of homeowners who trust HomeGuardian for smarter home maintenance.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a 
                href="/register" 
                className="bg-white text-primary px-8 py-3 rounded-full font-medium hover:bg-white/90 transition-colors animate-pulse-glow"
              >
                Start Protecting Now
              </a>
              <a 
                href="/pricing" 
                className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-full font-medium hover:bg-white/10 transition-colors"
              >
                View Pricing
              </a>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default HowItWorks;
