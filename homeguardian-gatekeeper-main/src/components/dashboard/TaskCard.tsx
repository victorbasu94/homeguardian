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
        <Badge variant="outline" className="bg-green-100 text-green-800 flex items-center gap-1">
          <CheckCircle className="w-3 h-3" /> Completed
        </Badge>
      );
    }
    
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
  
  const getPriorityBadge = () => {
    switch (task.priority) {
      case 'high':
        return <Badge variant="outline" className="bg-red-50 text-red-700">High</Badge>;
      case 'medium':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700">Medium</Badge>;
      default:
        return <Badge variant="outline" className="bg-blue-50 text-blue-700">Low</Badge>;
    }
  };
  
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="bg-muted/50 pb-3">
        <div className="flex justify-between items-start">
          <div>
            {task.is_ai_generated && (
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="h-4 w-4 text-primary" />
                <Badge variant="secondary" className="text-xs">AI Generated</Badge>
              </div>
            )}
            <CardTitle className="text-lg">{task.title}</CardTitle>
            <CardDescription>{task.description}</CardDescription>
          </div>
          <div className="flex flex-col gap-2 items-end">
            {task.estimated_cost !== undefined && (
              <Badge variant="outline" className="ml-2">
                ${task.estimated_cost}
              </Badge>
            )}
            {getPriorityBadge()}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {getStatusBadge()}
            <span className="text-muted-foreground text-sm">
              {format(dueDate, 'MMM d, yyyy')}
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            {task.estimated_time ? `${task.estimated_time} min` : ''}
          </div>
        </div>
        
        {task.sub_tasks && task.sub_tasks.length > 0 && (
          <div className="mt-2">
            <h4 className="text-sm font-medium mb-2">Subtasks:</h4>
            <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
              {task.sub_tasks.map((subtask, idx) => (
                <li key={idx}>{subtask}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between pt-2 pb-3 gap-2">
        {task.status !== 'completed' && (
          <Button 
            variant="default" 
            size="sm" 
            onClick={() => onComplete(task.id)}
            className="w-full"
          >
            Complete
          </Button>
        )}
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => onViewDetails(task)}
          className="w-full"
        >
          View Details <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TaskCard; 