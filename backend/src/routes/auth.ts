import { FastifyInstance } from 'fastify';
import { auth } from '../utils/auth';
import { verifyAuth } from '../middleware/auth';
import { AuthService } from '../services/auth';
import { PasswordResetService } from '../services/password-reset.service';
import {
  SignUpRequest,
  SignInRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from '../types/api';
import {
  validateForgotPasswordRequest,
  validateResetPasswordRequest,
} from '../utils/validation';

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

  // Forgot password endpoint
  fastify.post<{ Body: ForgotPasswordRequest }>(
    '/forgot-password',
    async (request, reply) => {
      try {
        // Validate request
        validateForgotPasswordRequest(request.body);

        const result = await PasswordResetService.createResetToken(
          request.body.email
        );
        return reply.status(200).send({
          success: result.success,
          message: result.message,
        });
      } catch (error) {
        return reply.status(400).send({
          error: 'Password reset failed',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  );

  // Reset password endpoint
  fastify.post<{ Body: ResetPasswordRequest }>(
    '/reset-password',
    async (request, reply) => {
      try {
        // Validate request
        validateResetPasswordRequest(request.body);

        const { token, newPassword } = request.body;
        const result = await PasswordResetService.resetPassword(
          token,
          newPassword
        );

        if (!result.success) {
          return reply.status(400).send({
            error: 'Password reset failed',
            message: result.message,
          });
        }

        return reply.status(200).send({
          success: true,
          message: result.message,
        });
      } catch (error) {
        return reply.status(400).send({
          error: 'Password reset failed',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  );

  // Verify reset token endpoint
  fastify.get<{ Querystring: { token: string } }>(
    '/verify-reset-token',
    async (request, reply) => {
      try {
        const { token } = request.query;

        if (!token) {
          return reply.status(400).send({
            error: 'Missing token',
            message: 'Reset token is required',
          });
        }

        const result = await PasswordResetService.verifyResetToken(token);

        return reply.status(result.valid ? 200 : 400).send({
          success: result.valid,
          message: result.message,
        });
      } catch (error) {
        return reply.status(500).send({
          error: 'Token verification failed',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  );

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
