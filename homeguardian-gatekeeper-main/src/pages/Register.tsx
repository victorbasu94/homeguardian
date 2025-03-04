import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/axios';
import { registerSchema } from '@/lib/validation';
import AuthCard from '@/components/auth/AuthCard';
import FormInput from '@/components/ui/FormInput';
import PasswordStrength from '@/components/auth/PasswordStrength';
import { useAuth } from '@/hooks/useAuth';

// Type definition inferred from the schema
type RegisterFormValues = z.infer<typeof registerSchema>;

const Register = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid }
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange'
  });
  
  const password = watch('password', '');
  
  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    console.log('Starting registration process...');
    
    try {
      // Send registration request to API
      console.log('Sending registration request with email:', data.email);
      const response = await api.post('/api/auth/register', {
        email: data.email,
        password: data.password
      });
      
      console.log('Registration response:', response.data);
      
      // Handle automatic login
      if (response.data.accessToken) {
        console.log('Access token received:', response.data.accessToken);
        
        // Store the token and user data
        login(response.data.accessToken, response.data.user);
        console.log('Login function called with token and user data');
        
        // Show success toast
        toast({
          title: 'Registration successful',
          description: 'Your account has been created. Redirecting to onboarding...',
        });
        
        // Redirect to onboarding page
        console.log('Redirecting to onboarding page...');
        navigate('/onboarding');
      } else {
        console.log('No access token in response, redirecting to login');
        // Fallback to login page if auto-login fails
        toast({
          title: 'Registration successful',
          description: 'Your account has been created successfully. Please log in.',
        });
        
        navigate('/login');
      }
    } catch (error: any) {
      // Handle registration error
      console.error('Registration error:', error);
      console.error('Error response:', error.response?.data);
      
      toast({
        title: 'Registration failed',
        description: error.response?.data?.message || 'An error occurred during registration. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <AuthCard
      title="Create Your Account"
      subtitle="Join HomeGuardian today"
      footer={
        <p>
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-medium hover:underline">
            Sign in
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
        
        <div>
          <FormInput
            label="Password"
            type="password"
            icon={<Lock size={18} />}
            placeholder="Create a strong password"
            autoComplete="new-password"
            error={errors.password?.message}
            disabled={isLoading}
            {...register('password')}
          />
          <PasswordStrength password={password} />
        </div>
        
        <FormInput
          label="Confirm Password"
          type="password"
          icon={<Lock size={18} />}
          placeholder="Confirm your password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          disabled={isLoading}
          {...register('confirmPassword')}
        />
        
        <button
          type="submit"
          className="btn-primary w-full mt-6"
          disabled={isLoading || !isValid}
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>
    </AuthCard>
  );
};

export default Register;
