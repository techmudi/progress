import { httpClient } from './httpClient';
import { omitBlankFields } from '../utils/queryParams';

function collectionResult(response) {
  return {
    items: response.data || [],
    meta: response.meta,
    links: response.links,
    message: response.message,
  };
}

export async function getInterns(params = {}, signal) {
  const response = await httpClient.get('/interns', { params, signal });
  return collectionResult(response);
}

export async function createIntern(payload) {
  const response = await httpClient.post('/interns', omitBlankFields({
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
    password: payload.password,
    password_confirmation: payload.password_confirmation,
    is_active: payload.is_active,
    track_id: payload.track_id,
    intern_number: payload.intern_number,
    start_date: payload.start_date,
    expected_end_date: payload.expected_end_date,
    actual_end_date: payload.actual_end_date,
    supervisor_id: payload.supervisor_id,
    bio: payload.bio,
    status: payload.status,
  }));

  return {
    intern: response.data,
    message: response.message,
  };
}

export async function getIntern(internId, signal) {
  const response = await httpClient.get(`/interns/${internId}`, { signal });

  return {
    intern: response.data,
    message: response.message,
  };
}

export async function updateIntern(internId, payload) {
  const response = await httpClient.put(`/interns/${internId}`, omitBlankFields({
    track_id: payload.track_id,
    start_date: payload.start_date,
    expected_end_date: payload.expected_end_date,
    actual_end_date: payload.actual_end_date,
    supervisor_id: payload.supervisor_id,
    bio: payload.bio,
  }));

  return {
    intern: response.data,
    message: response.message,
  };
}

export async function updateInternStatus(internId, payload) {
  const response = await httpClient.patch(`/interns/${internId}/status`, omitBlankFields({
    status: payload.status,
    actual_end_date: payload.actual_end_date,
  }));

  return {
    intern: response.data,
    message: response.message,
  };
}
