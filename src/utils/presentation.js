export const ROLE_OPTIONS = [
  { value: 'admin', label: 'Admin' },
  { value: 'supervisor', label: 'Supervisor' },
  { value: 'reviewer', label: 'Reviewer' },
  { value: 'intern', label: 'Intern' },
];

export const USER_ACTIVE_OPTIONS = [
  { value: '', label: 'All account states' },
  { value: 'true', label: 'Active accounts' },
  { value: 'false', label: 'Inactive accounts' },
];

export const INTERN_STATUS_OPTIONS = [
  { value: '', label: 'All internship statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'active', label: 'Active' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'completed', label: 'Completed' },
  { value: 'withdrawn', label: 'Withdrawn' },
];

export const INTERN_STATUS_TRANSITIONS = {
  pending: ['active', 'withdrawn'],
  active: ['suspended', 'completed', 'withdrawn'],
  suspended: ['active', 'withdrawn'],
  completed: [],
  withdrawn: [],
};

export const PROJECT_STATUS_OPTIONS = [
  { value: '', label: 'All project statuses' },
  { value: 'planned', label: 'Planned' },
  { value: 'active', label: 'Active' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export const PROJECT_PRIORITY_OPTIONS = [
  { value: '', label: 'All priorities' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

export const PROJECT_MEMBER_ROLE_OPTIONS = [
  { value: 'lead', label: 'Project Lead' },
  { value: 'reviewer', label: 'Reviewer' },
  { value: 'member', label: 'Member' },
  { value: 'observer', label: 'Observer' },
];

export const PROJECT_MODULE_STATUS_OPTIONS = [
  { value: '', label: 'All module statuses' },
  { value: 'planned', label: 'Planned' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export const PROJECT_STATUS_TRANSITIONS = {
  planned: ['active', 'cancelled'],
  active: ['on_hold', 'completed', 'cancelled'],
  on_hold: ['active', 'cancelled'],
  completed: [],
  cancelled: [],
};

export const PROJECT_MODULE_STATUS_TRANSITIONS = {
  planned: ['active', 'cancelled'],
  active: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

export const PROJECT_MEMBER_ROLE_ELIGIBLE_GLOBAL_ROLES = {
  lead: ['admin', 'supervisor'],
  reviewer: ['admin', 'supervisor', 'reviewer'],
  member: ['admin', 'supervisor', 'intern'],
  observer: ['admin', 'supervisor', 'reviewer', 'intern'],
};

export function optionLabel(options, value, fallback = 'Not available') {
  if (value === null || value === undefined || value === '') return fallback;
  return options.find((option) => option.value === value)?.label || String(value);
}

export function roleLabel(role) {
  return optionLabel(ROLE_OPTIONS, role, role || 'Not available');
}

export function rolesLabel(roles = []) {
  const visibleRoles = roles.filter((role) => role !== ['reporting', 'service'].join('_'));

  if (!visibleRoles.length) return 'No roles';
  return visibleRoles.map(roleLabel).join(', ');
}

export function activeStateLabel(value) {
  return value ? 'Active' : 'Inactive';
}

export function internStatusLabel(status) {
  return optionLabel(INTERN_STATUS_OPTIONS, status, status || 'Not available');
}

export function isTerminalInternStatus(status) {
  return status === 'completed' || status === 'withdrawn';
}

export function validNextInternStatuses(status) {
  return INTERN_STATUS_TRANSITIONS[status] || [];
}

export function projectStatusLabel(status) {
  return optionLabel(PROJECT_STATUS_OPTIONS, status, status || 'Not available');
}

export function projectPriorityLabel(priority) {
  return optionLabel(PROJECT_PRIORITY_OPTIONS, priority, priority || 'Not available');
}

export function projectMemberRoleLabel(role) {
  return optionLabel(PROJECT_MEMBER_ROLE_OPTIONS, role, role || 'Not available');
}

export function projectModuleStatusLabel(status) {
  return optionLabel(PROJECT_MODULE_STATUS_OPTIONS, status, status || 'Not available');
}

export function isTerminalProjectStatus(status) {
  return status === 'completed' || status === 'cancelled';
}

export function validNextProjectStatuses(status) {
  return PROJECT_STATUS_TRANSITIONS[status] || [];
}

export function isTerminalProjectModuleStatus(status) {
  return status === 'completed' || status === 'cancelled';
}

export function validNextProjectModuleStatuses(status) {
  return PROJECT_MODULE_STATUS_TRANSITIONS[status] || [];
}
