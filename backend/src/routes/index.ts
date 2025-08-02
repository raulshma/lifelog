import { FastifyInstance } from 'fastify';
import { authRoutes } from './auth';
import { healthRoutes } from './health';

// Main route registration function
export async function registerRoutes(fastify: FastifyInstance): Promise<void> {
  // Register health routes (no prefix)
  await fastify.register(healthRoutes);

  // Register API routes with /api prefix
  await fastify.register(
    async function (fastify) {
      // Register auth routes
      await fastify.register(authRoutes, { prefix: '/auth' });

      // API info route
      fastify.get('/', async () => {
        return {
          message: 'LifeLog API Server',
          version: '1.0.0',
          timestamp: new Date().toISOString(),
          endpoints: {
            health: '/health',
            auth: '/api/auth',
          },
        };
      });
    },
    { prefix: '/api' }
  );
}
