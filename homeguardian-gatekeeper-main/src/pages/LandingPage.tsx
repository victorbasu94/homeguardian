import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, CheckCircle, ArrowRight, Star, Clock, Calendar, Wrench, Zap, ChevronRight, CreditCard } from 'lucide-react';
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
      
      {/* Features Section - Mercury Style */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold mb-4">Let maintenance power your home operations</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Your home maintenance should do more than just fix problems. Now, it can.
            </p>
          </div>
          
          {/* Two-column feature cards layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Feature Card 1 */}
            <div className="bg-white rounded-lg border border-border/20 shadow-sm overflow-hidden">
              <div className="p-8 pb-0">
                <div className="bg-background rounded-lg p-6 mb-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 bg-primary/10 p-1.5 rounded-md">
                        <Calendar className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">HVAC Filter Replacement</h4>
                        <p className="text-xs text-muted-foreground">Due in 3 days - June 15, 2024</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="mt-1 bg-primary/10 p-1.5 rounded-md">
                        <Wrench className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">Gutter Cleaning</h4>
                        <p className="text-xs text-muted-foreground">Due in 2 weeks - June 30, 2024</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="mt-1 bg-primary/10 p-1.5 rounded-md">
                        <Shield className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">Smoke Detector Test</h4>
                        <p className="text-xs text-muted-foreground">Due in 3 weeks - July 7, 2024</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-border/20">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Repeat this reminder</span>
                      <div className="h-5 w-10 bg-primary/20 rounded-full relative">
                        <div className="absolute top-0.5 left-0.5 h-4 w-4 bg-primary rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-8 pt-0">
                <h3 className="text-2xl font-semibold mb-4">Send and receive maintenance alerts seamlessly</h3>
                <p className="text-muted-foreground mb-6">Set auto-reminder rules and get notified before issues become expensive repairs.</p>
                <Link to="/how-it-works">
                  <Button variant="outline" className="gap-2">
                    Preventative Maintenance
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Feature Card 2 */}
            <div className="bg-white rounded-lg border border-border/20 shadow-sm overflow-hidden">
              <div className="p-8 pb-0">
                <div className="bg-background rounded-lg p-6 mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-primary/10 p-1.5 rounded-md">
                      <CreditCard className="h-4 w-4 text-primary" />
                    </div>
                    <h4 className="text-sm font-medium">Maintenance Budget</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Annual Budget</span>
                      <span className="text-sm font-medium">$2,400</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Spent Year-to-Date</span>
                      <span className="text-sm font-medium">$950</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Remaining</span>
                      <span className="text-sm font-medium text-green-600">$1,450</span>
                    </div>
                    <div className="h-2 bg-background border border-border/20 rounded-full overflow-hidden mt-2">
                      <div className="h-full bg-primary rounded-full" style={{ width: '40%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-8 pt-0">
                <h3 className="text-2xl font-semibold mb-4">Unlock maintenance insights with industry-low costs</h3>
                <p className="text-muted-foreground mb-6">Save up to 30% on home repairs by catching issues early with our preventative maintenance system.</p>
                <Link to="/pricing">
                  <Button variant="outline" className="gap-2">
                    Explore Savings
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          
          {/* Additional Feature Section */}
          <div className="mt-16 text-center">
            <h2 className="text-3xl font-semibold mb-16">All your maintenance workflows. Zero complexity.</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  title: "Handle all your tasks with precision",
                  description: "Hold your money for longer by eliminating third-party processing",
                  link: "Explore Task Management",
                  icon: <CheckCircle className="h-5 w-5 text-primary" />
                },
                {
                  title: "Seamless scheduling for you and your contractors",
                  description: "Generate professional service requests in minutes",
                  link: "Explore Scheduling",
                  icon: <Calendar className="h-5 w-5 text-primary" />
                },
                {
                  title: "Control spend effortlessly at any size",
                  description: "Set maintenance budgets and track expenses automatically",
                  link: "Manage Expenses",
                  icon: <CreditCard className="h-5 w-5 text-primary" />
                },
                {
                  title: "Close the books quickly and accurately",
                  description: "Sync maintenance records to your preferred accounting software",
                  link: "Explore Integrations",
                  icon: <Zap className="h-5 w-5 text-primary" />
                }
              ].map((feature, i) => (
                <div key={i} className="text-left">
                  <div className="mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-medium mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{feature.description}</p>
                  <Link to="/how-it-works" className="text-primary text-sm font-medium flex items-center gap-1 hover:underline">
                    {feature.link}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              ))}
            </div>
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