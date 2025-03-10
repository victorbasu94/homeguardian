const axios = require('axios');
const logger = require('../utils/logger');

/**
 * Generate a maintenance plan using OpenAI's API
 * @param {Object} homeDetails - Details about the home
 * @returns {Promise<Object>} The maintenance plan
 */
async function generateMaintenancePlanWithAI(homeDetails) {
  try {
    // Validate environment variables
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }

    const homeDetailsString = `
      Location: ${homeDetails.location}
      Year Built: ${homeDetails.year_built}
      Square Footage: ${homeDetails.square_footage}
      ${homeDetails.roof_type ? `Roof Type: ${homeDetails.roof_type}` : ''}
      ${homeDetails.hvac_type ? `HVAC Type: ${homeDetails.hvac_type}` : ''}
    `.trim();

    // Prepare the OpenAI API request
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
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

Return a JSON object with this structure:
{
  "tasks": [
    {
      "task_name": "Task name",
      "description": "Detailed description",
      "due_date": "YYYY-MM-DD",
      "estimated_cost": 150,
      "estimated_time": "2 hours",
      "category": "hvac|plumbing|electrical|exterior|interior|safety|appliances|landscaping|general",
      "steps": ["Step 1", "Step 2", "Step 3"],
      "priority": "high|medium|low"
    }
  ]
}`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        }
      }
    );

    // Parse and validate the response
    const aiResponse = response.data.choices[0].message.content;
    const parsedResponse = JSON.parse(aiResponse);

    // Ensure the response has the expected structure
    if (!parsedResponse.tasks || !Array.isArray(parsedResponse.tasks)) {
      throw new Error('Invalid response format from OpenAI API');
    }

    return {
      tasks: parsedResponse.tasks,
      generated_at: new Date().toISOString()
    };
  } catch (error) {
    logger.error('Error calling OpenAI API:', error.response?.data || error.message);
    
    // Provide more specific error messages based on the error type
    if (error.response?.status === 401) {
      throw new Error('Invalid OpenAI API key');
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