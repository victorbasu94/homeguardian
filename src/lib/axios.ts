import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'sonner';

// Get the API base URL from environment variables
let API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

console.log('Original API Base URL:', API_BASE_URL);

// CORS Strategy Configuration
// Instead of using proxies which are also getting blocked, we'll try direct connection
// with modified settings
const USE_DIRECT_CONNECTION = true;

// Remove trailing slash if present
if (API_BASE_URL.endsWith('/')) {
  API_BASE_URL = API_BASE_URL.slice(0, -1);
}

// Make sure the URL is properly formatted
if (!API_BASE_URL.startsWith('http://') && !API_BASE_URL.startsWith('https://')) {
  API_BASE_URL = 'https://' + API_BASE_URL;
}

// For production, ensure we're using the correct backend URL
if (import.meta.env.PROD) {
  // Check if we're using the maintainmint backend
  if (API_BASE_URL.includes('maintainmint-backend')) {
    // Fix any typos in the URL (like _om instead of .com)
    if (API_BASE_URL.includes('maintainmint-backend_om')) {
      API_BASE_URL = API_BASE_URL.replace('maintainmint-backend_om', 'maintainmint-backend.com');
      console.log('Fixed typo in backend URL (_om -> .com):', API_BASE_URL);
    }
    
    // Ensure it has the correct format for Heroku
    if (!API_BASE_URL.includes('herokuapp.com')) {
      API_BASE_URL = `https://maintainmint-backend-6dfe05c4ba93.herokuapp.com`;
      console.log('Corrected API Base URL for production:', API_BASE_URL);
    }
  }
}

console.log('Final API Base URL:', API_BASE_URL);

// Create a base axios instance with common configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    // Add headers that might help bypass CORS
    'Accept': 'application/json, text/plain, */*',
    'X-Requested-With': 'XMLHttpRequest',
  },
  // Disable withCredentials to avoid preflight requests
  withCredentials: false,
  timeout: 15000, // 15 seconds - increased timeout
});

// In-memory token storage (more secure than localStorage)
let accessToken: string | null = null;

// Initialize token from localStorage if available
if (typeof window !== 'undefined') {
  try {
    const storedToken = localStorage.getItem('accessToken');
    if (storedToken) {
      accessToken = storedToken;
      console.log('Token loaded from localStorage on initialization:', storedToken.substring(0, 10) + '...');
    } else {
      console.log('No token found in localStorage on initialization');
    }
  } catch (error) {
    console.error('Error accessing localStorage:', error);
  }
}

// Function to set the access token
export const setAccessToken = (token: string) => {
  if (!token) {
    console.warn('Attempted to set empty access token');
    return;
  }
  
  try {
    accessToken = token;
    // Also set it directly in the headers for immediate use
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log('Access token set successfully:', token.substring(0, 10) + '...');
    
    // Also store in localStorage for persistence
    localStorage.setItem('accessToken', token);
    console.log('Token saved to localStorage');
  } catch (error) {
    console.error('Error setting access token:', error);
  }
};

// Function to get the current access token
export const getAccessToken = () => {
  return accessToken;
};

// Function to clear the access token (logout)
export const clearAccessToken = () => {
  accessToken = null;
  delete api.defaults.headers.common['Authorization'];
  try {
    localStorage.removeItem('accessToken');
  } catch (error) {
    console.error('Error removing token from localStorage:', error);
  }
};

// Make getAccessToken accessible from window for auth checks
if (typeof window !== 'undefined') {
  (window as any).getAccessToken = getAccessToken;
}

// Create a direct fetch function that bypasses axios for critical endpoints
export const directFetch = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  console.log(`Making direct fetch request to: ${url}`);
  
  // Set default headers
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  
  // Add authorization if we have a token
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }
  
  // Create the request options
  const requestOptions: RequestInit = {
    ...options,
    headers,
    mode: 'cors',
    credentials: 'omit', // Don't send cookies
  };
  
  try {
    const response = await fetch(url, requestOptions);
    
    // Check if the response is ok
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    // Parse the JSON response
    const data = await response.json();
    return { data, status: response.status };
  } catch (error) {
    console.error('Direct fetch error:', error);
    throw error;
  }
};

// Add request interceptor
api.interceptors.request.use(
  (config: any) => {
    // Add authorization header if we have a token
    if (accessToken) {
      console.log('Request with token:', accessToken.substring(0, 10) + '...');
      config.headers.Authorization = `Bearer ${accessToken}`;
      
      // Debug: Check if the header was actually set
      console.log('Authorization header set:', config.headers.Authorization.substring(0, 16) + '...');
    } else {
      console.log('Request without token');
      
      // Debug: Check if there's a token in localStorage that wasn't set in memory
      try {
        const storedToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
        if (storedToken) {
          console.log('Found token in localStorage but not in memory:', storedToken.substring(0, 10) + '...');
          // Set the token in memory and in the request
          accessToken = storedToken;
          config.headers.Authorization = `Bearer ${storedToken}`;
          console.log('Authorization header set from localStorage:', config.headers.Authorization.substring(0, 16) + '...');
        } else {
          console.log('No token found in localStorage either');
        }
      } catch (error) {
        console.error('Error checking localStorage for token:', error);
      }
    }
    
    // Log the full request details for debugging
    console.log('Request details:', {
      url: config.url,
      method: config.method,
      baseURL: config.baseURL,
      hasAuthHeader: !!config.headers.Authorization,
    });
    
    return config;
  },
  (error: any) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh and other errors
api.interceptors.response.use(
  (response) => {
    // For the homes endpoint, ensure we're returning data in the expected format
    if (response.config.url?.includes('/api/homes') && response.data && !response.data.data && !Array.isArray(response.data)) {
      // If the response doesn't have a data property and isn't an array, wrap it in a data property
      console.log('Normalizing homes response format:', response.data);
      return {
        ...response,
        data: {
          data: Array.isArray(response.data) ? response.data : (response.data.data || [])
        }
      };
    }
    return response;
  },
  async (error: any) => {
    const originalRequest = error.config;
    
    // Check if this is a CORS error or network error
    if (error.message && (error.message.includes('Network Error') || error.message.includes('CORS'))) {
      console.error('Network/CORS error detected:', error.message);
      
      // If this is a login request, try using the direct fetch method
      if (originalRequest.url && originalRequest.url.includes('/api/auth/login') && !originalRequest._retryWithDirectFetch) {
        originalRequest._retryWithDirectFetch = true;
        
        try {
          console.log('Retrying login with direct fetch...');
          
          // Extract the request body
          const requestBody = JSON.parse(originalRequest.data);
          
          // Make a direct fetch request
          const response = await directFetch('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify(requestBody)
          });
          
          // Return a response in the format axios expects
          return {
            data: response.data,
            status: response.status,
            statusText: 'OK',
            headers: {},
            config: originalRequest,
            request: {}
          };
        } catch (directFetchError) {
          console.error('Direct fetch also failed:', directFetchError);
          return Promise.reject(directFetchError);
        }
      }
    }
    
    // Handle different types of errors
    if (error.response) {
      // Server responded with an error status
      switch (error.response.status) {
        case 401: // Unauthorized
          // If we haven't tried to refresh the token yet
          if (!originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
              // Attempt to refresh the token
              const refreshToken = Cookies.get('refreshToken');
              
              if (!refreshToken) {
                // No refresh token available, force logout
                toast('Session expired. Please log in again.');
                // Don't redirect immediately, let the component handle it
                localStorage.removeItem('accessToken');
                clearAccessToken();
                return Promise.reject(error);
              }
              
              // Call the refresh token endpoint
              const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
                refreshToken
              });
              
              // Get the new access token
              const newAccessToken = response.data.accessToken;
              
              // Update the access token
              setAccessToken(newAccessToken);
              localStorage.setItem('accessToken', newAccessToken);
              
              // Retry the original request with the new token
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
              return api(originalRequest);
            } catch (refreshError) {
              // Token refresh failed, force logout
              toast('Authentication failed. Please log in again.');
              Cookies.remove('refreshToken');
              clearAccessToken();
              localStorage.removeItem('accessToken');
              return Promise.reject(refreshError);
            }
          }
          break;
          
        case 403: // Forbidden
          toast('Access denied. You don\'t have permission to perform this action.');
          break;
          
        case 404: // Not Found
          toast('Resource not found.');
          break;
          
        case 500: // Server Error
        case 502: // Bad Gateway
        case 503: // Service Unavailable
        case 504: // Gateway Timeout
          toast('Server error. Please try again later.');
          break;
          
        default:
          toast(error.response.data?.message || 'An unexpected error occurred.');
          break;
      }
    } else if (error.request) {
      // Request was made but no response received (network error)
      toast('Network error. Please check your connection and try again.');
    } else {
      // Something else caused the error
      toast('An unexpected error occurred.');
    }
    
    return Promise.reject(error);
  }
);

// Function to diagnose CORS issues
export const diagnoseCorsIssues = async () => {
  console.log('Diagnosing potential CORS issues...');
  
  try {
    // Try a simple fetch request to check CORS configuration
    const response = await fetch(`${API_BASE_URL}/api/health`, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
      }
    });
    
    console.log('CORS test response:', {
      status: response.status,
      ok: response.ok
    });
    
    return {
      success: response.ok,
      status: response.status
    };
  } catch (error) {
    console.error('CORS diagnosis failed:', error);
    return {
      success: false,
      error
    };
  }
};

// Run CORS diagnosis on startup
if (typeof window !== 'undefined') {
  setTimeout(() => {
    diagnoseCorsIssues().then(result => {
      console.log('CORS diagnosis complete:', result.success ? 'No issues detected' : 'Issues detected');
    });
  }, 1000); // Delay by 1 second to not block initial rendering
}

export default api; 