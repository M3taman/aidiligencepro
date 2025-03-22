import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './authContext';
import { 
  getAuth, 
  updatePassword, 
  reauthenticateWithCredential,
  EmailAuthProvider,
  deleteUser
} from 'firebase/auth';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
} from "@/components/ui/alert-dialog";
import { toast } from 'sonner';
import { Loader2, CreditCard, Lock, AlertTriangle } from 'lucide-react';

const Settings = () => {
  const { user, hasTrial } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Account deletion state
  const [deleteConfirmPassword, setDeleteConfirmPassword] = useState('');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // Handle password change
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in to change your password');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    
    try {
      const auth = getAuth();
      const credential = EmailAuthProvider.credential(
        user.email!,
        currentPassword
      );
      
      // Re-authenticate user
      await reauthenticateWithCredential(user, credential);
      
      // Update password
      await updatePassword(user, newPassword);
      
      toast.success('Password updated successfully');
      
      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error('Error updating password:', error);
      
      let errorMessage = 'Failed to update password';
      if (error.code === 'auth/wrong-password') {
        errorMessage = 'Current password is incorrect';
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle account deletion
  const handleAccountDeletion = async () => {
    if (!user) {
      toast.error('You must be logged in to delete your account');
      return;
    }
    
    if (deleteConfirmText !== 'DELETE') {
      toast.error('Please type DELETE to confirm account deletion');
      return;
    }
    
    setLoading(true);
    
    try {
      const auth = getAuth();
      const credential = EmailAuthProvider.credential(
        user.email!,
        deleteConfirmPassword
      );
      
      // Re-authenticate user
      await reauthenticateWithCredential(user, credential);
      
      // Delete user data from Firestore
      await deleteDoc(doc(db, 'users', user.uid));
      await deleteDoc(doc(db, 'userProfiles', user.uid));
      
      // Delete user account
      await deleteUser(user);
      
      toast.success('Account deleted successfully');
      navigate('/');
    } catch (error: any) {
      console.error('Error deleting account:', error);
      
      let errorMessage = 'Failed to delete account';
      if (error.code === 'auth/wrong-password') {
        errorMessage = 'Password is incorrect';
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Account Settings</h1>
        
        <Tabs defaultValue="password" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="password">Security</TabsTrigger>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
          </TabsList>
          
          {/* Password Change Tab */}
          <TabsContent value="password" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Change Password
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      'Update Password'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
            
            {/* Account Deletion */}
            <Card className="border-destructive/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="w-5 h-5" />
                  Delete Account
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  This action is permanent and cannot be undone. All your data will be permanently deleted.
                </p>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full">
                      Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your account
                        and remove your data from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="deleteConfirmPassword">Enter your password</Label>
                        <Input
                          id="deleteConfirmPassword"
                          type="password"
                          value={deleteConfirmPassword}
                          onChange={(e) => setDeleteConfirmPassword(e.target.value)}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="deleteConfirmText">
                          Type <span className="font-bold">DELETE</span> to confirm
                        </Label>
                        <Input
                          id="deleteConfirmText"
                          value={deleteConfirmText}
                          onChange={(e) => setDeleteConfirmText(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleAccountDeletion}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete Account
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Subscription Tab */}
          <TabsContent value="subscription">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Subscription Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {hasTrial ? (
                  <div className="p-4 bg-primary/10 rounded-lg">
                    <h3 className="font-semibold text-lg mb-2">Active Trial</h3>
                    <p className="text-muted-foreground mb-4">
                      You are currently on a free trial. Your trial will expire soon.
                    </p>
                    <Button className="w-full">
                      Upgrade to Pro
                    </Button>
                  </div>
                ) : (
                  <div className="p-4 bg-muted rounded-lg">
                    <h3 className="font-semibold text-lg mb-2">No Active Subscription</h3>
                    <p className="text-muted-foreground mb-4">
                      You don't have an active subscription. Upgrade to access premium features.
                    </p>
                    <Button className="w-full">
                      View Plans
                    </Button>
                  </div>
                )}
                
                <div className="border-t pt-6">
                  <h3 className="font-semibold text-lg mb-4">Billing History</h3>
                  <p className="text-muted-foreground">
                    No billing history available.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="mt-6">
          <Button
            variant="outline"
            onClick={() => navigate('/profile')}
          >
            Back to Profile
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings; 