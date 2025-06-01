import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-badge">Church Management Solution</div>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
            InService
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl max-w-3xl mx-auto mb-8 opacity-95">
            Effortlessly manage your church's Sabbath schedules, assignments, and roles. Empower your team, reduce confusion, and keep everyone in sync—online and on time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 w-full max-w-md sm:max-w-none mx-auto">
            <Button asChild size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-medium py-3 px-8 rounded-lg transition-all w-full sm:w-auto">
              <Link href="/auth">Get Started</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-white border-2 border-white text-primary hover:bg-primary hover:text-white font-medium py-3 px-8 rounded-lg transition-all w-full sm:w-auto">
              <Link href="/schedule">View Demo Schedule</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="main-content">
        {/* Hero Image Section */}
        <section className="container py-12 sm:py-16">
          <div className="w-full max-w-5xl mx-auto">
            <div className="relative w-full aspect-video overflow-hidden rounded-xl shadow-lg border border-border">
              <Image
                src="/sabbath-hero.jpeg"
                alt="InService church management interface"
                fill
                style={{ objectFit: 'cover', objectPosition: 'center 55%' }}
                className="w-full h-full"
                priority
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 80vw"
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="section">
          <div className="container">
            <h2 className="section-title">Why Choose InService?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="feature-card text-center">
                <div className="feature-icon mx-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <h3>Easy Assignment Management</h3>
                <p>Assign roles and responsibilities for each Sabbath with just a few clicks. No more spreadsheets or last-minute confusion.</p>
              </div>
              <div className="feature-card text-center">
                <div className="feature-icon mx-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3>Collaborative & Accessible</h3>
                <p>Leaders and staff can view, update, and access schedules from anywhere, on any device.</p>
              </div>
              <div className="feature-card text-center">
                <div className="feature-icon mx-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h3>Public & Private Views</h3>
                <p>Share a public schedule with your congregation, while keeping admin tools private and secure.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
