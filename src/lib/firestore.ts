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
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import type { Person, Assignment, RoleId } from '@/types';

// Collection names
const COLLECTIONS = {
  PEOPLE: 'people',
  ASSIGNMENTS: 'assignments',
  ROLES: 'roles'
} as const;

// People Operations
export const peopleService = {
  async getAll(): Promise<Person[]> {
    const snapshot = await getDocs(collection(db, COLLECTIONS.PEOPLE));
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Person[];
  },

  async getById(id: string): Promise<Person | null> {
    const docRef = doc(db, COLLECTIONS.PEOPLE, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as Person;
    }
    return null;
  },

  async create(person: Omit<Person, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTIONS.PEOPLE), person);
    return docRef.id;
  },

  async update(id: string, person: Partial<Omit<Person, 'id'>>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.PEOPLE, id);
    await updateDoc(docRef, person);
  },

  async delete(id: string): Promise<void> {
    const docRef = doc(db, COLLECTIONS.PEOPLE, id);
    await deleteDoc(docRef);
  }
};

// Assignment Operations
export const assignmentService = {
  async getAll(): Promise<Assignment[]> {
    const snapshot = await getDocs(collection(db, COLLECTIONS.ASSIGNMENTS));
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Convert Firestore timestamp to string
      date: doc.data().date instanceof Timestamp ? doc.data().date.toDate().toISOString().split('T')[0] : doc.data().date
    })) as Assignment[];
  },

  async getByDate(date: string): Promise<Assignment[]> {
    const q = query(
      collection(db, COLLECTIONS.ASSIGNMENTS),
      where('date', '==', date)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date instanceof Timestamp ? doc.data().date.toDate().toISOString().split('T')[0] : doc.data().date
    })) as Assignment[];
  },

  async getByDateRange(startDate: string, endDate: string): Promise<Assignment[]> {
    const q = query(
      collection(db, COLLECTIONS.ASSIGNMENTS),
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

  async create(assignment: Omit<Assignment, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTIONS.ASSIGNMENTS), assignment);
    return docRef.id;
  },

  async update(id: string, assignment: Partial<Omit<Assignment, 'id'>>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.ASSIGNMENTS, id);
    await updateDoc(docRef, assignment);
  },

  async delete(id: string): Promise<void> {
    const docRef = doc(db, COLLECTIONS.ASSIGNMENTS, id);
    await deleteDoc(docRef);
  },

  async deleteByDate(date: string): Promise<void> {
    const q = query(
      collection(db, COLLECTIONS.ASSIGNMENTS),
      where('date', '==', date)
    );
    const snapshot = await getDocs(q);
    const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
  }
};

// Utility function to initialize default roles (run once)
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