import { User, Session } from '../utils/auth';

declare module 'fastify' {
  interface FastifyRequest {
    user?: User;
    session?: Session;
  }
}

// Extend FastifyInstance for custom properties if needed
declare module 'fastify' {
  interface FastifyInstance {
    // Add custom properties here if needed in the future
  }
}
