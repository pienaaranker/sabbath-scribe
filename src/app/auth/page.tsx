"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/auth-context';
import { Mail, Lock, User, Chrome } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import Image from 'next/image';
import { APP_NAME } from '@/lib/constants';

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
          description: "Welcome to InService.",
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
    <div className="min-h-screen flex items-center justify-center bg-light p-4">
      <div className="w-full max-w-md p-6 sm:p-8 bg-card rounded-xl shadow-md border border-border">
        <div className="text-center mb-6 sm:mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-primary text-xl sm:text-2xl font-serif font-bold hover:opacity-90 transition-opacity">
            <Image
              src="/logo.png"
              alt="InService Logo"
              width={32}
              height={32}
              className="h-6 w-6 sm:h-8 sm:w-8 object-contain"
            />
            <span className="hidden xs:inline">{APP_NAME}</span>
            <span className="xs:hidden">IS</span>
          </Link>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">Church Roster Management</p>
        </div>

        <Card className="shadow-none border-0 bg-transparent">
          <CardHeader className="text-center pb-3 sm:pb-4">
            <CardTitle className="font-serif text-xl sm:text-2xl text-secondary">
              {isSignUp ? 'Create Account' : 'Sign In'}
            </CardTitle>
            <CardDescription className="text-muted-foreground text-sm sm:text-base">
              {isSignUp
                ? 'Join InService to manage your church roster'
                : 'Welcome back! Please sign in to continue'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 sm:space-y-6">
            <form onSubmit={handleEmailAuth} className="space-y-4">
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="displayName" className="flex items-center gap-2 text-secondary font-medium">
                    <User className="h-4 w-4 text-accent" />
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
                    className="border-border focus:ring-primary focus:border-primary"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2 text-secondary font-medium">
                  <Mail className="h-4 w-4 text-accent" />
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
                  className="border-border focus:ring-primary focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2 text-secondary font-medium">
                  <Lock className="h-4 w-4 text-accent" />
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
                  className="border-border focus:ring-primary focus:border-primary"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 px-6 rounded-lg transition-all h-10 sm:h-11"
                disabled={loading}
              >
                {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <Button
              onClick={handleGoogleAuth}
              variant="outline"
              className="w-full bg-white border-2 border-border text-secondary hover:bg-light hover:border-accent font-medium py-2 px-6 rounded-lg transition-all h-10 sm:h-11"
              disabled={loading}
            >
              <Chrome className="mr-2 h-4 w-4 text-accent" />
              <span className="text-sm sm:text-base">Sign in with Google</span>
            </Button>

            <div className="text-center">
              <Button
                variant="link"
                onClick={() => setIsSignUp(!isSignUp)}
                disabled={loading}
                className="text-xs sm:text-sm text-primary hover:text-secondary p-2"
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
            className="text-muted-foreground hover:text-primary transition-colors text-xs sm:text-sm"
          >
            ← Back to main site
          </Link>
        </div>
      </div>
    </div>
  );
}