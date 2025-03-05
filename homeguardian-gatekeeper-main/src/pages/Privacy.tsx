import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Privacy = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-10 bg-primary-gradient text-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 font-outfit leading-tight">Privacy Policy</h1>
            <p className="text-xl md:text-2xl font-manrope text-white/90">
              How we protect and handle your data.
            </p>
          </div>
        </div>
      </section>
      
      {/* Content Section */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto prose prose-lg">
            <div className="mb-10">
              <h2 className="text-2xl font-bold mb-4 font-outfit text-primary">Introduction</h2>
              <p className="text-gray-700 font-manrope">
                At HomeGuardian, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, 
                and safeguard your information when you visit our website or use our service. Please read this privacy policy 
                carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
              </p>
            </div>
            
            <div className="mb-10">
              <h2 className="text-2xl font-bold mb-4 font-outfit text-primary">Information We Collect</h2>
              <p className="text-gray-700 mb-4 font-manrope">
                We collect information that you provide directly to us when you:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 font-manrope">
                <li>Register for an account</li>
                <li>Fill out a form</li>
                <li>Submit home information</li>
                <li>Correspond with us</li>
                <li>Subscribe to our newsletter</li>
                <li>Request customer support</li>
              </ul>
              <p className="text-gray-700 font-manrope">
                The types of information we may collect include your name, email address, mailing address, phone number, 
                payment information, and information about your home such as age, size, and features.
              </p>
            </div>
            
            <div className="mb-10">
              <h2 className="text-2xl font-bold mb-4 font-outfit text-primary">How We Use Your Information</h2>
              <p className="text-gray-700 mb-4 font-manrope">
                We may use the information we collect about you for various purposes, including to:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 font-manrope">
                <li>Provide, maintain, and improve our services</li>
                <li>Process transactions and send related information</li>
                <li>Send you technical notices, updates, security alerts, and support messages</li>
                <li>Respond to your comments, questions, and requests</li>
                <li>Develop new products and services</li>
                <li>Monitor and analyze trends, usage, and activities in connection with our services</li>
                <li>Personalize your experience</li>
              </ul>
            </div>
            
            <div className="mb-10">
              <h2 className="text-2xl font-bold mb-4 font-outfit text-primary">Sharing of Information</h2>
              <p className="text-gray-700 mb-4 font-manrope">
                We may share your personal information in the following situations:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 font-manrope">
                <li>With service providers, contractors, and other third parties we use to support our business</li>
                <li>To comply with applicable laws and regulations</li>
                <li>To respond to a subpoena, search warrant, or other lawful request for information</li>
                <li>To protect the rights, property, or safety of our users or others</li>
                <li>In connection with a merger, sale of company assets, financing, or acquisition</li>
              </ul>
              <p className="text-gray-700 font-manrope">
                We do not sell, rent, or trade your personal information to third parties for their marketing purposes without your consent.
              </p>
            </div>
            
            <div className="mb-10">
              <h2 className="text-2xl font-bold mb-4 font-outfit text-primary">Data Security</h2>
              <p className="text-gray-700 font-manrope">
                We have implemented appropriate technical and organizational security measures designed to protect your information. 
                However, please note that no method of transmission over the Internet or electronic storage is 100% secure. While we 
                strive to use commercially acceptable means to protect your personal information, we cannot guarantee its absolute security.
              </p>
            </div>
            
            <div className="mb-10">
              <h2 className="text-2xl font-bold mb-4 font-outfit text-primary">Your Rights</h2>
              <p className="text-gray-700 mb-4 font-manrope">
                You have certain rights regarding your personal information, including:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 font-manrope">
                <li>Access to your personal information</li>
                <li>Correction of inaccurate or incomplete information</li>
                <li>Deletion of your personal information</li>
                <li>Restriction of processing of your personal information</li>
                <li>Data portability</li>
                <li>Objection to processing of your personal information</li>
              </ul>
              <p className="text-gray-700 font-manrope">
                To exercise any of these rights, please contact us using the information provided at the end of this policy.
              </p>
            </div>
            
            <div className="mb-10">
              <h2 className="text-2xl font-bold mb-4 font-outfit text-primary">Changes to This Privacy Policy</h2>
              <p className="text-gray-700 font-manrope">
                We may update our privacy policy from time to time. We will notify you of any changes by posting the new 
                privacy policy on this page and updating the "Last Updated" date. You are advised to review this privacy 
                policy periodically for any changes.
              </p>
            </div>
            
            <div>
              <h2 className="text-2xl font-bold mb-4 font-outfit text-primary">Contact Us</h2>
              <p className="text-gray-700 font-manrope">
                If you have any questions about this privacy policy, please contact us at:
              </p>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="font-manrope">
                  <strong>Email:</strong> privacy@homeguardian.com<br />
                  <strong>Address:</strong> 123 Guardian Street, Suite 456, San Francisco, CA 94107<br />
                  <strong>Phone:</strong> (123) 456-7890
                </p>
              </div>
              <p className="mt-4 text-sm text-gray-500 font-manrope">
                Last Updated: May 15, 2023
              </p>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Privacy;
