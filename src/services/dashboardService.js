import { httpClient } from './httpClient';

export async function getManagementDashboard(filters = {}, options = {}) {
  const response = await httpClient.get('/dashboard/management', {
    params: filters,
    signal: options.signal,
  });

  return {
    data: response.data,
    filters: response.filters,
    generatedAt: response.generatedAt,
    message: response.message,
  };
}
