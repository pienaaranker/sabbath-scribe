"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { peopleService, assignmentService, initializeRoles } from '@/lib/firestore';
import type { Person, Assignment, SabbathAssignment, RoleId } from '@/types';
import { ROLES_CONFIG } from '@/lib/constants';
import { useAuth } from './auth-context';

interface FirestoreContextType {
  // People
  people: Person[];
  addPerson: (person: Omit<Person, 'id'>) => Promise<void>;
  updatePerson: (id: string, person: Partial<Omit<Person, 'id'>>) => Promise<void>;
  deletePerson: (id: string) => Promise<void>;
  getPersonById: (id: string) => Person | undefined;

  // Assignments
  assignments: Assignment[];
  addAssignment: (assignment: Omit<Assignment, 'id'>) => Promise<void>;
  updateAssignment: (id: string, assignment: Partial<Omit<Assignment, 'id'>>) => Promise<void>;
  deleteAssignment: (id: string) => Promise<void>;
  getAssignmentsForDate: (date: string) => Assignment[];
  getSabbathAssignments: (date: string) => SabbathAssignment[];

  // Loading state
  loading: boolean;
  error: string | null;

  // Refresh data
  refreshData: () => Promise<void>;
}

const FirestoreContext = createContext<FirestoreContextType | undefined>(undefined);

export const useFirestore = () => {
  const context = useContext(FirestoreContext);
  if (context === undefined) {
    throw new Error('useFirestore must be used within a FirestoreProvider');
  }
  return context;
};

interface FirestoreProviderProps {
  children: React.ReactNode;
}

export const FirestoreProvider: React.FC<FirestoreProviderProps> = ({ children }) => {
  const [people, setPeople] = useState<Person[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const loadData = async () => {
    if (!user) {
      setPeople([]);
      setAssignments([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Initialize roles if needed
      await initializeRoles();

      // Load people and assignments
      const [peopleData, assignmentsData] = await Promise.all([
        peopleService.getAll(),
        assignmentService.getAll()
      ]);

      setPeople(peopleData);
      setAssignments(assignmentsData);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    await loadData();
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // People operations
  const addPerson = async (person: Omit<Person, 'id'>) => {
    try {
      const id = await peopleService.create(person);
      setPeople(prev => [...prev, { ...person, id }]);
    } catch (err) {
      console.error('Error adding person:', err);
      throw err;
    }
  };

  const updatePerson = async (id: string, personUpdate: Partial<Omit<Person, 'id'>>) => {
    try {
      await peopleService.update(id, personUpdate);
      setPeople(prev => prev.map(p => p.id === id ? { ...p, ...personUpdate } : p));
    } catch (err) {
      console.error('Error updating person:', err);
      throw err;
    }
  };

  const deletePerson = async (id: string) => {
    try {
      await peopleService.delete(id);
      setPeople(prev => prev.filter(p => p.id !== id));
      // Also remove any assignments for this person
      setAssignments(prev => prev.filter(a => a.personId !== id));
    } catch (err) {
      console.error('Error deleting person:', err);
      throw err;
    }
  };

  const getPersonById = (id: string): Person | undefined => {
    return people.find(p => p.id === id);
  };

  // Assignment operations
  const addAssignment = async (assignment: Omit<Assignment, 'id'>) => {
    try {
      const id = await assignmentService.create(assignment);
      setAssignments(prev => [...prev, { ...assignment, id }]);
    } catch (err) {
      console.error('Error adding assignment:', err);
      throw err;
    }
  };

  const updateAssignment = async (id: string, assignmentUpdate: Partial<Omit<Assignment, 'id'>>) => {
    try {
      await assignmentService.update(id, assignmentUpdate);
      setAssignments(prev => prev.map(a => a.id === id ? { ...a, ...assignmentUpdate } : a));
    } catch (err) {
      console.error('Error updating assignment:', err);
      throw err;
    }
  };

  const deleteAssignment = async (id: string) => {
    try {
      await assignmentService.delete(id);
      setAssignments(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      console.error('Error deleting assignment:', err);
      throw err;
    }
  };

  const getAssignmentsForDate = (date: string): Assignment[] => {
    return assignments.filter(a => a.date === date);
  };

  const getSabbathAssignments = (date: string): SabbathAssignment[] => {
    const assignmentsForDate = getAssignmentsForDate(date);
    return ROLES_CONFIG.map(role => {
      const assignment = assignmentsForDate.find(a => a.roleId === role.id);
      const person = assignment?.personId ? getPersonById(assignment.personId) : null;
      return {
        roleId: role.id,
        roleName: role.name,
        person: person || null,
      };
    });
  };

  const value: FirestoreContextType = {
    people,
    addPerson,
    updatePerson,
    deletePerson,
    getPersonById,
    assignments,
    addAssignment,
    updateAssignment,
    deleteAssignment,
    getAssignmentsForDate,
    getSabbathAssignments,
    loading,
    error,
    refreshData
  };

  return (
    <FirestoreContext.Provider value={value}>
      {children}
    </FirestoreContext.Provider>
  );
};