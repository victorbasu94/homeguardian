import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, X, ArrowRight, Shield, Zap, Home } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

type PricingPlan = 'monthly';
type SubscriptionTier = 'basic' | 'pro' | 'premium';

interface PricingTierProps {
  title: string;
  price: {
    monthly: number;
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
  icon: React.ReactNode;
  homes: number;
}

const PricingTier: React.FC<PricingTierProps> = ({ 
  title, 
  price, 
  description, 
  features, 
  highlighted = false, 
  plan,
  tier,
  onSubscribe,
  icon,
  homes
}) => {
  return (
    <div className={`
      relative rounded-2xl overflow-hidden transition-all duration-300
      ${highlighted 
        ? 'border-2 border-[#A3BFFA] shadow-card-hover scale-105 z-10 bg-white transform hover:translate-y-[-5px]' 
        : 'border border-neutral/10 shadow-card bg-white/80 transform hover:translate-y-[-5px] hover:shadow-card-hover'}
    `}>
      {highlighted && (
        <div className="absolute top-0 left-0 right-0 bg-[#A3BFFA] text-white text-center py-1.5 text-sm font-medium">
          Most Popular
        </div>
      )}
      
      <div className="p-6 pt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-[#A3BFFA]/10 p-2 rounded-full">
            {React.cloneElement(icon as React.ReactElement, { className: "h-6 w-6 text-[#A3BFFA]" })}
          </div>
          <h3 className="text-xl font-semibold">{title}</h3>
        </div>
        
        <div>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-bold text-[#A3BFFA]">
              ${price.monthly}
            </span>
            <span className="text-neutral/70 mb-1">/ month</span>
          </div>
          
          <p className="text-neutral/80 mt-3 text-sm">
            {description}
          </p>
          
          <div className="mt-2 text-sm text-neutral/70">
            For up to {homes} {homes === 1 ? 'home' : 'homes'}
          </div>
        </div>
        
        <div className="mt-6">
          <Button 
            className={`w-full ${highlighted 
              ? 'bg-[#A3BFFA] text-white font-medium hover:bg-[#A3BFFA]/90 transition-all duration-300 shadow-md' 
              : 'bg-[#A3BFFA] text-white font-medium hover:bg-[#A3BFFA]/90 transition-all duration-300 shadow-md'}`}
            onClick={() => onSubscribe(tier)}
          >
            Get Started <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
        
        <div className="mt-6 space-y-4">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start gap-3">
              {feature.included ? (
                <CheckCircle className="h-5 w-5 text-[#A3BFFA] flex-shrink-0 mt-0.5" />
              ) : (
                <X className="h-5 w-5 text-neutral/40 flex-shrink-0 mt-0.5" />
              )}
              <span className={feature.included ? 'text-neutral' : 'text-neutral/50'}>
                {feature.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Pricing: React.FC = () => {
  const [plan, setPlan] = useState<PricingPlan>('monthly');
  
  const handleSubscribe = (tier: SubscriptionTier) => {
    console.log(`Subscribing to ${tier} plan`);
    // Redirect to registration with plan pre-selected
    window.location.href = `/register?plan=${tier}`;
  };
  
  const pricingTiers = [
    {
      title: 'Basic',
      price: {
        monthly: 9.99,
      },
      description: 'Essential home maintenance for budget-conscious homeowners.',
      features: [
        { text: 'Seasonal maintenance reminders', included: true },
        { text: 'Basic home maintenance guide', included: true },
        { text: 'Email support', included: true },
        { text: 'Personalized maintenance schedule', included: true },
        { text: 'Priority support', included: false },
        { text: 'Professional consultation', included: false },
        { text: 'Service provider recommendations', included: false },
        { text: 'Home value protection report', included: false },
      ],
      tier: 'basic' as SubscriptionTier,
      icon: <Home className="h-6 w-6 text-[#A3BFFA]" />,
      homes: 1,
    },
    {
      title: 'Pro',
      price: {
        monthly: 19.99,
      },
      description: 'Comprehensive coverage for proactive homeowners.',
      features: [
        { text: 'All Basic features', included: true },
        { text: 'Detailed maintenance tutorials', included: true },
        { text: 'Priority email support', included: true },
        { text: 'Maintenance cost estimator', included: true },
        { text: 'Service provider recommendations', included: true },
        { text: 'Professional consultation', included: false },
        { text: 'Custom maintenance alerts', included: false },
        { text: 'Home value protection report', included: false },
      ],
      tier: 'pro' as SubscriptionTier,
      highlighted: true,
      icon: <Shield className="h-6 w-6 text-[#A3BFFA]" />,
      homes: 2,
    },
    {
      title: 'Premium',
      price: {
        monthly: 29.99,
      },
      description: 'Ultimate protection for your valuable home investment.',
      features: [
        { text: 'All Pro features', included: true },
        { text: 'Phone support', included: true },
        { text: 'Quarterly professional consultation', included: true },
        { text: 'Emergency maintenance guidance', included: true },
        { text: 'Custom maintenance alerts', included: true },
        { text: 'Home value protection report', included: true },
        { text: 'Multiple property management', included: true },
        { text: 'Annual home health assessment', included: true },
      ],
      tier: 'premium' as SubscriptionTier,
      icon: <Zap className="h-6 w-6 text-[#A3BFFA]" />,
      homes: 5,
    },
  ];
  
  return (
    <div className="min-h-screen flex flex-col bg-softWhite">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-r from-[#A3BFFA] to-[#D4C7A9] text-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 font-poppins leading-tight animate-fade-in">Simple, Transparent Pricing</h1>
            <p className="text-xl md:text-2xl mb-8 font-inter text-white/90 animate-slide-in">
              Choose the plan that's right for your home maintenance needs.
            </p>
          </div>
        </div>
      </section>
      
      {/* Pricing Tiers */}
      <section className="py-20 bg-softWhite -mt-12 pt-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingTiers.map((tier) => (
              <PricingTier
                key={tier.tier}
                title={tier.title}
                price={tier.price}
                description={tier.description}
                features={tier.features}
                highlighted={tier.highlighted}
                plan={plan}
                tier={tier.tier}
                onSubscribe={handleSubscribe}
                icon={tier.icon}
                homes={tier.homes}
              />
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <p className="text-neutral/70 font-inter">Have questions? <Link to="/contact" className="text-[#A3BFFA] hover:text-[#A3BFFA]/80">Contact our team</Link></p>
          </div>
        </div>
      </section>
      
      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#A3BFFA] to-[#D4C7A9] font-poppins">Frequently Asked Questions</h2>
            <p className="text-neutral/80 max-w-2xl mx-auto text-lg font-inter">
              Find answers to common questions about our pricing and plans
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto space-y-6">
            {[
              {
                question: "Can I change plans later?",
                answer: "Yes! You can upgrade or downgrade your plan at any time. If you upgrade, you'll be charged the prorated difference for the remainder of your billing cycle. If you downgrade, you'll receive credit toward your next billing cycle."
              },
              {
                question: "What happens after my trial ends?",
                answer: "After your 30-day trial, you'll be automatically billed for the plan you selected during registration. We'll send you a reminder email 3 days before your trial ends, so you'll have time to make any changes or cancel if needed."
              },
              {
                question: "Is there a contract or commitment?",
                answer: "No, all our plans are month-to-month with no long-term contracts. You can cancel anytime from your account settings."
              },
              {
                question: "Can I add more homes to my plan?",
                answer: "Yes, you can add additional homes to any plan for an extra fee. The Basic plan allows 1 home, Pro allows 2 homes, and Premium allows up to 5 homes. Contact support if you need to manage more than 5 homes."
              },
              {
                question: "Do you offer refunds?",
                answer: "We offer a 30-day money-back guarantee if you're not satisfied with our service. After that period, we don't provide refunds for partial months, but you can cancel anytime to avoid future charges."
              }
            ].map((faq, i) => (
              <div key={i} className="bg-softWhite p-6 rounded-xl border border-neutral/10 shadow-card hover:shadow-card-hover transition-all duration-300">
                <h3 className="text-xl font-bold mb-2 text-neutral font-poppins">{faq.question}</h3>
                <p className="text-neutral/80 font-inter">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-softWhite relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#A3BFFA]/10 to-[#D4C7A9]/10"></div>
        
        {/* Decorative elements */}
        <div className="absolute top-20 right-10 w-64 h-64 rounded-full bg-[#A3BFFA]/10 blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-80 h-80 rounded-full bg-[#D4C7A9]/10 blur-3xl"></div>
        
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="bg-white rounded-2xl shadow-card p-8 md:p-12 text-center max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-4 font-poppins">Ready to Protect Your Home?</h2>
            <p className="text-neutral/80 max-w-2xl mx-auto text-lg mb-8 font-inter">
              Join thousands of homeowners who trust HomeGuardian to keep their homes in perfect condition.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="bg-[#A3BFFA] text-white hover:bg-[#A3BFFA]/90 px-8 py-3 rounded-lg font-medium text-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg">
                Get Started Now <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/contact" className="border border-[#A3BFFA] bg-transparent text-[#A3BFFA] hover:bg-[#A3BFFA]/5 px-8 py-3 rounded-lg font-medium text-xl transition-all duration-300 flex items-center justify-center gap-2">
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Pricing;

