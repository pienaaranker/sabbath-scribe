"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { useFirestore } from '@/context/firestore-context';
import { useAuth } from '@/context/auth-context';
import { Schedule, ScheduleMember, ServiceDayConfig } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPlus, Trash2, Mail, ExternalLink, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import ServiceDayConfigComponent from '@/components/admin/schedules/service-day-config';
import { getServiceDayName } from '@/lib/date-utils';

export default function ScheduleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const scheduleId = params.id as string;
  const { schedules, currentSchedule, hasScheduleAccess, addScheduleMember, removeScheduleMember, updateSchedule, deleteSchedule, scheduleMembers } = useFirestore();
  const { user } = useAuth();
  const { toast } = useToast();
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [serviceDayConfig, setServiceDayConfig] = useState<ServiceDayConfig>({
    primaryDay: 6,
    additionalDays: [],
    allowCustomDates: false
  });
  const [isEditing, setIsEditing] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'viewer'>('viewer');
  const [isInviting, setIsInviting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    // Check if user has access to this schedule
    if (user && !hasScheduleAccess(scheduleId)) {
      router.push('/admin');
      return;
    }

    // Find the schedule
    const foundSchedule = schedules.find(s => s.id === scheduleId);
    if (foundSchedule) {
      setSchedule(foundSchedule);
      setName(foundSchedule.name);
      setDescription(foundSchedule.description || '');
      setServiceDayConfig(foundSchedule.serviceDayConfig || {
        primaryDay: 6,
        additionalDays: [],
        allowCustomDates: false
      });
      setIsOwner(foundSchedule.ownerId === user?.uid);
    } else if (schedules.length > 0) {
      // Schedule not found, redirect
      router.push('/admin');
    }
  }, [scheduleId, schedules, user, hasScheduleAccess, router]);

  const handleSaveSettings = async () => {
    if (!schedule) return;
    
    try {
      setIsEditing(true);
      
      await updateSchedule(schedule.id, {
        name: name.trim(),
        description: description.trim() || undefined,
        serviceDayConfig
      });
      
      toast({
        title: "Schedule Updated",
        description: "Schedule settings have been updated successfully.",
      });
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating schedule:', error);
      toast({
        title: "Error",
        description: "Failed to update schedule. Please try again.",
        variant: "destructive",
      });
      setIsEditing(false);
    }
  };

  const handleDeleteSchedule = async () => {
    if (!schedule) return;
    
    try {
      setIsDeleting(true);
      
      await deleteSchedule(schedule.id);
      
      toast({
        title: "Schedule Deleted",
        description: "The schedule has been deleted successfully.",
      });
      
      router.push('/admin');
    } catch (error) {
      console.error('Error deleting schedule:', error);
      toast({
        title: "Error",
        description: "Failed to delete schedule. Please try again.",
        variant: "destructive",
      });
      setIsDeleting(false);
    }
  };

  const handleInviteUser = async () => {
    if (!schedule || !inviteEmail.trim()) return;
    
    try {
      setIsInviting(true);
      
      // In a real app, we would send an email invitation
      // For now, we'll just add the user directly if they exist
      
      // This is a simplified approach - in a real app, you would:
      // 1. Create a pending invitation in Firestore
      // 2. Send an email with a signup/accept link
      // 3. When the user accepts, add them as a member
      
      // For demo purposes, we'll generate a fake user ID based on email
      const fakeUserId = `user_${inviteEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;
      
      await addScheduleMember({
        userId: fakeUserId,
        email: inviteEmail.trim(),
        role: inviteRole,
      });
      
      toast({
        title: "Invitation Sent",
        description: `An invitation has been sent to ${inviteEmail}.`,
      });
      
      setInviteEmail('');
      setInviteRole('viewer');
      setIsInviting(false);
    } catch (error) {
      console.error('Error inviting user:', error);
      toast({
        title: "Error",
        description: "Failed to send invitation. Please try again.",
        variant: "destructive",
      });
      setIsInviting(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!schedule) return;
    
    try {
      await removeScheduleMember(userId);
      
      toast({
        title: "Member Removed",
        description: "The member has been removed from this schedule.",
      });
    } catch (error) {
      console.error('Error removing member:', error);
      toast({
        title: "Error",
        description: "Failed to remove member. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!schedule) {
    return (
      <div className="text-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading schedule...</p>
      </div>
    );
  }

  return (
    <div className="container space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" onClick={() => router.push('/admin')} className="h-8 w-8 p-0">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold">{schedule.name}</h2>
          {schedule.serviceDayConfig && (
            <div className="text-sm text-muted-foreground mt-1">
              <strong>Service Day:</strong> {getServiceDayName(schedule.serviceDayConfig.primaryDay)}
              {schedule.serviceDayConfig.additionalDays && schedule.serviceDayConfig.additionalDays.length > 0 && (
                <span> + {schedule.serviceDayConfig.additionalDays.map(getServiceDayName).join(', ')}</span>
              )}
              {schedule.serviceDayConfig.allowCustomDates && (
                <span> (Custom dates allowed)</span>
              )}
            </div>
          )}
        </div>
      </div>

      <Tabs defaultValue="members">
        <TabsList className="mb-4">
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="members" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Schedule Members</CardTitle>
              <CardDescription>
                Manage who has access to this schedule.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Added</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scheduleMembers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                        No members yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    scheduleMembers.map((member) => (
                      <TableRow key={member.userId}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{member.displayName || 'Unnamed User'}</div>
                            <div className="text-xs text-muted-foreground">{member.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                            {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {member.addedAt instanceof Date 
                            ? format(member.addedAt, 'MMM d, yyyy')
                            : typeof member.addedAt === 'string'
                              ? format(new Date(member.addedAt), 'MMM d, yyyy')
                              : 'Unknown'}
                        </TableCell>
                        <TableCell className="text-right">
                          {member.userId !== schedule.ownerId ? (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">Remove</span>
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Remove Member</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to remove this member from the schedule?
                                    They will no longer have access to this schedule.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleRemoveMember(member.userId)}>
                                    Remove
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          ) : (
                            <div className="text-xs text-muted-foreground px-2">Owner</div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="gradient-bg text-white border-0 hover:opacity-90">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite User
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Invite User</DialogTitle>
                    <DialogDescription>
                      Invite a user to access this schedule.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        placeholder="user@example.com"
                        type="email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Access Level</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          type="button"
                          variant={inviteRole === 'viewer' ? 'default' : 'outline'}
                          onClick={() => setInviteRole('viewer')}
                        >
                          Viewer
                        </Button>
                        <Button
                          type="button"
                          variant={inviteRole === 'admin' ? 'default' : 'outline'}
                          onClick={() => setInviteRole('admin')}
                        >
                          Admin
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        {inviteRole === 'admin'
                          ? 'Admins can manage assignments, people, and invite other users.'
                          : 'Viewers can only view the schedule, but cannot make changes.'}
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={handleInviteUser}
                      disabled={!inviteEmail.trim() || isInviting}
                      className="gradient-bg text-white border-0 hover:opacity-90"
                    >
                      {isInviting ? 'Sending...' : 'Send Invitation'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              <Button variant="outline">
                <Mail className="h-4 w-4 mr-2" />
                Copy Invite Link
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Schedule Settings</CardTitle>
              <CardDescription>
                Update your schedule settings and service day configuration.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="schedule-name">Schedule Name</Label>
                <Input
                  id="schedule-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="schedule-description">Description (Optional)</Label>
                <Textarea
                  id="schedule-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Service Day Configuration */}
              <ServiceDayConfigComponent
                config={serviceDayConfig}
                onChange={setServiceDayConfig}
              />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                onClick={handleSaveSettings}
                disabled={!name.trim() || isEditing}
                className="gradient-bg text-white border-0 hover:opacity-90"
              >
                {isEditing ? 'Saving...' : 'Save Changes'}
              </Button>
              
              {isOwner && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      Delete Schedule
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Schedule</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the schedule
                        and all its data, including people and assignments.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteSchedule}
                        className="bg-destructive hover:bg-destructive/90"
                        disabled={isDeleting}
                      >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 