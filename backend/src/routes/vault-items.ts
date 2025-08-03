import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { VaultItemService } from '../services/vault-item.service';
import { NewVaultItem } from '../models/schema';

export async function vaultItemRoutes(fastify: FastifyInstance) {
  // Get all vault items for the authenticated user
  fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      if (!request.user?.id) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }

      const { categoryId, type, search } = request.query as {
        categoryId?: string;
        type?: string;
        search?: string;
      };

      let items;
      if (search) {
        items = await VaultItemService.searchVaultItems(
          request.user.id,
          search
        );
      } else if (categoryId) {
        items = await VaultItemService.getVaultItemsByCategory(
          categoryId,
          request.user.id
        );
      } else if (type) {
        items = await VaultItemService.getVaultItemsByType(
          type,
          request.user.id
        );
      } else {
        items = await VaultItemService.getUserVaultItems(request.user.id);
      }

      return reply.send({ items });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Get favorite vault items
  fastify.get(
    '/favorites',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        if (!request.user?.id) {
          return reply.status(401).send({ error: 'Unauthorized' });
        }

        const items = await VaultItemService.getFavoriteVaultItems(
          request.user.id
        );
        return reply.send({ items });
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({ error: 'Internal server error' });
      }
    }
  );

  // Get a specific vault item by ID
  fastify.get('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      if (!request.user?.id) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }

      const { id } = request.params as { id: string };
      const item = await VaultItemService.getVaultItemById(id, request.user.id);

      if (!item) {
        return reply.status(404).send({ error: 'Vault item not found' });
      }

      return reply.send({ item });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Create a new vault item
  fastify.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      if (!request.user?.id) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }

      const itemData = request.body as Omit<NewVaultItem, 'userId'>;
      const newItem = await VaultItemService.createVaultItem({
        ...itemData,
        userId: request.user.id,
      });

      return reply.status(201).send({ item: newItem });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Update a vault item
  fastify.put('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      if (!request.user?.id) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }

      const { id } = request.params as { id: string };
      const updates = request.body as Partial<NewVaultItem>;

      const updatedItem = await VaultItemService.updateVaultItem(
        id,
        request.user.id,
        updates
      );

      if (!updatedItem) {
        return reply.status(404).send({ error: 'Vault item not found' });
      }

      return reply.send({ item: updatedItem });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Toggle favorite
  fastify.patch(
    '/:id/favorite',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        if (!request.user?.id) {
          return reply.status(401).send({ error: 'Unauthorized' });
        }

        const { id } = request.params as { id: string };
        const updatedItem = await VaultItemService.toggleFavorite(
          id,
          request.user.id
        );

        if (!updatedItem) {
          return reply.status(404).send({ error: 'Vault item not found' });
        }

        return reply.send({ item: updatedItem });
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({ error: 'Internal server error' });
      }
    }
  );

  // Delete a vault item permanently
  fastify.delete(
    '/:id',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        if (!request.user?.id) {
          return reply.status(401).send({ error: 'Unauthorized' });
        }

        const { id } = request.params as { id: string };
        const success = await VaultItemService.deleteVaultItem(
          id,
          request.user.id
        );

        if (!success) {
          return reply.status(404).send({ error: 'Vault item not found' });
        }

        return reply.send({ message: 'Vault item deleted successfully' });
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({ error: 'Internal server error' });
      }
    }
  );
}
