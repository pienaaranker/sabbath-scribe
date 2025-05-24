import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

export default function AdminDashboardPage() {
  return (
    <div className="container">
      <section className="section">
        <h2 className="section-title">Admin Dashboard</h2>
        <p className="text-center text-muted-foreground mb-12 text-lg">
          Manage SabbathScribe resources and assignments.
        </p>
        
        <div className="features-grid">
          <DashboardActionCard
            title="Manage People"
            description="Add, edit, or remove individuals who can be assigned to roles."
            link="/admin/people"
            actionText="Go to People"
            imageSrc="/people.jpeg"
            imageAlt="People management"
            dataAiHint="community group"
          />
          <DashboardActionCard
            title="Manage Assignments"
            description="Assign roles for specific Sabbaths and view upcoming schedules."
            link="/admin/assignments"
            actionText="Go to Assignments"
            imageSrc="/clipboard.jpeg"
            imageAlt="Assignment management"
            dataAiHint="calendar schedule"
          />
        </div>
      </section>
    </div>
  );
}

interface DashboardActionCardProps {
  title: string;
  description: string;
  link: string;
  actionText: string;
  imageSrc: string;
  imageAlt: string;
  dataAiHint: string;
}

function DashboardActionCard({ title, description, link, actionText, imageSrc, imageAlt, dataAiHint }: DashboardActionCardProps) {
  return (
    <div className="feature-card overflow-hidden flex flex-col h-full">
      <div className="relative w-full h-40">
        <Image src={imageSrc} alt={imageAlt} layout="fill" objectFit="cover" data-ai-hint={dataAiHint} />
      </div>
      <div className="p-6 flex-grow">
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground mb-6">{description}</p>
      </div>
      <div className="px-6 pb-6">
        <Button asChild className="w-full gradient-bg text-white border-0 hover:opacity-90">
          <Link href={link}>{actionText}</Link>
        </Button>
      </div>
    </div>
  );
}
