# HomeGuardian OpenAI Integration

This document explains how to use the OpenAI integration for generating AI-powered home maintenance plans in HomeGuardian.

## Setup

1. Make sure you have an OpenAI API key. You can get one from [OpenAI's platform](https://platform.openai.com/api-keys).

2. Add your OpenAI API key to your `.env` file:
   ```
   OPENAI_API_KEY=your_openai_api_key
   OPENAI_MODEL=gpt-4  # or gpt-3.5-turbo if you prefer
   ```

## API Endpoints

### Generate AI Maintenance Plan for a Home

This endpoint generates a maintenance plan for an existing home in the database using OpenAI.

```
POST /api/tasks/generate-ai-plan/:homeId
```

**Parameters:**
- `homeId` (path parameter): The MongoDB ID of the home

**Authentication:**
- Requires a valid JWT token

**Response:**
```json
{
  "message": "AI-powered maintenance plan generated successfully",
  "tasks": [
    {
      "home_id": "60d21b4667d0d8992e610c85",
      "task_name": "Inspect roof",
      "description": "Check for leaks or damaged shingles",
      "frequency": "custom",
      "due_date": "2025-04-15",
      "why": "AI-recommended maintenance task",
      "estimated_time": 120,
      "estimated_cost": 150,
      "category": "maintenance",
      "priority": "medium",
      "steps": [
        "Check shingles",
        "Clean gutters",
        "Look for water damage"
      ],
      "completed": false,
      "ai_generated": true
    },
    // More tasks...
  ]
}
```

### Test AI Maintenance Plan with Raw Home Details

This endpoint allows you to test the OpenAI integration by providing raw home details as a string.

```
POST /api/tasks/test-ai-plan
```

**Request Body:**
```json
{
  "homeDetails": "A 2000 sq ft home built in 1990 in Seattle, WA with a shingled roof and gas heating"
}
```

**Authentication:**
- Requires a valid JWT token

**Response:**
```json
{
  "maintenancePlan": [
    {
      "task": "Inspect roof",
      "taskDescription": "Check for leaks or damaged shingles",
      "suggestedCompletionDate": "2025-04-15",
      "estimatedCost": 150,
      "estimatedTime": "2 hours",
      "subTasks": [
        "Check shingles",
        "Clean gutters",
        "Look for water damage"
      ]
    },
    // More tasks...
  ]
}
```

## How It Works

1. The system takes home details (either from the database or provided directly) and formats them into a descriptive string.

2. This string is sent to OpenAI's API with a carefully crafted prompt that instructs the AI to generate a maintenance plan.

3. The AI returns a JSON object with an array of maintenance tasks, each containing:
   - Task name
   - Task description
   - Suggested completion date
   - Estimated cost
   - Estimated time
   - Subtasks

4. For the `/generate-ai-plan/:homeId` endpoint, these tasks are converted to the HomeGuardian task format and saved to the database.

## Example Usage with cURL

```bash
# Generate AI plan for an existing home
curl -X POST http://localhost:5000/api/tasks/generate-ai-plan/60d21b4667d0d8992e610c85 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"

# Test with raw home details
curl -X POST http://localhost:5000/api/tasks/test-ai-plan \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"homeDetails": "A 2000 sq ft home built in 1990 in Seattle, WA with a shingled roof and gas heating"}'
```

## Troubleshooting

- **Error: "Failed to generate AI maintenance plan"**: Check that your OpenAI API key is valid and has sufficient credits.
- **Empty response**: Ensure that your home details are descriptive enough for the AI to generate meaningful tasks.
- **Rate limiting**: OpenAI has rate limits. If you're making many requests, you might hit these limits. 