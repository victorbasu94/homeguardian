import { useState } from 'react';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  {
    question: "What is HomeGuardian?",
    answer: "HomeGuardian is an AI-driven platform that provides personalized home maintenance plans to help homeowners protect their investment. We analyze your home's specific needs based on factors like age, location, and materials to create custom maintenance schedules and reminders.",
    category: "General"
  },
  {
    question: "How does the AI technology work?",
    answer: "Our AI technology analyzes data about your home, including its age, size, location, building materials, and systems. It then cross-references this information with best practices, seasonal maintenance needs, and preventive care to create a tailored maintenance plan specifically for your property.",
    category: "Technology"
  },
  {
    question: "Is HomeGuardian difficult to use?",
    answer: "Not at all! HomeGuardian is designed to be user-friendly and intuitive. After a simple setup process where you answer questions about your home, the platform does all the heavy lifting. You'll receive easy-to-follow maintenance reminders and guides through our mobile app or email.",
    category: "Usage"
  },
  {
    question: "How much does HomeGuardian cost?",
    answer: "HomeGuardian offers several subscription tiers to fit different needs and budgets. Our Basic plan starts at $9.99/month, while our Premium plan with all features is $29.99/month. All plans come with a 14-day free trial, and we offer a 20% discount on annual subscriptions.",
    category: "Pricing"
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer: "Yes, you can cancel your HomeGuardian subscription at any time with no cancellation fees. Your subscription will remain active until the end of your current billing period.",
    category: "Pricing"
  },
  {
    question: "How does HomeGuardian save me money?",
    answer: "HomeGuardian helps you avoid costly repairs by catching small issues before they become major problems. Regular maintenance extends the lifespan of your home systems and appliances, improves energy efficiency, and helps maintain or even increase your property value over time.",
    category: "General"
  },
  {
    question: "Do I need any special skills to follow the maintenance plans?",
    answer: "No special skills are required. Our maintenance tasks are designed for homeowners of all skill levels. Each task comes with clear, step-by-step instructions and video guides. For more complex tasks, we'll let you know when it's best to call a professional.",
    category: "Usage"
  },
  {
    question: "Can I use HomeGuardian for multiple properties?",
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
    question: "Does HomeGuardian work with smart home devices?",
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
    <div className="min-h-screen flex flex-col bg-softWhite">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-r from-[#A3BFFA] to-[#D4C7A9] text-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 font-poppins leading-tight animate-fade-in">Frequently Asked Questions</h1>
            <p className="text-xl md:text-2xl mb-8 font-inter text-white/90 animate-slide-in">
              Find answers to common questions about HomeGuardian.
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-xl mx-auto animate-scale-in">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-white/60" />
              </div>
              <input
                type="text"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-full bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* FAQ Content */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 justify-center mb-12">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-[#A3BFFA] text-white shadow-md'
                    : 'bg-gray-100 text-neutral hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          
          {/* FAQ Accordion */}
          <div className="max-w-3xl mx-auto space-y-4">
            {filteredFAQs.length > 0 ? (
              filteredFAQs.map((faq, index) => (
                <div 
                  key={index} 
                  className="border border-gray-200 rounded-xl overflow-hidden transition-all duration-300 bg-white shadow-card hover:shadow-card-hover"
                >
                  <button
                    onClick={() => toggleQuestion(index)}
                    className="flex justify-between items-center w-full p-6 text-left"
                    aria-expanded={activeIndex === index}
                  >
                    <h3 className="text-lg font-semibold font-poppins pr-8 text-neutral">{faq.question}</h3>
                    <div className="flex-shrink-0">
                      {activeIndex === index ? (
                        <ChevronUp className="h-5 w-5 text-[#A3BFFA]" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                  </button>
                  
                  <div 
                    className={`overflow-hidden transition-all duration-300 ${
                      activeIndex === index ? 'max-h-96' : 'max-h-0'
                    }`}
                  >
                    <div className="p-6 pt-0 border-t border-gray-100 font-inter text-neutral/80">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded-xl shadow-card p-8">
                <p className="text-neutral text-lg font-inter">No results found. Try adjusting your search.</p>
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
      
      {/* Still Have Questions */}
      <section className="py-16 bg-soft-gradient">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6 font-poppins text-[#A3BFFA]">Still Have Questions?</h2>
            <p className="text-lg mb-8 font-inter text-neutral">
              Our support team is here to help you with any questions you might have about HomeGuardian.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="mailto:support@homeguardian.com" 
                className="bg-[#A3BFFA] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#A3BFFA]/90 transition-colors shadow-md"
              >
                Contact Support
              </a>
              <a 
                href="/demo" 
                className="bg-white text-[#A3BFFA] border border-[#A3BFFA] px-6 py-3 rounded-lg font-medium hover:bg-[#A3BFFA]/5 transition-colors"
              >
                Request a Demo
              </a>
            </div>
          </div>
        </div>
      </section>
      
      {/* Quick Links */}
      <section className="py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-xl shadow-card text-center hover:shadow-card-hover transition-shadow">
              <h3 className="text-xl font-bold mb-3 font-poppins text-neutral">Getting Started</h3>
              <p className="text-neutral/80 mb-4 font-inter">
                New to HomeGuardian? Learn how to set up your account and create your first maintenance plan.
              </p>
              <a href="/how-it-works" className="text-[#A3BFFA] font-medium hover:underline">
                View Guide
              </a>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-card text-center hover:shadow-card-hover transition-shadow">
              <h3 className="text-xl font-bold mb-3 font-poppins text-neutral">Pricing Plans</h3>
              <p className="text-neutral/80 mb-4 font-inter">
                Explore our different subscription options to find the perfect fit for your home.
              </p>
              <a href="/pricing" className="text-[#A3BFFA] font-medium hover:underline">
                Compare Plans
              </a>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-card text-center hover:shadow-card-hover transition-shadow">
              <h3 className="text-xl font-bold mb-3 font-poppins text-neutral">Knowledge Base</h3>
              <p className="text-neutral/80 mb-4 font-inter">
                Browse our extensive library of home maintenance articles and tutorials.
              </p>
              <a href="/resources" className="text-[#A3BFFA] font-medium hover:underline">
                Explore Resources
              </a>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default FAQ;
