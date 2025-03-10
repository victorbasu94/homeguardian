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
import TaskCard, { TaskData } from "@/components/dashboard/TaskCard";
import TaskModal, { TaskData as ModalTaskData } from "@/components/dashboard/TaskModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Extend HomeData interface to include the properties we need
interface ExtendedHomeData extends HomeData {
  roof_type: string;
  hvac_type: string;
  year_built: number;
  square_feet: number;
}

// Convert TaskData to ModalTaskData
const convertToModalTask = (task: TaskData): ModalTaskData => {
  return {
    id: task.id,
    task_name: task.title,
    due_date: task.due_date,
    why: task.description,
    completed: task.status === 'completed',
    home_id: task.home_id,
    estimated_cost: task.estimated_cost
  };
};

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
  const [activeTab, setActiveTab] = useState("details");
  
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
        const homeResponse = await api.get(`/homes/${homeId}`);
        console.log("Home details response:", homeResponse.data);
        
        if (!homeResponse.data || !homeResponse.data.data) {
          throw new Error("Invalid home data format received from server");
        }
        
        setHome(homeResponse.data.data);
        
        // Fetch tasks for this home
        const tasksResponse = await api.get(`/tasks/${homeId}`);
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
      await api.patch(`/tasks/${taskId}/complete`);
      
      // Update local state
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId 
            ? { ...task, status: 'completed' } 
            : task
        )
      );
      
      toast({
        title: "Task Completed",
        description: "The task has been marked as completed.",
      });
    } catch (error) {
      console.error("Error completing task:", error);
      toast({
        title: "Error",
        description: "Failed to complete the task. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const formatRoofType = (type: string) => {
    switch (type.toLowerCase()) {
      case 'asphalt':
      case 'asphalt_shingle':
        return 'Asphalt Shingle';
      case 'metal':
        return 'Metal';
      case 'tile':
        return 'Tile';
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };
  
  const formatHvacType = (type: string) => {
    switch (type.toLowerCase()) {
      case 'central_air':
      case 'central':
        return 'Central Air';
      case 'heat_pump':
        return 'Heat Pump';
      case 'window_units':
        return 'Window Units';
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };
  
  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            size="icon" 
            className="mr-2"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Skeleton className="h-8 w-64" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
        
        <Skeleton className="h-12 w-full mb-4" />
        
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }
  
  if (error || !home) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            size="icon" 
            className="mr-2"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Error</h1>
        </div>
        
        <div className="bg-destructive/10 text-destructive p-6 rounded-xl">
          <h2 className="text-xl font-semibold mb-2">Failed to Load Home Details</h2>
          <p>{error || "Unknown error occurred"}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => navigate('/dashboard')}
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="icon" 
          className="mr-2"
          onClick={() => navigate('/dashboard')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">{home.name || `Home in ${home.location}`}</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 border shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-full bg-primary/10 text-primary">
              <HomeIcon className="h-5 w-5" />
            </div>
            <h2 className="font-semibold">Location</h2>
          </div>
          <p className="text-lg">{home.location}</p>
        </div>
        
        <div className="bg-white rounded-xl p-6 border shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-full bg-primary/10 text-primary">
              <Calendar className="h-5 w-5" />
            </div>
            <h2 className="font-semibold">Year Built</h2>
          </div>
          <p className="text-lg">{home.year_built}</p>
        </div>
        
        <div className="bg-white rounded-xl p-6 border shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-full bg-primary/10 text-primary">
              <SquareIcon className="h-5 w-5" />
            </div>
            <h2 className="font-semibold">Square Footage</h2>
          </div>
          <p className="text-lg">{home.square_feet} sq ft</p>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="mb-6">
          <TabsTrigger value="details">Home Details</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 border shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-full bg-primary/10 text-primary">
                  <Construction className="h-5 w-5" />
                </div>
                <h2 className="font-semibold">Roof Type</h2>
              </div>
              <p className="text-lg">{home.roof_type ? formatRoofType(home.roof_type) : 'Not specified'}</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 border shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-full bg-primary/10 text-primary">
                  <Fan className="h-5 w-5" />
                </div>
                <h2 className="font-semibold">HVAC System</h2>
              </div>
              <p className="text-lg">{home.hvac_type ? formatHvacType(home.hvac_type) : 'Not specified'}</p>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => navigate(`/homes/${homeId}/edit`)}
            >
              <Pencil className="h-4 w-4" />
              Edit Home Details
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="tasks" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Maintenance Tasks</h2>
            <Button 
              className="flex items-center gap-2"
              onClick={() => navigate(`/tasks/add?homeId=${homeId}`)}
            >
              <PlusCircle className="h-4 w-4" />
              Add Task
            </Button>
          </div>
          
          {tasks.length === 0 ? (
            <div className="bg-muted/50 rounded-xl p-8 text-center">
              <h3 className="text-lg font-medium mb-2">No tasks yet</h3>
              <p className="text-muted-foreground mb-4">
                You haven't added any maintenance tasks for this home yet.
              </p>
              <Button 
                onClick={() => navigate(`/tasks/add?homeId=${homeId}`)}
                className="flex items-center gap-2"
              >
                <PlusCircle className="h-4 w-4" />
                Add Your First Task
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  onComplete={handleTaskComplete}
                  onViewDetails={() => handleTaskClick(task)}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {selectedTask && (
        <TaskModal 
          task={convertToModalTask(selectedTask)} 
          isOpen={!!selectedTask} 
          onClose={() => setSelectedTask(null)}
          onComplete={() => selectedTask && handleTaskComplete(selectedTask.id)}
        />
      )}
    </div>
  );
};

export default HomeDetails; 