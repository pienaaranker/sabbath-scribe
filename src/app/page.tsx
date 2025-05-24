import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-primary/5 to-white">
      {/* Hero Section */}
      <section className="container py-20 flex flex-col items-center text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Sabbath Scribe
        </h1>
        <p className="text-lg md:text-2xl text-muted-foreground max-w-2xl mb-8">
          Effortlessly manage your church's Sabbath schedules, assignments, and roles. Empower your team, reduce confusion, and keep everyone in sync—online and on time.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
          <Button asChild size="lg" className="gradient-bg text-white border-0 hover:opacity-90">
            <Link href="/auth">Get Started</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/schedule">View Demo Schedule</Link>
          </Button>
        </div>
        {/* Hero Image with 10% top/bottom clip */}
        <div style={{ height: 360, width: 700, overflow: 'hidden', borderRadius: '1rem' }} className="mx-auto rounded-xl shadow-xl border">
          <Image 
            src="/sabbath-hero.jpeg" 
            alt="Sabbath Scribe screenshot" 
            width={700} 
            height={400} 
            style={{ objectFit: 'cover', objectPosition: 'center 55%' }}
            className="w-full h-full"
            priority
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">Why Sabbath Scribe?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="feature-card p-6 rounded-xl shadow text-center">
            <h3 className="text-xl font-semibold mb-2">Easy Assignment Management</h3>
            <p className="text-muted-foreground mb-2">Assign roles and responsibilities for each Sabbath with just a few clicks. No more spreadsheets or last-minute confusion.</p>
          </div>
          <div className="feature-card p-6 rounded-xl shadow text-center">
            <h3 className="text-xl font-semibold mb-2">Collaborative & Accessible</h3>
            <p className="text-muted-foreground mb-2">Leaders and staff can view, update, and access schedules from anywhere, on any device.</p>
          </div>
          <div className="feature-card p-6 rounded-xl shadow text-center">
            <h3 className="text-xl font-semibold mb-2">Public & Private Views</h3>
            <p className="text-muted-foreground mb-2">Share a public schedule with your congregation, while keeping admin tools private and secure.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
