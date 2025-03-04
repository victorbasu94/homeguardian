import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'sonner';

// Create a base axios instance with common configuration
const api = axios.create({
  baseURL: 'http://localhost:5001', // Local development backend server
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include credentials in requests
  timeout: 10000, // 10 seconds
});

// In-memory token storage (more secure than localStorage)
let accessToken: string | null = null;

// Initialize token from localStorage if available
if (typeof window !== 'undefined') {
  const storedToken = localStorage.getItem('accessToken');
  if (storedToken) {
    accessToken = storedToken;
  }
}

// Function to set the access token
export const setAccessToken = (token: string) => {
  accessToken = token;
  // Also set it directly in the headers for immediate use
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  console.log('Access token set:', token);
};

// Function to get the current access token
export const getAccessToken = () => {
  return accessToken;
};

// Function to clear the access token (logout)
export const clearAccessToken = () => {
  accessToken = null;
};

// Make getAccessToken accessible from window for auth checks
if (typeof window !== 'undefined') {
  (window as any).getAccessToken = getAccessToken;
}

// Add request interceptor
api.interceptors.request.use(
  (config) => {
    // Add authorization header if we have a token
    if (accessToken) {
      console.log('Request with token:', accessToken);
      config.headers.Authorization = `Bearer ${accessToken}`;
      
      // Debug: Check if the header was actually set
      console.log('Authorization header set:', config.headers.Authorization);
    } else {
      console.log('Request without token');
      
      // Debug: Check if there's a token in localStorage that wasn't set in memory
      const storedToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      if (storedToken) {
        console.log('Found token in localStorage but not in memory:', storedToken);
        // Set the token in memory and in the request
        accessToken = storedToken;
        config.headers.Authorization = `Bearer ${storedToken}`;
        console.log('Authorization header set from localStorage:', config.headers.Authorization);
      }
    }
    
    return config;
  },
  (error) => {
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
  async (error) => {
    const originalRequest = error.config;
    
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
                toast.error("Session expired. Please log in again.");
                // Don't redirect immediately, let the component handle it
                localStorage.removeItem('accessToken');
                clearAccessToken();
                return Promise.reject(error);
              }
              
              // Call the refresh token endpoint
              const response = await axios.post('http://localhost:5001/api/auth/refresh', {
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
              toast.error("Authentication failed. Please log in again.");
              Cookies.remove('refreshToken');
              clearAccessToken();
              localStorage.removeItem('accessToken');
              return Promise.reject(refreshError);
            }
          }
          break;
          
        case 403: // Forbidden
          toast.error("Access denied. You don't have permission to perform this action.");
          break;
          
        case 404: // Not Found
          toast.error("Resource not found.");
          break;
          
        case 500: // Server Error
        case 502: // Bad Gateway
        case 503: // Service Unavailable
        case 504: // Gateway Timeout
          toast.error("Server error. Please try again later.");
          break;
          
        default:
          toast.error(error.response.data?.message || "An unexpected error occurred.");
          break;
      }
    } else if (error.request) {
      // Request was made but no response received (network error)
      toast.error("Network error. Please check your connection and try again.");
    } else {
      // Something else caused the error
      toast.error("An unexpected error occurred.");
    }
    
    return Promise.reject(error);
  }
);

export default api;
