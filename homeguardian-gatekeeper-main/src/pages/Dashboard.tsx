import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  PlusCircle, 
  Home as HomeIcon, 
  AlertCircle, 
  Plus, 
  ClipboardList, 
  Bell, 
  Settings, 
  Search, 
  CheckCircle, 
  Sparkles,
  CheckIcon,
  LayoutDashboard,
  ArrowRight
} from 'lucide-react';
import { format, isPast, isToday, addDays } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/axios';
import HomeCard, { HomeData, HomeCardProps } from '@/components/dashboard/HomeCard';
import TaskCard, { TaskData } from '@/components/dashboard/TaskCard';
import TaskModal, { TaskData as TaskModalData } from '@/components/dashboard/TaskModal';
import DashboardNavbar from '@/components/dashboard/DashboardNavbar';
import Footer from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import HomesEmptyState from '@/components/dashboard/HomesEmptyState';
import HomesLoading from '@/components/dashboard/HomesLoading';
import SubscriptionStatus from '@/components/dashboard/SubscriptionStatus';
import AIMaintenanceTasks from '@/components/dashboard/AIMaintenanceTasks';
import { useMaintenance, MOCK_MAINTENANCE_TASKS } from '@/contexts/MaintenanceContext';

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
  const { maintenanceTasks } = useMaintenance();
  
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
  const [activeTab, setActiveTab] = useState('overview');
  
  const [showAITasks, setShowAITasks] = useState(true);
  
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
          : 'Your subscription has been successfully activated. Welcome to MaintainMint!',
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
    try {
      setLoadingTasks(true);
      setTasksError(null);
      
      let regularTasks = [];
      
      try {
        const response = await api.get(`/tasks/${homeId}`);
        console.log("Tasks response:", response.data);
        regularTasks = response.data?.data || [];
      } catch (apiError) {
        console.error("Error fetching tasks from API:", apiError);
        // Don't set error yet, we'll try to show AI tasks if available
      }
      
      // Convert AI maintenance tasks to TaskData format
      const aiTasks = maintenanceTasks.map((aiTask, index) => ({
        id: `ai-task-${index}`,
        title: aiTask.task,
        description: aiTask.taskDescription,
        due_date: aiTask.suggestedCompletionDate,
        status: 'pending',
        priority: 'medium',
        home_id: homeId,
        category: 'maintenance',
        estimated_time: parseInt(aiTask.estimatedTime) || 60,
        estimated_cost: aiTask.estimatedCost || 0,
        is_ai_generated: true,
        sub_tasks: aiTask.subTasks
      }));
      
      // If we have no regular tasks and no AI tasks, show an error
      if (regularTasks.length === 0 && aiTasks.length === 0) {
        setTasksError("No tasks available. Try adding tasks manually or generating AI maintenance tasks.");
        setTasks([]);
      } else {
        // Combine regular tasks with AI tasks
        const combinedTasks = [...regularTasks, ...aiTasks];
        
        // Sort tasks by due date
        combinedTasks.sort((a, b) => {
          const dateA = new Date(a.due_date);
          const dateB = new Date(b.due_date);
          return dateA.getTime() - dateB.getTime();
        });
        
        setTasks(combinedTasks);
      }
    } catch (error) {
      console.error("Error in fetchTasks:", error);
      setTasksError("Failed to load tasks. Please try again.");
      // Set empty tasks array to avoid undefined errors
      setTasks([]);
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
      
      // Update task status in the API
      await api.patch(`/tasks/${taskId}`, { completed: true });
      
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
    // Render home cards
    const renderHomeCards = () => {
      return homes.map((home) => (
        <HomeCard
          key={home.id}
          home={home}
          isSelected={selectedHome?.id === home.id}
          onClick={() => handleHomeSelect(home)}
          onEdit={() => navigate(`/homes/${home.id}/edit`)}
        />
      ));
    };
    
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Your Homes</h1>
            <p className="text-muted-foreground mt-1">
              Manage your properties and their maintenance schedules
            </p>
          </div>
          <Button 
            onClick={() => navigate('/homes/add')}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> Add Home
          </Button>
        </div>
        
        {loadingHomes ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-64 w-full rounded-md" />
            ))}
          </div>
        ) : homesError ? (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-800 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium">Error Loading Homes</h3>
              <p className="mt-1 text-sm">{homesError}</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-3 text-red-800 border-red-300"
                onClick={fetchHomes}
              >
                Try Again
              </Button>
            </div>
          </div>
        ) : homes.length === 0 ? (
          <div className="bg-white border border-border/40 rounded-md p-8 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <HomeIcon className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-lg font-medium mb-2">No homes added yet</h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              Add your first home to start tracking maintenance tasks and get personalized recommendations.
            </p>
            <Button onClick={() => navigate('/homes/add')}>
              Add Your First Home
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {renderHomeCards()}
          </div>
        )}
      </div>
    );
  };
  
  // Render tasks section
  const renderTasks = () => {
    if (!selectedHome) {
      return (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Maintenance Tasks</h1>
            <p className="text-muted-foreground mt-1">
              Select a home to view and manage its maintenance tasks
            </p>
          </div>
          
          <div className="bg-white border border-border/40 rounded-md p-8 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <HomeIcon className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-lg font-medium mb-2">No home selected</h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              Please select a home from the list to view and manage its maintenance tasks.
            </p>
            <Button onClick={() => setActiveTab('homes')}>
              View Homes
            </Button>
          </div>
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
    
    // Ensure tasks are properly typed
    const typedTasks = filteredTasks as TaskData[];
    
    // Group tasks by status
    const completedTasks = typedTasks.filter(task => task.status === 'completed');
    const pendingTasks = typedTasks.filter(task => task.status === 'pending');
    const overdueTasks = typedTasks.filter(task => 
      task.status !== 'completed' && 
      isPast(new Date(task.due_date)) && 
      !isToday(new Date(task.due_date))
    );
    
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Tasks for {selectedHome.name || `Home in ${selectedHome.location}`}
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage maintenance tasks for this property
            </p>
          </div>
          <Button 
            onClick={() => navigate(`/homes/${selectedHome.id}/tasks/add`)} 
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> Add Task
          </Button>
        </div>
        
        <div className="flex items-center gap-2 mb-4">
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
          
          <div className="ml-auto flex items-center gap-2">
            <div className="text-sm text-muted-foreground">
              Home: <span className="font-medium text-foreground">{selectedHome.name || selectedHome.location}</span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setActiveTab('homes')}
              className="ml-2"
            >
              Change
            </Button>
          </div>
        </div>
        
        {loadingTasks ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-md" />
            ))}
          </div>
        ) : tasksError ? (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-800 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium">Error Loading Tasks</h3>
              <p className="mt-1 text-sm">{tasksError}</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-3 text-red-800 border-red-300"
                onClick={() => fetchTasks(selectedHome.id)}
              >
                Try Again
              </Button>
            </div>
          </div>
        ) : typedTasks.length === 0 ? (
          <div className="bg-white border border-border/40 rounded-md p-8 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <ClipboardList className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-lg font-medium mb-2">No tasks found</h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              {searchQuery.trim() !== '' 
                ? "No tasks match your search criteria. Try a different search term."
                : "This home doesn't have any maintenance tasks yet. Add your first task to get started."}
            </p>
            {searchQuery.trim() !== '' ? (
              <Button variant="outline" onClick={() => setSearchQuery('')}>
                Clear Search
              </Button>
            ) : (
              <Button onClick={() => navigate(`/homes/${selectedHome.id}/tasks/add`)}>
                Add Your First Task
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Overdue Tasks */}
            {overdueTasks.length > 0 && (
              <div>
                <h2 className="text-base font-medium mb-3 flex items-center text-red-600">
                  <AlertCircle className="h-4 w-4 mr-2" /> Overdue Tasks
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {overdueTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onViewDetails={(taskData) => handleTaskClick(taskData)}
                      onComplete={(taskId) => handleTaskComplete(taskId)}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {/* Pending Tasks */}
            {pendingTasks.length > 0 && (
              <div>
                <h2 className="text-base font-medium mb-3 flex items-center">
                  <ClipboardList className="h-4 w-4 mr-2" /> Pending Tasks
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pendingTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onViewDetails={(taskData) => handleTaskClick(taskData)}
                      onComplete={(taskId) => handleTaskComplete(taskId)}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {/* Completed Tasks */}
            {completedTasks.length > 0 && (
              <div>
                <h2 className="text-base font-medium mb-3 flex items-center text-green-600">
                  <CheckCircle className="h-4 w-4 mr-2" /> Completed Tasks
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {completedTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onViewDetails={(taskData) => handleTaskClick(taskData)}
                      onComplete={(taskId) => handleTaskComplete(taskId)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Render the overview section
  const renderOverview = () => {
    // Create a safe user name display
    const userName = userData?.name || 'there';
    
    // Calculate task statistics
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    const pendingTasks = tasks.filter(task => task.status === 'pending').length;
    const overdueTasks = tasks.filter(task => 
      task.status !== 'completed' && 
      isPast(new Date(task.due_date)) && 
      !isToday(new Date(task.due_date))
    ).length;
    
    // Get upcoming tasks (due in the next 7 days)
    const upcomingTasks = tasks.filter(task => 
      task.status !== 'completed' && 
      !isPast(new Date(task.due_date)) && 
      new Date(task.due_date) <= addDays(new Date(), 7)
    ).sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
    
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Welcome back, {userName}
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's an overview of your home maintenance status
          </p>
        </div>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-md border border-border/40 p-4 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Total Homes</p>
                <h3 className="text-2xl font-semibold mt-1">{homes.length}</h3>
              </div>
              <div className="p-2 bg-primary/10 rounded-md">
                <HomeIcon className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="mt-4 text-xs text-muted-foreground">
              <Button variant="ghost" size="sm" className="p-0 h-auto text-primary hover:text-primary-dark" onClick={() => setActiveTab('homes')}>
                View all homes
              </Button>
            </div>
          </div>
          
          <div className="bg-white rounded-md border border-border/40 p-4 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Total Tasks</p>
                <h3 className="text-2xl font-semibold mt-1">{totalTasks}</h3>
              </div>
              <div className="p-2 bg-primary/10 rounded-md">
                <ClipboardList className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="mt-4 text-xs text-muted-foreground">
              <span className="text-green-600 font-medium">{completedTasks} completed</span> • <span className="text-amber-600 font-medium">{pendingTasks} pending</span>
            </div>
          </div>
          
          <div className="bg-white rounded-md border border-border/40 p-4 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Overdue Tasks</p>
                <h3 className="text-2xl font-semibold mt-1">{overdueTasks}</h3>
              </div>
              <div className="p-2 bg-red-100 rounded-md">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
            </div>
            <div className="mt-4 text-xs text-muted-foreground">
              {overdueTasks > 0 ? (
                <span className="text-red-600 font-medium">Requires attention</span>
              ) : (
                <span className="text-green-600 font-medium">All tasks on schedule</span>
              )}
            </div>
          </div>
          
          <div className="bg-white rounded-md border border-border/40 p-4 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Subscription</p>
                <h3 className="text-2xl font-semibold mt-1 capitalize">{userData?.subscription_plan || 'Free'}</h3>
              </div>
              <div className="p-2 bg-primary/10 rounded-md">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="mt-4 text-xs text-muted-foreground">
              <Button variant="ghost" size="sm" className="p-0 h-auto text-primary hover:text-primary-dark" onClick={() => setActiveTab('plan')}>
                Manage subscription
              </Button>
            </div>
          </div>
        </div>
        
        {/* Upcoming Tasks Section */}
        <div className="bg-white rounded-md border border-border/40 p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Upcoming Tasks</h2>
            <Button variant="outline" size="sm" onClick={() => setActiveTab('tasks')}>
              View all
            </Button>
          </div>
          
          {upcomingTasks.length === 0 ? (
            <div className="text-center py-8 bg-background/50 rounded-md">
              <CheckCircle className="h-12 w-12 text-primary/40 mx-auto mb-3" />
              <h3 className="text-base font-medium">No upcoming tasks</h3>
              <p className="text-sm text-muted-foreground mt-1">
                You're all caught up with your maintenance schedule
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingTasks.slice(0, 5).map(task => {
                const dueDate = new Date(task.due_date);
                const isToday = format(dueDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
                const isTomorrow = format(dueDate, 'yyyy-MM-dd') === format(addDays(new Date(), 1), 'yyyy-MM-dd');
                
                let dueDateText = format(dueDate, 'MMM d, yyyy');
                if (isToday) dueDateText = 'Today';
                if (isTomorrow) dueDateText = 'Tomorrow';
                
                return (
                  <div 
                    key={task.id} 
                    className="flex items-center justify-between p-3 rounded-md border border-border/40 hover:bg-background/50 cursor-pointer"
                    onClick={() => handleTaskClick(task)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        isToday ? 'bg-amber-500' : 'bg-primary'
                      }`} />
                      <div>
                        <h4 className="text-sm font-medium">{task.title}</h4>
                        <p className="text-xs text-muted-foreground">
                          {task.home_id && homes.find(h => h.id === task.home_id)?.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className={`text-xs ${
                        isToday ? 'text-amber-600 font-medium' : 'text-muted-foreground'
                      }`}>
                        {dueDateText}
                      </span>
                      <Button variant="ghost" size="sm" className="ml-2 h-8 w-8 p-0">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
              
              {upcomingTasks.length > 5 && (
                <div className="text-center pt-2">
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab('tasks')}>
                    View {upcomingTasks.length - 5} more tasks
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Subscription Status */}
        {renderSubscriptionStatus()}
      </div>
    );
  };

  // Render subscription plan section
  const renderPlan = () => {
    const isSubscribed = userData?.subscription_status === 'active';
    const plan = userData?.subscription_plan || 'free';
    const endDate = userData?.subscription_end_date 
      ? new Date(userData.subscription_end_date) 
      : null;
    
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Subscription</h1>
          <p className="text-muted-foreground mt-1">
            Manage your MaintainMint subscription plan
          </p>
        </div>
        
        <div className="bg-white border border-border/40 rounded-md shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border/40">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-medium">Current Plan</h2>
                <p className="text-muted-foreground text-sm mt-1">
                  {isSubscribed 
                    ? "Your subscription is active" 
                    : "You are currently on the free plan"}
                </p>
              </div>
              <div className="bg-primary/10 p-2 rounded-md">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
            </div>
            
            <div className="mt-4">
              <div className="flex items-baseline">
                <h3 className="text-2xl font-semibold capitalize">{plan}</h3>
                {isSubscribed && (
                  <span className="ml-2 text-sm text-muted-foreground">
                    {endDate ? `Renews on ${format(endDate, 'MMMM d, yyyy')}` : ''}
                  </span>
                )}
              </div>
              
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-background p-4 rounded-md">
                  <h4 className="text-sm font-medium mb-2">Plan Features</h4>
                  <ul className="space-y-2">
                    {plan === 'premium' ? (
                      <>
                        <li className="flex items-center text-sm">
                          <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                          Unlimited homes
                        </li>
                        <li className="flex items-center text-sm">
                          <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                          AI-powered maintenance recommendations
                        </li>
                        <li className="flex items-center text-sm">
                          <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                          Priority support
                        </li>
                        <li className="flex items-center text-sm">
                          <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                          Advanced analytics
                        </li>
                      </>
                    ) : plan === 'pro' ? (
                      <>
                        <li className="flex items-center text-sm">
                          <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                          Up to 5 homes
                        </li>
                        <li className="flex items-center text-sm">
                          <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                          AI-powered maintenance recommendations
                        </li>
                        <li className="flex items-center text-sm">
                          <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                          Email support
                        </li>
                      </>
                    ) : (
                      <>
                        <li className="flex items-center text-sm">
                          <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                          Up to 1 home
                        </li>
                        <li className="flex items-center text-sm">
                          <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                          Basic maintenance tracking
                        </li>
                      </>
                    )}
                  </ul>
                </div>
                
                <div className="bg-background p-4 rounded-md">
                  <h4 className="text-sm font-medium mb-2">Subscription Management</h4>
                  <div className="space-y-3">
                    {isSubscribed ? (
                      <>
                        <Button 
                          variant="outline" 
                          className="w-full justify-start"
                          onClick={() => navigate('/settings/billing')}
                        >
                          Manage Billing
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => navigate('/settings/cancel-subscription')}
                        >
                          Cancel Subscription
                        </Button>
                      </>
                    ) : (
                      <Button 
                        className="w-full justify-start"
                        onClick={() => navigate('/pricing')}
                      >
                        Upgrade Plan
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-6 bg-background/50">
            <h3 className="text-base font-medium mb-3">Available Plans</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`border rounded-md p-4 ${plan === 'free' ? 'border-primary bg-primary/5' : 'border-border/40'}`}>
                <h4 className="font-medium">Free</h4>
                <p className="text-2xl font-semibold mt-2">$0<span className="text-sm font-normal text-muted-foreground">/month</span></p>
                <p className="text-sm text-muted-foreground mt-2">Basic home maintenance tracking for one property</p>
              </div>
              
              <div className={`border rounded-md p-4 ${plan === 'pro' ? 'border-primary bg-primary/5' : 'border-border/40'}`}>
                <h4 className="font-medium">Pro</h4>
                <p className="text-2xl font-semibold mt-2">$9.99<span className="text-sm font-normal text-muted-foreground">/month</span></p>
                <p className="text-sm text-muted-foreground mt-2">Advanced features for up to 5 properties</p>
              </div>
              
              <div className={`border rounded-md p-4 ${plan === 'premium' ? 'border-primary bg-primary/5' : 'border-border/40'}`}>
                <h4 className="font-medium">Premium</h4>
                <p className="text-2xl font-semibold mt-2">$19.99<span className="text-sm font-normal text-muted-foreground">/month</span></p>
                <p className="text-sm text-muted-foreground mt-2">Unlimited properties with all premium features</p>
              </div>
            </div>
            
            <div className="mt-4 text-center">
              <Button 
                variant="outline"
                onClick={() => navigate('/pricing')}
              >
                Compare Plans
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navbar */}
      <DashboardNavbar />
      
      {/* Main Content */}
      <div className="flex flex-grow">
        {/* Sidebar - fixed width */}
        <aside className="w-[220px] bg-white border-r border-border/40 min-h-[calc(100vh-64px)] flex-shrink-0">
          <div className="p-4 pb-2">
            <h2 className="text-sm font-medium text-muted-foreground">MENU</h2>
          </div>
          <nav className="space-y-1 px-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full text-left px-3 py-2 rounded-md flex items-center space-x-3 text-sm ${
                activeTab === 'overview' 
                  ? 'bg-primary/10 text-primary font-medium' 
                  : 'text-foreground hover:bg-background'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Overview</span>
            </button>
            
            <button
              onClick={() => setActiveTab('tasks')}
              className={`w-full text-left px-3 py-2 rounded-md flex items-center space-x-3 text-sm ${
                activeTab === 'tasks' 
                  ? 'bg-primary/10 text-primary font-medium' 
                  : 'text-foreground hover:bg-background'
              }`}
            >
              <ClipboardList className="h-4 w-4" />
              <span>Tasks</span>
            </button>
            
            <button
              onClick={() => setActiveTab('homes')}
              className={`w-full text-left px-3 py-2 rounded-md flex items-center space-x-3 text-sm ${
                activeTab === 'homes' 
                  ? 'bg-primary/10 text-primary font-medium' 
                  : 'text-foreground hover:bg-background'
              }`}
            >
              <HomeIcon className="h-4 w-4" />
              <span>Homes</span>
            </button>
            
            <button
              onClick={() => setActiveTab('plan')}
              className={`w-full text-left px-3 py-2 rounded-md flex items-center space-x-3 text-sm ${
                activeTab === 'plan' 
                  ? 'bg-primary/10 text-primary font-medium' 
                  : 'text-foreground hover:bg-background'
              }`}
            >
              <Sparkles className="h-4 w-4" />
              <span>Subscription</span>
            </button>
          </nav>
          
          {/* User section at bottom */}
          <div className="absolute bottom-0 left-0 w-full p-4 border-t border-border/40">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-medium">
                {userData?.name ? userData.name.substring(0, 2).toUpperCase() : 'U'}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-medium truncate">{userData?.name || 'User'}</p>
                <p className="text-xs text-muted-foreground truncate">{userData?.email || ''}</p>
              </div>
            </div>
          </div>
        </aside>
        
        {/* Main Content Area */}
        <main className="flex-1 p-6 bg-background overflow-auto">
          <div className="max-w-6xl mx-auto">
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'tasks' && renderTasks()}
            {activeTab === 'homes' && renderHomes()}
            {activeTab === 'plan' && renderPlan()}
            
            {/* Task Modal */}
            {selectedTask && (
              <TaskModal
                isOpen={!!selectedTask}
                task={selectedTask}
                onClose={() => setSelectedTask(null)}
                onComplete={() => {
                  if (selectedTask) {
                    void handleTaskComplete(selectedTask.id);
                  }
                }}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
