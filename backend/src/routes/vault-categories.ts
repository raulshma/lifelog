import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { VaultCategoryService } from '../services/vault-category.service';
import { NewVaultCategory } from '../models/schema';

export async function vaultCategoryRoutes(fastify: FastifyInstance) {
  // Get all vault categories for the authenticated user
  fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      if (!request.user?.id) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }

      const categories = await VaultCategoryService.getUserVaultCategories(
        request.user.id
      );
      return reply.send({ categories });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Get a specific vault category by ID
  fastify.get('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      if (!request.user?.id) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }

      const { id } = request.params as { id: string };
      const category = await VaultCategoryService.getVaultCategoryById(
        id,
        request.user.id
      );

      if (!category) {
        return reply.status(404).send({ error: 'Vault category not found' });
      }

      return reply.send({ category });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Create a new vault category
  fastify.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      if (!request.user?.id) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }

      const categoryData = request.body as Omit<NewVaultCategory, 'userId'>;
      const newCategory = await VaultCategoryService.createVaultCategory({
        ...categoryData,
        userId: request.user.id,
      });

      return reply.status(201).send({ category: newCategory });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Update a vault category
  fastify.put('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      if (!request.user?.id) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }

      const { id } = request.params as { id: string };
      const updates = request.body as Partial<NewVaultCategory>;

      const updatedCategory = await VaultCategoryService.updateVaultCategory(
        id,
        request.user.id,
        updates
      );

      if (!updatedCategory) {
        return reply.status(404).send({ error: 'Vault category not found' });
      }

      return reply.send({ category: updatedCategory });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Archive a vault category
  fastify.patch(
    '/:id/archive',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        if (!request.user?.id) {
          return reply.status(401).send({ error: 'Unauthorized' });
        }

        const { id } = request.params as { id: string };
        const success = await VaultCategoryService.archiveVaultCategory(
          id,
          request.user.id
        );

        if (!success) {
          return reply.status(404).send({ error: 'Vault category not found' });
        }

        return reply.send({ message: 'Vault category archived successfully' });
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({ error: 'Internal server error' });
      }
    }
  );

  // Delete a vault category permanently
  fastify.delete(
    '/:id',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        if (!request.user?.id) {
          return reply.status(401).send({ error: 'Unauthorized' });
        }

        const { id } = request.params as { id: string };
        const success = await VaultCategoryService.deleteVaultCategory(
          id,
          request.user.id
        );

        if (!success) {
          return reply.status(404).send({ error: 'Vault category not found' });
        }

        return reply.send({ message: 'Vault category deleted successfully' });
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({ error: 'Internal server error' });
      }
    }
  );

  // Update vault category order
  fastify.patch(
    '/reorder',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        if (!request.user?.id) {
          return reply.status(401).send({ error: 'Unauthorized' });
        }

        const { categoryOrders } = request.body as {
          categoryOrders: { id: string; sortOrder: number }[];
        };

        await VaultCategoryService.updateVaultCategoryOrder(
          request.user.id,
          categoryOrders
        );

        return reply.send({
          message: 'Vault category order updated successfully',
        });
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({ error: 'Internal server error' });
      }
    }
  );
}
