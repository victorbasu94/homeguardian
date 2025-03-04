import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Home, MapPin, Calendar, Ruler, ArrowRight, ArrowLeft, CheckCircle, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import api from '@/lib/axios';

// Step 1: Basic Home Information Schema
const homeBasicSchema = z.object({
  name: z.string().min(2, 'Home name must be at least 2 characters'),
  type: z.enum(['house', 'apartment', 'condo', 'townhouse', 'other'], {
    required_error: 'Please select a home type',
  }),
  address: z.string().min(5, 'Please enter a valid address'),
  city: z.string().min(2, 'City must be at least 2 characters'),
  state: z.string().min(2, 'State must be at least 2 characters'),
  zipCode: z.string().min(5, 'Please enter a valid ZIP code'),
});

// Step 2: Home Details Schema
const homeDetailsSchema = z.object({
  yearBuilt: z.string()
    .refine(val => !isNaN(Number(val)), { message: 'Year must be a number' })
    .refine(val => Number(val) >= 1800 && Number(val) <= new Date().getFullYear(), {
      message: `Year must be between 1800 and ${new Date().getFullYear()}`,
    }),
  squareFeet: z.string()
    .refine(val => !isNaN(Number(val)), { message: 'Square footage must be a number' })
    .refine(val => Number(val) > 0, { message: 'Square footage must be greater than 0' }),
  bedrooms: z.string()
    .refine(val => !isNaN(Number(val)), { message: 'Bedrooms must be a number' })
    .refine(val => Number(val) >= 0, { message: 'Bedrooms cannot be negative' }),
  bathrooms: z.string()
    .refine(val => !isNaN(Number(val)), { message: 'Bathrooms must be a number' })
    .refine(val => Number(val) >= 0, { message: 'Bathrooms cannot be negative' }),
  roofType: z.string().min(1, "Roof type is required"),
  hvacType: z.string().min(1, "HVAC system type is required"),
});

// Step 3: Maintenance Preferences Schema
const maintenancePrefsSchema = z.object({
  maintenanceLevel: z.enum(['minimal', 'standard', 'comprehensive'], {
    required_error: 'Please select a maintenance level',
  }),
  reminderFrequency: z.enum(['weekly', 'biweekly', 'monthly'], {
    required_error: 'Please select a reminder frequency',
  }),
  notes: z.string().optional(),
});

// Combined schema types
type HomeBasicFormValues = z.infer<typeof homeBasicSchema>;
type HomeDetailsFormValues = z.infer<typeof homeDetailsSchema>;
type MaintenancePrefsFormValues = z.infer<typeof maintenancePrefsSchema>;

// Combined form data
interface CombinedFormData extends HomeBasicFormValues, HomeDetailsFormValues, MaintenancePrefsFormValues {}

const Onboarding: React.FC = () => {
  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState<Partial<CombinedFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Step 1 form
  const {
    register: registerStep1,
    handleSubmit: handleSubmitStep1,
    formState: { errors: errorsStep1 },
    setValue: setValueStep1,
  } = useForm<HomeBasicFormValues>({
    resolver: zodResolver(homeBasicSchema),
    defaultValues: {
      name: formData.name || '',
      type: formData.type || undefined,
      address: formData.address || '',
      city: formData.city || '',
      state: formData.state || '',
      zipCode: formData.zipCode || '',
    },
  });
  
  // Step 2 form
  const {
    register: registerStep2,
    handleSubmit: handleSubmitStep2,
    formState: { errors: errorsStep2 },
    setValue: setValueStep2,
    watch: watchStep2,
  } = useForm<HomeDetailsFormValues>({
    resolver: zodResolver(homeDetailsSchema),
    defaultValues: {
      yearBuilt: formData.yearBuilt || '',
      squareFeet: formData.squareFeet || '',
      bedrooms: formData.bedrooms || '',
      bathrooms: formData.bathrooms || '',
      roofType: formData.roofType || '',
      hvacType: formData.hvacType || '',
    },
  });
  
  // Step 3 form
  const {
    register: registerStep3,
    handleSubmit: handleSubmitStep3,
    formState: { errors: errorsStep3 },
    setValue: setValueStep3,
    watch: watchStep3,
  } = useForm<MaintenancePrefsFormValues>({
    resolver: zodResolver(maintenancePrefsSchema),
    defaultValues: {
      maintenanceLevel: formData.maintenanceLevel || undefined,
      reminderFrequency: formData.reminderFrequency || undefined,
      notes: formData.notes || '',
    },
  });
  
  // Watch values for radio buttons
  const maintenanceLevel = watchStep3('maintenanceLevel');
  const reminderFrequency = watchStep3('reminderFrequency');
  
  // Handle step 1 submission
  const onSubmitStep1 = (data: HomeBasicFormValues) => {
    setFormData({ ...formData, ...data });
    setStep(2);
    window.scrollTo(0, 0);
  };
  
  // Handle step 2 submission
  const onSubmitStep2 = (data: HomeDetailsFormValues) => {
    setFormData({ ...formData, ...data });
    setStep(3);
    window.scrollTo(0, 0);
  };
  
  // Handle step 3 submission (final)
  const onSubmitStep3 = async (data: MaintenancePrefsFormValues) => {
    const completeFormData = { ...formData, ...data } as CombinedFormData;
    setIsSubmitting(true);
    
    try {
      // Call API to create home
      await api.post('/api/homes', {
        name: `My ${completeFormData.type.replace('_', ' ')} Home`,
        type: completeFormData.type,
        location: `${completeFormData.address}, ${completeFormData.city}, ${completeFormData.state} ${completeFormData.zipCode}`,
        year_built: Number(completeFormData.yearBuilt),
        square_footage: Number(completeFormData.squareFeet),
        bedrooms: Number(completeFormData.bedrooms),
        bathrooms: Number(completeFormData.bathrooms),
        roof_type: completeFormData.roofType,
        hvac_type: completeFormData.hvacType,
        maintenance_level: completeFormData.maintenanceLevel,
        reminder_frequency: completeFormData.reminderFrequency,
        notes: completeFormData.notes,
        user_id: user?.id,
      });
      
      // Show success toast
      toast({
        title: 'Home added successfully',
        description: 'Your home has been set up and is ready to be managed.',
      });
      
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error adding home:', error);
      
      // Show error toast
      toast({
        title: 'Failed to add home',
        description: error.response?.data?.message || 'An error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Go back to previous step
  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo(0, 0);
    }
  };
  
  // Skip onboarding
  const handleSkip = () => {
    navigate('/dashboard');
  };
  
  // Set maintenance level
  const handleMaintenanceLevelChange = (value: string) => {
    setValueStep3('maintenanceLevel', value as 'minimal' | 'standard' | 'comprehensive');
  };
  
  // Set reminder frequency
  const handleReminderFrequencyChange = (value: string) => {
    setValueStep3('reminderFrequency', value as 'weekly' | 'biweekly' | 'monthly');
  };
  
  // Define home type options
  const homeTypes = [
    { value: "single_family", label: "Single Family Home" },
    { value: "condo", label: "Condominium" },
    { value: "townhouse", label: "Townhouse" },
    { value: "apartment", label: "Apartment" },
    { value: "mobile", label: "Mobile Home" },
    { value: "other", label: "Other" }
  ];
  
  // Define roof type options
  const roofTypes = [
    { value: "asphalt", label: "Asphalt Shingles" },
    { value: "metal", label: "Metal Roof" },
    { value: "tile", label: "Tile Roof" },
    { value: "slate", label: "Slate Roof" },
    { value: "wood", label: "Wood Shingles" },
    { value: "flat", label: "Flat/Built-up Roof" }
  ];
  
  // Define HVAC type options
  const hvacTypes = [
    { value: "central", label: "Central Air" },
    { value: "window", label: "Window Units" },
    { value: "split", label: "Split System" },
    { value: "heat_pump", label: "Heat Pump" },
    { value: "radiant", label: "Radiant Heating" },
    { value: "geothermal", label: "Geothermal" }
  ];
  
  return (
    <div className="min-h-screen flex flex-col bg-softWhite">
      <div className="py-6 px-4 sm:px-6 lg:px-8 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-primary mr-2" />
            <span className="text-xl font-bold">HomeGuardian</span>
          </div>
          <Button variant="ghost" onClick={handleSkip}>
            Skip for now
          </Button>
        </div>
      </div>
      
      <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">Set Up Your Home</h1>
            <p className="text-neutral/70">
              {step === 1 && "Let's get started with some basic information about your home"}
              {step === 2 && "Now, let's add some details about your home's specifications"}
              {step === 3 && "Finally, let's set your maintenance preferences"}
            </p>
          </div>
          
          {/* Progress indicator */}
          <div className="flex justify-between items-center mb-8">
            <div className="w-full flex items-center">
              <div className={`rounded-full h-10 w-10 flex items-center justify-center ${
                step >= 1 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {step > 1 ? <CheckCircle className="h-5 w-5" /> : 1}
              </div>
              <div className={`flex-1 h-1 mx-2 ${step > 1 ? 'bg-primary' : 'bg-gray-200'}`}></div>
              <div className={`rounded-full h-10 w-10 flex items-center justify-center ${
                step >= 2 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {step > 2 ? <CheckCircle className="h-5 w-5" /> : 2}
              </div>
              <div className={`flex-1 h-1 mx-2 ${step > 2 ? 'bg-primary' : 'bg-gray-200'}`}></div>
              <div className={`rounded-full h-10 w-10 flex items-center justify-center ${
                step >= 3 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                3
              </div>
            </div>
          </div>
          
          <div className="bg-white p-8 rounded-2xl shadow-card">
            {/* Step 1: Basic Home Information */}
            {step === 1 && (
              <form onSubmit={handleSubmitStep1(onSubmitStep1)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Home Name</Label>
                  <div className="relative">
                    <Input
                      id="name"
                      placeholder="e.g. My House, Beach Condo"
                      {...registerStep1('name')}
                      className={errorsStep1.name ? 'border-red-500 pl-10' : 'pl-10'}
                    />
                    <Home className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral/50" />
                  </div>
                  {errorsStep1.name && (
                    <p className="text-red-500 text-sm">{errorsStep1.name.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="type">Home Type</Label>
                  <Select 
                    onValueChange={(value) => {
                      setFormData({ ...formData, type: value as any });
                      setValueStep1('type', value as 'house' | 'apartment' | 'condo' | 'townhouse' | 'other');
                    }}
                    defaultValue={formData.type}
                  >
                    <SelectTrigger className={errorsStep1.type ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select home type" />
                    </SelectTrigger>
                    <SelectContent>
                      {homeTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errorsStep1.type && (
                    <p className="text-red-500 text-sm">{errorsStep1.type.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Street Address</Label>
                  <div className="relative">
                    <Input
                      id="address"
                      placeholder="123 Main St"
                      {...registerStep1('address')}
                      className={errorsStep1.address ? 'border-red-500 pl-10' : 'pl-10'}
                    />
                    <MapPin className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral/50" />
                  </div>
                  {errorsStep1.address && (
                    <p className="text-red-500 text-sm">{errorsStep1.address.message}</p>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      placeholder="City"
                      {...registerStep1('city')}
                      className={errorsStep1.city ? 'border-red-500' : ''}
                    />
                    {errorsStep1.city && (
                      <p className="text-red-500 text-sm">{errorsStep1.city.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      placeholder="State"
                      {...registerStep1('state')}
                      className={errorsStep1.state ? 'border-red-500' : ''}
                    />
                    {errorsStep1.state && (
                      <p className="text-red-500 text-sm">{errorsStep1.state.message}</p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="zipCode">ZIP Code</Label>
                  <Input
                    id="zipCode"
                    placeholder="ZIP Code"
                    {...registerStep1('zipCode')}
                    className={errorsStep1.zipCode ? 'border-red-500' : ''}
                  />
                  {errorsStep1.zipCode && (
                    <p className="text-red-500 text-sm">{errorsStep1.zipCode.message}</p>
                  )}
                </div>
                
                <Button type="submit" className="w-full" size="lg">
                  Continue <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            )}
            
            {/* Step 2: Home Details */}
            {step === 2 && (
              <form onSubmit={handleSubmitStep2(onSubmitStep2)} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="yearBuilt">Year Built</Label>
                    <Input
                      id="yearBuilt"
                      placeholder="e.g., 1985"
                      {...registerStep2('yearBuilt')}
                    />
                    {errorsStep2.yearBuilt && (
                      <p className="text-sm text-destructive mt-1">{errorsStep2.yearBuilt.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="squareFeet">Square Footage</Label>
                    <Input
                      id="squareFeet"
                      placeholder="e.g., 2000"
                      {...registerStep2('squareFeet')}
                    />
                    {errorsStep2.squareFeet && (
                      <p className="text-sm text-destructive mt-1">{errorsStep2.squareFeet.message}</p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bedrooms">Bedrooms</Label>
                    <Input
                      id="bedrooms"
                      placeholder="e.g., 3"
                      {...registerStep2('bedrooms')}
                    />
                    {errorsStep2.bedrooms && (
                      <p className="text-sm text-destructive mt-1">{errorsStep2.bedrooms.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="bathrooms">Bathrooms</Label>
                    <Input
                      id="bathrooms"
                      placeholder="e.g., 2"
                      {...registerStep2('bathrooms')}
                    />
                    {errorsStep2.bathrooms && (
                      <p className="text-sm text-destructive mt-1">{errorsStep2.bathrooms.message}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="roofType">Roof Type</Label>
                  <Select
                    value={watchStep2('roofType')}
                    onValueChange={(value) => setValueStep2('roofType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select roof type" />
                    </SelectTrigger>
                    <SelectContent>
                      {roofTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errorsStep2.roofType && (
                    <p className="text-sm text-destructive mt-1">{errorsStep2.roofType.message}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="hvacType">HVAC System</Label>
                  <Select
                    value={watchStep2('hvacType')}
                    onValueChange={(value) => setValueStep2('hvacType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select HVAC system type" />
                    </SelectTrigger>
                    <SelectContent>
                      {hvacTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errorsStep2.hvacType && (
                    <p className="text-sm text-destructive mt-1">{errorsStep2.hvacType.message}</p>
                  )}
                </div>
                
                <div className="flex justify-between mt-8">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                  >
                    Next
                  </Button>
                </div>
              </form>
            )}
            
            {/* Step 3: Maintenance Preferences */}
            {step === 3 && (
              <form onSubmit={handleSubmitStep3(onSubmitStep3)} className="space-y-6">
                <div className="space-y-4">
                  <Label>Maintenance Level</Label>
                  <RadioGroup 
                    value={maintenanceLevel} 
                    onValueChange={handleMaintenanceLevelChange}
                    className="grid gap-4"
                  >
                    <div className={`flex items-start space-x-3 border rounded-lg p-4 cursor-pointer transition-colors ${
                      maintenanceLevel === 'minimal' ? 'border-primary bg-primary/5' : 'border-gray-200'
                    }`}>
                      <RadioGroupItem value="minimal" id="minimal" className="mt-1" />
                      <div>
                        <Label htmlFor="minimal" className="font-medium cursor-pointer">Minimal</Label>
                        <p className="text-sm text-neutral/70">Essential maintenance tasks only</p>
                      </div>
                    </div>
                    
                    <div className={`flex items-start space-x-3 border rounded-lg p-4 cursor-pointer transition-colors ${
                      maintenanceLevel === 'standard' ? 'border-primary bg-primary/5' : 'border-gray-200'
                    }`}>
                      <RadioGroupItem value="standard" id="standard" className="mt-1" />
                      <div>
                        <Label htmlFor="standard" className="font-medium cursor-pointer">Standard</Label>
                        <p className="text-sm text-neutral/70">Recommended maintenance schedule</p>
                      </div>
                    </div>
                    
                    <div className={`flex items-start space-x-3 border rounded-lg p-4 cursor-pointer transition-colors ${
                      maintenanceLevel === 'comprehensive' ? 'border-primary bg-primary/5' : 'border-gray-200'
                    }`}>
                      <RadioGroupItem value="comprehensive" id="comprehensive" className="mt-1" />
                      <div>
                        <Label htmlFor="comprehensive" className="font-medium cursor-pointer">Comprehensive</Label>
                        <p className="text-sm text-neutral/70">Detailed maintenance for optimal home care</p>
                      </div>
                    </div>
                  </RadioGroup>
                  {errorsStep3.maintenanceLevel && (
                    <p className="text-red-500 text-sm">{errorsStep3.maintenanceLevel.message}</p>
                  )}
                </div>
                
                <div className="space-y-4">
                  <Label>Reminder Frequency</Label>
                  <RadioGroup 
                    value={reminderFrequency} 
                    onValueChange={handleReminderFrequencyChange}
                    className="grid gap-4"
                  >
                    <div className={`flex items-start space-x-3 border rounded-lg p-4 cursor-pointer transition-colors ${
                      reminderFrequency === 'weekly' ? 'border-primary bg-primary/5' : 'border-gray-200'
                    }`}>
                      <RadioGroupItem value="weekly" id="weekly" className="mt-1" />
                      <div>
                        <Label htmlFor="weekly" className="font-medium cursor-pointer">Weekly</Label>
                        <p className="text-sm text-neutral/70">Get reminders every week</p>
                      </div>
                    </div>
                    
                    <div className={`flex items-start space-x-3 border rounded-lg p-4 cursor-pointer transition-colors ${
                      reminderFrequency === 'biweekly' ? 'border-primary bg-primary/5' : 'border-gray-200'
                    }`}>
                      <RadioGroupItem value="biweekly" id="biweekly" className="mt-1" />
                      <div>
                        <Label htmlFor="biweekly" className="font-medium cursor-pointer">Bi-weekly</Label>
                        <p className="text-sm text-neutral/70">Get reminders every two weeks</p>
                      </div>
                    </div>
                    
                    <div className={`flex items-start space-x-3 border rounded-lg p-4 cursor-pointer transition-colors ${
                      reminderFrequency === 'monthly' ? 'border-primary bg-primary/5' : 'border-gray-200'
                    }`}>
                      <RadioGroupItem value="monthly" id="monthly" className="mt-1" />
                      <div>
                        <Label htmlFor="monthly" className="font-medium cursor-pointer">Monthly</Label>
                        <p className="text-sm text-neutral/70">Get reminders once a month</p>
                      </div>
                    </div>
                  </RadioGroup>
                  {errorsStep3.reminderFrequency && (
                    <p className="text-red-500 text-sm">{errorsStep3.reminderFrequency.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any special considerations or notes about your home..."
                    {...registerStep3('notes')}
                    className="min-h-[100px]"
                  />
                </div>
                
                <div className="flex justify-between pt-4">
                  <Button type="button" variant="outline" onClick={handleBack}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Setting up...' : 'Complete Setup'}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding; 