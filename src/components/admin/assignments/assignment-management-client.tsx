"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';

import { useFirestore } from '@/context/firestore-context';
import type { Person, RoleId } from '@/types';
import { formatDateForDb, formatDateForDisplay, getNearestServiceDay, getServiceDayName } from '@/lib/date-utils';
import { Star } from 'lucide-react';

import { ServiceCalendar } from "@/components/ui/service-calendar";
import HolidaySelector from "./holiday-selector";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function AssignmentManagementClient() {
  const { people, getAssignmentsForDate, getPersonById, addAssignment, updateAssignment, deleteAssignment, loading, error, roles, currentSchedule } = useFirestore();

  // Use service day configuration from current schedule, fallback to Saturday
  const serviceDayConfig = currentSchedule?.serviceDayConfig || { primaryDay: 6, additionalDays: [], allowCustomDates: false };
  const [selectedDate, setSelectedDate] = useState<Date>(() =>
    getNearestServiceDay(new Date(), serviceDayConfig.primaryDay)
  );
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
      // If custom dates are allowed, use the date as-is, otherwise snap to nearest service day
      if (serviceDayConfig.allowCustomDates) {
        setSelectedDate(date);
      } else {
        setSelectedDate(getNearestServiceDay(date, serviceDayConfig.primaryDay));
      }
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
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 px-4">
      {/* Left: Assignments Table */}
      <div className="flex-1 bg-white rounded-xl shadow-lg p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center lg:text-left">
          Assignments for {formatDateForDisplay(selectedDate)}
        </h2>

        {/* Mobile Card View */}
        <div className="block sm:hidden space-y-4">
          {roles.map((role) => {
            const assignedPerson = sabbathAssignmentsMap.get(role.id as RoleId);
            const isUnassigned = !assignedPerson;
            const assignablePeople = people.filter(p =>
              !p.fillableRoleIds || p.fillableRoleIds.length === 0 || p.fillableRoleIds.includes(role.id)
            );

            return (
              <div key={role.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-lg">{role.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    isUnassigned
                      ? 'bg-red-100 text-red-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {isUnassigned ? 'Unassigned' : 'Assigned'}
                  </span>
                </div>
                <Select
                  value={assignedPerson?.id || 'unassigned'}
                  onValueChange={(value) => handleAssignmentChange(role.id as RoleId, value === 'unassigned' ? null : value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select person..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {assignablePeople.map((person) => (
                      <SelectItem key={person.id} value={person.id}>
                        {person.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            );
          })}
        </div>

        {/* Desktop Table View */}
        <div className="hidden sm:block">
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
                      value={assignedPerson?.id || "unassign"}
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

      {/* Right: Calendar */}
      <div className="w-full lg:w-80 flex-shrink-0 space-y-6">
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:sticky lg:top-8">
          <h2 className="text-lg sm:text-xl font-bold mb-4 text-center lg:text-left">
            Select {getServiceDayName(serviceDayConfig.primaryDay)}
          </h2>
          <div className="flex justify-center">
            <ServiceCalendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateChange}
              initialFocus
              serviceDayConfig={serviceDayConfig}
              className="rounded-md border"
            />
          </div>
        </div>

        {/* Holiday Selector - Only show if custom dates are allowed */}
        {serviceDayConfig.allowCustomDates && (
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-500" />
              Holiday Services
            </h3>
            <HolidaySelector
              onSelectDate={(date, holidayName) => {
                setSelectedDate(date);
                if (holidayName) {
                  toast({
                    title: "Holiday Selected",
                    description: `Selected ${holidayName} on ${formatDateForDisplay(date)}`,
                  });
                }
              }}
              currentYear={selectedDate.getFullYear()}
            />
          </div>
        )}
      </div>
    </div>
  );
}
