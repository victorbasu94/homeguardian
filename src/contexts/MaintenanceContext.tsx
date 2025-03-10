// Define the interface for a maintenance task
export interface MaintenanceTask {
  title: string;
  description: string;
  due_date: string;
  status?: 'pending' | 'completed';
  priority?: 'high' | 'medium' | 'low';
  category?: string;
  estimated_time: string;
  estimated_cost: number;
  subtasks: string[];
  home_id?: string;
}

// Mock data for development environment
export const MOCK_MAINTENANCE_TASKS: MaintenanceTask[] = [
  {
    title: "Inspect roof",
    description: "Check for damaged shingles, leaks, and clean gutters",
    due_date: "2024-06-15",
    estimated_cost: 150,
    estimated_time: "2 hours",
    subtasks: ["Check shingles", "Look for water damage", "Clean gutters"],
    status: 'pending',
    priority: 'high',
    category: 'exterior'
  },
  {
    title: "HVAC maintenance",
    description: "Service heating and cooling systems before seasonal use",
    due_date: "2024-05-01",
    estimated_cost: 200,
    estimated_time: "3 hours",
    subtasks: ["Replace filters", "Clean condenser coils", "Check refrigerant levels"],
    status: 'pending',
    priority: 'medium',
    category: 'hvac'
  },
  {
    title: "Check plumbing",
    description: "Inspect for leaks and water damage throughout the home",
    due_date: "2024-04-30",
    estimated_cost: 100,
    estimated_time: "1 hour",
    subtasks: ["Check under sinks", "Inspect water heater", "Test water pressure"],
    status: 'pending',
    priority: 'medium',
    category: 'plumbing'
  },
  {
    title: "Clean dryer vent",
    description: "Remove lint buildup to prevent fire hazards",
    due_date: "2024-04-20",
    estimated_cost: 80,
    estimated_time: "1 hour",
    subtasks: ["Disconnect dryer", "Clean vent pipe", "Check exterior vent"],
    status: 'pending',
    priority: 'high',
    category: 'appliances'
  },
  {
    title: "Test smoke detectors",
    description: "Ensure all smoke and carbon monoxide detectors are working",
    due_date: "2024-04-10",
    estimated_cost: 30,
    estimated_time: "30 minutes",
    subtasks: ["Test all units", "Replace batteries", "Replace any faulty detectors"],
    status: 'pending',
    priority: 'high',
    category: 'safety'
  }
]; 