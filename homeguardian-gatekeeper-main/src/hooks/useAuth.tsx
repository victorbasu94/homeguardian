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
        // Check for token in localStorage
        const storedToken = localStorage.getItem('accessToken');
        
        if (storedToken) {
          console.log('Found stored token on initialization:', storedToken);
          
          // Set token in axios headers
          setAccessToken(storedToken);
          
          // Fetch user data
          try {
            const response = await api.get('/auth/me');
            if (response.data.user) {
              console.log('User data fetched successfully:', response.data.user);
              setUser(response.data.user);
            } else {
              console.warn('User data response missing user object');
              localStorage.removeItem('accessToken');
              clearAccessToken();
              setUser(null);
            }
          } catch (error) {
            console.error('Error fetching user data:', error);
            // Only clear token if it's an authentication error (401)
            if (error.response && error.response.status === 401) {
              localStorage.removeItem('accessToken');
              clearAccessToken();
              setUser(null);
            } else {
              // For other errors (like network issues), keep the token and set a retry
              console.log('Non-auth error occurred, will retry authentication later');
              // We'll keep the user logged in but in a loading state
              setTimeout(() => {
                initializeAuth();
              }, 5000); // Retry after 5 seconds
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
    console.log('Login called with token:', token);
    
    // Save token to localStorage
    localStorage.setItem('accessToken', token);
    
    // Set token in axios headers
    setAccessToken(token);
    
    // Set user data
    setUser(userData);
    
    console.log('Login completed, user set:', userData);
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