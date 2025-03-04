
import Cookies from 'js-cookie';
import { setAccessToken, clearAccessToken } from './axios';

// Function to handle login success
export const handleLoginSuccess = (accessToken: string, refreshToken: string) => {
  // Store the refresh token in an HttpOnly cookie (to be done by the backend)
  // But we can also store it as a fallback (less secure but works for demo)
  Cookies.set('refreshToken', refreshToken, { 
    expires: 7, // 7 days
    secure: window.location.protocol === 'https:', // secure in production
    sameSite: 'strict' 
  });
  
  // Store the access token in memory
  setAccessToken(accessToken);
};

// Function to handle logout
export const handleLogout = () => {
  // Clear the refresh token cookie
  Cookies.remove('refreshToken');
  
  // Clear the access token from memory
  clearAccessToken();
};

// Function to check if the user is authenticated
export const isAuthenticated = () => {
  // Check if we have an access token in memory
  const accessToken = getAccessToken();
  
  // If we have an access token, the user is authenticated
  return !!accessToken;
};

// Helper function to get access token from memory (implemented in axios.ts)
function getAccessToken() {
  // This is an external function that will be imported from axios.ts
  return (window as any).getAccessToken?.() || null;
}
