
import React from 'react';
import { getAuth, signOut } from 'firebase/auth';
import { useAuth } from './authContext';
import { app } from '../../firebase';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { User, Mail, LogOut } from "lucide-react";

const Profile = () => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-pulse">Loading...</div>
            </div>
        );
    }

    if (!user) {
        navigate('/login');
        return null;
    }

    const handleSignOut = async () => {
        const auth = getAuth(app);
        try {
            await signOut(auth);
            toast.success("Signed out successfully");
            navigate('/login');
        } catch (error) {
            console.error("Sign out error", error);
            toast.error("Error signing out");
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-2">
                        <User className="w-6 h-6" />
                        Profile Details
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center gap-4 p-4 bg-secondary/50 rounded-lg">
                        <Mail className="w-5 h-5 text-muted-foreground" />
                        <div>
                            <p className="text-sm text-muted-foreground">Email</p>
                            <p className="font-medium">{user.email}</p>
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Account Actions</h3>
                        <Button 
                            variant="destructive" 
                            onClick={handleSignOut}
                            className="w-full sm:w-auto"
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Sign Out
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Profile;
