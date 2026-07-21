import { setupServer } from 'msw/node';

export const API_URL = 'http://progress.test/api/v1';
export const server = setupServer();
