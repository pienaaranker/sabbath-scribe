import { 
  collection, 
  getDocs, 
  doc,
  setDoc,
  serverTimestamp,
  getDoc,
  Timestamp,
  query,
  limit,
} from 'firebase/firestore';
import { db } from './firebase';
import { peopleService, assignmentService, initializeScheduleRoles, scheduleService } from './firestore';
import type { Person, Assignment, Role } from '@/types';

/**
 * Migrates data from the old flat structure to the new multi-tenant structure.
 * 
 * @param userId - The user ID to set as the owner of the migrated data
 * @param scheduleName - The name to give the new schedule
 * @returns The ID of the newly created schedule
 */
export async function migrateData(
  userId: string, 
  scheduleName: string = 'My Schedule',
  description: string = 'Migrated from previous version'
): Promise<string> {
  try {
    console.log('Starting data migration...');
    
    // Check if there's data to migrate
    const peopleQuery = query(collection(db, 'people'), limit(1));
    const peopleSnapshot = await getDocs(peopleQuery);
    const assignmentsQuery = query(collection(db, 'assignments'), limit(1));
    const assignmentsSnapshot = await getDocs(assignmentsQuery);
    
    if (peopleSnapshot.empty && assignmentsSnapshot.empty) {
      console.log('No data to migrate');
      return '';
    }
    
    // Create a new schedule
    const scheduleId = await scheduleService.create(userId, {
      name: scheduleName,
      description,
      adminUserIds: [],
    });
    
    console.log(`Created new schedule with ID: ${scheduleId}`);
    
    // Initialize roles for the new schedule
    await initializeScheduleRoles(scheduleId);
    console.log('Initialized roles for the new schedule');
    
    // Migrate people
    const peopleSnapshot2 = await getDocs(collection(db, 'people'));
    if (!peopleSnapshot2.empty) {
      console.log(`Migrating ${peopleSnapshot2.size} people...`);
      
      for (const personDoc of peopleSnapshot2.docs) {
        const personData = personDoc.data() as Omit<Person, 'id'>;
        await setDoc(
          doc(db, 'schedules', scheduleId, 'people', personDoc.id),
          personData
        );
      }
      
      console.log('People migration complete');
    }
    
    // Migrate assignments
    const assignmentsSnapshot2 = await getDocs(collection(db, 'assignments'));
    if (!assignmentsSnapshot2.empty) {
      console.log(`Migrating ${assignmentsSnapshot2.size} assignments...`);
      
      for (const assignmentDoc of assignmentsSnapshot2.docs) {
        const assignmentData = assignmentDoc.data();
        // Convert any timestamps to date strings if needed
        if (assignmentData.date instanceof Timestamp) {
          assignmentData.date = assignmentData.date.toDate().toISOString().split('T')[0];
        }
        
        await setDoc(
          doc(db, 'schedules', scheduleId, 'assignments', assignmentDoc.id),
          assignmentData
        );
      }
      
      console.log('Assignments migration complete');
    }
    
    // Migrate roles (optional, as roles are initialized by default)
    const rolesSnapshot = await getDocs(collection(db, 'roles'));
    if (!rolesSnapshot.empty) {
      console.log(`Migrating ${rolesSnapshot.size} custom roles...`);
      
      for (const roleDoc of rolesSnapshot.docs) {
        const roleData = roleDoc.data() as Role;
        await setDoc(
          doc(db, 'schedules', scheduleId, 'roles', roleDoc.id),
          roleData
        );
      }
      
      console.log('Roles migration complete');
    }
    
    console.log('Migration completed successfully');
    return scheduleId;
  } catch (error) {
    console.error('Error during migration:', error);
    throw error;
  }
} 