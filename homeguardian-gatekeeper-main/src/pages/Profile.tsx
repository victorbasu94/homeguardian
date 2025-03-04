import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, 
  Home, 
  Settings, 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  ChevronRight,
  Award,
  Shield
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import api from '@/lib/axios';

// Mock data for recent activity
const recentActivity = [
  {
    id: 1,
    type: 'task_completed',
    title: 'Changed HVAC Filter',
    date: '2023-11-15T10:30:00Z',
    home: 'Main Residence',
  },
  {
    id: 2,
    type: 'maintenance_scheduled',
    title: 'Scheduled Roof Inspection',
    date: '2023-11-12T14:45:00Z',
    home: 'Beach House',
  },
  {
    id: 3,
    type: 'task_upcoming',
    title: 'Clean Gutters',
    date: '2023-11-25T09:00:00Z',
    home: 'Main Residence',
  },
  {
    id: 4,
    type: 'home_added',
    title: 'Added New Home',
    date: '2023-11-10T16:20:00Z',
    home: 'Mountain Cabin',
  },
  {
    id: 5,
    type: 'subscription_renewed',
    title: 'Renewed Pro Subscription',
    date: '2023-11-01T08:15:00Z',
  },
];

// Mock data for achievements
const achievements = [
  {
    id: 1,
    title: 'Home Protector',
    description: 'Complete 10 maintenance tasks',
    icon: <Shield className="h-6 w-6 text-primary" />,
    progress: 7,
    total: 10,
    unlocked: false,
  },
  {
    id: 2,
    title: 'Maintenance Master',
    description: 'Complete all scheduled tasks for a month',
    icon: <Award className="h-6 w-6 text-primary" />,
    unlocked: true,
    unlockedDate: '2023-10-31T23:59:59Z',
  },
  {
    id: 3,
    title: 'Property Portfolio',
    description: 'Add 3 homes to your account',
    icon: <Home className="h-6 w-6 text-primary" />,
    progress: 2,
    total: 3,
    unlocked: false,
  },
];

// Mock data for upcoming tasks
const upcomingTasks = [
  {
    id: 1,
    title: 'Clean Gutters',
    dueDate: '2023-11-25T09:00:00Z',
    home: 'Main Residence',
    priority: 'high',
  },
  {
    id: 2,
    title: 'Check Smoke Detectors',
    dueDate: '2023-11-30T10:00:00Z',
    home: 'Beach House',
    priority: 'medium',
  },
  {
    id: 3,
    title: 'Inspect Roof',
    dueDate: '2023-12-05T14:00:00Z',
    home: 'Mountain Cabin',
    priority: 'high',
  },
];

interface UserStats {
  totalHomes: number;
  completedTasks: number;
  upcomingTasks: number;
  maintenanceScore: number;
}

const Profile: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<UserStats>({
    totalHomes: 0,
    completedTasks: 0,
    upcomingTasks: 0,
    maintenanceScore: 0,
  });
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchUserStats = async () => {
      setIsLoading(true);
      
      try {
        // In a real app, this would be an API call
        // const response = await api.get('/api/users/stats');
        // setStats(response.data);
        
        // For now, we'll use mock data
        setTimeout(() => {
          setStats({
            totalHomes: 3,
            completedTasks: 24,
            upcomingTasks: 5,
            maintenanceScore: 87,
          });
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching user stats:', error);
        toast({
          title: 'Error',
          description: 'Failed to load user statistics.',
          variant: 'destructive',
        });
        setIsLoading(false);
      }
    };
    
    fetchUserStats();
  }, [toast]);
  
  // Format date to readable string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };
  
  // Format date to relative time (e.g., "2 days ago")
  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      if (diffInHours === 0) {
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
        return diffInMinutes === 0 ? 'Just now' : `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
      }
      return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
    } else if (diffInDays < 30) {
      const diffInWeeks = Math.floor(diffInDays / 7);
      return `${diffInWeeks} week${diffInWeeks === 1 ? '' : 's'} ago`;
    } else {
      return formatDate(dateString);
    }
  };
  
  // Get icon for activity type
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'task_completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'maintenance_scheduled':
        return <Calendar className="h-5 w-5 text-blue-500" />;
      case 'task_upcoming':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'home_added':
        return <Home className="h-5 w-5 text-purple-500" />;
      case 'subscription_renewed':
        return <Award className="h-5 w-5 text-primary" />;
      default:
        return <CheckCircle className="h-5 w-5 text-gray-500" />;
    }
  };
  
  // Get badge color for task priority
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">High</Badge>;
      case 'medium':
        return <Badge variant="default" className="bg-yellow-500">Medium</Badge>;
      case 'low':
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge variant="outline">Normal</Badge>;
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-softWhite">
      <Navbar />
      
      <div className="flex-grow container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Profile Header */}
          <div className="bg-white rounded-2xl shadow-card p-8 mb-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <Avatar className="h-24 w-24 border-4 border-primary/10">
                <AvatarImage src={user?.avatar || ''} alt={user?.name || 'User'} />
                <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                  {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold mb-2">{user?.name || 'User'}</h1>
                <p className="text-neutral/70 mb-4">{user?.email}</p>
                
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  <Badge variant="outline" className="px-3 py-1 text-sm">
                    {user?.subscription_status === 'active' ? 'Pro Member' : 'Free Plan'}
                  </Badge>
                  <Badge variant="outline" className="px-3 py-1 text-sm">
                    Member since {formatDate(user?.created_at || new Date().toISOString())}
                  </Badge>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline" onClick={() => navigate('/settings')} className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Edit Profile
                </Button>
                <Button onClick={() => navigate('/dashboard')} className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Dashboard
                </Button>
              </div>
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-neutral/70">Total Homes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{isLoading ? '...' : stats.totalHomes}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-neutral/70">Completed Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{isLoading ? '...' : stats.completedTasks}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-neutral/70">Upcoming Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{isLoading ? '...' : stats.upcomingTasks}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-neutral/70">Maintenance Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-1">
                  <div className="text-3xl font-bold">{isLoading ? '...' : stats.maintenanceScore}</div>
                  <div className="text-sm text-neutral/70 mb-1">/100</div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Tabs for Activity, Achievements, and Tasks */}
          <Tabs defaultValue="activity" className="space-y-6">
            <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto">
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
            </TabsList>
            
            {/* Activity Tab */}
            <TabsContent value="activity">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your recent actions and updates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-4">
                        <div className="bg-neutral/5 p-2 rounded-full">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">{activity.title}</p>
                            <span className="text-sm text-neutral/70">{getRelativeTime(activity.date)}</span>
                          </div>
                          {activity.home && (
                            <p className="text-sm text-neutral/70">
                              <span className="inline-flex items-center gap-1">
                                <Home className="h-3 w-3" /> {activity.home}
                              </span>
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">View All Activity</Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* Achievements Tab */}
            <TabsContent value="achievements">
              <Card>
                <CardHeader>
                  <CardTitle>Achievements</CardTitle>
                  <CardDescription>Track your progress and earn badges</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {achievements.map((achievement) => (
                      <div 
                        key={achievement.id} 
                        className={`flex items-start gap-4 p-4 rounded-lg border ${
                          achievement.unlocked ? 'bg-primary/5 border-primary/20' : 'bg-neutral/5 border-neutral/10'
                        }`}
                      >
                        <div className={`p-3 rounded-full ${
                          achievement.unlocked ? 'bg-primary/10' : 'bg-neutral/10'
                        }`}>
                          {achievement.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold">{achievement.title}</h3>
                            {achievement.unlocked && (
                              <Badge className="bg-primary">Unlocked</Badge>
                            )}
                          </div>
                          <p className="text-sm text-neutral/70 mt-1">{achievement.description}</p>
                          
                          {!achievement.unlocked && achievement.progress !== undefined && (
                            <div className="mt-3">
                              <div className="flex items-center justify-between text-sm mb-1">
                                <span>Progress</span>
                                <span>{achievement.progress}/{achievement.total}</span>
                              </div>
                              <div className="h-2 bg-neutral/10 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-primary" 
                                  style={{ width: `${(achievement.progress / achievement.total) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                          
                          {achievement.unlocked && achievement.unlockedDate && (
                            <p className="text-xs text-neutral/70 mt-2">
                              Unlocked on {formatDate(achievement.unlockedDate)}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Tasks Tab */}
            <TabsContent value="tasks">
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Tasks</CardTitle>
                  <CardDescription>Tasks that need your attention</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {upcomingTasks.map((task) => (
                      <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-start gap-3">
                          <div className="bg-neutral/5 p-2 rounded-full mt-1">
                            <Clock className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-medium">{task.title}</h3>
                            <div className="flex items-center gap-4 mt-1">
                              <p className="text-sm text-neutral/70 flex items-center gap-1">
                                <Calendar className="h-3 w-3" /> {formatDate(task.dueDate)}
                              </p>
                              <p className="text-sm text-neutral/70 flex items-center gap-1">
                                <Home className="h-3 w-3" /> {task.home}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {getPriorityBadge(task.priority)}
                          <Button variant="ghost" size="icon">
                            <ChevronRight className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" onClick={() => navigate('/dashboard')}>
                    View All Tasks
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Profile; 