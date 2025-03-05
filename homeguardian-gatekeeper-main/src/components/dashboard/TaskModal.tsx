import { X, Calendar, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from "@/components/ui/button";

export interface TaskData {
  id: string;
  title?: string;
  task_name?: string;
  description?: string;
  due_date: string;
  why?: string;
  completed?: boolean;
  status?: 'pending' | 'completed' | 'overdue';
  home_id: string;
  estimated_cost?: number;
  estimated_time?: number;
}

export interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: TaskData;
  onComplete: () => void;
}

const TaskModal = ({ isOpen, onClose, task, onComplete }: TaskModalProps) => {
  if (!isOpen) return null;
  
  // Format the due date
  const formattedDate = format(new Date(task.due_date), "MMMM d, yyyy");
  
  // Handle different property names for task name/title
  const taskTitle = task.task_name || task.title || "Task";
  
  // Check if task is completed
  const isCompleted = task.completed || task.status === 'completed';
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="p-6 border-b border-border/50">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">{taskTitle}</h3>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <Calendar className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Due Date</h4>
              <p className="font-medium">{formattedDate}</p>
            </div>
          </div>
          
          {task.why && (
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <AlertCircle className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Why It's Important</h4>
                <p>{task.why}</p>
              </div>
            </div>
          )}
          
          {task.description && !task.why && (
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <AlertCircle className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Description</h4>
                <p>{task.description}</p>
              </div>
            </div>
          )}
          
          {task.estimated_cost && (
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <DollarSign className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Estimated Cost</h4>
                <p className="font-medium">${task.estimated_cost.toFixed(2)}</p>
              </div>
            </div>
          )}
          
          <div className="bg-muted/20 border border-border/50 rounded-lg p-4 mt-6">
            <h4 className="font-medium mb-2">Maintenance Tips</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-primary mt-0.5" />
                <span>Regular maintenance helps prevent costly repairs later.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-primary mt-0.5" />
                <span>Consider hiring a professional for complex tasks.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-primary mt-0.5" />
                <span>Keep records of all maintenance for future reference.</span>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-6 border-t border-border/50 flex justify-end">
          {!isCompleted ? (
            <Button onClick={onComplete}>
              Mark as Completed
            </Button>
          ) : (
            <div className="flex items-center text-green-600 gap-2">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Task Completed</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskModal; 