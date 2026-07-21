export const allPermissions = [
  'View Users',
  'Create Users',
  'Edit Users',
  'Delete Users',
  'View Projects',
  'Create Projects',
  'Manage Interns',
  'Manage Supervisors',
];

export const roles = [
  { id: 1, name: 'Admin', permissions: [...allPermissions] },
  { id: 2, name: 'Supervisor', permissions: ['View Users', 'View Projects', 'Manage Interns'] },
  { id: 3, name: 'Intern', permissions: ['View Projects'] },
];

export default roles;
