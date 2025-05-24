"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import AssignmentManagementClient from '@/components/admin/assignments/assignment-management-client';
import { useFirestore } from '@/context/firestore-context';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function AssignmentsPage() {
  const router = useRouter();
  const { currentSchedule } = useFirestore();

  // Redirect to admin if no schedule is selected
  if (!currentSchedule) {
    return (
      <div className="container py-8">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.push('/admin')} className="p-0 h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">No Schedule Selected</h2>
          <p className="text-muted-foreground mb-6">
            Please select a schedule from the dropdown above to manage assignments.
          </p>
          <Button onClick={() => router.push('/admin')} className="gradient-bg text-white border-0 hover:opacity-90">
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.push('/admin')} className="p-0 h-8 w-8">
          <ArrowLeft className="h-4 w-4" />
        </Button>
      </div>
      <AssignmentManagementClient />
    </div>
  );
}
