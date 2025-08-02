import { FastifyInstance } from 'fastify';
import { testConnection } from '../utils/database';

export async function healthRoutes(fastify: FastifyInstance): Promise<void> {
  // Basic health check
  fastify.get('/health', async () => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env['NODE_ENV'],
    };
  });

  // Detailed health check with database connection
  fastify.get('/health/detailed', async (_request, reply) => {
    const dbConnected = await testConnection();
    
    const health = {
      status: dbConnected ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env['NODE_ENV'],
      services: {
        database: {
          status: dbConnected ? 'connected' : 'disconnected',
          type: 'postgresql',
        },
      },
    };

    const statusCode = dbConnected ? 200 : 503;
    return reply.status(statusCode).send(health);
  });
}