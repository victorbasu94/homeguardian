import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusCircle, Home as HomeIcon, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/axios";
import HomeCard, { HomeData, HomeCardProps } from "@/components/dashboard/HomeCard";
import TaskCard, { TaskData } from "@/components/dashboard/TaskCard";
import TaskModal from "@/components/dashboard/TaskModal";

// Define interfaces
export interface UserData {
  id: string;
  name: string;
  email: string;
  subscription_status?: "active" | "inactive" | "trial";
  subscription_plan?: "basic" | "pro" | "premium";
  subscription_end_date?: string;
}

const Dashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  
  // State for homes
  const [homes, setHomes] = useState<HomeData[]>([]);
  const [loadingHomes, setLoadingHomes] = useState(true);
  const [homesError, setHomesError] = useState<string | null>(null);
  
  // State for user data
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loadingUserData, setLoadingUserData] = useState(true);
  
  // State for tasks
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [tasksError, setTasksError] = useState<string | null>(null);
  
  // Selected home and task
  const [selectedHome, setSelectedHome] = useState<HomeData | null>(null);
  const [selectedTask, setSelectedTask] = useState<TaskData | null>(null);
  
  // Check for subscription success parameter
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const subscriptionStatus = searchParams.get('subscription');
    
    if (subscriptionStatus === 'success') {
      toast({
        title: 'Subscription Activated',
        description: 'Your subscription has been successfully activated. Welcome to HomeGuardian!',
      });
      
      // Remove the query parameter from the URL
      navigate('/dashboard', { replace: true });
    }
  }, [location, toast, navigate]);
  
  // Fetch homes
  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      navigate("/login");
      return;
    }
    
    if (isAuthenticated) {
      fetchHomes();
      fetchUserData();
    }
  }, [isAuthenticated, authLoading, navigate]);
  
  // Fetch tasks when selected home changes
  useEffect(() => {
    if (selectedHome) {
      fetchTasks(selectedHome.id);
    } else {
      setTasks([]);
    }
  }, [selectedHome]);
  
  const fetchHomes = async () => {
    try {
      setLoadingHomes(true);
      setHomesError(null);
      
      const response = await api.get("/api/homes");
      setHomes(response.data);
      
      // Select the first home by default if available
      if (response.data.length > 0 && !selectedHome) {
        setSelectedHome(response.data[0]);
      }
    } catch (error) {
      console.error("Error fetching homes:", error);
      setHomesError("Failed to load your homes. Please try again later.");
    } finally {
      setLoadingHomes(false);
    }
  };
  
  const fetchUserData = async () => {
    try {
      setLoadingUserData(true);
      
      const response = await api.get("/api/users/me");
      setUserData(response.data);
    } catch (error) {
      console.error("Error fetching user data:", error);
      // We don't set an error state here as it's not critical for the main functionality
    } finally {
      setLoadingUserData(false);
    }
  };
  
  const fetchTasks = async (homeId: string) => {
    try {
      setLoadingTasks(true);
      setTasksError(null);
      
      const response = await api.get(`/api/homes/${homeId}/tasks`);
      setTasks(response.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setTasksError("Failed to load tasks for this home. Please try again later.");
    } finally {
      setLoadingTasks(false);
    }
  };
  
  const handleHomeSelect = (home: HomeData) => {
    setSelectedHome(home);
  };
  
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
  
  // Render subscription status
  const renderSubscriptionStatus = () => {
    if (loadingUserData) {
      return <Skeleton className="h-6 w-24" />;
    }
    
    if (!userData?.subscription_status || userData.subscription_status === "inactive") {
      return (
        <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
          <AlertCircle className="h-4 w-4" />
          <span>No active subscription</span>
        </div>
      );
    }
    
    const planLabel = userData.subscription_plan 
      ? userData.subscription_plan.charAt(0).toUpperCase() + userData.subscription_plan.slice(1) 
      : "Basic";
    
    const endDate = userData.subscription_end_date 
      ? format(new Date(userData.subscription_end_date), "MMM d, yyyy")
      : null;
    
    return (
      <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
        <span>{planLabel} Plan {endDate ? `· Renews ${endDate}` : ""}</span>
      </div>
    );
  };
  
  // Render homes section
  const renderHomes = () => {
    if (loadingHomes) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-64 w-full rounded-lg" />
          ))}
        </div>
      );
    }
    
    if (homesError) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          <p className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            {homesError}
          </p>
        </div>
      );
    }
    
    if (homes.length === 0) {
      return (
        <div className="bg-muted/30 border border-border rounded-lg p-6 text-center">
          <HomeIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No homes added yet</h3>
          <p className="text-muted-foreground mb-4">
            Add your first home to start tracking maintenance tasks
          </p>
          <Button onClick={() => navigate("/homes/add")}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Home
          </Button>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {homes.map(home => (
          <HomeCard 
            key={home.id} 
            home={home} 
            isSelected={selectedHome?.id === home.id}
            onClick={() => handleHomeSelect(home)}
          />
        ))}
        <div className="flex items-center justify-center h-full min-h-[200px] border border-dashed border-border rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors">
          <Button 
            variant="ghost" 
            className="flex flex-col gap-2 h-auto py-8"
            onClick={() => navigate("/homes/add")}
          >
            <PlusCircle className="h-8 w-8 text-muted-foreground" />
            <span>Add Home</span>
          </Button>
        </div>
      </div>
    );
  };
  
  // Render tasks section
  const renderTasks = () => {
    if (!selectedHome) {
      return (
        <div className="bg-muted/30 border border-border rounded-lg p-6 text-center">
          <p className="text-muted-foreground">
            Select a home to view its tasks
          </p>
        </div>
      );
    }
    
    if (loadingTasks) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32 w-full rounded-lg" />
          ))}
        </div>
      );
    }
    
    if (tasksError) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          <p className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            {tasksError}
          </p>
        </div>
      );
    }
    
    if (tasks.length === 0) {
      return (
        <div className="bg-muted/30 border border-border rounded-lg p-6 text-center">
          <h3 className="text-lg font-medium mb-2">No tasks for this home</h3>
          <p className="text-muted-foreground mb-4">
            Add maintenance tasks to keep track of your home upkeep
          </p>
          <Button onClick={() => navigate(`/homes/${selectedHome.id}/tasks/add`)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>
      );
    }
    
    // Filter tasks by completion status
    const upcomingTasks = tasks.filter(task => !task.completed);
    const completedTasks = tasks.filter(task => task.completed);
    
    return (
      <div className="space-y-6">
        {upcomingTasks.length > 0 && (
          <div>
            <h3 className="text-lg font-medium mb-3">Upcoming Tasks</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcomingTasks.map(task => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  onClick={() => handleTaskClick(task)}
                />
              ))}
            </div>
          </div>
        )}
        
        {completedTasks.length > 0 && (
          <div>
            <h3 className="text-lg font-medium mb-3">Completed Tasks</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {completedTasks.map(task => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  onClick={() => handleTaskClick(task)}
                />
              ))}
            </div>
          </div>
        )}
        
        <div className="flex justify-end">
          <Button onClick={() => navigate(`/homes/${selectedHome.id}/tasks/add`)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>
      </div>
    );
  };
  
  return (
    <div className="container py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage your homes and maintenance tasks
          </p>
        </div>
        {renderSubscriptionStatus()}
      </div>
      
      <div className="grid grid-cols-1 gap-8">
        <section>
          <h2 className="text-xl font-semibold mb-4">Your Homes</h2>
          {renderHomes()}
        </section>
        
        {selectedHome && (
          <section>
            <h2 className="text-xl font-semibold mb-4">
              Tasks for {selectedHome.name}
            </h2>
            {renderTasks()}
          </section>
        )}
      </div>
      
      {selectedTask && (
        <TaskModal 
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          task={selectedTask}
          onComplete={() => handleTaskComplete(selectedTask.id)}
        />
      )}
    </div>
  );
};

export default Dashboard;
