import React from 'react';
import { format, isPast, isToday, isTomorrow, addDays } from 'date-fns';
import { Calendar, Clock, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
}

interface TaskCardProps {
  task: TaskData;
  onComplete: (taskId: string) => void;
  onViewDetails: (taskId: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onComplete, onViewDetails }) => {
  const dueDate = new Date(task.due_date);
  const isOverdue = isPast(dueDate) && !isToday(dueDate);
  const isDueToday = isToday(dueDate);
  const isDueTomorrow = isTomorrow(dueDate);
  const isDueSoon = !isOverdue && !isDueToday && !isDueTomorrow && dueDate <= addDays(new Date(), 7);
  
  const getPriorityColor = () => {
    switch (task.priority) {
      case 'high':
        return 'text-secondary';
      case 'medium':
        return 'text-tertiary';
      default:
        return 'text-primary';
    }
  };
  
  const getStatusBadge = () => {
    if (task.status === 'completed') {
      return (
        <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1">
          <CheckCircle className="w-3 h-3" /> Completed
        </span>
      );
    }
    
    if (isOverdue) {
      return (
        <span className="bg-secondary/10 text-secondary text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" /> Overdue
        </span>
      );
    }
    
    if (isDueToday) {
      return (
        <span className="bg-tertiary/10 text-tertiary-dark text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1">
          <Clock className="w-3 h-3" /> Due Today
        </span>
      );
    }
    
    if (isDueTomorrow) {
      return (
        <span className="bg-tertiary/10 text-tertiary-dark text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1">
          <Clock className="w-3 h-3" /> Due Tomorrow
        </span>
      );
    }
    
    if (isDueSoon) {
      return (
        <span className="bg-primary/10 text-primary text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1">
          <Calendar className="w-3 h-3" /> Due Soon
        </span>
      );
    }
    
    return (
      <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1">
        <Calendar className="w-3 h-3" /> Upcoming
      </span>
    );
  };
  
  return (
    <div className="task-card">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className={`text-xl font-bold mb-1 ${getPriorityColor()}`}>{task.title}</h3>
          <div className="flex items-center gap-2 mb-2">
            {getStatusBadge()}
            <span className="text-neutral/60 text-sm">
              {format(dueDate, 'MMM d, yyyy')}
            </span>
          </div>
        </div>
        
        {task.status !== 'completed' && (
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 rounded-full"
            onClick={() => onComplete(task.id)}
          >
            Complete
          </Button>
        )}
      </div>
      
      <p className="text-neutral/80 mb-6 line-clamp-3">{task.description}</p>
      
      <div className="mt-auto">
        <div className="flex justify-between items-center text-sm text-neutral/70 mb-4">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{task.estimated_time || '30'} min</span>
          </div>
          
          {task.estimated_cost && (
            <div>
              <span>${task.estimated_cost}</span>
            </div>
          )}
          
          <div>
            <span className="capitalize">{task.category}</span>
          </div>
        </div>
        
        <Button 
          variant="ghost" 
          className="w-full justify-between hover:bg-primary/5 hover:text-primary"
          onClick={() => onViewDetails(task.id)}
        >
          View Details <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default TaskCard; 