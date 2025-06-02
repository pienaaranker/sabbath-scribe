"use client";

import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { ServiceDay, ServiceDayConfig } from '@/types';
import { getServiceDayName } from '@/lib/date-utils';

interface ServiceDayConfigProps {
  config: ServiceDayConfig;
  onChange: (config: ServiceDayConfig) => void;
}

const SERVICE_DAYS: ServiceDay[] = [0, 1, 2, 3, 4, 5, 6];

export default function ServiceDayConfigComponent({ config, onChange }: ServiceDayConfigProps) {
  const handlePrimaryDayChange = (value: string) => {
    const primaryDay = parseInt(value) as ServiceDay;
    onChange({
      ...config,
      primaryDay,
      // Remove primary day from additional days if it exists there
      additionalDays: config.additionalDays?.filter(day => day !== primaryDay) || []
    });
  };

  const handleAdditionalDayToggle = (day: ServiceDay, checked: boolean) => {
    const additionalDays = config.additionalDays || [];
    
    if (checked) {
      // Add day if not already present and not the primary day
      if (!additionalDays.includes(day) && day !== config.primaryDay) {
        onChange({
          ...config,
          additionalDays: [...additionalDays, day].sort()
        });
      }
    } else {
      // Remove day
      onChange({
        ...config,
        additionalDays: additionalDays.filter(d => d !== day)
      });
    }
  };

  const handleCustomDatesToggle = (checked: boolean) => {
    onChange({
      ...config,
      allowCustomDates: checked
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Service Day Configuration</CardTitle>
        <CardDescription>
          Configure which days of the week your church holds services. This will determine which dates can be selected for scheduling assignments.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Primary Service Day */}
        <div className="space-y-2">
          <Label htmlFor="primary-day">Primary Service Day</Label>
          <Select value={config.primaryDay.toString()} onValueChange={handlePrimaryDayChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select primary service day" />
            </SelectTrigger>
            <SelectContent>
              {SERVICE_DAYS.map((day) => (
                <SelectItem key={day} value={day.toString()}>
                  {getServiceDayName(day)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            The main day your church holds services (e.g., Sunday for most churches, Saturday for Seventh-day Adventist)
          </p>
        </div>

        {/* Additional Service Days */}
        <div className="space-y-3">
          <Label>Additional Service Days (Optional)</Label>
          <div className="grid grid-cols-2 gap-3">
            {SERVICE_DAYS.filter(day => day !== config.primaryDay).map((day) => (
              <div key={day} className="flex items-center space-x-2">
                <Checkbox
                  id={`additional-${day}`}
                  checked={config.additionalDays?.includes(day) || false}
                  onCheckedChange={(checked) => handleAdditionalDayToggle(day, checked as boolean)}
                />
                <Label htmlFor={`additional-${day}`} className="text-sm cursor-pointer">
                  {getServiceDayName(day)}
                </Label>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Select any additional days your church holds services (e.g., Wednesday evening services)
          </p>
        </div>

        {/* Allow Custom Dates */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="allow-custom"
            checked={config.allowCustomDates || false}
            onCheckedChange={handleCustomDatesToggle}
          />
          <Label htmlFor="allow-custom" className="text-sm cursor-pointer">
            Allow scheduling on any date
          </Label>
        </div>
        <p className="text-sm text-muted-foreground">
          When enabled, assignments can be scheduled on any date (useful for special events, holidays, or irregular services)
        </p>

        {/* Preview */}
        <div className="mt-4 p-3 bg-muted rounded-md">
          <h4 className="text-sm font-medium mb-2">Configuration Summary:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Primary service day: <strong>{getServiceDayName(config.primaryDay)}</strong></li>
            {config.additionalDays && config.additionalDays.length > 0 && (
              <li>• Additional service days: <strong>{config.additionalDays.map(getServiceDayName).join(', ')}</strong></li>
            )}
            <li>• Custom dates: <strong>{config.allowCustomDates ? 'Allowed' : 'Not allowed'}</strong></li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
