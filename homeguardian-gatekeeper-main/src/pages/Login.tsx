import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/axios';
import { loginSchema } from '@/lib/validation';
import AuthCard from '@/components/auth/AuthCard';
import FormInput from '@/components/ui/FormInput';
import { useAuth } from '@/hooks/useAuth';

// Type definition inferred from the schema
type LoginFormValues = z.infer<typeof loginSchema>;

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  // Get the redirect path from location state or default to dashboard
  const from = (location.state as any)?.from?.pathname || '/dashboard';
  
  const {
    register,
    handleSubmit,
    formState: { errors, isValid }
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange'
  });
  
  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    console.log('Starting login process...');
    
    try {
      // Send login request to API
      console.log('Sending login request with email:', data.email);
      const response = await api.post('/api/auth/login', {
        email: data.email,
        password: data.password
      });
      
      console.log('Login response:', response.data);
      
      // Extract tokens and user data from response
      const { accessToken, user } = response.data;
      
      console.log('Access token received:', accessToken);
      
      // Handle successful login using useAuth hook
      login(accessToken, user);
      console.log('Login function called with token and user data');
      
      // Show success toast
      toast({
        title: 'Login successful',
        description: 'Welcome back to HomeGuardian!',
      });
      
      // Redirect to the original requested page or dashboard
      console.log('Redirecting to:', from);
      navigate(from);
    } catch (error: any) {
      // Handle login error
      console.error('Login error:', error);
      console.error('Error response:', error.response?.data);
      
      toast({
        title: 'Login failed',
        description: error.response?.data?.message || 'Invalid email or password. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <AuthCard
      title="Welcome Back"
      subtitle="Sign in to access your account"
      footer={
        <p>
          Don't have an account?{' '}
          <Link to="/register" className="text-primary font-medium hover:underline">
            Sign up
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormInput
          label="Email"
          type="email"
          icon={<Mail size={18} />}
          placeholder="your@email.com"
          autoComplete="email"
          error={errors.email?.message}
          disabled={isLoading}
          autoFocus
          {...register('email')}
        />
        
        <FormInput
          label="Password"
          type="password"
          icon={<Lock size={18} />}
          placeholder="Your password"
          autoComplete="current-password"
          error={errors.password?.message}
          disabled={isLoading}
          {...register('password')}
        />
        
        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-sm text-primary hover:underline">
            Forgot Password?
          </Link>
        </div>
        
        <button
          type="submit"
          className="btn-primary w-full mt-6"
          disabled={isLoading || !isValid}
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </AuthCard>
  );
};

export default Login;
