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
          console.log('Found stored token on initialization');
          
          // Set token in axios headers
          setAccessToken(storedToken);
          
          // Verify the token was set in axios
          const currentToken = api.defaults.headers.common['Authorization'];
          console.log('Verification - Authorization header:', currentToken ? 'Present' : 'Missing');
          
          // Fetch user data
          try {
            console.log('Fetching user data with token...');
            const response = await api.get('/api/auth/me');
            
            const userData = response.data as { user?: User };
            
            if (userData && userData.user) {
              console.log('User data fetched successfully');
              setUser(userData.user);
            } else {
              console.warn('User data response missing user object');
              // Don't clear token yet, might be a temporary issue
              setUser(null);
            }
          } catch (error: any) {
            console.error('Error fetching user data:', error);
            
            // Only clear token if it's an authentication error (401)
            if (error.response?.status === 401) {
              console.log('Authentication error (401), clearing token');
              localStorage.removeItem('accessToken');
              clearAccessToken();
              setUser(null);
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