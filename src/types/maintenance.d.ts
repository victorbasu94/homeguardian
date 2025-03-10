declare module '@/contexts/MaintenanceContext' {
  export interface MaintenanceTask {
    id: string;
    title: string;
    description: string;
    due_date: string;
    status?: 'pending' | 'completed' | 'overdue';
    priority?: 'low' | 'medium' | 'high';
    estimated_cost?: number;
    estimated_time?: string | number;
    subtasks?: string[];
    home_id?: string;
    category?: string;
  }

  export interface MaintenanceContextType {
    maintenanceTasks: MaintenanceTask[];
    setMaintenanceTasks: (tasks: MaintenanceTask[]) => void;
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;
    error: string | null;
    setError: (error: string | null) => void;
  }

  export const useMaintenance: () => MaintenanceContextType;
} 