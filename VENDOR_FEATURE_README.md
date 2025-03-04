# Connect to Vendors Feature

This feature allows users to find nearby service providers for their home maintenance tasks using the Google Maps Places API.

## Overview

The "Connect to Vendors" feature adds a button to the task details page that, when clicked, fetches and displays nearby vendors based on:
1. The task type (e.g., "HVAC Filter Replacement")
2. The user's home location (e.g., "Denver, CO")

## Implementation Details

### Backend
- Express route at `/api/vendors` that accepts `location` and `task` query parameters
- Uses Google Maps Geocoding API to convert location to coordinates
- Uses Google Places API to find relevant businesses
- Returns vendor data with name, address, distance, and phone number

### Frontend
- React component that integrates with the task details page
- Button in the header section to fetch vendors
- Displays vendor list with contact information

## Setup Instructions

### 1. Google Maps API Key Setup

1. **Create a Google Cloud Project**:
   - Go to the [Google Cloud Console](https://console.cloud.google.com/)
   - Click "Select a project" at the top of the page, then click "New Project"
   - Enter a project name (e.g., "HomeGuardian") and click "Create"

2. **Enable Required APIs**:
   - In your new project, go to "APIs & Services" > "Library"
   - Search for and enable the following APIs:
     - Maps JavaScript API
     - Places API
     - Geocoding API

3. **Create API Key**:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Your new API key will be displayed

4. **Restrict API Key** (Recommended for security):
   - In the credentials page, click on your newly created API key
   - Under "Application restrictions", choose "HTTP referrers" and add your website domains
   - Under "API restrictions", restrict the key to only the APIs you enabled
   - Click "Save"

### 2. Backend Configuration

1. **Set Environment Variable**:
   - Open your `.env` file in the backend directory
   - Add your Google Maps API key:
     ```
     GOOGLE_MAPS_API_KEY=your_api_key_here
     ```
   - If you don't have a `.env` file, create one based on `.env.example`

2. **Install Required Packages**:
   - Make sure axios is installed:
     ```bash
     npm install axios
     ```

3. **Security Considerations**:
   - **IMPORTANT**: Never commit your `.env` file to version control
   - Add `.env` to your `.gitignore` file if it's not already there
   - Consider using API key restrictions as mentioned above to prevent unauthorized use

### 3. Frontend Configuration

No additional configuration is needed for the frontend as it calls the backend API.

## Usage

1. Navigate to a task details page
2. Click the "Connect to Vendors" button in the header
3. The system will fetch and display nearby vendors related to the task
4. Users can call vendors directly by clicking on their phone numbers

## Testing

You can test the feature with:
- Location: "Denver, CO"
- Task: "HVAC Filter Replacement"

## Troubleshooting

- If vendors aren't loading, check the browser console for errors
- Verify your API key is correctly set in the `.env` file
- Ensure the Google APIs are enabled in your Google Cloud Console
- Check that your API key has the necessary permissions

## Security Warnings

1. **API Key Exposure**: Never expose your Google Maps API key in client-side code. Always use the backend as a proxy for API calls.

2. **Rate Limiting**: Implement rate limiting on your backend to prevent abuse of your API key.

## Production Deployment

When deploying to production:

1. Create a separate API key with stricter restrictions for production use
2. Set up proper error logging and monitoring
3. Consider implementing caching for vendor results to reduce API calls
4. Update your environment variables on your production server 