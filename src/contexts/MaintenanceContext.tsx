import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';

// Define the interface for a maintenance task
export interface MaintenanceTask {
  id?: string;
  title: string;
  description: string;
  due_date: string;
  status?: 'pending' | 'completed' | 'overdue';
  priority?: 'low' | 'medium' | 'high';
  category?: string;
  estimated_time: string | number;
  estimated_cost: number;
  subtasks: string[];
  home_id?: string;
  
  // Alternative property names for compatibility with the gatekeeper project
  task?: string;
  taskDescription?: string;
  suggestedCompletionDate?: string;
  estimatedCost?: number;
  estimatedTime?: string | number;
  subTasks?: string[];
  homeId?: string; // Add homeId for compatibility
}

// Define the context type
export interface MaintenanceContextType {
  maintenanceTasks: MaintenanceTask[];
  setMaintenanceTasks: (tasks: MaintenanceTask[]) => void;
  updateTasks: (tasks: MaintenanceTask[], homeId: string) => void; // New function for more reliable updates
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  useMockData: boolean;
  setUseMockData: (useMock: boolean) => void;
  currentHomeId: string | null; // Track the current home ID
  setCurrentHomeId: (homeId: string | null) => void; // Set the current home ID
}

// Create the context
const MaintenanceContext = createContext<MaintenanceContextType | undefined>(undefined);

// Provider component
export const MaintenanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [maintenanceTasks, setMaintenanceTasks] = useState<MaintenanceTask[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useMockData, setUseMockData] = useState(false);
  const [currentHomeId, setCurrentHomeId] = useState<string | null>(null);

  // Clear tasks when the component mounts to ensure we don't show tasks from previous users
  useEffect(() => {
    setMaintenanceTasks([]);
  }, []);

  // More reliable way to update tasks with proper home ID
  const updateTasks = useCallback((tasks: MaintenanceTask[], homeId: string) => {
    console.log(`Updating ${tasks.length} tasks for home ID: ${homeId}`);
    
    // Ensure all tasks have the correct home_id and homeId
    const updatedTasks = tasks.map(task => ({
      ...task,
      home_id: homeId,
      homeId: homeId
    }));
    
    // Log the tasks before setting them
    console.log('Tasks to be set in context:', updatedTasks);
    
    // Set the tasks and the current home ID
    setMaintenanceTasks(updatedTasks);
    setCurrentHomeId(homeId);
    
    // Log after setting to verify
    console.log('Tasks set in context. Count:', updatedTasks.length);
  }, []);

  return (
    <MaintenanceContext.Provider
      value={{
        maintenanceTasks,
        setMaintenanceTasks,
        updateTasks,
        isLoading,
        setIsLoading,
        error,
        setError,
        useMockData,
        setUseMockData,
        currentHomeId,
        setCurrentHomeId
      }}
    >
      {children}
    </MaintenanceContext.Provider>
  );
};

// Custom hook to use the maintenance context
export const useMaintenance = () => {
  const context = useContext(MaintenanceContext);
  if (context === undefined) {
    throw new Error('useMaintenance must be used within a MaintenanceProvider');
  }
  return context;
}; 