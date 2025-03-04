
import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'sonner';

// Create a base axios instance with common configuration
const api = axios.create({
  baseURL: 'https://api.example.com', // Replace with your actual API URL in production
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

// In-memory token storage (more secure than localStorage)
let accessToken: string | null = null;

// Function to set the access token
export const setAccessToken = (token: string) => {
  accessToken = token;
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

// Request interceptor to add auth header
api.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
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
                window.location.href = '/login';
                return Promise.reject(error);
              }
              
              // Call the refresh token endpoint
              const response = await axios.post('https://api.example.com/api/auth/refresh', {
                refreshToken
              });
              
              // Get the new access token
              const newAccessToken = response.data.accessToken;
              
              // Update the access token
              setAccessToken(newAccessToken);
              
              // Retry the original request with the new token
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
              return api(originalRequest);
            } catch (refreshError) {
              // Token refresh failed, force logout
              toast.error("Authentication failed. Please log in again.");
              Cookies.remove('refreshToken');
              clearAccessToken();
              window.location.href = '/login';
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
