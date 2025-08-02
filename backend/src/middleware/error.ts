import { FastifyRequest, FastifyReply, FastifyError } from 'fastify';
import { formatErrorResponse } from '../utils/errors';

// Global error handler middleware
export function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
): void {
  // Log error details
  request.log.error(
    {
      error: {
        message: error.message,
        stack: error.stack,
        statusCode: error.statusCode,
      },
      request: {
        method: request.method,
        url: request.url,
        headers: request.headers,
        body: request.body,
      },
    },
    'Request error occurred'
  );

  // Determine if we should include stack trace
  const includeStack = process.env['NODE_ENV'] === 'development';

  // Format error response
  const errorResponse = formatErrorResponse(error, includeStack);

  // Send error response
  reply.status(errorResponse.statusCode).send(errorResponse);
}

// 404 Not Found handler
export function notFoundHandler(
  request: FastifyRequest,
  reply: FastifyReply
): void {
  const errorResponse = {
    error: 'Not Found',
    message: `Route ${request.method}:${request.url} not found`,
    statusCode: 404,
    timestamp: new Date().toISOString(),
  };

  reply.status(404).send(errorResponse);
}

// Request logging middleware
export async function requestLogger(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const start = Date.now();

  // Log request start
  request.log.info(
    {
      method: request.method,
      url: request.url,
      userAgent: request.headers['user-agent'],
      ip: request.ip,
    },
    'Request started'
  );

  // Log response time when request completes
  reply.raw.on('finish', () => {
    const duration = Date.now() - start;
    request.log.info(
      {
        method: request.method,
        url: request.url,
        statusCode: reply.statusCode,
        duration: `${duration}ms`,
      },
      'Request completed'
    );
  });
}
