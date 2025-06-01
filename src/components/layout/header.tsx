"use client";

import Link from 'next/link';
import Image from 'next/image';
import { LogIn, UserCog } from 'lucide-react';
import { APP_NAME } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';

export default function Header() {
  const { user } = useAuth();

  return (
    <header className="absolute top-0 left-0 right-0 z-20 text-primary-foreground">
      <div className="container mx-auto px-4 py-3 sm:py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 text-lg sm:text-xl font-serif font-bold hover:opacity-90 transition-opacity">
          <Image
            src="/logo.png"
            alt="InService Logo"
            width={28}
            height={28}
            className="h-6 w-6 sm:h-7 sm:w-7 object-contain"
          />
          <span className="hidden xs:inline sm:inline">{APP_NAME}</span>
          <span className="xs:hidden sm:hidden">IS</span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2 md:gap-4">
          <Button variant="ghost" asChild className="text-xs sm:text-sm md:text-base hover:bg-white/10 text-primary-foreground px-2 sm:px-3 md:px-4">
            <Link href="/">
              <span className="hidden sm:inline">Schedule</span>
              <span className="sm:hidden">Sched</span>
            </Link>
          </Button>
          {user ? (
            <Button asChild className="text-xs sm:text-sm md:text-base bg-accent hover:bg-accent/90 text-accent-foreground font-medium px-2 sm:px-3 md:px-4 rounded-lg transition-all">
              <Link href="/admin">
                <UserCog className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                <span className="hidden sm:inline">Admin Panel</span>
                <span className="sm:hidden">Admin</span>
              </Link>
            </Button>
          ) : (
            <Button asChild className="text-xs sm:text-sm md:text-base bg-white border-2 border-white text-primary hover:bg-primary hover:text-white font-medium px-2 sm:px-3 md:px-4 rounded-lg transition-all">
              <Link href="/auth">
                <LogIn className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                <span className="hidden sm:inline">Sign In</span>
                <span className="sm:hidden">Login</span>
              </Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
