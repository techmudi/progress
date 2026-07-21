import { httpClient } from './httpClient';

export async function getProjectProgress(filters = {}, options = {}) {
  const response = await httpClient.get('/reports/project-progress', {
    params: filters,
    signal: options.signal,
  });

  return {
    data: response.data || [],
    summary: response.summary,
    meta: response.meta,
    links: response.links,
    filters: response.filters,
    generatedAt: response.generatedAt,
    message: response.message,
  };
}
