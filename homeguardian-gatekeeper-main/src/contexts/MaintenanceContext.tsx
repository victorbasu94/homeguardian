import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the interface for a maintenance task
export interface MaintenanceTask {
  task: string;
  taskDescription: string;
  suggestedCompletionDate: string;
  estimatedCost: number;
  estimatedTime: string;
  subTasks: string[];
}

// Define the interface for the maintenance plan
export interface MaintenancePlan {
  maintenancePlan: MaintenanceTask[];
}

// Define the context interface
interface MaintenanceContextType {
  maintenanceTasks: MaintenanceTask[];
  setMaintenanceTasks: React.Dispatch<React.SetStateAction<MaintenanceTask[]>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
}

// Create the context with default values
const MaintenanceContext = createContext<MaintenanceContextType>({
  maintenanceTasks: [],
  setMaintenanceTasks: () => {},
  isLoading: false,
  setIsLoading: () => {},
  error: null,
  setError: () => {},
});

// Create a provider component
export const MaintenanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [maintenanceTasks, setMaintenanceTasks] = useState<MaintenanceTask[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <MaintenanceContext.Provider
      value={{
        maintenanceTasks,
        setMaintenanceTasks,
        isLoading,
        setIsLoading,
        error,
        setError,
      }}
    >
      {children}
    </MaintenanceContext.Provider>
  );
};

// Create a hook to use the context
export const useMaintenance = () => useContext(MaintenanceContext);

// Mock data for development environment
export const MOCK_MAINTENANCE_TASKS: MaintenanceTask[] = [
  {
    task: "Inspect roof",
    taskDescription: "Check for damaged shingles, leaks, and clean gutters",
    suggestedCompletionDate: "2024-06-15",
    estimatedCost: 150,
    estimatedTime: "2 hours",
    subTasks: ["Check shingles", "Look for water damage", "Clean gutters"]
  },
  {
    task: "HVAC maintenance",
    taskDescription: "Service heating and cooling systems before seasonal use",
    suggestedCompletionDate: "2024-05-01",
    estimatedCost: 200,
    estimatedTime: "3 hours",
    subTasks: ["Replace filters", "Clean condenser coils", "Check refrigerant levels"]
  },
  {
    task: "Check plumbing",
    taskDescription: "Inspect for leaks and water damage throughout the home",
    suggestedCompletionDate: "2024-04-30",
    estimatedCost: 100,
    estimatedTime: "1 hour",
    subTasks: ["Check under sinks", "Inspect water heater", "Test water pressure"]
  },
  {
    task: "Clean dryer vent",
    taskDescription: "Remove lint buildup to prevent fire hazards",
    suggestedCompletionDate: "2024-04-20",
    estimatedCost: 80,
    estimatedTime: "1 hour",
    subTasks: ["Disconnect dryer", "Clean vent pipe", "Check exterior vent"]
  },
  {
    task: "Test smoke detectors",
    taskDescription: "Ensure all smoke and carbon monoxide detectors are working",
    suggestedCompletionDate: "2024-04-10",
    estimatedCost: 30,
    estimatedTime: "30 minutes",
    subTasks: ["Test all units", "Replace batteries", "Replace any faulty detectors"]
  }
]; 