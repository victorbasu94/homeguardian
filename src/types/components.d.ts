declare module '@/components/dashboard/AIMaintenanceTasks' {
  interface AIMaintenanceTasksProps {
    homeId?: string;
  }
  const AIMaintenanceTasks: React.FC<AIMaintenanceTasksProps>;
}

declare module '@/components/ui/alert' {
  export const Alert: React.FC<{
    variant?: 'default' | 'destructive';
    children: React.ReactNode;
  }>;
  export const AlertTitle: React.FC<{ children: React.ReactNode }>;
  export const AlertDescription: React.FC<{ children: React.ReactNode }>;
}

declare module '@/components/ui/button' {
  export const Button: React.FC<{
    variant?: 'default' | 'destructive' | 'outline' | 'ghost';
    size?: 'default' | 'sm' | 'lg';
    onClick?: () => void;
    children: React.ReactNode;
    className?: string;
  }>;
}

declare module 'lucide-react' {
  export const Sparkles: React.FC<{ className?: string }>;
  export const AlertCircle: React.FC<{ className?: string }>;
  export const Loader2: React.FC<{ className?: string }>;
}

declare module '@/components/dashboard' {
  import { MaintenanceTask } from '@/contexts/MaintenanceContext';
  
  export interface TaskModalProps {
    isOpen: boolean;
    task: MaintenanceTask;
    onClose: () => void;
    onComplete: () => void;
  }
  
  export interface AITaskCardProps {
    task: MaintenanceTask;
    onAddToTasks?: (task: MaintenanceTask) => void;
    onViewDetails?: (task: MaintenanceTask) => void;
  }
  
  export const TaskModal: React.FC<TaskModalProps>;
  export const AITaskCard: React.FC<AITaskCardProps>;
} 