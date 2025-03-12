const axios = require('axios');
const logger = require('../utils/logger');

/**
 * Generate a maintenance plan using OpenAI's API
 * @param {Object} homeDetails - Details about the home
 * @returns {Promise<Object>} The maintenance plan
 */
async function generateMaintenancePlanWithAI(homeDetails) {
  try {
    logger.info('Starting AI maintenance plan generation with details:', {
      location: homeDetails.location,
      year_built: homeDetails.year_built,
      square_footage: homeDetails.square_footage
    });

    // Validate environment variables
    if (!process.env.OPENAI_API_KEY) {
      logger.error('OpenAI API key not configured');
      throw new Error('OpenAI API key is not configured');
    }
    
    // Test the OpenAI API connection first
    try {
      logger.info('Testing OpenAI API connection...');
      const testResponse = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: 'Test connection' }],
          max_tokens: 5
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
          }
        }
      );
      logger.info('OpenAI API connection test successful:', {
        status: testResponse.status,
        model: testResponse.data.model
      });
    } catch (testError) {
      logger.error('OpenAI API connection test failed:', {
        error: testError.message,
        response: testError.response?.data
      });
      throw new Error(`OpenAI API connection test failed: ${testError.message}`);
    }
    
    logger.info('Using OpenAI configuration:', {
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      apiKeyPrefix: process.env.OPENAI_API_KEY.substring(0, 7) + '...'
    });

    const homeDetailsString = `
      Location: ${homeDetails.location}
      Year Built: ${homeDetails.year_built}
      Square Footage: ${homeDetails.square_footage}
      ${homeDetails.roof_type ? `Roof Type: ${homeDetails.roof_type}` : ''}
      ${homeDetails.hvac_type ? `HVAC Type: ${homeDetails.hvac_type}` : ''}
    `.trim();

    logger.info('Prepared home details string for OpenAI');

    // Get current date for context
    const currentDate = new Date().toISOString().split('T')[0]; // Format as YYYY-MM-DD

    // Prepare the OpenAI API request
    const requestBody = {
      model: process.env.OPENAI_MODEL || 'gpt-4',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: 'You are a home maintenance expert. Provide detailed, practical maintenance plans based on home details. IMPORTANT: All maintenance tasks MUST have due dates in the future, starting from the current date provided. Never generate tasks with past dates.'
        },
        {
          role: 'user',
          content: `Generate a detailed maintenance plan for the following home:

${homeDetailsString}

Today's date is: ${currentDate}

Return a JSON object with this structure:
{
  "tasks": [
    {
      "title": "Task name",
      "description": "Detailed description",
      "due_date": "YYYY-MM-DD",
      "status": "pending",
      "priority": "high|medium|low",
      "category": "hvac|plumbing|electrical|exterior|interior|safety|appliances|landscaping|general",
      "estimated_time": "2 hours",
      "estimated_cost": 150,
      "subtasks": ["Step 1", "Step 2", "Step 3"]
    }
  ],
  "generated_at": "2024-03-10T22:23:27.053Z"
}

Important guidelines:
1. Consider the home's age, size, location, and climate when creating tasks
2. Provide realistic cost estimates based on the location
3. Include seasonal maintenance tasks appropriate for the climate
4. Suggest completion dates that make sense for the task and location
5. Include both routine maintenance and preventative tasks
6. Ensure all dates are in YYYY-MM-DD format
7. Ensure estimatedCost is a number (not a string)
8. Provide at least 10 maintenance tasks
9. Set appropriate priorities based on task urgency and due dates
10. Use relevant categories from the list provided
11. CRITICAL: All due_date values MUST be in the future (after ${currentDate}). Do not generate any tasks with dates in the past.

Return ONLY the JSON object with no additional text or explanation.`
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    };

    logger.info('Making OpenAI API request...', {
      endpoint: 'https://api.openai.com/v1/chat/completions',
      model: requestBody.model,
      temperature: requestBody.temperature,
      max_tokens: requestBody.max_tokens
    });

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        }
      }
    );

    logger.info('Received response from OpenAI API', {
      status: response.status,
      statusText: response.statusText
    });

    // Parse and validate the response
    const aiResponse = response.data.choices[0].message.content;
    logger.debug('OpenAI raw response:', { content: aiResponse });

    const parsedResponse = JSON.parse(aiResponse);

    // Ensure the response has the expected structure
    if (!parsedResponse.tasks || !Array.isArray(parsedResponse.tasks)) {
      logger.error('Invalid response format from OpenAI:', { parsedResponse });
      throw new Error('Invalid response format from OpenAI API');
    }

    logger.info('Successfully parsed OpenAI response');

    // Validate that all due dates are in the future
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to beginning of day for accurate comparison
    
    let hasFixedDates = false;
    
    parsedResponse.tasks = parsedResponse.tasks.map(task => {
      const dueDate = new Date(task.due_date);
      
      // If due date is in the past or invalid, set it to a future date
      if (isNaN(dueDate.getTime()) || dueDate <= today) {
        hasFixedDates = true;
        const futureDate = new Date();
        
        // Distribute tasks over the next 90 days to avoid clustering
        const randomDays = Math.floor(Math.random() * 90) + 30; // 30-120 days in the future
        futureDate.setDate(futureDate.getDate() + randomDays);
        
        const oldDateStr = task.due_date;
        task.due_date = futureDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
        
        logger.warn(`Task "${task.title}" had an invalid or past due date (${oldDateStr}), adjusted to ${task.due_date}`);
      }
      
      return task;
    });
    
    if (hasFixedDates) {
      logger.info('Some task dates were adjusted to ensure they are in the future');
    }

    // Double-check all dates are in the future
    const allDatesValid = parsedResponse.tasks.every(task => {
      const dueDate = new Date(task.due_date);
      return !isNaN(dueDate.getTime()) && dueDate > today;
    });
    
    if (!allDatesValid) {
      logger.error('Some tasks still have invalid dates after correction');
      throw new Error('Failed to ensure all task dates are in the future');
    }

    // Return the response in the format expected by the frontend
    return {
      tasks: parsedResponse.tasks,
      generated_at: parsedResponse.generated_at || new Date().toISOString()
    };
  } catch (error) {
    logger.error('Error in OpenAI service:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      response: {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers,
        config: {
          url: error.response?.config?.url,
          method: error.response?.config?.method,
          baseURL: error.response?.config?.baseURL,
          headers: error.response?.config?.headers
        }
      }
    });
    
    // Provide more specific error messages based on the error type
    if (error.response?.status === 401) {
      throw new Error('Invalid OpenAI API key or unauthorized access');
    } else if (error.response?.status === 429) {
      throw new Error('OpenAI API rate limit exceeded');
    } else if (error.response?.status === 500) {
      throw new Error('OpenAI API service error');
    } else if (error.code === 'ECONNREFUSED') {
      throw new Error('Could not connect to OpenAI API');
    } else if (error.code === 'ETIMEDOUT') {
      throw new Error('Connection to OpenAI API timed out');
    }
    
    throw new Error(`Failed to generate maintenance plan: ${error.message}`);
  }
}

module.exports = {
  generateMaintenancePlanWithAI
}; 