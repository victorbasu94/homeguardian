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
        ? 'border-2 border-primary shadow-xl scale-105 z-10 bg-white' 
        : 'border border-neutral/10 shadow-md bg-white/80'}
    `}>
      {highlighted && (
        <div className="absolute top-0 left-0 right-0 bg-primary text-white text-center py-1.5 text-sm font-medium">
          Most Popular
        </div>
      )}
      
      <div className="p-6 pt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-primary/10 p-2 rounded-full">
            {icon}
          </div>
          <h3 className="text-xl font-semibold">{title}</h3>
        </div>
        
        <div>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-bold">
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
            className={`w-full ${highlighted ? 'bg-primary hover:bg-primary/90' : ''}`}
            onClick={() => onSubscribe(tier)}
          >
            Get Started
          </Button>
        </div>
        
        <div className="mt-6 space-y-4">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start gap-3">
              {feature.included ? (
                <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
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
    // In a real app, this would redirect to a checkout page
    window.location.href = `/register?plan=${tier}&billing=${plan}`;
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
      icon: <Home className="h-6 w-6 text-primary" />,
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
      icon: <Shield className="h-6 w-6 text-primary" />,
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
      icon: <Zap className="h-6 w-6 text-primary" />,
      homes: 5,
    },
  ];
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden bg-primary-gradient text-white">
        <div className="container-width relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-white mb-6">
              Simple, Transparent Pricing
            </h1>
            <p className="text-white/90 text-xl mb-8 max-w-2xl mx-auto">
              Choose the plan that's right for your home maintenance needs. All plans include our core AI-powered maintenance technology.
            </p>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-20 right-10 w-64 h-64 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-80 h-80 rounded-full bg-white/5 blur-3xl"></div>
      </section>
      
      {/* Pricing Tiers */}
      <section className="section-padding bg-softWhite -mt-12 pt-24">
        <div className="container-width">
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
            <p className="text-neutral/70">Have questions? <Link to="/contact" className="text-primary hover:underline">Contact our team</Link></p>
          </div>
        </div>
      </section>
      
      {/* FAQ Section */}
      <section className="section-padding bg-white">
        <div className="container-width">
          <div className="text-center mb-16">
            <h2 className="mb-4">Frequently Asked Questions</h2>
            <p className="text-neutral/80 max-w-2xl mx-auto text-lg">
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
                answer: "No long-term contracts or commitments. You can cancel your subscription at any time from your account settings. If you cancel, you'll maintain access until the end of your current billing period."
              },
              {
                question: "Do you offer refunds?",
                answer: "If you're not completely satisfied with HomeGuardian, simply contact our support team to discuss refund options."
              },
              {
                question: "What payment methods do you accept?",
                answer: "We accept all major credit cards (Visa, Mastercard, American Express, Discover) as well as PayPal. All payments are securely processed and your information is never stored on our servers."
              }
            ].map((faq, i) => (
              <div key={i} className="bg-softWhite p-6 rounded-xl border border-gray-100 shadow-card">
                <button className="flex justify-between items-center w-full text-left">
                  <h3 className="text-lg font-bold">{faq.question}</h3>
                  <ArrowRight className="h-5 w-5 text-primary flex-shrink-0" />
                </button>
                <div className="mt-4 text-neutral/80">
                  <p>{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Comparison Table (Mobile Hidden) */}
      <section className="section-padding bg-softWhite hidden lg:block">
        <div className="container-width">
          <div className="text-center mb-16">
            <h2 className="mb-4">Plan Comparison</h2>
            <p className="text-neutral/80 max-w-2xl mx-auto text-lg">
              Compare all features across our different plans
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left p-6 font-medium text-neutral/70">Features</th>
                  <th className="p-6 text-center">
                    <div className="font-bold text-xl mb-1">Basic</div>
                    <div className="text-primary font-bold">${plan === 'monthly' ? '9.99' : '8.33'}/mo</div>
                  </th>
                  <th className="p-6 text-center bg-primary/5 border-x border-primary/10">
                    <div className="font-bold text-xl mb-1">Pro</div>
                    <div className="text-primary font-bold">${plan === 'monthly' ? '19.99' : '16.67'}/mo</div>
                  </th>
                  <th className="p-6 text-center">
                    <div className="font-bold text-xl mb-1">Premium</div>
                    <div className="text-primary font-bold">${plan === 'monthly' ? '29.99' : '24.99'}/mo</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="p-6 font-medium">Homes</td>
                  <td className="p-6 text-center">1 home</td>
                  <td className="p-6 text-center bg-primary/5 border-x border-primary/10">2 homes</td>
                  <td className="p-6 text-center">5 homes</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="p-6 font-medium">Maintenance Tasks</td>
                  <td className="p-6 text-center">Unlimited</td>
                  <td className="p-6 text-center bg-primary/5 border-x border-primary/10">Unlimited</td>
                  <td className="p-6 text-center">Unlimited</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="p-6 font-medium">Task Reminders</td>
                  <td className="p-6 text-center">Basic (Email)</td>
                  <td className="p-6 text-center bg-primary/5 border-x border-primary/10">Advanced (Email, SMS)</td>
                  <td className="p-6 text-center">Advanced (Email, SMS)</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="p-6 font-medium">DIY Guides</td>
                  <td className="p-6 text-center">
                    <CheckCircle className="h-5 w-5 text-primary mx-auto" />
                  </td>
                  <td className="p-6 text-center bg-primary/5 border-x border-primary/10">
                    <CheckCircle className="h-5 w-5 text-primary mx-auto" />
                  </td>
                  <td className="p-6 text-center">
                    <CheckCircle className="h-5 w-5 text-primary mx-auto" />
                  </td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="p-6 font-medium">Professional Recommendations</td>
                  <td className="p-6 text-center">
                    <X className="h-5 w-5 text-neutral/30 mx-auto" />
                  </td>
                  <td className="p-6 text-center bg-primary/5 border-x border-primary/10">
                    <CheckCircle className="h-5 w-5 text-primary mx-auto" />
                  </td>
                  <td className="p-6 text-center">
                    <CheckCircle className="h-5 w-5 text-primary mx-auto" />
                  </td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="p-6 font-medium">Priority Support</td>
                  <td className="p-6 text-center">
                    <X className="h-5 w-5 text-neutral/30 mx-auto" />
                  </td>
                  <td className="p-6 text-center bg-primary/5 border-x border-primary/10">
                    <CheckCircle className="h-5 w-5 text-primary mx-auto" />
                  </td>
                  <td className="p-6 text-center">
                    <CheckCircle className="h-5 w-5 text-primary mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="p-6 font-medium">Advanced Reporting</td>
                  <td className="p-6 text-center">
                    <X className="h-5 w-5 text-neutral/30 mx-auto" />
                  </td>
                  <td className="p-6 text-center bg-primary/5 border-x border-primary/10">
                    <X className="h-5 w-5 text-neutral/30 mx-auto" />
                  </td>
                  <td className="p-6 text-center">
                    <CheckCircle className="h-5 w-5 text-primary mx-auto" />
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="border-t border-gray-200 bg-gray-50">
                  <td className="p-6"></td>
                  <td className="p-6 text-center">
                    <Button 
                      onClick={() => handleSubscribe('basic')} 
                      variant="outline"
                      className="bg-primary/10 text-primary hover:bg-primary/20"
                    >
                      Choose Basic
                    </Button>
                  </td>
                  <td className="p-6 text-center bg-primary/5 border-x border-primary/10">
                    <Button 
                      onClick={() => handleSubscribe('pro')}
                    >
                      Choose Pro
                    </Button>
                  </td>
                  <td className="p-6 text-center">
                    <Button 
                      onClick={() => handleSubscribe('premium')} 
                      variant="outline"
                      className="bg-primary/10 text-primary hover:bg-primary/20"
                    >
                      Choose Premium
                    </Button>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Pricing;

