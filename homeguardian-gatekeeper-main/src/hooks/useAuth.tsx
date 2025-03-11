import React, { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import api, { setAccessToken, clearAccessToken } from '@/lib/axios';

interface User {
  id: string;
  email: string;
  subscription_status: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('Initializing auth state...');
        
        // Check for token in localStorage
        const storedToken = localStorage.getItem('accessToken');
        
        if (storedToken) {
          console.log('Found stored token on initialization:', storedToken.substring(0, 10) + '...');
          
          // Set token in axios headers
          setAccessToken(storedToken);
          
          // Verify the token was set in axios
          const currentToken = api.defaults.headers.common['Authorization'];
          console.log('Verification - Authorization header:', currentToken ? 'Present' : 'Missing');
          
          // Fetch user data
          try {
            console.log('Fetching user data with token...');
            const response = await api.get('/api/auth/me');
            
            if (response.data && response.data.user) {
              console.log('User data fetched successfully:', response.data.user);
              setUser(response.data.user);
            } else {
              console.warn('User data response missing user object');
              // Don't clear token yet, might be a temporary issue
              console.log('Response data:', response.data);
              setUser(null);
            }
          } catch (error) {
            console.error('Error fetching user data:', error);
            
            // More detailed error logging
            if (error.response) {
              console.error('Server response error:', {
                status: error.response.status,
                data: error.response.data
              });
              
              // Only clear token if it's an authentication error (401)
              if (error.response.status === 401) {
                console.log('Authentication error (401), clearing token');
                localStorage.removeItem('accessToken');
                clearAccessToken();
                setUser(null);
              } else {
                // For other errors (like network issues), keep the token and set a retry
                console.log('Non-auth error occurred, will retry authentication later');
                // We'll keep the user logged in but in a loading state
                setTimeout(() => {
                  console.log('Retrying authentication...');
                  initializeAuth();
                }, 5000); // Retry after 5 seconds
              }
            } else {
              console.error('Network or other error:', error);
              // Don't clear token for network errors
              setTimeout(() => {
                console.log('Retrying after network error...');
                initializeAuth();
              }, 5000);
            }
          }
        } else {
          console.log('No stored token found on initialization');
          setUser(null);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeAuth();
  }, []);
  
  // Login function
  const login = useCallback((token: string, userData: User) => {
    console.log('Login called with token:', token.substring(0, 10) + '...');
    
    if (!token) {
      console.error('Attempted to login with empty token');
      return;
    }
    
    try {
      // Save token to localStorage
      localStorage.setItem('accessToken', token);
      
      // Set token in axios headers
      setAccessToken(token);
      
      // Set user data
      setUser(userData);
      
      console.log('Login completed, user set:', userData);
    } catch (error) {
      console.error('Error during login process:', error);
      // Try to recover
      if (token && userData) {
        console.log('Attempting recovery...');
        setUser(userData);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
    }
  }, []);
  
  // Logout function
  const logout = useCallback(() => {
    console.log('Logout called');
    
    // Clear token from localStorage
    localStorage.removeItem('accessToken');
    
    // Clear token from axios headers
    clearAccessToken();
    
    // Clear user data
    setUser(null);
    
    console.log('Logout completed');
  }, []);
  
  const contextValue: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout
  };
  
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}; 