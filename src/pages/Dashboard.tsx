import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getMaintenancePlan } from '@/lib/maintenanceApi';
import { useMaintenance, MaintenanceTask } from '@/contexts/MaintenanceContext';
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

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedHome, setSelectedHome] = useState<HomeData | null>(null);
  const { maintenanceTasks, setMaintenanceTasks, setIsLoading, setError } = useMaintenance();
  
  const fetchTasks = async (homeId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/tasks/${homeId}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || `Failed to fetch tasks: ${response.status}`);
      }
      
      const data = await response.json();
      if (!data.tasks || data.tasks.length === 0) {
        setError('No maintenance tasks found for this home.');
        setMaintenanceTasks([]);
      } else {
        setMaintenanceTasks(data.tasks);
      }
    } catch (error) {
      console.error("Error fetching maintenance plan:", error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Unknown error occurred while fetching maintenance plan";
      
      setError(`Failed to load maintenance plan: ${errorMessage}`);
      setMaintenanceTasks([]);
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
      const maintenancePlan = await getMaintenancePlan(homeDetails);
      
      // If we got tasks back, update the context
      if (maintenancePlan && maintenancePlan.tasks && maintenancePlan.tasks.length > 0) {
        console.log("Maintenance plan fetched successfully:", maintenancePlan);
        
        // The tasks are already in the correct format, just add home_id
        const formattedTasks = maintenancePlan.tasks.map(task => ({
          ...task,
          home_id: home.id
        }));
        
        console.log("Formatted tasks:", formattedTasks);
        setMaintenanceTasks(formattedTasks);
      } else {
        // This shouldn't happen as the API should throw an error if no tasks are returned
        console.error("No tasks in maintenance plan");
        throw new Error("No maintenance tasks were found in the plan");
      }
    } catch (error) {
      console.error('Error fetching maintenance plan:', error);
      setError('Failed to generate maintenance plan. Please try again.');
      // Clear any existing tasks
      setMaintenanceTasks([]);
    } finally {
      setIsLoading(false);
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