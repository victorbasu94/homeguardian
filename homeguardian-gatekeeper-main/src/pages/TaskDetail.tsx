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
  ListChecks
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

// Format date function
const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// Format date and time function
const formatDateTime = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// Format file size function
const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B';
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  else return (bytes / 1048576).toFixed(1) + ' MB';
};

// Get status badge component
const getStatusBadge = (status: TaskStatus) => {
  switch (status) {
    case 'pending':
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
    case 'in_progress':
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">In Progress</Badge>;
    case 'completed':
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>;
    case 'overdue':
      return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Overdue</Badge>;
    default:
      return null;
  }
};

// Get priority badge component
const getPriorityBadge = (priority: TaskPriority) => {
  switch (priority) {
    case 'low':
      return <Badge variant="outline" className="bg-neutral-50 text-neutral-700 border-neutral-200">Low Priority</Badge>;
    case 'medium':
      return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">Medium Priority</Badge>;
    case 'high':
      return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">High Priority</Badge>;
    default:
      return null;
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
        // In a real app, this would be an API call
        // const response = await api.get(`/api/tasks/${taskId}`);
        // setTask(response.data);
        
        // For now, we'll use mock data
        setTimeout(() => {
          setTask(mockTask);
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching task:', error);
        toast({
          title: 'Error',
          description: 'Failed to load task details.',
          variant: 'destructive',
        });
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
      // await api.post(`/api/tasks/${taskId}/comments`, { text: newComment });
      
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
      // await api.patch(`/api/tasks/${taskId}/steps/${stepId}`, { isCompleted });
      
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
      // await api.delete(`/api/tasks/${taskId}`);
      
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
      <div className="min-h-screen flex flex-col bg-softWhite">
        <div className="flex-grow container mx-auto py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-neutral/70">Loading task details...</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (!task) {
    return (
      <div className="min-h-screen flex flex-col bg-softWhite">
        <div className="flex-grow container mx-auto py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Task Not Found</h1>
            <p className="text-neutral/70 mb-6">The task you're looking for doesn't exist or has been removed.</p>
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
      <div className="flex-grow container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Back button and actions */}
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" onClick={handleBack} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to Dashboard
            </Button>
            
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                className="flex items-center gap-2 w-[160px] justify-center"
                onClick={() => setIsVendorDialogOpen(true)}
              >
                Connect to Vendors
              </Button>
              
              <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="flex items-center gap-2 w-[160px] justify-center">
                    <Trash2 className="h-4 w-4" /> Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
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
          <div className="bg-white rounded-2xl shadow-card p-8 mb-8">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {getStatusBadge(task.status)}
                  {getPriorityBadge(task.priority)}
                </div>
                
                <h1 className="text-3xl font-bold mb-4">{task.title}</h1>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-2 text-neutral/70">
                    <Home className="h-4 w-4 flex-shrink-0" />
                    <span>{task.homeName}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-neutral/70">
                    <Calendar className="h-4 w-4 flex-shrink-0" />
                    <span>Due: {formatDate(task.dueDate)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-neutral/70">
                    <Tag className="h-4 w-4 flex-shrink-0" />
                    <span>Category: {task.category}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-neutral/70">
                    <Clock className="h-4 w-4 flex-shrink-0" />
                    <span>Est. Time: {task.estimatedDuration} minutes</span>
                  </div>
                  
                  {task.estimatedCost && (
                    <div className="flex items-center gap-2 text-neutral/70">
                      <DollarSign className="h-4 w-4 flex-shrink-0" />
                      <span>Est. Cost: ${task.estimatedCost}</span>
                    </div>
                  )}
                  
                  {task.assignedTo && (
                    <div className="flex items-center gap-2 text-neutral/70">
                      <UserIcon className="h-4 w-4 flex-shrink-0" />
                      <span>Assigned to: {task.assignedTo}</span>
                    </div>
                  )}
                  
                  {task.suggestedCompletionDate && (
                    <div className="flex items-center gap-2 text-neutral/70">
                      <Calendar className="h-4 w-4 flex-shrink-0" />
                      <span>Suggested Completion: {formatDate(task.suggestedCompletionDate)}</span>
                    </div>
                  )}
                </div>
                
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Progress</span>
                    <span>{task.progress}%</span>
                  </div>
                  <Progress value={task.progress} className="h-2" />
                </div>
                
                <div className="bg-neutral/5 rounded-lg p-4">
                  <h3 className="font-medium mb-2">Description</h3>
                  <p className="text-neutral/80 whitespace-pre-line">{task.description}</p>
                </div>
                
                {/* Sub-tasks section (if available) */}
                {task.subTasks && task.subTasks.length > 0 && (
                  <div className="bg-neutral/5 rounded-lg p-4 mt-4">
                    <h3 className="font-medium mb-2 flex items-center gap-2">
                      <ListChecks className="h-4 w-4" /> Sub-Tasks
                    </h3>
                    <ul className="list-disc pl-5 space-y-1">
                      {task.subTasks.map((subTask, index) => (
                        <li key={index} className="text-neutral/80">{subTask}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Task content tabs */}
          <Tabs defaultValue="steps" className="space-y-6">
            <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto">
              <TabsTrigger value="steps">Steps</TabsTrigger>
              <TabsTrigger value="comments">Comments</TabsTrigger>
              <TabsTrigger value="attachments">Attachments</TabsTrigger>
            </TabsList>
            
            {/* Steps Tab */}
            <TabsContent value="steps">
              <div className="bg-white rounded-2xl shadow-card p-8">
                <h2 className="text-xl font-semibold mb-6">Task Steps</h2>
                
                <div className="space-y-4">
                  {task.steps.map((step) => (
                    <div 
                      key={step.id} 
                      className={`flex items-start gap-4 p-4 rounded-lg border ${
                        step.isCompleted ? 'bg-green-50 border-green-200' : 'bg-white border-neutral/10'
                      }`}
                    >
                      <div className="flex-shrink-0 mt-1">
                        <button
                          type="button"
                          onClick={() => handleStepToggle(step.id, !step.isCompleted)}
                          disabled={isUpdatingTask}
                          className={`h-6 w-6 rounded-full flex items-center justify-center border ${
                            step.isCompleted 
                              ? 'bg-green-500 border-green-500 text-white' 
                              : 'border-neutral/30 text-transparent hover:border-neutral/50'
                          }`}
                        >
                          {step.isCompleted && <CheckCircle className="h-5 w-5" />}
                        </button>
                      </div>
                      
                      <div className="flex-1">
                        <h3 className={`font-medium ${step.isCompleted ? 'line-through text-neutral/70' : ''}`}>
                          {step.order}. {step.title}
                        </h3>
                        {step.description && (
                          <p className={`text-sm mt-1 ${step.isCompleted ? 'text-neutral/50' : 'text-neutral/70'}`}>
                            {step.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {task.status === 'completed' && (
                  <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-4">
                    <div className="bg-green-100 p-2 rounded-full">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-green-800">Task Completed</h3>
                      {task.completedAt && (
                        <p className="text-sm text-green-700">
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
              <div className="bg-white rounded-2xl shadow-card p-8">
                <h2 className="text-xl font-semibold mb-6">Comments</h2>
                
                <div className="space-y-6 mb-8">
                  {task.comments.length === 0 ? (
                    <div className="text-center py-8 text-neutral/70">
                      <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-20" />
                      <p>No comments yet. Be the first to add a comment.</p>
                    </div>
                  ) : (
                    task.comments.map((comment) => (
                      <div key={comment.id} className="flex gap-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={comment.user.avatar} alt={comment.user.name} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {comment.user.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium">{comment.user.name}</h3>
                            <span className="text-sm text-neutral/70">
                              {formatDateTime(comment.createdAt)}
                            </span>
                          </div>
                          <p className="mt-1 text-neutral/80">{comment.text}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                <Separator className="my-6" />
                
                <form onSubmit={handleCommentSubmit}>
                  <h3 className="font-medium mb-3">Add a Comment</h3>
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Type your comment here..."
                    className="min-h-[100px] mb-4"
                  />
                  <Button 
                    type="submit" 
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
              <div className="bg-white rounded-2xl shadow-card p-8">
                <h2 className="text-xl font-semibold mb-6">Attachments</h2>
                
                <div className="space-y-4 mb-8">
                  {task.attachments.length === 0 ? (
                    <div className="text-center py-8 text-neutral/70">
                      <Paperclip className="h-12 w-12 mx-auto mb-4 opacity-20" />
                      <p>No attachments yet.</p>
                    </div>
                  ) : (
                    task.attachments.map((attachment) => (
                      <div 
                        key={attachment.id} 
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-neutral/5 p-2 rounded-full">
                            <Paperclip className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-medium">{attachment.name}</h3>
                            <div className="flex items-center gap-4 mt-1">
                              <p className="text-sm text-neutral/70">
                                {formatFileSize(attachment.size)}
                              </p>
                              <p className="text-sm text-neutral/70">
                                Uploaded {formatDate(attachment.uploadedAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <a href={attachment.url} download>Download</a>
                        </Button>
                      </div>
                    ))
                  )}
                </div>
                
                <Button variant="outline" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" /> Add Attachment
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
            <DialogTitle>Local Home Service Vendors</DialogTitle>
            <DialogDescription>
              Connect with trusted home service providers in your area.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {isLoadingVendors ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : vendorError ? (
              <div className="text-center py-8 text-destructive">
                <p>{vendorError}</p>
                <Button 
                  variant="outline" 
                  className="mt-4" 
                  onClick={fetchVendors}
                >
                  Try Again
                </Button>
              </div>
            ) : (
              <ScrollArea className="h-[50vh] pr-4">
                {vendors.map((vendor, index) => (
                  <div key={index} className="mb-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-lg">{vendor.name}</h3>
                            <p className="text-sm text-muted-foreground">{vendor.address}</p>
                            <p className="text-sm mt-1">{vendor.distance} miles away</p>
                          </div>
                          <Button size="sm" variant="secondary" className="flex-shrink-0">
                            Call
                          </Button>
                        </div>
                        <p className="text-sm mt-2">
                          <span className="font-medium">Phone:</span> {vendor.phone}
                        </p>
                      </CardContent>
                    </Card>
                    {index < vendors.length - 1 && <Separator className="my-2" />}
                  </div>
                ))}
              </ScrollArea>
            )}
          </div>
          
          <DialogFooter className="sm:justify-between">
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Close
              </Button>
            </DialogClose>
            <Button type="button" variant="default">
              View All Vendors
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
};

export default TaskDetail; 