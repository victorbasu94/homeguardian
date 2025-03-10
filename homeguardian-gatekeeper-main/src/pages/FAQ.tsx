import { useState } from 'react';
import { ChevronDown, ChevronUp, Search, ArrowRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  {
    question: "What is MaintainMint?",
    answer: "MaintainMint is an AI-driven platform that provides personalized home maintenance plans to help homeowners protect their investment. We analyze your home's specific needs based on factors like age, location, and materials to create custom maintenance schedules and reminders.",
    category: "General"
  },
  {
    question: "How does the AI technology work?",
    answer: "Our AI technology analyzes data about your home, including its age, size, location, building materials, and systems. It then cross-references this information with best practices, seasonal maintenance needs, and preventive care to create a tailored maintenance plan specifically for your property.",
    category: "Technology"
  },
  {
    question: "Is MaintainMint difficult to use?",
    answer: "Not at all! MaintainMint is designed to be user-friendly and intuitive. After a simple setup process where you answer questions about your home, the platform does all the heavy lifting. You'll receive easy-to-follow maintenance reminders and guides through our mobile app or email.",
    category: "Usage"
  },
  {
    question: "How much does MaintainMint cost?",
    answer: "MaintainMint offers several subscription tiers to fit different needs and budgets. Our Basic plan starts at $9.99/month, while our Premium plan with all features is $29.99/month. All plans come with a 14-day free trial, and we offer a 20% discount on annual subscriptions.",
    category: "Pricing"
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer: "Yes, you can cancel your MaintainMint subscription at any time with no cancellation fees. Your subscription will remain active until the end of your current billing period.",
    category: "Pricing"
  },
  {
    question: "How does MaintainMint save me money?",
    answer: "MaintainMint helps you avoid costly repairs by catching small issues before they become major problems. Regular maintenance extends the lifespan of your home systems and appliances, improves energy efficiency, and helps maintain or even increase your property value over time.",
    category: "General"
  },
  {
    question: "Do I need any special skills to follow the maintenance plans?",
    answer: "No special skills are required. Our maintenance tasks are designed for homeowners of all skill levels. Each task comes with clear, step-by-step instructions and video guides. For more complex tasks, we'll let you know when it's best to call a professional.",
    category: "Usage"
  },
  {
    question: "Can I use MaintainMint for multiple properties?",
    answer: "Yes! Our Pro and Premium plans allow you to manage multiple properties under one account. This is perfect for rental property owners, vacation homes, or helping family members maintain their homes.",
    category: "Usage"
  },
  {
    question: "Is my personal and home data secure?",
    answer: "Absolutely. We take data security very seriously. All your personal and home information is encrypted using industry-standard protocols. We never sell your data to third parties, and you can request to delete your data at any time.",
    category: "Technology"
  },
  {
    question: "What if I need help with my account or have questions?",
    answer: "Our customer support team is available via email for all users. Pro and Premium subscribers also get phone support, while Premium members have access to live chat assistance. You can also find extensive help resources in our knowledge base.",
    category: "Support"
  },
  {
    question: "Can I customize my maintenance schedule?",
    answer: "Yes, you can customize your maintenance schedule based on your preferences and availability. While our AI creates an optimal plan, you can adjust task frequencies, postpone items, or add custom tasks specific to your home's needs.",
    category: "Usage"
  },
  {
    question: "Does MaintainMint work with smart home devices?",
    answer: "Our Premium plan integrates with select smart home devices and systems to provide enhanced monitoring and maintenance recommendations. We currently support integration with Nest, Ecobee, Ring, and several other popular smart home platforms.",
    category: "Technology"
  }
];

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const toggleQuestion = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };
  
  const categories = ['All', ...Array.from(new Set(faqData.map(item => item.category)))];
  
  const filteredFAQs = faqData.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F5]">
      <Navbar />
      
      {/* Hero Section - Keep gradient background */}
      <section className="pt-32 pb-20 bg-gradient-to-r from-[#A3BFFA] to-[#D4C7A9] text-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Frequently Asked Questions
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90">
              Find answers to common questions about MaintainMint.
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-xl mx-auto">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-white/60" />
              </div>
              <input
                type="text"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* FAQ Content - Mercury Style */}
      <section className="py-20 -mt-12 pt-24">
        <div className="container mx-auto px-4 md:px-6">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 justify-center mb-12">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-[#A3BFFA] text-white'
                    : 'bg-white text-[#1A2526] border border-[#4A4A4A]/10 hover:bg-[#A3BFFA]/10'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          
          {/* FAQ Accordion - Mercury Style */}
          <div className="max-w-3xl mx-auto space-y-4">
            {filteredFAQs.length > 0 ? (
              filteredFAQs.map((faq, index) => (
                <div 
                  key={index} 
                  className="border border-[#4A4A4A]/10 rounded-lg overflow-hidden bg-white shadow-sm"
                >
                  <button
                    onClick={() => toggleQuestion(index)}
                    className="flex justify-between items-center w-full p-6 text-left"
                    aria-expanded={activeIndex === index}
                  >
                    <h3 className="text-lg font-medium pr-8 text-[#1A2526]">{faq.question}</h3>
                    <div className="flex-shrink-0">
                      {activeIndex === index ? (
                        <ChevronUp className="h-5 w-5 text-[#A3BFFA]" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-[#4A4A4A]" />
                      )}
                    </div>
                  </button>
                  
                  <div 
                    className={`overflow-hidden transition-all duration-300 ${
                      activeIndex === index ? 'max-h-96' : 'max-h-0'
                    }`}
                  >
                    <div className="p-6 pt-0 border-t border-[#4A4A4A]/10 text-[#4A4A4A]">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded-lg border border-[#4A4A4A]/10 p-8">
                <p className="text-[#1A2526] text-lg">No results found. Try adjusting your search.</p>
                <button 
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                  }}
                  className="mt-4 text-[#A3BFFA] font-medium hover:underline"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* Topic Categories - Mercury Style */}
      <section className="py-20 bg-white border-y border-[#4A4A4A]/10">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold mb-4 text-[#1A2526]">Browse by Topic</h2>
            <p className="text-[#4A4A4A] max-w-2xl mx-auto">
              Find answers organized by category
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                title: "Getting Started",
                description: "New to MaintainMint? Learn how to set up your account and create your first maintenance plan.",
                link: "/how-it-works"
              },
              {
                title: "Pricing & Plans",
                description: "Explore our different subscription options to find the perfect fit for your home.",
                link: "/pricing"
              },
              {
                title: "Using the Platform",
                description: "Learn how to get the most out of MaintainMint's features and tools.",
                link: "/how-it-works"
              }
            ].map((topic, i) => (
              <div key={i} className="bg-white p-6 rounded-lg border border-[#4A4A4A]/10 shadow-sm">
                <h3 className="text-xl font-semibold mb-2 text-[#1A2526]">{topic.title}</h3>
                <p className="text-[#4A4A4A] mb-4">{topic.description}</p>
                <Link to={topic.link} className="text-[#A3BFFA] text-sm font-medium inline-flex items-center hover:underline">
                  Learn more
                  <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section - Mercury Style */}
      <section className="py-20 bg-[#A3BFFA]">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl font-semibold text-white mb-6">Still have questions?</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Our support team is here to help you with any questions you might have about MaintainMint.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto">
            <Link 
              to="/contact" 
              className="bg-white text-[#A3BFFA] px-6 py-3 rounded-lg text-base font-medium hover:bg-white/90 transition-all duration-300"
            >
              Contact Support
            </Link>
            <Link 
              to="/demo" 
              className="border border-white text-white px-6 py-3 rounded-lg text-base font-medium hover:bg-white/10 transition-all duration-300"
            >
              Request a Demo
            </Link>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default FAQ;
