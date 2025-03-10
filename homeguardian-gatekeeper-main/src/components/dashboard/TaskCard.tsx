import React from 'react';
import { format, isPast, isToday, isTomorrow, addDays } from 'date-fns';
import { Calendar, Clock, AlertTriangle, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export interface TaskData {
  id: string;
  title: string;
  description: string;
  due_date: string;
  status: 'pending' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high';
  home_id: string;
  category: string;
  estimated_time?: number;
  estimated_cost?: number;
  is_ai_generated?: boolean;
  sub_tasks?: string[];
}

interface TaskCardProps {
  task: TaskData;
  onComplete: (taskId: string) => void;
  onViewDetails: (task: TaskData) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onComplete, onViewDetails }) => {
  const dueDate = new Date(task.due_date);
  const isOverdue = isPast(dueDate) && !isToday(dueDate);
  const isDueToday = isToday(dueDate);
  const isDueTomorrow = isTomorrow(dueDate);
  const isDueSoon = !isOverdue && !isDueToday && !isDueTomorrow && dueDate <= addDays(new Date(), 7);
  
  const getStatusBadge = () => {
    if (task.status === 'completed') {
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 text-xs font-normal flex items-center gap-1">
          <CheckCircle className="w-3 h-3" /> Completed
        </Badge>
      );
    }
    
    if (isOverdue) {
      return (
        <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200 text-xs font-normal flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" /> Overdue
        </Badge>
      );
    }
    
    if (isDueToday) {
      return (
        <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200 text-xs font-normal flex items-center gap-1">
          <Clock className="w-3 h-3" /> Due Today
        </Badge>
      );
    }
    
    if (isDueTomorrow) {
      return (
        <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200 text-xs font-normal flex items-center gap-1">
          <Clock className="w-3 h-3" /> Due Tomorrow
        </Badge>
      );
    }
    
    if (isDueSoon) {
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 text-xs font-normal flex items-center gap-1">
          <Calendar className="w-3 h-3" /> Due Soon
        </Badge>
      );
    }
    
    return (
      <Badge variant="outline" className="text-xs font-normal flex items-center gap-1">
        <Calendar className="w-3 h-3" /> Upcoming
      </Badge>
    );
  };
  
  const getPriorityBadge = () => {
    switch (task.priority) {
      case 'high':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200 text-xs font-normal">High</Badge>;
      case 'medium':
        return <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200 text-xs font-normal">Medium</Badge>;
      default:
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200 text-xs font-normal">Low</Badge>;
    }
  };
  
  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-card-hover">
      <CardHeader className="pb-2 bg-muted/5">
        <div className="flex justify-between items-start">
          <div>
            {task.is_ai_generated && (
              <div className="flex items-center gap-1.5 mb-1">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs font-normal">AI Generated</Badge>
              </div>
            )}
            <CardTitle className="text-sm font-medium">{task.title}</CardTitle>
            <CardDescription className="text-xs mt-1 line-clamp-2">{task.description}</CardDescription>
          </div>
          <div className="flex flex-col gap-1.5 items-end">
            {task.estimated_cost !== undefined && (
              <Badge variant="outline" className="text-xs font-normal">
                ${task.estimated_cost}
              </Badge>
            )}
            {getPriorityBadge()}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 pb-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            {getStatusBadge()}
          </div>
          <div className="text-xs text-muted-foreground">
            {format(dueDate, 'MMM d, yyyy')}
            {task.estimated_time ? ` • ${task.estimated_time} min` : ''}
          </div>
        </div>
        
        {task.sub_tasks && task.sub_tasks.length > 0 && (
          <div className="mt-2">
            <h4 className="text-xs font-medium mb-1">Subtasks:</h4>
            <ul className="list-disc pl-4 text-xs text-muted-foreground space-y-0.5">
              {task.sub_tasks.slice(0, 2).map((subtask, idx) => (
                <li key={idx}>{subtask}</li>
              ))}
              {task.sub_tasks.length > 2 && (
                <li className="text-primary">+{task.sub_tasks.length - 2} more</li>
              )}
            </ul>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between pt-0 pb-3 gap-2">
        {task.status !== 'completed' && (
          <Button 
            variant="default" 
            size="sm" 
            onClick={() => onComplete(task.id)}
            className="w-full text-xs h-8"
          >
            Complete
          </Button>
        )}
        <Button 
          variant={task.status === 'completed' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => onViewDetails(task)}
          className="w-full text-xs h-8"
        >
          Details <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TaskCard; 