import { httpClient } from './httpClient';

export async function getUpcomingTasks(filters = {}, options = {}) {
  const response = await httpClient.get('/tasks', {
    params: filters,
    signal: options.signal,
  });

  return {
    data: response.data || [],
    meta: response.meta,
    links: response.links,
    message: response.message,
  };
}
