import { FastifyInstance } from 'fastify';
import { authRoutes } from './auth';
import { healthRoutes } from './health';
import { boardRoutes } from './boards';
import { taskRoutes } from './tasks';
import { journalRoutes } from './journals';
import { notebookRoutes } from './notebooks';
import { noteRoutes } from './notes';
import { tagRoutes } from './tags';
import { vaultCategoryRoutes } from './vault-categories';
import { vaultItemRoutes } from './vault-items';
import { documentRoutes } from './documents';
import { locationRoutes } from './locations';
import { itemRoutes } from './items';

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

      // Register Knowledge Base module routes
      await fastify.register(notebookRoutes, { prefix: '/notebooks' });
      await fastify.register(noteRoutes, { prefix: '/notes' });
      await fastify.register(tagRoutes, { prefix: '/tags' });

      // Register Vault module routes
      await fastify.register(vaultCategoryRoutes, {
        prefix: '/vault/categories',
      });
      await fastify.register(vaultItemRoutes, { prefix: '/vault/items' });

      // Register Document Hub module routes
      await fastify.register(documentRoutes, { prefix: '/documents' });

      // Register Inventory module routes
      await fastify.register(locationRoutes, { prefix: '/locations' });
      await fastify.register(itemRoutes, { prefix: '/items' });

      // API info route
      fastify.get('/', async () => {
        return {
          message: 'LifeLog API Server',
          version: '1.0.0',
          timestamp: new Date().toISOString(),
          endpoints: {
            health: '/health',
            auth: '/api/auth',
            // Day Tracker
            boards: '/api/boards',
            tasks: '/api/tasks',
            journals: '/api/journals',
            // Knowledge Base
            notebooks: '/api/notebooks',
            notes: '/api/notes',
            tags: '/api/tags',
            // Vault
            vaultCategories: '/api/vault/categories',
            vaultItems: '/api/vault/items',
            // Document Hub
            documents: '/api/documents',
            // Inventory
            locations: '/api/locations',
            items: '/api/items',
          },
        };
      });
    },
    { prefix: '/api' }
  );
}
