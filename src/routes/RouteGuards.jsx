import { Navigate, useLocation } from 'react-router-dom';
import AppLoading from '../components/common/AppLoading';
import AccessUnavailable from '../pages/errors/AccessUnavailable';
import { useAuth } from '../context/AuthContext';

function hasRequiredAccess(auth, roles = [], permissions = [], managementOnly = false) {
  const roleAllowed = roles.length === 0 || auth.hasAnyRole(roles);
  const permissionAllowed = permissions.length === 0 || auth.hasAnyPermission(permissions);
  const managementAllowed = !managementOnly || auth.hasAnyRole(['admin', 'supervisor']);

  return roleAllowed && permissionAllowed && managementAllowed;
}

export function ProtectedRoute({ children, roles = [], permissions = [], managementOnly = false }) {
  const auth = useAuth();
  const location = useLocation();

  if (auth.isRestoringSession) {
    return <AppLoading message="Restoring your session..." />;
  }

  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!hasRequiredAccess(auth, roles, permissions, managementOnly)) {
    return <AccessUnavailable />;
  }

  return children;
}

export function GuestRoute({ children }) {
  const auth = useAuth();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  if (auth.isRestoringSession) {
    return <AppLoading message="Restoring your session..." />;
  }

  if (auth.isAuthenticated) {
    if (auth.hasAnyRole(['admin', 'supervisor'])) {
      return <Navigate to={from === '/login' ? '/dashboard' : from} replace />;
    }

    return <Navigate to="/access-unavailable" replace />;
  }

  return children;
}
