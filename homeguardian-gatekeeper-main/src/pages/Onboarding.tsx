import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/axios';
import Layout from '@/components/Layout';
import FormInput from '@/components/ui/FormInput';
import FormSelect from '@/components/ui/FormSelect';
import { useAuth } from '@/hooks/useAuth';

// Define the validation schema for Step 1
const step1Schema = z.object({
  year_built: z
    .number()
    .min(1800, 'Year must be at least 1800')
    .max(new Date().getFullYear(), `Year must not exceed ${new Date().getFullYear()}`),
  square_footage: z
    .number()
    .positive('Square footage must be a positive number'),
  location: z
    .string()
    .min(1, 'Location is required')
});

// Define the validation schema for Step 2
const step2Schema = z.object({
  roof_type: z
    .string()
    .min(1, 'Roof type is required'),
  hvac_type: z
    .string()
    .min(1, 'HVAC type is required')
});

// Combined schema for the entire form
const homeSchema = step1Schema.merge(step2Schema);

// Type definition inferred from the schema
type HomeFormValues = z.infer<typeof homeSchema>;

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to access this page.',
        variant: 'destructive',
      });
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate, toast]);
  
  // Initialize form with react-hook-form
  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors, isValid }
  } = useForm<HomeFormValues>({
    resolver: zodResolver(step === 1 ? step1Schema : homeSchema),
    mode: 'onChange'
  });
  
  // Roof type options
  const roofTypes = [
    { value: 'Asphalt', label: 'Asphalt Shingles' },
    { value: 'Metal', label: 'Metal Roof' },
    { value: 'Tile', label: 'Tile Roof' },
    { value: 'Slate', label: 'Slate Roof' },
    { value: 'Wood', label: 'Wood Shingles' },
    { value: 'Flat', label: 'Flat/Built-up Roof' }
  ];
  
  // HVAC type options
  const hvacTypes = [
    { value: 'Central', label: 'Central Air' },
    { value: 'Window', label: 'Window Units' },
    { value: 'Split', label: 'Split System' },
    { value: 'Heat Pump', label: 'Heat Pump' },
    { value: 'Radiant', label: 'Radiant Heating' },
    { value: 'Geothermal', label: 'Geothermal' }
  ];
  
  // Handle next button click
  const handleNext = async () => {
    // Validate current step fields
    const isStepValid = await trigger(
      step === 1 
        ? ['year_built', 'square_footage', 'location'] 
        : ['roof_type', 'hvac_type']
    );
    
    if (isStepValid) {
      setStep(2);
    }
  };
  
  // Handle back button click
  const handleBack = () => {
    setStep(1);
  };
  
  // Handle form submission
  const onSubmit = async (data: HomeFormValues) => {
    setIsLoading(true);
    
    try {
      // Debug: Check if token is set
      const token = localStorage.getItem('accessToken');
      console.log('Token before API call:', token);
      console.log('Making API call to /api/homes with data:', data);
      
      // Send home data to API
      await api.post('/api/homes', data);
      
      // Show success toast
      toast({
        title: 'Home registered successfully',
        description: 'Your home has been registered. Now let\'s select a subscription plan.',
      });
      
      // Redirect to plan selection page
      navigate('/plan-selection');
    } catch (error: any) {
      console.error('Error registering home:', error);
      console.error('Error response:', error.response?.data);
      
      toast({
        title: 'Registration failed',
        description: error.response?.data?.message || 'An error occurred during home registration. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Layout>
      <div className="container max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Set Up Your Home</h1>
          <p className="text-muted-foreground">
            Tell us about your home so we can create a personalized maintenance plan
          </p>
        </div>
        
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                step >= 1 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
              }`}>
                {step > 1 ? <Check size={20} /> : 1}
              </div>
              <div className={`h-1 w-24 mx-2 ${
                step > 1 ? 'bg-primary' : 'bg-muted'
              }`} />
            </div>
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                step >= 2 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
              }`}>
                2
              </div>
            </div>
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-sm font-medium">Basic Info</span>
            <span className="text-sm font-medium">Additional Details</span>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 border border-border/50">
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Step 1: Basic Home Info */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="flex items-center mb-4">
                  <Home className="w-5 h-5 mr-2 text-primary" />
                  <h2 className="text-xl font-semibold">Basic Home Information</h2>
                </div>
                
                <FormInput
                  label="Year Built"
                  type="number"
                  placeholder="e.g., 1985"
                  error={errors.year_built?.message}
                  disabled={isLoading}
                  {...register('year_built', { valueAsNumber: true })}
                />
                
                <FormInput
                  label="Square Footage"
                  type="number"
                  placeholder="e.g., 2000"
                  error={errors.square_footage?.message}
                  disabled={isLoading}
                  {...register('square_footage', { valueAsNumber: true })}
                />
                
                <FormInput
                  label="Location"
                  type="text"
                  placeholder="City, State or ZIP Code"
                  error={errors.location?.message}
                  disabled={isLoading}
                  {...register('location')}
                />
                
                <div className="flex justify-end mt-6">
                  <button
                    type="button"
                    className="btn-primary flex items-center"
                    onClick={handleNext}
                  >
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
            
            {/* Step 2: Additional Details */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="flex items-center mb-4">
                  <Home className="w-5 h-5 mr-2 text-primary" />
                  <h2 className="text-xl font-semibold">Additional Home Details</h2>
                </div>
                
                <FormSelect
                  label="Roof Type"
                  placeholder="Select roof type"
                  options={roofTypes}
                  error={errors.roof_type?.message}
                  disabled={isLoading}
                  {...register('roof_type')}
                />
                
                <FormSelect
                  label="HVAC System"
                  placeholder="Select HVAC type"
                  options={hvacTypes}
                  error={errors.hvac_type?.message}
                  disabled={isLoading}
                  {...register('hvac_type')}
                />
                
                <div className="flex justify-between mt-6">
                  <button
                    type="button"
                    className="btn-outline flex items-center"
                    onClick={handleBack}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </button>
                  
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Saving...' : 'Complete Setup'}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default Onboarding; 