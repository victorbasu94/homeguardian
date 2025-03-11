import React, { useState, useEffect } from 'react';
import { Sparkles, AlertCircle, Loader2, PlusCircle } from 'lucide-react';
import { useMaintenance, MaintenanceTask } from '@/contexts/MaintenanceContext';
import { MOCK_MAINTENANCE_TASKS } from '@/lib/mockData';
import { setUseMockApi } from '@/lib/mockApiIntegration';
import AITaskCard from './AITaskCard';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Simple TaskModal component
interface TaskModalProps {
  isOpen: boolean;
  task: MaintenanceTask;
  onClose: () => void;
  onComplete: () => void;
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, task, onClose, onComplete }) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{task.title}</DialogTitle>
          <DialogDescription>{task.description}</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium">Due Date</h4>
              <p className="text-sm text-muted-foreground">{new Date(task.due_date).toLocaleDateString()}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium">Estimated Cost</h4>
              <p className="text-sm text-muted-foreground">${task.estimated_cost}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium">Estimated Time</h4>
              <p className="text-sm text-muted-foreground">{task.estimated_time}</p>
            </div>
            {task.subtasks && task.subtasks.length > 0 && (
              <div>
                <h4 className="text-sm font-medium">Subtasks</h4>
                <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1 mt-2">
                  {task.subtasks.map((subtask, idx) => (
                    <li key={idx}>{subtask}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={onComplete}>Complete Task</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface AIMaintenanceTasksProps {
  homeId?: string;
}

const AIMaintenanceTasks: React.FC<AIMaintenanceTasksProps> = ({ homeId }) => {
  const { maintenanceTasks, setMaintenanceTasks, isLoading, error } = useMaintenance();
  const [showAll, setShowAll] = useState(false);
  const [selectedTask, setSelectedTask] = useState<MaintenanceTask | null>(null);
  const { toast } = useToast();
  
  // In production, always use real data
  const tasks = maintenanceTasks;
  
  // Log the tasks to help with debugging
  useEffect(() => {
    console.log('Current maintenance tasks in AIMaintenanceTasks:', tasks);
    console.log('Real maintenance tasks from context:', maintenanceTasks);
    
    // Verify that tasks belong to the current home
    if (homeId && tasks.length > 0) {
      console.log('Checking tasks for home ID:', homeId);
      
      // Log each task's home_id for debugging
      tasks.forEach((task, index) => {
        console.log(`Task ${index} - Title: ${task.title}, Home ID: ${task.home_id}`);
      });
      
      // More lenient filtering - check if any property contains the homeId
      const tasksForCurrentHome = tasks.filter(task => {
        const taskHomeId = task.home_id || (task as any).homeId;
        const result = taskHomeId === homeId;
        console.log(`Task "${task.title}" - Home ID match: ${result} (${taskHomeId} vs ${homeId})`);
        return result;
      });
      
      if (tasksForCurrentHome.length === 0) {
        console.warn('No tasks found for the current home ID:', homeId);
      } else {
        console.log(`Found ${tasksForCurrentHome.length} tasks for home ID ${homeId}`);
      }
    }
  }, [tasks, maintenanceTasks, homeId]);
  
  // Filter tasks for the current home
  const tasksForCurrentHome = homeId 
    ? tasks.filter(task => {
        const taskHomeId = task.home_id || (task as any).homeId;
        return taskHomeId === homeId;
      })
    : tasks;
  
  // Filter out completed tasks unless they're explicitly requested
  const incompleteTasks = tasksForCurrentHome.filter(task => task.status !== 'completed');
  
  // Show only 3 tasks initially, unless showAll is true
  const displayedTasks = showAll ? incompleteTasks : incompleteTasks.slice(0, 3);
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
        <h3 className="text-lg font-medium">Loading maintenance plan...</h3>
        <p className="text-muted-foreground mt-2">This may take a moment as we generate your personalized maintenance plan</p>
      </div>
    );
  }
  
  if (error && tasksForCurrentHome.length === 0) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error}
        </AlertDescription>
      </Alert>
    );
  }
  
  if (tasksForCurrentHome.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 border border-dashed border-muted-foreground/20 rounded-lg bg-muted/50">
        <Sparkles className="h-10 w-10 text-primary/50 mb-4" />
        <h3 className="text-lg font-medium">No Maintenance Tasks Yet</h3>
        <p className="text-muted-foreground text-center max-w-md mt-2 mb-6">
          We'll generate a personalized maintenance plan for your home. This helps you keep track of important tasks and maintain your property's value.
        </p>
        <div className="text-xs text-muted-foreground">
          <p>Debug info: Home ID: {homeId}</p>
          <p>Total tasks in context: {maintenanceTasks.length}</p>
        </div>
      </div>
    );
  }
  
  const handleAddToTasks = (task: MaintenanceTask) => {
    // This would be implemented to add the AI task to the user's regular tasks
    console.log('Adding task to my tasks:', task);
    // In a real implementation, you would call an API to save this task
  };

  const handleViewDetails = (task: MaintenanceTask) => {
    setSelectedTask(task);
  };
  
  const handleCompleteTask = async (task: MaintenanceTask) => {
    try {
      // Update the task in the backend
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          completed: true
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update task');
      }
      
      // Update the task in the local state with proper typing
      const updatedTasks = maintenanceTasks.map(t => 
        t.id === task.id ? { ...t, status: 'completed' as const } : t
      );
      
      setMaintenanceTasks(updatedTasks);
      setSelectedTask(null);
      
      toast({
        title: 'Task completed',
        description: `"${task.title}" has been marked as complete.`,
        duration: 3000
      });
    } catch (error) {
      console.error('Error completing task:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark task as complete. Please try again.',
        variant: 'destructive'
      });
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">AI-Generated Maintenance Plan</h2>
        </div>
        <div className="text-xs text-muted-foreground">
          Home ID: {homeId} | Tasks: {displayedTasks.length}/{incompleteTasks.length}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayedTasks.map((task, index) => (
          <AITaskCard 
            key={task.id || index} 
            task={task} 
            onAddToTasks={handleAddToTasks}
            onViewDetails={handleViewDetails}
          />
        ))}
      </div>
      
      {incompleteTasks.length > 3 && (
        <div className="flex justify-center mt-4">
          <Button 
            variant="outline" 
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? 'Show Less' : `Show All (${incompleteTasks.length})`}
          </Button>
        </div>
      )}

      {selectedTask && (
        <TaskModal
          isOpen={!!selectedTask}
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onComplete={() => handleCompleteTask(selectedTask)}
        />
      )}
    </div>
  );
};

export default AIMaintenanceTasks; 