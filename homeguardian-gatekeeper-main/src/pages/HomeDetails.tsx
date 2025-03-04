import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeft, 
  Home as HomeIcon, 
  Calendar, 
  SquareIcon, 
  Fan, 
  Construction, 
  PlusCircle,
  Pencil,
  Trash2
} from "lucide-react";
import { format } from "date-fns";
import api from "@/lib/axios";
import { HomeData } from "@/components/dashboard/HomeCard";
import { TaskData } from "@/components/dashboard/TaskCard";
import TaskCard from "@/components/dashboard/TaskCard";
import TaskModal from "@/components/dashboard/TaskModal";

// Extend HomeData interface to include the properties we need
interface ExtendedHomeData extends HomeData {
  roof_type: string;
  hvac_type: string;
  year_built: number;
  square_feet: number;
}

const HomeDetails = () => {
  const { homeId } = useParams<{ homeId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  console.log("HomeDetails - homeId from params:", homeId);
  
  // Redirect to dashboard if homeId is undefined
  useEffect(() => {
    if (!homeId) {
      console.error("HomeDetails - No homeId provided in URL");
      toast({
        title: "Error",
        description: "No home ID provided. Redirecting to dashboard.",
        variant: "destructive",
      });
      navigate("/dashboard");
    }
  }, [homeId, navigate, toast]);
  
  // State
  const [home, setHome] = useState<ExtendedHomeData | null>(null);
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [selectedTask, setSelectedTask] = useState<TaskData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch home details and tasks
  useEffect(() => {
    if (!homeId) return;
    
    const fetchHomeDetails = async () => {
      // Skip if homeId is undefined or empty
      if (!homeId) {
        console.error("Cannot fetch home details: homeId is undefined");
        setError("Cannot load home details: home ID is missing");
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        console.log("Fetching home details for homeId:", homeId);
        
        // Fetch home details
        const homeResponse = await api.get(`/api/homes/${homeId}`);
        console.log("Home details response:", homeResponse.data);
        
        if (!homeResponse.data || !homeResponse.data.data) {
          throw new Error("Invalid home data format received from server");
        }
        
        setHome(homeResponse.data.data);
        
        // Fetch tasks for this home
        const tasksResponse = await api.get(`/api/tasks/${homeId}`);
        console.log("Tasks response:", tasksResponse.data);
        
        if (!tasksResponse.data || !tasksResponse.data.data) {
          console.warn("Invalid tasks data format received from server");
          setTasks([]);
        } else {
          setTasks(tasksResponse.data.data);
        }
      } catch (error) {
        console.error("Error fetching home details:", error);
        setError("Failed to load home details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchHomeDetails();
  }, [homeId]);
  
  const handleTaskClick = (task: TaskData) => {
    setSelectedTask(task);
  };
  
  const handleTaskComplete = async (taskId: string) => {
    try {
      await api.patch(`/api/tasks/${taskId}`, { completed: true });
      
      // Update the tasks list
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? { ...task, completed: true } : task
        )
      );
      
      // Close the modal
      setSelectedTask(null);
      
      toast({
        title: "Task completed",
        description: "The task has been marked as completed.",
      });
    } catch (error) {
      console.error("Error completing task:", error);
      toast({
        title: "Error",
        description: "Failed to mark the task as completed. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Format roof type and HVAC type for display
  const formatRoofType = (type: string) => {
    const types: Record<string, string> = {
      asphalt: "Asphalt Shingles",
      metal: "Metal Roof",
      tile: "Tile Roof",
      slate: "Slate Roof",
      wood: "Wood Shingles",
      flat: "Flat/Built-up Roof"
    };
    
    return types[type] || type;
  };
  
  const formatHvacType = (type: string) => {
    const types: Record<string, string> = {
      central: "Central Air",
      window: "Window Units",
      split: "Split System",
      heat_pump: "Heat Pump",
      radiant: "Radiant Heating",
      geothermal: "Geothermal"
    };
    
    return types[type] || type;
  };
  
  if (loading) {
    return (
      <div className="container py-8 max-w-5xl">
        <Skeleton className="h-8 w-32 mb-6" />
        <Skeleton className="h-12 w-64 mb-4" />
        <Skeleton className="h-6 w-full max-w-md mb-8" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
        
        <Skeleton className="h-10 w-48 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-32 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }
  
  if (error || !home) {
    return (
      <div className="container py-8">
        <Button 
          variant="ghost" 
          className="mb-6 flex items-center text-muted-foreground hover:text-foreground"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          <p>{error || "Home not found"}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container py-8 max-w-5xl">
      <Button 
        variant="ghost" 
        className="mb-6 flex items-center text-muted-foreground hover:text-foreground"
        onClick={() => navigate("/dashboard")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>
      
      <div className="flex flex-col gap-8">
        {/* Home header */}
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <HomeIcon className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold tracking-tight">{home.name}</h1>
                <p className="text-muted-foreground">{home.address}</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1"
                onClick={() => navigate(`/homes/${homeId}/edit`)}
              >
                <Pencil className="h-4 w-4" />
                <span>Edit</span>
              </Button>
              <Button variant="outline" size="sm" className="flex items-center gap-1 text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Home details */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-muted/20 rounded-lg p-4 flex flex-col gap-2">
            <div className="text-muted-foreground text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Year Built</span>
            </div>
            <div className="text-xl font-semibold">{home.year_built}</div>
          </div>
          
          <div className="bg-muted/20 rounded-lg p-4 flex flex-col gap-2">
            <div className="text-muted-foreground text-sm font-medium flex items-center gap-2">
              <SquareIcon className="h-4 w-4" />
              <span>Square Footage</span>
            </div>
            <div className="text-xl font-semibold">{home.square_feet} sq ft</div>
          </div>
          
          <div className="bg-muted/20 rounded-lg p-4 flex flex-col gap-2">
            <div className="text-muted-foreground text-sm font-medium flex items-center gap-2">
              <Construction className="h-4 w-4" />
              <span>Roof Type</span>
            </div>
            <div className="text-xl font-semibold">{formatRoofType(home.roof_type)}</div>
          </div>
          
          <div className="bg-muted/20 rounded-lg p-4 flex flex-col gap-2">
            <div className="text-muted-foreground text-sm font-medium flex items-center gap-2">
              <Fan className="h-4 w-4" />
              <span>HVAC System</span>
            </div>
            <div className="text-xl font-semibold">{formatHvacType(home.hvac_type)}</div>
          </div>
        </div>
        
        {/* Tasks section */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold tracking-tight">Maintenance Tasks</h2>
            <Button onClick={() => navigate(`/homes/${homeId}/tasks/add`)}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>
          
          {tasks.length === 0 ? (
            <div className="bg-muted/30 border border-border rounded-lg p-6 text-center">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No tasks yet</h3>
              <p className="text-muted-foreground mb-4">
                Add your first maintenance task for this home
              </p>
              <Button onClick={() => navigate(`/homes/${homeId}/tasks/add`)}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tasks.map(task => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  onClick={() => handleTaskClick(task)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Task modal */}
      {selectedTask && (
        <TaskModal
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          task={selectedTask}
          onComplete={() => selectedTask && handleTaskComplete(selectedTask.id)}
        />
      )}
    </div>
  );
};

export default HomeDetails; 