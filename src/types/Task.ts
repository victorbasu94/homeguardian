export interface Task {
  id: string;
  title: string;
  description: string;
  due_date: string;
  status: 'completed' | 'pending';
  priority: 'low' | 'medium' | 'high';
  category: string;
  estimated_time: string;
  estimated_cost: number;
  subtasks: string[];
  home_id: string;
  homeId: string;
  
  // Alternative property names for compatibility
  task?: string;
  taskDescription?: string;
  suggestedCompletionDate?: string;
  estimatedCost?: number;
  estimatedTime?: string;
  subTasks?: string[];
} 