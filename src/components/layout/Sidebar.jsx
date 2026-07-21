import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Assignment,
  AccountTree,
  Dashboard,
  ExpandLess,
  ExpandMore,
  Group,
  People,
  PersonAdd,
  School,
  TaskAlt,
} from '@mui/icons-material';

const sections = [
  {
    label: 'Users',
    items: [
      { label: 'All Users', to: '/users', icon: <People fontSize="small" />, permission: 'users.view' },
      { label: 'Interns', to: '/interns', icon: <School fontSize="small" />, permission: 'interns.view' },
      { label: 'Create Intern', to: '/interns/create', icon: <PersonAdd fontSize="small" />, permission: 'interns.manage' },
      { label: 'Supervisors', to: '/supervisors', icon: <Group fontSize="small" />, permission: 'users.view' },
      { label: 'Tracks', to: '/tracks', icon: <AccountTree fontSize="small" />, permission: 'tracks.view' },
    ],
  },
  {
    label: 'Projects',
    items: [
      { label: 'All Projects', to: '/projects', icon: <Assignment fontSize="small" />, permission: 'projects.view' },
      { label: 'Create Project', to: '/projects/create', icon: <PersonAdd fontSize="small" />, permission: 'projects.manage' },
    ],
  },
  {
    label: 'Tasks',
    items: [
      { label: 'All Tasks', to: '/tasks', icon: <TaskAlt fontSize="small" />, permission: 'tasks.view' },
      { label: 'Create Task', to: '/tasks/create', icon: <PersonAdd fontSize="small" />, permission: 'tasks.manage' },
    ],
  },
];

const Sidebar = () => {
  const { hasAnyRole, hasPermission } = useAuth();
  const [openSections, setOpenSections] = useState({ Users: true, Projects: true, Tasks: true });
  const canUseManagementNav = hasAnyRole(['admin', 'supervisor']);
  const canViewDashboard = canUseManagementNav && hasPermission('dashboard.view');

  const toggleSection = (section) => {
    setOpenSections((current) => ({ ...current, [section]: !current[section] }));
  };

  const visibleSections = canUseManagementNav
    ? sections
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => !item.permission || hasPermission(item.permission)),
      }))
      .filter((section) => section.items.length > 0)
    : [];

  return (
    <aside style={sidebarStyle}>
      <h2 style={brandStyle}>Management<br />System Platform</h2>

      <nav aria-label="Main navigation">
        {canViewDashboard && (
          <NavLink
            to="/dashboard"
            style={({ isActive }) => ({ ...dashboardLinkStyle, ...(isActive ? activeMenuLinkStyle : {}) })}
          >
            <Dashboard fontSize="small" />
            Dashboard
          </NavLink>
        )}

        {visibleSections.map((section) => {
          const isOpen = openSections[section.label];

          return (
            <div key={section.label} style={sectionStyle}>
              <button
                type="button"
                onClick={() => toggleSection(section.label)}
                aria-expanded={isOpen}
                style={sectionButtonStyle}
              >
                <span>{section.label}</span>
                {isOpen ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
              </button>

              {isOpen && (
                <div style={menuStyle}>
                  {section.items.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.to === '/users' || item.to === '/projects' || item.to === '/tasks'}
                      style={({ isActive }) => ({ ...menuLinkStyle, ...(isActive ? activeMenuLinkStyle : {}) })}
                    >
                      {item.icon}
                      {item.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
};

const sidebarStyle = {
  width: '260px',
  minHeight: '100vh',
  background: '#719430',
  color: '#fff',
  padding: '24px 15px',
  position: 'fixed',
  overflowY: 'auto',
};

const brandStyle = { margin: '4px 6px 36px', fontSize: '22px', lineHeight: 1.35 };
const sectionStyle = { marginBottom: '12px' };
const sectionButtonStyle = {
  width: '100%',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  border: 1,
  background: 'transparent',
  color: '#fff',
  cursor: 'pointer',
  padding: '12px',
  fontSize: '14px',
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
};
const menuStyle = { display: 'flex', flexDirection: 'column', gap: '4px' };
const dashboardLinkStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  color: '#fff',
  textDecoration: 'none',
  padding: '10px',
  borderRadius: '8px',
  fontSize: '14px',
  marginBottom: '16px',
};
const menuLinkStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  color: '#fff',
  textDecoration: 'none',
  padding: '10px',
  borderRadius: '8px',
  fontSize: '14px',
};
const activeMenuLinkStyle = { background: 'rgba(255, 255, 255, 0.22)', fontWeight: 700 };

export default Sidebar;
