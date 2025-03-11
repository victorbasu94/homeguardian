import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

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
}

// Define the context type
export interface MaintenanceContextType {
  maintenanceTasks: MaintenanceTask[];
  setMaintenanceTasks: (tasks: MaintenanceTask[]) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  useMockData: boolean;
  setUseMockData: (useMock: boolean) => void;
}

// Create the context
const MaintenanceContext = createContext<MaintenanceContextType | undefined>(undefined);

// Provider component
export const MaintenanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [maintenanceTasks, setMaintenanceTasks] = useState<MaintenanceTask[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Default to using real data, not mock data
  const [useMockData, setUseMockData] = useState(false);

  // Clear tasks when the component mounts to ensure we don't show tasks from previous users
  useEffect(() => {
    setMaintenanceTasks([]);
  }, []);

  return (
    <MaintenanceContext.Provider
      value={{
        maintenanceTasks,
        setMaintenanceTasks,
        isLoading,
        setIsLoading,
        error,
        setError,
        useMockData,
        setUseMockData
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