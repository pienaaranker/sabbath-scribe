"use client";

import Link from 'next/link';
import { CalendarCheck, LogIn, UserCog } from 'lucide-react';
import { APP_NAME } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';

export default function Header() {
  const { user } = useAuth();

  return (
    <header className="absolute top-0 left-0 right-0 z-20 text-white">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 text-xl font-semibold hover:opacity-90 transition-opacity">
          <CalendarCheck className="h-7 w-7" />
          <span>{APP_NAME}</span>
        </Link>
        <nav className="flex items-center gap-2 sm:gap-4">
          <Button variant="ghost" asChild className="text-sm sm:text-base hover:bg-white/10 text-white">
            <Link href="/">Schedule</Link>
          </Button>
          {user ? (
            <Button asChild className="text-sm sm:text-base bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white">
              <Link href="/admin">
                <UserCog className="mr-2 h-4 w-4 sm:h-5 sm:w-5" /> Admin Panel
              </Link>
            </Button>
          ) : (
            <Button asChild className="text-sm sm:text-base bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white">
              <Link href="/auth">
                <LogIn className="mr-2 h-4 w-4 sm:h-5 sm:w-5" /> Sign In
              </Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
