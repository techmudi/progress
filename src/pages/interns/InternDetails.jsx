import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import ApiState from '../../components/common/ApiState';
import AppLoading from '../../components/common/AppLoading';
import StatusChip from '../../components/common/StatusChip';
import FormError from '../../components/forms/FormError';
import { useAuth } from '../../context/AuthContext';
import { getIntern, updateInternStatus } from '../../services/internService';
import { formatDateOnly, formatDateTime } from '../../utils/formatters';
import { internStatusLabel, isTerminalInternStatus, validNextInternStatuses } from '../../utils/presentation';

function DetailLine({ label, children }) {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="space-between">
      <Typography color="text.secondary">{label}</Typography>
      <Box sx={{ fontWeight: 700, textAlign: { xs: 'left', sm: 'right' } }}>{children}</Box>
    </Stack>
  );
}

function InternDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const auth = useAuth();
  const [intern, setIntern] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [statusAction, setStatusAction] = useState(null);
  const [actualEndDate, setActualEndDate] = useState('');
  const [statusError, setStatusError] = useState(null);
  const [savingStatus, setSavingStatus] = useState(false);
  const canManage = auth.hasPermission('interns.manage');
  const canViewUsers = auth.hasPermission('users.view');

  const loadIntern = async (signal) => {
    setLoading(true);
    setLoadError(null);

    try {
      const result = await getIntern(id, signal);
      setIntern(result.intern);
    } catch (caught) {
      if (caught?.type !== 'cancelled') {
        setLoadError(caught);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    loadIntern(controller.signal);
    return () => controller.abort();
  }, [id]);

  const openStatusAction = (status) => {
    setStatusAction(status);
    setActualEndDate(status === 'completed' || status === 'withdrawn' ? intern.actual_end_date || '' : '');
    setStatusError(null);
  };

  const submitStatus = async () => {
    if (!statusAction) return;

    if (statusAction === 'completed' && !actualEndDate) {
      setStatusError({ message: 'The actual end date is required when completing an intern.' });
      return;
    }

    setSavingStatus(true);
    setStatusError(null);

    try {
      const result = await updateInternStatus(id, {
        status: statusAction,
        actual_end_date: actualEndDate,
      });
      setIntern(result.intern);
      setStatusAction(null);
    } catch (caught) {
      setStatusError(caught);
    } finally {
      setSavingStatus(false);
    }
  };

  if (loading) {
    return <AppLoading message="Loading intern profile..." />;
  }

  if (loadError) {
    return (
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <ApiState error={loadError} onRetry={() => loadIntern()} />
      </Paper>
    );
  }

  const nextStatuses = validNextInternStatuses(intern.status);

  return (
    <Box>
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', md: 'center' }} spacing={2} sx={{ mb: 3 }}>
          <Box>
            <Typography variant="h5" fontWeight={700}>Intern Profile</Typography>
            <Typography color="text.secondary">{intern.user?.name || intern.intern_number}</Typography>
          </Box>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Button variant="outlined" onClick={() => navigate('/interns')}>Back</Button>
            {canManage && <Button variant="contained" onClick={() => navigate(`/interns/${intern.id}/edit`)}>Edit Profile</Button>}
            {canViewUsers && intern.user?.id && (
              <Button component={RouterLink} to={`/users/${intern.user.id}`} variant="outlined">
                View User
              </Button>
            )}
          </Stack>
        </Stack>

        <Stack spacing={1.5}>
          <DetailLine label="Intern number">{intern.intern_number}</DetailLine>
          <DetailLine label="Name">{intern.user?.name || 'Not available'}</DetailLine>
          <DetailLine label="Email">{intern.user?.email || 'Not available'}</DetailLine>
          <DetailLine label="Phone">{intern.user?.phone || 'Not available'}</DetailLine>
          <DetailLine label="Track">{intern.track?.name || 'Not available'}</DetailLine>
          <DetailLine label="Supervisor">{intern.supervisor?.name || 'Not assigned'}</DetailLine>
          <DetailLine label="Internship status"><StatusChip status={intern.status} type="intern" /></DetailLine>
          <DetailLine label="User account"><StatusChip status={Boolean(intern.user?.is_active)} /></DetailLine>
          <DetailLine label="Start date">{formatDateOnly(intern.start_date)}</DetailLine>
          <DetailLine label="Expected end date">{formatDateOnly(intern.expected_end_date)}</DetailLine>
          <DetailLine label="Actual end date">{formatDateOnly(intern.actual_end_date)}</DetailLine>
          <DetailLine label="Created">{formatDateTime(intern.created_at)}</DetailLine>
          <DetailLine label="Updated">{formatDateTime(intern.updated_at)}</DetailLine>
        </Stack>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>Bio</Typography>
        <Typography color="text.secondary">{intern.bio || 'No bio has been added.'}</Typography>

        {canManage && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>Status Workflow</Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              Internship status and user account status are separate. Status changes do not deactivate the user account.
            </Typography>
            {isTerminalInternStatus(intern.status) ? (
              <Typography color="text.secondary">This intern profile is terminal and cannot be reopened here.</Typography>
            ) : (
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {nextStatuses.map((status) => (
                  <Button key={status} variant="outlined" onClick={() => openStatusAction(status)}>
                    Mark {internStatusLabel(status)}
                  </Button>
                ))}
              </Stack>
            )}
          </>
        )}
      </Paper>

      <Dialog open={Boolean(statusAction)} onClose={() => !savingStatus && setStatusAction(null)} fullWidth maxWidth="sm">
        <DialogTitle>Update internship status</DialogTitle>
        <DialogContent>
          <FormError error={statusError} fallback="Unable to update internship status." />
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Change this intern from {internStatusLabel(intern.status)} to {internStatusLabel(statusAction)}. This does not change the user account state.
          </Typography>
          {(statusAction === 'completed' || statusAction === 'withdrawn') && (
            <TextField
              label="Actual end date"
              type="date"
              value={actualEndDate}
              onChange={(event) => setActualEndDate(event.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
              required={statusAction === 'completed'}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusAction(null)} disabled={savingStatus}>Cancel</Button>
          <Button variant="contained" onClick={submitStatus} disabled={savingStatus}>
            {savingStatus ? 'Saving...' : 'Update Status'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default InternDetails;
