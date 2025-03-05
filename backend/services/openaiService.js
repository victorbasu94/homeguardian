const axios = require('axios');
const logger = require('winston');

/**
 * Generates a home maintenance plan using OpenAI API
 * @param {Object} homeDetails - Details about the home
 * @returns {Object} - JSON object with maintenance plan
 */
async function generateMaintenancePlanWithAI(homeDetails) {
  try {
    // Format home details as a string
    let homeDetailsString;
    if (typeof homeDetails === 'string') {
      homeDetailsString = homeDetails;
    } else {
      // Convert home object to a descriptive string
      const {
        address = {},
        size = {},
        yearBuilt,
        propertyType,
        features = {}
      } = homeDetails;

      const location = address.city && address.state 
        ? `${address.city}, ${address.state}` 
        : address.zipCode 
          ? `zip code ${address.zipCode}` 
          : 'unknown location';

      const squareFootage = size.totalSquareFeet || 'unknown size';
      const year = yearBuilt || 'unknown year';
      const type = propertyType || 'residential';

      // Create a descriptive string about the home
      homeDetailsString = `A ${squareFootage} sq ft ${type} property built in ${year} in ${location}`;

      // Add additional details if available
      const additionalDetails = [];
      if (features.roofType) additionalDetails.push(`roof type: ${features.roofType}`);
      if (features.heatingSystem) additionalDetails.push(`heating system: ${features.heatingSystem}`);
      if (features.coolingSystem) additionalDetails.push(`cooling system: ${features.coolingSystem}`);
      if (features.hasPool) additionalDetails.push('has a pool');
      if (features.hasGarden) additionalDetails.push('has a garden');
      
      if (additionalDetails.length > 0) {
        homeDetailsString += ` with ${additionalDetails.join(', ')}`;
      }
    }

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
            content: `You are a home maintenance expert. Based on the following home details, create a comprehensive home maintenance plan.

Home details: ${homeDetailsString}

Generate a detailed maintenance plan as a JSON object with the following structure:
{
  "maintenancePlan": [
    {
      "task": "Task name",
      "taskDescription": "Brief one-line description of the task",
      "suggestedCompletionDate": "YYYY-MM-DD",
      "estimatedCost": 150,
      "estimatedTime": "X hours",
      "subTasks": ["Subtask 1", "Subtask 2", "Subtask 3"]
    }
  ]
}

Important guidelines:
1. Consider the home's age, size, location, and climate when creating tasks.
2. Provide realistic cost estimates based on the location.
3. Include seasonal maintenance tasks appropriate for the climate.
4. Suggest completion dates that make sense for the task and location.
5. Include both routine maintenance and preventative tasks.
6. Ensure all dates are in YYYY-MM-DD format.
7. Ensure estimatedCost is a number (not a string).
8. Provide at least 10 maintenance tasks.

Return ONLY the JSON object with no additional text or explanation.`
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

    // Parse the response
    const aiResponse = response.data.choices[0].message.content;
    return JSON.parse(aiResponse);
  } catch (error) {
    logger.error('Error calling OpenAI API:', error.response?.data || error.message);
    throw new Error(`Failed to generate maintenance plan with AI: ${error.message}`);
  }
}

module.exports = {
  generateMaintenancePlanWithAI
}; 