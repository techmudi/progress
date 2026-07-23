import { httpClient } from './httpClient';

/**
 * Task API operations. `httpClient` normalizes API responses to include a
 * `data` property, so callers can use the same contract as the other services.
 */
export async function getTasks(params = {}, options = {}) {
  return httpClient.get('/tasks', { params, ...options });
}

export async function fetchTasks(params = {}, options = {}) {
  const response = await getTasks(params, options);
  return response.data || [];
}

export async function createTask(payload) {
  const response = await httpClient.post('/tasks', payload);
  return response.data;
}

export async function updateTask(taskId, payload) {
  const response = await httpClient.put(`/tasks/${taskId}`, payload);
  return response.data;
}

export async function deleteTask(taskId) {
  await httpClient.delete(`/tasks/${taskId}`);
}
