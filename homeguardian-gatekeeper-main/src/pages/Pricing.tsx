import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, X, ArrowRight, Shield, Zap, Home, ChevronRight } from 'lucide-react';
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
      relative rounded-lg overflow-hidden flex flex-col h-full
      ${highlighted 
        ? 'border-2 border-[#A3BFFA] shadow-md bg-white' 
        : 'border border-[#4A4A4A]/10 shadow-sm bg-white'}
    `}>
      {highlighted && (
        <div className="absolute top-0 right-0 bg-[#A3BFFA] text-white text-xs font-medium px-3 py-1 rounded-bl-lg">
          Most Popular
        </div>
      )}
      
      <div className="p-6 border-b border-[#4A4A4A]/10">
        <h3 className="text-xl font-semibold mb-2 text-[#1A2526]">{title}</h3>
        <div className="flex items-baseline mb-4">
          <span className="text-3xl font-bold text-[#1A2526]">${price.monthly}</span>
          <span className="text-sm text-[#4A4A4A] ml-1">/ month</span>
        </div>
        <p className="text-sm text-[#4A4A4A]">{description}</p>
      </div>
      
      <div className="p-6 flex-grow">
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              {feature.included ? (
                <CheckCircle className="h-5 w-5 text-[#A3BFFA] shrink-0 mt-0.5" />
              ) : (
                <X className="h-5 w-5 text-[#4A4A4A]/40 shrink-0 mt-0.5" />
              )}
              <span className={feature.included ? 'text-sm text-[#1A2526]' : 'text-sm text-[#4A4A4A]/50'}>
                {feature.text}
              </span>
            </li>
          ))}
        </ul>
        
        <div className="mt-4 text-sm text-[#4A4A4A]">
          For up to {homes} {homes === 1 ? 'home' : 'homes'}
        </div>
      </div>
      
      <div className="p-6 pt-0 mt-auto">
        <Button 
          className={`w-full ${highlighted 
            ? 'bg-[#A3BFFA] hover:bg-[#A3BFFA]/90 text-white' 
            : 'border border-[#A3BFFA] bg-white text-[#A3BFFA] hover:bg-[#A3BFFA]/10'}`}
          onClick={() => onSubscribe(tier)}
        >
          Get Started
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
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
      description: 'Perfect for new homeowners just getting started.',
      features: [
        { text: 'Seasonal maintenance reminders', included: true },
        { text: 'Basic home inventory', included: true },
        { text: 'DIY maintenance guides', included: true },
        { text: 'Email support', included: true },
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
      description: 'Ideal for most homeowners with active maintenance needs.',
      features: [
        { text: 'Everything in Basic', included: true },
        { text: 'Seasonal maintenance plans', included: true },
        { text: 'Professional service finder', included: true },
        { text: 'Maintenance cost tracking', included: true },
        { text: 'Priority email & chat support', included: true },
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
      description: 'For homeowners with complex or multiple properties.',
      features: [
        { text: 'Everything in Pro', included: true },
        { text: 'Multiple property support', included: true },
        { text: 'Advanced maintenance analytics', included: true },
        { text: 'Dedicated account manager', included: true },
        { text: 'Priority phone support', included: true },
        { text: 'Custom maintenance workflows', included: true },
        { text: 'Home value protection report', included: true },
        { text: 'Annual home health assessment', included: true },
      ],
      tier: 'premium' as SubscriptionTier,
      icon: <Zap className="h-6 w-6 text-[#A3BFFA]" />,
      homes: 5,
    },
  ];
  
  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F5]">
      <Navbar />
      
      {/* Hero Section - Keep gradient background */}
      <section className="pt-32 pb-20 bg-gradient-to-r from-[#A3BFFA] to-[#D4C7A9] text-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90">
              Choose the plan that's right for your home maintenance needs.
            </p>
          </div>
        </div>
      </section>
      
      {/* Pricing Tiers - Mercury Style */}
      <section className="py-20 bg-[#F5F5F5] -mt-12 pt-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
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
            <p className="text-sm text-[#4A4A4A] mb-4">All plans include a 14-day free trial. No credit card required.</p>
            <Link to="/faq" className="text-[#A3BFFA] text-sm font-medium inline-flex items-center hover:underline">
              Have questions? Contact our team
              <ChevronRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>
      
      {/* Features Comparison - Mercury Style */}
      <section className="py-20 bg-white border-y border-[#4A4A4A]/10">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold mb-4 text-[#1A2526]">Compare All Features</h2>
            <p className="text-[#4A4A4A] max-w-2xl mx-auto">
              Find the perfect plan for your home maintenance needs
            </p>
          </div>
          
          <div className="max-w-5xl mx-auto overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-[#4A4A4A]/10">
                  <th className="text-left p-4 text-[#4A4A4A] font-medium">Feature</th>
                  <th className="p-4 text-[#1A2526] font-medium">Basic</th>
                  <th className="p-4 text-[#1A2526] font-medium">Pro</th>
                  <th className="p-4 text-[#1A2526] font-medium">Premium</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: "Maintenance Reminders", basic: true, pro: true, premium: true },
                  { feature: "Home Inventory", basic: "Basic", pro: "Advanced", premium: "Comprehensive" },
                  { feature: "DIY Guides", basic: "Limited", pro: "Full Access", premium: "Full Access" },
                  { feature: "Support", basic: "Email", pro: "Email & Chat", premium: "Email, Chat & Phone" },
                  { feature: "Service Provider Network", basic: false, pro: true, premium: true },
                  { feature: "Maintenance Cost Tracking", basic: false, pro: true, premium: true },
                  { feature: "Multiple Properties", basic: false, pro: false, premium: true },
                  { feature: "Custom Workflows", basic: false, pro: false, premium: true },
                  { feature: "Dedicated Account Manager", basic: false, pro: false, premium: true },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-[#4A4A4A]/10">
                    <td className="text-left p-4 text-[#1A2526] font-medium">{row.feature}</td>
                    <td className="p-4 text-center">
                      {row.basic === true ? (
                        <CheckCircle className="h-5 w-5 text-[#A3BFFA] mx-auto" />
                      ) : row.basic === false ? (
                        <X className="h-5 w-5 text-[#4A4A4A]/40 mx-auto" />
                      ) : (
                        <span className="text-sm text-[#4A4A4A]">{row.basic}</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {row.pro === true ? (
                        <CheckCircle className="h-5 w-5 text-[#A3BFFA] mx-auto" />
                      ) : row.pro === false ? (
                        <X className="h-5 w-5 text-[#4A4A4A]/40 mx-auto" />
                      ) : (
                        <span className="text-sm text-[#4A4A4A]">{row.pro}</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {row.premium === true ? (
                        <CheckCircle className="h-5 w-5 text-[#A3BFFA] mx-auto" />
                      ) : row.premium === false ? (
                        <X className="h-5 w-5 text-[#4A4A4A]/40 mx-auto" />
                      ) : (
                        <span className="text-sm text-[#4A4A4A]">{row.premium}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
      
      {/* FAQ Section - Mercury Style */}
      <section className="py-20 bg-[#F5F5F5]">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold mb-4 text-[#1A2526]">Frequently Asked Questions</h2>
            <p className="text-[#4A4A4A] max-w-2xl mx-auto">
              Find answers to common questions about our pricing and plans
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto space-y-4">
            {[
              {
                question: "Can I change plans later?",
                answer: "Yes! You can upgrade or downgrade your plan at any time. If you upgrade, you'll be charged the prorated difference for the remainder of your billing cycle. If you downgrade, you'll receive credit toward your next billing cycle."
              },
              {
                question: "What happens after my trial ends?",
                answer: "After your 14-day trial, you'll be automatically billed for the plan you selected during registration. We'll send you a reminder email 3 days before your trial ends, so you'll have time to make any changes or cancel if needed."
              },
              {
                question: "Is there a contract or commitment?",
                answer: "No, all our plans are month-to-month with no long-term contracts. You can cancel anytime from your account settings."
              },
              {
                question: "Can I get a refund if I'm not satisfied?",
                answer: "Yes, we offer a 30-day money-back guarantee. If you're not completely satisfied with MaintainMint within the first 30 days after your trial ends, contact our support team for a full refund."
              },
              {
                question: "Do you offer discounts for annual billing?",
                answer: "Not currently, but we're planning to introduce annual billing options with a discount in the near future. Stay tuned for updates!"
              }
            ].map((faq, i) => (
              <div key={i} className="bg-white p-6 rounded-lg border border-[#4A4A4A]/10 shadow-sm">
                <h3 className="text-lg font-medium mb-2 text-[#1A2526]">{faq.question}</h3>
                <p className="text-[#4A4A4A]">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section - Mercury Style */}
      <section className="py-20 bg-[#A3BFFA]">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl font-semibold text-white mb-6">Ready to simplify your home maintenance?</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of homeowners who trust MaintainMint to protect their biggest investment.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto">
            <Link 
              to="/register" 
              className="bg-white text-[#A3BFFA] px-6 py-3 rounded-lg text-base font-medium hover:bg-white/90 transition-all duration-300"
            >
              Get Started Now
            </Link>
            <Link 
              to="/faq" 
              className="border border-white text-white px-6 py-3 rounded-lg text-base font-medium hover:bg-white/10 transition-all duration-300"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Pricing;

