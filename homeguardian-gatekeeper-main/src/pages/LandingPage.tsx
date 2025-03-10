import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, CheckCircle, ArrowRight, Star, Clock, Calendar, Wrench, Zap, ChevronRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-24 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-semibold text-white leading-tight mb-6">
              Powerful home maintenance.
              <br />
              Simplified finances.
            </h1>
            <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
              Apply in 10 minutes for AI-driven home maintenance that transforms how you operate.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto">
              <Input 
                type="email" 
                placeholder="Enter your email" 
                className="h-12 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white"
              />
              <Button 
                size="lg" 
                className="h-12 bg-white text-primary hover:bg-white/90 font-medium"
              >
                Open Account
              </Button>
            </div>
            
            <div className="mt-4 text-white/60 text-sm">
              Or <Link to="/contact" className="text-white underline">contact sales</Link> for more information
            </div>
          </div>
        </div>
        
        {/* Dashboard Preview */}
        <div className="max-w-6xl mx-auto mt-16 px-4">
          <div className="bg-white rounded-lg shadow-xl overflow-hidden">
            <img 
              src="/dashboard-preview.png" 
              alt="HomeGuardian Dashboard" 
              className="w-full h-auto"
              onError={(e) => {
                e.currentTarget.style.height = '300px';
                e.currentTarget.style.background = '#f5f5f5';
                e.currentTarget.style.display = 'flex';
                e.currentTarget.style.alignItems = 'center';
                e.currentTarget.style.justifyContent = 'center';
                e.currentTarget.alt = 'Dashboard Preview';
              }}
            />
          </div>
          <div className="text-center text-white/80 text-sm mt-4">
            HomeGuardian is a home maintenance technology company, not a bank. Services provided by trusted partners.
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold mb-4">Why choose HomeGuardian?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our platform provides everything you need to maintain your home efficiently
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Shield className="h-6 w-6 text-primary" />,
                title: 'Preventative Maintenance',
                description: 'Proactively identify and address maintenance issues before they become costly problems.'
              },
              {
                icon: <Zap className="h-6 w-6 text-primary" />,
                title: 'AI-Powered Recommendations',
                description: 'Get personalized maintenance schedules based on your home needs and conditions.'
              },
              {
                icon: <Calendar className="h-6 w-6 text-primary" />,
                title: 'Smart Scheduling',
                description: 'Organize and track all your home maintenance tasks in one convenient dashboard.'
              }
            ].map((feature, i) => (
              <div key={i} className="bg-white p-6 rounded-lg border border-border/40">
                <div className="bg-primary/10 p-2 rounded-md w-fit mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-medium mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="py-20 bg-white border-y border-border/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-semibold mb-12 text-center">How HomeGuardian Works</h2>
            
            <div className="space-y-12">
              {[
                {
                  number: '01',
                  title: 'Quick Setup',
                  description: 'Answer a few questions about your home and we\'ll create your custom maintenance plan in minutes.'
                },
                {
                  number: '02',
                  title: 'Smart Scheduling',
                  description: 'Get timely reminders for seasonal maintenance tasks tailored to your specific home systems.'
                },
                {
                  number: '03',
                  title: 'Easy Maintenance',
                  description: 'Follow our step-by-step guides or connect with trusted professionals in your area.'
                }
              ].map((step, i) => (
                <div key={i} className="flex gap-6">
                  <div className="text-2xl font-semibold text-primary/70">{step.number}</div>
                  <div>
                    <h3 className="text-xl font-medium mb-2">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-12 text-center">
              <Link to="/how-it-works">
                <Button variant="outline" className="gap-2">
                  Learn more about how it works
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold mb-4">What our customers say</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Join thousands of homeowners who trust HomeGuardian
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "HomeGuardian has saved me thousands in potential repairs by catching issues early.",
                author: "Sarah J.",
                role: "Homeowner since 2022"
              },
              {
                quote: "The AI recommendations are spot-on. It's like having a home expert on call 24/7.",
                author: "Michael T.",
                role: "Homeowner since 2021"
              },
              {
                quote: "I love how easy it is to keep track of all my maintenance tasks in one place.",
                author: "Emily R.",
                role: "Homeowner since 2023"
              }
            ].map((testimonial, i) => (
              <div key={i} className="bg-white p-6 rounded-lg border border-border/40">
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="mb-4 text-foreground">"{testimonial.quote}"</p>
                <div>
                  <div className="font-medium">{testimonial.author}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-semibold text-white mb-6">Ready to protect your home?</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of homeowners who trust HomeGuardian for their home maintenance needs.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto">
            <Button 
              size="lg" 
              className="bg-white text-primary hover:bg-white/90 font-medium"
            >
              Get Started Now
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-white text-white hover:bg-white/10"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default LandingPage; 