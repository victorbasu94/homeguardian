import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'sonner';

// Get the API base URL from environment variables
let API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

console.log('Original API Base URL:', API_BASE_URL);

// CORS Proxy Configuration
// In production, we'll use a CORS proxy to bypass CORS restrictions
const USE_CORS_PROXY = false; // Set to false to disable the CORS proxy

// List of CORS proxies to try in order
const CORS_PROXIES = [
  'https://corsproxy.io/?',
  'https://cors-anywhere.herokuapp.com/',
  'https://api.allorigins.win/raw?url='
];

// Track which proxy we're currently using
let currentProxyIndex = 0;

// Function to get the current CORS proxy URL
const getCurrentProxyUrl = (): string => {
  return CORS_PROXIES[currentProxyIndex];
};

// Function to switch to the next proxy if the current one fails
export const switchToNextProxy = (): boolean => {
  if (currentProxyIndex < CORS_PROXIES.length - 1) {
    currentProxyIndex++;
    console.log(`Switching to next CORS proxy: ${getCurrentProxyUrl()}`);
    return true;
  }
  console.warn('No more CORS proxies available to try');
  return false;
};

// Function to apply CORS proxy to a URL if needed
const applyProxyIfNeeded = (url: string): string => {
  if (USE_CORS_PROXY) {
    // Only use the proxy if explicitly enabled
    const proxyUrl = getCurrentProxyUrl();
    console.log(`Applying CORS proxy (${proxyUrl}) to URL:`, url);
    return `${proxyUrl}${encodeURIComponent(url)}`;
  }
  return url;
};

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
  // We don't apply the proxy to the baseURL, but to individual requests
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: USE_CORS_PROXY ? false : true, // Disable withCredentials when using proxy
  timeout: 10000, // 10 seconds
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
};

// Make getAccessToken accessible from window for auth checks
if (typeof window !== 'undefined') {
  (window as any).getAccessToken = getAccessToken;
}

// Add request interceptor
api.interceptors.request.use(
  (config) => {
    // Apply CORS proxy to the URL if needed
    if (config.url && !config.url.startsWith('http')) {
      const fullUrl = `${API_BASE_URL}${config.url}`;
      config.url = applyProxyIfNeeded(fullUrl);
    } else if (config.url) {
      config.url = applyProxyIfNeeded(config.url);
    }
    
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
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh and other errors
api.interceptors.response.use(
  (response) => {
    // For the homes endpoint, ensure we're returning data in the expected format
    if (response.config.url?.includes('/api/homes') && (response.data as any) && !(response.data as any).data && !Array.isArray((response.data as any))) {
      // If the response doesn't have a data property and isn't an array, wrap it in a data property
      console.log('Normalizing homes response format:', response.data);
      return {
        ...response,
        data: {
          data: Array.isArray((response.data as any)) ? (response.data as any) : ((response.data as any).data || [])
        }
      };
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Check if this is a CORS error or network error
    if (error.message && error.message.includes('Network Error') && USE_CORS_PROXY) {
      console.error('Network error detected, might be CORS-related');
      
      // Try switching to another proxy
      if (switchToNextProxy() && originalRequest && !originalRequest._retryWithNextProxy) {
        originalRequest._retryWithNextProxy = true;
        
        // Update the URL with the new proxy
        if (originalRequest.url && originalRequest.url.includes(CORS_PROXIES[currentProxyIndex - 1])) {
          // Replace the old proxy with the new one
          const urlWithoutProxy = decodeURIComponent(
            originalRequest.url.replace(CORS_PROXIES[currentProxyIndex - 1], '')
          );
          originalRequest.url = applyProxyIfNeeded(urlWithoutProxy);
        }
        
        console.log('Retrying request with new proxy:', originalRequest.url);
        return api(originalRequest);
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
                toast.error("Session expired. Please log in again.");
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
              const newAccessToken = (response.data as any).accessToken;
              
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

// Function to diagnose CORS issues
export const diagnoseCorsIssues = async () => {
  console.log('Running CORS diagnosis...');
  
  try {
    // Try a simple OPTIONS request to the API
    const testUrl = `${API_BASE_URL}/api/auth/login`;
    console.log('Testing CORS with URL:', testUrl);
    
    // First try without proxy
    try {
      console.log('Attempting direct request without proxy...');
      const response = await fetch(testUrl, {
        method: 'OPTIONS',
        headers: {
          'Content-Type': 'application/json',
          'Origin': window.location.origin
        }
      });
      
      console.log('OPTIONS response status:', response.status);
      console.log('OPTIONS response headers:', {
        'access-control-allow-origin': response.headers.get('access-control-allow-origin'),
        'access-control-allow-methods': response.headers.get('access-control-allow-methods'),
        'access-control-allow-headers': response.headers.get('access-control-allow-headers')
      });
      
      if (response.ok) {
        console.log('CORS preflight successful without proxy!');
        return true;
      } else {
        console.log('CORS preflight failed without proxy.');
      }
    } catch (error) {
      console.error('Direct request failed:', error);
    }
    
    // Try with each proxy
    for (let i = 0; i < CORS_PROXIES.length; i++) {
      const proxy = CORS_PROXIES[i];
      const proxiedUrl = `${proxy}${encodeURIComponent(testUrl)}`;
      
      try {
        console.log(`Attempting request with proxy ${i + 1}/${CORS_PROXIES.length}: ${proxy}`);
        const response = await fetch(proxiedUrl, {
          method: 'OPTIONS',
          headers: {
            'Content-Type': 'application/json',
            'Origin': window.location.origin
          }
        });
        
        console.log(`Proxy ${i + 1} response status:`, response.status);
        
        if (response.ok) {
          console.log(`CORS preflight successful with proxy ${i + 1}!`);
          currentProxyIndex = i;
          return true;
        } else {
          console.log(`CORS preflight failed with proxy ${i + 1}.`);
        }
      } catch (error) {
        console.error(`Request with proxy ${i + 1} failed:`, error);
      }
    }
    
    console.log('All CORS tests failed. Please check server configuration.');
    return false;
  } catch (error) {
    console.error('CORS diagnosis error:', error);
    return false;
  }
};

// Run CORS diagnosis on startup in development
if (import.meta.env.DEV) {
  diagnoseCorsIssues().then(success => {
    console.log('CORS diagnosis complete. Success:', success);
  });
}

// Direct fetch function to bypass axios for critical operations like login
export const directFetch = async (endpoint: string, options: RequestInit = {}) => {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  // Set default headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  // Add authorization header if token exists
  if (accessToken) {
    (headers as any)['Authorization'] = `Bearer ${accessToken}`;
  }
  
  // Merge options
  const fetchOptions: RequestInit = {
    ...options,
    headers,
    credentials: 'include',
    mode: 'cors'
  };
  
  console.log(`Direct fetch to ${url}`, {
    method: fetchOptions.method,
    headers: fetchOptions.headers,
    hasBody: !!fetchOptions.body
  });
  
  try {
    const response = await fetch(url, fetchOptions);
    
    // Log response headers for debugging
    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });
    
    console.log(`Direct fetch response: ${response.status} ${response.statusText}`, {
      headers: responseHeaders
    });
    
    // Try to parse JSON response
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('Error parsing JSON response:', parseError);
        data = { error: 'Invalid JSON response' };
      }
    } else {
      try {
        data = await response.text();
      } catch (textError) {
        console.error('Error reading response text:', textError);
        data = { error: 'Could not read response' };
      }
    }
    
    if (!response.ok) {
      const error = {
        status: response.status,
        statusText: response.statusText,
        data,
        url,
        method: fetchOptions.method
      };
      
      console.error('Direct fetch error response:', error);
      
      throw error;
    }
    
    return { data, status: response.status };
  } catch (error) {
    console.error('Direct fetch error:', error);
    throw error;
  }
};

// Special login function that tries multiple methods
export const loginUser = async (email: string, password: string) => {
  console.log('Attempting login with multiple methods...');
  
  const loginData = { email, password };
  const loginUrl = `${API_BASE_URL}/api/auth/login`;
  
  // Try different approaches in sequence
  const attempts = [
    // 1. Direct axios without proxy
    async () => {
      console.log('Attempt 1: Direct axios without proxy');
      return await axios.post(loginUrl, loginData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
    },
    
    // 2. Direct fetch without proxy
    async () => {
      console.log('Attempt 2: Direct fetch without proxy');
      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginData),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return { data };
    },
    
    // 3. Axios with proxy
    async () => {
      console.log('Attempt 3: Axios with proxy');
      // Enable proxy temporarily
      const proxyUrl = getCurrentProxyUrl();
      const proxiedUrl = `${proxyUrl}${encodeURIComponent(loginUrl)}`;
      
      return await axios.post(proxiedUrl, loginData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
    },
    
    // 4. Fetch with proxy
    async () => {
      console.log('Attempt 4: Fetch with proxy');
      const proxyUrl = getCurrentProxyUrl();
      const proxiedUrl = `${proxyUrl}${encodeURIComponent(loginUrl)}`;
      
      const response = await fetch(proxiedUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return { data };
    }
  ];
  
  // Try each method in sequence
  let lastError = null;
  
  for (let i = 0; i < attempts.length; i++) {
    try {
      const response = await attempts[i]();
      console.log(`Login successful with attempt ${i + 1}:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Attempt ${i + 1} failed:`, error);
      lastError = error;
    }
  }
  
  // If we get here, all attempts failed
  console.error('All login attempts failed');
  throw lastError;
};

export default api;
