import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  CheckCircle, 
  Clipboard, 
  Bell, 
  Calendar, 
  Wrench, 
  Shield, 
  Clock, 
  Smartphone, 
  Home,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';

const HowItWorks: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F5]">
      <Navbar />
      
      {/* Hero Section - Keep gradient background */}
      <section className="pt-32 pb-20 bg-gradient-to-r from-[#A3BFFA] to-[#D4C7A9] text-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              How HomeGuardian Works
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90">
              Our simple process helps you protect your biggest investment with personalized maintenance plans and timely reminders.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="bg-white text-[#A3BFFA] hover:bg-white/90 px-8 py-3 rounded-lg font-medium text-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-md">
                Get Started Now <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/pricing" className="bg-white/10 text-white hover:bg-white/20 px-8 py-3 rounded-lg font-medium text-lg transition-all duration-300 flex items-center justify-center gap-2">
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Process Overview - Mercury Style */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold mb-4 text-[#1A2526]">The HomeGuardian Process</h2>
            <p className="text-[#4A4A4A] max-w-2xl mx-auto text-lg">
              From setup to maintenance, we've designed a seamless experience to keep your home in perfect condition
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            {/* Step 1 */}
            <div className="mb-16 border border-[#4A4A4A]/10 rounded-lg overflow-hidden bg-white shadow-sm">
              <div className="p-8">
                <div className="flex items-start gap-6">
                  <div className="h-10 w-10 rounded-full bg-[#A3BFFA]/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-[#A3BFFA] font-semibold">01</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold mb-4 text-[#1A2526]">Create Your Home Profile</h3>
                    <p className="text-[#4A4A4A] mb-6">
                      Answer a few simple questions about your home's age, size, systems, and location. Our AI uses this information to understand your home's specific needs.
                    </p>
                    <ul className="space-y-3 mb-6">
                      {[
                        'Basic home information (age, square footage)',
                        'Key systems (HVAC, plumbing, electrical)',
                        'Location details for climate-specific maintenance',
                        'Recent renovations or upgrades'
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-[#A3BFFA] mt-0.5 flex-shrink-0" />
                          <span className="text-[#1A2526]">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              <div className="border-t border-[#4A4A4A]/10 bg-[#F5F5F5] p-6">
                <div className="bg-white rounded-lg border border-[#4A4A4A]/10 p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <Home className="h-5 w-5 text-[#A3BFFA]" />
                    <h4 className="font-medium text-[#1A2526]">Home Profile Setup</h4>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-[#4A4A4A] mb-1">Home Type</label>
                      <div className="bg-[#F5F5F5] p-2 rounded text-[#1A2526] text-sm">Single Family Home</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#4A4A4A] mb-1">Year Built</label>
                      <div className="bg-[#F5F5F5] p-2 rounded text-[#1A2526] text-sm">2005</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#4A4A4A] mb-1">Square Footage</label>
                      <div className="bg-[#F5F5F5] p-2 rounded text-[#1A2526] text-sm">2,450 sq ft</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Step 2 */}
            <div className="mb-16 border border-[#4A4A4A]/10 rounded-lg overflow-hidden bg-white shadow-sm">
              <div className="p-8">
                <div className="flex items-start gap-6">
                  <div className="h-10 w-10 rounded-full bg-[#A3BFFA]/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-[#A3BFFA] font-semibold">02</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold mb-4 text-[#1A2526]">Get Your Personalized Maintenance Plan</h3>
                    <p className="text-[#4A4A4A] mb-6">
                      Our AI analyzes your home data and creates a customized maintenance schedule based on industry best practices, manufacturer recommendations, and local climate factors.
                    </p>
                    <ul className="space-y-3 mb-6">
                      {[
                        'Seasonal maintenance tasks prioritized by importance',
                        'Customized schedule based on your home\'s specific systems',
                        'Recommendations for preventative maintenance',
                        'Estimated time and cost for each task'
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-[#A3BFFA] mt-0.5 flex-shrink-0" />
                          <span className="text-[#1A2526]">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              <div className="border-t border-[#4A4A4A]/10 bg-[#F5F5F5] p-6">
                <div className="bg-white rounded-lg border border-[#4A4A4A]/10 p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <Calendar className="h-5 w-5 text-[#A3BFFA]" />
                    <h4 className="font-medium text-[#1A2526]">Your Maintenance Plan</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-2 bg-[#F5F5F5] rounded">
                      <Calendar className="h-4 w-4 text-[#A3BFFA]" />
                      <div>
                        <div className="font-medium text-sm text-[#1A2526]">HVAC Filter Replacement</div>
                        <div className="text-xs text-[#4A4A4A]">Every 3 months</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2 bg-[#F5F5F5] rounded">
                      <Calendar className="h-4 w-4 text-[#A3BFFA]" />
                      <div>
                        <div className="font-medium text-sm text-[#1A2526]">Gutter Cleaning</div>
                        <div className="text-xs text-[#4A4A4A]">Spring & Fall</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2 bg-[#F5F5F5] rounded">
                      <Calendar className="h-4 w-4 text-[#A3BFFA]" />
                      <div>
                        <div className="font-medium text-sm text-[#1A2526]">Water Heater Flush</div>
                        <div className="text-xs text-[#4A4A4A]">Annually</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Step 3 */}
            <div className="mb-16 border border-[#4A4A4A]/10 rounded-lg overflow-hidden bg-white shadow-sm">
              <div className="p-8">
                <div className="flex items-start gap-6">
                  <div className="h-10 w-10 rounded-full bg-[#A3BFFA]/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-[#A3BFFA] font-semibold">03</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold mb-4 text-[#1A2526]">Receive Timely Reminders</h3>
                    <p className="text-[#4A4A4A] mb-6">
                      Never forget important maintenance again. We'll send you notifications when it's time to perform tasks, with enough advance notice to plan accordingly.
                    </p>
                    <ul className="space-y-3 mb-6">
                      {[
                        'Email and mobile notifications for upcoming tasks',
                        'Seasonal maintenance checklists',
                        'Weather-based alerts for urgent tasks',
                        'Flexible scheduling options'
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-[#A3BFFA] mt-0.5 flex-shrink-0" />
                          <span className="text-[#1A2526]">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              <div className="border-t border-[#4A4A4A]/10 bg-[#F5F5F5] p-6">
                <div className="bg-white rounded-lg border border-[#4A4A4A]/10 p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <Bell className="h-5 w-5 text-[#A3BFFA]" />
                    <h4 className="font-medium text-[#1A2526]">Maintenance Reminders</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-2 bg-[#A3BFFA]/10 rounded border border-[#A3BFFA]/20">
                      <Bell className="h-4 w-4 text-[#A3BFFA]" />
                      <div>
                        <div className="font-medium text-sm text-[#1A2526]">Upcoming: HVAC Service</div>
                        <div className="text-xs text-[#4A4A4A]">Due in 5 days</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2 bg-[#F5F5F5] rounded">
                      <Bell className="h-4 w-4 text-[#4A4A4A]" />
                      <div>
                        <div className="font-medium text-sm text-[#1A2526]">Smoke Detector Test</div>
                        <div className="text-xs text-[#4A4A4A]">Due in 2 weeks</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2 bg-[#F5F5F5] rounded">
                      <Bell className="h-4 w-4 text-[#4A4A4A]" />
                      <div>
                        <div className="font-medium text-sm text-[#1A2526]">Gutter Cleaning</div>
                        <div className="text-xs text-[#4A4A4A]">Due in 3 weeks</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Step 4 */}
            <div className="border border-[#4A4A4A]/10 rounded-lg overflow-hidden bg-white shadow-sm">
              <div className="p-8">
                <div className="flex items-start gap-6">
                  <div className="h-10 w-10 rounded-full bg-[#A3BFFA]/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-[#A3BFFA] font-semibold">04</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold mb-4 text-[#1A2526]">Complete Tasks & Track Progress</h3>
                    <p className="text-[#4A4A4A] mb-6">
                      Mark tasks as complete, track your maintenance history, and build a comprehensive record of your home's care. DIY or hire a pro—it's your choice.
                    </p>
                    <ul className="space-y-3 mb-6">
                      {[
                        'Step-by-step DIY guides for common tasks',
                        'Connections to trusted local professionals',
                        'Maintenance history tracking',
                        'Cost and savings tracking'
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-[#A3BFFA] mt-0.5 flex-shrink-0" />
                          <span className="text-[#1A2526]">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              <div className="border-t border-[#4A4A4A]/10 bg-[#F5F5F5] p-6">
                <div className="bg-white rounded-lg border border-[#4A4A4A]/10 p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <Clipboard className="h-5 w-5 text-[#A3BFFA]" />
                    <h4 className="font-medium text-[#1A2526]">Task Completion</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-2 bg-green-50 rounded border border-green-100">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <div>
                        <div className="font-medium text-sm text-[#1A2526]">HVAC Filter Replacement</div>
                        <div className="text-xs text-[#4A4A4A]">Completed on June 1, 2024</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2 bg-green-50 rounded border border-green-100">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <div>
                        <div className="font-medium text-sm text-[#1A2526]">Smoke Detector Test</div>
                        <div className="text-xs text-[#4A4A4A]">Completed on May 15, 2024</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2 bg-[#F5F5F5] rounded">
                      <Clock className="h-4 w-4 text-[#4A4A4A]" />
                      <div>
                        <div className="font-medium text-sm text-[#1A2526]">Gutter Cleaning</div>
                        <div className="text-xs text-[#4A4A4A]">Scheduled for July 10, 2024</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Benefits Section - Mercury Style */}
      <section className="py-20 bg-[#F5F5F5]">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold mb-4 text-[#1A2526]">Why Choose HomeGuardian?</h2>
            <p className="text-[#4A4A4A] max-w-2xl mx-auto">
              Our platform is designed to make home maintenance simple, effective, and stress-free
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: <Shield className="h-6 w-6 text-[#A3BFFA]" />,
                title: "Protect Your Investment",
                description: "Regular maintenance prevents costly repairs and preserves your home's value over time."
              },
              {
                icon: <Clock className="h-6 w-6 text-[#A3BFFA]" />,
                title: "Save Time and Effort",
                description: "No more guesswork or forgotten maintenance. We handle the planning so you don't have to."
              },
              {
                icon: <Smartphone className="h-6 w-6 text-[#A3BFFA]" />,
                title: "Easy to Use",
                description: "Simple interface, helpful reminders, and clear instructions make maintenance manageable."
              }
            ].map((benefit, i) => (
              <div key={i} className="bg-white p-6 rounded-lg border border-[#4A4A4A]/10 shadow-sm">
                <div className="bg-[#A3BFFA]/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-[#1A2526]">{benefit.title}</h3>
                <p className="text-[#4A4A4A]">{benefit.description}</p>
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
            Join thousands of homeowners who trust HomeGuardian to protect their biggest investment.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto">
            <Link 
              to="/register" 
              className="bg-white text-[#A3BFFA] px-6 py-3 rounded-lg text-base font-medium hover:bg-white/90 transition-all duration-300"
            >
              Get Started Now
            </Link>
            <Link 
              to="/pricing" 
              className="border border-white text-white px-6 py-3 rounded-lg text-base font-medium hover:bg-white/10 transition-all duration-300"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default HowItWorks;
