"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/auth-context';
import { CalendarCheck, Mail, Lock, User, Chrome } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);

  const { signIn, signUp, signInWithGoogle, user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      router.push('/admin');
    }
  }, [user, router]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        await signUp(email, password, displayName);
        toast({
          title: "Account created!",
          description: "Welcome to SabbathScribe.",
        });
      } else {
        await signIn(email, password);
        toast({
          title: "Welcome back!",
          description: "Successfully signed in.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Authentication failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);

    try {
      await signInWithGoogle();
      toast({
        title: "Welcome!",
        description: "Successfully signed in with Google.",
      });
    } catch (error: any) {
      toast({
        title: "Authentication failed",
        description: error.message || "Failed to sign in with Google.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md p-4 sm:p-6 bg-white rounded-2xl shadow-xl border border-gray-100">
        <div className="text-center mb-6 sm:mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-primary text-xl sm:text-2xl font-bold hover:opacity-90 transition-opacity">
            <CalendarCheck className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            <span className="hidden xs:inline">SabbathScribe</span>
            <span className="xs:hidden">SS</span>
          </Link>
          <p className="text-gray-500 mt-2 text-sm sm:text-base">Church Roster Management</p>
        </div>

        <Card className="shadow-none border-0 bg-transparent">
          <CardHeader className="text-center pb-3 sm:pb-4">
            <CardTitle className="text-xl sm:text-2xl text-gray-900">
              {isSignUp ? 'Create Account' : 'Sign In'}
            </CardTitle>
            <CardDescription className="text-gray-500 text-sm sm:text-base">
              {isSignUp
                ? 'Join SabbathScribe to manage your church roster'
                : 'Welcome back! Please sign in to continue'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 sm:space-y-6">
            <form onSubmit={handleEmailAuth} className="space-y-4">
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="displayName" className="flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    Full Name
                  </Label>
                  <Input
                    id="displayName"
                    type="text"
                    placeholder="Enter your full name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required={isSignUp}
                    disabled={loading}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-primary" />
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  minLength={6}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-primary text-white border-0 hover:bg-primary/90 h-10 sm:h-11"
                disabled={loading}
              >
                {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-400">
                  Or continue with
                </span>
              </div>
            </div>

            <Button
              onClick={handleGoogleAuth}
              variant="outline"
              className="w-full border-gray-200 h-10 sm:h-11"
              disabled={loading}
            >
              <Chrome className="mr-2 h-4 w-4 text-primary" />
              <span className="text-sm sm:text-base">Sign in with Google</span>
            </Button>

            <div className="text-center">
              <Button
                variant="link"
                onClick={() => setIsSignUp(!isSignUp)}
                disabled={loading}
                className="text-xs sm:text-sm text-primary p-2"
              >
                {isSignUp
                  ? 'Already have an account? Sign in'
                  : "Don't have an account? Sign up"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-4 sm:mt-6">
          <Link
            href="/"
            className="text-gray-400 hover:text-primary transition-colors text-xs sm:text-sm"
          >
            ← Back to main site
          </Link>
        </div>
      </div>
    </div>
  );
}