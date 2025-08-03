import { FastifyInstance } from 'fastify';
import { auth } from '../utils/auth';
import { verifyAuth } from '../middleware/auth';
import { AuthService } from '../services/auth';
import { SignUpRequest, SignInRequest } from '../types/api';

export async function authRoutes(fastify: FastifyInstance): Promise<void> {
  // User registration endpoint
  fastify.post<{ Body: SignUpRequest }>('/sign-up', async (request, reply) => {
    try {
      const result = await AuthService.signUp(request.body);
      return reply.status(201).send({
        success: true,
        data: result,
        message: 'User registered successfully',
      });
    } catch (error) {
      return reply.status(400).send({
        error: 'Registration failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // User login endpoint
  fastify.post<{ Body: SignInRequest }>('/sign-in', async (request, reply) => {
    try {
      const result = await AuthService.signIn(request.body);
      return reply.status(200).send({
        success: true,
        data: result,
        message: 'Login successful',
      });
    } catch (error) {
      return reply.status(401).send({
        error: 'Login failed',
        message: error instanceof Error ? error.message : 'Invalid credentials',
      });
    }
  });

  // Get current user (protected route)
  fastify.get('/me', { preHandler: verifyAuth }, async request => {
    return {
      success: true,
      data: {
        user: request.user,
        session: request.session,
      },
    };
  });

  // Sign out endpoint
  fastify.post('/signout', async (request, reply) => {
    try {
      await AuthService.signOut(request.headers as Record<string, string>);
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

  // Register Better Auth handler for additional endpoints (like password reset, etc.)
  fastify.all('/*', async (request, reply) => {
    try {
      const response = await auth.handler(request.raw as any);

      // Set headers from Better Auth response
      if (response.headers) {
        Object.entries(response.headers).forEach(([key, value]) => {
          reply.header(key, value as string);
        });
      }

      // Set status code
      if (response.status) {
        reply.status(response.status);
      }

      // Return body
      return response.body;
    } catch (error) {
      fastify.log.error('Better Auth handler error:', error);
      return reply.status(500).send({
        error: 'Authentication error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });
}
