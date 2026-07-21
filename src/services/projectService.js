import { httpClient } from './httpClient';
import { getUsers } from './userService';
import { omitBlankFields } from '../utils/queryParams';
import { PROJECT_MEMBER_ROLE_ELIGIBLE_GLOBAL_ROLES } from '../utils/presentation';

function collectionResult(response) {
  return {
    items: response.data || [],
    meta: response.meta,
    links: response.links,
    message: response.message,
  };
}

function nullableBlank(value) {
  return value === '' ? null : value;
}

export async function getProjects(params = {}, signal) {
  const response = await httpClient.get('/projects', { params, signal });
  return collectionResult(response);
}

export async function createProject(payload) {
  const response = await httpClient.post('/projects', omitBlankFields({
    name: payload.name,
    slug: payload.slug,
    description: payload.description,
    priority: payload.priority,
    start_date: payload.start_date,
    expected_end_date: payload.expected_end_date,
  }));

  return {
    project: response.data,
    message: response.message,
  };
}

export async function getProject(projectId, signal) {
  const response = await httpClient.get(`/projects/${projectId}`, { signal });

  return {
    project: response.data,
    message: response.message,
  };
}

export async function updateProject(projectId, payload) {
  const response = await httpClient.put(`/projects/${projectId}`, omitBlankFields({
    name: payload.name,
    slug: payload.slug,
    description: nullableBlank(payload.description),
    priority: payload.priority,
    start_date: nullableBlank(payload.start_date),
    expected_end_date: nullableBlank(payload.expected_end_date),
  }));

  return {
    project: response.data,
    message: response.message,
  };
}

export async function updateProjectStatus(projectId, payload) {
  const response = await httpClient.patch(`/projects/${projectId}/status`, omitBlankFields({
    status: payload.status,
    start_date: payload.start_date,
    actual_end_date: payload.actual_end_date,
    closure_reason: payload.closure_reason,
  }));

  return {
    project: response.data,
    message: response.message,
  };
}

export async function getProjectMembers(projectId, params = {}, signal) {
  const response = await httpClient.get(`/projects/${projectId}/members`, { params, signal });
  return collectionResult(response);
}

export async function addProjectMember(projectId, payload) {
  const response = await httpClient.post(`/projects/${projectId}/members`, omitBlankFields({
    user_id: payload.user_id,
    member_role: payload.member_role,
    joined_at: payload.joined_at,
  }));

  return {
    member: response.data,
    message: response.message,
  };
}

export async function updateProjectMember(projectId, memberId, payload) {
  const response = await httpClient.put(`/projects/${projectId}/members/${memberId}`, {
    member_role: payload.member_role,
  });

  return {
    member: response.data,
    message: response.message,
  };
}

export async function removeProjectMember(projectId, memberId) {
  const response = await httpClient.delete(`/projects/${projectId}/members/${memberId}`);

  return {
    message: response.message,
  };
}

export async function getProjectModules(projectId, params = {}, signal) {
  const response = await httpClient.get(`/projects/${projectId}/modules`, { params, signal });
  return collectionResult(response);
}

export async function createProjectModule(projectId, payload) {
  const response = await httpClient.post(`/projects/${projectId}/modules`, omitBlankFields({
    name: payload.name,
    slug: payload.slug,
    description: payload.description,
    sort_order: payload.sort_order,
  }));

  return {
    module: response.data,
    message: response.message,
  };
}

export async function getProjectModule(projectId, moduleId, signal) {
  const response = await httpClient.get(`/projects/${projectId}/modules/${moduleId}`, { signal });

  return {
    module: response.data,
    message: response.message,
  };
}

export async function updateProjectModule(projectId, moduleId, payload) {
  const response = await httpClient.put(`/projects/${projectId}/modules/${moduleId}`, omitBlankFields({
    name: payload.name,
    slug: payload.slug,
    description: nullableBlank(payload.description),
    sort_order: payload.sort_order,
  }));

  return {
    module: response.data,
    message: response.message,
  };
}

export async function updateProjectModuleStatus(projectId, moduleId, payload) {
  const response = await httpClient.patch(`/projects/${projectId}/modules/${moduleId}/status`, {
    status: payload.status,
  });

  return {
    module: response.data,
    message: response.message,
  };
}

export async function getEligibleProjectMemberUsers(memberRole, search = '', excludedUserIds = [], signal) {
  const roles = PROJECT_MEMBER_ROLE_ELIGIBLE_GLOBAL_ROLES[memberRole] || [];
  const baseParams = {
    search,
    is_active: true,
    per_page: 20,
    sort: 'name',
    direction: 'asc',
  };

  const results = memberRole === 'observer'
    ? [await getUsers(baseParams, signal)]
    : await Promise.all(roles.map((role) => getUsers({ ...baseParams, role }, signal)));
  const excluded = new Set(excludedUserIds.map(String));
  const byId = new Map();

  results.flatMap((result) => result.items || []).forEach((user) => {
    if (!excluded.has(String(user.id))) {
      byId.set(user.id, user);
    }
  });

  return {
    items: Array.from(byId.values()).sort((a, b) => a.name.localeCompare(b.name)),
  };
}
