
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
