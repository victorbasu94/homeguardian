import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Terms = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-10 bg-primary-gradient text-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 font-outfit leading-tight">Terms of Service</h1>
            <p className="text-xl md:text-2xl font-manrope text-white/90">
              Please read these terms carefully before using our service.
            </p>
          </div>
        </div>
      </section>
      
      {/* Content Section */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto prose prose-lg">
            <div className="mb-10">
              <h2 className="text-2xl font-bold mb-4 font-outfit text-primary">Agreement to Terms</h2>
              <p className="text-gray-700 font-manrope">
                These Terms of Service constitute a legally binding agreement made between you and MaintainMint, concerning your 
                access to and use of our website and services. By accessing or using our service, you agree to be bound by these 
                Terms. If you disagree with any part of the terms, you may not access the service.
              </p>
            </div>
            
            <div className="mb-10">
              <h2 className="text-2xl font-bold mb-4 font-outfit text-primary">Intellectual Property Rights</h2>
              <p className="text-gray-700 mb-4 font-manrope">
                Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, 
                software, website designs, audio, video, text, photographs, and graphics on the Site and the trademarks, service 
                marks, and logos contained therein are owned or controlled by us or licensed to us, and are protected by copyright 
                and trademark laws and various other intellectual property rights.
              </p>
              <p className="text-gray-700 font-manrope">
                You are granted a limited license to access and use the Site and to download or print a copy of any portion of the 
                Content to which you have properly gained access solely for your personal, non-commercial use.
              </p>
            </div>
            
            <div className="mb-10">
              <h2 className="text-2xl font-bold mb-4 font-outfit text-primary">User Representations</h2>
              <p className="text-gray-700 mb-4 font-manrope">
                By using the service, you represent and warrant that:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 font-manrope">
                <li>You have the legal capacity and agree to comply with these Terms of Service</li>
                <li>You are not a minor in the jurisdiction in which you reside</li>
                <li>You will not access the Service through automated or non-human means</li>
                <li>You will not use the Service for any illegal or unauthorized purpose</li>
                <li>Your use of the Service will not violate any applicable law or regulation</li>
              </ul>
            </div>
            
            <div className="mb-10">
              <h2 className="text-2xl font-bold mb-4 font-outfit text-primary">User Registration</h2>
              <p className="text-gray-700 mb-4 font-manrope">
                You may be required to register with the Service. You agree to keep your password confidential and will be 
                responsible for all use of your account and password. We reserve the right to remove, reclaim, or change a 
                username you select if we determine, in our sole discretion, that such username is inappropriate, obscene, 
                or otherwise objectionable.
              </p>
            </div>
            
            <div className="mb-10">
              <h2 className="text-2xl font-bold mb-4 font-outfit text-primary">Purchases and Payment</h2>
              <p className="text-gray-700 mb-4 font-manrope">
                We accept various forms of payment. You agree to provide current, complete, and accurate purchase and account 
                information for all purchases made via the Site. You further agree to promptly update account and payment 
                information, including email address, payment method, and payment card expiration date, so that we can 
                complete your transactions and contact you as needed.
              </p>
              <p className="text-gray-700 font-manrope">
                All sales are final and no refunds will be issued except in our sole discretion.
              </p>
            </div>
            
            <div className="mb-10">
              <h2 className="text-2xl font-bold mb-4 font-outfit text-primary">Free Trial</h2>
              <p className="text-gray-700 mb-4 font-manrope">
                We offer a 14-day free trial to new users who register with the Service. The free trial period starts on the 
                date that you sign up and will last for 14 days. After the free trial period, you will be charged according 
                to the pricing plan you selected unless you cancel before the end of the free trial period.
              </p>
            </div>
            
            <div className="mb-10">
              <h2 className="text-2xl font-bold mb-4 font-outfit text-primary">Cancellation</h2>
              <p className="text-gray-700 mb-4 font-manrope">
                You can cancel your subscription at any time by logging into your account or contacting us. Your cancellation will 
                take effect at the end of the current paid term. If you are unsatisfied with our services, please email us 
                at support@maintainmint.com.
              </p>
            </div>
            
            <div className="mb-10">
              <h2 className="text-2xl font-bold mb-4 font-outfit text-primary">Prohibited Activities</h2>
              <p className="text-gray-700 mb-4 font-manrope">
                You may not access or use the Service for any purpose other than that for which we make the Service available. 
                The Service may not be used in connection with any commercial endeavors except those that are specifically 
                endorsed or approved by us.
              </p>
            </div>
            
            <div className="mb-10">
              <h2 className="text-2xl font-bold mb-4 font-outfit text-primary">Limitation of Liability</h2>
              <p className="text-gray-700 mb-4 font-manrope">
                In no event will we or our directors, employees, or agents be liable to you or any third party for any direct, 
                indirect, consequential, exemplary, incidental, special, or punitive damages, including lost profit, lost revenue, 
                loss of data, or other damages arising from your use of the service, even if we have been advised of the 
                possibility of such damages.
              </p>
            </div>
            
            <div className="mb-10">
              <h2 className="text-2xl font-bold mb-4 font-outfit text-primary">Indemnification</h2>
              <p className="text-gray-700 mb-4 font-manrope">
                You agree to defend, indemnify, and hold us harmless, including our subsidiaries, affiliates, and all of our 
                respective officers, agents, partners, and employees, from and against any loss, damage, liability, claim, 
                or demand, including reasonable attorneys' fees and expenses, made by any third party due to or arising out of 
                your use of the Service, violation of these Terms of Service, or breach of any representations and warranties 
                set forth in these Terms of Service.
              </p>
            </div>
            
            <div className="mb-10">
              <h2 className="text-2xl font-bold mb-4 font-outfit text-primary">Modifications and Interruptions</h2>
              <p className="text-gray-700 mb-4 font-manrope">
                We reserve the right to change, modify, or remove the contents of the Service at any time or for any reason at 
                our sole discretion without notice. We also reserve the right to modify or discontinue all or part of the 
                Service without notice at any time.
              </p>
            </div>
            
            <div>
              <h2 className="text-2xl font-bold mb-4 font-outfit text-primary">Contact Us</h2>
              <p className="text-gray-700 font-manrope">
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="font-manrope">
                  <strong>Email:</strong> legal@maintainmint.com<br />
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

export default Terms;
