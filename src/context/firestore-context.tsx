"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  peopleService, 
  assignmentService, 
  initializeRoles, 
  scheduleService, 
  initializeScheduleRoles,
  roleService,
  getRoles,
  COLLECTIONS
} from '@/lib/firestore';
import type { Person, Assignment, SabbathAssignment, RoleId, Schedule, ScheduleMember, Role } from '@/types';
import { ROLES_CONFIG } from '@/lib/constants';
import { useAuth } from './auth-context';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface FirestoreContextType {
  // Schedules
  schedules: Schedule[];
  currentSchedule: Schedule | null;
  setCurrentSchedule: (schedule: Schedule) => void;
  setCurrentScheduleById: (id: string) => Promise<void>;
  addSchedule: (schedule: Omit<Schedule, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateSchedule: (id: string, schedule: Partial<Omit<Schedule, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>>) => Promise<void>;
  deleteSchedule: (id: string) => Promise<void>;
  scheduleMembers: ScheduleMember[];
  addScheduleMember: (member: Omit<ScheduleMember, 'addedAt'>) => Promise<void>;
  removeScheduleMember: (userId: string) => Promise<void>;
  
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

  // Roles
  roles: Role[];
  addRole: (role: Omit<Role, 'id'> | Role) => Promise<string>;
  updateRole: (id: string, role: Partial<Omit<Role, 'id'>>) => Promise<void>;
  deleteRole: (id: string) => Promise<void>;
  getRoleById: (id: string) => Role | undefined;

  // Loading state
  loading: boolean;
  error: string | null;

  // Refresh data
  refreshData: () => Promise<void>;
  
  // Check if user has access to a schedule
  hasScheduleAccess: (scheduleId: string) => boolean;
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
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [currentSchedule, setCurrentSchedule] = useState<Schedule | null>(null);
  const [scheduleMembers, setScheduleMembers] = useState<ScheduleMember[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const [isPublicView, setIsPublicView] = useState(false);

  // Load user's schedules
  useEffect(() => {
    if (isPublicView) return;
    const loadUserSchedules = async () => {
      if (!user) {
        // Only clear state if not in public view
        if (!isPublicView) {
          setSchedules([]);
          setCurrentSchedule(null);
          setLoading(false);
        }
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const userSchedules = await scheduleService.getAll(user.uid);
        setSchedules(userSchedules);
        // If there are schedules, select the first one as current
        // or use the last selected from localStorage if available
        if (userSchedules.length > 0) {
          const savedScheduleId = localStorage.getItem('currentScheduleId');
          const savedSchedule = savedScheduleId 
            ? userSchedules.find(s => s.id === savedScheduleId) 
            : null;
          if (savedSchedule) {
            setCurrentSchedule(savedSchedule);
          } else {
            setCurrentSchedule(userSchedules[0]);
            localStorage.setItem('currentScheduleId', userSchedules[0].id);
          }
        } else {
          setCurrentSchedule(null);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error loading schedules:', err);
        setError('Failed to load schedules. Please try again.');
        setLoading(false);
      }
    };
    loadUserSchedules();
  }, [user, isPublicView]);

  // Load schedule data when current schedule changes
  useEffect(() => {
    const loadScheduleData = async () => {
      if (!currentSchedule || !user) {
        setPeople([]);
        setAssignments([]);
        setRoles([]);
        setScheduleMembers([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Store selected schedule in localStorage
        localStorage.setItem('currentScheduleId', currentSchedule.id);

        // Load schedule members, people, assignments, and roles
        const [membersData, peopleData, assignmentsData, rolesData] = await Promise.all([
          scheduleService.getMembers(currentSchedule.id),
          peopleService.getAll(currentSchedule.id),
          assignmentService.getAll(currentSchedule.id),
          roleService.getAll(currentSchedule.id)
        ]);

        setScheduleMembers(membersData);
        setPeople(peopleData);
        setAssignments(assignmentsData);
        setRoles(rolesData);
      } catch (err) {
        console.error('Error loading schedule data:', err);
        setError('Failed to load schedule data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadScheduleData();
  }, [currentSchedule, user]);

  const handleSetCurrentSchedule = (schedule: Schedule) => {
    setCurrentSchedule(schedule);
    localStorage.setItem('currentScheduleId', schedule.id);
  };

  // NEW: Set current schedule by id (for public viewing)
  const setCurrentScheduleById = async (id: string) => {
    setIsPublicView(true); // NEW: keep true for session
    try {
      setLoading(true);
      setError(null);
      const schedule = await scheduleService.getById(id);
      if (schedule) {
        setCurrentSchedule(schedule);
        // Load schedule data (members, people, assignments, roles)
        const [membersData, peopleData, assignmentsData, rolesData] = await Promise.all([
          scheduleService.getMembers(schedule.id),
          peopleService.getAll(schedule.id),
          assignmentService.getAll(schedule.id),
          roleService.getAll(schedule.id)
        ]);
        setScheduleMembers(membersData);
        setPeople(peopleData);
        setAssignments(assignmentsData);
        setRoles(rolesData);
      } else {
        setCurrentSchedule(null);
        setPeople([]);
        setAssignments([]);
        setRoles([]);
        setScheduleMembers([]);
        setError('Schedule not found');
      }
    } catch (err) {
      setCurrentSchedule(null);
      setPeople([]);
      setAssignments([]);
      setRoles([]);
      setScheduleMembers([]);
      setError('Failed to load schedule.');
    } finally {
      setLoading(false);
      // Do NOT set isPublicView to false here
    }
  };

  // Schedule operations
  const addSchedule = async (schedule: Omit<Schedule, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    if (!user) throw new Error('User must be authenticated to create a schedule');
    
    try {
      const scheduleId = await scheduleService.create(user.uid, schedule);
      
      // Defensive: Wait for schedule doc to exist before initializing subcollections
      let tries = 0;
      let scheduleDoc = null;
      while (tries < 5 && !scheduleDoc) {
        scheduleDoc = await scheduleService.getById(scheduleId);
        if (!scheduleDoc) await new Promise(res => setTimeout(res, 200)); // wait 200ms
        tries++;
      }
      if (!scheduleDoc) throw new Error('Schedule document not found after creation!');
      
      // Initialize default roles for the new schedule
      await initializeScheduleRoles(scheduleId);
      
      // Only now refresh the schedules list and set the new schedule as current
      const userSchedules = await scheduleService.getAll(user.uid);
      setSchedules(userSchedules);
      
      const newSchedule = userSchedules.find(s => s.id === scheduleId);
      if (newSchedule) {
        setCurrentSchedule(newSchedule);
        localStorage.setItem('currentScheduleId', scheduleId);
      }
      
      return scheduleId;
    } catch (err) {
      console.error('Error adding schedule:', err);
      throw err;
    }
  };

  const updateSchedule = async (id: string, scheduleUpdate: Partial<Omit<Schedule, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>>): Promise<void> => {
    try {
      await scheduleService.update(id, scheduleUpdate);
      
      // Update the schedule in the local state
      setSchedules(prev => prev.map(s => s.id === id ? { ...s, ...scheduleUpdate } : s));
      
      // Update current schedule if it's the one being updated
      if (currentSchedule?.id === id) {
        setCurrentSchedule(prev => prev ? { ...prev, ...scheduleUpdate } : null);
      }
    } catch (err) {
      console.error('Error updating schedule:', err);
      throw err;
    }
  };

  const deleteSchedule = async (id: string): Promise<void> => {
    try {
      await scheduleService.delete(id);
      
      // Remove the schedule from the local state
      setSchedules(prev => prev.filter(s => s.id !== id));
      
      // If the deleted schedule was the current one, select another one
      if (currentSchedule?.id === id) {
        const remainingSchedules = schedules.filter(s => s.id !== id);
        if (remainingSchedules.length > 0) {
          setCurrentSchedule(remainingSchedules[0]);
          localStorage.setItem('currentScheduleId', remainingSchedules[0].id);
        } else {
          setCurrentSchedule(null);
          localStorage.removeItem('currentScheduleId');
        }
      }
    } catch (err) {
      console.error('Error deleting schedule:', err);
      throw err;
    }
  };

  const addScheduleMember = async (member: Omit<ScheduleMember, 'addedAt'>): Promise<void> => {
    if (!currentSchedule) throw new Error('No schedule selected');
    
    try {
      await scheduleService.addMember(currentSchedule.id, member);
      
      // Refresh the members list
      const membersData = await scheduleService.getMembers(currentSchedule.id);
      setScheduleMembers(membersData);
      
      // If the member is an admin, refresh the schedule data
      if (member.role === 'admin') {
        const updatedSchedule = await scheduleService.getById(currentSchedule.id);
        if (updatedSchedule) {
          setCurrentSchedule(updatedSchedule);
          // Also update in schedules list
          setSchedules(prev => prev.map(s => s.id === currentSchedule.id ? updatedSchedule : s));
        }
      }
    } catch (err) {
      console.error('Error adding schedule member:', err);
      throw err;
    }
  };

  const removeScheduleMember = async (userId: string): Promise<void> => {
    if (!currentSchedule) throw new Error('No schedule selected');
    
    try {
      await scheduleService.removeMember(currentSchedule.id, userId);
      
      // Refresh the members list
      const membersData = await scheduleService.getMembers(currentSchedule.id);
      setScheduleMembers(membersData);
      
      // Refresh schedule data in case adminUserIds changed
      const updatedSchedule = await scheduleService.getById(currentSchedule.id);
      if (updatedSchedule) {
        setCurrentSchedule(updatedSchedule);
        // Also update in schedules list
        setSchedules(prev => prev.map(s => s.id === currentSchedule.id ? updatedSchedule : s));
      }
    } catch (err) {
      console.error('Error removing schedule member:', err);
      throw err;
    }
  };

  // People operations
  const addPerson = async (person: Omit<Person, 'id'>) => {
    if (!currentSchedule) throw new Error('No schedule selected');
    
    try {
      const id = await peopleService.create(currentSchedule.id, person);
      setPeople(prev => [...prev, { ...person, id }]);
    } catch (err) {
      console.error('Error adding person:', err);
      throw err;
    }
  };

  const updatePerson = async (id: string, personUpdate: Partial<Omit<Person, 'id'>>) => {
    if (!currentSchedule) throw new Error('No schedule selected');
    
    try {
      await peopleService.update(currentSchedule.id, id, personUpdate);
      setPeople(prev => prev.map(p => p.id === id ? { ...p, ...personUpdate } : p));
    } catch (err) {
      console.error('Error updating person:', err);
      throw err;
    }
  };

  const deletePerson = async (id: string) => {
    if (!currentSchedule) throw new Error('No schedule selected');
    
    try {
      await peopleService.delete(currentSchedule.id, id);
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
    if (!currentSchedule) throw new Error('No schedule selected');
    
    try {
      const id = await assignmentService.create(currentSchedule.id, assignment);
      setAssignments(prev => [...prev, { ...assignment, id }]);
    } catch (err) {
      console.error('Error adding assignment:', err);
      throw err;
    }
  };

  const updateAssignment = async (id: string, assignmentUpdate: Partial<Omit<Assignment, 'id'>>) => {
    if (!currentSchedule) throw new Error('No schedule selected');
    
    try {
      await assignmentService.update(currentSchedule.id, id, assignmentUpdate);
      setAssignments(prev => prev.map(a => a.id === id ? { ...a, ...assignmentUpdate } : a));
    } catch (err) {
      console.error('Error updating assignment:', err);
      throw err;
    }
  };

  const deleteAssignment = async (id: string) => {
    if (!currentSchedule) throw new Error('No schedule selected');
    
    try {
      await assignmentService.delete(currentSchedule.id, id);
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
    return roles.map(role => {
      const assignment = assignmentsForDate.find(a => a.roleId === role.id);
      const person = assignment?.personId ? getPersonById(assignment.personId) : null;
      return {
        roleId: role.id,
        roleName: role.name,
        person: person || null,
      };
    });
  };

  // Role operations
  const addRole = async (role: Omit<Role, 'id'> | Role) => {
    if (!currentSchedule) throw new Error('No schedule selected');
    
    try {
      // If the role already has an ID, use that as the document ID
      if ('id' in role) {
        const roleId = role.id;
        // Create with a specific ID
        const roleDoc: any = { name: role.name };
        if (role.description !== undefined) roleDoc.description = role.description;
        await setDoc(doc(db, COLLECTIONS.SCHEDULES, currentSchedule.id, COLLECTIONS.ROLES, roleId), roleDoc);
        setRoles(prev => [...prev, role as Role]);
        return roleId;
      } else {
        // Auto-generate an ID
        const id = await roleService.create(currentSchedule.id, role);
        setRoles(prev => [...prev, { ...role, id: id as RoleId }]);
        return id;
      }
    } catch (err) {
      console.error('Error adding role:', err);
      throw err;
    }
  };

  const updateRole = async (id: string, roleUpdate: Partial<Omit<Role, 'id'>>) => {
    if (!currentSchedule) throw new Error('No schedule selected');
    
    try {
      await roleService.update(currentSchedule.id, id, roleUpdate);
      setRoles(prev => prev.map(r => r.id === id ? { ...r, ...roleUpdate } : r));
    } catch (err) {
      console.error('Error updating role:', err);
      throw err;
    }
  };

  const deleteRole = async (id: string) => {
    if (!currentSchedule) throw new Error('No schedule selected');
    
    try {
      await roleService.delete(currentSchedule.id, id);
      setRoles(prev => prev.filter(r => r.id !== id));
      // Also remove any assignments for this role
      setAssignments(prev => prev.filter(a => a.roleId !== id));
    } catch (err) {
      console.error('Error deleting role:', err);
      throw err;
    }
  };

  const getRoleById = (id: string): Role | undefined => {
    return roles.find(r => r.id === id);
  };

  const refreshData = async () => {
    if (!currentSchedule || !user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Refresh schedules
      const userSchedules = await scheduleService.getAll(user.uid);
      setSchedules(userSchedules);
      
      // Refresh current schedule data
      const [membersData, peopleData, assignmentsData, rolesData] = await Promise.all([
        scheduleService.getMembers(currentSchedule.id),
        peopleService.getAll(currentSchedule.id),
        assignmentService.getAll(currentSchedule.id),
        roleService.getAll(currentSchedule.id)
      ]);
      
      setScheduleMembers(membersData);
      setPeople(peopleData);
      setAssignments(assignmentsData);
      setRoles(rolesData);
      
      // Update current schedule in case it changed
      const updatedSchedule = userSchedules.find(s => s.id === currentSchedule.id);
      if (updatedSchedule) {
        setCurrentSchedule(updatedSchedule);
      }
    } catch (err) {
      console.error('Error refreshing data:', err);
      setError('Failed to refresh data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const hasScheduleAccess = (scheduleId: string): boolean => {
    if (!user) return false;
    return schedules.some(s => s.id === scheduleId);
  };

  const value: FirestoreContextType = {
    schedules,
    currentSchedule,
    setCurrentSchedule: handleSetCurrentSchedule,
    setCurrentScheduleById,
    addSchedule,
    updateSchedule,
    deleteSchedule,
    scheduleMembers,
    addScheduleMember,
    removeScheduleMember,
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
    roles,
    addRole,
    updateRole,
    deleteRole,
    getRoleById,
    loading,
    error,
    refreshData,
    hasScheduleAccess
  };

  return (
    <FirestoreContext.Provider value={value}>
      {children}
    </FirestoreContext.Provider>
  );
};