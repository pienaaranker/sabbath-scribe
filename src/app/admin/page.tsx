import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Users, CalendarDays, ListChecks } from "lucide-react";
import Image from "next/image";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">Admin Dashboard</CardTitle>
          <CardDescription>Manage SabbathScribe resources and assignments.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <DashboardActionCard
            title="Manage People"
            description="Add, edit, or remove individuals who can be assigned to roles."
            icon={<Users className="h-8 w-8 text-primary" />}
            link="/admin/people"
            actionText="Go to People"
            imageSrc="https://placehold.co/600x400.png"
            imageAlt="People management"
            dataAiHint="community group"
          />
          <DashboardActionCard
            title="Manage Assignments"
            description="Assign roles for specific Sabbaths and view upcoming schedules."
            icon={<CalendarDays className="h-8 w-8 text-primary" />}
            link="/admin/assignments"
            actionText="Go to Assignments"
            imageSrc="https://placehold.co/600x400.png"
            imageAlt="Assignment management"
            dataAiHint="calendar schedule"
          />
           <DashboardActionCard
            title="AI Suggested Assignments"
            description="Use AI to get suggestions for role assignments based on availability."
            icon={<ListChecks className="h-8 w-8 text-primary" />}
            link="/admin/assignments#suggest" 
            actionText="Suggest Assignments"
            imageSrc="https://placehold.co/600x400.png"
            imageAlt="AI suggestions"
            dataAiHint="artificial intelligence brain"
          />
        </CardContent>
      </Card>
    </div>
  );
}

interface DashboardActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
  actionText: string;
  imageSrc: string;
  imageAlt: string;
  dataAiHint: string;
}

function DashboardActionCard({ title, description, icon, link, actionText, imageSrc, imageAlt, dataAiHint }: DashboardActionCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden shadow-md hover:shadow-xl transition-shadow">
      <div className="relative w-full h-40">
        <Image src={imageSrc} alt={imageAlt} layout="fill" objectFit="cover" data-ai-hint={dataAiHint} />
      </div>
      <CardHeader className="flex-grow">
        <div className="flex items-center gap-3 mb-2">
          {icon}
          <CardTitle className="text-xl">{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild className="w-full" variant="secondary">
          <Link href={link}>{actionText}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
