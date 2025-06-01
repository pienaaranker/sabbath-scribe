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
      <div className="container mx-auto px-4 py-3 sm:py-4">
        {/* Top row: Logo and user info */}
        <div className="flex justify-between items-center mb-3 sm:mb-4">
          <div className="flex items-center gap-2">
            <CalendarCheck className="h-6 w-6 sm:h-7 sm:w-7" />
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
              <span className="text-lg sm:text-xl font-semibold">
                <span className="hidden sm:inline">{APP_NAME} - Admin</span>
                <span className="sm:hidden">Admin</span>
              </span>
              {user && (
                <span className="text-xs sm:text-sm opacity-80">
                  ({user.displayName || user.email})
                </span>
              )}
            </div>
          </div>

          {/* Mobile logout button */}
          <Button
            onClick={handleLogout}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/10 sm:hidden"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>

        {/* Schedule selector */}
        <div className="mb-3 sm:mb-4">
          <div className="bg-white/10 p-2 rounded-md">
            <ScheduleSelector />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-1 md:gap-2">
          {/* Main navigation buttons */}
          <div className="flex flex-col sm:flex-row gap-1 sm:gap-1 md:gap-2 flex-1">
            <Button variant="ghost" asChild className="text-white hover:bg-white/10 justify-start sm:justify-center text-sm px-2 sm:px-3">
              <Link href="/admin/roles">
                <BookmarkIcon className="mr-2 h-4 w-4" />
                <span>Roles</span>
              </Link>
            </Button>
            <Button variant="ghost" asChild className="text-white hover:bg-white/10 justify-start sm:justify-center text-sm px-2 sm:px-3">
              <Link href="/admin/people">
                <Users className="mr-2 h-4 w-4" />
                <span>People</span>
              </Link>
            </Button>
            <Button variant="ghost" asChild className="text-white hover:bg-white/10 justify-start sm:justify-center text-sm px-2 sm:px-3">
              <Link href="/admin/assignments">
                <CalendarDays className="mr-2 h-4 w-4" />
                <span>Assignments</span>
              </Link>
            </Button>
          </div>

          {/* Separator and action buttons */}
          <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 sm:items-center">
            <Separator orientation="vertical" className="h-6 mx-1 hidden sm:block bg-white/20" />
            <Button asChild className="bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white justify-start sm:justify-center text-sm px-2 sm:px-3">
              <Link href="/admin">
                <Home className="mr-2 h-4 w-4" />
                <span>Dashboard</span>
              </Link>
            </Button>
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="text-white hover:bg-white/10 justify-start sm:justify-center text-sm px-2 sm:px-3 hidden sm:flex"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}
