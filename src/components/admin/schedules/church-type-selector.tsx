"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { ServiceDayConfig } from '@/types';
import { getServiceDayName } from '@/lib/date-utils';
import { Church, Calendar, Star, Users } from 'lucide-react';

interface ChurchType {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  serviceDayConfig: ServiceDayConfig;
}

const CHURCH_TYPES: ChurchType[] = [
  {
    id: 'sunday-traditional',
    name: 'Traditional Sunday Church',
    description: 'Most Protestant churches, Catholic churches',
    icon: <Church className="h-5 w-5" />,
    serviceDayConfig: {
      primaryDay: 0, // Sunday
      additionalDays: [],
      allowCustomDates: false
    }
  },
  {
    id: 'sabbath-adventist',
    name: 'Sabbath-Keeping Church',
    description: 'Seventh-day Adventist, Seventh Day Baptist',
    icon: <Star className="h-5 w-5" />,
    serviceDayConfig: {
      primaryDay: 6, // Saturday
      additionalDays: [],
      allowCustomDates: false
    }
  },
  {
    id: 'multi-service',
    name: 'Multi-Service Church',
    description: 'Sunday worship + midweek services',
    icon: <Calendar className="h-5 w-5" />,
    serviceDayConfig: {
      primaryDay: 0, // Sunday
      additionalDays: [3], // Wednesday
      allowCustomDates: true
    }
  },
  {
    id: 'orthodox-church',
    name: 'Orthodox Church',
    description: 'Eastern Orthodox, Russian Orthodox churches',
    icon: <Church className="h-5 w-5" />,
    serviceDayConfig: {
      primaryDay: 0, // Sunday
      additionalDays: [],
      allowCustomDates: true
    }
  },
  {
    id: 'flexible-christian',
    name: 'Flexible Christian Community',
    description: 'Non-denominational with flexible scheduling',
    icon: <Users className="h-5 w-5" />,
    serviceDayConfig: {
      primaryDay: 0, // Sunday
      additionalDays: [],
      allowCustomDates: true
    }
  },
  {
    id: 'custom',
    name: 'Custom Configuration',
    description: 'Set up your own service day pattern',
    icon: <Calendar className="h-5 w-5" />,
    serviceDayConfig: {
      primaryDay: 0, // Default to Sunday
      additionalDays: [],
      allowCustomDates: false
    }
  }
];

interface ChurchTypeSelectorProps {
  onSelect: (config: ServiceDayConfig) => void;
  selectedConfig?: ServiceDayConfig;
}

export default function ChurchTypeSelector({ onSelect, selectedConfig }: ChurchTypeSelectorProps) {
  const isConfigSelected = (churchType: ChurchType): boolean => {
    if (!selectedConfig) return false;
    
    const config = churchType.serviceDayConfig;
    return (
      selectedConfig.primaryDay === config.primaryDay &&
      JSON.stringify(selectedConfig.additionalDays?.sort()) === JSON.stringify(config.additionalDays?.sort()) &&
      selectedConfig.allowCustomDates === config.allowCustomDates
    );
  };

  const getConfigPreview = (config: ServiceDayConfig): string => {
    let preview = getServiceDayName(config.primaryDay);
    
    if (config.additionalDays && config.additionalDays.length > 0) {
      preview += ` + ${config.additionalDays.map(getServiceDayName).join(', ')}`;
    }
    
    if (config.allowCustomDates) {
      preview += ' + Custom dates';
    }
    
    return preview;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Choose Your Church Type</CardTitle>
        <CardDescription>
          Select a church type to automatically configure appropriate service days, or choose custom to set up your own pattern.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CHURCH_TYPES.map((churchType) => (
            <Card 
              key={churchType.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                isConfigSelected(churchType) 
                  ? 'ring-2 ring-primary bg-primary/5' 
                  : 'hover:bg-muted/50'
              }`}
              onClick={() => onSelect(churchType.serviceDayConfig)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 text-primary">
                    {churchType.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm">{churchType.name}</h4>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {churchType.description}
                    </p>
                    <div className="text-xs font-medium text-primary">
                      {getConfigPreview(churchType.serviceDayConfig)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-muted/50 rounded-md">
          <p className="text-sm text-muted-foreground">
            💡 <strong>Tip:</strong> You can always change your service day configuration later in the schedule settings.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
