import SabbathViewClient from '@/components/schedule/sabbath-view-client';
import { use } from 'react';
import { notFound } from 'next/navigation';

// This page is for /schedule/[id] public sharing
export default async function PublicScheduleByIdPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-8">
      <SabbathViewClient scheduleId={params.id} />
    </div>
  );
} 