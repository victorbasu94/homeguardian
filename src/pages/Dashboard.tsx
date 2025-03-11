import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getMaintenancePlan, MaintenancePlan } from '@/lib/maintenanceApi';
import { useMaintenance, MaintenanceTask } from '@/contexts/MaintenanceContext';
import { MOCK_MAINTENANCE_TASKS } from '@/lib/mockData';
import AIMaintenanceTasks from '@/components/dashboard/AIMaintenanceTasks';

// Use MaintenanceTask interface instead of redefining Task
type Task = MaintenanceTask;

interface HomeData {
  id: string;
  name: string;
  location: string;
  year_built: number;
  square_footage: number;
  roof_type?: string;
  hvac_type?: string;
}

// Add this interface at the top of the file, after the imports
interface TasksApiResponse {
  data: any[];
  message?: string;
}

// Add this interface after the TasksApiResponse interface
interface MaintenancePlanResponse extends MaintenancePlan {
  message?: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedHome, setSelectedHome] = useState<HomeData | null>(null);
  const { maintenanceTasks, setMaintenanceTasks, updateTasks, setIsLoading, setError, setCurrentHomeId } = useMaintenance();
  const { toast } = useToast();
  
  // Effect to load the user's homes when the component mounts
  useEffect(() => {
    const loadUserHomes = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/homes`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to load homes');
        }
        
        const data = await response.json();
        if (data.homes && data.homes.length > 0) {
          // Select the first home by default
          handleHomeSelect(data.homes[0]);
        }
      } catch (error) {
        console.error('Error loading homes:', error);
        toast({
          title: 'Error',
          description: 'Failed to load your homes. Please try again.',
          variant: 'destructive'
        });
      }
    };
    
    loadUserHomes();
  }, []);
  
  const fetchTasks = async (homeId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // First, clear any existing tasks to prevent showing previous user's tasks
      setMaintenanceTasks([]);
      
      // Set the current home ID
      setCurrentHomeId(homeId);
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/tasks/${homeId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || `Failed to fetch tasks: ${response.status}`);
      }
      
      const data = await response.json() as TasksApiResponse;
      
      // If we have tasks, use them regardless of the message
      if (data.data && data.data.length > 0) {
        // Verify that the tasks belong to the current user's home
        const tasksForCurrentHome = data.data.filter((task: any) => 
          task.home_id === homeId || task.homeId === homeId
        );
        
        if (tasksForCurrentHome.length > 0) {
          console.log('Found existing tasks for home:', tasksForCurrentHome.length);
          // Map the tasks to the expected format
          const formattedTasks = tasksForCurrentHome.map((task: any) => {
            // Check if the task has steps or subtasks
            const subtasks = task.subtasks || 
                            (task.steps && Array.isArray(task.steps)) 
                              ? task.steps.map((step: any) => typeof step === 'string' ? step : step.description)
                              : [];
            
            // Create a task object with both naming conventions for compatibility
            return {
              id: task._id || task.id,
              title: task.title || task.task_name || task.task,
              description: task.description || task.taskDescription,
              due_date: task.due_date || task.suggestedCompletionDate,
              status: (task.completed || task.status === 'completed' ? 'completed' : 'pending') as 'completed' | 'pending',
              priority: task.priority as 'low' | 'medium' | 'high',
              category: task.category,
              estimated_time: task.estimated_time || task.estimatedTime || '1 hour',
              estimated_cost: task.estimated_cost || task.estimatedCost || 0,
              subtasks: subtasks,
              home_id: homeId,
              homeId: homeId,
              
              // Add alternative property names for compatibility
              task: task.title || task.task_name || task.task,
              taskDescription: task.description || task.taskDescription,
              suggestedCompletionDate: task.due_date || task.suggestedCompletionDate,
              estimatedCost: task.estimated_cost || task.estimatedCost || 0,
              estimatedTime: task.estimated_time || task.estimatedTime || '1 hour',
              subTasks: subtasks
            };
          });
          
          console.log('Formatted existing tasks for frontend:', formattedTasks);
          updateTasks(formattedTasks, homeId);
          return;
        }
      }
      
      // If we reach here, we have no tasks. Check if we should generate new ones
      if (data.message?.includes('less than 3 months')) {
        // We shouldn't generate new tasks yet
        toast({
          title: "No tasks found",
          description: "New tasks can only be generated once every 3 months. Please check back later.",
          duration: 5000,
        });
        setMaintenanceTasks([]);
        return;
      }
      
      // If the home is new (no tasks and no 3-month message), generate initial plan
      if (selectedHome && !localStorage.getItem(`tasks_generated_${homeId}`)) {
        console.log('Generating initial maintenance plan for new home');
        await fetchMaintenancePlan(selectedHome);
        // Mark that we've generated tasks for this home
        localStorage.setItem(`tasks_generated_${homeId}`, 'true');
      } else {
        setError('No maintenance tasks found for this home.');
        setMaintenanceTasks([]);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Unknown error occurred while fetching tasks";
      setError(`Failed to load tasks: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleHomeSelect = (home: HomeData) => {
    setSelectedHome(home);
    if (home.id) {
      fetchTasks(home.id);
    }
  };

  const handleTaskClick = (task: Task) => {
    navigate(`/tasks/${task.id}`);
  };

  // Fetch maintenance plan from OpenAI
  const fetchMaintenancePlan = async (home: HomeData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Clear any existing tasks to prevent showing previous user's tasks
      setMaintenanceTasks([]);
      
      // Set the current home ID
      setCurrentHomeId(home.id);
      
      // Convert HomeData to HomeDetails format expected by getMaintenancePlan
      const homeDetails = {
        id: home.id,
        location: home.location,
        year_built: home.year_built,
        square_footage: home.square_footage,
        roof_type: home.roof_type,
        hvac_type: home.hvac_type
      };
      
      console.log('Generating new maintenance plan for home:', home.id);
      
      // Call the API to get maintenance plan
      const maintenancePlan = await getMaintenancePlan(homeDetails) as MaintenancePlanResponse;
      
      console.log('Raw maintenance plan from API:', JSON.stringify(maintenancePlan));
      
      // If we got tasks back, update the context
      if (maintenancePlan && maintenancePlan.tasks && maintenancePlan.tasks.length > 0) {
        console.log("Maintenance plan generated successfully with", maintenancePlan.tasks.length, "tasks");
        
        // Check if the response includes a message about using existing tasks
        if (maintenancePlan.message && maintenancePlan.message.includes('existing maintenance plan')) {
          // Show a toast notification to inform the user
          toast({
            title: "Using existing maintenance plan",
            description: "New tasks are only generated once every 3 months. Using your existing maintenance plan.",
            duration: 5000,
          });
        } else {
          // Show a success notification for new plan generation
          toast({
            title: "Maintenance Plan Generated",
            description: "Your AI-generated maintenance plan is ready.",
            duration: 3000,
          });
        }
        
        // Format the tasks to ensure they match the expected format
        const formattedTasks = maintenancePlan.tasks.map((task: any) => {
          // Check if the task has steps or subtasks
          const subtasks = task.subtasks || 
                          (task.steps && Array.isArray(task.steps)) 
                            ? task.steps.map((step: any) => typeof step === 'string' ? step : step.description)
                            : [];
          
          // Create a task object with both naming conventions for compatibility
          return {
            id: task._id || task.id || `new-task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            title: task.title || task.task_name || task.task,
            description: task.description || task.taskDescription,
            due_date: task.due_date || task.suggestedCompletionDate,
            status: (task.completed || task.status === 'completed' ? 'completed' : 'pending') as 'completed' | 'pending',
            priority: task.priority as 'low' | 'medium' | 'high',
            category: task.category,
            estimated_time: task.estimated_time || task.estimatedTime || '1 hour',
            estimated_cost: task.estimated_cost || task.estimatedCost || 0,
            subtasks: subtasks,
            home_id: home.id, // Always use the current home's ID
            homeId: home.id, // Add homeId property for compatibility
            
            // Add alternative property names for compatibility
            task: task.title || task.task_name || task.task,
            taskDescription: task.description || task.taskDescription,
            suggestedCompletionDate: task.due_date || task.suggestedCompletionDate,
            estimatedCost: task.estimated_cost || task.estimatedCost || 0,
            estimatedTime: task.estimated_time || task.estimatedTime || '1 hour',
            subTasks: subtasks
          };
        });
        
        console.log('Formatted maintenance tasks for frontend:', JSON.stringify(formattedTasks));
        
        // Save the generated tasks to the backend
        await saveTasksToBackend(formattedTasks, home.id);
        
        // Use the new updateTasks function for more reliable updates
        updateTasks(formattedTasks, home.id);
      } else {
        // This shouldn't happen as the API should throw an error if no tasks are returned
        console.error("No tasks in maintenance plan");
        throw new Error("No maintenance tasks were found in the plan");
      }
    } catch (error) {
      console.error("Error fetching maintenance plan:", error);
      setError("Failed to generate maintenance plan. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Save tasks to backend
  const saveTasksToBackend = async (tasks: MaintenanceTask[], homeId: string) => {
    try {
      console.log(`Saving ${tasks.length} tasks for home ID: ${homeId}`);
      
      // Save each task to the backend
      for (const task of tasks) {
        // Ensure the task is associated with the current home
        const taskToSave = {
          ...task,
          home_id: homeId, // Explicitly set the home_id to the current home
          homeId: homeId   // Also set homeId for compatibility
        };
        
        console.log(`Saving task "${taskToSave.title}" for home ID: ${homeId}`);
        
        await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/tasks`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          },
          body: JSON.stringify({
            home_id: homeId,
            task_name: taskToSave.title,
            description: taskToSave.description,
            due_date: taskToSave.due_date,
            priority: taskToSave.priority,
            category: taskToSave.category,
            estimated_time: taskToSave.estimated_time,
            estimated_cost: taskToSave.estimated_cost,
            steps: taskToSave.subtasks.map((subtask, index) => ({
              step_number: index + 1,
              description: subtask
            }))
          })
        });
      }
      
      toast({
        title: 'Success',
        description: 'Maintenance tasks have been saved to your account.',
        duration: 3000
      });
    } catch (error) {
      console.error('Error saving tasks to backend:', error);
      toast({
        title: 'Error',
        description: 'Failed to save maintenance tasks. Please try again.',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Add your dashboard JSX here */}
      <div className="space-y-8">
        {selectedHome ? (
          <>
            <div>
              <h2 className="text-xl font-semibold mb-4">Home: {selectedHome.name}</h2>
              <p className="text-sm text-muted-foreground mb-2">Location: {selectedHome.location}</p>
              <p className="text-sm text-muted-foreground mb-4">Year Built: {selectedHome.year_built}</p>
              
              {/* Debug info - can be removed in production */}
              <div className="text-xs text-muted-foreground mb-4">
                <p>Tasks in context: {maintenanceTasks.length}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    console.log('Current tasks in context:', maintenanceTasks);
                    if (selectedHome) {
                      fetchMaintenancePlan(selectedHome);
                    }
                  }}
                  className="mt-2"
                >
                  Refresh Tasks
                </Button>
              </div>
            </div>
            <AIMaintenanceTasks homeId={selectedHome.id} />
          </>
        ) : (
          <div className="text-center">
            <h2 className="text-xl font-semibold">Select a home to view maintenance tasks</h2>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 