import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: SelectOption[];
  error?: string;
  icon?: React.ReactNode;
  placeholder?: string;
}

const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ label, options, error, icon, placeholder, className = '', ...props }, ref) => {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium">
          {label}
        </label>
        
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              {icon}
            </div>
          )}
          
          <select
            ref={ref}
            className={`
              w-full rounded-md border border-input bg-background px-3 py-2 text-sm
              ${icon ? 'pl-10' : ''}
              ${error ? 'border-destructive' : ''}
              ${className}
            `}
            {...props}
          >
            <option value="" disabled>
              {placeholder || 'Select an option'}
            </option>
            
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-muted-foreground">
            <ChevronDown size={16} />
          </div>
        </div>
        
        {error && (
          <p className="text-destructive text-sm">{error}</p>
        )}
      </div>
    );
  }
);

FormSelect.displayName = 'FormSelect';

export default FormSelect; 