import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Home, MapPin, Calendar, Ruler, ArrowRight, ArrowLeft, CheckCircle, Shield, Layers, Thermometer, Wrench, Droplets, Construction, Trees, Warehouse, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import api from '@/lib/axios';

// Step 1: Basic Home Information Schema
const homeBasicSchema = z.object({
  name: z.string().min(2, 'Home name must be at least 2 characters'),
  home_type: z.enum(['single_family', 'apartment', 'townhouse', 'condo', 'mobile_home', 'other'], {
    required_error: 'Please select a home type',
  }),
  address: z.string().min(5, 'Please enter a valid address'),
  city: z.string().min(2, 'City must be at least 2 characters'),
  state: z.string().min(2, 'State must be at least 2 characters'),
  zipCode: z.string().min(5, 'Please enter a valid ZIP code'),
});

// Step 2: Mandatory Home Details Schema
const mandatoryDetailsSchema = z.object({
  year_built: z.string()
    .min(1, { message: 'Year built is required' })
    .refine(val => !isNaN(Number(val)), { message: 'Year must be a number' })
    .refine(val => Number(val) >= 1800 && Number(val) <= new Date().getFullYear(), {
      message: `Year must be between 1800 and ${new Date().getFullYear()}`,
    }),
  square_footage: z.string()
    .min(1, { message: 'Square footage is required' })
    .refine(val => !isNaN(Number(val)), { message: 'Square footage must be a number' })
    .refine(val => Number(val) > 0, { message: 'Square footage must be greater than 0' }),
  number_of_stories: z.string()
    .min(1, { message: 'Number of stories is required' })
    .refine(val => !isNaN(Number(val)), { message: 'Number of stories must be a number' })
    .refine(val => Number(val) > 0, { message: 'Number of stories must be greater than 0' }),
  roof_type: z.enum(['asphalt_shingles', 'metal', 'tile', 'flat', 'slate', 'wood_shingles', 'other'], {
    required_error: 'Roof type is required'
  }),
  hvac_type: z.enum(['central_hvac', 'radiator', 'window_ac', 'heat_pump', 'ductless_mini_split', 'boiler', 'other'], {
    required_error: 'HVAC type is required'
  }),
});

// Step 3: Optional Home Details Schema
const optionalDetailsSchema = z.object({
  exterior_material: z.enum(['brick', 'vinyl_siding', 'wood', 'stucco', 'fiber_cement', 'stone', 'aluminum', 'other']).optional(),
  foundation_type: z.enum(['slab', 'crawlspace', 'basement', 'pier_and_beam', 'other']).optional(),
  windows_count: z.string().optional(),
  windows_type: z.enum(['single_pane', 'double_pane', 'triple_pane', 'other']).optional(),
  windows_year: z.string().optional(),
  plumbing_age: z.string().optional(),
  plumbing_material: z.enum(['copper', 'pvc', 'pex', 'galvanized', 'cast_iron', 'other']).optional(),
  has_yard: z.boolean().optional(),
  yard_size: z.enum(['small', 'medium', 'large']).optional(),
  yard_features: z.string().optional(),
  garage_type: z.enum(['attached', 'detached', 'none']).optional(),
  garage_size: z.enum(['1_car', '2_car', '3_car', 'other']).optional(),
  recent_renovations: z.string().optional(),
  occupancy: z.enum(['primary_residence', 'rental', 'vacation_home', 'other']).optional(),
  appliances: z.string().optional(),
});

// Step 4: Maintenance Preferences Schema
const maintenancePrefsSchema = z.object({
  maintenance_level: z.enum(['minimal', 'standard', 'comprehensive'], {
    required_error: 'Please select a maintenance level',
  }),
  reminder_frequency: z.enum(['weekly', 'biweekly', 'monthly'], {
    required_error: 'Please select a reminder frequency',
  }),
  notes: z.string().optional(),
});

// Combined schema types
type HomeBasicFormValues = z.infer<typeof homeBasicSchema>;
type MandatoryDetailsFormValues = z.infer<typeof mandatoryDetailsSchema>;
type OptionalDetailsFormValues = z.infer<typeof optionalDetailsSchema>;
type MaintenancePrefsFormValues = z.infer<typeof maintenancePrefsSchema>;

// Combined form data
interface CombinedFormData extends HomeBasicFormValues, MandatoryDetailsFormValues, OptionalDetailsFormValues, MaintenancePrefsFormValues {}

const AddHome: React.FC = () => {
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
      home_type: formData.home_type || undefined,
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
  } = useForm<MandatoryDetailsFormValues>({
    resolver: zodResolver(mandatoryDetailsSchema),
    defaultValues: {
      year_built: formData.year_built || '',
      square_footage: formData.square_footage || '',
      number_of_stories: formData.number_of_stories || '',
      roof_type: formData.roof_type || undefined,
      hvac_type: formData.hvac_type || undefined,
    },
  });
  
  // Step 3 form
  const {
    register: registerStep3,
    handleSubmit: handleSubmitStep3,
    formState: { errors: errorsStep3 },
    setValue: setValueStep3,
    watch: watchStep3,
  } = useForm<OptionalDetailsFormValues>({
    resolver: zodResolver(optionalDetailsSchema),
    defaultValues: {
      exterior_material: formData.exterior_material || undefined,
      foundation_type: formData.foundation_type || undefined,
      windows_count: formData.windows_count || '',
      windows_type: formData.windows_type || undefined,
      windows_year: formData.windows_year || '',
      plumbing_age: formData.plumbing_age || '',
      plumbing_material: formData.plumbing_material || undefined,
      has_yard: formData.has_yard || false,
      yard_size: formData.yard_size || undefined,
      yard_features: formData.yard_features || '',
      garage_type: formData.garage_type || undefined,
      garage_size: formData.garage_size || undefined,
      recent_renovations: formData.recent_renovations || '',
      occupancy: formData.occupancy || undefined,
      appliances: formData.appliances || '',
    },
  });
  
  // Step 4 form
  const {
    register: registerStep4,
    handleSubmit: handleSubmitStep4,
    formState: { errors: errorsStep4 },
    setValue: setValueStep4,
    watch: watchStep4,
  } = useForm<MaintenancePrefsFormValues>({
    resolver: zodResolver(maintenancePrefsSchema),
    defaultValues: {
      maintenance_level: formData.maintenance_level || undefined,
      reminder_frequency: formData.reminder_frequency || undefined,
      notes: formData.notes || '',
    },
  });
  
  // Watch values for radio buttons
  const maintenanceLevel = watchStep4('maintenance_level');
  const reminderFrequency = watchStep4('reminder_frequency');
  
  // Handle step 1 submission
  const onSubmitStep1 = (data: HomeBasicFormValues) => {
    setFormData({ ...formData, ...data });
    setStep(2);
    window.scrollTo(0, 0);
  };
  
  // Handle step 2 submission
  const onSubmitStep2 = (data: MandatoryDetailsFormValues) => {
    setFormData({ ...formData, ...data });
    setStep(3);
    window.scrollTo(0, 0);
  };
  
  // Handle step 3 submission
  const onSubmitStep3 = (data: OptionalDetailsFormValues) => {
    setFormData({ ...formData, ...data });
    setStep(4);
    window.scrollTo(0, 0);
  };
  
  // Handle step 4 submission (final)
  const onSubmitStep4 = async (data: MaintenancePrefsFormValues) => {
    const completeFormData = { ...formData, ...data } as CombinedFormData;
    setIsSubmitting(true);
    
    try {
      // Call API to create home
      await api.post('/api/homes', {
        name: completeFormData.name || `My ${completeFormData.home_type.replace('_', ' ')} Home`,
        home_type: completeFormData.home_type,
        location: `${completeFormData.address}, ${completeFormData.city}, ${completeFormData.state} ${completeFormData.zipCode}`,
        year_built: Number(completeFormData.year_built),
        square_footage: Number(completeFormData.square_footage),
        number_of_stories: Number(completeFormData.number_of_stories),
        roof_type: completeFormData.roof_type,
        hvac_type: completeFormData.hvac_type,
        exterior_material: completeFormData.exterior_material || undefined,
        foundation_type: completeFormData.foundation_type || undefined,
        windows: completeFormData.windows_count || completeFormData.windows_type || completeFormData.windows_year ? {
          count: completeFormData.windows_count ? Number(completeFormData.windows_count) : undefined,
          type: completeFormData.windows_type || undefined,
          year_installed: completeFormData.windows_year ? Number(completeFormData.windows_year) : undefined
        } : undefined,
        plumbing: completeFormData.plumbing_age || completeFormData.plumbing_material ? {
          age: completeFormData.plumbing_age ? Number(completeFormData.plumbing_age) : undefined,
          material: completeFormData.plumbing_material || undefined
        } : undefined,
        yard_garden: completeFormData.has_yard ? {
          exists: completeFormData.has_yard,
          size: completeFormData.yard_size || undefined,
          features: completeFormData.yard_features ? completeFormData.yard_features.split(',').map(f => f.trim()) : []
        } : undefined,
        garage: completeFormData.garage_type && completeFormData.garage_type !== 'none' ? {
          type: completeFormData.garage_type,
          size: completeFormData.garage_size || undefined
        } : undefined,
        recent_renovations: completeFormData.recent_renovations ? 
          [{
            type: completeFormData.recent_renovations,
            year: new Date().getFullYear()
          }] : undefined,
        occupancy: completeFormData.occupancy || undefined,
        appliances: completeFormData.appliances ? 
          completeFormData.appliances.split(',').map(a => ({
            name: a.trim(),
            age: 0
          })) : undefined,
        user_id: user?.id,
        maintenance_level: completeFormData.maintenance_level,
        reminder_frequency: completeFormData.reminder_frequency,
        notes: completeFormData.notes
      });
      
      // Show success toast
      toast({
        title: 'Home added successfully',
        description: 'Your additional home has been set up and is ready to be managed.',
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
  
  // Skip optional details
  const handleSkip = () => {
    // If on optional fields page, go to next page
    if (step === 3) {
      setStep(4);
      window.scrollTo(0, 0);
    }
  };
  
  // Set maintenance level
  const handleMaintenanceLevelChange = (value: string) => {
    setValueStep4('maintenance_level', value as 'minimal' | 'standard' | 'comprehensive');
  };
  
  // Set reminder frequency
  const handleReminderFrequencyChange = (value: string) => {
    setValueStep4('reminder_frequency', value as 'weekly' | 'biweekly' | 'monthly');
  };

  // Define home type options
  const homeTypes = [
    { value: "single_family", label: "Single Family Home" },
    { value: "apartment", label: "Apartment" },
    { value: "condo", label: "Condominium" },
    { value: "townhouse", label: "Townhouse" },
    { value: "mobile_home", label: "Mobile Home" },
    { value: "other", label: "Other" }
  ];
  
  // Define roof type options
  const roofTypes = [
    { value: 'asphalt_shingles', label: 'Asphalt Shingles' },
    { value: 'metal', label: 'Metal Roof' },
    { value: 'tile', label: 'Tile Roof' },
    { value: 'flat', label: 'Flat/Built-up Roof' },
    { value: 'slate', label: 'Slate Roof' },
    { value: 'wood_shingles', label: 'Wood Shingles' },
    { value: 'other', label: 'Other' },
  ];
  
  // Define HVAC type options
  const hvacTypes = [
    { value: 'central_hvac', label: 'Central HVAC' },
    { value: 'radiator', label: 'Radiator Heating' },
    { value: 'window_ac', label: 'Window AC Units' },
    { value: 'heat_pump', label: 'Heat Pump' },
    { value: 'ductless_mini_split', label: 'Ductless Mini-Split' },
    { value: 'boiler', label: 'Boiler System' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-softWhite">
      <div className="py-6 px-4 sm:px-6 lg:px-8 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-primary mr-2" />
            <span className="text-xl font-bold">HomeGuardian</span>
          </div>
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            Cancel
          </Button>
        </div>
      </div>
      
      <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">Add Another Home</h1>
            <p className="text-neutral/70">
              {step === 1 && "Let's get started with some basic information about your home"}
              {step === 2 && "Now, let's add some details about your home's specifications"}
              {step === 3 && "Let's add some optional details about your home"}
              {step === 4 && "Finally, let's set your maintenance preferences"}
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
                {step > 3 ? <CheckCircle className="h-5 w-5" /> : 3}
              </div>
              <div className={`flex-1 h-1 mx-2 ${step > 3 ? 'bg-primary' : 'bg-gray-200'}`}></div>
              <div className={`rounded-full h-10 w-10 flex items-center justify-center ${
                step >= 4 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                4
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
                  <Label htmlFor="home_type">Home Type</Label>
                  <Select 
                    onValueChange={(value) => {
                      setFormData({ ...formData, home_type: value as any });
                      setValueStep1('home_type', value as 'single_family' | 'apartment' | 'townhouse' | 'condo' | 'mobile_home' | 'other');
                    }}
                    defaultValue={formData.home_type}
                  >
                    <SelectTrigger className={errorsStep1.home_type ? 'border-red-500' : ''}>
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
                  {errorsStep1.home_type && (
                    <p className="text-red-500 text-sm">{errorsStep1.home_type.message}</p>
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
                
                <div className="flex justify-end pt-4">
                  <Button type="submit">
                    Next
                  </Button>
                </div>
              </form>
            )}
            
            {/* Step 2: Mandatory Home Details */}
            {step === 2 && (
              <form onSubmit={handleSubmitStep2(onSubmitStep2)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="year_built">Year Built</Label>
                  <div className="relative">
                    <Input
                      id="year_built"
                      placeholder="e.g. 1985"
                      {...registerStep2('year_built')}
                      className={errorsStep2.year_built ? 'border-red-500 pl-10' : 'pl-10'}
                    />
                    <Calendar className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral/50" />
                  </div>
                  {errorsStep2.year_built && (
                    <p className="text-red-500 text-sm">{errorsStep2.year_built.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="square_footage">Square Footage</Label>
                  <div className="relative">
                    <Input
                      id="square_footage"
                      placeholder="e.g. 2000"
                      {...registerStep2('square_footage')}
                      className={errorsStep2.square_footage ? 'border-red-500 pl-10' : 'pl-10'}
                    />
                    <Ruler className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral/50" />
                  </div>
                  {errorsStep2.square_footage && (
                    <p className="text-red-500 text-sm">{errorsStep2.square_footage.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="number_of_stories">Number of Stories</Label>
                  <div className="relative">
                    <Input
                      id="number_of_stories"
                      placeholder="e.g. 2"
                      {...registerStep2('number_of_stories')}
                      className={errorsStep2.number_of_stories ? 'border-red-500 pl-10' : 'pl-10'}
                    />
                    <Layers className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral/50" />
                  </div>
                  {errorsStep2.number_of_stories && (
                    <p className="text-red-500 text-sm">{errorsStep2.number_of_stories.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="roof_type">Roof Type</Label>
                  <Select
                    value={watchStep2('roof_type')}
                    onValueChange={(value) => setValueStep2('roof_type', value as 'asphalt_shingles' | 'metal' | 'tile' | 'flat' | 'slate' | 'wood_shingles' | 'other')}
                  >
                    <SelectTrigger className={errorsStep2.roof_type ? 'border-red-500' : ''}>
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
                  {errorsStep2.roof_type && (
                    <p className="text-red-500 text-sm">{errorsStep2.roof_type.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="hvac_type">HVAC System</Label>
                  <Select
                    value={watchStep2('hvac_type')}
                    onValueChange={(value) => setValueStep2('hvac_type', value as 'central_hvac' | 'radiator' | 'window_ac' | 'heat_pump' | 'ductless_mini_split' | 'boiler' | 'other')}
                  >
                    <SelectTrigger className={errorsStep2.hvac_type ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select HVAC type" />
                    </SelectTrigger>
                    <SelectContent>
                      {hvacTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errorsStep2.hvac_type && (
                    <p className="text-red-500 text-sm">{errorsStep2.hvac_type.message}</p>
                  )}
                </div>
                
                <div className="flex justify-between pt-4">
                  <Button type="button" variant="outline" onClick={handleBack}>
                    Back
                  </Button>
                  <Button type="submit">
                    Next
                  </Button>
                </div>
              </form>
            )}
            
            {/* Step 3: Optional Home Details */}
            {step === 3 && (
              <form onSubmit={handleSubmitStep3(onSubmitStep3)} className="space-y-6">
                <div className="space-y-4">
                  <Label>Exterior & Foundation</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="exterior_material">Exterior Material</Label>
                      <Select
                        value={watchStep3('exterior_material')}
                        onValueChange={(value) => setValueStep3('exterior_material', value as 'brick' | 'vinyl_siding' | 'wood' | 'stucco' | 'fiber_cement' | 'stone' | 'aluminum' | 'other' | undefined)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select exterior material" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="brick">Brick</SelectItem>
                          <SelectItem value="vinyl_siding">Vinyl Siding</SelectItem>
                          <SelectItem value="wood">Wood</SelectItem>
                          <SelectItem value="stucco">Stucco</SelectItem>
                          <SelectItem value="fiber_cement">Fiber Cement</SelectItem>
                          <SelectItem value="stone">Stone</SelectItem>
                          <SelectItem value="aluminum">Aluminum</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="foundation_type">Foundation Type</Label>
                      <Select
                        value={watchStep3('foundation_type')}
                        onValueChange={(value) => setValueStep3('foundation_type', value as 'slab' | 'crawlspace' | 'basement' | 'pier_and_beam' | 'other' | undefined)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select foundation type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="slab">Slab</SelectItem>
                          <SelectItem value="crawlspace">Crawlspace</SelectItem>
                          <SelectItem value="basement">Basement</SelectItem>
                          <SelectItem value="pier_and_beam">Pier and Beam</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <Label>Windows</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="windows_count">Number of Windows</Label>
                      <Input
                        id="windows_count"
                        placeholder="e.g. 12"
                        {...registerStep3('windows_count')}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="windows_type">Window Type</Label>
                      <Select
                        value={watchStep3('windows_type')}
                        onValueChange={(value) => setValueStep3('windows_type', value as 'single_pane' | 'double_pane' | 'triple_pane' | 'other' | undefined)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select window type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="single_pane">Single Pane</SelectItem>
                          <SelectItem value="double_pane">Double Pane</SelectItem>
                          <SelectItem value="triple_pane">Triple Pane</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="windows_year">Year Windows Installed</Label>
                      <Input
                        id="windows_year"
                        placeholder="e.g. 2010"
                        {...registerStep3('windows_year')}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <Label>Plumbing</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="plumbing_age">Plumbing Age (years)</Label>
                      <Input
                        id="plumbing_age"
                        placeholder="e.g. 15"
                        {...registerStep3('plumbing_age')}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="plumbing_material">Plumbing Material</Label>
                      <Select
                        value={watchStep3('plumbing_material')}
                        onValueChange={(value) => setValueStep3('plumbing_material', value as 'copper' | 'pvc' | 'pex' | 'galvanized' | 'cast_iron' | 'other' | undefined)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select plumbing material" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="copper">Copper</SelectItem>
                          <SelectItem value="pvc">PVC</SelectItem>
                          <SelectItem value="pex">PEX</SelectItem>
                          <SelectItem value="galvanized">Galvanized</SelectItem>
                          <SelectItem value="cast_iron">Cast Iron</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="has_yard" 
                      checked={watchStep3('has_yard')}
                      onCheckedChange={(checked) => {
                        setValueStep3('has_yard', checked === true);
                      }}
                    />
                    <Label htmlFor="has_yard">This home has a yard or garden</Label>
                  </div>
                  
                  {watchStep3('has_yard') && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6 mt-2">
                      <div>
                        <Label htmlFor="yard_size">Yard Size</Label>
                        <Select
                          value={watchStep3('yard_size')}
                          onValueChange={(value) => setValueStep3('yard_size', value as 'small' | 'medium' | 'large' | undefined)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select yard size" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="small">Small</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="large">Large</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="yard_features">Yard Features</Label>
                        <Input
                          id="yard_features"
                          placeholder="e.g., garden, pool, patio (comma separated)"
                          {...registerStep3('yard_features')}
                        />
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  <Label>Garage Information</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="garage_type">Garage Type</Label>
                      <Select
                        value={watchStep3('garage_type')}
                        onValueChange={(value) => setValueStep3('garage_type', value as 'attached' | 'detached' | 'none' | undefined)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select garage type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="attached">Attached</SelectItem>
                          <SelectItem value="detached">Detached</SelectItem>
                          <SelectItem value="none">None</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {watchStep3('garage_type') && watchStep3('garage_type') !== 'none' && (
                      <div>
                        <Label htmlFor="garage_size">Garage Size</Label>
                        <Select
                          value={watchStep3('garage_size')}
                          onValueChange={(value) => setValueStep3('garage_size', value as '1_car' | '2_car' | '3_car' | 'other' | undefined)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select garage size" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1_car">1 Car</SelectItem>
                            <SelectItem value="2_car">2 Car</SelectItem>
                            <SelectItem value="3_car">3 Car</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <Label>Recent Renovations</Label>
                  <Input
                    id="recent_renovations"
                    placeholder="e.g., kitchen remodel, bathroom update"
                    {...registerStep3('recent_renovations')}
                  />
                </div>
                
                <div className="space-y-4">
                  <Label htmlFor="occupancy">Occupancy</Label>
                  <Select
                    value={watchStep3('occupancy')}
                    onValueChange={(value) => setValueStep3('occupancy', value as 'primary_residence' | 'rental' | 'vacation_home' | 'other' | undefined)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select occupancy type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="primary_residence">Primary Residence</SelectItem>
                      <SelectItem value="rental">Rental Property</SelectItem>
                      <SelectItem value="vacation_home">Vacation Home</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-4">
                  <Label htmlFor="appliances">Appliances</Label>
                  <Input
                    id="appliances"
                    placeholder="e.g., refrigerator, dishwasher, washer (comma separated)"
                    {...registerStep3('appliances')}
                  />
                </div>
                
                <div className="flex justify-between mt-8">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                  >
                    Back
                  </Button>
                  <div className="space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleSkip}
                    >
                      Skip
                    </Button>
                    <Button
                      type="submit"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </form>
            )}
            
            {/* Step 4: Maintenance Preferences */}
            {step === 4 && (
              <form onSubmit={handleSubmitStep4(onSubmitStep4)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="maintenance_level">Maintenance Level</Label>
                  <Select
                    value={watchStep4('maintenance_level')}
                    onValueChange={(value) => handleMaintenanceLevelChange(value as 'minimal' | 'standard' | 'comprehensive')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select maintenance level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minimal">Minimal</SelectItem>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="comprehensive">Comprehensive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="reminder_frequency">Reminder Frequency</Label>
                  <Select
                    value={watchStep4('reminder_frequency')}
                    onValueChange={(value) => handleReminderFrequencyChange(value as 'weekly' | 'biweekly' | 'monthly')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select reminder frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="biweekly">Biweekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Enter any additional notes"
                    {...registerStep4('notes')}
                  />
                </div>
                
                <div className="flex justify-between mt-8">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddHome;
