import { FastifyInstance } from 'fastify';
import { auth } from '../utils/auth';
import { verifyAuth } from '../middleware/auth';

export async function authRoutes(fastify: FastifyInstance): Promise<void> {
  // Register Better Auth handler for all auth endpoints
  fastify.all('/*', async (request, _reply) => {
    return auth.handler(request.raw as any);
  });

  // Get current user (protected route)
  fastify.get('/me', { preHandler: verifyAuth }, async request => {
    return {
      user: request.user,
      session: request.session,
    };
  });

  // Sign out endpoint
  fastify.post('/signout', async (request, reply) => {
    try {
      await auth.api.signOut({
        headers: request.headers as Record<string, string>,
      });

      return reply.status(200).send({
        success: true,
        message: 'Signed out successfully',
      });
    } catch (error) {
      return reply.status(400).send({
        error: 'Sign out failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });
}
