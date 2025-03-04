
import React, { forwardRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { Eye, EyeOff } from 'lucide-react';

export interface FormInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
}

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ className, type, label, error, icon, id, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id || label.toLowerCase().replace(/\s+/g, '-');
    const isPasswordInput = type === 'password';
    
    return (
      <div className="w-full space-y-1.5">
        <label htmlFor={inputId} className="label">
          {label}
        </label>
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {icon}
            </div>
          )}
          
          <input
            id={inputId}
            type={isPasswordInput ? (showPassword ? 'text' : 'password') : type}
            className={cn(
              "input-field",
              icon && "pl-10",
              isPasswordInput && "pr-10",
              error && "border-destructive focus:ring-destructive/50",
              className
            )}
            ref={ref}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : undefined}
            {...props}
          />
          
          {isPasswordInput && (
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              tabIndex={-1} // Remove from tab sequence
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>
        
        {error && (
          <p id={`${inputId}-error`} className="form-error" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';

export default FormInput;
