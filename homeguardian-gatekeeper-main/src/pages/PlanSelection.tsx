import { useState } from 'react';
import { CheckCircle, Shield, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
        {isLoading ? 'Processing...' : 'Select Plan'}
      </button>
    </div>
  );
};

const PlanSelection = () => {
  const [plan, setPlan] = useState<PricingPlan>('monthly');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  
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
    setIsLoading(true);
    
    try {
      console.log('Initiating subscription checkout for tier:', tier, 'with billing cycle:', plan);
      
      // Call the subscribe API endpoint
      const response = await api.post('/api/subscriptions/checkout', {
        plan_type: tier,
        billing_cycle: plan
      });
      
      console.log('Checkout response:', response.data);
      
      // Redirect to Stripe Checkout
      if (response.data.checkout_url) {
        window.location.href = response.data.checkout_url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error: any) {
      console.error('Subscription error:', error);
      console.error('Error response:', error.response?.data);
      
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
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header Section */}
      <section className="pt-20 pb-16 bg-primary-gradient text-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 font-outfit leading-tight">
              Choose Your HomeGuardian Plan
            </h1>
            <p className="text-lg md:text-xl mb-6 font-manrope text-white/90">
              Your home has been registered successfully! Now select a plan that fits your needs.
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
      <section className="py-16 -mt-10">
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
              description="Complete home management solution."
              features={premiumFeatures}
              plan={plan}
              tier="premium"
              onSubscribe={handleSubscribe}
              isLoading={isLoading}
            />
          </div>
        </div>
      </section>
      
      {/* Skip for now option */}
      <div className="text-center pb-16">
        <button 
          onClick={() => navigate('/dashboard')}
          className="text-gray-600 hover:text-primary underline font-medium"
        >
          Skip for now and go to dashboard
        </button>
      </div>
    </div>
  );
};

export default PlanSelection; 