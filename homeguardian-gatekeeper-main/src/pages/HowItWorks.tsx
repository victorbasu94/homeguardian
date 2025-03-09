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
  ChevronDown 
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';

const HowItWorks: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden bg-blue-500/90 text-white noise-texture">
        <div className="container-width relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-white mb-6 animate-fade-in">
              How HomeGuardian Works
            </h1>
            <p className="text-white/90 text-xl mb-8 max-w-2xl mx-auto animate-slide-in">
              Our simple process helps you protect your biggest investment with personalized maintenance plans and timely reminders.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-scale-in">
              <Link to="/register" className="bg-white text-blue-500 hover:bg-white/90 px-8 py-3 rounded-full font-medium text-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105">
                Get Started Now <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/pricing" className="bg-white/10 text-white hover:bg-white/20 px-8 py-3 rounded-full font-medium text-xl transition-all duration-300 flex items-center justify-center gap-2 transform hover:scale-105">
                View Pricing
              </Link>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-20 right-10 w-64 h-64 rounded-full bg-white/10 blur-3xl animate-pulse-soft"></div>
        <div className="absolute bottom-10 left-10 w-80 h-80 rounded-full bg-white/5 blur-3xl animate-pulse-soft"></div>
      </section>
      
      {/* Process Overview */}
      <section className="section-padding bg-white">
        <div className="container-width">
          <div className="text-center mb-16">
            <h2 className="mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-amber-400">The HomeGuardian Process</h2>
            <p className="text-neutral/80 max-w-2xl mx-auto text-lg">
              From setup to maintenance, we've designed a seamless experience to keep your home in perfect condition
            </p>
          </div>
          
          <div className="relative">
            {/* Timeline connector */}
            <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-blue-500/20 -translate-x-1/2 hidden md:block"></div>
            
            <div className="space-y-16 md:space-y-24 relative">
              {/* Step 1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">
                <div className="order-2 md:order-1">
                  <div className="bg-blue-500 text-white text-sm font-bold px-3 py-1 rounded-full inline-block mb-4">STEP 1</div>
                  <h3 className="text-2xl font-bold mb-4 text-neutral">Create Your Home Profile</h3>
                  <p className="text-neutral/80 mb-6">
                    Answer a few simple questions about your home's age, size, systems, and location. Our AI uses this information to understand your home's specific needs.
                  </p>
                  <ul className="space-y-3">
                    {[
                      'Basic home information (age, square footage)',
                      'Key systems (HVAC, plumbing, electrical)',
                      'Location details for climate-specific maintenance',
                      'Recent renovations or upgrades'
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-blue-500 mt-1 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="order-1 md:order-2 relative">
                  <div className="bg-white rounded-2xl shadow-card hover:shadow-card-hover p-6 relative z-10 transition-all duration-300 transform hover:translate-y-[-5px]">
                    <div className="bg-white rounded-xl overflow-hidden shadow-sm">
                      <div className="bg-gradient-to-r from-blue-500 to-blue-400 p-4 text-white">
                        <h4 className="font-bold">Home Profile Setup</h4>
                      </div>
                      <div className="p-6 space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-neutral/70 mb-1">Home Type</label>
                          <div className="bg-softWhite p-3 rounded-lg text-neutral">Single Family Home</div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-neutral/70 mb-1">Year Built</label>
                          <div className="bg-softWhite p-3 rounded-lg text-neutral">2005</div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-neutral/70 mb-1">Square Footage</label>
                          <div className="bg-softWhite p-3 rounded-lg text-neutral">2,450 sq ft</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Timeline node */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-xl z-20 hidden md:flex animate-pulse">1</div>
                  
                  {/* Decorative elements */}
                  <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-amber-400/30 rounded-2xl rotate-12 z-0"></div>
                </div>
              </div>
              
              {/* Step 2 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">
                <div className="order-2 relative">
                  <div className="bg-white rounded-2xl shadow-card hover:shadow-card-hover p-6 relative z-10 transition-all duration-300 transform hover:translate-y-[-5px]">
                    <div className="bg-white rounded-xl overflow-hidden shadow-sm">
                      <div className="bg-gradient-to-r from-blue-500 to-blue-400 p-4 text-white">
                        <h4 className="font-bold">Your Maintenance Plan</h4>
                      </div>
                      <div className="p-6 space-y-4">
                        <div className="flex items-center gap-3 p-3 bg-softWhite rounded-lg">
                          <Calendar className="h-5 w-5 text-blue-500" />
                          <div>
                            <div className="font-medium">HVAC Filter Replacement</div>
                            <div className="text-sm text-neutral/70">Every 3 months</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-softWhite rounded-lg">
                          <Calendar className="h-5 w-5 text-blue-500" />
                          <div>
                            <div className="font-medium">Gutter Cleaning</div>
                            <div className="text-sm text-neutral/70">Spring & Fall</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-softWhite rounded-lg">
                          <Calendar className="h-5 w-5 text-blue-500" />
                          <div>
                            <div className="font-medium">Water Heater Flush</div>
                            <div className="text-sm text-neutral/70">Annually</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Timeline node */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-xl z-20 hidden md:flex animate-pulse">2</div>
                  
                  {/* Decorative elements */}
                  <div className="absolute -top-4 -left-4 w-24 h-24 bg-amber-400/30 rounded-2xl -rotate-12 z-0"></div>
                </div>
                <div className="order-1">
                  <div className="bg-blue-500 text-white text-sm font-bold px-3 py-1 rounded-full inline-block mb-4">STEP 2</div>
                  <h3 className="text-2xl font-bold mb-4 text-neutral">Get Your Personalized Maintenance Plan</h3>
                  <p className="text-neutral/80 mb-6">
                    Our AI analyzes your home data and creates a customized maintenance schedule based on industry best practices, manufacturer recommendations, and local climate factors.
                  </p>
                  <ul className="space-y-3">
                    {[
                      'Seasonal maintenance tasks prioritized by importance',
                      'Customized schedule based on your home\'s specific systems',
                      'Recommendations for preventative maintenance',
                      'Estimated time and cost for each task'
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-blue-500 mt-1 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              {/* Step 3 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">
                <div className="order-2 md:order-1">
                  <div className="bg-blue-500 text-white text-sm font-bold px-3 py-1 rounded-full inline-block mb-4">STEP 3</div>
                  <h3 className="text-2xl font-bold mb-4 text-neutral">Receive Timely Reminders</h3>
                  <p className="text-neutral/80 mb-6">
                    Never forget important maintenance again. We'll send you notifications when it's time to perform tasks, with enough advance notice to plan accordingly.
                  </p>
                  <ul className="space-y-3">
                    {[
                      'Email and mobile notifications for upcoming tasks',
                      'Seasonal maintenance checklists',
                      'Weather-based alerts for urgent tasks',
                      'Flexible scheduling options'
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-blue-500 mt-1 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="order-1 md:order-2 relative">
                  <div className="bg-white rounded-2xl shadow-card hover:shadow-card-hover p-6 relative z-10 transition-all duration-300 transform hover:translate-y-[-5px]">
                    <div className="bg-white rounded-xl overflow-hidden shadow-sm">
                      <div className="bg-gradient-to-r from-blue-500 to-blue-400 p-4 text-white">
                        <h4 className="font-bold">Maintenance Reminders</h4>
                      </div>
                      <div className="p-6 space-y-4">
                        <div className="flex items-center gap-3 p-3 bg-[#D4C7A9]/10 rounded-lg border border-[#D4C7A9]/20">
                          <Bell className="h-5 w-5 text-[#D4C7A9]" />
                          <div>
                            <div className="font-medium">Upcoming: HVAC Service</div>
                            <div className="text-sm text-neutral/70">Due in 5 days</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-[#D4C7A9]/5 rounded-lg">
                          <Bell className="h-5 w-5 text-neutral/50" />
                          <div>
                            <div className="font-medium">Smoke Detector Test</div>
                            <div className="text-sm text-neutral/70">Due in 2 weeks</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-[#D4C7A9]/5 rounded-lg">
                          <Bell className="h-5 w-5 text-neutral/50" />
                          <div>
                            <div className="font-medium">Gutter Cleaning</div>
                            <div className="text-sm text-neutral/70">Due in 3 weeks</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Timeline node */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-xl z-20 hidden md:flex animate-pulse">3</div>
                  
                  {/* Decorative elements */}
                  <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-blue-500/20 rounded-2xl rotate-12 z-0"></div>
                </div>
              </div>
              
              {/* Step 4 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">
                <div className="order-2 relative">
                  <div className="bg-white rounded-2xl shadow-card hover:shadow-card-hover p-6 relative z-10 transition-all duration-300 transform hover:translate-y-[-5px]">
                    <div className="bg-white rounded-xl overflow-hidden shadow-sm">
                      <div className="bg-gradient-to-r from-blue-500 to-blue-400 p-4 text-white">
                        <h4 className="font-bold">Task Completion</h4>
                      </div>
                      <div className="p-6 space-y-4">
                        <div className="flex items-center gap-3 p-3 bg-[#2E7D32]/10 rounded-lg border border-[#2E7D32]/20">
                          <CheckCircle className="h-5 w-5 text-[#2E7D32]" />
                          <div>
                            <div className="font-medium">HVAC Filter Replacement</div>
                            <div className="text-sm text-neutral/70">Completed on May 15</div>
                          </div>
                        </div>
                        <div className="p-3 bg-[#D4C7A9]/5 rounded-lg space-y-3">
                          <div className="font-medium">Task Notes:</div>
                          <div className="text-sm text-neutral/80">
                            Replaced with MERV 11 filter. System running efficiently. Next replacement scheduled for August.
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-16 bg-[#D4C7A9]/20 rounded-md"></div>
                            <div className="w-16 h-16 bg-[#D4C7A9]/20 rounded-md"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Timeline node */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-xl z-20 hidden md:flex animate-pulse">4</div>
                  
                  {/* Decorative elements */}
                  <div className="absolute -top-4 -right-4 w-24 h-24 bg-amber-400/30 rounded-2xl -rotate-12 z-0"></div>
                </div>
                <div className="order-1">
                  <div className="bg-blue-500 text-white text-sm font-bold px-3 py-1 rounded-full inline-block mb-4">STEP 4</div>
                  <h3 className="text-2xl font-bold mb-4 text-neutral">Complete and Track Maintenance</h3>
                  <p className="text-neutral/80 mb-6">
                    Follow our step-by-step guides to complete tasks yourself, or find trusted professionals through our network. Track your maintenance history and home's condition over time.
                  </p>
                  <ul className="space-y-3">
                    {[
                      'Detailed DIY instructions with photos and videos',
                      'Option to hire pre-screened local professionals',
                      'Maintenance history and documentation',
                      'Track cost savings from preventative maintenance'
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-blue-500 mt-1 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Benefits Section */}
      <section className="section-padding bg-softWhite">
        <div className="container-width">
          <div className="text-center mb-16">
            <h2 className="mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-amber-400">The HomeGuardian Advantage</h2>
            <p className="text-neutral/80 max-w-2xl mx-auto text-lg">
              Our comprehensive approach to home maintenance offers unique benefits
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Shield className="h-10 w-10 text-blue-500" />,
                title: 'Preventative Protection',
                description: 'Identify and address small issues before they become expensive emergencies.'
              },
              {
                icon: <Smartphone className="h-10 w-10 text-blue-500" />,
                title: 'Smart Technology',
                description: 'AI-powered recommendations and digital tracking keep maintenance simple.'
              },
              {
                icon: <Home className="h-10 w-10 text-blue-500" />,
                title: 'Home Value Preservation',
                description: 'Regular maintenance helps maintain and even increase your home\'s market value.'
              },
              {
                icon: <Clock className="h-10 w-10 text-blue-500" />,
                title: 'Time Savings',
                description: 'Our organized approach eliminates guesswork and helps you maintain your home efficiently.'
              },
              {
                icon: <Calendar className="h-10 w-10 text-blue-500" />,
                title: 'Seasonal Optimization',
                description: 'Tasks are scheduled at the optimal time of year based on your local climate.'
              },
              {
                icon: <Clipboard className="h-10 w-10 text-blue-500" />,
                title: 'Maintenance Records',
                description: 'Build a comprehensive maintenance history to share when selling your home.'
              }
            ].map((benefit, i) => (
              <div key={i} className="bg-white p-8 rounded-xl border border-gray-100 shadow-card hover:shadow-card-hover transition-all duration-300 hover:translate-y-[-5px]">
                <div className="bg-blue-500/10 p-4 rounded-full inline-block mb-6">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-neutral">{benefit.title}</h3>
                <p className="text-neutral/80">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* FAQ Section */}
      <section className="section-padding bg-white">
        <div className="container-width">
          <div className="text-center mb-16">
            <h2 className="mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-amber-400">Common Questions</h2>
            <p className="text-neutral/80 max-w-2xl mx-auto text-lg">
              Find answers to frequently asked questions about our process
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto space-y-6">
            {[
              {
                question: "How long does it take to set up my maintenance plan?",
                answer: "The initial setup takes just 5-10 minutes to input your home details. Our AI then generates your personalized maintenance plan instantly. You can always add more details about your home later to further customize your plan."
              },
              {
                question: "Can I customize which tasks are included in my plan?",
                answer: "Absolutely! While we provide an AI-generated schedule based on best practices, you can easily adjust task frequencies, add custom tasks, or skip recommendations that don't apply to your situation."
              },
              {
                question: "Do I need technical knowledge to complete the maintenance tasks?",
                answer: "Not at all! We provide detailed step-by-step guides with photos and videos for DIY tasks, rated by difficulty level. For more complex tasks, we can connect you with pre-screened professionals in your area."
              },
              {
                question: "How does HomeGuardian save me money?",
                answer: "Regular maintenance prevents costly emergency repairs and extends the life of your home systems. For example, regular HVAC maintenance can prevent a $5,000+ replacement, and routine gutter cleaning can prevent water damage that could cost tens of thousands to repair."
              },
              {
                question: "Can I add multiple homes to my account?",
                answer: "Yes! Our Premium plan allows you to manage multiple properties under a single account, making it perfect for vacation homes, rental properties, or helping family members maintain their homes."
              }
            ].map((faq, i) => (
              <div key={i} className="bg-white p-6 rounded-xl border border-gray-100 shadow-card hover:shadow-card-hover transition-all duration-300">
                <button className="flex justify-between items-center w-full text-left">
                  <h3 className="text-lg font-bold text-neutral">{faq.question}</h3>
                  <ChevronDown className="h-5 w-5 text-blue-500 flex-shrink-0" />
                </button>
                <div className="mt-4 text-neutral/80">
                  <p>{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default HowItWorks;
