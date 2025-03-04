import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, CheckCircle, ArrowRight, Star, Clock, Calendar, Wrench, Zap, ChevronDown } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StickyCallToAction from '@/components/StickyCallToAction';
import { Button } from '@/components/ui/button';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-primary-gradient opacity-95 z-0"></div>
        
        {/* Decorative circles */}
        <div className="absolute top-20 right-10 w-64 h-64 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-80 h-80 rounded-full bg-white/5 blur-3xl"></div>
        
        <div className="container-width relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <h1 className="text-white mb-6 leading-tight">
                Protect Your Home with Smart Maintenance
              </h1>
              <p className="text-white/90 text-xl mb-8 max-w-lg">
                HomeGuardian creates personalized maintenance plans to prevent costly repairs and keep your home in perfect condition.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link to="/register" className="cta-button">
                  Guard My Home Now <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/how-it-works" className="bg-white/10 text-white hover:bg-white/20 px-8 py-3 rounded-full font-medium text-xl transition-all duration-300 flex items-center justify-center gap-2">
                  How It Works
                </Link>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-primary-dark flex items-center justify-center text-white font-bold">
                      {i}
                    </div>
                  ))}
                </div>
                <div className="text-white/90">
                  <span className="font-bold">4.9/5</span> from over 2,000 happy homeowners
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 relative z-10 transform hover:scale-105 transition-transform duration-500">
                <div className="absolute -top-4 -right-4 bg-tertiary text-tertiary-foreground px-4 py-2 rounded-full font-bold text-sm">
                  AI-Powered
                </div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Shield className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold">Home Maintenance Plan</h3>
                </div>
                
                <div className="space-y-4 mb-6">
                  {[
                    'Personalized maintenance schedule',
                    'Seasonal task reminders',
                    'Cost-saving preventative care',
                    'Expert recommendations'
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 mb-6">
                  <div className="text-sm text-neutral/70 mb-1">Average savings per year</div>
                  <div className="text-3xl font-bold text-primary">$2,800</div>
                </div>
                
                <Button className="w-full" size="lg">
                  Get Your Free Assessment <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-secondary rounded-2xl rotate-12 z-0"></div>
              <div className="absolute -top-6 -right-6 w-16 h-16 bg-tertiary rounded-full z-0"></div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Trusted By Section */}
      <section className="py-12 bg-gray-50">
        <div className="container-width">
          <p className="text-center text-neutral/70 mb-8">Trusted by homeowners across the country</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            {['HomeBuilders Inc.', 'PropertyGuard', 'SafeHaven Realty', 'Modern Living', 'HomeExperts'].map((company, i) => (
              <div key={i} className="text-neutral/50 font-bold text-xl">{company}</div>
            ))}
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="section-padding bg-white">
        <div className="container-width">
          <div className="text-center mb-16">
            <h2 className="mb-4">How HomeGuardian Works</h2>
            <p className="text-neutral/80 max-w-2xl mx-auto text-lg">
              Our simple 3-step process creates a personalized maintenance plan for your home
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Clock className="h-10 w-10 text-primary" />,
                title: 'Quick Setup',
                description: 'Answer a few questions about your home and we\'ll create your custom maintenance plan in minutes.'
              },
              {
                icon: <Calendar className="h-10 w-10 text-primary" />,
                title: 'Smart Scheduling',
                description: 'Get timely reminders for seasonal maintenance tasks tailored to your specific home systems.'
              },
              {
                icon: <Wrench className="h-10 w-10 text-primary" />,
                title: 'Easy Maintenance',
                description: 'Follow our step-by-step guides or connect with trusted professionals in your area.'
              }
            ].map((step, i) => (
              <div key={i} className="feature-card">
                <div className="bg-primary/10 p-4 rounded-full inline-block mb-6">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-neutral/80">{step.description}</p>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link to="/how-it-works" className="inline-flex items-center text-primary hover:text-primary-dark font-medium">
              Learn more about our process <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
      
      {/* Benefits Section */}
      <section className="section-padding bg-softWhite">
        <div className="container-width">
          <div className="text-center mb-16">
            <h2 className="mb-4">Why Choose HomeGuardian</h2>
            <p className="text-neutral/80 max-w-2xl mx-auto text-lg">
              Protect your biggest investment with our comprehensive home maintenance solution
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                title: 'Prevent Costly Repairs',
                description: 'Regular maintenance helps identify small issues before they become expensive problems.',
                icon: <Zap className="h-6 w-6 text-primary" />
              },
              {
                title: 'Extend Home Lifespan',
                description: 'Proper care of home systems can significantly extend their useful life.',
                icon: <Clock className="h-6 w-6 text-primary" />
              },
              {
                title: 'Increase Home Value',
                description: 'Well-maintained homes command higher resale values in the market.',
                icon: <ArrowRight className="h-6 w-6 text-primary" />
              },
              {
                title: 'Save Time and Effort',
                description: 'Our organized approach eliminates the guesswork from home maintenance.',
                icon: <CheckCircle className="h-6 w-6 text-primary" />
              }
            ].map((benefit, i) => (
              <div key={i} className="bg-white p-6 rounded-xl border border-gray-100 shadow-card hover:shadow-card-hover transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    {benefit.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
                    <p className="text-neutral/80">{benefit.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="section-padding bg-white">
        <div className="container-width">
          <div className="text-center mb-16">
            <h2 className="mb-4">What Our Users Say</h2>
            <p className="text-neutral/80 max-w-2xl mx-auto text-lg">
              Join thousands of satisfied homeowners who trust HomeGuardian
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "HomeGuardian has saved me thousands in potential repairs by catching issues early. The reminders are a lifesaver!",
                author: "Sarah Johnson",
                role: "Homeowner since 2020",
                rating: 5
              },
              {
                quote: "As a new homeowner, I had no idea what maintenance I should be doing. This app makes it so simple to keep my home in great shape.",
                author: "Michael Chen",
                role: "First-time homeowner",
                rating: 5
              },
              {
                quote: "The seasonal maintenance checklists are incredibly helpful. I no longer worry about forgetting important home care tasks.",
                author: "Emily Rodriguez",
                role: "Homeowner for 5+ years",
                rating: 4
              }
            ].map((testimonial, i) => (
              <div key={i} className="bg-white p-8 rounded-xl border border-gray-100 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className={`h-5 w-5 ${j < testimonial.rating ? 'text-tertiary' : 'text-gray-200'}`} fill={j < testimonial.rating ? 'currentColor' : 'none'} />
                  ))}
                </div>
                
                <p className="text-neutral/80 italic mb-6 flex-grow">"{testimonial.quote}"</p>
                
                <div>
                  <div className="font-bold">{testimonial.author}</div>
                  <div className="text-neutral/70 text-sm">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* FAQ Section */}
      <section className="section-padding bg-softWhite">
        <div className="container-width">
          <div className="text-center mb-16">
            <h2 className="mb-4">Frequently Asked Questions</h2>
            <p className="text-neutral/80 max-w-2xl mx-auto text-lg">
              Find answers to common questions about HomeGuardian
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto space-y-6">
            {[
              {
                question: "How does HomeGuardian create my maintenance plan?",
                answer: "We use information about your home's age, systems, and location to create a customized maintenance schedule. Our AI analyzes thousands of data points to recommend the most important tasks for your specific home."
              },
              {
                question: "Do I need technical knowledge to use HomeGuardian?",
                answer: "Not at all! HomeGuardian is designed for all homeowners, regardless of technical expertise. We provide step-by-step guides for DIY tasks and can connect you with professionals for more complex maintenance."
              },
              {
                question: "Can I customize my maintenance schedule?",
                answer: "Absolutely! While we provide an AI-generated schedule based on best practices, you can easily adjust task frequencies, add custom tasks, or skip recommendations that don't apply to your situation."
              },
              {
                question: "Is there a money-back guarantee?",
                answer: "Yes! We offer a 30-day money-back guarantee on all our plans. If you're not completely satisfied with HomeGuardian, simply contact our support team for a full refund."
              }
            ].map((faq, i) => (
              <div key={i} className="bg-white p-6 rounded-xl border border-gray-100 shadow-card">
                <button className="flex justify-between items-center w-full text-left">
                  <h3 className="text-lg font-bold">{faq.question}</h3>
                  <ChevronDown className="h-5 w-5 text-primary flex-shrink-0" />
                </button>
                <div className="mt-4 text-neutral/80">
                  <p>{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link to="/faq" className="inline-flex items-center text-primary hover:text-primary-dark font-medium">
              View all FAQs <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="section-padding bg-primary text-white">
        <div className="container-width">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-white mb-6">Ready to Protect Your Home?</h2>
            <p className="text-white/90 text-xl mb-8">
              Join thousands of homeowners who trust HomeGuardian to keep their homes in perfect condition.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="bg-white text-primary hover:bg-white/90 px-8 py-3 rounded-full font-medium text-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105">
                Get Started Now <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/pricing" className="bg-white/10 text-white hover:bg-white/20 px-8 py-3 rounded-full font-medium text-xl transition-all duration-300 flex items-center justify-center gap-2">
                View Pricing
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

export default LandingPage; 