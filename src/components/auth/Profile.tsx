
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
import { useAuth } from './authContext';
import { app } from '../../firebase';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

const Profile = () => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    if (loading) {
        return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
    }

    if (!user) {
        navigate('/login');
        return null;
    }

    const handleSignOut = async () => {
        try {
            const auth = getAuth(app);
            await signOut(auth);
            toast({
                title: "Signed out successfully",
                description: "You have been logged out of your account.",
            });
            navigate('/login');
        } catch (error) {
            console.error("Sign out error", error);
            toast({
                title: "Error signing out",
                description: "There was a problem signing you out.",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="container mx-auto p-4">
            <Card className="max-w-md mx-auto">
                <CardHeader>
                    <CardTitle>Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h3 className="text-lg font-medium">Email</h3>
                        <p className="text-gray-600">{user.email}</p>
                    </div>
                    <Button 
                        onClick={handleSignOut}
                        variant="destructive"
                        className="w-full"
                    >
                        Sign Out
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

export default Profile;
