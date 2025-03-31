import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { getAuthService } from '../../services/auth';
import type { User } from '../../services/auth';

interface AuthContextProps {
    user: User | null;
    loading: boolean;
    trialStatus: {
        isActive: boolean;
        endDate: Date | null;
    };
}

const AuthContext = createContext<AuthContextProps>({ 
    user: null, 
    loading: true,
    trialStatus: {
        isActive: false,
        endDate: null
    }
});

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [trialStatus, setTrialStatus] = useState({
        isActive: false,
        endDate: null as Date | null
    });

    useEffect(() => {
    const authService = getAuthService();
    const unsubscribe = authService.onAuthStateChanged(async (user) => {
            if (user) {
                // Get user's creation time and calculate trial end date
                const creationTime = new Date(user.metadata.creationTime!);
                const trialEndDate = new Date(creationTime.getTime() + (7 * 24 * 60 * 60 * 1000)); // 7 days
                const now = new Date();
                
                setTrialStatus({
                    isActive: now < trialEndDate,
                    endDate: trialEndDate
                });
            } else {
                setTrialStatus({
                    isActive: false,
                    endDate: null
                });
            }
            setUser(user);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const value: AuthContextProps = {
        user,
        loading,
        trialStatus
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
