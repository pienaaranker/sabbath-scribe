"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { useFirestore } from "@/context/firestore-context";
import { useAuth } from "@/context/auth-context";
import { Calendar, Users, PlusCircle, BookmarkIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { ServiceDayConfig } from '@/types';
import ServiceDayConfigComponent from '@/components/admin/schedules/service-day-config';
import ChurchTypeSelector from '@/components/admin/schedules/church-type-selector';

export default function AdminDashboardPage() {
  const { schedules, currentSchedule, addSchedule } = useFirestore();
  const { user } = useAuth();
  const { toast } = useToast();
  const [newScheduleName, setNewScheduleName] = useState('');
  const [newScheduleDescription, setNewScheduleDescription] = useState('');
  const [serviceDayConfig, setServiceDayConfig] = useState<ServiceDayConfig>({
    primaryDay: 6, // Default to Saturday
    additionalDays: [],
    allowCustomDates: false
  });
  const [currentStep, setCurrentStep] = useState<'church-type' | 'details' | 'service-config'>('church-type');
  const [isCreating, setIsCreating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCreateSchedule = async () => {
    if (!newScheduleName.trim()) {
      toast({
        title: "Error",
        description: "Schedule name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsCreating(true);

      await addSchedule({
        name: newScheduleName.trim(),
        description: newScheduleDescription.trim() || undefined,
        serviceDayConfig,
        adminUserIds: [],
      });

      toast({
        title: "Schedule Created",
        description: "Your new schedule has been created successfully.",
      });

      setNewScheduleName('');
      setNewScheduleDescription('');
      setServiceDayConfig({
        primaryDay: 6,
        additionalDays: [],
        allowCustomDates: false
      });
      setCurrentStep('church-type');
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error creating schedule:', error);
      toast({
        title: "Error",
        description: "Failed to create schedule. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  // Show a welcome screen if user has no schedules
  if (schedules.length === 0) {
    return (
      <div className="container max-w-4xl py-8 sm:py-12 px-4">
        <Card className="border-2 border-dashed border-border bg-card">
          <CardHeader className="text-center px-4 sm:px-6">
            <CardTitle className="font-serif text-xl sm:text-2xl text-secondary">Welcome to InService</CardTitle>
            <CardDescription className="text-sm sm:text-base text-muted-foreground">
              Get started by creating your first schedule
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center pb-6 px-4 sm:px-6">
            <div className="rounded-full bg-light p-4 sm:p-6 mb-4 sm:mb-6 border border-border">
              <Calendar className="h-8 w-8 sm:h-12 sm:w-12 text-primary" />
            </div>
            <p className="text-center text-muted-foreground mb-4 sm:mb-6 max-w-md text-sm sm:text-base">
              A schedule is where you'll manage your church's service assignments.
              You can create multiple schedules for different purposes or congregations.
            </p>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Your First Schedule
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="font-serif text-secondary">
                    Create Your First Schedule
                    <span className="text-sm font-normal text-muted-foreground ml-2">
                      Step {currentStep === 'church-type' ? '1' : currentStep === 'details' ? '2' : '3'} of 3
                    </span>
                  </DialogTitle>
                  <DialogDescription className="text-muted-foreground">
                    {currentStep === 'church-type' && "Choose your church type to get started with the right service day configuration."}
                    {currentStep === 'details' && "Enter your schedule details."}
                    {currentStep === 'service-config' && "Review and customize your service day configuration."}
                  </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                  {currentStep === 'church-type' && (
                    <ChurchTypeSelector
                      onSelect={(config) => {
                        setServiceDayConfig(config);
                        setCurrentStep('details');
                      }}
                      selectedConfig={serviceDayConfig}
                    />
                  )}

                  {currentStep === 'details' && (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="new-schedule-name" className="text-secondary font-medium">Schedule Name</Label>
                        <Input
                          id="new-schedule-name"
                          placeholder="Weekly Service Schedule"
                          value={newScheduleName}
                          onChange={(e) => setNewScheduleName(e.target.value)}
                          className="border-border focus:ring-primary focus:border-primary"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-schedule-description" className="text-secondary font-medium">Description (Optional)</Label>
                        <Textarea
                          id="new-schedule-description"
                          placeholder="Schedule for our weekly services"
                          value={newScheduleDescription}
                          onChange={(e) => setNewScheduleDescription(e.target.value)}
                          className="border-border focus:ring-primary focus:border-primary"
                        />
                      </div>

                      <div className="flex justify-between">
                        <Button
                          variant="outline"
                          onClick={() => setCurrentStep('church-type')}
                        >
                          Back
                        </Button>
                        <Button
                          onClick={() => setCurrentStep('service-config')}
                          disabled={!newScheduleName.trim()}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}

                  {currentStep === 'service-config' && (
                    <div className="space-y-6">
                      <ServiceDayConfigComponent
                        config={serviceDayConfig}
                        onChange={setServiceDayConfig}
                      />

                      <div className="flex justify-between">
                        <Button
                          variant="outline"
                          onClick={() => setCurrentStep('details')}
                        >
                          Back
                        </Button>
                        <Button
                          onClick={handleCreateSchedule}
                          disabled={!newScheduleName.trim() || isCreating}
                          className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                        >
                          {isCreating ? 'Creating...' : 'Create Schedule'}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Default view for users with schedules
  return (
    <div className="container px-4">
      <section className="section">
        <h2 className="section-title text-xl sm:text-2xl md:text-3xl">Admin Dashboard</h2>
        <p className="text-center text-muted-foreground mb-8 sm:mb-12 text-base sm:text-lg px-4">
          {currentSchedule ? `Managing "${currentSchedule.name}"` : 'Select a schedule to manage'}
        </p>

        {currentSchedule ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <DashboardActionCard
              title="Manage Roles"
              description="Create and customize roles that people can be assigned to."
              link="/admin/roles"
              actionText="Go to Roles"
              imageSrc="/roles.jpeg"
              imageAlt="Role management"
              dataAiHint="role badges"
            />
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
              description="Assign roles for specific services and view upcoming schedules."
              link="/admin/assignments"
              actionText="Go to Assignments"
              imageSrc="/clipboard.jpeg"
              imageAlt="Assignment management"
              dataAiHint="calendar schedule"
            />
          </div>
        ) : (
          <div className="text-center py-8 sm:py-12 px-4">
            <p className="text-muted-foreground mb-4 text-sm sm:text-base">Please select a schedule from the dropdown above to continue.</p>
          </div>
        )}
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
    <div className="feature-card overflow-hidden flex flex-col h-full bg-card border border-border">
      <div className="relative w-full h-32 sm:h-40">
        <Image src={imageSrc} alt={imageAlt} fill style={{ objectFit: 'cover' }} data-ai-hint={dataAiHint} />
      </div>
      <div className="p-4 sm:p-6 flex-grow">
        <h3 className="font-serif text-lg sm:text-xl font-semibold mb-2 text-secondary">{title}</h3>
        <p className="text-muted-foreground mb-4 sm:mb-6 text-sm sm:text-base">{description}</p>
      </div>
      <div className="px-4 sm:px-6 pb-4 sm:pb-6">
        <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium h-10 sm:h-11">
          <Link href={link}>{actionText}</Link>
        </Button>
      </div>
    </div>
  );
}
