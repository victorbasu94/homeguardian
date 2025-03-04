import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, Home as HomeIcon, MapPin, Calendar, Ruler } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/axios";

const AddHome = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
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
  const [loading, setLoading] = useState(false);
  
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
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!name || !type || !address || !city || !state || !zipCode || !yearBuilt || !squareFeet || 
        !bedrooms || !bathrooms || !roofType || !hvacType || !maintenanceLevel || !reminderFrequency) {
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
        user_id: user?.id
      };
      
      // Send request to API
      await api.post("/api/homes", homeData);
      
      // Show success message
      toast({
        title: "Home added",
        description: "Your home has been successfully added.",
      });
      
      // Navigate back to dashboard
      navigate("/dashboard");
    } catch (error) {
      console.error("Error adding home:", error);
      
      toast({
        title: "Error",
        description: "Failed to add your home. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container py-8 max-w-3xl">
      <Button 
        variant="ghost" 
        className="mb-6 flex items-center text-muted-foreground hover:text-foreground"
        onClick={() => navigate("/dashboard")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>
      
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              {loading ? "Adding Home..." : "Add Home"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddHome; 