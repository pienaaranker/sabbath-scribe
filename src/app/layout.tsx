import type { Metadata } from 'next';
import { Inter, Lora } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/context/app-context';
import { AuthProvider } from '@/context/auth-context';
import { FirestoreProvider } from '@/context/firestore-context';
import { Toaster } from "@/components/ui/toaster";
import AppShell from '@/components/layout/app-shell';
import { Suspense } from 'react';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const lora = Lora({
  subsets: ['latin'],
  variable: '--font-lora',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'InService',
  description: 'Church Roster Management App',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${lora.variable} font-sans antialiased`}>
        <Suspense fallback={
          <div className="min-h-screen bg-primary flex items-center justify-center">
            <div className="text-center text-primary-foreground">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-foreground mx-auto mb-4"></div>
              <p className="font-serif text-lg">Loading InService...</p>
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
