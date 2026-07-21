const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;

    try {
      const errorData = await response.json();
      message = errorData.message || errorData.error || message;
    } catch {
      // Some APIs return an empty or non-JSON error response.
    }

    throw new Error(message);
  }

  // Supports APIs that return 204 No Content after a successful request.
  if (response.status === 204) return null;

  return response.json();
}

export const getUsers = () => request('/users');
export const createUser = (user) =>
  request('/users', { method: 'POST', body: JSON.stringify(user) });

export const getProjects = () => request('/projects');
export const createProject = (project) =>
  request('/projects', { method: 'POST', body: JSON.stringify(project) });

export const getTasks = () => request('/tasks');
export const createTask = (task) =>
  request('/tasks', { method: 'POST', body: JSON.stringify(task) });
