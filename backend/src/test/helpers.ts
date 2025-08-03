import { FastifyInstance } from 'fastify';
import { buildServer } from '../server';

export async function createTestApp(): Promise<FastifyInstance> {
  const app = await buildServer();
  await app.ready();
  return app;
}

export async function closeTestApp(app: FastifyInstance): Promise<void> {
  await app.close();
}

export const testUser = {
  email: 'test@example.com',
  password: 'testpassword123',
  name: 'Test User',
};

export const mockAuthHeaders = {
  authorization: 'Bearer mock-jwt-token',
};
