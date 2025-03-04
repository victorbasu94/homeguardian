import React from 'react';
import { cn } from '@/lib/utils';

export interface ProgressBarProps {
  value: number;
  max?: number;
  showValue?: boolean;
  valueFormat?: (value: number, max: number) => string;
  size?: 'sm' | 'md' | 'lg';
  color?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
  barClassName?: string;
  labelClassName?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  showValue = false,
  valueFormat,
  size = 'md',
  color = 'default',
  className,
  barClassName,
  labelClassName,
}) => {
  const percentage = Math.min(Math.max(0, (value / max) * 100), 100);
  
  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };
  
  const colorClasses = {
    default: 'bg-primary',
    success: 'bg-green-500',
    warning: 'bg-amber-500',
    danger: 'bg-red-500',
    info: 'bg-blue-500',
  };
  
  const formattedValue = valueFormat 
    ? valueFormat(value, max) 
    : `${Math.round(percentage)}%`;
  
  return (
    <div className={cn('w-full', className)}>
      {showValue && (
        <div className={cn('flex justify-between text-sm mb-1', labelClassName)}>
          <span className="font-medium">{formattedValue}</span>
        </div>
      )}
      <div className={cn('w-full bg-gray-100 rounded-full overflow-hidden', sizeClasses[size])}>
        <div
          className={cn('h-full rounded-full transition-all duration-500', colorClasses[color], barClassName)}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
    </div>
  );
};

export default ProgressBar; 