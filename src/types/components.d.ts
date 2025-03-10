declare module '@/components/dashboard/AIMaintenanceTasks' {
  interface AIMaintenanceTasksProps {
    homeId?: string;
  }
  const AIMaintenanceTasks: React.FC<AIMaintenanceTasksProps>;
}

import { MaintenanceTask } from '@/contexts/MaintenanceContext';
import type { ReactNode } from 'react';

declare module '@/components/ui/alert' {
  interface AlertProps {
    variant?: 'default' | 'destructive';
    children: ReactNode;
  }

  export const Alert: React.FC<AlertProps>;
  export const AlertTitle: React.FC<{ children: ReactNode }>;
  export const AlertDescription: React.FC<{ children: ReactNode }>;
}

declare module '@/components/ui/button' {
  interface ButtonProps {
    variant?: 'default' | 'destructive' | 'outline' | 'ghost';
    size?: 'default' | 'sm' | 'lg';
    onClick?: () => void;
    children: ReactNode;
    className?: string;
  }

  export const Button: React.FC<ButtonProps>;
}

declare module 'lucide-react' {
  interface IconProps {
    className?: string;
  }

  export const Sparkles: React.FC<IconProps>;
  export const AlertCircle: React.FC<IconProps>;
  export const Loader2: React.FC<IconProps>;
}

declare module '@/components/dashboard' {
  interface TaskModalProps {
    isOpen: boolean;
    task: MaintenanceTask;
    onClose: () => void;
    onComplete: () => void;
  }

  interface AITaskCardProps {
    task: MaintenanceTask;
    onAddToTasks?: (task: MaintenanceTask) => void;
    onViewDetails?: (task: MaintenanceTask) => void;
  }

  export const TaskModal: React.FC<TaskModalProps>;
  export const AITaskCard: React.FC<AITaskCardProps>;
} 