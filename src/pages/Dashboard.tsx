import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Task {
  id: string;
  title: string;
  description: string;
  due_date: string;
  status: 'pending' | 'completed';
  priority: 'high' | 'medium' | 'low';
  category: string;
  estimated_time: string | number;
  estimated_cost: number;
  subtasks: string[];
  home_id: string;
}

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
  const [selectedHome, setSelectedHome] = useState<HomeData | null>(null);
  const [maintenanceTasks, setMaintenanceTasks] = useState<Task[]>([]);
  const [loadingMaintenanceTasks, setLoadingMaintenanceTasks] = useState(false);
  const [maintenanceError, setMaintenanceError] = useState<string | null>(null);

  const fetchTasks = async (homeId: string) => {
    setLoadingMaintenanceTasks(true);
    setMaintenanceError(null);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/tasks/${homeId}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || `Failed to fetch tasks: ${response.status}`);
      }
      
      const data = await response.json();
      if (!data.tasks || data.tasks.length === 0) {
        setMaintenanceError('No maintenance tasks found for this home.');
        setMaintenanceTasks([]);
      } else {
        setMaintenanceTasks(data.tasks);
      }
    } catch (error) {
      console.error("Error fetching maintenance plan:", error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Unknown error occurred while fetching maintenance plan";
      
      setMaintenanceError(`Failed to load maintenance plan: ${errorMessage}`);
      setMaintenanceTasks([]);
    } finally {
      setLoadingMaintenanceTasks(false);
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

  // ... rest of your component JSX ...
};

export default Dashboard; 