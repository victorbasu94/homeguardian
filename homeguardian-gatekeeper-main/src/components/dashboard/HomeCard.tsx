import React from 'react';
import { Home, MapPin, Calendar, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface HomeData {
  id: string;
  name?: string;
  location: string;
  year_built: number;
  square_footage: number;
  roof_type?: string;
  hvac_type?: string;
  last_maintenance?: string;
  next_maintenance?: string;
  tasks_count?: number;
  completed_tasks_count?: number;
}

export interface HomeCardProps {
  home: HomeData;
  isSelected: boolean;
  onClick: () => void;
  onEdit: () => void;
}

const HomeCard: React.FC<HomeCardProps> = ({ 
  home, 
  isSelected, 
  onClick, 
  onEdit 
}) => {
  const completionRate = home.tasks_count && home.completed_tasks_count 
    ? Math.round((home.completed_tasks_count / home.tasks_count) * 100) 
    : 0;
  
  const homeName = home.name || `Home in ${home.location}`;
  
  return (
    <div 
      className={`rounded-xl p-6 border transition-all duration-300 cursor-pointer ${
        isSelected 
          ? 'border-primary bg-primary/5 shadow-card' 
          : 'border-gray-200 bg-white hover:border-primary/30 hover:shadow-card'
      }`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${isSelected ? 'bg-primary text-white' : 'bg-primary/10 text-primary'}`}>
            <Home className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-neutral">{homeName}</h3>
            <div className="flex items-center text-neutral/70 text-sm">
              <MapPin className="h-3.5 w-3.5 mr-1" />
              <span>{home.location}</span>
            </div>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
        >
          Edit
        </Button>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white/80 p-3 rounded-lg border border-gray-100">
          <div className="text-sm text-neutral/70 mb-1">Year Built</div>
          <div className="font-semibold">{home.year_built}</div>
        </div>
        <div className="bg-white/80 p-3 rounded-lg border border-gray-100">
          <div className="text-sm text-neutral/70 mb-1">Square Feet</div>
          <div className="font-semibold">{home.square_footage.toLocaleString()}</div>
        </div>
      </div>
      
      {home.next_maintenance && (
        <div className="flex items-center gap-2 text-sm mb-4">
          <Calendar className="h-4 w-4 text-primary" />
          <span>Next maintenance: <span className="font-medium">{home.next_maintenance}</span></span>
        </div>
      )}
      
      {home.tasks_count !== undefined && (
        <div className="mt-4">
          <div className="flex justify-between items-center mb-1">
            <div className="text-sm text-neutral/70">Maintenance Progress</div>
            <div className="text-sm font-medium flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
              {home.completed_tasks_count || 0}/{home.tasks_count}
            </div>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeCard;
