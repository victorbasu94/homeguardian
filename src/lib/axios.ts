import axios from 'axios';
import type { InternalAxiosRequestConfig, AxiosResponse } from 'axios';
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
  API_BASE_URL = 'https://maintainmint-backend-6dfe05c4ba93.herokuapp.com';
  console.log('Using production API URL:', API_BASE_URL);
}

console.log('Final API Base URL:', API_BASE_URL);

// Create a base axios instance with common configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true,
  timeout: 15000
});

// In-memory token storage
let accessToken: string | null = null;

// Initialize token from localStorage if available
if (typeof window !== 'undefined') {
  const storedToken = localStorage.getItem('accessToken');
  if (storedToken) {
    accessToken = storedToken;
    api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
  }
}

// Function to set the access token
export const setAccessToken = (token: string) => {
  if (!token) return;
  accessToken = token;
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  localStorage.setItem('accessToken', token);
};

// Function to clear the access token
export const clearAccessToken = () => {
  accessToken = null;
  delete api.defaults.headers.common['Authorization'];
  localStorage.removeItem('accessToken');
};

// Request interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          clearAccessToken();
          break;
      }
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