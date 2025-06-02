"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import RoleManagementClient from '@/components/admin/roles/role-management-client';
import { useFirestore } from '@/context/firestore-context';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function RolesPage() {
  const router = useRouter();
  const { currentSchedule } = useFirestore();

  // Redirect to admin if no schedule is selected
  if (!currentSchedule) {
    return (
      <div className="container py-6 sm:py-8 px-4">
        <div className="mb-4 sm:mb-6">
          <Button variant="ghost" onClick={() => router.push('/admin')} className="p-0 h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>
        <div className="text-center py-8 sm:py-12">
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-secondary mb-4">No Schedule Selected</h2>
          <p className="text-muted-foreground mb-6 text-sm sm:text-base px-4">
            Please select a schedule from the dropdown above to manage roles.
          </p>
          <Button onClick={() => router.push('/admin')} className="bg-secondary hover:bg-secondary/90 text-white border-0">
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6 sm:py-8">
      <div className="mb-4 sm:mb-6 px-4">
        <Button variant="ghost" onClick={() => router.push('/admin')} className="p-0 h-8 w-8">
          <ArrowLeft className="h-4 w-4" />
        </Button>
      </div>
      <RoleManagementClient />
    </div>
  );
}