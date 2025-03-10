import React from 'react';
import { Home, MapPin, Calendar, CheckCircle2, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
    <Card 
      className={`cursor-pointer transition-all ${
        isSelected 
          ? 'ring-2 ring-primary' 
          : 'hover:border-primary/30'
      }`}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div className="flex items-center gap-3">
          <div className={`p-1.5 rounded-md ${isSelected ? 'bg-primary text-white' : 'bg-accent text-primary'}`}>
            <Home className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-medium">{homeName}</h3>
            <div className="flex items-center text-muted-foreground text-xs mt-0.5">
              <MapPin className="h-3 w-3 mr-1" />
              <span>{home.location}</span>
            </div>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </CardHeader>
      
      <CardContent className="pb-4">
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="bg-secondary p-2 rounded-md">
            <div className="text-xs text-muted-foreground mb-0.5">Year Built</div>
            <div className="font-medium text-sm">{home.year_built}</div>
          </div>
          <div className="bg-secondary p-2 rounded-md">
            <div className="text-xs text-muted-foreground mb-0.5">Square Feet</div>
            <div className="font-medium text-sm">{home.square_footage.toLocaleString()}</div>
          </div>
        </div>
        
        {home.next_maintenance && (
          <div className="flex items-center gap-1.5 text-xs mb-3">
            <Calendar className="h-3.5 w-3.5 text-primary" />
            <span className="text-muted-foreground">Next maintenance: <span className="font-medium text-foreground">{home.next_maintenance}</span></span>
          </div>
        )}
        
        {home.tasks_count !== undefined && (
          <div className="mt-3">
            <div className="flex justify-between items-center mb-1">
              <div className="text-xs text-muted-foreground">Maintenance Progress</div>
              <div className="text-xs font-medium flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-primary" />
                {home.completed_tasks_count || 0}/{home.tasks_count}
              </div>
            </div>
            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HomeCard;
