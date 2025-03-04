import { Calendar, ArrowRight } from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';

export interface TaskData {
  id: string;
  task_name: string;
  due_date: string;
  why: string;
  completed: boolean;
  home_id: string;
  estimated_cost?: number;
}

export interface TaskCardProps {
  task: TaskData;
  onClick: () => void;
}

const TaskCard = ({ task, onClick }: TaskCardProps) => {
  // Format the due date
  const formattedDate = format(new Date(task.due_date), 'MMM d, yyyy');
  
  // Determine status text and color
  let statusText = 'Upcoming';
  let statusColor = 'text-blue-600 bg-blue-50';
  
  if (task.completed) {
    statusText = 'Completed';
    statusColor = 'text-green-600 bg-green-50';
  } else if (isPast(new Date(task.due_date)) && !isToday(new Date(task.due_date))) {
    statusText = 'Overdue';
    statusColor = 'text-red-600 bg-red-50';
  } else if (isToday(new Date(task.due_date))) {
    statusText = 'Due Today';
    statusColor = 'text-amber-600 bg-amber-50';
  }
  
  return (
    <div 
      className={`group relative bg-white border border-border/50 shadow-sm rounded-lg p-4 transition-all hover:shadow-md hover:border-primary/20 cursor-pointer ${task.completed ? 'opacity-70' : ''}`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium line-clamp-1">{task.task_name}</h3>
        <span className={`text-xs px-2 py-1 rounded-full ${statusColor}`}>
          {statusText}
        </span>
      </div>
      
      <div className="flex items-center text-sm text-muted-foreground mb-3">
        <Calendar className="h-3.5 w-3.5 mr-1.5" />
        <span>{formattedDate}</span>
      </div>
      
      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
        {task.why}
      </p>
      
      <div className="flex justify-end">
        <button 
          className="inline-flex items-center text-xs font-medium text-primary hover:text-primary/80 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          View details
          <ArrowRight className="ml-1 h-3 w-3" />
        </button>
      </div>
    </div>
  );
};

export default TaskCard; 