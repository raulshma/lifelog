import { FastifyInstance } from 'fastify';
import { authRoutes } from './auth';
import { healthRoutes } from './health';
import { boardRoutes } from './boards';
import { taskRoutes } from './tasks';
import { journalRoutes } from './journals';

// Main route registration function
export async function registerRoutes(fastify: FastifyInstance): Promise<void> {
  // Register health routes (no prefix)
  await fastify.register(healthRoutes);

  // Register API routes with /api prefix
  await fastify.register(
    async function (fastify) {
      // Register auth routes
      await fastify.register(authRoutes, { prefix: '/auth' });

      // Register Day Tracker module routes
      await fastify.register(boardRoutes, { prefix: '/boards' });
      await fastify.register(taskRoutes, { prefix: '/tasks' });
      await fastify.register(journalRoutes, { prefix: '/journals' });

      // API info route
      fastify.get('/', async () => {
        return {
          message: 'LifeLog API Server',
          version: '1.0.0',
          timestamp: new Date().toISOString(),
          endpoints: {
            health: '/health',
            auth: '/api/auth',
            boards: '/api/boards',
            tasks: '/api/tasks',
            journals: '/api/journals',
          },
        };
      });
    },
    { prefix: '/api' }
  );
}
