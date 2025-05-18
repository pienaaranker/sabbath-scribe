
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppContext } from '@/context/app-context';
import { ROLES_CONFIG, ROLE_NAMES_MAP } from '@/lib/constants';
import type { Person, SabbathAssignment, RoleId } from '@/types';
import { getNearestSaturday, getNextSabbath, getPreviousSabbath, formatDateForDb, formatDateForDisplay, parseDateFromDb } from '@/lib/date-utils';
import { ChevronLeft, ChevronRight, Users, CalendarIcon, Filter, Search } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Image from 'next/image';

const ALL_ROLES_FILTER_VALUE = "all_roles_filter_val";
const ALL_PEOPLE_FILTER_VALUE = "all_people_filter_val";

const AssignmentDisplayCard: React.FC<{ assignment: SabbathAssignment, isUnassigned: boolean }> = ({ assignment, isUnassigned }) => {
  const cardClasses = isUnassigned 
    ? "bg-destructive/10 border-destructive/30" 
    : "bg-card";
  const personNameClasses = isUnassigned ? "text-destructive font-semibold" : "text-secondary-foreground font-medium";

  return (
    <Card className={`shadow-lg hover:shadow-xl transition-shadow duration-300 ${cardClasses}`}>
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-base font-semibold text-primary truncate">{assignment.roleName}</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        {assignment.person ? (
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <p className={`text-sm ${personNameClasses}`}>{assignment.person.name}</p>
          </div>
        ) : (
          <p className={`text-sm ${personNameClasses}`}>Not Assigned</p>
        )}
      </CardContent>
    </Card>
  );
};


export default function SabbathViewClient() {
  const { getAssignmentsForDate, getPersonById, people, isLoading } = useAppContext();
  const [selectedDate, setSelectedDate] = useState<Date>(() => getNearestSaturday(new Date()));
  const [filterRole, setFilterRole] = useState<string>(''); // Empty string for "All" or placeholder
  const [filterPerson, setFilterPerson] = useState<string>(''); // Empty string for "All" or placeholder
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    // If initial assignments are for a different date, update selectedDate
    // This is a placeholder, real logic might depend on how initial date is determined
  }, []);
  
  const formattedDate = useMemo(() => formatDateForDb(selectedDate), [selectedDate]);

  const sabbathAssignments = useMemo(() => {
    const assignmentsForDate = getAssignmentsForDate(formattedDate);
    return ROLES_CONFIG.map((role) => {
      const assignment = assignmentsForDate.find((a) => a.roleId === role.id);
      const person = assignment?.personId ? getPersonById(assignment.personId) : null;
      return {
        roleId: role.id,
        roleName: role.name,
        person: person || null,
      };
    });
  }, [formattedDate, getAssignmentsForDate, getPersonById]);

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


  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(getNearestSaturday(date));
    }
  };

  if (isLoading) {
    return <div className="text-center py-10">Loading schedule...</div>;
  }

  return (
    <Card className="shadow-xl">
      <CardHeader className="bg-muted/50">
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
                  disabled={(date) => !isSaturday(date)} // Only allow Saturdays
                />
              </PopoverContent>
            </Popover>
            <Button variant="outline" size="icon" onClick={() => setSelectedDate(getNextSabbath(selectedDate))} aria-label="Next Sabbath">
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-primary">
            Sabbath Schedule
          </h2>
        </div>
        <div className="mt-4 flex flex-col sm:flex-row gap-2 items-center border-t pt-4">
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
      </CardHeader>
      <CardContent className="p-4 md:p-6">
        {filteredAssignments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
            <Image src="https://placehold.co/300x200.png" alt="No assignments" width={300} height={200} className="mx-auto mb-4 rounded-md" data-ai-hint="empty state document" />
            <p className="text-lg">No assignments found for this date or matching your filters.</p>
            <p>Try adjusting the date or clearing filters.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function isSaturday(date: Date) {
  return date.getDay() === 6;
}

