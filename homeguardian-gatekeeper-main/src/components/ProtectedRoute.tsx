
import { useEffect, useState, ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getAccessToken } from '@/lib/axios';
import api from '@/lib/axios';
import Cookies from 'js-cookie';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();
  
  useEffect(() => {
    const checkAuth = async () => {
      const accessToken = getAccessToken();
      
      if (accessToken) {
        setIsAuthenticated(true);
        setIsLoading(false);
        return;
      }
      
      // No access token, try to refresh
      const refreshToken = Cookies.get('refreshToken');
      
      if (!refreshToken) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }
      
      try {
        // Attempt to refresh the token
        const response = await api.post('/api/auth/refresh', { refreshToken });
        
        if (response.data && response.data.accessToken) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Token refresh failed:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);
  
  if (isLoading) {
    // You could return a loading spinner here
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse-soft text-primary">Loading...</div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    // Redirect to login page if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // If authenticated, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;
