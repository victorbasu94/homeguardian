
import { z } from 'zod';
import zxcvbn from 'zxcvbn';

// Email validation schema
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address');

// Password validation schema
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .refine((password) => {
    // Use zxcvbn to check password strength
    const result = zxcvbn(password);
    // Require at least a score of 2 (0-4 scale)
    return result.score >= 2;
  }, 'Password is too weak. Include upper & lowercase letters, numbers, and symbols.');

// Login form validation schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

// Registration form validation schema
export const registerSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// Forgot password form validation schema
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

// Reset password form validation schema
export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// Get password strength score and feedback
export const getPasswordStrength = (password: string) => {
  if (!password) return { score: 0, feedback: '' };
  
  const result = zxcvbn(password);
  let feedback = '';
  
  switch (result.score) {
    case 0:
      feedback = 'Very weak';
      break;
    case 1:
      feedback = 'Weak';
      break;
    case 2:
      feedback = 'Fair';
      break;
    case 3:
      feedback = 'Good';
      break;
    case 4:
      feedback = 'Strong';
      break;
    default:
      feedback = '';
  }
  
  return { score: result.score, feedback };
};
