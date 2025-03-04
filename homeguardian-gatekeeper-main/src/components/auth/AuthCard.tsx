
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface AuthCardProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  footer?: ReactNode;
  className?: string;
}

const AuthCard = ({ children, title, subtitle, footer, className }: AuthCardProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-auth-gradient">
      <div className={cn(
        "w-full max-w-md animate-scale-in card-glass p-8 border border-gray-100 shadow-xl",
        className
      )}>
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">{title}</h1>
          {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
        </div>
        
        {children}
        
        {footer && (
          <div className="mt-6 pt-4 border-t border-border text-center text-sm">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthCard;
