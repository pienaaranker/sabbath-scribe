"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Settings, Save, AlertTriangle, Info, Calendar, Users, Clock, Copy } from 'lucide-react';
import type { Schedule, ServiceDayConfig, PrivacySettings } from '@/types';
import ServiceDayConfigComponent from './service-day-config';
import { getServiceDayName } from '@/lib/date-utils';

interface AdvancedScheduleSettingsProps {
  schedule: Schedule;
  onSave: (updates: Partial<Schedule>) => Promise<void>;
  isOwner: boolean;
}

export default function AdvancedScheduleSettings({ schedule, onSave, isOwner }: AdvancedScheduleSettingsProps) {
  const [name, setName] = useState(schedule.name);
  const [description, setDescription] = useState(schedule.description || '');
  const [serviceDayConfig, setServiceDayConfig] = useState<ServiceDayConfig>(
    schedule.serviceDayConfig || {
      primaryDay: 6,
      additionalDays: [],
      allowCustomDates: false
    }
  );
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>(
    schedule.privacySettings || {
      isPublic: false,
      allowGuestViewing: false,
      requireApproval: true,
      publicViewingEnabled: false
    }
  );
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const getPublicUrl = () => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/schedule/${schedule.id}`;
    }
    return `[domain]/schedule/${schedule.id}`;
  };

  const copyPublicUrl = async () => {
    try {
      await navigator.clipboard.writeText(getPublicUrl());
      toast({
        title: "Link Copied",
        description: "Public schedule link has been copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy link. Please copy it manually.",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast({
        title: "Validation Error",
        description: "Schedule name is required.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSaving(true);
      
      await onSave({
        name: name.trim(),
        description: description.trim() || undefined,
        serviceDayConfig,
        privacySettings,
      });

      toast({
        title: "Settings Saved",
        description: "Schedule settings have been updated successfully.",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = () => {
    const currentPrivacySettings = schedule.privacySettings || {
      isPublic: false,
      allowGuestViewing: false,
      requireApproval: true,
      publicViewingEnabled: false
    };

    return (
      name !== schedule.name ||
      description !== (schedule.description || '') ||
      JSON.stringify(serviceDayConfig) !== JSON.stringify(schedule.serviceDayConfig) ||
      JSON.stringify(privacySettings) !== JSON.stringify(currentPrivacySettings)
    );
  };

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Basic Information
          </CardTitle>
          <CardDescription>
            Update your schedule's basic details and description.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="schedule-name">Schedule Name</Label>
            <Input
              id="schedule-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Weekly Service Schedule"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="schedule-description">Description (Optional)</Label>
            <Textarea
              id="schedule-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your schedule..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Service Day Configuration */}
      <ServiceDayConfigComponent 
        config={serviceDayConfig}
        onChange={setServiceDayConfig}
      />

      {/* Schedule Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Schedule Information
          </CardTitle>
          <CardDescription>
            Current schedule details and statistics.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Schedule ID</Label>
              <div className="text-sm text-muted-foreground font-mono bg-muted p-2 rounded">
                {schedule.id}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Created</Label>
              <div className="text-sm text-muted-foreground">
                {schedule.createdAt instanceof Date 
                  ? schedule.createdAt.toLocaleDateString()
                  : new Date(schedule.createdAt).toLocaleDateString()}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Last Updated</Label>
              <div className="text-sm text-muted-foreground">
                {schedule.updatedAt instanceof Date 
                  ? schedule.updatedAt.toLocaleDateString()
                  : new Date(schedule.updatedAt).toLocaleDateString()}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Owner</Label>
              <div className="text-sm text-muted-foreground">
                {isOwner ? 'You' : 'Another user'}
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label className="text-sm font-medium">Current Service Configuration</Label>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {getServiceDayName(serviceDayConfig.primaryDay)}
              </Badge>
              {serviceDayConfig.additionalDays && serviceDayConfig.additionalDays.length > 0 && (
                serviceDayConfig.additionalDays.map(day => (
                  <Badge key={day} variant="outline" className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {getServiceDayName(day)}
                  </Badge>
                ))
              )}
              {serviceDayConfig.allowCustomDates && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  Custom Dates
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy & Sharing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Privacy & Sharing
          </CardTitle>
          <CardDescription>
            Control who can view and access your schedule.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Public Schedule</Label>
              <div className="text-sm text-muted-foreground">
                Allow anyone with the link to view your schedule
              </div>
            </div>
            <Switch
              checked={privacySettings.isPublic}
              onCheckedChange={(checked) =>
                setPrivacySettings(prev => ({ ...prev, isPublic: checked }))
              }
              disabled={!isOwner}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Guest Viewing</Label>
              <div className="text-sm text-muted-foreground">
                Allow non-members to view assignments without signing in
              </div>
            </div>
            <Switch
              checked={privacySettings.allowGuestViewing}
              onCheckedChange={(checked) =>
                setPrivacySettings(prev => ({ ...prev, allowGuestViewing: checked }))
              }
              disabled={!isOwner}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Require Approval</Label>
              <div className="text-sm text-muted-foreground">
                New member requests require owner/admin approval
              </div>
            </div>
            <Switch
              checked={privacySettings.requireApproval}
              onCheckedChange={(checked) =>
                setPrivacySettings(prev => ({ ...prev, requireApproval: checked }))
              }
              disabled={!isOwner}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Public Viewing Page</Label>
              <div className="text-sm text-muted-foreground">
                Enable a dedicated public page for viewing the schedule
              </div>
            </div>
            <Switch
              checked={privacySettings.publicViewingEnabled}
              onCheckedChange={(checked) =>
                setPrivacySettings(prev => ({ ...prev, publicViewingEnabled: checked }))
              }
              disabled={!isOwner}
            />
          </div>

          {!isOwner && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Only the schedule owner can modify privacy and sharing settings.
              </AlertDescription>
            </Alert>
          )}

          {privacySettings.isPublic && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="space-y-3">
                <div>
                  <strong>Public Schedule:</strong> Anyone with the link can view this schedule.
                </div>
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-muted px-2 py-1 rounded flex-1 break-all">
                    {getPublicUrl()}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={copyPublicUrl}
                    className="h-7 px-2"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Save Changes */}
      {hasChanges() && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You have unsaved changes. Click "Save Changes" to apply your updates.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end">
        <Button 
          onClick={handleSave}
          disabled={!hasChanges() || isSaving}
          className="gradient-bg text-white border-0 hover:opacity-90"
        >
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}
