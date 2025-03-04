import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Home as HomeIcon } from "lucide-react";
import api from "@/lib/axios";

const AddHome = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Form state
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [yearBuilt, setYearBuilt] = useState("");
  const [squareFeet, setSquareFeet] = useState("");
  const [roofType, setRoofType] = useState("");
  const [hvacType, setHvacType] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Current year for validation
  const currentYear = new Date().getFullYear();
  
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
    if (!name || !address || !yearBuilt || !squareFeet || !roofType || !hvacType) {
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
    
    setLoading(true);
    
    try {
      // Prepare home data
      const homeData = {
        name,
        location: address,
        year_built: yearBuiltNum,
        square_footage: squareFeetNum,
        roof_type: roofType,
        hvac_type: hvacType
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
            <div>
              <Label htmlFor="name">Home Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Main Residence, Vacation Home"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Full address of your home"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="yearBuilt">Year Built</Label>
                <Input
                  id="yearBuilt"
                  type="number"
                  min="1800"
                  max={currentYear}
                  value={yearBuilt}
                  onChange={(e) => setYearBuilt(e.target.value)}
                  placeholder={`e.g., ${currentYear - 20}`}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="squareFeet">Square Feet</Label>
                <Input
                  id="squareFeet"
                  type="number"
                  min="1"
                  value={squareFeet}
                  onChange={(e) => setSquareFeet(e.target.value)}
                  placeholder="e.g., 2000"
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