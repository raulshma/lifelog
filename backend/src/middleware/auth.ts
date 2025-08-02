import { FastifyRequest, FastifyReply } from 'fastify';
import { auth } from '../utils/auth';

// Middleware to verify authentication
export async function verifyAuth(request: FastifyRequest, reply: FastifyReply) {
  try {
    const session = await auth.api.getSession({
      headers: new Headers(request.headers as Record<string, string>),
    });

    if (!session) {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    }

    // Add user and session to request context
    request.user = session.user;
    request.session = session;
  } catch (error) {
    return reply.status(401).send({
      error: 'Unauthorized',
      message: 'Invalid authentication',
    });
  }
}

// Optional authentication middleware (doesn't fail if no auth)
export async function optionalAuth(request: FastifyRequest, _reply: FastifyReply) {
  try {
    const session = await auth.api.getSession({
      headers: new Headers(request.headers as Record<string, string>),
    });

    if (session) {
      request.user = session.user;
      request.session = session;
    }
  } catch (error) {
    // Silently fail for optional auth
    console.warn('Optional auth failed:', error);
  }
}