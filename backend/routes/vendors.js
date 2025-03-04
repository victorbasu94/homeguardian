const express = require('express');
const router = express.Router();
const axios = require('axios');
require('dotenv').config();

/**
 * @swagger
 * /api/vendors:
 *   get:
 *     summary: Get vendors for a specific task
 *     description: Fetches vendors based on location and task type using Google Maps APIs
 *     parameters:
 *       - in: query
 *         name: location
 *         required: true
 *         schema:
 *           type: string
 *         description: Location string (e.g., "Denver, CO")
 *       - in: query
 *         name: task
 *         required: true
 *         schema:
 *           type: string
 *         description: Task name (e.g., "HVAC Filter Replacement")
 *     responses:
 *       200:
 *         description: List of vendors
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   address:
 *                     type: string
 *                   distance:
 *                     type: number
 *                   phone:
 *                     type: string
 */
router.get('/', async (req, res) => {
  try {
    const { location, task } = req.query;
    
    // Validate required parameters
    if (!location || !task) {
      return res.status(400).json({ 
        error: 'Missing required parameters: location and task are required' 
      });
    }

    // Get Google API key from environment variables
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.error('Google Maps API key is not configured');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Step 1: Convert location to coordinates using Geocoding API
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${apiKey}`;
    const geocodeResponse = await axios.get(geocodeUrl);
    
    if (geocodeResponse.data.status !== 'OK' || !geocodeResponse.data.results.length) {
      return res.status(404).json({ error: 'Location not found' });
    }

    const { lat, lng } = geocodeResponse.data.results[0].geometry.location;
    
    // Step 2: Search for nearby vendors using Places API
    // Construct search query based on task type
    const searchQuery = getSearchQueryFromTask(task);
    const radius = 10000; // 10km radius (approximately 6.2 miles)
    
    const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&keyword=${encodeURIComponent(searchQuery)}&type=business&key=${apiKey}`;
    const placesResponse = await axios.get(placesUrl);
    
    if (placesResponse.data.status !== 'OK') {
      console.error('Places API error:', placesResponse.data.status);
      return res.status(500).json({ error: 'Error fetching vendors' });
    }

    // Step 3: Process and format vendor data
    const vendors = await processVendorResults(placesResponse.data.results, lat, lng, apiKey);
    
    res.json(vendors);
  } catch (error) {
    console.error('Vendor API error:', error.message);
    res.status(500).json({ error: 'Failed to fetch vendors' });
  }
});

/**
 * Determines appropriate search terms based on task type
 * @param {string} task - The task name
 * @returns {string} - Search query for Places API
 */
function getSearchQueryFromTask(task) {
  // Map common task types to relevant search terms
  const taskMap = {
    'hvac filter replacement': 'hvac contractor',
    'hvac repair': 'hvac repair service',
    'plumbing': 'plumber',
    'electrical': 'electrician',
    'roof repair': 'roofing contractor',
    'lawn maintenance': 'lawn service',
    'gutter cleaning': 'gutter cleaning service',
    'window cleaning': 'window cleaning service',
    'carpet cleaning': 'carpet cleaner',
    'pest control': 'pest control service',
    'painting': 'painting contractor',
    'appliance repair': 'appliance repair service'
  };

  // Convert task to lowercase for case-insensitive matching
  const taskLower = task.toLowerCase();
  
  // Find the most relevant search term
  for (const [key, value] of Object.entries(taskMap)) {
    if (taskLower.includes(key)) {
      return value;
    }
  }
  
  // Default: use the task name with "service" appended
  return `${task} service`;
}

/**
 * Process vendor results from Places API
 * @param {Array} results - Places API results
 * @param {number} userLat - User's latitude
 * @param {number} userLng - User's longitude
 * @param {string} apiKey - Google API key
 * @returns {Array} - Processed vendor data
 */
async function processVendorResults(results, userLat, userLng, apiKey) {
  // Get details for each place to retrieve phone numbers
  const vendorPromises = results.slice(0, 10).map(async (place) => {
    try {
      // Get additional details including phone number
      const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,formatted_address,formatted_phone_number,geometry&key=${apiKey}`;
      const detailsResponse = await axios.get(detailsUrl);
      
      if (detailsResponse.data.status !== 'OK') {
        return null;
      }
      
      const details = detailsResponse.data.result;
      
      // Calculate distance in miles
      const distance = calculateDistance(
        userLat, 
        userLng, 
        details.geometry.location.lat, 
        details.geometry.location.lng
      );
      
      return {
        name: details.name,
        address: details.formatted_address,
        distance: parseFloat(distance.toFixed(1)), // Round to 1 decimal place
        phone: details.formatted_phone_number || 'Phone not listed'
      };
    } catch (error) {
      console.error('Error fetching place details:', error.message);
      return null;
    }
  });
  
  // Wait for all promises to resolve
  const vendors = (await Promise.all(vendorPromises)).filter(vendor => vendor !== null);
  
  // Sort by distance
  return vendors.sort((a, b) => a.distance - b.distance);
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - First latitude
 * @param {number} lon1 - First longitude
 * @param {number} lat2 - Second latitude
 * @param {number} lon2 - Second longitude
 * @returns {number} - Distance in miles
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 3958.8; // Earth's radius in miles
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * Convert degrees to radians
 * @param {number} degrees - Angle in degrees
 * @returns {number} - Angle in radians
 */
function toRadians(degrees) {
  return degrees * (Math.PI/180);
}

module.exports = router; 