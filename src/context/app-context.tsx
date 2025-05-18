"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import type { Person, Assignment, RoleId } from '@/types';
import { ROLES_CONFIG } from '@/lib/constants';
import { format } from 'date-fns';
import { DATE_FORMAT_DB } from '@/lib/date-utils';

interface AppContextType {
  people: Person[];
  assignments: Assignment[];
  addPerson: (person: Omit<Person, 'id'>) => Person;
  updatePerson: (person: Person) => void;
  removePerson: (personId: string) => void;
  getPersonById: (personId: string) => Person | undefined;
  assignPersonToRole: (date: string, roleId: RoleId, personId: string | null) => void;
  getAssignmentsForDate: (date: string) => Assignment[];
  getAssignment: (date: string, roleId: RoleId) => Assignment | undefined;
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Initial Data (Consider moving to a separate file or fetching)
const initialPeople: Person[] = [
  { id: '1', name: 'Alice Wonderland', contactInfo: 'alice@example.com', fillableRoleIds: ['preacher', 'ss_host_english'], unavailableDates: [] },
  { id: '2', name: 'Bob The Builder', contactInfo: 'bob@example.com', fillableRoleIds: ['elder_on_duty', 'security_duty'], unavailableDates: [] },
  { id: '3', name: 'Carol Danvers', contactInfo: 'carol@example.com', fillableRoleIds: ['announcements_presenter', 'welcoming_team', 'ss_host_afrikaans'], unavailableDates: [] },
  { id: '4', name: 'David Copperfield', contactInfo: 'david@example.com', fillableRoleIds: ['offering_coordinator'], unavailableDates: [] },
];

const initialAssignments: Assignment[] = [
  { id: `${format(new Date(), DATE_FORMAT_DB)}_preacher`, date: format(new Date(), DATE_FORMAT_DB), roleId: 'preacher', personId: '1' },
];

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [people, setPeople] = useState<Person[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data from local storage or API
    const storedPeople = localStorage.getItem('sabbathscribe_people');
    const storedAssignments = localStorage.getItem('sabbathscribe_assignments');

    setPeople(storedPeople ? JSON.parse(storedPeople) : initialPeople);
    setAssignments(storedAssignments ? JSON.parse(storedAssignments) : initialAssignments);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('sabbathscribe_people', JSON.stringify(people));
    }
  }, [people, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('sabbathscribe_assignments', JSON.stringify(assignments));
    }
  }, [assignments, isLoading]);

  const addPerson = (personData: Omit<Person, 'id'>): Person => {
    const newPerson: Person = { ...personData, id: crypto.randomUUID() };
    setPeople((prev) => [...prev, newPerson]);
    return newPerson;
  };

  const updatePerson = (updatedPerson: Person) => {
    setPeople((prev) => prev.map((p) => (p.id === updatedPerson.id ? updatedPerson : p)));
  };

  const removePerson = (personId: string) => {
    setPeople((prev) => prev.filter((p) => p.id !== personId));
    // Also remove assignments for this person
    setAssignments((prev) => prev.map(a => a.personId === personId ? {...a, personId: null} : a));
  };
  
  const getPersonById = useCallback((personId: string) => {
    return people.find(p => p.id === personId);
  }, [people]);

  const assignPersonToRole = (date: string, roleId: RoleId, personId: string | null) => {
    setAssignments((prevAssignments) => {
      const existingAssignmentIndex = prevAssignments.findIndex(
        (a) => a.date === date && a.roleId === roleId
      );
      if (existingAssignmentIndex !== -1) {
        const updatedAssignments = [...prevAssignments];
        updatedAssignments[existingAssignmentIndex] = {
          ...updatedAssignments[existingAssignmentIndex],
          personId,
        };
        return updatedAssignments;
      } else {
        return [
          ...prevAssignments,
          { id: crypto.randomUUID(), date, roleId, personId },
        ];
      }
    });
  };

  const getAssignmentsForDate = useCallback((date: string): Assignment[] => {
    return assignments.filter((a) => a.date === date);
  }, [assignments]);

  const getAssignment = useCallback((date: string, roleId: RoleId): Assignment | undefined => {
    return assignments.find(a => a.date === date && a.roleId === roleId);
  }, [assignments]);

  return (
    <AppContext.Provider
      value={{
        people,
        assignments,
        addPerson,
        updatePerson,
        removePerson,
        getPersonById,
        assignPersonToRole,
        getAssignmentsForDate,
        getAssignment,
        isLoading
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
