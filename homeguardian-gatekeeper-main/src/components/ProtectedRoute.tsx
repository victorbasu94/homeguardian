import { useEffect, useState, ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getAccessToken } from '@/lib/axios';
import api from '@/lib/axios';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Use the auth context to determine if user is authenticated
        if (user && isAuthenticated) {
          setIsLoading(false);
          return;
        }
        
        // If not authenticated through context, check for token
        const accessToken = getAccessToken();
        
        if (!accessToken) {
          // No token available, finish loading
          setIsLoading(false);
          return;
        }
        
        // We have a token but no user in context, try to validate it
        try {
          await api.get('/api/auth/me');
          // If successful, token is valid
        } catch (error) {
          console.error('Token validation failed:', error);
          // Token is invalid, but we'll let the auth context handle redirection
        } finally {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [isAuthenticated, user]);
  
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
