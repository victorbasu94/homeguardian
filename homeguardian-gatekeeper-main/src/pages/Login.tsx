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
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [diagnosticInfo, setDiagnosticInfo] = useState<any>(null);
  
  // Get redirect path from location state or default to dashboard
  const from = location.state?.from?.pathname || '/dashboard';
  
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
            
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-neutral/70">Or continue with</span>
                </div>
              </div>
              
              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className="w-full inline-flex justify-center py-2.5 px-4 border border-gray-200 rounded-lg shadow-sm bg-white text-sm font-medium text-neutral hover:bg-gray-50"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                </button>
                
                <button
                  type="button"
                  className="w-full inline-flex justify-center py-2.5 px-4 border border-gray-200 rounded-lg shadow-sm bg-white text-sm font-medium text-neutral hover:bg-gray-50"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 0C4.477 0 0 4.477 0 10c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V19c0 .27.16.59.67.5C17.14 18.16 20 14.42 20 10A10 10 0 0010 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
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
