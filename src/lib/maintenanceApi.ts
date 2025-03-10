interface HomeDetails {
  id: string;
  name: string;
  location: string;
  year_built: number;
  square_footage: number;
  roof_type?: string;
  hvac_type?: string;
}

interface MaintenancePlan {
  home_id: string;
  tasks: Array<{
    title: string;
    description: string;
    due_date: string;
    status: 'pending' | 'completed';
    priority: 'high' | 'medium' | 'low';
    category: string;
    estimated_time: string | number;
    estimated_cost: number;
    subtasks: string[];
  }>;
  generated_at: string;
}

// Vite environment type augmentation
interface ImportMetaEnv {
  VITE_API_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
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
    
    if (!data.tasks || data.tasks.length === 0) {
      throw new Error('No maintenance tasks were returned from the API');
    }

    const maintenancePlan = {
      home_id: homeDetails.id,
      tasks: data.tasks.map((task: any) => ({
        title: task.title || task.task_name,
        description: task.description,
        due_date: task.due_date || task.suggestedCompletionDate,
        status: 'pending',
        priority: getPriorityFromDueDate(task.due_date || task.suggestedCompletionDate),
        category: task.category || 'general',
        estimated_time: task.estimated_time || task.estimatedTime,
        estimated_cost: task.estimated_cost || task.estimatedCost,
        subtasks: task.steps || task.subtasks || []
      })),
      generated_at: data.generated_at || new Date().toISOString()
    };

    console.log('Generated maintenance plan:', maintenancePlan);
    return maintenancePlan;
  } catch (error) {
    console.error('Error generating maintenance plan:', error);
    throw error;
  }
}

// Helper function to determine priority based on due date
function getPriorityFromDueDate(dueDate: string): 'high' | 'medium' | 'low' {
  const now = new Date();
  const due = new Date(dueDate);
  const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 7) return 'high';
  if (diffDays <= 30) return 'medium';
  return 'low';
} 