import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/axios';
import { resetPasswordSchema } from '@/lib/validation';
import AuthCard from '@/components/auth/AuthCard';
import FormInput from '@/components/ui/FormInput';
import PasswordStrength from '@/components/auth/PasswordStrength';

// Type definition inferred from the schema
type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

const ResetPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Extract token from URL
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const resetToken = queryParams.get('token');
    
    if (!resetToken) {
      toast({
        title: 'Invalid reset link',
        description: 'The password reset link is invalid or has expired.',
        variant: 'destructive',
      });
      navigate('/login');
    } else {
      setToken(resetToken);
    }
  }, [location, navigate, toast]);
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid }
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onChange'
  });
  
  const password = watch('password', '');
  
  const onSubmit = async (data: ResetPasswordFormValues) => {
    if (!token) return;
    
    setIsLoading(true);
    
    try {
      // Send reset password request to API
      await api.post('/auth/reset-password', {
        token,
        password: data.password
      });
      
      // Show success message
      setIsSubmitted(true);
      
      toast({
        title: 'Password reset successful',
        description: 'Your password has been reset successfully. You can now log in with your new password.',
      });
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error: any) {
      // Handle error
      console.error('Reset password error:', error);
      
      toast({
        title: 'Password reset failed',
        description: error.response?.data?.message || 'The reset link is invalid or has expired. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!token) {
    return null; // Wait for token check
  }
  
  return (
    <AuthCard
      title="Reset Your Password"
      subtitle={isSubmitted ? "Password updated successfully" : "Create a new password for your account"}
    >
      {isSubmitted ? (
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mx-auto">
            <Check className="w-8 h-8" />
          </div>
          
          <p className="text-muted-foreground">
            Your password has been reset successfully. You'll be redirected to the login page in a moment.
          </p>
          
          <div className="pt-4">
            <Link to="/login" className="btn-primary w-full">
              Continue to Login
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <FormInput
              label="New Password"
              type="password"
              icon={<Lock size={18} />}
              placeholder="Create a strong password"
              autoComplete="new-password"
              error={errors.password?.message}
              disabled={isLoading}
              autoFocus
              {...register('password')}
            />
            <PasswordStrength password={password} />
          </div>
          
          <FormInput
            label="Confirm Password"
            type="password"
            icon={<Lock size={18} />}
            placeholder="Confirm your new password"
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
            {isLoading ? 'Resetting Password...' : 'Reset Password'}
          </button>
        </form>
      )}
    </AuthCard>
  );
};

export default ResetPassword;
