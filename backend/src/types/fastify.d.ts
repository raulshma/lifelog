import { User, Session } from '../utils/auth';

declare module 'fastify' {
  interface FastifyRequest {
    user?: User;
    session?: Session;
  }
}