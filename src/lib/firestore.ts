import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  Timestamp,
  setDoc,
  serverTimestamp,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from './firebase';
import type { Person, Assignment, RoleId, Schedule, ScheduleMember, Role } from '@/types';

// Collection names
export const COLLECTIONS = {
  SCHEDULES: 'schedules',
  PEOPLE: 'people',
  ASSIGNMENTS: 'assignments',
  ROLES: 'roles',
  MEMBERS: 'members'
} as const;

// Schedule Operations
export const scheduleService = {
  async getAll(userId: string): Promise<Schedule[]> {
    // Get schedules where user is owner or admin
    const ownedQuery = query(
      collection(db, COLLECTIONS.SCHEDULES),
      where('ownerId', '==', userId)
    );
    
    const adminQuery = query(
      collection(db, COLLECTIONS.SCHEDULES),
      where('adminUserIds', 'array-contains', userId)
    );
    
    const [ownedSnapshot, adminSnapshot] = await Promise.all([
      getDocs(ownedQuery),
      getDocs(adminQuery)
    ]);
    
    // Combine results, making sure to deduplicate
    const schedules: Schedule[] = [];
    const schedulesMap = new Map<string, Schedule>();
    
    ownedSnapshot.docs.forEach(doc => {
      const data = doc.data();
      schedulesMap.set(doc.id, {
        id: doc.id,
        ...data,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt
      } as Schedule);
    });
    
    adminSnapshot.docs.forEach(doc => {
      if (!schedulesMap.has(doc.id)) {
        const data = doc.data();
        schedulesMap.set(doc.id, {
          id: doc.id,
          ...data,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
          updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt
        } as Schedule);
      }
    });
    
    return Array.from(schedulesMap.values());
  },
  
  async getById(scheduleId: string): Promise<Schedule | null> {
    const docRef = doc(db, COLLECTIONS.SCHEDULES, scheduleId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt
      } as Schedule;
    }
    return null;
  },
  
  async create(userId: string, schedule: Omit<Schedule, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>): Promise<string> {
    console.log('[scheduleService.create] userId:', userId);
    console.log('[scheduleService.create] input schedule:', JSON.stringify(schedule, null, 2));
    // Clean up any undefined values since Firestore doesn't support them
    const cleanSchedule = Object.fromEntries(
      Object.entries({
        ...schedule,
        adminUserIds: (schedule.adminUserIds && schedule.adminUserIds.length > 0)
          ? Array.from(new Set([userId, ...schedule.adminUserIds]))
          : [userId],
      }).filter(([_, value]) => value !== undefined)
    );
    console.log('[scheduleService.create] cleanSchedule:', JSON.stringify(cleanSchedule, null, 2));
    const newSchedule = {
      ...cleanSchedule,
      ownerId: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    console.log('[scheduleService.create] newSchedule (to Firestore):', JSON.stringify({
      ...newSchedule,
      createdAt: '[serverTimestamp]',
      updatedAt: '[serverTimestamp]'
    }, null, 2));
    console.log('[scheduleService.create] About to call addDoc with payload:', JSON.stringify(newSchedule, null, 2));
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.SCHEDULES), newSchedule);
      console.log('[scheduleService.create] Schedule document created with ID:', docRef.id);
      // Add a delay to allow Firestore to propagate the new document for security rules
      await new Promise(res => setTimeout(res, 1000));
      return docRef.id;
    } catch (err) {
      console.error('[scheduleService.create] Error creating schedule:', err, {
        userId,
        ownerId: newSchedule.ownerId,
        payload: newSchedule
      });
      throw err;
    }
  },
  
  async update(scheduleId: string, schedule: Partial<Omit<Schedule, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.SCHEDULES, scheduleId);
    await updateDoc(docRef, {
      ...schedule,
      updatedAt: serverTimestamp()
    });
  },
  
  async delete(scheduleId: string): Promise<void> {
    const docRef = doc(db, COLLECTIONS.SCHEDULES, scheduleId);
    await deleteDoc(docRef);
    // Note: This does not delete subcollections
    // For production, you might want to use a Firebase function to delete all subcollections
  },
  
  async addMember(scheduleId: string, member: Omit<ScheduleMember, 'addedAt'>): Promise<void> {
    const memberRef = doc(db, COLLECTIONS.SCHEDULES, scheduleId, COLLECTIONS.MEMBERS, member.userId);
    await setDoc(memberRef, {
      ...member,
      addedAt: serverTimestamp()
    });
    
    // If the member is an admin, add them to adminUserIds
    if (member.role === 'admin') {
      const scheduleRef = doc(db, COLLECTIONS.SCHEDULES, scheduleId);
      await updateDoc(scheduleRef, {
        adminUserIds: arrayUnion(member.userId),
        updatedAt: serverTimestamp()
      });
    }
  },
  
  async removeMember(scheduleId: string, userId: string): Promise<void> {
    const memberRef = doc(db, COLLECTIONS.SCHEDULES, scheduleId, COLLECTIONS.MEMBERS, userId);
    await deleteDoc(memberRef);
    
    // If the member was an admin, remove them from adminUserIds
    const scheduleRef = doc(db, COLLECTIONS.SCHEDULES, scheduleId);
    await updateDoc(scheduleRef, {
      adminUserIds: arrayRemove(userId),
      updatedAt: serverTimestamp()
    });
  },
  
  async getMembers(scheduleId: string): Promise<ScheduleMember[]> {
    const membersRef = collection(db, COLLECTIONS.SCHEDULES, scheduleId, COLLECTIONS.MEMBERS);
    const snapshot = await getDocs(membersRef);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        addedAt: data.addedAt instanceof Timestamp ? data.addedAt.toDate() : data.addedAt
      } as ScheduleMember;
    });
  }
};

// People Operations
export const peopleService = {
  async getAll(scheduleId: string): Promise<Person[]> {
    const snapshot = await getDocs(collection(db, COLLECTIONS.SCHEDULES, scheduleId, COLLECTIONS.PEOPLE));
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Person[];
  },

  async getById(scheduleId: string, personId: string): Promise<Person | null> {
    const docRef = doc(db, COLLECTIONS.SCHEDULES, scheduleId, COLLECTIONS.PEOPLE, personId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as Person;
    }
    return null;
  },

  async create(scheduleId: string, person: Omit<Person, 'id'>): Promise<string> {
    // Clean up any undefined values
    const cleanPerson = Object.fromEntries(
      Object.entries(person).filter(([_, value]) => value !== undefined)
    );
    
    const docRef = await addDoc(collection(db, COLLECTIONS.SCHEDULES, scheduleId, COLLECTIONS.PEOPLE), cleanPerson);
    return docRef.id;
  },

  async update(scheduleId: string, personId: string, person: Partial<Omit<Person, 'id'>>): Promise<void> {
    // Clean up any undefined values
    const cleanUpdates = Object.fromEntries(
      Object.entries(person).filter(([_, value]) => value !== undefined)
    );
    
    const docRef = doc(db, COLLECTIONS.SCHEDULES, scheduleId, COLLECTIONS.PEOPLE, personId);
    await updateDoc(docRef, cleanUpdates);
  },

  async delete(scheduleId: string, personId: string): Promise<void> {
    const docRef = doc(db, COLLECTIONS.SCHEDULES, scheduleId, COLLECTIONS.PEOPLE, personId);
    await deleteDoc(docRef);
  }
};

// Assignment Operations
export const assignmentService = {
  async getAll(scheduleId: string): Promise<Assignment[]> {
    const snapshot = await getDocs(collection(db, COLLECTIONS.SCHEDULES, scheduleId, COLLECTIONS.ASSIGNMENTS));
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Convert Firestore timestamp to string
      date: doc.data().date instanceof Timestamp ? doc.data().date.toDate().toISOString().split('T')[0] : doc.data().date
    })) as Assignment[];
  },

  async getByDate(scheduleId: string, date: string): Promise<Assignment[]> {
    const q = query(
      collection(db, COLLECTIONS.SCHEDULES, scheduleId, COLLECTIONS.ASSIGNMENTS),
      where('date', '==', date)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date instanceof Timestamp ? doc.data().date.toDate().toISOString().split('T')[0] : doc.data().date
    })) as Assignment[];
  },

  async getByDateRange(scheduleId: string, startDate: string, endDate: string): Promise<Assignment[]> {
    const q = query(
      collection(db, COLLECTIONS.SCHEDULES, scheduleId, COLLECTIONS.ASSIGNMENTS),
      where('date', '>=', startDate),
      where('date', '<=', endDate),
      orderBy('date')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date instanceof Timestamp ? doc.data().date.toDate().toISOString().split('T')[0] : doc.data().date
    })) as Assignment[];
  },

  async create(scheduleId: string, assignment: Omit<Assignment, 'id'>): Promise<string> {
    // Clean up any undefined values
    const cleanAssignment = Object.fromEntries(
      Object.entries(assignment).filter(([_, value]) => value !== undefined)
    );
    
    const docRef = await addDoc(collection(db, COLLECTIONS.SCHEDULES, scheduleId, COLLECTIONS.ASSIGNMENTS), cleanAssignment);
    return docRef.id;
  },

  async update(scheduleId: string, assignmentId: string, assignment: Partial<Omit<Assignment, 'id'>>): Promise<void> {
    // Clean up any undefined values
    const cleanUpdates = Object.fromEntries(
      Object.entries(assignment).filter(([_, value]) => value !== undefined)
    );
    
    const docRef = doc(db, COLLECTIONS.SCHEDULES, scheduleId, COLLECTIONS.ASSIGNMENTS, assignmentId);
    await updateDoc(docRef, cleanUpdates);
  },

  async delete(scheduleId: string, assignmentId: string): Promise<void> {
    const docRef = doc(db, COLLECTIONS.SCHEDULES, scheduleId, COLLECTIONS.ASSIGNMENTS, assignmentId);
    await deleteDoc(docRef);
  },

  async deleteByDate(scheduleId: string, date: string): Promise<void> {
    const q = query(
      collection(db, COLLECTIONS.SCHEDULES, scheduleId, COLLECTIONS.ASSIGNMENTS),
      where('date', '==', date)
    );
    const snapshot = await getDocs(q);
    const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
  }
};

// Role Operations
export const roleService = {
  async getAll(scheduleId: string): Promise<Role[]> {
    const snapshot = await getDocs(collection(db, COLLECTIONS.SCHEDULES, scheduleId, COLLECTIONS.ROLES));
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Role[];
  },

  async getById(scheduleId: string, roleId: string): Promise<Role | null> {
    const docRef = doc(db, COLLECTIONS.SCHEDULES, scheduleId, COLLECTIONS.ROLES, roleId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as Role;
    }
    return null;
  },

  async create(scheduleId: string, role: Omit<Role, 'id'>): Promise<string> {
    // Clean up any undefined values
    const cleanRole = Object.fromEntries(
      Object.entries(role).filter(([_, value]) => value !== undefined)
    );
    
    // Check if this role has a custom ID to be used
    if ('id' in role) {
      // Use the provided ID
      const roleId = (role as Role).id;
      await setDoc(doc(db, COLLECTIONS.SCHEDULES, scheduleId, COLLECTIONS.ROLES, roleId), cleanRole);
      return roleId;
    } else {
      // Auto-generate an ID
      const docRef = await addDoc(collection(db, COLLECTIONS.SCHEDULES, scheduleId, COLLECTIONS.ROLES), cleanRole);
      return docRef.id;
    }
  },

  async update(scheduleId: string, roleId: string, role: Partial<Omit<Role, 'id'>>): Promise<void> {
    // Clean up any undefined values
    const cleanUpdates = Object.fromEntries(
      Object.entries(role).filter(([_, value]) => value !== undefined)
    );
    
    const docRef = doc(db, COLLECTIONS.SCHEDULES, scheduleId, COLLECTIONS.ROLES, roleId);
    await updateDoc(docRef, cleanUpdates);
  },

  async delete(scheduleId: string, roleId: string): Promise<void> {
    const docRef = doc(db, COLLECTIONS.SCHEDULES, scheduleId, COLLECTIONS.ROLES, roleId);
    await deleteDoc(docRef);
  }
};

// Utility function to initialize default roles for a new schedule
export const initializeScheduleRoles = async (scheduleId: string) => {
  const rolesRef = collection(db, COLLECTIONS.SCHEDULES, scheduleId, COLLECTIONS.ROLES);
  const snapshot = await getDocs(rolesRef);
  
  if (snapshot.empty) {
    const defaultRoles = [
      { id: 'preacher', name: 'Preacher', description: 'Delivers the main sermon' },
      { id: 'elder-on-duty', name: 'Elder on Duty', description: 'Oversees the service' },
      { id: 'sabbath-school-host', name: 'Sabbath School Host', description: 'Leads Sabbath School' },
      { id: 'pianist', name: 'Pianist', description: 'Provides musical accompaniment' },
      { id: 'song-leader', name: 'Song Leader', description: 'Leads congregational singing' },
      { id: 'deacon', name: 'Deacon', description: 'Assists with service logistics' },
      { id: 'greeter', name: 'Greeter', description: 'Welcomes congregation members' }
    ];

    const createPromises = defaultRoles.map(role => 
      addDoc(rolesRef, role)
    );
    
    await Promise.all(createPromises);
    console.log(`Default roles initialized for schedule ${scheduleId}`);
  }
};

// Legacy function for backward compatibility - will be removed after migration
export const initializeRoles = async () => {
  const rolesRef = collection(db, COLLECTIONS.ROLES);
  const snapshot = await getDocs(rolesRef);
  
  if (snapshot.empty) {
    const defaultRoles = [
      { id: 'preacher', name: 'Preacher', description: 'Delivers the main sermon' },
      { id: 'elder-on-duty', name: 'Elder on Duty', description: 'Oversees the service' },
      { id: 'sabbath-school-host', name: 'Sabbath School Host', description: 'Leads Sabbath School' },
      { id: 'pianist', name: 'Pianist', description: 'Provides musical accompaniment' },
      { id: 'song-leader', name: 'Song Leader', description: 'Leads congregational singing' },
      { id: 'deacon', name: 'Deacon', description: 'Assists with service logistics' },
      { id: 'greeter', name: 'Greeter', description: 'Welcomes congregation members' }
    ];

    const createPromises = defaultRoles.map(role => 
      addDoc(rolesRef, role)
    );
    
    await Promise.all(createPromises);
    console.log('Default roles initialized');
  }
};

// Helper to get roles from a schedule - Use roleService.getAll instead for new code
export const getRoles = async (scheduleId: string): Promise<Role[]> => {
  return roleService.getAll(scheduleId);
};