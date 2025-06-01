"use client";

import { useFirestore } from "@/context/firestore-context";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Trash2, PlusCircle } from "lucide-react";
import Link from "next/link";
import { ServiceDayConfig } from "@/types";
import ServiceDayConfigComponent from "@/components/admin/schedules/service-day-config";
import ChurchTypeSelector from "@/components/admin/schedules/church-type-selector";
import ScheduleMigration from "@/components/admin/schedules/schedule-migration";
import { getServiceDayName } from "@/lib/date-utils";

export default function SchedulesManagementPage() {
  const { schedules, addSchedule, updateSchedule, deleteSchedule, loading, error } = useFirestore();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [newScheduleName, setNewScheduleName] = useState("");
  const [newScheduleDescription, setNewScheduleDescription] = useState("");
  const [serviceDayConfig, setServiceDayConfig] = useState<ServiceDayConfig>({
    primaryDay: 6, // Default to Saturday
    additionalDays: [],
    allowCustomDates: false
  });
  const [currentStep, setCurrentStep] = useState<'church-type' | 'details' | 'service-config'>('church-type');
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editScheduleId, setEditScheduleId] = useState<string | null>(null);
  const [editScheduleName, setEditScheduleName] = useState("");
  const [editScheduleDescription, setEditScheduleDescription] = useState("");
  const [editServiceDayConfig, setEditServiceDayConfig] = useState<ServiceDayConfig>({
    primaryDay: 6,
    additionalDays: [],
    allowCustomDates: false
  });

  const handleCreateSchedule = async () => {
    if (!newScheduleName.trim()) {
      toast({ title: "Error", description: "Schedule name is required", variant: "destructive" });
      return;
    }
    try {
      setIsCreating(true);
      await addSchedule({
        name: newScheduleName.trim(),
        description: newScheduleDescription.trim() || undefined,
        serviceDayConfig,
        adminUserIds: []
      });
      toast({ title: "Schedule Created", description: "Your new schedule has been created successfully." });
      setNewScheduleName("");
      setNewScheduleDescription("");
      setServiceDayConfig({
        primaryDay: 6,
        additionalDays: [],
        allowCustomDates: false
      });
      setCurrentStep('church-type');
      setDialogOpen(false);
    } catch (error) {
      toast({ title: "Error", description: "Failed to create schedule. Please try again.", variant: "destructive" });
    } finally {
      setIsCreating(false);
    }
  };

  const openEditDialog = (schedule: { id: string; name: string; description?: string; serviceDayConfig?: ServiceDayConfig }) => {
    setEditScheduleId(schedule.id);
    setEditScheduleName(schedule.name);
    setEditScheduleDescription(schedule.description || "");
    setEditServiceDayConfig(schedule.serviceDayConfig || {
      primaryDay: 6, // Default to Saturday if no config exists
      additionalDays: [],
      allowCustomDates: false
    });
    setEditDialogOpen(true);
  };

  const handleEditSchedule = async () => {
    if (!editScheduleId || !editScheduleName.trim()) {
      toast({ title: "Error", description: "Schedule name is required", variant: "destructive" });
      return;
    }
    try {
      setIsEditing(true);
      await updateSchedule(editScheduleId, {
        name: editScheduleName.trim(),
        description: editScheduleDescription.trim() || undefined,
        serviceDayConfig: editServiceDayConfig
      });
      toast({ title: "Schedule Updated", description: "Schedule updated successfully." });
      setEditDialogOpen(false);
    } catch (error) {
      toast({ title: "Error", description: "Failed to update schedule. Please try again.", variant: "destructive" });
    } finally {
      setIsEditing(false);
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    if (!confirm("Are you sure you want to delete this schedule? This cannot be undone.")) return;
    try {
      await deleteSchedule(id);
      toast({ title: "Schedule Deleted", description: "Schedule deleted successfully." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete schedule. Please try again.", variant: "destructive" });
    }
  };

  return (
    <div className="container max-w-3xl py-10">
      {/* Migration Component */}
      <div className="mb-8">
        <ScheduleMigration />
      </div>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Schedules</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-bg text-white border-0 hover:opacity-90">
              <PlusCircle className="mr-2 h-4 w-4" /> New Schedule
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Create New Schedule
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  Step {currentStep === 'church-type' ? '1' : currentStep === 'details' ? '2' : '3'} of 3
                </span>
              </DialogTitle>
              <DialogDescription>
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
                    <Label htmlFor="new-schedule-name">Schedule Name</Label>
                    <Input id="new-schedule-name" placeholder="Weekly Service Schedule" value={newScheduleName} onChange={e => setNewScheduleName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-schedule-description">Description (Optional)</Label>
                    <Textarea id="new-schedule-description" placeholder="Schedule for our weekly services" value={newScheduleDescription} onChange={e => setNewScheduleDescription(e.target.value)} />
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
                      className="gradient-bg text-white border-0 hover:opacity-90"
                    >
                      {isCreating ? "Creating..." : "Create Schedule"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {loading ? (
        <div className="text-center py-12 text-lg">Loading schedules...</div>
      ) : error ? (
        <div className="text-center py-12 text-destructive">{error}</div>
      ) : schedules.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">No schedules found. Create your first schedule above.</div>
      ) : (
        <div className="space-y-4">
          {schedules.map(schedule => (
            <Card key={schedule.id}>
              <CardHeader>
                <CardTitle>{schedule.name}</CardTitle>
                {schedule.description && <CardDescription>{schedule.description}</CardDescription>}
                {schedule.serviceDayConfig && (
                  <div className="text-sm text-muted-foreground mt-2">
                    <strong>Service Day:</strong> {getServiceDayName(schedule.serviceDayConfig.primaryDay)}
                    {schedule.serviceDayConfig.additionalDays && schedule.serviceDayConfig.additionalDays.length > 0 && (
                      <span> + {schedule.serviceDayConfig.additionalDays.map(getServiceDayName).join(', ')}</span>
                    )}
                    {schedule.serviceDayConfig.allowCustomDates && (
                      <span> (Custom dates allowed)</span>
                    )}
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" asChild>
                    <Link href={`/admin/schedules/${schedule.id}`}>View</Link>
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => openEditDialog(schedule)}><Pencil className="mr-1 h-4 w-4" />Edit</Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDeleteSchedule(schedule.id)}><Trash2 className="mr-1 h-4 w-4" />Delete</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Schedule</DialogTitle>
            <DialogDescription>Update the schedule details and service day configuration below.</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-schedule-name">Schedule Name</Label>
              <Input id="edit-schedule-name" value={editScheduleName} onChange={e => setEditScheduleName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-schedule-description">Description (Optional)</Label>
              <Textarea id="edit-schedule-description" value={editScheduleDescription} onChange={e => setEditScheduleDescription(e.target.value)} />
            </div>

            {/* Service Day Configuration */}
            <ServiceDayConfigComponent
              config={editServiceDayConfig}
              onChange={setEditServiceDayConfig}
            />
          </div>
          <DialogFooter>
            <Button onClick={handleEditSchedule} disabled={!editScheduleName.trim() || isEditing} className="gradient-bg text-white border-0 hover:opacity-90">
              {isEditing ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 