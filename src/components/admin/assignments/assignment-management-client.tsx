"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAppContext } from '@/context/app-context';
import { ROLES_CONFIG, ROLE_NAMES_MAP } from '@/lib/constants';
import type { Person, RoleId, Assignment, SabbathAssignment } from '@/types';
import { getNearestSaturday, getNextSabbath, getPreviousSabbath, formatDateForDb, formatDateForDisplay, parseDateFromDb } from '@/lib/date-utils';
import { ChevronLeft, ChevronRight, CalendarIcon, Edit, Users, ListChecks } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import AssignPersonDialog from './assign-person-dialog';
import SuggestAssignmentsDialog from './suggest-assignments-dialog'; // Import the new component
import { useToast } from '@/hooks/use-toast';

export default function AssignmentManagementClient() {
  const { people, assignments, getAssignmentsForDate, getPersonById, assignPersonToRole, isLoading } = useAppContext();
  const [selectedDate, setSelectedDate] = useState<Date>(() => getNearestSaturday(new Date()));
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isSuggestDialogOpen, setIsSuggestDialogOpen] = useState(false); // State for suggestion dialog
  const [currentAssignmentTarget, setCurrentAssignmentTarget] = useState<{ date: string; roleId: RoleId } | null>(null);
  const { toast } = useToast();

  const formattedDate = useMemo(() => formatDateForDb(selectedDate), [selectedDate]);

  const sabbathAssignmentsMap = useMemo(() => {
    const assignmentsForDate = getAssignmentsForDate(formattedDate);
    const map = new Map<RoleId, Person | null>();
    ROLES_CONFIG.forEach(role => {
      const assignment = assignmentsForDate.find(a => a.roleId === role.id);
      const person = assignment?.personId ? getPersonById(assignment.personId) : null;
      map.set(role.id, person || null);
    });
    return map;
  }, [formattedDate, getAssignmentsForDate, getPersonById]);

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(getNearestSaturday(date));
    }
  };

  const openAssignDialog = (roleId: RoleId) => {
    setCurrentAssignmentTarget({ date: formattedDate, roleId });
    setIsAssignDialogOpen(true);
  };

  const handleAssignmentSave = (personId: string | null) => {
    if (currentAssignmentTarget) {
      assignPersonToRole(currentAssignmentTarget.date, currentAssignmentTarget.roleId, personId);
      toast({
        title: "Assignment Updated",
        description: `${ROLE_NAMES_MAP[currentAssignmentTarget.roleId]} assignment has been updated for ${formatDateForDisplay(currentAssignmentTarget.date)}.`,
      });
    }
    setIsAssignDialogOpen(false);
    setCurrentAssignmentTarget(null);
  };
  
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash === "#suggest") {
      setIsSuggestDialogOpen(true);
      // Optionally remove the hash
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }, []);


  if (isLoading) {
    return <p>Loading assignment data...</p>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => setSelectedDate(getPreviousSabbath(selectedDate))} aria-label="Previous Sabbath">
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[260px] justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formatDateForDisplay(selectedDate)}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateChange}
                    initialFocus
                    disabled={(date) => date.getDay() !== 6} // Only allow Saturdays
                  />
                </PopoverContent>
              </Popover>
              <Button variant="outline" size="icon" onClick={() => setSelectedDate(getNextSabbath(selectedDate))} aria-label="Next Sabbath">
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
            <Button onClick={() => setIsSuggestDialogOpen(true)} variant="secondary">
              <ListChecks className="mr-2 h-4 w-4" /> Suggest Assignments (AI)
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {ROLES_CONFIG.map((role) => {
              const assignedPerson = sabbathAssignmentsMap.get(role.id);
              const isUnassigned = !assignedPerson;
              return (
                <Card key={role.id} className={`p-4 flex justify-between items-center ${isUnassigned ? "bg-muted/50 border-dashed" : ""}`}>
                  <div>
                    <p className="font-semibold text-primary">{role.name}</p>
                    {assignedPerson ? (
                      <p className="text-sm text-foreground flex items-center gap-1"><Users className="h-3 w-3 text-muted-foreground"/> {assignedPerson.name}</p>
                    ) : (
                      <p className="text-sm text-destructive">Not Assigned</p>
                    )}
                  </div>
                  <Button variant="outline" size="sm" onClick={() => openAssignDialog(role.id)}>
                    <Edit className="mr-2 h-3 w-3" /> {assignedPerson ? 'Change' : 'Assign'}
                  </Button>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {currentAssignmentTarget && (
        <AssignPersonDialog
          isOpen={isAssignDialogOpen}
          onClose={() => setIsAssignDialogOpen(false)}
          date={currentAssignmentTarget.date}
          roleId={currentAssignmentTarget.roleId}
          currentPersonId={sabbathAssignmentsMap.get(currentAssignmentTarget.roleId)?.id || null}
          onSave={handleAssignmentSave}
          people={people}
        />
      )}
      
      <SuggestAssignmentsDialog
        isOpen={isSuggestDialogOpen}
        onClose={() => setIsSuggestDialogOpen(false)}
        targetDate={formattedDate}
      />
    </div>
  );
}
