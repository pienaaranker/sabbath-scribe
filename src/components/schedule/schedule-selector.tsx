"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { PlusCircle, Settings } from "lucide-react";
import { useFirestore } from '@/context/firestore-context';
import { useAuth } from '@/context/auth-context';
import { Schedule } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function ScheduleSelector() {
  const { 
    schedules, 
    currentSchedule, 
    setCurrentSchedule, 
    addSchedule 
  } = useFirestore();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newScheduleName, setNewScheduleName] = useState('');
  const [newScheduleDescription, setNewScheduleDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  if (!user) {
    return null;
  }
  
  const handleScheduleChange = (scheduleId: string) => {
    const schedule = schedules.find(s => s.id === scheduleId);
    if (schedule) {
      setCurrentSchedule(schedule);
    }
  };
  
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
        adminUserIds: [],
      });
      
      toast({
        title: "Schedule Created",
        description: "Your new schedule has been created successfully.",
      });
      
      setNewScheduleName('');
      setNewScheduleDescription('');
      setIsCreateDialogOpen(false);
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

  return (
    <div className="flex items-center gap-2">
      <Select 
        value={currentSchedule?.id} 
        onValueChange={handleScheduleChange}
        disabled={schedules.length === 0}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Select a schedule" />
        </SelectTrigger>
        <SelectContent>
          {schedules.map((schedule) => (
            <SelectItem key={schedule.id} value={schedule.id}>
              {schedule.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" title="Create new schedule">
            <PlusCircle className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Schedule</DialogTitle>
            <DialogDescription>
              Create a new schedule to manage assignments and people.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="schedule-name">Schedule Name</Label>
              <Input
                id="schedule-name"
                placeholder="Weekly Service Schedule"
                value={newScheduleName}
                onChange={(e) => setNewScheduleName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="schedule-description">Description (Optional)</Label>
              <Textarea
                id="schedule-description"
                placeholder="Schedule for our weekly Sabbath services"
                value={newScheduleDescription}
                onChange={(e) => setNewScheduleDescription(e.target.value)}
              />
            </div>
            <div className="flex justify-end">
              <Button 
                onClick={handleCreateSchedule} 
                disabled={!newScheduleName.trim() || isCreating}
                className="gradient-bg text-white border-0 hover:opacity-90"
              >
                {isCreating ? 'Creating...' : 'Create Schedule'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {currentSchedule && (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" title="Schedule settings">
              <Settings className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <div className="p-2">
              <h4 className="font-medium text-sm mb-2">{currentSchedule.name}</h4>
              {currentSchedule.description && (
                <p className="text-xs text-muted-foreground mb-3">{currentSchedule.description}</p>
              )}
              <div className="text-xs text-muted-foreground">
                {currentSchedule.ownerId === user.uid ? 'You are the owner' : 'You are an admin'}
              </div>
              <div className="mt-3 pt-3 border-t border-border">
                <Button variant="ghost" size="sm" className="w-full justify-start text-sm" asChild>
                  <a href={`/admin/schedules/${currentSchedule.id}`}>Manage Schedule</a>
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
} 