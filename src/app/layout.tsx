import type { Metadata } from 'next';
// import { GeistSans } from 'geist/font/sans'; // Removed
// import { GeistMono } from 'geist/font/mono'; // Removed
import './globals.css';
import { AppProvider } from '@/context/app-context';
import { AuthProvider } from '@/context/auth-context';
import { FirestoreProvider } from '@/context/firestore-context';
import { Toaster } from "@/components/ui/toaster";
import AppShell from '@/components/layout/app-shell';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'SabbathScribe',
  description: 'Church Roster Management App',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}> {/* Removed Geist font variables */}
        <Suspense fallback={
          <div className="min-h-screen gradient-bg flex items-center justify-center">
            <div className="text-center text-white">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p>Loading SabbathScribe...</p>
            </div>
          </div>
        }>
          <AuthProvider>
            <FirestoreProvider>
              <AppProvider>
                <AppShell>
                  {children}
                </AppShell>
                <Toaster />
              </AppProvider>
            </FirestoreProvider>
          </AuthProvider>
        </Suspense>
      </body>
    </html>
  );
}
