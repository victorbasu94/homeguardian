const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { generateMaintenancePlan } = require('../services/maintenanceService');
const Home = require('../models/Home');
const Task = require('../models/Task');

// Mock the luxon DateTime to return a fixed date for testing
jest.mock('luxon', () => ({
  DateTime: {
    now: jest.fn().mockReturnValue({
      plus: jest.fn().mockImplementation(({ years, months }) => ({
        toISODate: () => {
          const date = new Date('2023-01-01');
          if (years) date.setFullYear(date.getFullYear() + years);
          if (months) date.setMonth(date.getMonth() + months);
          return date.toISOString().split('T')[0];
        }
      }))
    })
  }
}));

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Home.deleteMany({});
  await Task.deleteMany({});
});

describe('Maintenance Service', () => {
  test('should generate tasks for an older home with asphalt shingles and central AC', async () => {
    // Create a test home
    const home = new Home({
      user_id: new mongoose.Types.ObjectId(),
      year_built: 1990,
      square_footage: 2000,
      location: 'Test Location',
      roof_type: 'Asphalt Shingles',
      hvac_type: 'Central AC'
    });
    await home.save();

    // Generate maintenance plan
    const tasks = await generateMaintenancePlan(home);

    // Verify tasks
    expect(tasks.length).toBe(5);
    
    // Check for specific tasks
    const taskNames = tasks.map(task => task.task_name);
    expect(taskNames).toContain('Inspect Foundation');
    expect(taskNames).toContain('Replace Roof');
    expect(taskNames).toContain('Service AC');
    expect(taskNames).toContain('Clean Gutters');
    expect(taskNames).toContain('Check Smoke Detectors');

    // Verify tasks were saved to the database
    const savedTasks = await Task.find({ home_id: home._id });
    expect(savedTasks.length).toBe(5);
  });

  test('should generate only default tasks for a newer home with no specific features', async () => {
    // Create a test home
    const home = new Home({
      user_id: new mongoose.Types.ObjectId(),
      year_built: 2010,
      square_footage: 1500,
      location: 'Test Location'
    });
    await home.save();

    // Generate maintenance plan
    const tasks = await generateMaintenancePlan(home);

    // Verify tasks
    expect(tasks.length).toBe(2);
    
    // Check for specific tasks
    const taskNames = tasks.map(task => task.task_name);
    expect(taskNames).toContain('Clean Gutters');
    expect(taskNames).toContain('Check Smoke Detectors');
    expect(taskNames).not.toContain('Inspect Foundation');
    expect(taskNames).not.toContain('Replace Roof');
    expect(taskNames).not.toContain('Service AC');

    // Verify tasks were saved to the database
    const savedTasks = await Task.find({ home_id: home._id });
    expect(savedTasks.length).toBe(2);
  });

  test('should not create duplicate tasks for the same home', async () => {
    // Create a test home
    const home = new Home({
      user_id: new mongoose.Types.ObjectId(),
      year_built: 1990,
      square_footage: 2000,
      location: 'Test Location',
      roof_type: 'Asphalt Shingles',
      hvac_type: 'Central AC'
    });
    await home.save();

    // Generate maintenance plan twice
    await generateMaintenancePlan(home);
    const tasks = await generateMaintenancePlan(home);

    // Second call should return empty array as all tasks already exist
    expect(tasks.length).toBe(0);

    // Verify only one set of tasks was saved to the database
    const savedTasks = await Task.find({ home_id: home._id });
    expect(savedTasks.length).toBe(5);
  });

  test('should calculate correct due dates based on frequency', async () => {
    // Create a test home
    const home = new Home({
      user_id: new mongoose.Types.ObjectId(),
      year_built: 1990,
      square_footage: 2000,
      location: 'Test Location',
      roof_type: 'Asphalt Shingles',
      hvac_type: 'Central AC'
    });
    await home.save();

    // Generate maintenance plan
    await generateMaintenancePlan(home);

    // Verify due dates
    const tasks = await Task.find({ home_id: home._id });
    
    const smokeDetectorTask = tasks.find(task => task.task_name === 'Check Smoke Detectors');
    // Convert date to ISO string and extract the date part for comparison
    const smokeDetectorDate = new Date(smokeDetectorTask.due_date).toISOString().split('T')[0];
    expect(smokeDetectorDate).toBe('2023-07-01');  // 6 months from 2023-01-01
    
    const yearlyTasks = tasks.filter(task => 
      ['Inspect Foundation', 'Service AC', 'Clean Gutters'].includes(task.task_name)
    );
    yearlyTasks.forEach(task => {
      const yearlyDate = new Date(task.due_date).toISOString().split('T')[0];
      expect(yearlyDate).toBe('2024-01-01');  // 1 year from 2023-01-01
    });
    
    const roofTask = tasks.find(task => task.task_name === 'Replace Roof');
    const roofDate = new Date(roofTask.due_date).toISOString().split('T')[0];
    expect(roofDate).toBe('2038-01-01');  // 15 years from 2023-01-01
  });
}); 