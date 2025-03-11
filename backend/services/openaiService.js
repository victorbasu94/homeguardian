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
    
    logger.info('Using OpenAI configuration:', {
      model: process.env.OPENAI_MODEL || 'gpt-4',
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
          content: 'You are a home maintenance expert. Provide detailed, practical maintenance plans based on home details.'
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
11. IMPORTANT: All due_date values MUST be in the future (after today's date)

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
    
    parsedResponse.tasks = parsedResponse.tasks.map(task => {
      const dueDate = new Date(task.due_date);
      
      // If due date is in the past, set it to 30 days from now
      if (dueDate <= today) {
        logger.warn(`Task "${task.title}" had a past due date (${task.due_date}), adjusting to future date`);
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 30); // 30 days in the future
        task.due_date = futureDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
      }
      
      return task;
    });

    // Return the response in the format expected by the frontend
    return {
      tasks: parsedResponse.tasks,
      generated_at: parsedResponse.generated_at || new Date().toISOString()
    };
  } catch (error) {
    logger.error('Error in OpenAI service:', {
      name: error.name,
      message: error.message,
      response: {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers
      }
    });
    
    // Provide more specific error messages based on the error type
    if (error.response?.status === 401) {
      throw new Error('Invalid OpenAI API key or unauthorized access');
    } else if (error.response?.status === 429) {
      throw new Error('OpenAI API rate limit exceeded');
    } else if (error.response?.status === 500) {
      throw new Error('OpenAI API service error');
    }
    
    throw new Error(`Failed to generate maintenance plan: ${error.message}`);
  }
}

module.exports = {
  generateMaintenancePlanWithAI
}; 