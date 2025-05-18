import Link from 'next/link';
import { CalendarCheck, LogIn } from 'lucide-react';
import { APP_NAME } from '@/lib/constants';
import { Button } from '@/components/ui/button';

export default function Header() {
  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 text-xl font-semibold hover:opacity-90 transition-opacity">
          <CalendarCheck className="h-7 w-7" />
          <span>{APP_NAME}</span>
        </Link>
        <nav className="flex items-center gap-2 sm:gap-4">
          <Button variant="ghost" asChild className="text-sm sm:text-base hover:bg-primary-foreground/10">
            <Link href="/">Schedule</Link>
          </Button>
          <Button variant="secondary" asChild className="text-sm sm:text-base">
            <Link href="/admin">
              <LogIn className="mr-2 h-4 w-4 sm:h-5 sm:w-5" /> Admin Panel
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
