"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type AuthValues = z.infer<typeof authSchema>;

export default function AuthForm() {
  const router = useRouter();
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthValues>({
    resolver: zodResolver(authSchema),
  });

  const checkForMigrationNeeds = async () => {
    try {
      // Check if there's existing data in the old structure
      const peopleQuery = query(collection(db, 'people'), limit(1));
      const peopleSnapshot = await getDocs(peopleQuery);
      
      const assignmentsQuery = query(collection(db, 'assignments'), limit(1));
      const assignmentsSnapshot = await getDocs(assignmentsQuery);
      
      const hasExistingData = !peopleSnapshot.empty || !assignmentsSnapshot.empty;
      
      // Check if user already has schedules
      const schedulesQuery = query(collection(db, 'schedules'), limit(1));
      const schedulesSnapshot = await getDocs(schedulesQuery);
      
      const hasSchedules = !schedulesSnapshot.empty;
      
      // If there's existing data and no schedules, redirect to migration
      if (hasExistingData && !hasSchedules) {
        return '/migrate';
      }
      
      return '/admin';
    } catch (error) {
      console.error('Error checking for migration needs:', error);
      return '/admin'; // Default to admin if check fails
    }
  };

  const onSubmit = async (data: AuthValues) => {
    setIsLoading(true);
    try {
      if (authMode === 'signin') {
        await signIn(data.email, data.password);
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
        });
      } else {
        await signUp(data.email, data.password);
        toast({
          title: "Account created!",
          description: "Your account has been created successfully.",
        });
      }
      
      // Check if migration is needed
      const redirectPath = await checkForMigrationNeeds();
      router.push(redirectPath);
    } catch (error) {
      const errorMessage = 
        authMode === 'signin' 
          ? "Failed to sign in. Please check your credentials and try again."
          : "Failed to create account. This email might already be in use.";
      
      toast({
        title: "Authentication error",
        description: errorMessage,
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
      toast({
        title: "Welcome!",
        description: "You have successfully signed in with Google.",
      });
      
      // Check if migration is needed
      const redirectPath = await checkForMigrationNeeds();
      router.push(redirectPath);
    } catch (error) {
      toast({
        title: "Authentication error",
        description: "Failed to sign in with Google. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-form-container">
      <div className="auth-form-inner">
        <div className="auth-form-header">
          <h1 className="auth-title">SabbathScribe</h1>
          <p className="auth-subtitle">Manage your church's weekly assignments</p>
        </div>

        <Tabs defaultValue="signin" className="w-full" onValueChange={(value) => setAuthMode(value as 'signin' | 'signup')}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="signin">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register('email')} />
                {errors.email && <p className="text-destructive text-sm">{errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Button type="button" variant="link" className="p-0 h-auto text-xs">
                    Forgot password?
                  </Button>
                </div>
                <Input id="password" type="password" {...register('password')} />
                {errors.password && <p className="text-destructive text-sm">{errors.password.message}</p>}
              </div>
              <Button type="submit" className="w-full gradient-bg" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </TabsContent>
          <TabsContent value="signup">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register('email')} />
                {errors.email && <p className="text-destructive text-sm">{errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" {...register('password')} />
                {errors.password && <p className="text-destructive text-sm">{errors.password.message}</p>}
              </div>
              <Button type="submit" className="w-full gradient-bg" disabled={isLoading}>
                {isLoading ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t"></span>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-background px-2 text-muted-foreground">or continue with</span>
          </div>
        </div>

        <Button type="button" variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isLoading}>
          <svg viewBox="0 0 24 24" className="h-4 w-4 mr-2" aria-hidden="true">
            <path
              d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z"
              fill="#EA4335"
            />
            <path
              d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z"
              fill="#4285F4"
            />
            <path
              d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z"
              fill="#FBBC05"
            />
            <path
              d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.2654 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z"
              fill="#34A853"
            />
          </svg>
          Google
        </Button>
 