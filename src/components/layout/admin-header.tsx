"use client";

import Link from 'next/link';
import { CalendarCheck, LayoutDashboard, Users, CalendarDays, Home, LogOut, BookmarkIcon } from 'lucide-react';
import { APP_NAME } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import ScheduleSelector from '@/components/schedule/schedule-selector';

export default function AdminHeader() {
  const { user, logout } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <header className="gradient-bg text-white shadow-lg">
      <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center">
        <div className="flex items-center gap-2 text-xl font-semibold mb-3 sm:mb-0">
          <CalendarCheck className="h-7 w-7" />
          <span>{APP_NAME} - Admin</span>
          {user && (
            <span className="text-sm opacity-80 ml-2">
              ({user.displayName || user.email})
            </span>
          )}
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <div className="w-full sm:w-auto mb-3 sm:mb-0 bg-white/10 p-2 rounded-md">
            <ScheduleSelector />
          </div>
          <nav className="flex items-center gap-1 sm:gap-2 flex-wrap justify-center">
            <Button variant="ghost" asChild className="text-white hover:bg-white/10">
              <Link href="/admin/roles"><BookmarkIcon className="mr-1 h-4 w-4" />Roles</Link>
            </Button>
            <Button variant="ghost" asChild className="text-white hover:bg-white/10">
              <Link href="/admin/people"><Users className="mr-1 h-4 w-4" />People</Link>
            </Button>
            <Button variant="ghost" asChild className="text-white hover:bg-white/10">
              <Link href="/admin/assignments"><CalendarDays className="mr-1 h-4 w-4" />Assignments</Link>
            </Button>
            <Separator orientation="vertical" className="h-6 mx-1 hidden sm:block bg-white/20" />
            <Button asChild className="bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white">
              <Link href="/"><Home className="mr-1 h-4 w-4" />Main Site</Link>
            </Button>
            <Button 
              onClick={handleLogout}
              variant="ghost" 
              className="text-white hover:bg-white/10"
            >
              <LogOut className="mr-1 h-4 w-4" />Logout
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}
