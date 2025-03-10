import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/axios";
import { HomeData } from "@/components/dashboard/HomeCard";

const AddTask = () => {
  const { homeId } = useParams<{ homeId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Form state
  const [taskName, setTaskName] = useState("");
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [why, setWhy] = useState("");
  const [estimatedCost, setEstimatedCost] = useState("");
  
  // Loading states
  const [loading, setLoading] = useState(false);
  const [loadingHome, setLoadingHome] = useState(true);
  const [home, setHome] = useState<HomeData | null>(null);
  
  // Fetch home details
  useEffect(() => {
    const fetchHome = async () => {
      try {
        setLoadingHome(true);
        const response = await api.get(`/homes/${homeId}`);
        setHome(response.data);
      } catch (error) {
        console.error("Error fetching home:", error);
        toast({
          title: "Error",
          description: "Failed to load home details. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoadingHome(false);
      }
    };
    
    if (homeId) {
      fetchHome();
    }
  }, [homeId, toast]);
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!taskName || !dueDate || !why) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setLoading(true);
      
      const taskData = {
        task_name: taskName,
        due_date: format(dueDate, "yyyy-MM-dd"),
        why,
        estimated_cost: estimatedCost ? parseFloat(estimatedCost) : undefined,
        home_id: homeId,
      };
      
      await api.post("/tasks", taskData);
      
      toast({
        title: "Task created",
        description: "Your maintenance task has been successfully created.",
      });
      
      // Navigate back to the dashboard
      navigate(`/dashboard`);
    } catch (error) {
      console.error("Error creating task:", error);
      toast({
        title: "Error",
        description: "Failed to create the task. Please try again.",
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
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add Maintenance Task</h1>
          {home && (
            <p className="text-muted-foreground mt-1">
              For {home.name} • {home.location}
            </p>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="taskName">Task Name</Label>
              <Input
                id="taskName"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                placeholder="e.g., Replace HVAC Filter"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "PPP") : "Select a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              <Label htmlFor="why">Why It's Important</Label>
              <Textarea
                id="why"
                value={why}
                onChange={(e) => setWhy(e.target.value)}
                placeholder="Explain why this maintenance task is important..."
                className="min-h-[120px]"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="estimatedCost">Estimated Cost (Optional)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="estimatedCost"
                  type="number"
                  min="0"
                  step="0.01"
                  value={estimatedCost}
                  onChange={(e) => setEstimatedCost(e.target.value)}
                  placeholder="0.00"
                  className="pl-8"
                />
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
              {loading ? "Creating..." : "Create Task"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTask; 