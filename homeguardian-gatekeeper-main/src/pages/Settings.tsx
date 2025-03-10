import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  User, 
  Bell, 
  CreditCard, 
  Shield, 
  LogOut, 
  Save, 
  Eye, 
  EyeOff, 
  Trash2, 
  AlertTriangle,
  Check
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import api from '@/lib/axios';

// Profile schema
const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
});

// Password schema
const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// Notification schema
const notificationSchema = z.object({
  emailNotifications: z.boolean().default(true),
  pushNotifications: z.boolean().default(true),
  maintenanceReminders: z.boolean().default(true),
  weeklyReports: z.boolean().default(true),
  promotionalEmails: z.boolean().default(false),
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;
type NotificationFormValues = z.infer<typeof notificationSchema>;

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();
  
  // Profile form
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: errorsProfile },
    reset: resetProfile,
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    },
  });
  
  // Password form
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: errorsPassword },
    reset: resetPassword,
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });
  
  // Notification form
  const {
    register: registerNotification,
    handleSubmit: handleSubmitNotification,
    formState: { errors: errorsNotification },
    reset: resetNotification,
    setValue: setValueNotification,
    watch: watchNotification,
  } = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      emailNotifications: user?.settings?.emailNotifications ?? true,
      pushNotifications: user?.settings?.pushNotifications ?? true,
      maintenanceReminders: user?.settings?.maintenanceReminders ?? true,
      weeklyReports: user?.settings?.weeklyReports ?? true,
      promotionalEmails: user?.settings?.promotionalEmails ?? false,
    },
  });
  
  // Watch notification values
  const notificationValues = watchNotification();
  
  // Handle profile update
  const onSubmitProfile = async (data: ProfileFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Call API to update profile
      const response = await api.put('/api/users/profile', data);
      
      // Update user in context
      updateUser(response.data);
      
      // Show success toast
      toast({
        title: 'Profile updated',
        description: 'Your profile information has been updated successfully.',
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      
      // Show error toast
      toast({
        title: 'Update failed',
        description: error.response?.data?.message || 'An error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle password update
  const onSubmitPassword = async (data: PasswordFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Call API to update password
      await api.put('/api/users/password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      
      // Reset form
      resetPassword();
      
      // Show success toast
      toast({
        title: 'Password updated',
        description: 'Your password has been updated successfully.',
      });
    } catch (error: any) {
      console.error('Error updating password:', error);
      
      // Show error toast
      toast({
        title: 'Update failed',
        description: error.response?.data?.message || 'An error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle notification update
  const onSubmitNotification = async (data: NotificationFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Call API to update notification settings
      const response = await api.put('/api/users/notifications', data);
      
      // Update user in context
      updateUser({
        ...user,
        settings: {
          ...user?.settings,
          ...data,
        },
      });
      
      // Show success toast
      toast({
        title: 'Notification settings updated',
        description: 'Your notification preferences have been updated successfully.',
      });
    } catch (error: any) {
      console.error('Error updating notification settings:', error);
      
      // Show error toast
      toast({
        title: 'Update failed',
        description: error.response?.data?.message || 'An error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle account deletion
  const handleDeleteAccount = async () => {
    setIsSubmitting(true);
    
    try {
      // Call API to delete account
      await api.delete('/api/users/account');
      
      // Logout user
      logout();
      
      // Show success toast
      toast({
        title: 'Account deleted',
        description: 'Your account has been deleted successfully.',
      });
      
      // Navigate to home page
      navigate('/');
    } catch (error: any) {
      console.error('Error deleting account:', error);
      
      // Show error toast
      toast({
        title: 'Deletion failed',
        description: error.response?.data?.message || 'An error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
      setIsDeleteDialogOpen(false);
    }
  };
  
  // Toggle password visibility
  const toggleCurrentPasswordVisibility = () => {
    setShowCurrentPassword(!showCurrentPassword);
  };
  
  const toggleNewPasswordVisibility = () => {
    setShowNewPassword(!showNewPassword);
  };
  
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };
  
  // Handle notification toggle
  const handleNotificationToggle = (key: keyof NotificationFormValues, value: boolean) => {
    setValueNotification(key, value);
  };
  
  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-softWhite">
      <Navbar />
      
      <div className="flex-grow container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Settings</h1>
            <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
          
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Profile</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Security</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <span className="hidden sm:inline">Notifications</span>
              </TabsTrigger>
              <TabsTrigger value="billing" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                <span className="hidden sm:inline">Billing</span>
              </TabsTrigger>
            </TabsList>
            
            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <div className="bg-white p-8 rounded-2xl shadow-card">
                <h2 className="text-xl font-semibold mb-6">Profile Information</h2>
                
                <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="Your name"
                      {...registerProfile('name')}
                      className={errorsProfile.name ? 'border-red-500' : ''}
                    />
                    {errorsProfile.name && (
                      <p className="text-red-500 text-sm">{errorsProfile.name.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Your email"
                      {...registerProfile('email')}
                      className={errorsProfile.email ? 'border-red-500' : ''}
                    />
                    {errorsProfile.email && (
                      <p className="text-red-500 text-sm">{errorsProfile.email.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number (Optional)</Label>
                    <Input
                      id="phone"
                      placeholder="Your phone number"
                      {...registerProfile('phone')}
                    />
                  </div>
                  
                  <Button type="submit" disabled={isSubmitting} className="flex items-center gap-2">
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                    {!isSubmitting && <Save className="h-4 w-4" />}
                  </Button>
                </form>
              </div>
              
              <div className="bg-white p-8 rounded-2xl shadow-card">
                <h2 className="text-xl font-semibold mb-6 text-red-600">Danger Zone</h2>
                
                <p className="text-neutral/70 mb-6">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                
                <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="flex items-center gap-2">
                      <Trash2 className="h-4 w-4" />
                      Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your account
                        and remove all your data from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        {isSubmitting ? 'Deleting...' : 'Delete Account'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </TabsContent>
            
            {/* Security Tab */}
            <TabsContent value="security" className="space-y-6">
              <div className="bg-white p-8 rounded-2xl shadow-card">
                <h2 className="text-xl font-semibold mb-6">Change Password</h2>
                
                <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showCurrentPassword ? 'text' : 'password'}
                        placeholder="Enter current password"
                        {...registerPassword('currentPassword')}
                        className={errorsPassword.currentPassword ? 'border-red-500 pr-10' : 'pr-10'}
                      />
                      <button
                        type="button"
                        onClick={toggleCurrentPasswordVisibility}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral/50 hover:text-neutral"
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    {errorsPassword.currentPassword && (
                      <p className="text-red-500 text-sm">{errorsPassword.currentPassword.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? 'text' : 'password'}
                        placeholder="Enter new password"
                        {...registerPassword('newPassword')}
                        className={errorsPassword.newPassword ? 'border-red-500 pr-10' : 'pr-10'}
                      />
                      <button
                        type="button"
                        onClick={toggleNewPasswordVisibility}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral/50 hover:text-neutral"
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    {errorsPassword.newPassword && (
                      <p className="text-red-500 text-sm">{errorsPassword.newPassword.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm new password"
                        {...registerPassword('confirmPassword')}
                        className={errorsPassword.confirmPassword ? 'border-red-500 pr-10' : 'pr-10'}
                      />
                      <button
                        type="button"
                        onClick={toggleConfirmPasswordVisibility}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral/50 hover:text-neutral"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    {errorsPassword.confirmPassword && (
                      <p className="text-red-500 text-sm">{errorsPassword.confirmPassword.message}</p>
                    )}
                  </div>
                  
                  <Button type="submit" disabled={isSubmitting} className="flex items-center gap-2">
                    {isSubmitting ? 'Updating...' : 'Update Password'}
                    {!isSubmitting && <Save className="h-4 w-4" />}
                  </Button>
                </form>
              </div>
              
              <div className="bg-white p-8 rounded-2xl shadow-card">
                <h2 className="text-xl font-semibold mb-6">Two-Factor Authentication</h2>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Enhance your account security</p>
                    <p className="text-neutral/70">
                      Add an extra layer of security to your account by enabling two-factor authentication.
                    </p>
                  </div>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline">Setup 2FA</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Two-Factor Authentication</DialogTitle>
                        <DialogDescription>
                          This feature is coming soon. We're working on implementing two-factor authentication
                          to enhance your account security.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="outline">Close</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </TabsContent>
            
            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-6">
              <div className="bg-white p-8 rounded-2xl shadow-card">
                <h2 className="text-xl font-semibold mb-6">Notification Preferences</h2>
                
                <form onSubmit={handleSubmitNotification(onSubmitNotification)} className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="emailNotifications" className="text-base">Email Notifications</Label>
                        <p className="text-sm text-neutral/70">Receive notifications via email</p>
                      </div>
                      <Switch
                        id="emailNotifications"
                        checked={notificationValues.emailNotifications}
                        onCheckedChange={(checked) => handleNotificationToggle('emailNotifications', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="pushNotifications" className="text-base">Push Notifications</Label>
                        <p className="text-sm text-neutral/70">Receive notifications on your device</p>
                      </div>
                      <Switch
                        id="pushNotifications"
                        checked={notificationValues.pushNotifications}
                        onCheckedChange={(checked) => handleNotificationToggle('pushNotifications', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="maintenanceReminders" className="text-base">Maintenance Reminders</Label>
                        <p className="text-sm text-neutral/70">Get reminders about upcoming maintenance tasks</p>
                      </div>
                      <Switch
                        id="maintenanceReminders"
                        checked={notificationValues.maintenanceReminders}
                        onCheckedChange={(checked) => handleNotificationToggle('maintenanceReminders', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="weeklyReports" className="text-base">Weekly Reports</Label>
                        <p className="text-sm text-neutral/70">Receive weekly summary of your home maintenance</p>
                      </div>
                      <Switch
                        id="weeklyReports"
                        checked={notificationValues.weeklyReports}
                        onCheckedChange={(checked) => handleNotificationToggle('weeklyReports', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="promotionalEmails" className="text-base">Promotional Emails</Label>
                        <p className="text-sm text-neutral/70">Receive updates about new features and offers</p>
                      </div>
                      <Switch
                        id="promotionalEmails"
                        checked={notificationValues.promotionalEmails}
                        onCheckedChange={(checked) => handleNotificationToggle('promotionalEmails', checked)}
                      />
                    </div>
                  </div>
                  
                  <Button type="submit" disabled={isSubmitting} className="flex items-center gap-2">
                    {isSubmitting ? 'Saving...' : 'Save Preferences'}
                    {!isSubmitting && <Save className="h-4 w-4" />}
                  </Button>
                </form>
              </div>
            </TabsContent>
            
            {/* Billing Tab */}
            <TabsContent value="billing" className="space-y-6">
              <div className="bg-white p-8 rounded-2xl shadow-card">
                <h2 className="text-xl font-semibold mb-6">Subscription</h2>
                
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 mb-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Check className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">
                        {user?.subscription_status === 'active' ? 'Active Subscription' : 'Free Plan'}
                      </h3>
                      <p className="text-neutral/70">
                        {user?.subscription_status === 'active'
                          ? 'Your subscription is active until December 31, 2023'
                          : 'You are currently on the free plan with limited features'}
                      </p>
                      {user?.subscription_status !== 'active' && (
                        <Button className="mt-4" onClick={() => navigate('/pricing')}>
                          Upgrade Now
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                
                {user?.subscription_status === 'active' && (
                  <>
                    <h3 className="text-lg font-semibold mb-4">Payment Method</h3>
                    <div className="flex items-center justify-between p-4 border rounded-lg mb-6">
                      <div className="flex items-center gap-3">
                        <div className="bg-neutral/5 p-2 rounded-full">
                          <CreditCard className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">Visa ending in 4242</p>
                          <p className="text-sm text-neutral/70">Expires 12/2025</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Update
                      </Button>
                    </div>
                    
                    <h3 className="text-lg font-semibold mb-4">Billing History</h3>
                    <div className="border rounded-lg overflow-hidden">
                      <div className="grid grid-cols-3 gap-4 p-4 bg-neutral/5 font-medium">
                        <div>Date</div>
                        <div>Amount</div>
                        <div>Status</div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 p-4 border-t">
                        <div>Nov 1, 2023</div>
                        <div>$9.99</div>
                        <div className="text-green-600">Paid</div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 p-4 border-t">
                        <div>Oct 1, 2023</div>
                        <div>$9.99</div>
                        <div className="text-green-600">Paid</div>
                      </div>
                    </div>
                    
                    <div className="mt-6 pt-6 border-t">
                      <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700">
                        Cancel Subscription
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Settings; 