"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFirestore } from '@/context/firestore-context';
import { ROLES_CONFIG, ROLE_NAMES_MAP } from '@/lib/constants';
import type { Person, SabbathAssignment, RoleId } from '@/types';
import { getNearestSaturday, getNextSabbath, getPreviousSabbath, formatDateForDb, formatDateForDisplay, parseDateFromDb, getNearestServiceDay, getNextServiceDay, getPreviousServiceDay, getServiceDayName } from '@/lib/date-utils';
import { ChevronLeft, ChevronRight, Users, CalendarIcon, Filter, Search, Clipboard, User, Calendar } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Image from 'next/image';

const ALL_ROLES_FILTER_VALUE = "all_roles_filter_val";
const ALL_PEOPLE_FILTER_VALUE = "all_people_filter_val";

const AssignmentDisplayCard: React.FC<{ assignment: SabbathAssignment, isUnassigned: boolean }> = ({ assignment, isUnassigned }) => {
  const cardClasses = isUnassigned 
    ? "bg-card border-destructive/30" 
    : "feature-card";
  const personNameClasses = isUnassigned 
    ? "text-destructive font-semibold text-lg" 
    : "text-primary font-semibold text-lg";

  return (
    <div className={`${cardClasses} p-4`}>
      <div className="border-b border-border pb-2 mb-3">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">{assignment.roleName}</h3>
      </div>
      {assignment.person ? (
        <div className="flex items-center justify-between">
          <div>
            <p className={personNameClasses}>{assignment.person.name}</p>
            <p className="text-sm text-muted-foreground mt-1">Assigned</p>
          </div>
          <div className={`h-2 w-2 rounded-full ${isUnassigned ? 'bg-destructive' : 'bg-green-500'}`} />
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div>
            <p className={personNameClasses}>Not Assigned</p>
            <p className="text-sm text-muted-foreground mt-1">Needs Assignment</p>
          </div>
          <div className="h-2 w-2 rounded-full bg-destructive" />
        </div>
      )}
    </div>
  );
};

const getNextMonth = (date: Date, serviceDay: number): Date => {
  const nextMonth = new Date(date);
  nextMonth.setMonth(nextMonth.getMonth() + 1, 1);
  // Find the first service day of the next month
  while (nextMonth.getDay() !== serviceDay) {
    nextMonth.setDate(nextMonth.getDate() + 1);
  }
  return nextMonth;
};

const getPreviousMonth = (date: Date, serviceDay: number): Date => {
  const prevMonth = new Date(date);
  prevMonth.setMonth(prevMonth.getMonth() - 1, 1);
  // Find the first service day of the previous month
  while (prevMonth.getDay() !== serviceDay) {
    prevMonth.setDate(prevMonth.getDate() + 1);
  }
  return prevMonth;
};

// Add prop type
interface SabbathViewClientProps {
  scheduleId?: string;
}

// Accept the prop
export default function SabbathViewClient({ scheduleId }: SabbathViewClientProps) {
  const { people, getSabbathAssignments, loading, error, setCurrentScheduleById, currentSchedule } = useFirestore();

  // Use service day configuration from current schedule, fallback to Saturday
  const serviceDayConfig = currentSchedule?.serviceDayConfig || { primaryDay: 6, additionalDays: [], allowCustomDates: false };
  const [selectedDate, setSelectedDate] = useState<Date>(() =>
    getNearestServiceDay(new Date(), serviceDayConfig.primaryDay)
  );
  const [filterRole, setFilterRole] = useState<string>('');
  const [filterPerson, setFilterPerson] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [publicLoading, setPublicLoading] = useState(false);
  const [publicError, setPublicError] = useState<string | null>(null);
  
  const formattedDate = useMemo(() => formatDateForDb(selectedDate), [selectedDate]);

  const sabbathAssignments = useMemo(() => {
    return getSabbathAssignments(formattedDate);
  }, [formattedDate, getSabbathAssignments]);

  const filteredAssignments = useMemo(() => {
    return sabbathAssignments.filter(assignment => {
      const roleMatch = (filterRole === '' || filterRole === ALL_ROLES_FILTER_VALUE) ? true : assignment.roleId === filterRole;
      const personMatch = (filterPerson === '' || filterPerson === ALL_PEOPLE_FILTER_VALUE) ? true : assignment.person?.id === filterPerson;
      const searchTermMatch = searchTerm ? 
        (assignment.roleName.toLowerCase().includes(searchTerm.toLowerCase()) || 
         assignment.person?.name.toLowerCase().includes(searchTerm.toLowerCase())) 
        : true;
      return roleMatch && personMatch && searchTermMatch;
    });
  }, [sabbathAssignments, filterRole, filterPerson, searchTerm]);

  // Debug logs
  console.log('[SabbathViewClient] scheduleId:', scheduleId);
  console.log('[SabbathViewClient] loading:', loading, 'publicLoading:', publicLoading, 'error:', error, 'publicError:', publicError);
  console.log('[SabbathViewClient] currentSchedule:', currentSchedule);

  useEffect(() => {
    if (
      scheduleId &&
      (!currentSchedule || currentSchedule.id !== scheduleId)
    ) {
      console.log('[SabbathViewClient] Calling setCurrentScheduleById with', scheduleId);
      setPublicLoading(true);
      setCurrentScheduleById(scheduleId)
        .then(() => {
          setPublicError(null);
          console.log('[SabbathViewClient] setCurrentScheduleById resolved');
        })
        .catch((err) => {
          setPublicError('Schedule not found');
          console.error('[SabbathViewClient] setCurrentScheduleById error', err);
        })
        .finally(() => {
          setPublicLoading(false);
          console.log('[SabbathViewClient] setCurrentScheduleById finished');
        });
    }
  }, [scheduleId, setCurrentScheduleById, currentSchedule]);

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

  if (publicLoading || loading) {
    return (
      <div className="container">
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading schedule...</p>
        </div>
      </div>
    );
  }

  if (publicError || error) {
    return (
      <div className="container">
        <div className="text-center py-20">
          <p className="text-destructive mb-4">{publicError || error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <section className="section">
        <h2 className="section-title">{getServiceDayName(serviceDayConfig.primaryDay)} Schedule</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content Column */}
          <div className="lg:col-span-3">
            <div className="bg-muted/30 p-4 rounded-lg mb-8">
              <div className="flex flex-col sm:flex-row gap-2 items-center">
                <div className="flex items-center gap-1 w-full sm:w-auto">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select value={filterRole} onValueChange={(value) => setFilterRole(value === ALL_ROLES_FILTER_VALUE ? '' : value)}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Filter by Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL_ROLES_FILTER_VALUE}>All Roles</SelectItem>
                      {ROLES_CONFIG.map(role => (
                        <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-1 w-full sm:w-auto">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <Select value={filterPerson} onValueChange={(value) => setFilterPerson(value === ALL_PEOPLE_FILTER_VALUE ? '' : value)}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Filter by Person" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL_PEOPLE_FILTER_VALUE}>All People</SelectItem>
                      {people.map(person => (
                        <SelectItem key={person.id} value={person.id}>{person.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-1 w-full sm:flex-1">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input 
                    type="search" 
                    placeholder="Search by role or name..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
            
            {filteredAssignments.length > 0 ? (
              <div className="flex flex-col gap-4">
                {filteredAssignments.map((assignment) => (
                  <AssignmentDisplayCard 
                    key={assignment.roleId} 
                    assignment={assignment} 
                    isUnassigned={!assignment.person} 
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                <Image src="/clipboard.jpeg" alt="No assignments" width={300} height={200} className="mx-auto mb-4 rounded-md" data-ai-hint="empty state document" />
                <p className="text-lg">No assignments found for this date or matching your filters.</p>
                <p>Try adjusting the date or clearing filters.</p>
              </div>
            )}
          </div>

          {/* Calendar Column */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-lg p-4 sticky top-4">
              <div className="flex flex-col space-y-4">
                {/* Date Navigation */}
                <div className="flex items-center justify-between px-1">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setSelectedDate(getPreviousMonth(selectedDate, serviceDayConfig.primaryDay))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <p className="text-sm font-medium">
                    {formatDateForDisplay(selectedDate)}
                  </p>
                  <Button 
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedDate(getNextMonth(selectedDate, serviceDayConfig.primaryDay))}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                {/* Calendar Grid */}
                <div className="space-y-4">
                  {/* Month and Year */}
                  <div className="text-center">
                    <div className="font-medium">
                      {selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </div>
                  </div>

                  {/* Days of Week */}
                  <div className="grid grid-cols-7 gap-1 text-center">
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                      <div key={day} className="text-xs text-muted-foreground font-medium py-1">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Days */}
                  <div className="grid grid-cols-7 gap-1 text-center">
                    {Array.from({ length: 35 }, (_, i) => {
                      const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
                      const firstDay = date.getDay();
                      const currentDay = i - firstDay + 1;
                      date.setDate(currentDay);

                      const isCurrentMonth = date.getMonth() === selectedDate.getMonth();
                      const isSameDay = date.toDateString() === selectedDate.toDateString();

                      // Check if this date is a valid service day
                      const isValidServiceDay = serviceDayConfig.allowCustomDates ||
                        date.getDay() === serviceDayConfig.primaryDay ||
                        (serviceDayConfig.additionalDays && serviceDayConfig.additionalDays.includes(date.getDay() as any));

                      return (
                        <button
                          key={i}
                          onClick={() => isValidServiceDay && handleDateChange(date)}
                          disabled={!isValidServiceDay}
                          className={`
                            p-2 text-sm rounded-md relative
                            ${!isCurrentMonth && 'text-muted-foreground/50'}
                            ${isSameDay && 'bg-primary text-primary-foreground'}
                            ${isValidServiceDay && !isSameDay && 'hover:bg-muted cursor-pointer'}
                            ${!isValidServiceDay && 'cursor-not-allowed opacity-50'}
                          `}
                        >
                          {date.getDate()}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <footer className="py-12 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} SabbathScribe. All rights reserved.
      </footer>
    </div>
  );
}

function isSaturday(date: Date) {
  return date.getDay() === 6;
}

