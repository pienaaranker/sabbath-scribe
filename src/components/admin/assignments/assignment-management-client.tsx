"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useFirestore } from '@/context/firestore-context';
import { ROLES_CONFIG, ROLE_NAMES_MAP } from '@/lib/constants';
import type { Person, RoleId, Assignment, SabbathAssignment } from '@/types';
import { getNearestSaturday, getNextSabbath, getPreviousSabbath, formatDateForDb, formatDateForDisplay, parseDateFromDb } from '@/lib/date-utils';
import { ChevronLeft, ChevronRight, CalendarIcon, Edit, Users, Clipboard } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import AssignPersonDialog from './assign-person-dialog';
import { useToast } from '@/hooks/use-toast';

export default function AssignmentManagementClient() {
  const { people, getAssignmentsForDate, getPersonById, addAssignment, updateAssignment, deleteAssignment, loading, error } = useFirestore();
  const [selectedDate, setSelectedDate] = useState<Date>(() => getNearestSaturday(new Date()));
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
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

  const handleAssignmentSave = async (personId: string | null) => {
    if (!currentAssignmentTarget) return;

    try {
      const existingAssignments = getAssignmentsForDate(currentAssignmentTarget.date);
      const existingAssignment = existingAssignments.find(a => a.roleId === currentAssignmentTarget.roleId);

      if (personId === null) {
        // Remove assignment
        if (existingAssignment) {
          await deleteAssignment(existingAssignment.id);
        }
      } else {
        if (existingAssignment) {
          // Update existing assignment
          await updateAssignment(existingAssignment.id, { personId });
        } else {
          // Create new assignment
          await addAssignment({
            date: currentAssignmentTarget.date,
            roleId: currentAssignmentTarget.roleId,
            personId
          });
        }
      }

      toast({
        title: "Assignment Updated",
        description: `${ROLE_NAMES_MAP[currentAssignmentTarget.roleId]} assignment has been updated for ${formatDateForDisplay(currentAssignmentTarget.date)}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update assignment. Please try again.",
        variant: "destructive",
      });
    }

    setIsAssignDialogOpen(false);
    setCurrentAssignmentTarget(null);
  };
  
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash === "#suggest") {
      // Optionally remove the hash
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }, []);


  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading assignment data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-destructive mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="mb-6">
          <h2 className="section-title">Date Selection</h2>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
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
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ROLES_CONFIG.map((role) => {
            const assignedPerson = sabbathAssignmentsMap.get(role.id);
            const isUnassigned = !assignedPerson;
            const cardClass = isUnassigned ? "bg-card border-destructive/30" : "feature-card";
            
            return (
              <div key={role.id} className={cardClass}>
                <div className="feature-icon">
                  <Clipboard className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold text-primary truncate mb-2">{role.name}</h3>
                {assignedPerson ? (
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm text-secondary-foreground font-medium">{assignedPerson.name}</p>
                  </div>
                ) : (
                  <p className="text-sm text-destructive font-semibold mb-4">Not Assigned</p>
                )}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => openAssignDialog(role.id)}
                  className="w-full"
                >
                  <Edit className="mr-2 h-3 w-3" /> {assignedPerson ? 'Change' : 'Assign'}
                </Button>
              </div>
            );
          })}
        </div>
      </div>

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
    </div>
  );
}
