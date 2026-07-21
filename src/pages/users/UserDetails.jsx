import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  FormGroup,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import ApiState from '../../components/common/ApiState';
import AppLoading from '../../components/common/AppLoading';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import StatusChip from '../../components/common/StatusChip';
import FormError from '../../components/forms/FormError';
import { useAuth } from '../../context/AuthContext';
import { activateUser, deactivateUser, getUser, syncUserRoles } from '../../services/userService';
import { formatDateTime } from '../../utils/formatters';
import { ROLE_OPTIONS, internStatusLabel, rolesLabel } from '../../utils/presentation';

function DetailLine({ label, children }) {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="space-between">
      <Typography color="text.secondary">{label}</Typography>
      <Box sx={{ fontWeight: 700, textAlign: { xs: 'left', sm: 'right' } }}>{children}</Box>
    </Stack>
  );
}

function UserDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const auth = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accountAction, setAccountAction] = useState(null);
  const [actionError, setActionError] = useState('');
  const [actionSaving, setActionSaving] = useState(false);
  const [rolesOpen, setRolesOpen] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [roleError, setRoleError] = useState(null);
  const [rolesSaving, setRolesSaving] = useState(false);

  const canEdit = auth.hasPermission('users.update');
  const canDeactivate = auth.hasPermission('users.deactivate');
  const canViewInterns = auth.hasPermission('interns.view');

  const loadUser = async (signal) => {
    setLoading(true);
    setError(null);

    try {
      const result = await getUser(id, signal);
      setUser(result.user);
    } catch (caught) {
      if (caught?.type !== 'cancelled') {
        setError(caught);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    loadUser(controller.signal);
    return () => controller.abort();
  }, [id]);

  const openRolesDialog = () => {
    setSelectedRoles(user?.roles || []);
    setRoleError(null);
    setRolesOpen(true);
  };

  const toggleRole = (role) => {
    setSelectedRoles((current) => (
      current.includes(role) ? current.filter((item) => item !== role) : [...current, role]
    ));
  };

  const saveRoles = async () => {
    if (selectedRoles.length === 0) {
      setRoleError({ message: 'Select at least one role.' });
      return;
    }

    setRolesSaving(true);
    setRoleError(null);

    try {
      const result = await syncUserRoles(id, selectedRoles);
      setUser(result.user);
      setRolesOpen(false);

      if (auth.user?.id === result.user?.id) {
        await auth.refreshCurrentUser();
      }
    } catch (caught) {
      setRoleError(caught);
    } finally {
      setRolesSaving(false);
    }
  };

  const confirmAccountAction = async () => {
    if (!accountAction) return;

    setActionSaving(true);
    setActionError('');

    try {
      const result = accountAction === 'activate'
        ? await activateUser(id)
        : await deactivateUser(id);
      setUser(result.user);
      setAccountAction(null);
    } catch (caught) {
      setActionError(caught.message || 'Unable to update this user.');
    } finally {
      setActionSaving(false);
    }
  };

  if (loading) {
    return <AppLoading message="Loading user profile..." />;
  }

  if (error) {
    return (
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <ApiState error={error} onRetry={() => loadUser()} />
      </Paper>
    );
  }

  return (
    <Box>
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', md: 'center' }} spacing={2} sx={{ mb: 3 }}>
          <Box>
            <Typography variant="h5" fontWeight={700}>User Profile</Typography>
            <Typography color="text.secondary">{user.name}</Typography>
          </Box>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Button variant="outlined" onClick={() => navigate('/users')}>Back</Button>
            {canEdit && <Button variant="contained" onClick={() => navigate(`/users/edit/${user.id}`)}>Edit Profile</Button>}
            {canEdit && <Button variant="outlined" onClick={openRolesDialog}>Change Roles</Button>}
            {canEdit && !user.is_active && <Button variant="outlined" onClick={() => setAccountAction('activate')}>Activate</Button>}
            {canDeactivate && user.is_active && <Button color="warning" variant="outlined" onClick={() => setAccountAction('deactivate')}>Deactivate</Button>}
          </Stack>
        </Stack>

        <Stack spacing={1.5}>
          <DetailLine label="Name">{user.name}</DetailLine>
          <DetailLine label="Email">{user.email}</DetailLine>
          <DetailLine label="Phone">{user.phone || 'Not available'}</DetailLine>
          <DetailLine label="Account"><StatusChip status={user.is_active} /></DetailLine>
          <DetailLine label="Roles">{rolesLabel(user.roles || [])}</DetailLine>
          <DetailLine label="Last login">{formatDateTime(user.last_login_at)}</DetailLine>
          <DetailLine label="Created">{formatDateTime(user.created_at)}</DetailLine>
          <DetailLine label="Updated">{formatDateTime(user.updated_at)}</DetailLine>
        </Stack>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>Effective Permissions</Typography>
        <Typography color="text.secondary">
          {(user.permissions || []).join(', ') || 'No permissions'}
        </Typography>

        {user.intern_profile && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>Intern Profile</Typography>
            <Stack spacing={1.5}>
              <DetailLine label="Intern number">{user.intern_profile.intern_number}</DetailLine>
              <DetailLine label="Internship status">{internStatusLabel(user.intern_profile.status)}</DetailLine>
              <DetailLine label="Track">{user.intern_profile.track?.name || 'Not available'}</DetailLine>
              {canViewInterns && (
                <Button component={RouterLink} to={`/interns/${user.intern_profile.id}`} variant="outlined" sx={{ alignSelf: 'flex-start' }}>
                  View Intern Profile
                </Button>
              )}
            </Stack>
          </>
        )}
      </Paper>

      <Dialog open={rolesOpen} onClose={() => !rolesSaving && setRolesOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Change Roles</DialogTitle>
        <DialogContent>
          <FormError error={roleError} fallback="Unable to update roles." />
          <FormGroup>
            {ROLE_OPTIONS.map((role) => (
              <FormControlLabel
                key={role.value}
                control={<Checkbox checked={selectedRoles.includes(role.value)} onChange={() => toggleRole(role.value)} />}
                label={role.label}
              />
            ))}
          </FormGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRolesOpen(false)} disabled={rolesSaving}>Cancel</Button>
          <Button variant="contained" onClick={saveRoles} disabled={rolesSaving}>
            {rolesSaving ? 'Saving...' : 'Save Roles'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmationDialog
        open={Boolean(accountAction)}
        title={accountAction === 'activate' ? 'Activate user' : 'Deactivate user'}
        message={accountAction === 'activate'
          ? `Activate ${user.name}? This allows the user to sign in again.`
          : `Deactivate ${user.name}? This blocks login and revokes existing tokens. It does not delete the user.`}
        confirmLabel={accountAction === 'activate' ? 'Activate' : 'Deactivate'}
        confirmColor={accountAction === 'activate' ? 'primary' : 'warning'}
        confirming={actionSaving}
        error={actionError}
        onClose={() => !actionSaving && setAccountAction(null)}
        onConfirm={confirmAccountAction}
      />
    </Box>
  );
}

export default UserDetails;
