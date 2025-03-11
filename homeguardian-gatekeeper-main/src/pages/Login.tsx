import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Shield, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import api from '@/lib/axios';

// Define validation schema
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  rememberMe: z.boolean().optional()
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginResponse {
  status: string;
  accessToken: string;
  user: {
    id: string;
    email: string;
    subscription_status: string;
  };
}

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false
    }
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setIsLoading(true);
      
      console.log('Attempting to log in user with:', { email: data.email });
      
      // Call the API to authenticate
      const response = await api.post<LoginResponse>('/api/auth/login', {
        email: data.email,
        password: data.password
      });
      
      console.log('Login response:', response.data);
      
      // Extract token and user data
      const { accessToken, user } = response.data;
      
      if (!accessToken || !user) {
        throw new Error('Invalid response from server');
      }
      
      // Save remember me preference
      if (data.rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      } else {
        localStorage.removeItem('rememberMe');
      }
      
      // Call the login function from useAuth
      login(accessToken, user);
      
      toast({
        title: 'Success',
        description: 'You have been logged in successfully.'
      });
      
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Get detailed error information
      const statusCode = error.response?.status;
      const errorMessage = error.response?.data?.message || 'Failed to log in. Please check your credentials and try again.';
      
      toast({
        title: `Login failed ${statusCode ? `(${statusCode})` : ''}`,
        description: errorMessage,
        variant: 'destructive'
      });
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
              Sign in to your account to continue
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-2xl shadow-card">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  {...form.register('email')}
                  className={form.formState.errors.email ? 'border-red-500' : ''}
                />
                {form.formState.errors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <a
                    href="/forgot-password"
                    className="text-sm font-medium text-primary hover:text-primary-dark"
                  >
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    {...form.register('password')}
                    className={form.formState.errors.password ? 'border-red-500 pr-10' : 'pr-10'}
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
                {form.formState.errors.password && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div className="flex items-center">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="rememberMe"
                    {...form.register('rememberMe')}
                  />
                  <Label
                    htmlFor="rememberMe"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Remember me
                  </Label>
                </div>
              </div>

              <Button 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>
          </div>

          <p className="text-center text-sm text-neutral/70">
            Don't have an account?{' '}
            <a
              href="/register"
              className="font-medium text-primary hover:text-primary-dark"
            >
              Sign up
            </a>
          </p>
        </div>
      </div>
      
      <Footer />
    </div>
  );
} 