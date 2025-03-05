import OpenAI from 'openai';

// Define the home details interface based on the HomeData interface in the project
export interface HomeDetails {
  id: string;
  name?: string;
  location: string;
  year_built: number;
  square_footage: number;
  roof_type?: string;
  hvac_type?: string;
}

// Define the maintenance task interface based on the TaskData interface in the project
export interface MaintenanceTask {
  id?: string;
  title: string;
  description: string;
  due_date: string;
  status?: 'pending' | 'completed' | 'overdue';
  priority?: 'low' | 'medium' | 'high';
  home_id?: string;
  category: string;
  estimated_time?: string;
  estimated_cost?: number;
  subtasks?: string[];
}

// Define the maintenance plan interface
export interface MaintenancePlan {
  home_id: string;
  tasks: MaintenanceTask[];
  generated_at: string;
}

/**
 * Get a maintenance plan for a home
 * In production, this calls the OpenAI API
 * In development, it returns a mock response
 */
export async function getMaintenancePlan(homeDetails: HomeDetails): Promise<MaintenancePlan> {
  // Check if we're in production
  if (import.meta.env.PROD) {
    return getProductionMaintenancePlan(homeDetails);
  } else {
    return getMockMaintenancePlan(homeDetails);
  }
}

/**
 * Get a maintenance plan using the OpenAI API (for production)
 */
async function getProductionMaintenancePlan(homeDetails: HomeDetails): Promise<MaintenancePlan> {
  try {
    // Check if API key is available
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key is not configured. Please set VITE_OPENAI_API_KEY in your environment variables.');
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true // Note: In production, API calls should be made from the backend
    });

    // Prepare the prompt for OpenAI
    const prompt = `
      Generate a home maintenance plan for the following home:
      - Location: ${homeDetails.location}
      - Year built: ${homeDetails.year_built}
      - Square footage: ${homeDetails.square_footage}
      ${homeDetails.roof_type ? `- Roof type: ${homeDetails.roof_type}` : ''}
      ${homeDetails.hvac_type ? `- HVAC type: ${homeDetails.hvac_type}` : ''}

      Please provide a JSON array of 5 maintenance tasks, each with the following properties:
      - title: A short title for the task
      - description: A detailed description of the task
      - due_date: A suggested completion date in YYYY-MM-DD format
      - category: The category of the task (e.g., plumbing, electrical, HVAC, etc.)
      - estimated_time: Estimated time to complete the task (e.g., "2 hours")
      - estimated_cost: Estimated cost in USD (numeric value only)
      - subtasks: An array of strings describing subtasks
    `;

    // Call the OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a home maintenance expert. Provide detailed, practical maintenance plans based on home details."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    // Parse the response
    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content received from OpenAI API');
    }

    const parsedResponse = JSON.parse(content);
    
    // Format the response to match our MaintenancePlan interface
    return {
      home_id: homeDetails.id,
      tasks: parsedResponse.tasks.map((task: any) => ({
        title: task.title,
        description: task.description,
        due_date: task.due_date,
        status: 'pending',
        priority: getPriorityFromDueDate(task.due_date),
        category: task.category,
        estimated_time: task.estimated_time,
        estimated_cost: task.estimated_cost,
        subtasks: task.subtasks
      })),
      generated_at: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error generating maintenance plan:', error);
    throw error;
  }
}

/**
 * Get a mock maintenance plan (for development)
 */
function getMockMaintenancePlan(homeDetails: HomeDetails): MaintenancePlan {
  // Calculate some values based on home details to make the mock response dynamic
  const currentYear = new Date().getFullYear();
  const homeAge = currentYear - homeDetails.year_built;
  const isOlderHome = homeAge > 30;
  const isLargeHome = homeDetails.square_footage > 2500;
  
  // Adjust costs based on location (simple example)
  const locationFactor = getLocationCostFactor(homeDetails.location);
  
  // Generate due dates (spread over the next 6 months)
  const generateDueDates = () => {
    const dates = [];
    const baseDate = new Date();
    
    // Generate 5 dates spread over the next 6 months
    for (let i = 0; i < 5; i++) {
      const newDate = new Date(baseDate);
      newDate.setMonth(baseDate.getMonth() + Math.floor(i * 1.2) + 1); // Spread evenly over ~6 months
      dates.push(newDate.toISOString().split('T')[0]);
    }
    
    return dates;
  };

  const dueDates = generateDueDates();
  
  // Create mock tasks
  const tasks: MaintenanceTask[] = [
    {
      title: "HVAC System Maintenance",
      description: `Schedule a professional inspection of your ${homeDetails.hvac_type || 'HVAC'} system. This should include cleaning or replacing filters, checking refrigerant levels, and ensuring proper operation.`,
      due_date: dueDates[0],
      status: 'pending',
      priority: 'high',
      category: 'HVAC',
      estimated_time: isLargeHome ? "3 hours" : "2 hours",
      estimated_cost: Math.round(250 * locationFactor),
      subtasks: [
        "Replace air filters",
        "Clean condenser coils",
        "Check refrigerant levels",
        "Inspect electrical components",
        "Test thermostat operation"
      ]
    },
    {
      title: `${homeDetails.roof_type || 'Roof'} Inspection`,
      description: `Inspect your ${homeDetails.roof_type || 'roof'} for damaged or missing shingles, signs of leaks, and ensure gutters are clear of debris.`,
      due_date: dueDates[1],
      status: 'pending',
      priority: 'medium',
      category: 'Exterior',
      estimated_time: isLargeHome ? "4 hours" : "2 hours",
      estimated_cost: Math.round(isOlderHome ? 350 * locationFactor : 200 * locationFactor),
      subtasks: [
        "Check for damaged shingles",
        "Inspect flashing around chimneys and vents",
        "Clean gutters and downspouts",
        "Look for signs of water damage in the attic",
        "Trim overhanging tree branches"
      ]
    },
    {
      title: "Plumbing System Check",
      description: "Inspect all visible pipes, faucets, and fixtures for leaks. Check water pressure and drain flow in all sinks and tubs.",
      due_date: dueDates[2],
      status: 'pending',
      priority: 'medium',
      category: 'Plumbing',
      estimated_time: "3 hours",
      estimated_cost: Math.round(150 * locationFactor),
      subtasks: [
        "Check for leaks under sinks",
        "Test water pressure",
        "Inspect toilet mechanisms",
        "Clean aerators on faucets",
        "Check water heater operation"
      ]
    },
    {
      title: "Smoke and Carbon Monoxide Detector Test",
      description: "Test all smoke and carbon monoxide detectors. Replace batteries and any units older than 10 years.",
      due_date: dueDates[3],
      status: 'pending',
      priority: 'high',
      category: 'Safety',
      estimated_time: "1 hour",
      estimated_cost: Math.round(50 * locationFactor),
      subtasks: [
        "Test all detectors",
        "Replace batteries",
        "Check expiration dates on units",
        "Clean dust from detectors",
        "Ensure proper placement throughout home"
      ]
    },
    {
      title: "Exterior Paint and Siding Inspection",
      description: "Inspect exterior paint and siding for damage, cracks, or peeling. Address any issues to prevent water infiltration and structural damage.",
      due_date: dueDates[4],
      status: 'pending',
      priority: 'low',
      category: 'Exterior',
      estimated_time: isLargeHome ? "6 hours" : "4 hours",
      estimated_cost: Math.round(isOlderHome ? 500 * locationFactor : 300 * locationFactor),
      subtasks: [
        "Check for peeling or cracking paint",
        "Inspect siding for damage",
        "Look for signs of pest infestation",
        "Clean exterior surfaces",
        "Identify areas needing repair or repainting"
      ]
    }
  ];
  
  return {
    home_id: homeDetails.id,
    tasks,
    generated_at: new Date().toISOString()
  };
}

/**
 * Helper function to get a cost factor based on location
 */
function getLocationCostFactor(location: string): number {
  // Simple location-based cost adjustment
  const highCostLocations = ['new york', 'san francisco', 'los angeles', 'seattle', 'boston'];
  const mediumCostLocations = ['chicago', 'denver', 'austin', 'portland', 'miami'];
  
  const lowercaseLocation = location.toLowerCase();
  
  if (highCostLocations.some(loc => lowercaseLocation.includes(loc))) {
    return 1.5; // 50% higher costs
  } else if (mediumCostLocations.some(loc => lowercaseLocation.includes(loc))) {
    return 1.2; // 20% higher costs
  } else {
    return 1.0; // Base cost
  }
}

/**
 * Helper function to determine priority based on due date
 */
function getPriorityFromDueDate(dueDate: string): 'low' | 'medium' | 'high' {
  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 30) {
    return 'high';
  } else if (diffDays <= 90) {
    return 'medium';
  } else {
    return 'low';
  }
} 