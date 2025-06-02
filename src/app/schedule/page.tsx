"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFirestore } from '@/context/firestore-context';
import { Button } from '@/components/ui/button';
import SabbathViewClient from '@/components/schedule/sabbath-view-client';

export default function PublicSchedulePage() {
  const { currentSchedule, loading } = useFirestore();
  const router = useRouter();

  useEffect(() => {
    if (currentSchedule && currentSchedule.id) {
      router.replace(`/schedule/${currentSchedule.id}`);
    }
  }, [currentSchedule, router]);

  return (
    <div className="space-y-8">
      <SabbathViewClient />
      <div className="flex flex-col items-center justify-center min-h-[40vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4" />
        <p className="text-muted-foreground">Loading schedule...</p>
        {loading && (
          <Button onClick={() => window.location.reload()} className="mt-4 bg-secondary hover:bg-secondary/90 text-white">Try Again</Button>
        )}
      </div>
    </div>
  );
} 