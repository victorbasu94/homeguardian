import { MaintenanceTask } from '@/contexts/MaintenanceContext';

interface HomeDetails {
  id: string;
  location: string;
  year_built: number;
  square_footage: number;
  roof_type?: string;
  hvac_type?: string;
}

interface MaintenancePlan {
  home_id: string;
  tasks: MaintenanceTask[];
  generated_at: string;
}

// Vite environment type augmentation
interface ImportMetaEnv {
  VITE_API_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

function getPriorityFromDueDate(dueDate: string): 'low' | 'medium' | 'high' {
  const today = new Date();
  const due = new Date(dueDate);
  const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 7) return 'high';
  if (diffDays <= 30) return 'medium';
  return 'low';
}

/**
 * Get a maintenance plan for a home
 * This function calls our backend API to generate a maintenance plan
 */
export async function getMaintenancePlan(homeDetails: HomeDetails): Promise<MaintenancePlan> {
  try {
    console.log('Generating maintenance plan for home:', homeDetails);

    // Validate required fields
    const requiredFields = ['id', 'location', 'year_built', 'square_footage'] as const;
    const missingFields = requiredFields.filter(field => !homeDetails[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/maintenance/generate-plan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      },
      body: JSON.stringify(homeDetails)
    });

    console.log('Received response from server:', {
      status: response.status,
      statusText: response.statusText
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      console.error('Error response from server:', errorData);
      throw new Error(errorData.message || `Failed to generate maintenance plan: ${response.status}`);
    }

    const data = await response.json();
    console.log('Parsed response data:', data);
    
    if (!data.maintenancePlan || !Array.isArray(data.maintenancePlan)) {
      throw new Error('Invalid maintenance plan format received from server');
    }

    // Format the response to match our MaintenancePlan interface
    const formattedPlan: MaintenancePlan = {
      home_id: homeDetails.id,
      tasks: data.maintenancePlan.map((task: any) => ({
        id: crypto.randomUUID(), // Generate a unique ID for each task
        title: task.task, // Map from OpenAI's "task" to our "title"
        description: task.taskDescription, // Map from OpenAI's "taskDescription"
        due_date: task.suggestedCompletionDate, // Map from OpenAI's "suggestedCompletionDate"
        status: 'pending',
        priority: getPriorityFromDueDate(task.suggestedCompletionDate),
        category: 'maintenance', // OpenAI doesn't provide category
        estimated_time: task.estimatedTime, // Map from OpenAI's "estimatedTime"
        estimated_cost: task.estimatedCost, // Map from OpenAI's "estimatedCost"
        subtasks: task.subTasks || [], // Map from OpenAI's "subTasks"
        home_id: homeDetails.id
      })),
      generated_at: new Date().toISOString()
    };

    console.log('Formatted maintenance plan:', formattedPlan);
    return formattedPlan;
  } catch (error) {
    console.error('Error generating maintenance plan:', error);
    throw error;
  }
} 