"use client";
import React, { useEffect } from 'react';
import Header from './header';
import { usePathname } from 'next/navigation';
import AdminHeader from './admin-header';

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith('/admin');
  const isHomepage = pathname === '/';
  const isAuthPage = pathname === '/auth';

  useEffect(() => {
    if (isHomepage) {
      // Add smooth scrolling animation for cards
      const cards = document.querySelectorAll('.feature-card');

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              (entry.target as HTMLElement).style.opacity = '1';
              (entry.target as HTMLElement).style.transform = 'translateY(0)';
            }, index * 100);
          }
        });
      });

      cards.forEach(card => {
        (card as HTMLElement).style.opacity = '0';
        (card as HTMLElement).style.transform = 'translateY(30px)';
        (card as HTMLElement).style.transition = 'all 0.6s ease';
        observer.observe(card);
      });

      return () => observer.disconnect();
    }
  }, [isHomepage]);

  return (
    <div className="min-h-screen flex flex-col">
      {!isAuthPage && (isAdminRoute ? <AdminHeader /> : <Header />)}

      <main className={isHomepage || isAuthPage ? '' : 'flex-grow bg-background'}>
        <div className={isHomepage || isAuthPage ? '' : 'container mx-auto px-4 py-6 sm:py-8'}>
          {children}
        </div>
      </main>

      {!isHomepage && !isAuthPage && (
        <footer className="py-4 sm:py-6 text-center text-xs sm:text-sm text-muted-foreground bg-background border-t border-border">
          <div className="space-y-1">
            <div>© {new Date().getFullYear()} InService. All rights reserved.</div>
            <div>
              Built by{' '}
              <a
                href="https://www.ankerstudios.co.za/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-secondary transition-colors underline"
              >
                Anker Studios
              </a>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
