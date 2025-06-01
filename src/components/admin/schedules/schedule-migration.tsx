"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useFirestore } from '@/context/firestore-context';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import type { ServiceDayConfig } from '@/types';

export default function ScheduleMigration() {
  const { schedules, updateSchedule } = useFirestore();
  const { toast } = useToast();
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationResults, setMigrationResults] = useState<{
    success: string[];
    failed: string[];
  } | null>(null);

  // Find schedules that need migration (missing serviceDayConfig)
  const schedulesNeedingMigration = schedules.filter(
    schedule => !schedule.serviceDayConfig
  );

  const handleMigration = async () => {
    if (schedulesNeedingMigration.length === 0) {
      toast({
        title: "No Migration Needed",
        description: "All schedules already have service day configuration.",
      });
      return;
    }

    setIsMigrating(true);
    const results = { success: [], failed: [] };

    for (const schedule of schedulesNeedingMigration) {
      try {
        // Default to Saturday (backward compatibility)
        const defaultServiceDayConfig: ServiceDayConfig = {
          primaryDay: 6, // Saturday
          additionalDays: [],
          allowCustomDates: false
        };

        await updateSchedule(schedule.id, {
          serviceDayConfig: defaultServiceDayConfig
        });

        results.success.push(schedule.name);
      } catch (error) {
        console.error(`Failed to migrate schedule ${schedule.name}:`, error);
        results.failed.push(schedule.name);
      }
    }

    setMigrationResults(results);
    setIsMigrating(false);

    if (results.success.length > 0) {
      toast({
        title: "Migration Completed",
        description: `Successfully migrated ${results.success.length} schedule(s).`,
      });
    }

    if (results.failed.length > 0) {
      toast({
        title: "Migration Partially Failed",
        description: `Failed to migrate ${results.failed.length} schedule(s).`,
        variant: "destructive",
      });
    }
  };

  if (schedulesNeedingMigration.length === 0 && !migrationResults) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Migration Complete
          </CardTitle>
          <CardDescription>
            All schedules have been updated with service day configuration.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          Schedule Migration Required
        </CardTitle>
        <CardDescription>
          Some schedules need to be updated with service day configuration for the new multi-service day feature.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {schedulesNeedingMigration.length > 0 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>{schedulesNeedingMigration.length} schedule(s)</strong> need migration:
              <ul className="mt-2 list-disc list-inside">
                {schedulesNeedingMigration.map(schedule => (
                  <li key={schedule.id}>{schedule.name}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            This migration will add default service day configuration (Saturday) to existing schedules. 
            You can change the service day settings later in each schedule's settings.
          </p>
          
          <Button 
            onClick={handleMigration}
            disabled={isMigrating || schedulesNeedingMigration.length === 0}
            className="w-full"
          >
            {isMigrating ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Migrating Schedules...
              </>
            ) : (
              `Migrate ${schedulesNeedingMigration.length} Schedule(s)`
            )}
          </Button>
        </div>

        {migrationResults && (
          <div className="space-y-2">
            {migrationResults.success.length > 0 && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Successfully migrated:</strong>
                  <ul className="mt-1 list-disc list-inside">
                    {migrationResults.success.map(name => (
                      <li key={name}>{name}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {migrationResults.failed.length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Failed to migrate:</strong>
                  <ul className="mt-1 list-disc list-inside">
                    {migrationResults.failed.map(name => (
                      <li key={name}>{name}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
