"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { migrateData } from '@/lib/migrate-data';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function MigratePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [scheduleName, setScheduleName] = useState('My Church Schedule');
  const [description, setDescription] = useState('Migrated from previous version');
  const [isMigrating, setIsMigrating] = useState(false);
  const [hasData, setHasData] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    async function checkForExistingData() {
      if (!user) return;
      
      try {
        setIsChecking(true);
        
        // Check if there's existing data to migrate
        const peopleQuery = query(collection(db, 'people'), limit(1));
        const peopleSnapshot = await getDocs(peopleQuery);
        
        const assignmentsQuery = query(collection(db, 'assignments'), limit(1));
        const assignmentsSnapshot = await getDocs(assignmentsQuery);
        
        const hasExistingData = !peopleSnapshot.empty || !assignmentsSnapshot.empty;
        setHasData(hasExistingData);
        
        // If no data to migrate, redirect to admin
        if (!hasExistingData) {
          router.push('/admin');
        }
      } catch (error) {
        console.error('Error checking for existing data:', error);
        toast({
          title: "Error",
          description: "Failed to check for existing data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsChecking(false);
      }
    }
    
    checkForExistingData();
  }, [user, router, toast]);

  const handleMigrate = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to migrate data.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsMigrating(true);
      
      const scheduleId = await migrateData(user.uid, scheduleName, description);
      
      if (!scheduleId) {
        toast({
          title: "No Data to Migrate",
          description: "There was no data to migrate. Redirecting to admin dashboard.",
        });
        router.push('/admin');
        return;
      }
      
      toast({
        title: "Migration Complete",
        description: "Your data has been successfully migrated to the new schedule.",
      });
      
      // Redirect to admin page
      router.push('/admin');
    } catch (error) {
      console.error('Error migrating data:', error);
      toast({
        title: "Migration Failed",
        description: "There was an error migrating your data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsMigrating(false);
    }
  };

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking existing data...</p>
        </div>
      </div>
    );
  }

  if (!hasData) {
    return null; // Will redirect in the useEffect
  }

  return (
    <div className="container max-w-lg py-12">
      <Card>
        <CardHeader>
          <CardTitle>Migrate Your Data</CardTitle>
          <CardDescription>
            We've detected existing data in your account. We need to migrate it to the new multi-tenant structure.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="schedule-name">Schedule Name</Label>
            <Input
              id="schedule-name"
              value={scheduleName}
              onChange={(e) => setScheduleName(e.target.value)}
              placeholder="My Church Schedule"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description of this schedule"
              rows={3}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.push('/admin')}>
            Skip Migration
          </Button>
          <Button 
            onClick={handleMigrate}
            disabled={!scheduleName.trim() || isMigrating}
            className="gradient-bg text-white border-0 hover:opacity-90"
          >
            {isMigrating ? 'Migrating...' : 'Migrate Data'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 