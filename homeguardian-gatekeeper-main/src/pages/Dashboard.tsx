import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, Home as HomeIcon, AlertCircle, Plus, ClipboardList, Bell, Settings, Search, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/axios';
import HomeCard, { HomeData, HomeCardProps } from '@/components/dashboard/HomeCard';
import TaskCard, { TaskData } from '@/components/dashboard/TaskCard';
import TaskModal, { TaskData as TaskModalData } from '@/components/dashboard/TaskModal';
import DashboardNavbar from '@/components/dashboard/DashboardNavbar';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import HomesEmptyState from '@/components/dashboard/HomesEmptyState';
import HomesLoading from '@/components/dashboard/HomesLoading';
import SubscriptionStatus from '@/components/dashboard/SubscriptionStatus';

// Define interfaces
export interface UserData {
  id: string;
  name: string;
  email: string;
  subscription_status?: "active" | "inactive" | "trial";
  subscription_plan?: "basic" | "pro" | "premium";
  subscription_end_date?: string;
}

// Mock data - would come from API in real app
const mockHomes: HomeData[] = [
  {
    id: '1',
    name: 'Mountain View Residence',
    location: 'Boulder, CO',
    year_built: 2015,
    square_footage: 2450,
    roof_type: 'Asphalt Shingle',
    hvac_type: 'Central Air',
    last_maintenance: '2023-05-15',
    next_maintenance: 'June 15, 2024',
    tasks_count: 12,
    completed_tasks_count: 8,
  },
  {
    id: '2',
    name: 'Lakeside Cottage',
    location: 'Lake Tahoe, CA',
    year_built: 1998,
    square_footage: 1850,
    roof_type: 'Metal',
    hvac_type: 'Heat Pump',
    last_maintenance: '2023-08-22',
    next_maintenance: 'August 22, 2024',
    tasks_count: 9,
    completed_tasks_count: 3,
  },
  {
    id: '3',
    name: 'Urban Loft',
    location: 'Portland, OR',
    year_built: 2008,
    square_footage: 1200,
    roof_type: 'Flat/Built-up',
    hvac_type: 'Ductless Mini-Split',
    last_maintenance: '2023-11-10',
    next_maintenance: 'May 10, 2024',
    tasks_count: 7,
    completed_tasks_count: 7,
  }
];

const mockTasks: TaskData[] = [
  {
    id: '1',
    title: 'Replace HVAC Filter',
    description: 'Replace the air filter in the HVAC system to maintain air quality and system efficiency.',
    due_date: '2024-05-15',
    status: 'pending',
    priority: 'high',
    home_id: '1',
    category: 'maintenance',
    estimated_time: 30,
    estimated_cost: 25,
  },
  {
    id: '2',
    title: 'Clean Gutters',
    description: 'Remove debris from gutters to prevent water damage and maintain proper drainage.',
    due_date: '2024-05-20',
    status: 'pending',
    priority: 'medium',
    home_id: '1',
    category: 'maintenance',
    estimated_time: 120,
    estimated_cost: 0,
  },
  {
    id: '3',
    title: 'Inspect Roof',
    description: 'Check for damaged or missing shingles and signs of leaks.',
    due_date: '2024-06-01',
    status: 'pending',
    priority: 'high',
    home_id: '2',
    category: 'inspection',
    estimated_time: 60,
    estimated_cost: 0,
  },
  {
    id: '4',
    title: 'Service Water Heater',
    description: 'Flush the water heater to remove sediment and check for proper operation.',
    due_date: '2024-05-10',
    status: 'overdue',
    priority: 'medium',
    home_id: '3',
    category: 'maintenance',
    estimated_time: 90,
    estimated_cost: 50,
  },
  {
    id: '5',
    title: 'Test Smoke Detectors',
    description: 'Test all smoke detectors and replace batteries if needed.',
    due_date: '2024-05-05',
    status: 'completed',
    priority: 'high',
    home_id: '1',
    category: 'safety',
    estimated_time: 30,
    estimated_cost: 15,
  }
];

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
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Selected home and task
  const [selectedHome, setSelectedHome] = useState<HomeData | null>(null);
  const [selectedTask, setSelectedTask] = useState<TaskModalData | null>(null);
  
  // Search and UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('tasks');
  
  // Check for subscription success parameter
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const subscriptionStatus = searchParams.get('subscription');
    const isMock = searchParams.get('mock') === 'true';
    
    if (subscriptionStatus === 'success') {
      // Log the successful redirection
      console.log('Subscription success redirect detected', { isMock });
      
      toast({
        title: 'Subscription Activated',
        description: isMock 
          ? 'Your subscription has been activated in development mode.' 
          : 'Your subscription has been successfully activated. Welcome to HomeGuardian!',
        variant: 'default',
      });
      
      // If this is a mock subscription in development, update the user data
      if (isMock) {
        // Update user data with mock subscription
        fetchUserData();
        console.log('Mock subscription activated in development mode');
      }
      
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
      console.log("Homes response:", response.data);
      
      // Ensure homes is always an array
      const homesData = response.data?.data || [];
      
      // Log the actual structure of the homes data
      console.log("Homes data structure:", JSON.stringify(homesData, null, 2));
      
      // Check if each home has an id property
      if (Array.isArray(homesData)) {
        homesData.forEach((home, index) => {
          if (!home.id && home._id) {
            console.log(`Converting _id to id for home at index ${index}`);
            home.id = home._id;
          }
        });
      }
      
      setHomes(Array.isArray(homesData) ? homesData : []);
      
      // Select the first home by default if available
      if (Array.isArray(homesData) && homesData.length > 0 && !selectedHome) {
        console.log("Setting selected home:", homesData[0]);
        setSelectedHome(homesData[0]);
      }
    } catch (error) {
      console.error("Error fetching homes:", error);
      setHomesError("Failed to load your homes. Please try again later.");
      setHomes([]); // Ensure homes is an empty array on error
    } finally {
      setLoadingHomes(false);
    }
  };
  
  const fetchUserData = async () => {
    try {
      setLoadingUserData(true);
      
      // Use the auth/me endpoint instead of users/me
      const response = await api.get("/api/auth/me");
      if (response.data && response.data.user) {
        setUserData({
          id: response.data.user.id,
          name: response.data.user.name || response.data.user.email.split('@')[0],
          email: response.data.user.email,
          subscription_status: response.data.user.subscription_status,
          subscription_plan: response.data.user.subscription_plan,
          subscription_end_date: response.data.user.subscription_end_date
        });
      } else {
        console.error("Invalid user data format:", response.data);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      // We don't set an error state here as it's not critical for the main functionality
    } finally {
      setLoadingUserData(false);
    }
  };
  
  const fetchTasks = async (homeId: string) => {
    // Skip if homeId is undefined or empty
    if (!homeId) {
      console.error("Cannot fetch tasks: homeId is undefined");
      setTasksError("Cannot load tasks: home ID is missing");
      setLoadingTasks(false);
      return;
    }
    
    try {
      setLoadingTasks(true);
      setTasksError(null);
      
      console.log("Fetching tasks for homeId:", homeId);
      const response = await api.get(`/api/tasks/${homeId}`);
      console.log("Tasks response:", response.data);
      
      // Check if we have tasks data
      if (response.data && response.data.data) {
        // Map the API response to match the TaskData interface
        const mappedTasks = response.data.data.map((task: any) => ({
          id: task.id || task._id,
          title: task.title || task.task_name || "Untitled Task",
          description: task.description || task.why || "",
          due_date: task.due_date || new Date().toISOString(),
          status: task.status || (task.completed ? 'completed' : 'pending'),
          priority: task.priority || 'medium',
          home_id: task.home_id || homeId,
          category: task.category || "General",
          estimated_time: task.estimated_time || 30,
          estimated_cost: task.estimated_cost || null
        }));
        
        console.log("Mapped tasks:", mappedTasks);
        setTasks(mappedTasks);
      } else {
        console.log("No tasks data found in response");
        setTasks([]);
      }
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
    // Navigate to the task detail page
    navigate(`/tasks/${task.id}`);
  };
  
  const handleTaskComplete = async (taskId: string) => {
    try {
      setIsUpdating(true);
      
      // Make the API call to update the task status
      await api.patch(`/api/tasks/${taskId}`, { completed: true });
      
      // Update the local state
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId 
            ? { ...task, status: 'completed' } 
            : task
        )
      );
      
      // If the completed task is the selected task, update it
      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask({
          ...selectedTask,
          completed: true
        });
      }
      
      toast({
        title: "Task completed",
        description: "The task has been marked as completed.",
      });
    } catch (error) {
      console.error("Error completing task:", error);
      toast({
        title: "Error",
        description: "Failed to complete the task. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Render subscription status
  const renderSubscriptionStatus = () => {
    if (loadingUserData) {
      return <Skeleton className="h-6 w-24" />;
    }
    
    if (!userData?.subscription_status || userData.subscription_status === "inactive" || userData.subscription_status === "trial") {
      // Only show the trial banner if the status is specifically "trial"
      if (userData?.subscription_status === "trial") {
        return (
          <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
            <AlertCircle className="h-4 w-4" />
            <span>Trial subscription</span>
          </div>
        );
      }
      
      // Show the "No active subscription" banner for inactive or no subscription
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
    
    if (!Array.isArray(homes) || homes.length === 0) {
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
            onEdit={() => navigate(`/homes/${home.id}/edit`)}
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
    
    // Filter tasks by search query
    const filteredTasks = searchQuery.trim() !== '' 
      ? tasks.filter(task => 
          (task.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) || 
          (task.description?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
          (task.category?.toLowerCase() || '').includes(searchQuery.toLowerCase())
        )
      : tasks;
    
    console.log("Search query:", searchQuery);
    console.log("Filtered tasks:", filteredTasks);
    console.log("Original tasks:", tasks);
    
    if (filteredTasks.length === 0) {
      return (
        <div className="bg-muted/30 border border-border rounded-lg p-6 text-center">
          <h3 className="text-lg font-medium mb-2">No tasks found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery.trim() !== '' 
              ? "No tasks match your search criteria." 
              : "Add maintenance tasks to keep track of your home upkeep"}
          </p>
          <Button onClick={() => navigate(`/homes/${selectedHome.id}/tasks/add`)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>
      );
    }
    
    // Filter tasks by completion status
    const pendingTasks = filteredTasks.filter(task => task.status === 'pending');
    const completedTasks = filteredTasks.filter(task => task.status === 'completed');
    
    return (
      <div className="space-y-6">
        {pendingTasks.length > 0 && (
          <div>
            <h3 className="text-lg font-medium mb-3">Upcoming Tasks</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingTasks.map(task => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  onComplete={() => handleTaskComplete(task.id)}
                  onViewDetails={() => navigate(`/tasks/${task.id}`)}
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
                  onComplete={() => handleTaskComplete(task.id)}
                  onViewDetails={() => navigate(`/tasks/${task.id}`)}
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
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-neutral">Dashboard</h1>
            <p className="text-neutral/70">Manage your homes and maintenance tasks</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral/50" />
              <Input
                type="text"
                placeholder="Search..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button onClick={() => navigate("/homes/add")}>
              <Plus className="h-4 w-4 mr-2" />
              Add Home
            </Button>
          </div>
        </div>
        
        <SubscriptionStatus 
          status={userData?.subscription_status === 'active' ? 'active' : 
                 userData?.subscription_status === 'trial' ? 'trial' : 'none'}
          expiryDate={userData?.subscription_end_date ? format(new Date(userData.subscription_end_date), 'MMMM d, yyyy') : undefined}
          onUpgrade={() => navigate('/plan-selection')}
        />
        
        <Tabs 
          defaultValue="tasks" 
          value={activeTab}
          onValueChange={setActiveTab}
          className="mt-8"
        >
          <TabsList className="mb-6">
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              <span>Tasks</span>
            </TabsTrigger>
            <TabsTrigger value="homes" className="flex items-center gap-2">
              <HomeIcon className="h-4 w-4" />
              <span>My Homes</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span>Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="homes">
            {loadingHomes ? (
              <HomesLoading />
            ) : homes.length === 0 ? (
              <HomesEmptyState onAddHome={() => navigate("/homes/add")} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {homes.map(home => (
                  <HomeCard
                    key={home.id}
                    home={home}
                    isSelected={home.id === selectedHome?.id}
                    onClick={() => handleHomeSelect(home)}
                    onEdit={() => navigate(`/homes/${home.id}/edit`)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="tasks">
            {renderTasks()}
          </TabsContent>
          
          <TabsContent value="notifications">
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <Bell className="h-12 w-12 mx-auto text-neutral/30 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No notifications</h3>
              <p className="text-neutral/70">
                You're all caught up! We'll notify you when there are updates.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="settings">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold mb-6">Account Settings</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Profile Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-neutral/70 mb-1">
                        Full Name
                      </label>
                      <Input defaultValue="John Doe" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral/70 mb-1">
                        Email Address
                      </label>
                      <Input defaultValue="john.doe@example.com" />
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Notification Preferences</h3>
                  <div className="space-y-3">
                    {/* Notification preferences would go here */}
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <Button>Save Changes</Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      
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
