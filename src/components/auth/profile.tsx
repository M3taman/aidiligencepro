
import React from 'react';
import { getAuth, signOut } from 'firebase/auth';
import { useAuth } from './authContext';
import { app } from '../../firebase';

const Profile = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return <p>Loading...</p>;
    }

    if (!user) {
        return <p>Please log in.</p>;
    }

    const handleSignOut = () => {
        const auth = getAuth(app);
        signOut(auth).then(() => {
            // Sign-out successful.
        }).catch((error) => {
            console.error("Sign out error", error);
        });
    };

    return (
        <div className="p-4">
            <h2>Welcome, {user.email}</h2>
            <button onClick={handleSignOut}>Sign Out</button>
        </div>
    );
};

export default Profile;
