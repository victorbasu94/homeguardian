import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, X, ArrowRight, Shield, Zap, Home } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StickyCallToAction from '@/components/StickyCallToAction';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

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
  const yearlyDiscount = Math.round((1 - (price.yearly / 12) / price.monthly) * 100);
  
  return (
    <div className={`
      relative rounded-2xl overflow-hidden transition-all duration-300
      ${highlighted 
        ? 'border-2 border-primary shadow-xl scale-105 z-10 bg-white' 
        : 'border border-gray-200 shadow-card bg-white hover:shadow-card-hover'}
    `}>
      {highlighted && (
        <div className="absolute top-0 left-0 right-0 bg-primary text-white text-center py-2 font-medium">
          Most Popular
        </div>
      )}
      
      <div className={`p-8 ${highlighted ? 'pt-14' : 'pt-8'}`}>
        <div className="flex items-center gap-4 mb-4">
          <div className={`
            p-3 rounded-full 
            ${highlighted ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-neutral/70'}
          `}>
            {icon}
          </div>
          <h3 className="text-2xl font-bold">{title}</h3>
        </div>
        
        <p className="text-neutral/70 mb-6">{description}</p>
        
        <div className="mb-6">
          <div className="flex items-end gap-2">
            <span className="text-4xl font-bold">
              ${plan === 'monthly' ? price.monthly : Math.round(price.yearly / 12)}
            </span>
            <span className="text-neutral/70 mb-1">/month</span>
          </div>
          
          {plan === 'yearly' && (
            <div className="text-sm mt-1 text-primary font-medium">
              Save {yearlyDiscount}% with annual billing
            </div>
          )}
          
          <div className="text-sm text-neutral/70 mt-1">
            {plan === 'yearly' 
              ? `$${price.yearly} billed annually` 
              : 'Billed monthly'}
          </div>
        </div>
        
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Home className="h-4 w-4 text-neutral/70" />
            <span className="text-neutral/70">Up to {homes} {homes === 1 ? 'home' : 'homes'}</span>
          </div>
          
          <Button 
            onClick={() => onSubscribe(tier)} 
            className={`w-full ${highlighted ? '' : 'bg-primary/10 text-primary hover:bg-primary/20'}`}
            variant={highlighted ? 'default' : 'outline'}
            size="lg"
          >
            Get Started <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
        
        <div className="space-y-4">
          <div className="text-sm font-medium">Includes:</div>
          {features.map((feature, i) => (
            <div key={i} className="flex items-start gap-3">
              {feature.included ? (
                <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              ) : (
                <X className="h-5 w-5 text-neutral/30 mt-0.5 flex-shrink-0" />
              )}
              <span className={feature.included ? 'text-neutral/80' : 'text-neutral/50'}>
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
  
  const handlePlanToggle = () => {
    setPlan(plan === 'monthly' ? 'yearly' : 'monthly');
  };
  
  const handleSubscribe = (tier: SubscriptionTier) => {
    // In a real app, this would navigate to checkout with the selected tier
    console.log(`Subscribing to ${tier} plan`);
    window.location.href = `/register?plan=${tier}&billing=${plan}`;
  };
  
  const pricingTiers = [
    {
      title: 'Basic',
      tier: 'basic' as SubscriptionTier,
      icon: <Shield className="h-6 w-6" />,
      price: {
        monthly: 9.99,
        yearly: 99.99,
      },
      description: 'Essential home maintenance for single-home owners',
      homes: 1,
      highlighted: false,
      features: [
        { text: 'Personalized maintenance schedule', included: true },
        { text: 'Basic task reminders', included: true },
        { text: 'DIY maintenance guides', included: true },
        { text: 'Seasonal checklists', included: true },
        { text: 'Maintenance history tracking', included: true },
        { text: 'Professional service recommendations', included: false },
        { text: 'Priority support', included: false },
        { text: 'Multiple homes', included: false },
        { text: 'Advanced reporting', included: false },
      ],
    },
    {
      title: 'Pro',
      tier: 'pro' as SubscriptionTier,
      icon: <Zap className="h-6 w-6" />,
      price: {
        monthly: 19.99,
        yearly: 199.99,
      },
      description: 'Advanced features for serious homeowners',
      homes: 2,
      highlighted: true,
      features: [
        { text: 'Personalized maintenance schedule', included: true },
        { text: 'Advanced task reminders', included: true },
        { text: 'DIY maintenance guides', included: true },
        { text: 'Seasonal checklists', included: true },
        { text: 'Maintenance history tracking', included: true },
        { text: 'Professional service recommendations', included: true },
        { text: 'Priority support', included: true },
        { text: 'Multiple homes', included: true },
        { text: 'Advanced reporting', included: false },
      ],
    },
    {
      title: 'Premium',
      tier: 'premium' as SubscriptionTier,
      icon: <Home className="h-6 w-6" />,
      price: {
        monthly: 29.99,
        yearly: 299.99,
      },
      description: 'Complete solution for multiple properties',
      homes: 5,
      highlighted: false,
      features: [
        { text: 'Personalized maintenance schedule', included: true },
        { text: 'Advanced task reminders', included: true },
        { text: 'DIY maintenance guides', included: true },
        { text: 'Seasonal checklists', included: true },
        { text: 'Maintenance history tracking', included: true },
        { text: 'Professional service recommendations', included: true },
        { text: 'Priority support', included: true },
        { text: 'Multiple homes', included: true },
        { text: 'Advanced reporting', included: true },
      ],
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
      
      {/* Pricing Toggle */}
      <section className="py-12 -mt-16 relative z-20">
        <div className="container-width">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-xs mx-auto flex items-center justify-center gap-4">
            <span className={`font-medium ${plan === 'monthly' ? 'text-primary' : 'text-neutral/70'}`}>
              Monthly
            </span>
            
            <Switch 
              checked={plan === 'yearly'} 
              onCheckedChange={handlePlanToggle} 
              className="data-[state=checked]:bg-primary"
            />
            
            <div className="flex items-center gap-2">
              <span className={`font-medium ${plan === 'yearly' ? 'text-primary' : 'text-neutral/70'}`}>
                Yearly
              </span>
              <span className="bg-tertiary/20 text-tertiary text-xs font-bold px-2 py-1 rounded-full">
                Save 20%
              </span>
            </div>
          </div>
        </div>
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
            <p className="text-neutral/70 mb-2">All plans include a 30-day money-back guarantee</p>
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
                answer: "Yes, we offer a 30-day money-back guarantee on all our plans. If you're not completely satisfied with HomeGuardian within the first 30 days, simply contact our support team for a full refund."
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
      
      {/* CTA Section */}
      <section className="section-padding bg-primary text-white">
        <div className="container-width">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-white mb-6">Start Protecting Your Home Today</h2>
            <p className="text-white/90 text-xl mb-8">
              Join thousands of homeowners who trust HomeGuardian to keep their homes in perfect condition.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="bg-white text-primary hover:bg-white/90 px-8 py-3 rounded-full font-medium text-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105">
                Get Started Now <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/how-it-works" className="bg-white/10 text-white hover:bg-white/20 px-8 py-3 rounded-full font-medium text-xl transition-all duration-300 flex items-center justify-center gap-2">
                Learn More
              </Link>
            </div>
            
            <div className="mt-8 text-white/80">
              <span className="flex items-center justify-center gap-2">
                <CheckCircle className="h-5 w-5" /> 30-day money-back guarantee
              </span>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
      <StickyCallToAction />
    </div>
  );
};

export default Pricing;
