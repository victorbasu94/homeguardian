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
  const { maintenanceTasks, setMaintenanceTasks, setIsLoading, setError } = useMaintenance();
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
      
      // Check if we got a message about tasks not being generated due to 3-month rule
      if (data.message && data.message.includes('less than 3 months')) {
        toast({
          title: "Using existing tasks",
          description: "New tasks are only generated once every 3 months.",
          duration: 5000,
        });
      }
      
      if (!data.data || data.data.length === 0) {
        // If no tasks found, try to generate a maintenance plan
        // But only if we don't have a message about the 3-month rule
        if (selectedHome && (!data.message || !data.message.includes('less than 3 months'))) {
          await fetchMaintenancePlan(selectedHome);
        } else {
          setError('No maintenance tasks found for this home.');
          setMaintenanceTasks([]);
        }
      } else {
        // Map the tasks to the expected format
        console.log('Raw tasks data from API:', data.data);
        const formattedTasks = data.data.map((task: any) => {
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
            home_id: task.home_id,
            
            // Add alternative property names for compatibility
            task: task.title || task.task_name || task.task,
            taskDescription: task.description || task.taskDescription,
            suggestedCompletionDate: task.due_date || task.suggestedCompletionDate,
            estimatedCost: task.estimated_cost || task.estimatedCost || 0,
            estimatedTime: task.estimated_time || task.estimatedTime || '1 hour',
            subTasks: subtasks
          };
        });
        
        console.log('Formatted tasks for frontend:', formattedTasks);
        setMaintenanceTasks(formattedTasks);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Unknown error occurred while fetching tasks";
      
      setError(`Failed to load tasks: ${errorMessage}`);
      
      // Don't automatically use mock data, let the user decide
      // if they want to use mock data through the UI button
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
      
      // Convert HomeData to HomeDetails format expected by getMaintenancePlan
      const homeDetails = {
        id: home.id,
        location: home.location,
        year_built: home.year_built,
        square_footage: home.square_footage,
        roof_type: home.roof_type,
        hvac_type: home.hvac_type
      };
      
      console.log('Fetching maintenance plan for home:', home.id);
      
      // Call the API to get maintenance plan
      const maintenancePlan = await getMaintenancePlan(homeDetails) as MaintenancePlanResponse;
      
      // If we got tasks back, update the context
      if (maintenancePlan && maintenancePlan.tasks && maintenancePlan.tasks.length > 0) {
        console.log("Maintenance plan fetched successfully:", maintenancePlan);
        
        // Check if the response includes a message about using existing tasks
        if (maintenancePlan.message && maintenancePlan.message.includes('existing maintenance plan')) {
          // Show a toast notification to inform the user
          toast({
            title: "Using existing maintenance plan",
            description: "New tasks are only generated once every 3 months. Using your existing maintenance plan.",
            duration: 5000,
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
            home_id: task.home_id || home.id,
            
            // Add alternative property names for compatibility
            task: task.title || task.task_name || task.task,
            taskDescription: task.description || task.taskDescription,
            suggestedCompletionDate: task.due_date || task.suggestedCompletionDate,
            estimatedCost: task.estimated_cost || task.estimatedCost || 0,
            estimatedTime: task.estimated_time || task.estimatedTime || '1 hour',
            subTasks: subtasks
          };
        });
        
        console.log('Formatted maintenance tasks for frontend:', formattedTasks);
        setMaintenanceTasks(formattedTasks);
      } else {
        // This shouldn't happen as the API should throw an error if no tasks are returned
        console.error("No tasks in maintenance plan");
        throw new Error("No maintenance tasks were found in the plan");
      }
    } catch (error) {
      console.error("Error fetching maintenance plan:", error);
      setError("Failed to fetch maintenance plan. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Save tasks to backend
  const saveTasksToBackend = async (tasks: MaintenanceTask[], homeId: string) => {
    try {
      // Save each task to the backend
      for (const task of tasks) {
        await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/tasks`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          },
          body: JSON.stringify({
            home_id: homeId,
            task_name: task.title,
            description: task.description,
            due_date: task.due_date,
            priority: task.priority,
            category: task.category,
            estimated_time: task.estimated_time,
            estimated_cost: task.estimated_cost,
            steps: task.subtasks.map((subtask, index) => ({
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