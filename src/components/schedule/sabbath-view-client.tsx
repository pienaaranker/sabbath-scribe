"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFirestore } from '@/context/firestore-context';
import { ROLES_CONFIG, ROLE_NAMES_MAP } from '@/lib/constants';
import type { Person, SabbathAssignment, RoleId } from '@/types';
import { getNearestSaturday, getNextSabbath, getPreviousSabbath, formatDateForDb, formatDateForDisplay, parseDateFromDb } from '@/lib/date-utils';
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


export default function SabbathViewClient() {
  const { people, getSabbathAssignments, loading, error } = useFirestore();
  const [selectedDate, setSelectedDate] = useState<Date>(() => getNearestSaturday(new Date()));
  const [filterRole, setFilterRole] = useState<string>(''); // Empty string for "All" or placeholder
  const [filterPerson, setFilterPerson] = useState<string>(''); // Empty string for "All" or placeholder
  const [searchTerm, setSearchTerm] = useState<string>('');
  
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


  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(getNearestSaturday(date));
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading schedule...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="text-center py-20">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <section className="section">
        <h2 className="section-title">Sabbath Schedule</h2>
        
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-8">
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
                <CalendarComponent
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
        </div>
        
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
          <div className="features-grid">
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
      </section>
      
      <div className="tech-stack">
        <div className="container">
          <h2 className="section-title" style={{color: 'white'}}>Key Features</h2>
          <div className="tech-grid">
            <div className="tech-item">
              <h4 className="text-lg font-semibold mb-2">Role Assignment</h4>
              <p className="text-sm opacity-80">Efficiently assign church members to various roles for each Sabbath service.</p>
            </div>
            <div className="tech-item">
              <h4 className="text-lg font-semibold mb-2">People Management</h4>
              <p className="text-sm opacity-80">Comprehensive member database with role preferences and availability tracking.</p>
            </div>
            <div className="tech-item">
              <h4 className="text-lg font-semibold mb-2">Schedule View</h4>
              <p className="text-sm opacity-80">Interactive calendar view with filtering by role or person, plus powerful search capabilities.</p>
            </div>
          </div>
        </div>
      </div>
      
      <footer className="py-12 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} SabbathScribe. All rights reserved.
      </footer>
    </div>
  );
}

function isSaturday(date: Date) {
  return date.getDay() === 6;
}

