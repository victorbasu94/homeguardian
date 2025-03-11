import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  Home, 
  CheckCircle, 
  AlertTriangle, 
  ArrowLeft, 
  Edit, 
  Trash2, 
  MessageCircle, 
  Paperclip, 
  Plus,
  Tag,
  Info,
  User as UserIcon,
  DollarSign,
  ListChecks,
  ChevronRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import VendorList from '@/components/VendorList';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import api from '@/lib/axios';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';

// Task status types
type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'overdue';

// Task priority types
type TaskPriority = 'low' | 'medium' | 'high';

// Task interface
interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  homeId: string;
  homeName: string;
  category: string;
  estimatedDuration: number; // in minutes
  estimatedCost?: number;
  assignedTo?: string;
  progress: number; // 0-100
  attachments: Attachment[];
  comments: Comment[];
  steps: TaskStep[];
  location: string; // User's home location for vendor search
  suggestedCompletionDate?: string; // Added for AI-generated tasks
  subTasks?: string[]; // Added for AI-generated tasks
}

// Attachment interface
interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: string;
  uploadedBy: string;
}

// Comment interface
interface Comment {
  id: string;
  text: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
}

// Task step interface
interface TaskStep {
  id: string;
  order: number;
  title: string;
  description?: string;
  isCompleted: boolean;
}

// Vendor interface
interface Vendor {
  id: string;
  name: string;
  address: string;
  phone: string;
  distance: number;
  rating: number;
  services: string[];
}

// Mock task for development
const mockTask: Task = {
  id: '1',
  title: 'Replace HVAC Air Filter',
  description: 'The HVAC air filter needs to be replaced every 3 months to maintain air quality and system efficiency. Purchase a new filter and install it according to the manufacturer\'s instructions.',
  status: 'pending',
  priority: 'medium',
  dueDate: '2023-12-15',
  createdAt: '2023-11-01T10:00:00Z',
  updatedAt: '2023-11-01T10:00:00Z',
  homeId: '1',
  homeName: 'Main Residence',
  category: 'HVAC',
  estimatedDuration: 30,
  estimatedCost: 25,
  progress: 0,
  location: 'San Francisco, CA',
  suggestedCompletionDate: '2023-12-10',
  subTasks: [
    'Purchase new air filter (20x20x1 MERV 11)',
    'Turn off HVAC system before replacement',
    'Remove old filter and dispose properly',
    'Install new filter following airflow direction arrows',
    'Turn HVAC system back on and verify operation'
  ],
  attachments: [
    {
      id: '1',
      name: 'HVAC_Manual.pdf',
      url: '/mock/HVAC_Manual.pdf',
      type: 'application/pdf',
      size: 2500000,
      uploadedAt: '2023-11-01T10:05:00Z',
      uploadedBy: 'user1',
    },
  ],
  comments: [
    {
      id: '1',
      text: 'I\'ve ordered the filters from Amazon. They should arrive by Thursday.',
      createdAt: '2023-11-02T14:30:00Z',
      user: {
        id: 'user1',
        name: 'John Doe',
      },
    },
  ],
  steps: [
    {
      id: '1',
      order: 1,
      title: 'Purchase new air filter',
      description: 'Buy a 20x20x1 MERV 11 filter from a local hardware store or online.',
      isCompleted: false,
    },
    {
      id: '2',
      order: 2,
      title: 'Turn off HVAC system',
      description: 'Ensure the system is completely off before proceeding.',
      isCompleted: false,
    },
    {
      id: '3',
      order: 3,
      title: 'Remove old filter',
      description: 'Carefully take out the old filter and dispose of it properly.',
      isCompleted: false,
    },
    {
      id: '4',
      order: 4,
      title: 'Install new filter',
      description: 'Insert the new filter, making sure the arrows on the filter frame point in the direction of airflow.',
      isCompleted: false,
    },
    {
      id: '5',
      order: 5,
      title: 'Turn HVAC system back on',
      description: 'Restart the system and verify it\'s working correctly.',
      isCompleted: false,
    },
  ],
};

// Mock vendors for development
const mockVendors: Vendor[] = [
  {
    id: '1',
    name: 'ABC HVAC Services',
    address: '123 Main St, San Francisco, CA',
    phone: '(415) 555-1234',
    distance: 2.3,
    rating: 4.8,
    services: ['HVAC Repair', 'HVAC Installation', 'Air Filter Replacement'],
  },
  {
    id: '2',
    name: 'Bay Area Home Services',
    address: '456 Market St, San Francisco, CA',
    phone: '(415) 555-5678',
    distance: 3.1,
    rating: 4.6,
    services: ['Plumbing', 'Electrical', 'HVAC', 'General Maintenance'],
  },
  {
    id: '3',
    name: 'Golden Gate Repairs',
    address: '789 Oak St, San Francisco, CA',
    phone: '(415) 555-9012',
    distance: 4.5,
    rating: 4.7,
    services: ['Home Repairs', 'HVAC Services', 'Appliance Repair'],
  },
];

// Format date to readable format
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// Format date and time
const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Format file size
const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B';
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  else return (bytes / 1048576).toFixed(1) + ' MB';
};

// Get status badge based on status
const getStatusBadge = (status: TaskStatus) => {
  switch (status) {
    case 'completed':
      return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 text-xs font-normal">Completed</Badge>;
    case 'in_progress':
      return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200 text-xs font-normal">In Progress</Badge>;
    case 'overdue':
      return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200 text-xs font-normal">Overdue</Badge>;
    default:
      return <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200 text-xs font-normal">Pending</Badge>;
  }
};

// Get priority badge based on priority
const getPriorityBadge = (priority: TaskPriority) => {
  switch (priority) {
    case 'high':
      return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200 text-xs font-normal">High Priority</Badge>;
    case 'medium':
      return <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200 text-xs font-normal">Medium Priority</Badge>;
    default:
      return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200 text-xs font-normal">Low Priority</Badge>;
  }
};

const TaskDetail: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isUpdatingTask, setIsUpdatingTask] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isVendorDialogOpen, setIsVendorDialogOpen] = useState<boolean>(false);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoadingVendors, setIsLoadingVendors] = useState<boolean>(false);
  const [vendorError, setVendorError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchTask = async () => {
      setIsLoading(true);
      
      try {
        // Check if we're in production environment
        if (import.meta.env.PROD) {
          console.log(`Fetching task details for taskId: ${taskId}`);
          // In production, always use the API
          const response = await api.get(`/tasks/${taskId}`);
          console.log('Task details fetched successfully:', response.data);
          setTask(response.data);
        } else {
          // In development, use mock data for now
          // This can be replaced with API call when backend is ready
          console.log('Using mock data in development');
          setTimeout(() => {
            setTask(mockTask);
          }, 1000);
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching task:', error);
        
        // If API call fails in production, show error
        toast({
          title: 'Error',
          description: 'Failed to load task details.',
          variant: 'destructive',
        });
        
        // In production, don't set task if API fails
        if (!import.meta.env.PROD) {
          setTask(mockTask);
        }
        
        setIsLoading(false);
      }
    };
    
    fetchTask();
  }, [taskId, toast]);
  
  // Handle comment submission
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim()) return;
    
    setIsSubmittingComment(true);
    
    try {
      // In a real app, this would be an API call
      // await api.post(`/tasks/${taskId}/comments`, { text: newComment });
      
      // For now, we'll update the local state
      const newCommentObj: Comment = {
        id: `com${Date.now()}`,
        text: newComment,
        createdAt: new Date().toISOString(),
        user: {
          id: user?.id || 'unknown',
          name: user?.email?.split('@')[0] || 'You', // Use email as fallback for name
          avatar: undefined, // No avatar fallback
        },
      };
      
      setTask((prevTask) => {
        if (!prevTask) return null;
        return {
          ...prevTask,
          comments: [...prevTask.comments, newCommentObj],
        };
      });
      
      setNewComment('');
      
      toast({
        title: 'Comment added',
        description: 'Your comment has been added successfully.',
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: 'Error',
        description: 'Failed to add comment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmittingComment(false);
    }
  };
  
  // Handle step toggle
  const handleStepToggle = async (stepId: string, isCompleted: boolean) => {
    setIsUpdatingTask(true);
    
    try {
      // In a real app, this would be an API call
      // await api.patch(`/tasks/${taskId}/steps/${stepId}`, { isCompleted });
      
      // For now, we'll update the local state
      setTask((prevTask) => {
        if (!prevTask) return null;
        
        const updatedSteps = prevTask.steps.map((step) => {
          if (step.id === stepId) {
            return { ...step, isCompleted };
          }
          return step;
        });
        
        // Calculate new progress
        const completedSteps = updatedSteps.filter((step) => step.isCompleted).length;
        const totalSteps = updatedSteps.length;
        const newProgress = Math.round((completedSteps / totalSteps) * 100);
        
        // Check if all steps are completed
        const allCompleted = completedSteps === totalSteps;
        
        return {
          ...prevTask,
          steps: updatedSteps,
          progress: newProgress,
          status: allCompleted ? 'completed' : 'in_progress',
          completedAt: allCompleted ? new Date().toISOString() : undefined,
        };
      });
      
      toast({
        title: 'Task updated',
        description: `Step marked as ${isCompleted ? 'completed' : 'incomplete'}.`,
      });
    } catch (error) {
      console.error('Error updating step:', error);
      toast({
        title: 'Error',
        description: 'Failed to update step. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdatingTask(false);
    }
  };
  
  // Handle task deletion
  const handleDeleteTask = async () => {
    setIsUpdatingTask(true);
    
    try {
      // In a real app, this would be an API call
      // await api.delete(`/tasks/${taskId}`);
      
      toast({
        title: 'Task deleted',
        description: 'The task has been deleted successfully.',
      });
      
      // Navigate back to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete task. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdatingTask(false);
      setIsDeleteDialogOpen(false);
    }
  };
  
  // Handle back navigation
  const handleBack = () => {
    navigate('/dashboard');
  };
  
  // Fetch vendors when the dialog is opened
  const fetchVendors = async () => {
    setIsLoadingVendors(true);
    setVendorError(null);
    
    try {
      // In development mode, use mock data
      if (process.env.NODE_ENV === 'development') {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        setVendors(mockVendors);
      } else {
        // In production, fetch from API
        const response = await api.get('/api/vendors');
        setVendors(response.data);
      }
    } catch (err) {
      console.error('Error fetching vendors:', err);
      setVendorError('Failed to load vendors. Please try again later.');
    } finally {
      setIsLoadingVendors(false);
    }
  };
  
  // Fetch vendors when the dialog is opened
  useEffect(() => {
    if (isVendorDialogOpen) {
      fetchVendors();
    }
  }, [isVendorDialogOpen]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <div className="flex-grow container mx-auto py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading task details...</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (!task) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <div className="flex-grow container mx-auto py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
            <h1 className="text-xl font-medium mb-2">Task Not Found</h1>
            <p className="text-muted-foreground mb-6">The task you're looking for doesn't exist or has been removed.</p>
            <Button onClick={handleBack}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-grow container mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb and actions */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center text-sm text-muted-foreground">
              <Button variant="ghost" size="sm" onClick={handleBack} className="p-0 h-auto hover:bg-transparent hover:text-primary">
                Dashboard
              </Button>
              <ChevronRight className="h-4 w-4 mx-1" />
              <Button variant="ghost" size="sm" onClick={() => navigate(`/homes/${task.homeId}`)} className="p-0 h-auto hover:bg-transparent hover:text-primary">
                {task.homeName}
              </Button>
              <ChevronRight className="h-4 w-4 mx-1" />
              <span className="text-foreground font-medium">Task Details</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate(`/tasks/${task.id}/edit`)}
                className="h-8"
              >
                <Edit className="h-3.5 w-3.5 mr-1" /> Edit
              </Button>
              
              <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 text-red-600 border-red-200 hover:bg-red-50">
                    <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Task</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete this task and all associated data.
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteTask}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {isUpdatingTask ? 'Deleting...' : 'Delete Task'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
          
          {/* Task header */}
          <div className="bg-white rounded-md border border-border/40 shadow-sm p-6 mb-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 mb-1">
                {getStatusBadge(task.status)}
                {getPriorityBadge(task.priority)}
              </div>
              
              <h1 className="text-xl font-semibold">{task.title}</h1>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Home className="h-4 w-4 flex-shrink-0 text-primary" />
                  <span>{task.homeName}</span>
                </div>
                
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4 flex-shrink-0 text-primary" />
                  <span>Due: {formatDate(task.dueDate)}</span>
                </div>
                
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Tag className="h-4 w-4 flex-shrink-0 text-primary" />
                  <span>Category: {task.category}</span>
                </div>
                
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4 flex-shrink-0 text-primary" />
                  <span>Est. Time: {task.estimatedDuration} minutes</span>
                </div>
                
                {task.estimatedCost && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <DollarSign className="h-4 w-4 flex-shrink-0 text-primary" />
                    <span>Est. Cost: ${task.estimatedCost}</span>
                  </div>
                )}
                
                {task.assignedTo && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <UserIcon className="h-4 w-4 flex-shrink-0 text-primary" />
                    <span>Assigned to: {task.assignedTo}</span>
                  </div>
                )}
                
                {task.suggestedCompletionDate && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4 flex-shrink-0 text-primary" />
                    <span>Suggested Completion: {formatDate(task.suggestedCompletionDate)}</span>
                  </div>
                )}
              </div>
              
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1.5 text-sm">
                  <span className="font-medium">Progress</span>
                  <span>{task.progress}%</span>
                </div>
                <Progress value={task.progress} className="h-1.5" />
              </div>
              
              <div className="bg-background rounded-md p-4 mt-2">
                <h3 className="text-sm font-medium mb-2">Description</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-line">{task.description}</p>
              </div>
              
              {/* Sub-tasks section (if available) */}
              {task.subTasks && task.subTasks.length > 0 && (
                <div className="bg-background rounded-md p-4 mt-1">
                  <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <ListChecks className="h-4 w-4 text-primary" /> Sub-Tasks
                  </h3>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                    {task.subTasks.map((subTask, index) => (
                      <li key={index}>{subTask}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="flex justify-between mt-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsVendorDialogOpen(true)}
                  className="text-xs"
                >
                  Find Service Providers
                </Button>
                
                {task.status !== 'completed' && (
                  <Button 
                    size="sm"
                    onClick={() => handleStepToggle('complete-task', true)}
                    disabled={isUpdatingTask}
                    className="text-xs"
                  >
                    Mark as Completed
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          {/* Task content tabs */}
          <Tabs defaultValue="steps" className="space-y-4">
            <TabsList className="w-full border-b border-border/40 bg-transparent p-0 h-auto">
              <div className="container mx-auto flex space-x-6">
                <TabsTrigger 
                  value="steps" 
                  className="border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary rounded-none py-2.5 px-1 font-medium text-sm"
                >
                  Steps
                </TabsTrigger>
                <TabsTrigger 
                  value="comments" 
                  className="border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary rounded-none py-2.5 px-1 font-medium text-sm"
                >
                  Comments
                </TabsTrigger>
                <TabsTrigger 
                  value="attachments" 
                  className="border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary rounded-none py-2.5 px-1 font-medium text-sm"
                >
                  Attachments
                </TabsTrigger>
              </div>
            </TabsList>
            
            {/* Steps Tab */}
            <TabsContent value="steps">
              <div className="bg-white rounded-md border border-border/40 shadow-sm p-6">
                <h2 className="text-base font-medium mb-4">Task Steps</h2>
                
                <div className="space-y-3">
                  {task.steps.map((step) => (
                    <div 
                      key={step.id} 
                      className={`flex items-start gap-3 p-3 rounded-md border ${
                        step.isCompleted ? 'bg-green-50 border-green-100' : 'bg-white border-border/40'
                      }`}
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        <button
                          type="button"
                          onClick={() => handleStepToggle(step.id, !step.isCompleted)}
                          disabled={isUpdatingTask}
                          className={`h-5 w-5 rounded-md flex items-center justify-center border ${
                            step.isCompleted 
                              ? 'bg-green-500 border-green-500 text-white' 
                              : 'border-muted-foreground/30 text-transparent hover:border-muted-foreground/50'
                          }`}
                        >
                          {step.isCompleted && <CheckCircle className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                      
                      <div className="flex-1">
                        <h3 className={`text-sm font-medium ${step.isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                          {step.order}. {step.title}
                        </h3>
                        {step.description && (
                          <p className={`text-xs mt-1 ${step.isCompleted ? 'text-muted-foreground/70' : 'text-muted-foreground'}`}>
                            {step.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {task.status === 'completed' && (
                  <div className="mt-6 bg-green-50 border border-green-100 rounded-md p-3 flex items-center gap-3">
                    <div className="bg-green-100 p-1.5 rounded-md">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-green-800">Task Completed</h3>
                      {task.completedAt && (
                        <p className="text-xs text-green-700">
                          Completed on {formatDateTime(task.completedAt)}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
            
            {/* Comments Tab */}
            <TabsContent value="comments">
              <div className="bg-white rounded-md border border-border/40 shadow-sm p-6">
                <h2 className="text-base font-medium mb-4">Comments</h2>
                
                <div className="space-y-4 mb-6">
                  {task.comments.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground bg-background rounded-md">
                      <MessageCircle className="h-10 w-10 mx-auto mb-3 opacity-20" />
                      <p className="text-sm">No comments yet. Be the first to add a comment.</p>
                    </div>
                  ) : (
                    task.comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3 p-3 border-b border-border/20 last:border-0">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={comment.user.avatar} alt={comment.user.name} />
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {comment.user.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium">{comment.user.name}</h3>
                            <span className="text-xs text-muted-foreground">
                              {formatDateTime(comment.createdAt)}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">{comment.text}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                <Separator className="my-4" />
                
                <form onSubmit={handleCommentSubmit}>
                  <h3 className="text-sm font-medium mb-2">Add a Comment</h3>
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Type your comment here..."
                    className="min-h-[80px] mb-3 text-sm"
                  />
                  <Button 
                    type="submit" 
                    size="sm"
                    disabled={isSubmittingComment || !newComment.trim()}
                    className="flex items-center gap-2"
                  >
                    {isSubmittingComment ? 'Posting...' : 'Post Comment'}
                  </Button>
                </form>
              </div>
            </TabsContent>
            
            {/* Attachments Tab */}
            <TabsContent value="attachments">
              <div className="bg-white rounded-md border border-border/40 shadow-sm p-6">
                <h2 className="text-base font-medium mb-4">Attachments</h2>
                
                <div className="space-y-3 mb-6">
                  {task.attachments.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground bg-background rounded-md">
                      <Paperclip className="h-10 w-10 mx-auto mb-3 opacity-20" />
                      <p className="text-sm">No attachments yet.</p>
                    </div>
                  ) : (
                    task.attachments.map((attachment) => (
                      <div 
                        key={attachment.id} 
                        className="flex items-center justify-between p-3 border border-border/40 rounded-md"
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-background p-1.5 rounded-md">
                            <Paperclip className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <h3 className="text-sm font-medium">{attachment.name}</h3>
                            <div className="flex items-center gap-3 mt-0.5">
                              <p className="text-xs text-muted-foreground">
                                {formatFileSize(attachment.size)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Uploaded {formatDate(attachment.uploadedAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" asChild className="h-8 text-xs">
                          <a href={attachment.url} download>Download</a>
                        </Button>
                      </div>
                    ))
                  )}
                </div>
                
                <Button variant="outline" size="sm" className="flex items-center gap-2 text-xs">
                  <Plus className="h-3.5 w-3.5" /> Add Attachment
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Vendor dialog */}
      <Dialog open={isVendorDialogOpen} onOpenChange={setIsVendorDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Local Service Providers</DialogTitle>
            <DialogDescription>
              Find trusted home service providers in your area
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {isLoadingVendors ? (
              <div className="flex justify-center items-center py-6">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : vendorError ? (
              <div className="text-center py-6 text-red-600">
                <p className="text-sm">{vendorError}</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="mt-3" 
                  onClick={fetchVendors}
                >
                  Try Again
                </Button>
              </div>
            ) : (
              <ScrollArea className="h-[40vh] pr-4">
                <div className="space-y-3">
                  {vendors.map((vendor, index) => (
                    <Card key={index} className="border border-border/40">
                      <CardContent className="p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-sm font-medium">{vendor.name}</h3>
                            <p className="text-xs text-muted-foreground">{vendor.address}</p>
                            <p className="text-xs mt-1">{vendor.distance} miles away</p>
                            <p className="text-xs mt-1">
                              <span className="font-medium">Phone:</span> {vendor.phone}
                            </p>
                          </div>
                          <Button size="sm" variant="outline" className="h-8 text-xs">
                            Contact
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
          
          <DialogFooter className="sm:justify-between">
            <DialogClose asChild>
              <Button type="button" variant="outline" size="sm">
                Close
              </Button>
            </DialogClose>
            <Button type="button" size="sm">
              View All Providers
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskDetail; 