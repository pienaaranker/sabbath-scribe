import type { Role, RoleId } from '@/types';

export const APP_NAME = 'InService';

export const ROLES_CONFIG: Role[] = [
  { id: 'preacher', name: 'Preacher' },
  { id: 'elder_on_duty', name: 'Elder on Duty' },
  { id: 'ss_host_afrikaans', name: 'Sabbath School Host (Afrikaans)' },
  { id: 'ss_host_english', name: 'Sabbath School Host (English)' },
  { id: 'offering_coordinator', name: 'Offering Coordinator' },
  { id: 'security_duty', name: 'Security Duty' },
  { id: 'welcoming_team', name: 'Welcoming Team Member' }, // Changed to singular for easier assignment
  { id: 'announcements_presenter', name: 'Announcements Presenter' },
];

export const ROLE_NAMES_MAP: Record<RoleId, string> = ROLES_CONFIG.reduce((acc, role) => {
  acc[role.id] = role.name;
  return acc;
}, {} as Record<RoleId, string>);
