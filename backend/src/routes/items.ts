import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ItemService } from '../services/item.service';
import { NewItem } from '../models/schema';

export async function itemRoutes(fastify: FastifyInstance) {
  // Get all items for the authenticated user
  fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      if (!request.user?.id) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }

      const { locationId, category, search } = request.query as {
        locationId?: string;
        category?: string;
        search?: string;
      };

      let items;
      if (search) {
        items = await ItemService.searchItems(request.user.id, search);
      } else if (locationId) {
        items = await ItemService.getItemsByLocation(
          locationId,
          request.user.id
        );
      } else if (category) {
        items = await ItemService.getItemsByCategory(category, request.user.id);
      } else {
        items = await ItemService.getUserItems(request.user.id);
      }

      return reply.send({ items });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Get favorite items
  fastify.get(
    '/favorites',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        if (!request.user?.id) {
          return reply.status(401).send({ error: 'Unauthorized' });
        }

        const items = await ItemService.getFavoriteItems(request.user.id);
        return reply.send({ items });
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({ error: 'Internal server error' });
      }
    }
  );

  // Get lost items
  fastify.get('/lost', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      if (!request.user?.id) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }

      const items = await ItemService.getLostItems(request.user.id);
      return reply.send({ items });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Get broken items
  fastify.get(
    '/broken',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        if (!request.user?.id) {
          return reply.status(401).send({ error: 'Unauthorized' });
        }

        const items = await ItemService.getBrokenItems(request.user.id);
        return reply.send({ items });
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({ error: 'Internal server error' });
      }
    }
  );

  // Get lent items
  fastify.get('/lent', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      if (!request.user?.id) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }

      const items = await ItemService.getLentItems(request.user.id);
      return reply.send({ items });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Get item by barcode
  fastify.get(
    '/barcode/:barcode',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        if (!request.user?.id) {
          return reply.status(401).send({ error: 'Unauthorized' });
        }

        const { barcode } = request.params as { barcode: string };
        const item = await ItemService.getItemByBarcode(
          barcode,
          request.user.id
        );

        if (!item) {
          return reply.status(404).send({ error: 'Item not found' });
        }

        return reply.send({ item });
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({ error: 'Internal server error' });
      }
    }
  );

  // Get a specific item by ID
  fastify.get('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      if (!request.user?.id) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }

      const { id } = request.params as { id: string };
      const item = await ItemService.getItemById(id, request.user.id);

      if (!item) {
        return reply.status(404).send({ error: 'Item not found' });
      }

      return reply.send({ item });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Create a new item
  fastify.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      if (!request.user?.id) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }

      const itemData = request.body as Omit<NewItem, 'userId'>;
      const newItem = await ItemService.createItem({
        ...itemData,
        userId: request.user.id,
      });

      return reply.status(201).send({ item: newItem });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Update an item
  fastify.put('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      if (!request.user?.id) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }

      const { id } = request.params as { id: string };
      const updates = request.body as Partial<NewItem>;

      const updatedItem = await ItemService.updateItem(
        id,
        request.user.id,
        updates
      );

      if (!updatedItem) {
        return reply.status(404).send({ error: 'Item not found' });
      }

      return reply.send({ item: updatedItem });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Move item to new location
  fastify.patch(
    '/:id/move',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        if (!request.user?.id) {
          return reply.status(401).send({ error: 'Unauthorized' });
        }

        const { id } = request.params as { id: string };
        const { locationId, reason, notes } = request.body as {
          locationId: string;
          reason?: string;
          notes?: string;
        };

        const updatedItem = await ItemService.moveItem(
          id,
          request.user.id,
          locationId,
          reason,
          notes
        );

        if (!updatedItem) {
          return reply.status(404).send({ error: 'Item not found' });
        }

        return reply.send({ item: updatedItem });
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({ error: 'Internal server error' });
      }
    }
  );

  // Toggle favorite
  fastify.patch(
    '/:id/favorite',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        if (!request.user?.id) {
          return reply.status(401).send({ error: 'Unauthorized' });
        }

        const { id } = request.params as { id: string };
        const updatedItem = await ItemService.toggleFavorite(
          id,
          request.user.id
        );

        if (!updatedItem) {
          return reply.status(404).send({ error: 'Item not found' });
        }

        return reply.send({ item: updatedItem });
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({ error: 'Internal server error' });
      }
    }
  );

  // Toggle lost status
  fastify.patch(
    '/:id/lost',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        if (!request.user?.id) {
          return reply.status(401).send({ error: 'Unauthorized' });
        }

        const { id } = request.params as { id: string };
        const updatedItem = await ItemService.toggleLost(id, request.user.id);

        if (!updatedItem) {
          return reply.status(404).send({ error: 'Item not found' });
        }

        return reply.send({ item: updatedItem });
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({ error: 'Internal server error' });
      }
    }
  );

  // Toggle broken status
  fastify.patch(
    '/:id/broken',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        if (!request.user?.id) {
          return reply.status(401).send({ error: 'Unauthorized' });
        }

        const { id } = request.params as { id: string };
        const updatedItem = await ItemService.toggleBroken(id, request.user.id);

        if (!updatedItem) {
          return reply.status(404).send({ error: 'Item not found' });
        }

        return reply.send({ item: updatedItem });
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({ error: 'Internal server error' });
      }
    }
  );

  // Delete an item permanently
  fastify.delete(
    '/:id',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        if (!request.user?.id) {
          return reply.status(401).send({ error: 'Unauthorized' });
        }

        const { id } = request.params as { id: string };
        const success = await ItemService.deleteItem(id, request.user.id);

        if (!success) {
          return reply.status(404).send({ error: 'Item not found' });
        }

        return reply.send({ message: 'Item deleted successfully' });
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({ error: 'Internal server error' });
      }
    }
  );
}
