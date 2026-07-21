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

export async function getTracks(params = {}, signal) {
  const response = await httpClient.get('/tracks', { params, signal });
  return collectionResult(response);
}

export async function createTrack(payload) {
  const response = await httpClient.post('/tracks', omitBlankFields({
    name: payload.name,
    slug: payload.slug,
    description: payload.description,
    is_active: payload.is_active,
  }));

  return {
    track: response.data,
    message: response.message,
  };
}

export async function getTrack(trackId, signal) {
  const response = await httpClient.get(`/tracks/${trackId}`, { signal });

  return {
    track: response.data,
    message: response.message,
  };
}

export async function updateTrack(trackId, payload) {
  const response = await httpClient.put(`/tracks/${trackId}`, omitBlankFields({
    name: payload.name,
    slug: payload.slug,
    description: payload.description,
    is_active: payload.is_active,
  }));

  return {
    track: response.data,
    message: response.message,
  };
}

export async function activateTrack(trackId) {
  const response = await httpClient.patch(`/tracks/${trackId}/activate`);

  return {
    track: response.data,
    message: response.message,
  };
}

export async function deactivateTrack(trackId) {
  const response = await httpClient.patch(`/tracks/${trackId}/deactivate`);

  return {
    track: response.data,
    message: response.message,
  };
}
