import React from 'react';
import { Home, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HomesEmptyStateProps {
  onAddHome: () => void;
}

const HomesEmptyState: React.FC<HomesEmptyStateProps> = ({ onAddHome }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 bg-white rounded-lg border border-gray-200 text-center">
      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
        <Home className="h-8 w-8 text-primary" />
      </div>
      
      <h2 className="text-xl font-semibold mb-2">No homes added yet</h2>
      
      <p className="text-neutral/70 max-w-md mb-8">
        Add your first home to start tracking maintenance tasks, set reminders, and keep your property in top condition.
      </p>
      
      <Button onClick={onAddHome} size="lg" className="gap-2">
        <Plus className="h-4 w-4" />
        Add Your First Home
      </Button>
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl">
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
          <div className="font-medium mb-1">Track Maintenance</div>
          <p className="text-sm text-neutral/70">Keep a detailed record of all home maintenance tasks</p>
        </div>
        
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
          <div className="font-medium mb-1">Get Reminders</div>
          <p className="text-sm text-neutral/70">Never miss important maintenance with timely reminders</p>
        </div>
        
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
          <div className="font-medium mb-1">Save Money</div>
          <p className="text-sm text-neutral/70">Prevent costly repairs with regular maintenance</p>
        </div>
      </div>
    </div>
  );
};

export default HomesEmptyState;
