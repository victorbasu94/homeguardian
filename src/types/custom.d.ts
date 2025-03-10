declare module '@/lib/maintenanceApi' {
  import { MaintenanceTask } from '@/contexts/MaintenanceContext';

  interface HomeDetails {
    id: string;
    location: string;
    year_built: number;
    square_footage: number;
    roof_type?: string;
    hvac_type?: string;
  }

  interface MaintenancePlan {
    home_id: string;
    tasks: MaintenanceTask[];
    generated_at: string;
  }

  export function getMaintenancePlan(homeDetails: HomeDetails): Promise<MaintenancePlan>;
}

declare module '@/contexts/MaintenanceContext' {
  export interface MaintenanceTask {
    title: string;
    description: string;
    due_date: string;
    status?: 'pending' | 'completed';
    priority?: 'high' | 'medium' | 'low';
    category?: string;
    estimated_time: string;
    estimated_cost: number;
    subtasks: string[];
    home_id?: string;
    id?: string;
  }

  export interface MaintenanceContextType {
    maintenanceTasks: MaintenanceTask[];
    setMaintenanceTasks: React.Dispatch<React.SetStateAction<MaintenanceTask[]>>;
    isLoading: boolean;
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
    error: string | null;
    setError: React.Dispatch<React.SetStateAction<string | null>>;
  }

  export function useMaintenance(): MaintenanceContextType;
}

// Add Vite's ImportMeta interface
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_OPENAI_API_KEY: string;
  readonly VITE_STRIPE_PUBLISHABLE_KEY: string;
  readonly VITE_STRIPE_PRICE_ID: string;
  readonly VITE_STRIPE_TRIAL_PRICE_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
} 