
import { useState } from "react";
import { Shield, Check, X, AlertTriangle } from "lucide-react";
import api from "@/lib/axios";
import { toast } from "sonner";

export type SubscriptionStatus = "inactive" | "active" | "pending" | "canceled";

interface SubscriptionStatusProps {
  status: SubscriptionStatus;
  onStatusChange: (newStatus: SubscriptionStatus) => void;
}

const SubscriptionStatus = ({ status, onStatusChange }: SubscriptionStatusProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      const response = await api.post("/api/subscriptions/subscribe");
      if (response.data.success) {
        onStatusChange("active");
        toast.success("Successfully subscribed to HomeGuardian Premium!");
      }
    } catch (error) {
      console.error("Subscription error:", error);
      // Error already handled by axios interceptor
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    setIsLoading(true);
    try {
      const response = await api.post("/api/subscriptions/cancel");
      if (response.data.success) {
        onStatusChange("canceled");
        toast.success("Your subscription has been canceled");
      }
    } catch (error) {
      console.error("Cancellation error:", error);
      // Error already handled by axios interceptor
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white border border-border/50 rounded-lg shadow-sm overflow-hidden">
      <div className="border-b border-border/40 px-4 py-3 flex items-center justify-between">
        <h2 className="font-semibold flex items-center">
          <Shield className="h-5 w-5 mr-2 text-primary" />
          Subscription Status
        </h2>
      </div>

      <div className="p-4">
        <div className="flex items-center mb-4">
          <div 
            className={`
              h-10 w-10 rounded-full flex items-center justify-center mr-3
              ${status === 'active' ? 'bg-green-100 text-green-600' : 
                status === 'canceled' ? 'bg-yellow-100 text-yellow-600' : 
                'bg-gray-100 text-gray-600'}
            `}
          >
            {status === 'active' && <Check className="h-5 w-5" />}
            {status === 'canceled' && <AlertTriangle className="h-5 w-5" />}
            {(status === 'inactive' || status === 'pending') && <Shield className="h-5 w-5" />}
          </div>
          
          <div>
            <p className="font-medium">
              {status === 'active' && 'Premium Protection'}
              {status === 'inactive' && 'Basic Protection'}
              {status === 'pending' && 'Processing Subscription'}
              {status === 'canceled' && 'Subscription Canceled'}
            </p>
            <p className="text-sm text-muted-foreground">
              {status === 'active' && 'Your home is fully protected with our premium service.'}
              {status === 'inactive' && 'Upgrade to premium for full protection features.'}
              {status === 'pending' && 'Your subscription is being processed.'}
              {status === 'canceled' && 'Your subscription will end at the billing period.'}
            </p>
          </div>
        </div>
        
        {(status === 'inactive' || status === 'canceled') && (
          <button
            onClick={handleSubscribe}
            disabled={isLoading}
            className="w-full bg-primary text-white rounded-md py-2 font-medium hover:bg-primary/90 transition-colors disabled:opacity-70"
            aria-label="Subscribe now"
          >
            {isLoading ? 'Processing...' : 'Subscribe Now'}
          </button>
        )}
        
        {status === 'active' && (
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className="w-full border border-destructive/30 text-destructive rounded-md py-2 font-medium hover:bg-destructive/10 transition-colors disabled:opacity-70"
            aria-label="Cancel subscription"
          >
            {isLoading ? 'Processing...' : 'Cancel Subscription'}
          </button>
        )}
        
        {status === 'pending' && (
          <div className="text-center text-sm text-muted-foreground">
            Your subscription is being processed. Please check back soon.
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionStatus;
