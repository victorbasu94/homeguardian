import { getMaintenancePlan, HomeDetails } from './maintenanceApi';
import api from './axios';

/**
 * This file provides integration between our mock maintenance plan generator
 * and the backend API. In development mode, it intercepts certain API calls
 * and returns mock data instead.
 */

// Original API methods
const originalApiGet = api.get;
const originalApiPost = api.post;

// Monkey patch the API to intercept certain calls
if (import.meta.env.DEV) {
  // Override the get method to intercept task-related API calls
  api.get = async function(url: string, config?: any) {
    // If this is a request for tasks for a specific home
    if (url.match(/\/api\/tasks\/[a-zA-Z0-9-]+$/)) {
      const homeId = url.split('/').pop();
      
      try {
        // First, get the home details
        const homeResponse = await originalApiGet.call(api, `/api/homes/${homeId}`, config);
        const homeData = homeResponse.data.data;
        
        if (!homeData) {
          throw new Error('Home not found');
        }
        
        // Convert to HomeDetails format
        const homeDetails: HomeDetails = {
          id: homeData.id,
          name: homeData.name,
          location: homeData.location,
          year_built: homeData.year_built,
          square_footage: homeData.square_feet || homeData.square_footage,
          roof_type: homeData.roof_type,
          hvac_type: homeData.hvac_type
        };
        
        // Generate mock maintenance plan
        const plan = await getMaintenancePlan(homeDetails);
        
        // Add unique IDs to tasks
        const tasksWithIds = plan.tasks.map((task, index) => ({
          ...task,
          id: `mock-task-${homeId}-${index}`,
          home_id: homeId
        }));
        
        // Return in the format expected by the frontend
        return {
          data: {
            success: true,
            data: tasksWithIds
          }
        };
      } catch (error) {
        console.error('Error generating mock tasks:', error);
        // Fall back to the original API call
        return originalApiGet.call(api, url, config);
      }
    }
    
    // For all other requests, use the original method
    return originalApiGet.call(api, url, config);
  };
  
  // Override the post method to intercept task creation
  api.post = async function(url: string, data?: any, config?: any) {
    // If this is a request to create a task
    if (url === '/api/tasks') {
      // Generate a mock response for task creation
      return {
        data: {
          success: true,
          data: {
            ...data,
            id: `mock-task-${Date.now()}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        }
      };
    }
    
    // For all other requests, use the original method
    return originalApiPost.call(api, url, data, config);
  };
}

// Export the patched API
export default api; 