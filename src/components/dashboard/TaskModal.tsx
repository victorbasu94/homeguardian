import React from 'react';
import { format } from 'date-fns';
import { X, Calendar, Clock, DollarSign, CheckCircle } from 'lucide-react';
import { MaintenanceTask } from '@/contexts/MaintenanceContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface TaskModalProps {
  isOpen: boolean;
  task: MaintenanceTask;
  onClose: () => void;
  onComplete: () => void;
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, task, onClose, onComplete }) => {
  // Format the due date
  const dueDate = new Date(task.due_date);
  const formattedDate = format(dueDate, 'MMMM d, yyyy');
  
  const isCompleted = task.status === 'completed';
  
  // Get priority with fallback to 'medium'
  const priority = task.priority || 'medium';
  const priorityDisplay = priority.charAt(0).toUpperCase() + priority.slice(1);
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">{task.title}</DialogTitle>
          <DialogDescription className="text-base text-foreground/80 mt-2">
            {task.description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 my-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Due: {formattedDate}</span>
            </div>
            <Badge variant={priority === 'high' ? 'destructive' : priority === 'medium' ? 'default' : 'outline'}>
              {priorityDisplay} Priority
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Time: {task.estimated_time}</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Cost: ${task.estimated_cost}</span>
            </div>
          </div>
          
          {task.subtasks && task.subtasks.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Steps:</h4>
              <ul className="list-disc pl-5 text-sm space-y-1">
                {task.subtasks.map((step, idx) => (
                  <li key={idx} className="text-muted-foreground">{step}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {!isCompleted && (
            <Button 
              variant="default" 
              className="gap-2" 
              onClick={onComplete}
            >
              <CheckCircle className="h-4 w-4" />
              Mark as Complete
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TaskModal; 