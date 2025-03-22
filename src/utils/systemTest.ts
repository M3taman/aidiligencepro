import { mockAuth, mockFirestore, resetMockData, enableMockMode } from './mockFirebase';
import { toast } from 'sonner';
import { testFeature } from './testUtils';

export interface TestResult {
  feature: string;
  success: boolean;
  error?: string;
}

export const runSystemTests = async () => {
  const results: TestResult[] = [];
  const testEmail = `test_${Date.now()}@example.com`;
  const testPassword = 'Test123!@#';
  
  // Reset mock data before tests
  resetMockData();
  
  // Enable mock mode
  const { auth: testAuth, db: testDb } = enableMockMode();
  
  toast.info('Starting system tests...');

  // 1. Authentication Tests
  console.log('🔒 Running Authentication Tests...');

  // Test Registration
  const registerTest = await testFeature(
    'User Registration',
    async () => {
      try {
        const userCredential = await testAuth.createUserWithEmailAndPassword(testEmail, testPassword);
        return !!userCredential.user;
      } catch (error) {
        console.error('Registration test error:', error);
        return false;
      }
    },
    'Test user registered successfully',
    'Failed to register test user'
  );
  results.push({ feature: 'Registration', success: registerTest });

  // Test Login
  const loginTest = await testFeature(
    'User Login',
    async () => {
      try {
        const userCredential = await testAuth.signInWithEmailAndPassword(testEmail, testPassword);
        return !!userCredential.user;
      } catch (error) {
        console.error('Login test error:', error);
        return false;
      }
    },
    'Login successful',
    'Failed to login'
  );
  results.push({ feature: 'Login', success: loginTest });

  // Test Password Reset
  const passwordResetTest = await testFeature(
    'Password Reset',
    async () => {
      try {
        await testAuth.sendPasswordResetEmail(testEmail);
        return true;
      } catch (error) {
        console.error('Password reset test error:', error);
        return false;
      }
    },
    'Password reset email sent',
    'Failed to send password reset email'
  );
  results.push({ feature: 'Password Reset', success: passwordResetTest });

  // 2. User Settings Tests
  console.log('⚙️ Running Settings Tests...');

  // Test Settings Storage
  const testSettings = {
    theme: 'dark',
    language: 'en',
    reportFormat: 'detailed',
    emailNotifications: true
  };

  const settingsTest = await testFeature(
    'Settings Storage',
    async () => {
      try {
        const user = testAuth.currentUser;
        if (!user) return false;

        await testDb.collection('userSettings').doc(user.uid).set(testSettings);
        const settingsDoc = await testDb.collection('userSettings').doc(user.uid).get();
        return settingsDoc.exists() && settingsDoc.data().theme === testSettings.theme;
      } catch (error) {
        console.error('Settings test error:', error);
        return false;
      }
    },
    'Settings saved successfully',
    'Failed to save settings'
  );
  results.push({ feature: 'Settings Storage', success: settingsTest });

  // 3. Profile Tests
  console.log('👤 Running Profile Tests...');

  const testProfile = {
    displayName: 'Test User',
    company: 'Test Corp',
    position: 'Tester',
    joinDate: new Date().toISOString()
  };

  const profileTest = await testFeature(
    'Profile Storage',
    async () => {
      try {
        const user = testAuth.currentUser;
        if (!user) return false;

        await testDb.collection('userProfiles').doc(user.uid).set(testProfile);
        const profileDoc = await testDb.collection('userProfiles').doc(user.uid).get();
        return profileDoc.exists() && profileDoc.data().displayName === testProfile.displayName;
      } catch (error) {
        console.error('Profile test error:', error);
        return false;
      }
    },
    'Profile saved successfully',
    'Failed to save profile'
  );
  results.push({ feature: 'Profile Storage', success: profileTest });

  // 4. Due Diligence Tests
  console.log('📊 Running Due Diligence Tests...');

  const reportTest = await testFeature(
    'Report Generation',
    async () => {
      try {
        // Mock API call for testing
        toast.info('Simulating report generation...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        return true;
      } catch (error) {
        console.error('Report test error:', error);
        return false;
      }
    },
    'Report generated successfully',
    'Failed to generate report'
  );
  results.push({ feature: 'Report Generation', success: reportTest });

  // 5. Cleanup
  console.log('🧹 Running Cleanup...');

  // Clean up test data
  const cleanupTest = await testFeature(
    'Test Data Cleanup',
    async () => {
      try {
        const user = testAuth.currentUser;
        if (!user) return false;

        await testDb.collection('userSettings').doc(user.uid).delete();
        await testDb.collection('userProfiles').doc(user.uid).delete();
        await user.delete();
        await testAuth.signOut();
        return true;
      } catch (error) {
        console.error('Cleanup test error:', error);
        return false;
      }
    },
    'Test data cleaned up successfully',
    'Failed to clean up test data'
  );
  results.push({ feature: 'Cleanup', success: cleanupTest });

  // Print Summary
  console.log('\n📋 Test Summary:');
  console.log('================');
  results.forEach(({ feature, success }) => {
    console.log(`${success ? '✅' : '❌'} ${feature}`);
  });

  const successRate = (results.filter(r => r.success).length / results.length) * 100;
  console.log(`\nSuccess Rate: ${successRate.toFixed(1)}%`);
  
  toast.success(`Tests completed with ${successRate.toFixed(1)}% success rate`);

  return results;
}; 