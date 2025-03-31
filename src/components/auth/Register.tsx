import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getAuthService, handleAuthError } from '../../services/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const db = getFirestore();
  const authService = getAuthService();

  // Create test admin account on component mount
  useEffect(() => {
    const createTestAdmin = async () => {
      try {
        const testEmail = 'admin@aidiligence.pro';
        const testPassword = 'Admin123!@#';
        
        try {
          // Try to sign in first
          await authService.signIn(testEmail, testPassword);
          console.log('Test admin account exists and is accessible');
        } catch (error) {
          // If sign in fails, create the account
          const user = await authService.signUp(testEmail, testPassword);
          
          // Set admin role in Firestore
          await setDoc(doc(db, 'users', user.uid), {
            email: testEmail,
            role: 'admin',
            createdAt: new Date().toISOString(),
            subscription: {
              type: 'enterprise',
              status: 'active',
              features: ['all']
            }
          });

          console.log('Test admin account created:', testEmail);
        }
      } catch (error) {
        console.error('Error with test admin account:', error);
      }
    };

    createTestAdmin();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await authService.signUp(email, password);
      
      // Set user role and trial info in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email,
        role: 'user',
        createdAt: new Date().toISOString(),
        trial: {
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'active'
        }
      });
      
      toast.success("Welcome to your 7-day trial!", {
        description: "Your account has been created successfully."
      });
      
      navigate('/profile');
    } catch (error: unknown) {
      const authError = handleAuthError(error);
      toast.error("Registration failed", {
        description: authError.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Start Your 7-Day Trial</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <Input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">Password</label>
              <Input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password (min. 6 characters)"
                autoComplete="new-password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating Account...' : 'Start Free Trial'}
            </Button>
            <div className="text-center space-y-2 text-sm text-muted-foreground">
              <p>By signing up, you agree to our Terms of Service and Privacy Policy</p>
              <p>Already have an account? <Link to="/login" className="text-primary hover:underline">Login</Link></p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
