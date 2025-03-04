import React, { useState, useEffect } from 'react';
import { Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import axiosInstance from '@/lib/axios';

// Mock vendor data for local development
const mockVendors = [
  {
    name: "ABC Home Services",
    address: "123 Main St, Anytown, CA 94123",
    distance: 1.2,
    phone: "555-123-4567"
  },
  {
    name: "Quality Home Maintenance",
    address: "456 Oak Ave, Anytown, CA 94123",
    distance: 2.5,
    phone: "555-234-5678"
  },
  {
    name: "Professional Home Care",
    address: "789 Pine Rd, Anytown, CA 94123",
    distance: 3.1,
    phone: "555-345-6789"
  },
  {
    name: "Expert Home Solutions",
    address: "101 Maple Dr, Anytown, CA 94123",
    distance: 4.2,
    phone: "555-456-7890"
  },
  {
    name: "Premier Home Specialists",
    address: "202 Cedar Ln, Anytown, CA 94123",
    distance: 5.0,
    phone: "555-567-8901"
  }
];

interface Vendor {
  name: string;
  address: string;
  distance: number;
  phone: string;
}

const VendorList: React.FC = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<boolean>(false);

  const fetchVendors = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // In development mode, use mock data
      if (process.env.NODE_ENV === 'development') {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        setVendors(mockVendors);
      } else {
        // In production, fetch from API
        const response = await axiosInstance.get('/api/vendors');
        setVendors(response.data);
      }
    } catch (err) {
      console.error('Error fetching vendors:', err);
      setError('Failed to load vendors. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch vendors when the dialog is opened
    if (open) {
      fetchVendors();
    }
  }, [open]);

  return (
    <div className="mt-4">
      <Button 
        variant="outline" 
        className="w-full" 
        onClick={() => setOpen(true)}
      >
        Connect to Vendors
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Local Home Service Vendors</DialogTitle>
            <DialogDescription>
              Connect with trusted home service providers in your area.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-destructive">
                <p>{error}</p>
                <Button 
                  variant="outline" 
                  className="mt-4" 
                  onClick={fetchVendors}
                >
                  Try Again
                </Button>
              </div>
            ) : (
              <ScrollArea className="h-[50vh] pr-4">
                {vendors.map((vendor, index) => (
                  <div key={index} className="mb-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-lg">{vendor.name}</h3>
                            <p className="text-sm text-muted-foreground">{vendor.address}</p>
                            <p className="text-sm mt-1">{vendor.distance} miles away</p>
                          </div>
                          <Button size="sm" variant="secondary" className="flex-shrink-0">
                            Call
                          </Button>
                        </div>
                        <p className="text-sm mt-2">
                          <span className="font-medium">Phone:</span> {vendor.phone}
                        </p>
                      </CardContent>
                    </Card>
                    {index < vendors.length - 1 && <Separator className="my-2" />}
                  </div>
                ))}
              </ScrollArea>
            )}
          </div>
          
          <DialogFooter className="sm:justify-between">
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Close
              </Button>
            </DialogClose>
            <Button type="button" variant="default">
              View All Vendors
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VendorList; 