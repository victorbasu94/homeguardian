import React, { useState } from 'react';
import { Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { useMaintenance, MOCK_MAINTENANCE_TASKS } from '@/contexts/MaintenanceContext';
import AITaskCard from './AITaskCard';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface AIMaintenanceTasksProps {
  homeId?: string;
}

const AIMaintenanceTasks: React.FC<AIMaintenanceTasksProps> = ({ homeId }) => {
  const { maintenanceTasks, isLoading, error } = useMaintenance();
  const [showAll, setShowAll] = useState(false);
  
  // Use mock data in development environment if no tasks are available
  const tasks = maintenanceTasks.length > 0 
    ? maintenanceTasks 
    : (process.env.NODE_ENV === 'development' ? MOCK_MAINTENANCE_TASKS : []);
  
  // Show only 3 tasks initially, unless showAll is true
  const displayedTasks = showAll ? tasks : tasks.slice(0, 3);
  
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
  
  const handleAddToTasks = (task: any) => {
    // This would be implemented to add the AI task to the user's regular tasks
    console.log('Adding task to my tasks:', task);
    // In a real implementation, you would call an API to save this task
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
            key={index} 
            task={task} 
            onAddToTasks={handleAddToTasks}
          />
        ))}
      </div>
      
      {tasks.length > 3 && (
        <div className="flex justify-center mt-4">
          <Button 
            variant="outline" 
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? 'Show Less' : `Show All (${tasks.length})`}
          </Button>
        </div>
      )}
    </div>
  );
};

export default AIMaintenanceTasks; 