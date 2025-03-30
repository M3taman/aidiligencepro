import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/authContext';
import { db } from '@/firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { generateMockDueDiligenceReport } from '@/features/due-diligence/mockApi';

export interface TrialStatus {
  startDate: Date | null;
  endDate: Date | null;
  reportsUsed: number;
  reportsLimit: number;
  isActive: boolean;
}

export const useReportUsage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trialStatus, setTrialStatus] = useState<TrialStatus>({
    startDate: null,
    endDate: null,
    reportsUsed: 0,
    reportsLimit: 5, // Default limit is 5 reports
    isActive: false,
  });

  // Use localStorage for non-authenticated users to track trial usage
  const getLocalTrialStatus = (): TrialStatus => {
    const localData = localStorage.getItem('trialStatus');
    if (localData) {
      const parsed = JSON.parse(localData);
      return {
        ...parsed,
        startDate: parsed.startDate ? new Date(parsed.startDate) : null,
        endDate: parsed.endDate ? new Date(parsed.endDate) : null,
      };
    }
    return {
      startDate: null,
      endDate: null,
      reportsUsed: 0,
      reportsLimit: 5,
      isActive: false,
    };
  };

  const saveLocalTrialStatus = (status: TrialStatus) => {
    localStorage.setItem('trialStatus', JSON.stringify(status));
  };

  // Initialize or fetch trial status
  useEffect(() => {
    const fetchTrialStatus = async () => {
      setLoading(true);
      setError(null);

      try {
        if (user) {
          // For authenticated users, get trial status from Firestore
          const userRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            
            if (userData.trialStatus) {
              // User already has trial status
              setTrialStatus({
                startDate: userData.trialStatus.startDate ? new Date(userData.trialStatus.startDate.toDate()) : null,
                endDate: userData.trialStatus.endDate ? new Date(userData.trialStatus.endDate.toDate()) : null,
                reportsUsed: userData.trialStatus.reportsUsed || 0,
                reportsLimit: userData.trialStatus.reportsLimit || 5,
                isActive: userData.trialStatus.isActive !== undefined ? userData.trialStatus.isActive : false,
              });
            } else {
              // Initialize trial for user
              const now = new Date();
              const trialEndDate = new Date(now);
              trialEndDate.setDate(trialEndDate.getDate() + 7); // 7-day trial
              
              const newTrialStatus = {
                startDate: now,
                endDate: trialEndDate,
                reportsUsed: 0,
                reportsLimit: 5,
                isActive: true,
              };
              
              await updateDoc(userRef, {
                trialStatus: {
                  startDate: serverTimestamp(),
                  endDate: trialEndDate,
                  reportsUsed: 0,
                  reportsLimit: 5,
                  isActive: true,
                }
              });
              
              setTrialStatus(newTrialStatus);
            }
          } else {
            // Create new user document with trial status
            const now = new Date();
            const trialEndDate = new Date(now);
            trialEndDate.setDate(trialEndDate.getDate() + 7); // 7-day trial
            
            const newTrialStatus = {
              startDate: now,
              endDate: trialEndDate,
              reportsUsed: 0,
              reportsLimit: 5,
              isActive: true,
            };
            
            await setDoc(userRef, {
              email: user.email,
              createdAt: serverTimestamp(),
              trialStatus: {
                startDate: serverTimestamp(),
                endDate: trialEndDate,
                reportsUsed: 0,
                reportsLimit: 5,
                isActive: true,
              }
            });
            
            setTrialStatus(newTrialStatus);
          }
        } else {
          // For non-authenticated users, get trial status from localStorage
          const localStatus = getLocalTrialStatus();
          
          if (!localStatus.startDate) {
            // Initialize trial for non-authenticated user
            const now = new Date();
            const trialEndDate = new Date(now);
            trialEndDate.setDate(trialEndDate.getDate() + 7); // 7-day trial
            
            const newTrialStatus = {
              startDate: now,
              endDate: trialEndDate,
              reportsUsed: 0,
              reportsLimit: 5,
              isActive: true,
            };
            
            saveLocalTrialStatus(newTrialStatus);
            setTrialStatus(newTrialStatus);
          } else {
            setTrialStatus(localStatus);
          }
        }
      } catch (err: any) {
        console.error('Error fetching report usage:', err);
        setError(err.message || 'Failed to fetch report usage');
        
        // Fallback to local storage if Firestore fails
        const localStatus = getLocalTrialStatus();
        setTrialStatus(localStatus);
      } finally {
        setLoading(false);
      }
    };

    fetchTrialStatus();
  }, [user]);

  // Track report generation
  const trackReportGeneration = async () => {
    try {
      const newReportsUsed = trialStatus.reportsUsed + 1;
      
      if (user) {
        // Update Firestore for authenticated users
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          'trialStatus.reportsUsed': newReportsUsed
        });
      } else {
        // Update localStorage for non-authenticated users
        const updatedStatus = {
          ...trialStatus,
          reportsUsed: newReportsUsed
        };
        saveLocalTrialStatus(updatedStatus);
      }
      
      // Update local state
      setTrialStatus(prev => ({
        ...prev,
        reportsUsed: newReportsUsed
      }));
      
      return true;
    } catch (err: any) {
      console.error('Error tracking report generation:', err);
      return false;
    }
  };

  // Check if user can generate a report
  const canGenerateReport = () => {
    // Always return true for the first 5 reports to ensure visitors get 5 trials with real data
    if (trialStatus.reportsUsed < 5) {
      return true;
    }
    
    // After 5 reports, check if trial is still active
    if (!trialStatus.isActive) return false;
    
    const now = new Date();
    if (trialStatus.endDate && now > trialStatus.endDate) return false;
    
    return trialStatus.reportsUsed < trialStatus.reportsLimit;
  };

  // Generate real or demo report based on trial status
  const generateReport = async (companyName: string) => {
    // Always generate real data for the first 5 reports
    if (trialStatus.reportsUsed < 5) {
      // This would be replaced with your real API call in production
      // For now, we'll use the mock API but with a flag to indicate it should return "real-like" data
      return generateMockDueDiligenceReport(companyName, true); // true indicates real-like data
    }
    
    // After 5 reports, return demo data
    return generateMockDueDiligenceReport(companyName, false); // false indicates demo data
  };

  return {
    trialStatus,
    loading,
    error,
    trackReportGeneration,
    canGenerateReport,
    generateReport
  };
};

export default useReportUsage;
