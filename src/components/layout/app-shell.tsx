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

      // Add dynamic floating elements
      const hero = document.querySelector('.hero');
      if (hero) {
        const interval = setInterval(() => {
          const element = document.createElement('div');
          element.className = 'floating-element';
          element.style.left = Math.random() * 100 + '%';
          element.style.top = Math.random() * 100 + '%';
          element.style.animationDelay = Math.random() * 2 + 's';
          hero.querySelector('.floating-elements')?.appendChild(element);

          setTimeout(() => element.remove(), 6000);
        }, 3000);

        return () => {
          clearInterval(interval);
          observer.disconnect();
        };
      }

      return () => observer.disconnect();
    }
  }, [isHomepage]);

  return (
    <div className="min-h-screen flex flex-col">
      {isAdminRoute ? <AdminHeader /> : <Header />}

      {isHomepage && (
        <div className="hero gradient-bg">
          <div className="floating-elements">
            <div className="floating-element" style={{top: '20%', left: '20%'}}></div>
            <div className="floating-element" style={{top: '60%', left: '80%', animationDelay: '2s'}}></div>
            <div className="floating-element" style={{top: '40%', left: '60%', animationDelay: '4s'}}></div>
          </div>
          <div className="container">
            <div className="hero-badge">Church Management Solution</div>
            <h1>SabbathScribe</h1>
            <p>Effortless Church Roster Management for Your Team</p>
          </div>
        </div>
      )}

      <main className={isHomepage ? 'main-content' : 'flex-grow bg-white'}>
        <div className={isHomepage ? '' : 'container mx-auto px-4 py-6 sm:py-8'}>
          {children}
        </div>
      </main>

      {!isHomepage && (
        <footer className="py-4 sm:py-6 text-center text-xs sm:text-sm text-muted-foreground bg-white">
          © {new Date().getFullYear()} SabbathScribe. All rights reserved.
        </footer>
      )}
    </div>
  );
}
