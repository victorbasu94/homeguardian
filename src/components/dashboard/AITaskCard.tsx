import React from 'react';
import { format, isPast, isToday, isTomorrow, addDays } from 'date-fns';
import { Calendar, Clock, AlertTriangle, CheckCircle, ArrowRight, Bot, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { MaintenanceTask } from '@/contexts/MaintenanceContext';

interface AITaskCardProps {
  task: MaintenanceTask;
  onAddToTasks?: (task: MaintenanceTask) => void;
  onViewDetails?: (task: MaintenanceTask) => void;
}

const AITaskCard: React.FC<AITaskCardProps> = ({ task, onAddToTasks, onViewDetails }) => {
  // Format the due date
  const dueDate = new Date(task.due_date);
  const formattedDate = format(dueDate, 'MMM d, yyyy');
  
  // Determine if task is overdue
  const isOverdue = isPast(dueDate) && !isToday(dueDate);
  const isDueToday = isToday(dueDate);
  const isDueTomorrow = isTomorrow(dueDate);
  const isDueSoon = !isOverdue && !isDueToday && !isDueTomorrow && dueDate <= addDays(new Date(), 7);
  
  const getStatusBadge = () => {
    if (isOverdue) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" /> Overdue
        </Badge>
      );
    }
    
    if (isDueToday) {
      return (
        <Badge variant="outline" className="bg-amber-100 text-amber-800 flex items-center gap-1">
          <Clock className="w-3 h-3" /> Due Today
        </Badge>
      );
    }
    
    if (isDueTomorrow) {
      return (
        <Badge variant="outline" className="bg-blue-100 text-blue-800 flex items-center gap-1">
          <Clock className="w-3 h-3" /> Due Tomorrow
        </Badge>
      );
    }
    
    if (isDueSoon) {
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800 flex items-center gap-1">
          <Calendar className="w-3 h-3" /> Due Soon
        </Badge>
      );
    }
    
    return (
      <Badge variant="outline" className="flex items-center gap-1">
        <Calendar className="w-3 h-3" /> Upcoming
      </Badge>
    );
  };
  
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="bg-muted/50 pb-3">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-4 w-4 text-primary" />
              <Badge variant="secondary" className="text-xs">AI Generated</Badge>
            </div>
            <CardTitle className="text-lg">{task.title}</CardTitle>
            <CardDescription>{task.description}</CardDescription>
          </div>
          <Badge variant="outline" className="ml-2">
            ${task.estimated_cost}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {getStatusBadge()}
            <span className="text-muted-foreground text-sm">
              {formattedDate}
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            {task.estimated_time}
          </div>
        </div>
        
        {task.subtasks && task.subtasks.length > 0 && (
          <div className="mt-2">
            <h4 className="text-sm font-medium mb-2">Subtasks:</h4>
            <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
              {task.subtasks.map((subtask, idx) => (
                <li key={idx}>{subtask}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between pt-2 pb-3">
        {onAddToTasks && (
          <Button 
            variant="default" 
            size="sm" 
            onClick={() => onAddToTasks(task)}
            className="w-full"
          >
            Add to My Tasks
          </Button>
        )}
        {onViewDetails && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onViewDetails(task)}
            className="w-full"
          >
            View Details <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default AITaskCard; 