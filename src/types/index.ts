export type RoleId =
  | 'preacher'
  | 'elder_on_duty'
  | 'ss_host_afrikaans'
  | 'ss_host_english'
  | 'offering_coordinator'
  | 'security_duty'
  | 'welcoming_team'
  | 'announcements_presenter';

export interface Role {
  id: RoleId;
  name: string;
  description?: string;
}

export interface Person {
  id: string; // UUID
  name: string;
  contactInfo?: string; // e.g., email or phone
  fillableRoleIds?: RoleId[]; // Roles this person can fill
  unavailableDates?: string[]; // Array of YYYY-MM-DD strings
}

export interface Assignment {
  id: string; // UUID, or composite key like `${date}_${roleId}`
  date: string; // YYYY-MM-DD, should be a Sabbath (Saturday)
  roleId: RoleId;
  personId: string | null; // null if unassigned
}

export interface SabbathAssignment {
  roleId: RoleId;
  roleName: string;
  person: Person | null;
}

// Service day configuration
export type ServiceDay = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

export interface ServiceDayConfig {
  primaryDay: ServiceDay; // Main service day (e.g., 6 for Saturday, 0 for Sunday)
  additionalDays?: ServiceDay[]; // Optional additional service days
  allowCustomDates?: boolean; // Allow scheduling on any date (for holidays, special events)
}

// New types for multi-tenant structure
export interface Schedule {
  id: string;
  name: string;
  description?: string;
  ownerId: string; // User ID of the owner
  adminUserIds: string[]; // List of user IDs who can manage this schedule
  serviceDayConfig: ServiceDayConfig; // Service day configuration
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface ScheduleMember {
  userId: string; 
  email: string;
  displayName?: string;
  role: 'owner' | 'admin' | 'viewer';
  addedAt: Date | string;
}
