import { MaintenanceTask } from '@/contexts/MaintenanceContext';

// Mock maintenance tasks for development
export const MOCK_MAINTENANCE_TASKS: MaintenanceTask[] = [
  {
    id: 'mock-1',
    title: "Inspect roof",
    description: "Check for damaged shingles, leaks, and clean gutters",
    due_date: "2024-06-15",
    status: 'pending',
    priority: 'medium',
    category: 'Exterior',
    estimated_cost: 150,
    estimated_time: "2 hours",
    subtasks: ["Check shingles", "Look for water damage", "Clean gutters"],
    home_id: 'mock-home',
    
    // Alternative property names for compatibility
    task: "Inspect roof",
    taskDescription: "Check for damaged shingles, leaks, and clean gutters",
    suggestedCompletionDate: "2024-06-15",
    estimatedCost: 150,
    estimatedTime: "2 hours",
    subTasks: ["Check shingles", "Look for water damage", "Clean gutters"]
  },
  {
    id: 'mock-2',
    title: "HVAC maintenance",
    description: "Service heating and cooling systems before seasonal use",
    due_date: "2024-05-01",
    status: 'pending',
    priority: 'high',
    category: 'HVAC',
    estimated_cost: 200,
    estimated_time: "3 hours",
    subtasks: ["Replace filters", "Clean condenser coils", "Check refrigerant levels"],
    home_id: 'mock-home',
    
    // Alternative property names for compatibility
    task: "HVAC maintenance",
    taskDescription: "Service heating and cooling systems before seasonal use",
    suggestedCompletionDate: "2024-05-01",
    estimatedCost: 200,
    estimatedTime: "3 hours",
    subTasks: ["Replace filters", "Clean condenser coils", "Check refrigerant levels"]
  },
  {
    id: 'mock-3',
    title: "Check plumbing",
    description: "Inspect for leaks and water damage throughout the home",
    due_date: "2024-04-30",
    status: 'pending',
    priority: 'medium',
    category: 'Plumbing',
    estimated_cost: 100,
    estimated_time: "1 hour",
    subtasks: ["Check under sinks", "Inspect water heater", "Test water pressure"],
    home_id: 'mock-home',
    
    // Alternative property names for compatibility
    task: "Check plumbing",
    taskDescription: "Inspect for leaks and water damage throughout the home",
    suggestedCompletionDate: "2024-04-30",
    estimatedCost: 100,
    estimatedTime: "1 hour",
    subTasks: ["Check under sinks", "Inspect water heater", "Test water pressure"]
  },
  {
    id: 'mock-4',
    title: "Clean dryer vent",
    description: "Remove lint buildup to prevent fire hazards",
    due_date: "2024-04-20",
    status: 'pending',
    priority: 'low',
    category: 'Appliances',
    estimated_cost: 80,
    estimated_time: "1 hour",
    subtasks: ["Disconnect dryer", "Clean vent pipe", "Check exterior vent"],
    home_id: 'mock-home',
    
    // Alternative property names for compatibility
    task: "Clean dryer vent",
    taskDescription: "Remove lint buildup to prevent fire hazards",
    suggestedCompletionDate: "2024-04-20",
    estimatedCost: 80,
    estimatedTime: "1 hour",
    subTasks: ["Disconnect dryer", "Clean vent pipe", "Check exterior vent"]
  },
  {
    id: 'mock-5',
    title: "Test smoke detectors",
    description: "Ensure all smoke and carbon monoxide detectors are working",
    due_date: "2024-04-10",
    status: 'pending',
    priority: 'high',
    category: 'Safety',
    estimated_cost: 30,
    estimated_time: "30 minutes",
    subtasks: ["Test all units", "Replace batteries", "Replace any faulty detectors"],
    home_id: 'mock-home',
    
    // Alternative property names for compatibility
    task: "Test smoke detectors",
    taskDescription: "Ensure all smoke and carbon monoxide detectors are working",
    suggestedCompletionDate: "2024-04-10",
    estimatedCost: 30,
    estimatedTime: "30 minutes",
    subTasks: ["Test all units", "Replace batteries", "Replace any faulty detectors"]
  }
]; 