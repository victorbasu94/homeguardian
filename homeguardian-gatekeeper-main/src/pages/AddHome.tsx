import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Home as HomeIcon, MapPin, Calendar, Ruler, Thermometer, Droplets, Construction, Layers, Warehouse, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/axios";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMaintenance } from "@/contexts/MaintenanceContext";

interface AddHomeProps {
  isEditing?: boolean;
}

// Function to generate maintenance plan using OpenAI API
const generateMaintenancePlan = async (homeData: any) => {
  try {
    const response = await api.post('/api/tasks/generate-plan', homeData);
    return response.data;
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    throw error;
  }
};

const AddHome = ({ isEditing = false }: AddHomeProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { homeId } = useParams<{ homeId: string }>();
  const { setMaintenanceTasks, setIsLoading, setError } = useMaintenance();
  
  // Form state
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [yearBuilt, setYearBuilt] = useState("");
  const [squareFeet, setSquareFeet] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [roofType, setRoofType] = useState("");
  const [hvacType, setHvacType] = useState("");
  const [maintenanceLevel, setMaintenanceLevel] = useState("");
  const [reminderFrequency, setReminderFrequency] = useState("");
  const [notes, setNotes] = useState("");
  
  // New form state variables
  const [numberOfStories, setNumberOfStories] = useState("");
  const [exteriorMaterial, setExteriorMaterial] = useState("");
  const [foundationType, setFoundationType] = useState("");
  const [basementType, setBasementType] = useState("");
  const [atticType, setAtticType] = useState("");
  const [windowsCount, setWindowsCount] = useState("");
  const [windowType, setWindowType] = useState("");
  const [plumbingType, setPlumbingType] = useState("");
  const [plumbingAge, setPlumbingAge] = useState("");
  const [electricalPanelAge, setElectricalPanelAge] = useState("");
  const [electricalPanelType, setElectricalPanelType] = useState("");
  const [hasGarage, setHasGarage] = useState(false);
  const [garageType, setGarageType] = useState("");
  const [hasPool, setHasPool] = useState(false);
  const [poolType, setPoolType] = useState("");
  const [hasSolarPanels, setHasSolarPanels] = useState(false);
  const [solarPanelType, setSolarPanelType] = useState("");
  const [hasBackupGenerator, setHasBackupGenerator] = useState(false);
  const [generatorType, setGeneratorType] = useState("");
  const [hasIrrigationSystem, setHasIrrigationSystem] = useState(false);
  const [irrigationType, setIrrigationType] = useState("");
  const [hasSecuritySystem, setHasSecuritySystem] = useState(false);
  const [securitySystemType, setSecuritySystemType] = useState("");
  const [hasSmartHomeDevices, setHasSmartHomeDevices] = useState(false);
  const [smartHomeDeviceTypes, setSmartHomeDeviceTypes] = useState<string[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [fetchingHome, setFetchingHome] = useState(false);
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);
  
  // Fetch home data if editing
  useEffect(() => {
    if (isEditing && homeId) {
      const fetchHomeData = async () => {
        setFetchingHome(true);
        try {
          const response = await api.get(`/api/homes/${homeId}`);
          const homeData = response.data;
          
          // Parse location into components
          const locationParts = homeData.location?.split(', ') || [];
          const addressParts = locationParts[0] || '';
          const cityPart = locationParts[1] || '';
          const stateZipParts = locationParts[2]?.split(' ') || [];
          const statePart = stateZipParts[0] || '';
          const zipPart = stateZipParts[1] || '';
          
          // Set form values
          setName(homeData.name || '');
          setType(homeData.type || '');
          setAddress(addressParts);
          setCity(cityPart);
          setState(statePart);
          setZipCode(zipPart);
          setYearBuilt(homeData.year_built?.toString() || '');
          setSquareFeet(homeData.square_footage?.toString() || '');
          setBedrooms(homeData.bedrooms?.toString() || '');
          setBathrooms(homeData.bathrooms?.toString() || '');
          setRoofType(homeData.roof_type || '');
          setHvacType(homeData.hvac_type || '');
          setMaintenanceLevel(homeData.maintenance_level || '');
          setReminderFrequency(homeData.reminder_frequency || '');
          setNotes(homeData.notes || '');
          
          // Set new form state variables
          setNumberOfStories(homeData.number_of_stories || '');
          setExteriorMaterial(homeData.exterior_material || '');
          setFoundationType(homeData.foundation_type || '');
          setBasementType(homeData.basement_type || '');
          setAtticType(homeData.attic_type || '');
          setWindowsCount(homeData.windows_count || '');
          setWindowType(homeData.window_type || '');
          setPlumbingType(homeData.plumbing_type || '');
          setPlumbingAge(homeData.plumbing_age || '');
          setElectricalPanelAge(homeData.electrical_panel_age || '');
          setElectricalPanelType(homeData.electrical_panel_type || '');
          setHasGarage(homeData.has_garage || false);
          setGarageType(homeData.garage_type || '');
          setHasPool(homeData.has_pool || false);
          setPoolType(homeData.pool_type || '');
          setHasSolarPanels(homeData.has_solar_panels || false);
          setSolarPanelType(homeData.solar_panel_type || '');
          setHasBackupGenerator(homeData.has_backup_generator || false);
          setGeneratorType(homeData.generator_type || '');
          setHasIrrigationSystem(homeData.has_irrigation_system || false);
          setIrrigationType(homeData.irrigation_type || '');
          setHasSecuritySystem(homeData.has_security_system || false);
          setSecuritySystemType(homeData.security_system_type || '');
          setHasSmartHomeDevices(homeData.has_smart_home_devices || false);
          setSmartHomeDeviceTypes(homeData.smart_home_device_types || []);
        } catch (error) {
          console.error("Error fetching home data:", error);
          toast({
            title: "Error",
            description: "Failed to load home data. Please try again.",
            variant: "destructive",
          });
          navigate("/dashboard");
        } finally {
          setFetchingHome(false);
        }
      };
      
      fetchHomeData();
    }
  }, [isEditing, homeId, navigate, toast]);
  
  // Current year for validation
  const currentYear = new Date().getFullYear();
  
  // Home type options
  const homeTypes = [
    { value: "house", label: "House" },
    { value: "apartment", label: "Apartment" },
    { value: "condo", label: "Condo" },
    { value: "townhouse", label: "Townhouse" },
    { value: "other", label: "Other" }
  ];
  
  // Roof type options
  const roofTypes = [
    { value: "asphalt", label: "Asphalt Shingles" },
    { value: "metal", label: "Metal Roof" },
    { value: "tile", label: "Tile Roof" },
    { value: "slate", label: "Slate Roof" },
    { value: "wood", label: "Wood Shingles" },
    { value: "flat", label: "Flat/Built-up Roof" }
  ];
  
  // HVAC type options
  const hvacTypes = [
    { value: "central", label: "Central Air" },
    { value: "window", label: "Window Units" },
    { value: "split", label: "Split System" },
    { value: "heat_pump", label: "Heat Pump" },
    { value: "radiant", label: "Radiant Heating" },
    { value: "geothermal", label: "Geothermal" }
  ];
  
  // New option arrays
  const exteriorMaterialTypes = [
    { value: "vinyl", label: "Vinyl Siding" },
    { value: "wood", label: "Wood Siding" },
    { value: "brick", label: "Brick" },
    { value: "stucco", label: "Stucco" },
    { value: "fiber_cement", label: "Fiber Cement" },
    { value: "stone", label: "Stone" },
    { value: "aluminum", label: "Aluminum Siding" },
    { value: "other", label: "Other" }
  ];
  
  const foundationTypes = [
    { value: "concrete_slab", label: "Concrete Slab" },
    { value: "crawl_space", label: "Crawl Space" },
    { value: "basement", label: "Full Basement" },
    { value: "pier_beam", label: "Pier and Beam" },
    { value: "other", label: "Other" }
  ];
  
  const basementTypes = [
    { value: "none", label: "No Basement" },
    { value: "unfinished", label: "Unfinished" },
    { value: "finished", label: "Finished" },
    { value: "partially_finished", label: "Partially Finished" },
    { value: "walkout", label: "Walkout" }
  ];
  
  const atticTypes = [
    { value: "none", label: "No Attic" },
    { value: "unfinished", label: "Unfinished" },
    { value: "finished", label: "Finished" },
    { value: "partially_finished", label: "Partially Finished" }
  ];
  
  const windowTypes = [
    { value: "single_pane", label: "Single Pane" },
    { value: "double_pane", label: "Double Pane" },
    { value: "triple_pane", label: "Triple Pane" },
    { value: "low_e", label: "Low-E Glass" },
    { value: "mixed", label: "Mixed Types" }
  ];
  
  const plumbingTypes = [
    { value: "copper", label: "Copper" },
    { value: "pex", label: "PEX" },
    { value: "galvanized", label: "Galvanized" },
    { value: "pvc", label: "PVC/CPVC" },
    { value: "mixed", label: "Mixed Types" }
  ];
  
  const electricalPanelTypes = [
    { value: "circuit_breaker", label: "Circuit Breaker" },
    { value: "fuse_box", label: "Fuse Box" },
    { value: "smart_panel", label: "Smart Panel" }
  ];
  
  const garageTypes = [
    { value: "attached", label: "Attached" },
    { value: "detached", label: "Detached" },
    { value: "carport", label: "Carport" },
    { value: "none", label: "None" }
  ];
  
  const poolTypes = [
    { value: "inground", label: "In-ground" },
    { value: "above_ground", label: "Above Ground" },
    { value: "hot_tub", label: "Hot Tub/Spa" },
    { value: "none", label: "None" }
  ];
  
  const solarPanelTypes = [
    { value: "roof_mounted", label: "Roof Mounted" },
    { value: "ground_mounted", label: "Ground Mounted" },
    { value: "none", label: "None" }
  ];
  
  const generatorTypes = [
    { value: "standby", label: "Standby (Permanent)" },
    { value: "portable", label: "Portable" },
    { value: "none", label: "None" }
  ];
  
  const irrigationTypes = [
    { value: "in_ground", label: "In-ground Sprinkler System" },
    { value: "drip", label: "Drip Irrigation" },
    { value: "manual", label: "Manual/Hose-based" },
    { value: "none", label: "None" }
  ];
  
  const securitySystemTypes = [
    { value: "monitored", label: "Professionally Monitored" },
    { value: "self_monitored", label: "Self-Monitored" },
    { value: "local_alarm", label: "Local Alarm Only" },
    { value: "none", label: "None" }
  ];
  
  const smartHomeDeviceOptions = [
    { value: "thermostat", label: "Smart Thermostat" },
    { value: "doorbell", label: "Smart Doorbell" },
    { value: "locks", label: "Smart Locks" },
    { value: "lighting", label: "Smart Lighting" },
    { value: "speakers", label: "Smart Speakers/Assistants" },
    { value: "appliances", label: "Smart Appliances" },
    { value: "cameras", label: "Security Cameras" },
    { value: "water_sensors", label: "Water Leak Sensors" },
    { value: "smoke_detectors", label: "Smart Smoke/CO Detectors" }
  ];
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form - mandatory fields
    if (!name || !type || !address || !city || !state || !zipCode || !yearBuilt || !squareFeet || 
        !bedrooms || !bathrooms || !roofType || !hvacType || !numberOfStories || !maintenanceLevel || !reminderFrequency) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    // Validate year built
    const yearBuiltNum = parseInt(yearBuilt);
    if (isNaN(yearBuiltNum) || yearBuiltNum < 1800 || yearBuiltNum > currentYear) {
      toast({
        title: "Invalid year",
        description: `Year built must be between 1800 and ${currentYear}.`,
        variant: "destructive",
      });
      return;
    }
    
    // Validate square feet
    const squareFeetNum = parseInt(squareFeet);
    if (isNaN(squareFeetNum) || squareFeetNum <= 0) {
      toast({
        title: "Invalid square footage",
        description: "Square footage must be a positive number.",
        variant: "destructive",
      });
      return;
    }
    
    // Validate bedrooms and bathrooms
    const bedroomsNum = parseInt(bedrooms);
    const bathroomsNum = parseInt(bathrooms);
    if (isNaN(bedroomsNum) || bedroomsNum < 0 || isNaN(bathroomsNum) || bathroomsNum < 0) {
      toast({
        title: "Invalid rooms",
        description: "Bedrooms and bathrooms must be valid numbers.",
        variant: "destructive",
      });
      return;
    }
    
    // Validate number of stories
    const numberOfStoriesNum = parseInt(numberOfStories);
    if (isNaN(numberOfStoriesNum) || numberOfStoriesNum <= 0) {
      toast({
        title: "Invalid number of stories",
        description: "Number of stories must be a positive number.",
        variant: "destructive",
      });
      return;
    }
    
    // Validate windows count if provided
    if (windowsCount) {
      const windowsCountNum = parseInt(windowsCount);
      if (isNaN(windowsCountNum) || windowsCountNum < 0) {
        toast({
          title: "Invalid windows count",
          description: "Windows count must be a valid number.",
          variant: "destructive",
        });
        return;
      }
    }
    
    // Validate plumbing age if provided
    if (plumbingAge) {
      const plumbingAgeNum = parseInt(plumbingAge);
      if (isNaN(plumbingAgeNum) || plumbingAgeNum < 0 || plumbingAgeNum > 150) {
        toast({
          title: "Invalid plumbing age",
          description: "Plumbing age must be between 0 and 150 years.",
          variant: "destructive",
        });
        return;
      }
    }
    
    // Validate electrical panel age if provided
    if (electricalPanelAge) {
      const electricalPanelAgeNum = parseInt(electricalPanelAge);
      if (isNaN(electricalPanelAgeNum) || electricalPanelAgeNum < 0 || electricalPanelAgeNum > 150) {
        toast({
          title: "Invalid electrical panel age",
          description: "Electrical panel age must be between 0 and 150 years.",
          variant: "destructive",
        });
        return;
      }
    }
    
    setLoading(true);
    
    try {
      // Prepare home data
      const homeData = {
        name,
        type,
        location: `${address}, ${city}, ${state} ${zipCode}`,
        year_built: yearBuiltNum,
        square_footage: squareFeetNum,
        bedrooms: bedroomsNum,
        bathrooms: bathroomsNum,
        roof_type: roofType,
        hvac_type: hvacType,
        maintenance_level: maintenanceLevel,
        reminder_frequency: reminderFrequency,
        notes,
        user_id: user?.id,
        number_of_stories: numberOfStoriesNum,
        exterior_material: exteriorMaterial,
        foundation_type: foundationType,
        basement_type: basementType,
        attic_type: atticType,
        windows_count: windowsCount,
        window_type: windowType,
        plumbing_type: plumbingType,
        plumbing_age: plumbingAge,
        electrical_panel_age: electricalPanelAge,
        electrical_panel_type: electricalPanelType,
        has_garage: hasGarage,
        garage_type: garageType,
        has_pool: hasPool,
        pool_type: poolType,
        has_solar_panels: hasSolarPanels,
        solar_panel_type: solarPanelType,
        has_backup_generator: hasBackupGenerator,
        generator_type: generatorType,
        has_irrigation_system: hasIrrigationSystem,
        irrigation_type: irrigationType,
        has_security_system: hasSecuritySystem,
        security_system_type: securitySystemType,
        has_smart_home_devices: hasSmartHomeDevices,
        smart_home_device_types: smartHomeDeviceTypes
      };
      
      if (isEditing && homeId) {
        // Update existing home
        await api.put(`/api/homes/${homeId}`, homeData);
        
        // Show success message
        toast({
          title: "Home updated",
          description: "Your home has been successfully updated.",
        });
      } else {
        // Create new home
        await api.post("/api/homes", homeData);
        
        // Show success message
        toast({
          title: "Home added",
          description: "Your home has been successfully added.",
        });
      }
      
      // Generate maintenance plan using OpenAI
      setGeneratingPlan(true);
      setPlanError(null);
      setIsLoading(true); // Set loading state in context
      
      try {
        // Call the OpenAI service with the home data
        const plan = await generateMaintenancePlan({
          name,
          type,
          address,
          city,
          state,
          zipCode,
          yearBuilt,
          squareFeet,
          bedrooms,
          bathrooms,
          roofType,
          hvacType,
          numberOfStories,
          exteriorMaterial,
          foundationType,
          hasPool,
          poolType,
          hasSolarPanels,
          hasGarage
        });
        
        if (plan && plan.maintenancePlan && Array.isArray(plan.maintenancePlan)) {
          setMaintenanceTasks(plan.maintenancePlan); // Store tasks in context
          // Navigate to dashboard after successful plan generation
          navigate("/dashboard");
        } else {
          throw new Error('Invalid maintenance plan format');
        }
      } catch (error) {
        console.error('Error generating maintenance plan:', error);
        setPlanError('Failed to generate maintenance plan. Please try again later.');
        setError('Failed to generate maintenance plan. Please try again later.'); // Set error in context
        
        // Still navigate to dashboard after a delay
        setTimeout(() => {
          navigate("/dashboard");
        }, 3000);
      } finally {
        setGeneratingPlan(false);
        setIsLoading(false); // Clear loading state in context
      }
      
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'adding'} home:`, error);
      
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? 'update' : 'add'} your home. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-softWhite">
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <Button variant="ghost" onClick={() => navigate(-1)} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <h1 className="text-2xl font-bold">{isEditing ? 'Edit Home' : 'Add New Home'}</h1>
            <div className="w-[73px]"></div> {/* Spacer for centering */}
          </div>
          
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <HomeIcon className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Add a New Home</h1>
                <p className="text-muted-foreground mt-1">
                  Enter your home details to start tracking maintenance
                </p>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="bg-white p-6 rounded-lg border border-border shadow-sm">
                  <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Home Name</Label>
                      <div className="relative">
                        <Input
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g., Main Residence, Vacation Home"
                          className="pl-10"
                          required
                        />
                        <HomeIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral/50" />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="type">Home Type</Label>
                      <Select value={type} onValueChange={setType} required>
                        <SelectTrigger id="type">
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
                    </div>
                    
                    <div>
                      <Label htmlFor="address">Street Address</Label>
                      <div className="relative">
                        <Input
                          id="address"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="123 Main St"
                          className="pl-10"
                          required
                        />
                        <MapPin className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral/50" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="City"
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          placeholder="State"
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="zipCode">ZIP Code</Label>
                        <Input
                          id="zipCode"
                          value={zipCode}
                          onChange={(e) => setZipCode(e.target.value)}
                          placeholder="ZIP Code"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-lg border border-border shadow-sm">
                  <h2 className="text-xl font-semibold mb-4">Home Details</h2>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="yearBuilt">Year Built</Label>
                        <div className="relative">
                          <Input
                            id="yearBuilt"
                            type="number"
                            min="1800"
                            max={currentYear}
                            value={yearBuilt}
                            onChange={(e) => setYearBuilt(e.target.value)}
                            placeholder={`e.g., ${currentYear - 20}`}
                            className="pl-10"
                            required
                          />
                          <Calendar className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral/50" />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="squareFeet">Square Footage</Label>
                        <div className="relative">
                          <Input
                            id="squareFeet"
                            type="number"
                            min="1"
                            value={squareFeet}
                            onChange={(e) => setSquareFeet(e.target.value)}
                            placeholder="e.g., 2000"
                            className="pl-10"
                            required
                          />
                          <Ruler className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral/50" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="bedrooms">Bedrooms</Label>
                        <Input
                          id="bedrooms"
                          type="number"
                          min="0"
                          value={bedrooms}
                          onChange={(e) => setBedrooms(e.target.value)}
                          placeholder="e.g., 3"
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="bathrooms">Bathrooms</Label>
                        <Input
                          id="bathrooms"
                          type="number"
                          min="0"
                          step="0.5"
                          value={bathrooms}
                          onChange={(e) => setBathrooms(e.target.value)}
                          placeholder="e.g., 2"
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="numberOfStories">Number of Stories</Label>
                        <Input
                          id="numberOfStories"
                          type="number"
                          min="1"
                          value={numberOfStories}
                          onChange={(e) => setNumberOfStories(e.target.value)}
                          placeholder="e.g., 2"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="roofType">Roof Type</Label>
                        <Select value={roofType} onValueChange={setRoofType} required>
                          <SelectTrigger id="roofType">
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
                      </div>
                      
                      <div>
                        <Label htmlFor="hvacType">HVAC System</Label>
                        <Select value={hvacType} onValueChange={setHvacType} required>
                          <SelectTrigger id="hvacType">
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
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-lg border border-border shadow-sm">
                  <h2 className="text-xl font-semibold mb-4">Additional Home Details</h2>
                  <p className="text-sm text-muted-foreground mb-4">These details help us provide more accurate maintenance recommendations.</p>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-3">Structure & Exterior</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="exteriorMaterial">Exterior Material</Label>
                          <Select value={exteriorMaterial} onValueChange={setExteriorMaterial}>
                            <SelectTrigger id="exteriorMaterial">
                              <SelectValue placeholder="Select exterior material" />
                            </SelectTrigger>
                            <SelectContent>
                              {exteriorMaterialTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label htmlFor="foundationType">Foundation Type</Label>
                          <Select value={foundationType} onValueChange={setFoundationType}>
                            <SelectTrigger id="foundationType">
                              <SelectValue placeholder="Select foundation type" />
                            </SelectTrigger>
                            <SelectContent>
                              {foundationTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-3">Interior Features</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="basementType">Basement Type</Label>
                          <Select value={basementType} onValueChange={setBasementType}>
                            <SelectTrigger id="basementType">
                              <SelectValue placeholder="Select basement type" />
                            </SelectTrigger>
                            <SelectContent>
                              {basementTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label htmlFor="atticType">Attic Type</Label>
                          <Select value={atticType} onValueChange={setAtticType}>
                            <SelectTrigger id="atticType">
                              <SelectValue placeholder="Select attic type" />
                            </SelectTrigger>
                            <SelectContent>
                              {atticTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-3">Windows & Doors</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="windowsCount">Number of Windows</Label>
                          <Input
                            id="windowsCount"
                            type="number"
                            min="0"
                            value={windowsCount}
                            onChange={(e) => setWindowsCount(e.target.value)}
                            placeholder="e.g., 12"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="windowType">Window Type</Label>
                          <Select value={windowType} onValueChange={setWindowType}>
                            <SelectTrigger id="windowType">
                              <SelectValue placeholder="Select window type" />
                            </SelectTrigger>
                            <SelectContent>
                              {windowTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-3">Plumbing & Electrical</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="plumbingType">Plumbing Type</Label>
                          <Select value={plumbingType} onValueChange={setPlumbingType}>
                            <SelectTrigger id="plumbingType">
                              <SelectValue placeholder="Select plumbing type" />
                            </SelectTrigger>
                            <SelectContent>
                              {plumbingTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label htmlFor="plumbingAge">Plumbing Age (years)</Label>
                          <Input
                            id="plumbingAge"
                            type="number"
                            min="0"
                            max="150"
                            value={plumbingAge}
                            onChange={(e) => setPlumbingAge(e.target.value)}
                            placeholder="e.g., 15"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                          <Label htmlFor="electricalPanelType">Electrical Panel Type</Label>
                          <Select value={electricalPanelType} onValueChange={setElectricalPanelType}>
                            <SelectTrigger id="electricalPanelType">
                              <SelectValue placeholder="Select panel type" />
                            </SelectTrigger>
                            <SelectContent>
                              {electricalPanelTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label htmlFor="electricalPanelAge">Electrical Panel Age (years)</Label>
                          <Input
                            id="electricalPanelAge"
                            type="number"
                            min="0"
                            max="150"
                            value={electricalPanelAge}
                            onChange={(e) => setElectricalPanelAge(e.target.value)}
                            placeholder="e.g., 10"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-3">Additional Features</h3>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="hasGarage">Garage</Label>
                            <p className="text-sm text-muted-foreground">Does your home have a garage?</p>
                          </div>
                          <Switch
                            id="hasGarage"
                            checked={hasGarage}
                            onCheckedChange={setHasGarage}
                          />
                        </div>
                        
                        {hasGarage && (
                          <div>
                            <Label htmlFor="garageType">Garage Type</Label>
                            <Select value={garageType} onValueChange={setGarageType}>
                              <SelectTrigger id="garageType">
                                <SelectValue placeholder="Select garage type" />
                              </SelectTrigger>
                              <SelectContent>
                                {garageTypes.map((type) => (
                                  <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="hasPool">Pool or Hot Tub</Label>
                            <p className="text-sm text-muted-foreground">Does your home have a pool or hot tub?</p>
                          </div>
                          <Switch
                            id="hasPool"
                            checked={hasPool}
                            onCheckedChange={setHasPool}
                          />
                        </div>
                        
                        {hasPool && (
                          <div>
                            <Label htmlFor="poolType">Pool Type</Label>
                            <Select value={poolType} onValueChange={setPoolType}>
                              <SelectTrigger id="poolType">
                                <SelectValue placeholder="Select pool type" />
                              </SelectTrigger>
                              <SelectContent>
                                {poolTypes.map((type) => (
                                  <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="hasSolarPanels">Solar Panels</Label>
                            <p className="text-sm text-muted-foreground">Does your home have solar panels?</p>
                          </div>
                          <Switch
                            id="hasSolarPanels"
                            checked={hasSolarPanels}
                            onCheckedChange={setHasSolarPanels}
                          />
                        </div>
                        
                        {hasSolarPanels && (
                          <div>
                            <Label htmlFor="solarPanelType">Solar Panel Type</Label>
                            <Select value={solarPanelType} onValueChange={setSolarPanelType}>
                              <SelectTrigger id="solarPanelType">
                                <SelectValue placeholder="Select solar panel type" />
                              </SelectTrigger>
                              <SelectContent>
                                {solarPanelTypes.map((type) => (
                                  <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="hasBackupGenerator">Backup Generator</Label>
                            <p className="text-sm text-muted-foreground">Does your home have a backup generator?</p>
                          </div>
                          <Switch
                            id="hasBackupGenerator"
                            checked={hasBackupGenerator}
                            onCheckedChange={setHasBackupGenerator}
                          />
                        </div>
                        
                        {hasBackupGenerator && (
                          <div>
                            <Label htmlFor="generatorType">Generator Type</Label>
                            <Select value={generatorType} onValueChange={setGeneratorType}>
                              <SelectTrigger id="generatorType">
                                <SelectValue placeholder="Select generator type" />
                              </SelectTrigger>
                              <SelectContent>
                                {generatorTypes.map((type) => (
                                  <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="hasIrrigationSystem">Irrigation System</Label>
                            <p className="text-sm text-muted-foreground">Does your home have an irrigation system?</p>
                          </div>
                          <Switch
                            id="hasIrrigationSystem"
                            checked={hasIrrigationSystem}
                            onCheckedChange={setHasIrrigationSystem}
                          />
                        </div>
                        
                        {hasIrrigationSystem && (
                          <div>
                            <Label htmlFor="irrigationType">Irrigation Type</Label>
                            <Select value={irrigationType} onValueChange={setIrrigationType}>
                              <SelectTrigger id="irrigationType">
                                <SelectValue placeholder="Select irrigation type" />
                              </SelectTrigger>
                              <SelectContent>
                                {irrigationTypes.map((type) => (
                                  <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="hasSecuritySystem">Security System</Label>
                            <p className="text-sm text-muted-foreground">Does your home have a security system?</p>
                          </div>
                          <Switch
                            id="hasSecuritySystem"
                            checked={hasSecuritySystem}
                            onCheckedChange={setHasSecuritySystem}
                          />
                        </div>
                        
                        {hasSecuritySystem && (
                          <div>
                            <Label htmlFor="securitySystemType">Security System Type</Label>
                            <Select value={securitySystemType} onValueChange={setSecuritySystemType}>
                              <SelectTrigger id="securitySystemType">
                                <SelectValue placeholder="Select security system type" />
                              </SelectTrigger>
                              <SelectContent>
                                {securitySystemTypes.map((type) => (
                                  <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="hasSmartHomeDevices">Smart Home Devices</Label>
                            <p className="text-sm text-muted-foreground">Does your home have smart home devices?</p>
                          </div>
                          <Switch
                            id="hasSmartHomeDevices"
                            checked={hasSmartHomeDevices}
                            onCheckedChange={setHasSmartHomeDevices}
                          />
                        </div>
                        
                        {hasSmartHomeDevices && (
                          <div className="space-y-2">
                            <Label>Smart Home Device Types</Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {smartHomeDeviceOptions.map((option) => (
                                <div key={option.value} className="flex items-center space-x-2">
                                  <Checkbox 
                                    id={`smart-${option.value}`}
                                    checked={smartHomeDeviceTypes.includes(option.value)}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        setSmartHomeDeviceTypes([...smartHomeDeviceTypes, option.value]);
                                      } else {
                                        setSmartHomeDeviceTypes(
                                          smartHomeDeviceTypes.filter((value) => value !== option.value)
                                        );
                                      }
                                    }}
                                  />
                                  <Label 
                                    htmlFor={`smart-${option.value}`}
                                    className="text-sm cursor-pointer"
                                  >
                                    {option.label}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-lg border border-border shadow-sm">
                  <h2 className="text-xl font-semibold mb-4">Maintenance Preferences</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <Label className="mb-2 block">Maintenance Level</Label>
                      <RadioGroup 
                        value={maintenanceLevel} 
                        onValueChange={setMaintenanceLevel}
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
                    </div>
                    
                    <div>
                      <Label className="mb-2 block">Reminder Frequency</Label>
                      <RadioGroup 
                        value={reminderFrequency} 
                        onValueChange={setReminderFrequency}
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
                    </div>
                    
                    <div>
                      <Label htmlFor="notes">Additional Notes (Optional)</Label>
                      <Textarea
                        id="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Any special considerations or notes about your home..."
                        className="min-h-[100px]"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate("/dashboard")}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (isEditing ? "Updating Home..." : "Adding Home...") : (isEditing ? "Update Home" : "Add Home")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddHome; 