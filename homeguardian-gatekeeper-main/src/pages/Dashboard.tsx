
import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { Shield, Home, User, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/axios';
import HomeCard, { HomeData } from '@/components/dashboard/HomeCard';
import SubscriptionStatus, { SubscriptionStatus as SubscriptionStatusType } from '@/components/dashboard/SubscriptionStatus';
import HomesLoading from '@/components/dashboard/HomesLoading';
import HomesEmptyState from '@/components/dashboard/HomesEmptyState';

interface UserData {
  id: string;
  name: string;
  email: string;
  subscription_status: SubscriptionStatusType;
  created_at: string;
}

const Dashboard = () => {
  const [homes, setHomes] = useState<HomeData[]>([]);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loadingHomes, setLoadingHomes] = useState(true);
  const [loadingUser, setLoadingUser] = useState(true);
  const [homesError, setHomesError] = useState(false);
  const [userError, setUserError] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    // Fetch homes data
    const fetchHomes = async () => {
      setLoadingHomes(true);
      setHomesError(false);
      
      try {
        const response = await api.get('/api/homes');
        setHomes(response.data.homes);
      } catch (error) {
        console.error('Error fetching homes:', error);
        setHomesError(true);
        // Error handling via axios interceptors
      } finally {
        setLoadingHomes(false);
      }
    };
    
    // Fetch user data including subscription status
    const fetchUserData = async () => {
      setLoadingUser(true);
      setUserError(false);
      
      try {
        const response = await api.get('/api/auth/me');
        setUserData(response.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setUserError(true);
        // Error handling via axios interceptors
      } finally {
        setLoadingUser(false);
      }
    };
    
    fetchHomes();
    fetchUserData();
  }, []);
  
  // Handle subscription status change
  const handleSubscriptionChange = (newStatus: SubscriptionStatusType) => {
    if (userData) {
      setUserData({
        ...userData,
        subscription_status: newStatus
      });
    }
  };
  
  // Function to render homes content based on loading/error state
  const renderHomesContent = () => {
    if (loadingHomes) {
      return <HomesLoading />;
    }
    
    if (homesError) {
      return <HomesEmptyState error={true} />;
    }
    
    if (homes.length === 0) {
      return <HomesEmptyState />;
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {homes.map(home => (
          <HomeCard key={home.id} home={home} />
        ))}
      </div>
    );
  };
  
  // Function to render user subscription status
  const renderSubscriptionStatus = () => {
    if (loadingUser) {
      return (
        <div className="bg-white border border-border/50 rounded-lg shadow-sm overflow-hidden">
          <div className="border-b border-border/40 px-4 py-3">
            <div className="h-6 bg-muted/30 w-1/3 rounded-md animate-pulse" />
          </div>
          <div className="p-4 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-muted/30 animate-pulse" />
              <div className="space-y-2">
                <div className="h-5 bg-muted/30 w-40 rounded-md animate-pulse" />
                <div className="h-4 bg-muted/20 w-64 rounded-md animate-pulse" />
              </div>
            </div>
            <div className="h-10 bg-muted/30 rounded-md animate-pulse" />
          </div>
        </div>
      );
    }
    
    if (userError) {
      return (
        <div className="bg-white border border-border/50 rounded-lg shadow-sm p-4">
          <div className="flex items-center text-destructive mb-2">
            <AlertTriangle className="h-5 w-5 mr-2" />
            <h3 className="font-semibold">Failed to load subscription data</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            We couldn't retrieve your subscription information. Please try again later.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="text-sm text-primary font-medium hover:underline"
          >
            Refresh
          </button>
        </div>
      );
    }
    
    if (userData) {
      return (
        <SubscriptionStatus 
          status={userData.subscription_status} 
          onStatusChange={handleSubscriptionChange} 
        />
      );
    }
    
    return null;
  };
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 animate-slide-in">
          <h1 className="text-3xl font-bold mb-2">
            Welcome, {loadingUser ? 'User' : userData?.name || 'User'}
          </h1>
          <p className="text-muted-foreground">
            Manage your homes and subscription from your dashboard
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Quick stats cards */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-border/50 transition-transform hover:translate-y-[-2px]">
            <div className="flex items-start justify-between mb-4">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
                <Home className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">Homes</span>
            </div>
            <h3 className="text-2xl font-semibold mb-1">
              {loadingHomes ? (
                <span className="inline-block w-12 h-8 bg-muted/30 rounded-md animate-pulse"></span>
              ) : (
                homes.length
              )}
            </h3>
            <p className="text-sm text-muted-foreground">
              {homes.length === 1 ? 'Property registered' : 'Properties registered'}
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 border border-border/50 transition-transform hover:translate-y-[-2px]">
            <div className="flex items-start justify-between mb-4">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
                <Shield className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">Protection</span>
            </div>
            <h3 className="text-2xl font-semibold mb-1">
              {loadingUser ? (
                <span className="inline-block w-20 h-8 bg-muted/30 rounded-md animate-pulse"></span>
              ) : (
                userData?.subscription_status === 'active' ? 'Premium' : 'Basic'
              )}
            </h3>
            <p className="text-sm text-muted-foreground">
              {userData?.subscription_status === 'active' 
                ? 'Full protection activated' 
                : 'Limited protection active'}
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 border border-border/50 transition-transform hover:translate-y-[-2px]">
            <div className="flex items-start justify-between mb-4">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
                <User className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">Account</span>
            </div>
            <h3 className="text-2xl font-semibold mb-1">
              {loadingUser ? (
                <span className="inline-block w-24 h-8 bg-muted/30 rounded-md animate-pulse"></span>
              ) : (
                'Active'
              )}
            </h3>
            <p className="text-sm text-muted-foreground">
              {loadingUser ? (
                <span className="inline-block w-32 h-5 bg-muted/20 rounded-md animate-pulse"></span>
              ) : (
                `Member since ${new Date(userData?.created_at || Date.now()).toLocaleDateString()}`
              )}
            </p>
          </div>
        </div>
        
        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Homes section */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-semibold">Your Homes</h2>
            </div>
            {renderHomesContent()}
          </div>
          
          {/* Sidebar content */}
          <div className="space-y-6">
            {/* Subscription status widget */}
            {renderSubscriptionStatus()}
            
            {/* We could add more widgets here like recent activity, etc. */}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
