
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/axios';
import { forgotPasswordSchema } from '@/lib/validation';
import AuthCard from '@/components/auth/AuthCard';
import FormInput from '@/components/ui/FormInput';

// Type definition inferred from the schema
type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

const ForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isValid }
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onChange'
  });
  
  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setIsLoading(true);
    
    try {
      // Send forgot password request to API
      await api.post('/api/auth/forgot-password', {
        email: data.email
      });
      
      // Show success message
      setIsSubmitted(true);
      
      toast({
        title: 'Reset link sent',
        description: 'If an account exists with this email, you will receive a password reset link shortly.',
      });
    } catch (error: any) {
      // Handle error
      console.error('Forgot password error:', error);
      
      // Still show success message for security reasons
      setIsSubmitted(true);
      
      toast({
        title: 'Reset link sent',
        description: 'If an account exists with this email, you will receive a password reset link shortly.',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <AuthCard
      title="Reset Password"
      subtitle={isSubmitted ? "Check your inbox" : "Enter your email to receive a reset link"}
    >
      {isSubmitted ? (
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mx-auto">
            <Mail className="w-8 h-8" />
          </div>
          
          <p className="text-muted-foreground">
            We've sent a password reset link to your email address. Please check your inbox and follow the link to reset your password.
          </p>
          
          <div className="pt-4">
            <Link to="/login" className="btn-outline flex items-center mx-auto w-max">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Login
            </Link>
          </div>
        </div>
      ) : (
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
          
          <button
            type="submit"
            className="btn-primary w-full mt-6"
            disabled={isLoading || !isValid}
          >
            {isLoading ? 'Sending Link...' : 'Send Reset Link'}
          </button>
          
          <div className="text-center">
            <Link to="/login" className="text-sm text-primary hover:underline inline-flex items-center">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back to Login
            </Link>
          </div>
        </form>
      )}
    </AuthCard>
  );
};

export default ForgotPassword;
