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
  
  // Format estimated time
  const estimatedTime = task.estimated_time;
  
  // Format cost to USD
  const formattedCost = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(task.estimated_cost);
  
  return (
    <Card className="relative overflow-hidden">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-semibold">{task.title}</CardTitle>
            <CardDescription className="mt-1">{task.description}</CardDescription>
          </div>
          <Badge variant={isOverdue ? "destructive" : "secondary"}>
            {task.priority || 'medium'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Due: {formattedDate}</span>
            {isOverdue && (
              <Badge variant="destructive" className="ml-2">Overdue</Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Estimated time: {estimatedTime}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium">Estimated cost: {formattedCost}</span>
          </div>
          
          {task.subtasks && task.subtasks.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Subtasks:</h4>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                {task.subtasks.map((subtask, index) => (
                  <li key={index}>{subtask}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        {onAddToTasks && (
          <Button 
            variant="default" 
            className="w-full"
            onClick={() => onAddToTasks(task)}
          >
            Add to Tasks
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
        
        {onViewDetails && (
          <Button 
            variant="outline" 
            className="w-full ml-2"
            onClick={() => onViewDetails(task)}
          >
            View Details
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default AITaskCard; 