import { useState } from 'react';
import { CheckCircle, Shield, X, ArrowRight, Clock, Calendar, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/axios';
import ProgressBar from '@/components/ProgressBar';
import { Button } from '@/components/ui/button';

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
          ? 'border-primary bg-white shadow-card-hover scale-105 z-10' 
          : 'border-gray-200 bg-white shadow-card hover:shadow-card-hover'
      }`}
    >
      <div className="mb-6">
        {highlighted && (
          <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full mb-4 inline-block">
            Most Popular
          </span>
        )}
        <h3 className="text-2xl font-bold mb-2 font-poppins text-primary">{title}</h3>
        <div className="flex items-end gap-2 mb-2">
          <span className="text-4xl font-bold text-neutral">${currentPrice}</span>
          <span className="text-neutral/70 mb-1">/ {plan === 'monthly' ? 'month' : 'year'}</span>
        </div>
        {yearlyDiscount && (
          <span className="text-secondary text-sm font-medium">{yearlyDiscount}</span>
        )}
        <p className="text-neutral/80 mt-3 font-inter">{description}</p>
      </div>
      
      <ul className="space-y-4 mb-8 flex-grow">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2">
            {feature.included ? (
              <CheckCircle className="text-primary h-5 w-5 mt-0.5 flex-shrink-0" />
            ) : (
              <X className="text-neutral/40 h-5 w-5 mt-0.5 flex-shrink-0" />
            )}
            <span className={`font-inter ${feature.included ? 'text-neutral' : 'text-neutral/40'}`}>
              {feature.text}
            </span>
          </li>
        ))}
      </ul>
      
      <button 
        className={`w-full py-3 px-6 rounded-full font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
          highlighted 
            ? 'bg-primary text-white hover:bg-primary-dark shadow-button hover:shadow-button-hover transform hover:scale-105' 
            : 'bg-white text-primary border-2 border-primary hover:bg-primary/5 transform hover:scale-105'
        } ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
        onClick={() => onSubscribe(tier)}
        disabled={isLoading}
      >
        {isLoading ? 'Processing...' : 'Select Plan'} {highlighted && <ArrowRight className="w-5 h-5" />}
      </button>
    </div>
  );
};

const PlanSelection = () => {
  const [plan, setPlan] = useState<PricingPlan>('monthly');
  const [isLoading, setIsLoading] = useState(false);
  const [processingTier, setProcessingTier] = useState<SubscriptionTier | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const handlePlanToggle = (newPlan: PricingPlan) => {
    setPlan(newPlan);
  };
  
  const handleSubscribe = async (tier: SubscriptionTier) => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to subscribe to a plan.',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }
    
    setIsLoading(true);
    setProcessingTier(tier);
    
    try {
      // In a real app, this would create a subscription with Stripe or another payment processor
      // For this demo, we'll simulate a successful subscription
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Redirect to dashboard with success message
      navigate('/dashboard?subscription=success&mock=true');
    } catch (error) {
      console.error('Error creating subscription:', error);
      toast({
        title: 'Subscription failed',
        description: 'There was a problem processing your subscription. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setProcessingTier(null);
    }
  };
  
  const pricingTiers = [
    {
      title: 'Basic',
      price: {
        monthly: 9.99,
        yearly: 7.99,
      },
      description: 'Essential home maintenance for budget-conscious homeowners.',
      features: [
        { text: 'Seasonal maintenance reminders', included: true },
        { text: 'Basic home maintenance guide', included: true },
        { text: 'Email support', included: true },
        { text: 'Personalized maintenance schedule', included: true },
        { text: 'Priority support', included: false },
        { text: 'Professional consultation', included: false },
      ],
      tier: 'basic' as SubscriptionTier,
      icon: <Clock className="h-8 w-8 text-primary" />,
    },
    {
      title: 'Pro',
      price: {
        monthly: 19.99,
        yearly: 15.99,
      },
      description: 'Comprehensive coverage for proactive homeowners.',
      features: [
        { text: 'All Basic features', included: true },
        { text: 'Detailed maintenance tutorials', included: true },
        { text: 'Priority email support', included: true },
        { text: 'Maintenance cost estimator', included: true },
        { text: 'Service provider recommendations', included: true },
        { text: 'Professional consultation', included: false },
      ],
      tier: 'pro' as SubscriptionTier,
      highlighted: true,
      icon: <Calendar className="h-8 w-8 text-primary" />,
    },
    {
      title: 'Premium',
      price: {
        monthly: 29.99,
        yearly: 23.99,
      },
      description: 'Ultimate protection for your valuable home investment.',
      features: [
        { text: 'All Pro features', included: true },
        { text: 'Phone support', included: true },
        { text: 'Quarterly professional consultation', included: true },
        { text: 'Emergency maintenance guidance', included: true },
        { text: 'Custom maintenance alerts', included: true },
        { text: 'Home value protection report', included: true },
      ],
      tier: 'premium' as SubscriptionTier,
      icon: <Zap className="h-8 w-8 text-primary" />,
    },
  ];
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4 py-16 max-w-7xl">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-3">Choose Your Plan</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Select the plan that best fits your home maintenance needs. All plans include our core features.
          </p>
        </div>
        
        <ProgressBar value={100} max={100} size="sm" color="success" />
        
        {/* Billing toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-white rounded-full p-1 inline-flex shadow-sm border border-gray-100">
            <button
              onClick={() => handlePlanToggle('monthly')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                plan === 'monthly' 
                  ? 'bg-primary text-white shadow-sm' 
                  : 'text-neutral hover:text-primary'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => handlePlanToggle('yearly')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                plan === 'yearly' 
                  ? 'bg-primary text-white shadow-sm' 
                  : 'text-neutral hover:text-primary'
              }`}
            >
              Yearly <span className="text-secondary font-medium ml-1">Save 20%</span>
            </button>
          </div>
        </div>
        
        {/* Pricing tiers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {pricingTiers.map((tier) => (
            <div key={tier.tier} className="flex flex-col">
              <div className="flex items-center gap-3 mb-4 px-2">
                {tier.icon}
                <h3 className="text-xl font-semibold text-primary">{tier.title} Plan</h3>
              </div>
              <PricingTier
                {...tier}
                plan={plan}
                onSubscribe={handleSubscribe}
                isLoading={isLoading && processingTier === tier.tier}
              />
            </div>
          ))}
        </div>
        
        {/* Skip for now button - moved below pricing options */}
        <div className="mt-8 text-center">
          <Button 
            variant="outline" 
            onClick={() => navigate('/dashboard')}
            className="mx-auto"
          >
            Skip for now
          </Button>
        </div>
        
        {/* Money-back guarantee */}
        <div className="mt-12 bg-tertiary/10 rounded-xl p-6 border border-tertiary/20 max-w-2xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="bg-tertiary rounded-full p-2 flex-shrink-0">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1 text-neutral">30-Day Money-Back Guarantee</h3>
              <p className="text-neutral/80">
                Not satisfied with our service? Get a full refund within 30 days, no questions asked.
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-neutral/60 text-sm">
            All plans are billed according to your selected billing cycle. You can cancel anytime.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PlanSelection; 