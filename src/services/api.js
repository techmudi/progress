import { httpClient } from './httpClient';

export const getUsers = async (params) => {
  const response = await httpClient.get('/users', { params });
  return response.data || [];
};

export const createUser = async (user) => {
  const response = await httpClient.post('/users', user);
  return response.data;
};

export const getTasks = async (params) => {
  const response = await httpClient.get('/tasks', { params });
  return response.data || [];
};

export const createTask = async (task) => {
  const response = await httpClient.post('/tasks', task);
  return response.data;
};
