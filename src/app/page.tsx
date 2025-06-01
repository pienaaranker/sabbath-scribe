import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-primary/5 to-white">
      {/* Hero Section */}
      <section className="container py-12 sm:py-16 md:py-20 flex flex-col items-center text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent px-4">
          Sabbath Scribe
        </h1>
        <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-2xl mb-6 sm:mb-8 px-4">
          Effortlessly manage your church's Sabbath schedules, assignments, and roles. Empower your team, reduce confusion, and keep everyone in sync—online and on time.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8 sm:mb-10 w-full max-w-md sm:max-w-none px-4">
          <Button asChild size="lg" className="gradient-bg text-white border-0 hover:opacity-90 w-full sm:w-auto">
            <Link href="/auth">Get Started</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
            <Link href="/schedule">View Demo Schedule</Link>
          </Button>
        </div>
        {/* Hero Image - Responsive */}
        <div className="w-full max-w-4xl mx-auto px-4">
          <div className="relative w-full aspect-video sm:aspect-[16/10] md:aspect-[16/9] overflow-hidden rounded-lg sm:rounded-xl shadow-xl border">
            <Image
              src="/sabbath-hero.jpeg"
              alt="Sabbath Scribe screenshot"
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
      <section className="container py-12 sm:py-16">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-8 sm:mb-10 px-4">Why Sabbath Scribe?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 px-4">
          <div className="feature-card p-4 sm:p-6 rounded-xl shadow text-center">
            <h3 className="text-lg sm:text-xl font-semibold mb-3">Easy Assignment Management</h3>
            <p className="text-sm sm:text-base text-muted-foreground">Assign roles and responsibilities for each Sabbath with just a few clicks. No more spreadsheets or last-minute confusion.</p>
          </div>
          <div className="feature-card p-4 sm:p-6 rounded-xl shadow text-center">
            <h3 className="text-lg sm:text-xl font-semibold mb-3">Collaborative & Accessible</h3>
            <p className="text-sm sm:text-base text-muted-foreground">Leaders and staff can view, update, and access schedules from anywhere, on any device.</p>
          </div>
          <div className="feature-card p-4 sm:p-6 rounded-xl shadow text-center sm:col-span-2 lg:col-span-1">
            <h3 className="text-lg sm:text-xl font-semibold mb-3">Public & Private Views</h3>
            <p className="text-sm sm:text-base text-muted-foreground">Share a public schedule with your congregation, while keeping admin tools private and secure.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
