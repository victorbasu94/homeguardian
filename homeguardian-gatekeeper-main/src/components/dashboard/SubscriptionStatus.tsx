import React from 'react';
import { AlertCircle, CheckCircle, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface SubscriptionStatusProps {
  status?: 'active' | 'trial' | 'expired' | 'none';
  expiryDate?: string;
  onUpgrade?: () => void;
  onRenew?: () => void;
}

const SubscriptionStatus: React.FC<SubscriptionStatusProps> = ({
  status = 'trial',
  expiryDate = '2024-06-15',
  onUpgrade,
  onRenew,
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'active':
        return {
          icon: <CheckCircle className="h-5 w-5 text-green-500" />,
          title: 'Active Subscription',
          description: 'Your subscription is active and will renew automatically.',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-800',
          action: null,
        };
      case 'trial':
        return {
          icon: <Calendar className="h-5 w-5 text-amber-500" />,
          title: 'Trial Subscription',
          description: `Your trial expires on ${expiryDate}. Upgrade now to continue using all features.`,
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
          textColor: 'text-amber-800',
          action: {
            label: 'Upgrade Now',
            onClick: onUpgrade,
          },
        };
      case 'expired':
        return {
          icon: <AlertCircle className="h-5 w-5 text-red-500" />,
          title: 'Subscription Expired',
          description: 'Your subscription has expired. Renew now to continue using all features.',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800',
          action: {
            label: 'Renew Subscription',
            onClick: onRenew,
          },
        };
      case 'none':
      default:
        return {
          icon: <AlertCircle className="h-5 w-5 text-blue-500" />,
          title: 'No Subscription',
          description: 'Subscribe now to unlock all features and get the most out of MaintainMint.',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-800',
          action: {
            label: 'Subscribe Now',
            onClick: onUpgrade,
          },
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`rounded-lg border p-4 mb-6 ${config.bgColor} ${config.borderColor}`}>
      <div className="flex items-start gap-4">
        <div className="mt-0.5">{config.icon}</div>
        <div className="flex-1">
          <h3 className={`font-semibold ${config.textColor}`}>{config.title}</h3>
          <p className={`text-sm mt-1 ${config.textColor} opacity-90`}>{config.description}</p>
        </div>
        {config.action && (
          <Button 
            size="sm" 
            onClick={config.action.onClick}
            className="whitespace-nowrap"
          >
            {config.action.label}
          </Button>
        )}
      </div>
    </div>
  );
};

export default SubscriptionStatus;
