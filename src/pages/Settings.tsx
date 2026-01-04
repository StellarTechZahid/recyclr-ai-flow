
import { useState } from 'react';
import { ArrowLeft, User, Bell, CreditCard, Shield, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import SubscriptionManager from '@/components/SubscriptionManager';

const Settings = () => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState({
    fullName: user?.user_metadata?.full_name || '',
    email: user?.email || '',
  });
  const [notifications, setNotifications] = useState({
    emailUpdates: true,
    pushNotifications: false,
    weeklyReport: true,
  });

  const handleProfileUpdate = async () => {
    try {
      // In a real app, this would update the user profile
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleDeleteAccount = async () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        // In a real app, this would delete the user account
        toast.success('Account deletion initiated');
      } catch (error) {
        toast.error('Failed to delete account');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <Link to="/dashboard" className="flex items-center text-gray-600 hover:text-gray-900 transition-colors text-sm sm:text-base">
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 flex-shrink-0" />
              <span className="hidden xs:inline">Back to Dashboard</span>
              <span className="xs:hidden">Back</span>
            </Link>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold brand-gradient-text">Settings</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8 max-w-4xl">
        <Tabs defaultValue="profile" className="space-y-4 sm:space-y-6 md:space-y-8">
          <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full h-auto gap-1 p-1">
            <TabsTrigger value="profile" className="flex items-center justify-center gap-1 sm:gap-2 py-2 text-xs sm:text-sm">
              <User className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center justify-center gap-1 sm:gap-2 py-2 text-xs sm:text-sm">
              <Bell className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Alerts</span>
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center justify-center gap-1 sm:gap-2 py-2 text-xs sm:text-sm">
              <CreditCard className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Billing</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center justify-center gap-1 sm:gap-2 py-2 text-xs sm:text-sm">
              <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Security</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card className="card-modern">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Profile Information
                </CardTitle>
                <CardDescription>
                  Update your personal information and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={profile.fullName}
                      onChange={(e) => setProfile(prev => ({ ...prev, fullName: e.target.value }))}
                      className="input-modern"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                      className="input-modern"
                    />
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-4">
                  <Button onClick={handleProfileUpdate} className="btn-primary-modern">
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card className="card-modern">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="w-5 h-5 mr-2" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Choose how you want to be notified about updates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email-updates" className="text-base font-medium">
                        Email Updates
                      </Label>
                      <p className="text-sm text-gray-600">
                        Receive email notifications about new features and updates
                      </p>
                    </div>
                    <Switch
                      id="email-updates"
                      checked={notifications.emailUpdates}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, emailUpdates: checked }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="push-notifications" className="text-base font-medium">
                        Push Notifications
                      </Label>
                      <p className="text-sm text-gray-600">
                        Get browser notifications for important updates
                      </p>
                    </div>
                    <Switch
                      id="push-notifications"
                      checked={notifications.pushNotifications}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, pushNotifications: checked }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="weekly-report" className="text-base font-medium">
                        Weekly Report
                      </Label>
                      <p className="text-sm text-gray-600">
                        Receive weekly analytics and performance reports
                      </p>
                    </div>
                    <Switch
                      id="weekly-report"
                      checked={notifications.weeklyReport}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, weeklyReport: checked }))
                      }
                    />
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button className="btn-primary-modern">
                    Save Preferences
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing">
            <SubscriptionManager />
          </TabsContent>

          <TabsContent value="security">
            <div className="space-y-6">
              <Card className="card-modern">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    Account Security
                  </CardTitle>
                  <CardDescription>
                    Manage your account security and access
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Password</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        Last changed 30 days ago
                      </p>
                      <Button variant="outline">Change Password</Button>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Two-Factor Authentication</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        Add an extra layer of security to your account
                      </p>
                      <Button variant="outline">Enable 2FA</Button>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Active Sessions</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        You are currently signed in on 1 device
                      </p>
                      <Button variant="outline">Manage Sessions</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-modern border-red-200">
                <CardHeader>
                  <CardTitle className="flex items-center text-red-600">
                    <Trash2 className="w-5 h-5 mr-2" />
                    Danger Zone
                  </CardTitle>
                  <CardDescription>
                    Irreversible actions that will affect your account
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h4 className="font-medium text-red-900 mb-2">Delete Account</h4>
                    <p className="text-sm text-red-700 mb-4">
                      Once you delete your account, there is no going back. All your data will be permanently removed.
                    </p>
                    <Button 
                      variant="destructive"
                      onClick={handleDeleteAccount}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Delete Account
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;
