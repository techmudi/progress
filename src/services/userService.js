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

export async function getUsers(params = {}, signal) {
  const response = await httpClient.get('/users', { params, signal });
  return collectionResult(response);
}

export async function createUser(payload) {
  const response = await httpClient.post('/users', {
    ...omitBlankFields({
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      password: payload.password,
      password_confirmation: payload.password_confirmation,
      is_active: payload.is_active,
    }),
    roles: payload.roles,
  });

  return {
    user: response.data,
    message: response.message,
  };
}

export async function getUser(userId, signal) {
  const response = await httpClient.get(`/users/${userId}`, { signal });

  return {
    user: response.data,
    message: response.message,
  };
}

export async function updateUser(userId, payload) {
  const response = await httpClient.put(`/users/${userId}`, omitBlankFields({
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
    password: payload.password,
    password_confirmation: payload.password ? payload.password_confirmation : '',
  }));

  return {
    user: response.data,
    message: response.message,
  };
}

export async function activateUser(userId) {
  const response = await httpClient.patch(`/users/${userId}/activate`);

  return {
    user: response.data,
    message: response.message,
  };
}

export async function deactivateUser(userId) {
  const response = await httpClient.patch(`/users/${userId}/deactivate`);

  return {
    user: response.data,
    message: response.message,
  };
}

export async function syncUserRoles(userId, roles) {
  const response = await httpClient.put(`/users/${userId}/roles`, { roles });

  return {
    user: response.data,
    message: response.message,
  };
}

export async function getEligibleSupervisors(signal) {
  const [admins, supervisors] = await Promise.all([
    getUsers({ role: 'admin', is_active: true, per_page: 100, sort: 'name', direction: 'asc' }, signal),
    getUsers({ role: 'supervisor', is_active: true, per_page: 100, sort: 'name', direction: 'asc' }, signal),
  ]);
  const byId = new Map();

  [...admins.items, ...supervisors.items].forEach((user) => {
    byId.set(user.id, user);
  });

  return {
    items: Array.from(byId.values()).sort((a, b) => a.name.localeCompare(b.name)),
  };
}
