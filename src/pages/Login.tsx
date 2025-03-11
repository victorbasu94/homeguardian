import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Shield, ArrowRight, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import api, { diagnoseCorsIssues, switchToNextProxy } from '@/lib/axios';

// Get the API base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

// Define validation schema
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface User {
  id: string;
  email: string;
  subscription_status: string;
}

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [diagnosticInfo, setDiagnosticInfo] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  // Get redirect path from location state or default to dashboard
  const from = location.state?.from?.pathname || '/dashboard';
  
  // Run diagnostics on component mount
  useEffect(() => {
    const runDiagnostics = async () => {
      try {
        console.log('Running login diagnostics...');
        
        // Check if we can access localStorage
        let localStorageAccessible = false;
        try {
          localStorage.setItem('test', 'test');
          if (localStorage.getItem('test') === 'test') {
            localStorageAccessible = true;
          }
          localStorage.removeItem('test');
        } catch (e) {
          console.error('localStorage not accessible:', e);
        }
        
        // Check for existing token
        let existingToken = null;
        if (localStorageAccessible) {
          existingToken = localStorage.getItem('accessToken');
        }
        
        // Check CORS configuration
        const corsResult = await diagnoseCorsIssues();
        
        // Check network connectivity to API
        let apiReachable = false;
        try {
          const pingResponse = await fetch(`${API_BASE_URL}/api/health`, { 
            method: 'GET',
            mode: 'cors',
            cache: 'no-cache'
          });
          apiReachable = pingResponse.ok;
        } catch (e) {
          console.error('API not reachable:', e);
        }
        
        // Store diagnostic information
        const diagnostics = {
          timestamp: new Date().toISOString(),
          browser: navigator.userAgent,
          localStorageAccessible,
          existingToken: existingToken ? 'Present' : 'Missing',
          corsStatus: corsResult.success ? 'OK' : 'Issues detected',
          apiReachable,
          origin: window.location.origin,
          apiBaseUrl: API_BASE_URL
        };
        
        console.log('Diagnostic information:', diagnostics);
        setDiagnosticInfo(diagnostics);
        
        // If we detect issues, try to fix them
        if (existingToken && !apiReachable) {
          console.log('Detected token but API not reachable - clearing token to force re-login');
          localStorage.removeItem('accessToken');
        }
      } catch (error) {
        console.error('Error running diagnostics:', error);
      }
    };
    
    runDiagnostics();
  }, []);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });
  
  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    
    try {
      console.log('Attempting login with email:', data.email);
      
      // Call the API to authenticate
      const response = await api.post('/api/auth/login', {
        email: data.email,
        password: data.password
      });
      
      console.log('Login response received:', response.status);
      
      // Extract token and user data
      const { accessToken, user } = response.data;
      
      if (!accessToken) {
        throw new Error('No access token received from server');
      }
      
      console.log('Access token received:', accessToken.substring(0, 10) + '...');
      console.log('User data received:', user);
      
      // Manually set the token in localStorage first
      try {
        localStorage.setItem('accessToken', accessToken);
        console.log('Token saved to localStorage');
      } catch (storageError) {
        console.error('Error saving token to localStorage:', storageError);
      }
      
      // Call the login function from useAuth
      login(accessToken, user);
      
      // Verify the token was set correctly
      const storedToken = localStorage.getItem('accessToken');
      console.log('Verification - token in localStorage:', storedToken ? 'Present' : 'Missing');
      
      // Show success toast
      toast({
        title: 'Login successful',
        description: 'Welcome back to MaintainMint!',
      });
      
      // Redirect to the page they were trying to access or dashboard
      navigate(from, { replace: true });
    } catch (error: any) {
      console.error('Login error:', error);
      
      // More detailed error logging
      if (error.response) {
        console.error('Server response error:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
        
        // Special handling for CORS errors
        if (error.message && error.message.includes('Network Error')) {
          // Try switching to another CORS proxy
          const switched = switchToNextProxy();
          
          if (switched) {
            toast({
              title: 'Connection issue detected',
              description: 'Trying an alternative connection method. Please try again.',
              variant: 'destructive',
            });
          } else {
            toast({
              title: 'Connection Error',
              description: 'Unable to connect to the server. This might be due to CORS restrictions. Please try again later.',
              variant: 'destructive',
            });
          }
        } else {
          toast({
            title: 'Login failed',
            description: error.response?.data?.message || 'Please check your credentials and try again.',
            variant: 'destructive',
          });
        }
      } else if (error.request) {
        console.error('No response received:', error.request);
        
        // Try switching to another CORS proxy
        const switched = switchToNextProxy();
        
        if (switched) {
          toast({
            title: 'Server connection issue',
            description: 'Trying an alternative connection method. Please try again.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Server not responding',
            description: 'The server is not responding. Please try again later.',
            variant: 'destructive',
          });
        }
      } else {
        console.error('Error setting up request:', error.message);
        toast({
          title: 'Login failed',
          description: 'An unexpected error occurred. Please try again.',
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-softWhite">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-primary/10 p-3 rounded-full">
                <Shield className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
            <p className="text-neutral/70">
              Sign in to your MaintainMint account
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-2xl shadow-card">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  {...register('email')}
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    {...register('password')}
                    className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral/50 hover:text-neutral"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                )}
              </div>
              
              <div className="flex items-center">
                <div className="flex items-center space-x-2">
                  <Checkbox id="rememberMe" {...register('rememberMe')} />
                  <Label htmlFor="rememberMe" className="text-sm font-normal">
                    Remember me
                  </Label>
                </div>
              </div>
              
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>
          </div>
          
          <div className="text-center mt-6">
            <p className="text-neutral/70">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary font-medium hover:underline">
                Sign up
              </Link>
            </p>
          </div>
          
          <div className="flex items-center justify-center space-x-2 text-sm text-neutral/70">
            <CheckCircle className="h-4 w-4 text-primary" />
            <span>Secure login with 256-bit encryption</span>
          </div>
          
          {/* Add diagnostic information for development */}
          {import.meta.env.DEV && diagnosticInfo && (
            <div className="mt-4 p-4 bg-gray-100 rounded-lg text-xs">
              <details>
                <summary className="cursor-pointer font-medium">Diagnostic Information</summary>
                <pre className="mt-2 overflow-auto max-h-40">
                  {JSON.stringify(diagnosticInfo, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Login; 