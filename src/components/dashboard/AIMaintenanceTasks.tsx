import React, { useState, useEffect } from 'react';
import { Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { useMaintenance, MaintenanceTask } from '@/contexts/MaintenanceContext';
import AITaskCard from './AITaskCard';
import TaskModal from './TaskModal'; // Assuming TaskModal is in the same directory
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

interface AIMaintenanceTasksProps {
  homeId?: string;
}

const AIMaintenanceTasks: React.FC<AIMaintenanceTasksProps> = ({ homeId }) => {
  const { maintenanceTasks, setMaintenanceTasks, isLoading, error } = useMaintenance();
  const [showAll, setShowAll] = useState(false);
  const [selectedTask, setSelectedTask] = useState<MaintenanceTask | null>(null);
  const { toast } = useToast();
  
  // By default, only use mock data in development environment if no tasks are available
  const tasks = maintenanceTasks;
  
  // Filter out completed tasks unless they're explicitly requested
  const incompleteTasks = tasks.filter(task => task.status !== 'completed');
  
  // Show only 3 tasks initially, unless showAll is true
  const displayedTasks = showAll ? incompleteTasks : incompleteTasks.slice(0, 3);
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
        <h3 className="text-lg font-medium">Loading maintenance plan...</h3>
        <p className="text-muted-foreground mt-2">This may take a moment</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }
  
  if (tasks.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No AI-generated tasks</AlertTitle>
        <AlertDescription>
          No AI-generated maintenance tasks are available. Try adding a new home to generate a maintenance plan.
        </AlertDescription>
      </Alert>
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
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">AI-Generated Maintenance Plan</h2>
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