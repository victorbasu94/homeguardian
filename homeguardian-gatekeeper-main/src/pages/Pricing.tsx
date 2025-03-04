import { useState, useEffect } from 'react';
import { CheckCircle, Shield, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/axios';

type PricingPlan = 'monthly' | 'yearly';
type SubscriptionTier = 'basic' | 'pro' | 'premium';

interface PricingTierProps {
  title: string;
  price: {
    monthly: number;
    yearly: number;
  };
  description: string;
  features: {
    text: string;
    included: boolean;
  }[];
  highlighted?: boolean;
  plan: PricingPlan;
  tier: SubscriptionTier;
  onSubscribe: (tier: SubscriptionTier) => void;
  isLoading: boolean;
}

const PricingTier = ({ 
  title, 
  price, 
  description, 
  features, 
  highlighted = false, 
  plan, 
  tier,
  onSubscribe,
  isLoading
}: PricingTierProps) => {
  const currentPrice = price[plan];
  const yearlyDiscount = plan === 'yearly' ? 'Save 20%' : '';
  
  return (
    <div 
      className={`rounded-xl p-8 border transition-all duration-300 h-full flex flex-col ${
        highlighted 
          ? 'border-secondary bg-white shadow-xl scale-105 z-10' 
          : 'border-gray-200 bg-white shadow-lg hover:shadow-xl'
      }`}
    >
      <div className="mb-6">
        {highlighted && (
          <span className="bg-secondary text-white text-xs font-bold px-3 py-1 rounded-full mb-4 inline-block">
            Most Popular
          </span>
        )}
        <h3 className="text-2xl font-bold mb-2 font-outfit">{title}</h3>
        <div className="flex items-end gap-2 mb-2">
          <span className="text-4xl font-bold">${currentPrice}</span>
          <span className="text-gray-500 mb-1">/ {plan === 'monthly' ? 'month' : 'year'}</span>
        </div>
        {yearlyDiscount && (
          <span className="text-green-600 text-sm font-medium">{yearlyDiscount}</span>
        )}
        <p className="text-gray-600 mt-3 font-manrope">{description}</p>
      </div>
      
      <ul className="space-y-4 mb-8 flex-grow">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2">
            {feature.included ? (
              <CheckCircle className="text-green-500 h-5 w-5 mt-0.5 flex-shrink-0" />
            ) : (
              <X className="text-gray-400 h-5 w-5 mt-0.5 flex-shrink-0" />
            )}
            <span className={`font-manrope ${feature.included ? 'text-gray-700' : 'text-gray-400'}`}>
              {feature.text}
            </span>
          </li>
        ))}
      </ul>
      
      <button 
        className={`w-full py-3 px-6 rounded-full font-medium transition-all ${
          highlighted 
            ? 'bg-secondary text-white hover:bg-secondary-dark' 
            : 'bg-primary text-white hover:bg-primary-dark'
        } ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
        onClick={() => onSubscribe(tier)}
        disabled={isLoading}
      >
        {isLoading ? 'Processing...' : 'Choose Plan'}
      </button>
    </div>
  );
};

const Pricing = () => {
  const [plan, setPlan] = useState<PricingPlan>('monthly');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const basicFeatures = [
    { text: 'Basic Home Assessment', included: true },
    { text: 'Seasonal Maintenance Reminders', included: true },
    { text: 'DIY Maintenance Guides', included: true },
    { text: 'Email Support', included: true },
    { text: 'Custom Maintenance Schedule', included: false },
    { text: 'Professional Advice', included: false },
    { text: 'Priority Support', included: false },
    { text: 'Home Systems Monitoring', included: false },
  ];
  
  const proFeatures = [
    { text: 'Comprehensive Home Assessment', included: true },
    { text: 'Seasonal Maintenance Reminders', included: true },
    { text: 'DIY Maintenance Guides', included: true },
    { text: 'Email & Phone Support', included: true },
    { text: 'Custom Maintenance Schedule', included: true },
    { text: 'Professional Advice', included: true },
    { text: 'Priority Support', included: true },
    { text: 'Home Systems Monitoring', included: false },
  ];
  
  const premiumFeatures = [
    { text: 'Advanced Home Assessment', included: true },
    { text: 'Seasonal Maintenance Reminders', included: true },
    { text: 'DIY Maintenance Guides', included: true },
    { text: 'Email, Phone & Chat Support', included: true },
    { text: 'Custom Maintenance Schedule', included: true },
    { text: 'Professional Advice', included: true },
    { text: 'Priority Support', included: true },
    { text: 'Home Systems Monitoring', included: true },
  ];

  const handleSubscribe = async (tier: SubscriptionTier) => {
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      toast({
        title: 'Authentication required',
        description: 'Please log in or create an account to subscribe.',
      });
      navigate('/login');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Call the subscribe API endpoint
      const response = await api.post('/api/subscriptions/checkout', {
        plan_type: tier,
        billing_cycle: plan
      });
      
      // Redirect to Stripe Checkout
      if (response.data.checkout_url) {
        window.location.href = response.data.checkout_url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error: any) {
      console.error('Subscription error:', error);
      
      toast({
        title: 'Subscription error',
        description: error.response?.data?.message || 'An error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-primary-gradient text-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 font-outfit leading-tight">Simple Pricing for Every Home</h1>
            <p className="text-xl md:text-2xl mb-8 font-manrope text-white/90">
              Choose the perfect plan to protect your home and give you peace of mind.
            </p>
            
            {/* Pricing Toggle */}
            <div className="inline-flex items-center bg-white/10 p-1 rounded-full">
              <button
                onClick={() => setPlan('monthly')}
                className={`py-2 px-6 rounded-full transition-colors ${
                  plan === 'monthly' 
                    ? 'bg-white text-primary font-medium' 
                    : 'text-white hover:bg-white/10'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setPlan('yearly')}
                className={`py-2 px-6 rounded-full transition-colors ${
                  plan === 'yearly' 
                    ? 'bg-white text-primary font-medium' 
                    : 'text-white hover:bg-white/10'
                }`}
              >
                Yearly
              </button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Pricing Tiers */}
      <section className="py-20 -mt-10">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <PricingTier
              title="Basic"
              price={{ monthly: 9, yearly: 95.88 }}
              description="Essential maintenance tracking."
              features={basicFeatures}
              plan={plan}
              tier="basic"
              onSubscribe={handleSubscribe}
              isLoading={isLoading}
            />
            
            <PricingTier
              title="Pro"
              price={{ monthly: 19, yearly: 191.88 }}
              description="Includes AI insights and reminders."
              features={proFeatures}
              highlighted={true}
              plan={plan}
              tier="pro"
              onSubscribe={handleSubscribe}
              isLoading={isLoading}
            />
            
            <PricingTier
              title="Premium"
              price={{ monthly: 29, yearly: 287.88 }}
              description="Full access with priority support."
              features={premiumFeatures}
              plan={plan}
              tier="premium"
              onSubscribe={handleSubscribe}
              isLoading={isLoading}
            />
          </div>
        </div>
      </section>
      
      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 font-outfit text-primary">Frequently Asked Questions</h2>
            <p className="text-lg text-gray-600 font-manrope">
              Have questions about our pricing? Find quick answers below.
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold mb-3 font-outfit">Can I change plans later?</h3>
              <p className="text-gray-600 font-manrope">
                Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold mb-3 font-outfit">Is there a free trial available?</h3>
              <p className="text-gray-600 font-manrope">
                We offer a 14-day free trial for all new users, allowing you to experience HomeGuardian before committing.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold mb-3 font-outfit">What payment methods do you accept?</h3>
              <p className="text-gray-600 font-manrope">
                We accept all major credit cards, PayPal, and Apple Pay for your convenience.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold mb-3 font-outfit">Can I cancel my subscription?</h3>
              <p className="text-gray-600 font-manrope">
                Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your current billing period.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Call to Action */}
      <section className="py-16 bg-teal-coral-gradient text-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center mb-6">
              <Shield className="h-12 w-12 text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 font-outfit">Ready to protect your biggest investment?</h2>
            <p className="text-xl mb-8 font-manrope">
              Join thousands of homeowners who trust HomeGuardian to keep their homes in perfect condition.
            </p>
            <a 
              href={isAuthenticated ? "/dashboard" : "/register"} 
              className="bg-white text-primary px-8 py-3 rounded-full font-medium hover:bg-white/90 transition-colors inline-block animate-pulse-glow"
            >
              {isAuthenticated ? "Go to Dashboard" : "Start Your Free Trial"}
            </a>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Pricing;
