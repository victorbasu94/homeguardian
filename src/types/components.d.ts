declare module '@/components/dashboard/AIMaintenanceTasks' {
  interface AIMaintenanceTasksProps {
    homeId?: string;
  }
  const AIMaintenanceTasks: React.FC<AIMaintenanceTasksProps>;
  export default AIMaintenanceTasks;
}

declare module '@/components/dashboard/AITaskCard' {
  import { MaintenanceTask } from '@/contexts/MaintenanceContext';
  
  interface AITaskCardProps {
    task: MaintenanceTask;
    onAddToTasks?: (task: MaintenanceTask) => void;
    onViewDetails?: (task: MaintenanceTask) => void;
  }
  const AITaskCard: React.FC<AITaskCardProps>;
  export default AITaskCard;
} 