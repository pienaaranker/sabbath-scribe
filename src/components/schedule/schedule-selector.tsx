"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { PlusCircle, Settings, Link as LinkIcon } from "lucide-react";
import { useFirestore } from '@/context/firestore-context';
import { useAuth } from '@/context/auth-context';
import { Schedule, ServiceDayConfig } from '@/types';
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
import ServiceDayConfigComponent from '@/components/admin/schedules/service-day-config';
import ChurchTypeSelector from '@/components/admin/schedules/church-type-selector';

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
  const [serviceDayConfig, setServiceDayConfig] = useState<ServiceDayConfig>({
    primaryDay: 6, // Default to Saturday
    additionalDays: [],
    allowCustomDates: false
  });
  const [currentStep, setCurrentStep] = useState<'church-type' | 'details' | 'service-config'>('church-type');
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
        <SelectTrigger className="w-[200px] text-black">
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
                    placeholder="Schedule for our weekly services"
                    value={newScheduleDescription}
                    onChange={(e) => setNewScheduleDescription(e.target.value)}
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
                    className="gradient-bg text-white border-0 hover:opacity-90"
                  >
                    {isCreating ? 'Creating...' : 'Create Schedule'}
                  </Button>
                </div>
              </div>
            )}
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
                  <a href={`/admin/schedules`}>Manage Schedules</a>
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )}

      {/* Public Site and Copy Link Buttons */}
      {currentSchedule && (
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            title="View public site"
            asChild
            className="text-black"
          >
            <a
              href={`/schedule/${currentSchedule.id}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Public Site
            </a>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title="Copy public share link"
            onClick={async () => {
              const url = `${window.location.origin}/schedule/${currentSchedule.id}`;
              await navigator.clipboard.writeText(url);
              toast({
                title: "Link Copied!",
                description: "Public schedule link copied to clipboard.",
              });
            }}
          >
            <LinkIcon className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
} 