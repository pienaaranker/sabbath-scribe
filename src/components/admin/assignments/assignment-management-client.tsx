"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useFirestore } from '@/context/firestore-context';
import type { Person, RoleId, Assignment, SabbathAssignment } from '@/types';
import { getNearestSaturday, getNextSabbath, getPreviousSabbath, formatDateForDb, formatDateForDisplay, parseDateFromDb } from '@/lib/date-utils';
import { ChevronLeft, ChevronRight, CalendarIcon, Users } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function AssignmentManagementClient() {
  const { people, getAssignmentsForDate, getPersonById, addAssignment, updateAssignment, deleteAssignment, loading, error, roles } = useFirestore();
  const [selectedDate, setSelectedDate] = useState<Date>(() => getNearestSaturday(new Date()));
  const { toast } = useToast();

  const formattedDate = useMemo(() => formatDateForDb(selectedDate), [selectedDate]);

  const sabbathAssignmentsMap = useMemo(() => {
    const assignmentsForDate = getAssignmentsForDate(formattedDate);
    const map = new Map<RoleId, Person | null>();
    roles.forEach(role => {
      const assignment = assignmentsForDate.find(a => a.roleId === role.id);
      const person = assignment?.personId ? getPersonById(assignment.personId) : null;
      map.set(role.id as RoleId, person || null);
    });
    return map;
  }, [formattedDate, getAssignmentsForDate, getPersonById, roles]);

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(getNearestSaturday(date));
    }
  };

  const handleAssignmentChange = async (roleId: RoleId, personId: string | null) => {
    try {
      const existingAssignments = getAssignmentsForDate(formattedDate);
      const existingAssignment = existingAssignments.find(a => a.roleId === roleId);

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
            date: formattedDate,
            roleId: roleId,
            personId
          });
        }
      }

      const roleName = roles.find(r => r.id === roleId)?.name || 'Role';
      toast({
        title: "Assignment Updated",
        description: `${roleName} assignment has been updated for ${formatDateForDisplay(formattedDate)}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update assignment. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash === "#suggest") {
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

  if (people.length === 0 || roles.length === 0) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4">Cannot Assign Staff</h2>
        <p className="text-muted-foreground mb-6">
          You need to add both <span className="font-semibold">people</span> and <span className="font-semibold">roles</span> before you can assign staff to roles.
        </p>
        <div className="flex justify-center gap-4">
          <Button onClick={() => window.location.href = '/admin/people'} variant="outline">Add People</Button>
          <Button onClick={() => window.location.href = '/admin/roles'} variant="outline">Add Roles</Button>
        </div>
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
                    disabled={(date) => date.getDay() !== 6}
                  />
                </PopoverContent>
              </Popover>
              <Button variant="outline" size="icon" onClick={() => setSelectedDate(getNextSabbath(selectedDate))} aria-label="Next Sabbath">
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role</TableHead>
                <TableHead>Assignee</TableHead>
                <TableHead className="w-[100px]">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role) => {
                const assignedPerson = sabbathAssignmentsMap.get(role.id as RoleId);
                const isUnassigned = !assignedPerson;
                
                // Filter people who can fill this role
                const assignablePeople = people.filter(p => 
                  !p.fillableRoleIds || p.fillableRoleIds.length === 0 || p.fillableRoleIds.includes(role.id)
                );

                return (
                  <TableRow key={role.id}>
                    <TableCell className="font-medium">{role.name}</TableCell>
                    <TableCell>
                      <Select
                        value={assignedPerson?.id || ""}
                        onValueChange={(value) => handleAssignmentChange(role.id as RoleId, value === "unassign" ? null : value)}
                      >
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder="Select a person" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unassign">-- Unassign --</SelectItem>
                          {assignablePeople.map((person) => (
                            <SelectItem key={person.id} value={person.id}>
                              {person.name}
                            </SelectItem>
                          ))}
                          {assignablePeople.length === 0 && (
                            <p className="p-2 text-sm text-muted-foreground">No people available for this role.</p>
                          )}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isUnassigned ? 'bg-destructive/10 text-destructive' : 'bg-green-100 text-green-800'}`}>
                        {isUnassigned ? 'Unassigned' : 'Assigned'}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
