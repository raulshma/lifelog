import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import env from '@fastify/env';
import { config } from 'dotenv';

// Load environment variables
config();

// Environment schema for validation
const envSchema = {
  type: 'object',
  required: ['NODE_ENV'],
  properties: {
    NODE_ENV: {
      type: 'string',
      default: 'development'
    },
    PORT: {
      type: 'string',
      default: '3001'
    },
    HOST: {
      type: 'string',
      default: '0.0.0.0'
    },
    CORS_ORIGIN: {
      type: 'string',
      default: 'http://localhost:5173'
    }
  }
};

// Create Fastify instance
const fastify = Fastify({
  logger: {
    level: process.env['NODE_ENV'] === 'production' ? 'warn' : 'info',
    ...(process.env['NODE_ENV'] === 'development' && {
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname'
        }
      }
    })
  }
});

// Build server function
async function buildServer(): Promise<FastifyInstance> {
  try {
    // Register environment plugin
    await fastify.register(env, {
      schema: envSchema,
      dotenv: true
    });

    // Register security plugins
    await fastify.register(helmet, {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"]
        }
      }
    });

    // Register CORS
    await fastify.register(cors, {
      origin: (origin, callback) => {
        const hostname = new URL(origin || '').hostname;
        if (hostname === 'localhost' || hostname === '127.0.0.1' || !origin) {
          callback(null, true);
          return;
        }
        callback(new Error("Not allowed"), false);
      },
      credentials: true
    });

    // Health check route
    fastify.get('/health', async () => {
      return { 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env['NODE_ENV']
      };
    });

    // API routes will be registered here in future tasks
    fastify.get('/api', async () => {
      return { 
        message: 'LifeLog API Server',
        version: '1.0.0',
        timestamp: new Date().toISOString()
      };
    });

    // Global error handler
    fastify.setErrorHandler((error, _request, reply) => {
      fastify.log.error(error);
      
      const statusCode = error.statusCode || 500;
      const errorResponse = {
        error: error.name || 'Internal Server Error',
        message: error.message || 'An unexpected error occurred',
        statusCode,
        timestamp: new Date().toISOString()
      };

      // Don't expose internal errors in production
      if (process.env['NODE_ENV'] === 'production' && statusCode === 500) {
        errorResponse.message = 'Internal Server Error';
      }

      reply.status(statusCode).send(errorResponse);
    });

    // 404 handler
    fastify.setNotFoundHandler((request, reply) => {
      reply.status(404).send({
        error: 'Not Found',
        message: `Route ${request.method}:${request.url} not found`,
        statusCode: 404,
        timestamp: new Date().toISOString()
      });
    });

    return fastify;
  } catch (error) {
    fastify.log.error(error);
    throw error;
  }
}

// Start server function
async function start(): Promise<void> {
  try {
    const server = await buildServer();
    const port = parseInt(process.env['PORT'] || '3001', 10);
    const host = process.env['HOST'] || '0.0.0.0';

    await server.listen({ port, host });
    server.log.info(`🚀 Server running at http://${host}:${port}`);
    server.log.info(`📊 Health check available at http://${host}:${port}/health`);
    server.log.info(`🔧 Environment: ${process.env['NODE_ENV']}`);
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  fastify.log.info('Received SIGINT, shutting down gracefully...');
  try {
    await fastify.close();
    process.exit(0);
  } catch (error) {
    fastify.log.error('Error during shutdown:', error);
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  fastify.log.info('Received SIGTERM, shutting down gracefully...');
  try {
    await fastify.close();
    process.exit(0);
  } catch (error) {
    fastify.log.error('Error during shutdown:', error);
    process.exit(1);
  }
});

// Start the server if this file is run directly
if (require.main === module) {
  start();
}

export { buildServer, start };
export default fastify;