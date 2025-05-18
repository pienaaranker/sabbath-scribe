import type { Metadata } from 'next';
// import { GeistSans } from 'geist/font/sans'; // Removed
// import { GeistMono } from 'geist/font/mono'; // Removed
import './globals.css';
import { AppProvider } from '@/context/app-context';
import { Toaster } from "@/components/ui/toaster";
import AppShell from '@/components/layout/app-shell';

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
        <AppProvider>
          <AppShell>
            {children}
          </AppShell>
          <Toaster />
        </AppProvider>
      </body>
    </html>
  );
}
