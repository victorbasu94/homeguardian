import React, { useState } from 'react';
import { Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import api from '@/lib/axios';

// Vendor interface
interface Vendor {
  name: string;
  address: string;
  distance: number;
  phone: string;
}

// Task interface (simplified version of what's in TaskDetail.tsx)
interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string;
  homeName: string;
  category: string;
  estimatedDuration: number;
  estimatedCost?: number;
  progress: number;
  location: string; // This is the user's home location (e.g., "Denver, CO")
}

interface VendorListProps {
  task: Task;
}

const VendorList: React.FC<VendorListProps> = ({ task }) => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch vendors from the API
   */
  const fetchVendors = async () => {
    setIsLoading(true);
    setError(null);
    setIsExpanded(true);
    
    try {
      // Construct the API URL with query parameters
      const params = new URLSearchParams({
        location: task.location || 'Denver, CO', // Default to Denver if no location
        task: task.title
      });
      
      const response = await api.get(`/api/vendors?${params.toString()}`);
      
      setVendors(response.data);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      setError('Failed to load vendors. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Format phone number for display
   */
  const formatPhoneNumber = (phone: string) => {
    if (phone === 'Phone not listed') {
      return phone;
    }
    return phone;
  };

  /**
   * Handle the button click to toggle vendor list
   */
  const handleToggleVendors = () => {
    if (!isExpanded) {
      fetchVendors();
    } else {
      setIsExpanded(false);
    }
  };

  return (
    <div className="w-full">
      {/* Connect to Vendors button */}
      <Button 
        variant="outline" 
        className="flex items-center gap-2 border-blue-300 text-blue-600 hover:bg-blue-50"
        onClick={handleToggleVendors}
      >
        <Phone className="h-4 w-4" />
        {isExpanded ? 'Hide Vendors' : 'Connect to Vendors'}
      </Button>

      {/* Vendor list section */}
      {isExpanded && (
        <div className="mt-6 bg-neutral/5 rounded-lg p-4">
          <h3 className="font-medium mb-4">Nearby Service Providers</h3>
          
          {isLoading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-neutral/70">Loading vendors...</p>
            </div>
          )}
          
          {error && !isLoading && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg">
              {error}
            </div>
          )}
          
          {!isLoading && !error && vendors.length === 0 && (
            <div className="text-center py-8 text-neutral/70">
              No vendors found near your location.
            </div>
          )}
          
          {!isLoading && !error && vendors.length > 0 && (
            <div className="space-y-3">
              {vendors.map((vendor, index) => (
                <div 
                  key={index} 
                  className="bg-white border border-neutral/10 rounded-lg p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div>
                      <h4 className="font-medium">{vendor.name}</h4>
                      <p className="text-sm text-neutral/70 mt-1">{vendor.address}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-neutral/70">{vendor.distance} miles</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                        onClick={() => vendor.phone !== 'Phone not listed' && window.open(`tel:${vendor.phone}`)}
                        disabled={vendor.phone === 'Phone not listed'}
                      >
                        <Phone className="h-3 w-3 mr-1" />
                        {formatPhoneNumber(vendor.phone)}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VendorList; 