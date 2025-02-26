import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { app } from '../../firebase';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const db = getFirestore(app);

  // Create test admin account on component mount
  useEffect(() => {
    const createTestAdmin = async () => {
      try {
        const auth = getAuth(app);
        const testEmail = 'admin@aidiligence.pro';
        const testPassword = 'Admin123!@#';
        
        try {
          // Try to sign in first
          await signInWithEmailAndPassword(auth, testEmail, testPassword);
          console.log('Test admin account exists and is accessible');
        } catch (signInError) {
          // If sign in fails, create the account
          const userCredential = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
          
          // Set admin role in Firestore
          await setDoc(doc(db, 'users', userCredential.user.uid), {
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
      } catch (error: any) {
        console.error('Error with test admin account:', error);
      }
    };

    createTestAdmin();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const auth = getAuth(app);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Set user role and trial info in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
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
    } catch (error: any) {
      console.error('Registration error:', error);
      let errorMessage = "Registration failed";
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = "This email is already registered";
          break;
        case 'auth/invalid-email':
          errorMessage = "Invalid email address";
          break;
        case 'auth/operation-not-allowed':
          errorMessage = "Email/password accounts are not enabled";
          break;
        case 'auth/weak-password':
          errorMessage = "Password is too weak";
          break;
        default:
          errorMessage = error.message;
      }
      
      toast.error("Registration failed", {
        description: errorMessage
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
