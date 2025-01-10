"use client";

    import React, { useState } from 'react';
    import { auth } from '@/lib/firebase';
    import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
    import { Input } from "@/components/ui/input";
    import { Button } from "@/components/ui/button";
    import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

    const Login = ({ onLogin }: { onLogin: () => void }) => {
      const [email, setEmail] = useState('');
      const [password, setPassword] = useState('');
      const [isSignUp, setIsSignUp] = useState(false);
      const [error, setError] = useState<string | null>(null);

      const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
          if (isSignUp) {
            await createUserWithEmailAndPassword(auth, email, password);
          } else {
            await signInWithEmailAndPassword(auth, email, password);
          }
          onLogin();
        } catch (err: any) {
          setError(err.message);
        }
      };

      const handleSignOut = async () => {
        try {
          await signOut(auth);
          onLogin();
        } catch (err: any) {
          setError(err.message);
        }
      };

      return (
        <div className="flex items-center justify-center h-screen">
          <Card className="w-96">
            <CardHeader>
              <CardTitle>{isSignUp ? 'Sign Up' : 'Login'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <Button type="submit" className="w-full">
                  {isSignUp ? 'Sign Up' : 'Login'}
                </Button>
                <Button type="button" variant="link" onClick={() => setIsSignUp(!isSignUp)}>
                  {isSignUp ? 'Already have an account? Login' : 'Need an account? Sign Up'}
                </Button>
                {auth.currentUser && (
                  <Button type="button" variant="outline" onClick={handleSignOut} className="w-full">
                    Sign Out
                  </Button>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      );
    };

    export default Login;
