"use client";
import React from 'react';
import Header from './header';
import { usePathname } from 'next/navigation';
import AdminHeader from './admin-header';

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col">
      {isAdminRoute ? <AdminHeader /> : <Header />}
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="py-4 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} SabbathScribe. All rights reserved.
      </footer>
    </div>
  );
}
