import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import { GuestRoute, ProtectedRoute } from './RouteGuards';
import Login from '../pages/auth/Login';
import Dashboard from '../pages/dashboard/Dashboard';
import AllUsers from '../pages/users/AllUsers';
import CreateUser from '../pages/users/CreateUser';
import EditUser from '../pages/users/EditUser';
import UserDetails from '../pages/users/UserDetails';
import RolesPermissions from '../pages/users/RolesPermissions';
import Interns from '../pages/interns/Interns';
import CreateIntern from '../pages/interns/CreateIntern';
import EditIntern from '../pages/interns/EditIntern';
import InternDetails from '../pages/interns/InternDetails';
import Supervisors from '../pages/supervisors/Supervisors';
import Tracks from '../pages/tracks/Tracks';
import CreateTrack from '../pages/tracks/CreateTrack';
import EditTrack from '../pages/tracks/EditTrack';
import AllProjects from '../pages/projects/AllProjects';
import CreateProject from '../pages/projects/CreateProject';
import EditProject from '../pages/projects/EditProject';
import ProjectDetails from '../pages/projects/ProjectDetails';
import ProjectMembers from '../pages/projects/ProjectMembers';
import ProjectModules from '../pages/projects/ProjectModules';
import AllTasks from '../pages/tasks/AllTasks';
import CreateTask from '../pages/tasks/CreateTask';
import AccessUnavailable from '../pages/errors/AccessUnavailable';

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/access-unavailable" element={<AccessUnavailable />} />
        <Route element={<ProtectedRoute managementOnly><MainLayout /></ProtectedRoute>}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<ProtectedRoute roles={['admin', 'supervisor']} permissions={['dashboard.view']}><Dashboard /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute permissions={['users.view']}><AllUsers /></ProtectedRoute>} />
          <Route path="/users/create" element={<ProtectedRoute permissions={['users.create']}><CreateUser /></ProtectedRoute>} />
          <Route path="/users/:id" element={<ProtectedRoute permissions={['users.view']}><UserDetails /></ProtectedRoute>} />
          <Route path="/users/edit/:id" element={<ProtectedRoute permissions={['users.update']}><EditUser /></ProtectedRoute>} />
          <Route path="/users/roles" element={<ProtectedRoute permissions={['users.update']}><RolesPermissions /></ProtectedRoute>} />
          <Route path="/interns" element={<ProtectedRoute permissions={['interns.view']}><Interns /></ProtectedRoute>} />
          <Route path="/interns/create" element={<ProtectedRoute permissions={['interns.manage']}><CreateIntern /></ProtectedRoute>} />
          <Route path="/interns/:id" element={<ProtectedRoute permissions={['interns.view']}><InternDetails /></ProtectedRoute>} />
          <Route path="/interns/:id/edit" element={<ProtectedRoute permissions={['interns.manage']}><EditIntern /></ProtectedRoute>} />
          <Route path="/supervisors" element={<ProtectedRoute permissions={['users.view']}><Supervisors /></ProtectedRoute>} />
          <Route path="/tracks" element={<ProtectedRoute permissions={['tracks.view']}><Tracks /></ProtectedRoute>} />
          <Route path="/tracks/create" element={<ProtectedRoute permissions={['tracks.manage']}><CreateTrack /></ProtectedRoute>} />
          <Route path="/tracks/:id/edit" element={<ProtectedRoute permissions={['tracks.manage']}><EditTrack /></ProtectedRoute>} />
          <Route path="/projects" element={<ProtectedRoute permissions={['projects.view']}><AllProjects /></ProtectedRoute>} />
          <Route path="/projects/create" element={<ProtectedRoute permissions={['projects.manage']}><CreateProject /></ProtectedRoute>} />
          <Route path="/projects/members" element={<Navigate to="/projects" replace />} />
          <Route path="/projects/:projectId" element={<ProtectedRoute permissions={['projects.view']}><ProjectDetails /></ProtectedRoute>} />
          <Route path="/projects/:projectId/edit" element={<ProtectedRoute permissions={['projects.manage']}><EditProject /></ProtectedRoute>} />
          <Route path="/projects/:projectId/members" element={<ProtectedRoute permissions={['projects.view']}><ProjectMembers /></ProtectedRoute>} />
          <Route path="/projects/:projectId/modules" element={<ProtectedRoute permissions={['projects.view']}><ProjectModules /></ProtectedRoute>} />
          <Route path="/tasks" element={<ProtectedRoute permissions={['tasks.view']}><AllTasks /></ProtectedRoute>} />
          <Route path="/tasks/create" element={<ProtectedRoute permissions={['tasks.manage']}><CreateTask /></ProtectedRoute>} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
        <Route path="/tasks" element={<AllTasks />} />
        <Route path="/tasks/create" element={<CreateTask />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
