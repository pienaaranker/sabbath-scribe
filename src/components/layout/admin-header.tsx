import Link from 'next/link';
import { CalendarCheck, LayoutDashboard, Users, CalendarDays, Home } from 'lucide-react';
import { APP_NAME } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export default function AdminHeader() {
  return (
    <header className="bg-card text-card-foreground shadow-md border-b">
      <div className="container mx-auto px-4 py-3 flex flex-col sm:flex-row justify-between items-center">
        <div className="flex items-center gap-2 text-xl font-semibold text-primary mb-2 sm:mb-0">
          <CalendarCheck className="h-7 w-7" />
          <span>{APP_NAME} - Admin</span>
        </div>
        <nav className="flex items-center gap-1 sm:gap-2 flex-wrap justify-center">
          <Button variant="ghost" asChild>
            <Link href="/admin"><LayoutDashboard className="mr-1 h-4 w-4" />Dashboard</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/admin/people"><Users className="mr-1 h-4 w-4" />People</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/admin/assignments"><CalendarDays className="mr-1 h-4 w-4" />Assignments</Link>
          </Button>
          <Separator orientation="vertical" className="h-6 mx-1 hidden sm:block" />
          <Button variant="outline" asChild>
            <Link href="/"><Home className="mr-1 h-4 w-4" />Main Site</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
