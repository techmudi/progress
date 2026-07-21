import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import Login from '../pages/auth/Login';
import Dashboard from '../pages/dashboard/Dashboard';
import AllUsers from '../pages/users/AllUsers';
import CreateUser from '../pages/users/CreateUser';
import EditUser from '../pages/users/EditUser';
import UserDetails from '../pages/users/UserDetails';
import RolesPermissions from '../pages/users/RolesPermissions';
import Interns from '../pages/interns/Interns';
import Supervisors from '../pages/supervisors/Supervisors';
import AllProjects from '../pages/projects/AllProjects';
import CreateProject from '../pages/projects/CreateProject';
import ProjectMembers from '../pages/projects/ProjectMembers';
import AllTasks from '../pages/tasks/AllTasks';
import CreateTask from '../pages/tasks/CreateTask';

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/users" element={<AllUsers />} />
          <Route path="/users/create" element={<CreateUser />} />
          <Route path="/users/:id" element={<UserDetails />} />
          <Route path="/users/edit/:id" element={<EditUser />} />
          <Route path="/users/roles" element={<RolesPermissions />} />
          <Route path="/interns" element={<Interns />} />
          <Route path="/supervisors" element={<Supervisors />} />
          <Route path="/projects" element={<AllProjects />} />
          <Route path="/projects/create" element={<CreateProject />} />
          <Route path="/projects/members" element={<ProjectMembers />} />
          <Route path="/tasks" element={<AllTasks />} />
          <Route path="/tasks/create" element={<CreateTask />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
