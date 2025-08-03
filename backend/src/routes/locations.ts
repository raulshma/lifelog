import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { LocationService } from '../services/location.service';
import { NewLocation } from '../models/schema';

export async function locationRoutes(fastify: FastifyInstance) {
  // Get all locations for the authenticated user
  fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      if (!request.user?.id) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }

      const { type } = request.query as { type?: string };

      let locations;
      if (type) {
        locations = await LocationService.getLocationsByType(
          request.user.id,
          type
        );
      } else {
        locations = await LocationService.getUserLocations(request.user.id);
      }

      return reply.send({ locations });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Get root locations (no parent)
  fastify.get('/root', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      if (!request.user?.id) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }

      const locations = await LocationService.getRootLocations(request.user.id);
      return reply.send({ locations });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Get child locations
  fastify.get(
    '/:parentId/children',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        if (!request.user?.id) {
          return reply.status(401).send({ error: 'Unauthorized' });
        }

        const { parentId } = request.params as { parentId: string };
        const locations = await LocationService.getChildLocations(
          request.user.id,
          parentId
        );
        return reply.send({ locations });
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({ error: 'Internal server error' });
      }
    }
  );

  // Get a specific location by ID
  fastify.get('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      if (!request.user?.id) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }

      const { id } = request.params as { id: string };
      const location = await LocationService.getLocationById(
        id,
        request.user.id
      );

      if (!location) {
        return reply.status(404).send({ error: 'Location not found' });
      }

      return reply.send({ location });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Create a new location
  fastify.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      if (!request.user?.id) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }

      const locationData = request.body as Omit<NewLocation, 'userId'>;
      const newLocation = await LocationService.createLocation({
        ...locationData,
        userId: request.user.id,
      });

      return reply.status(201).send({ location: newLocation });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Update a location
  fastify.put('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      if (!request.user?.id) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }

      const { id } = request.params as { id: string };
      const updates = request.body as Partial<NewLocation>;

      const updatedLocation = await LocationService.updateLocation(
        id,
        request.user.id,
        updates
      );

      if (!updatedLocation) {
        return reply.status(404).send({ error: 'Location not found' });
      }

      return reply.send({ location: updatedLocation });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Archive a location
  fastify.patch(
    '/:id/archive',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        if (!request.user?.id) {
          return reply.status(401).send({ error: 'Unauthorized' });
        }

        const { id } = request.params as { id: string };
        const success = await LocationService.archiveLocation(
          id,
          request.user.id
        );

        if (!success) {
          return reply.status(404).send({ error: 'Location not found' });
        }

        return reply.send({ message: 'Location archived successfully' });
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({ error: 'Internal server error' });
      }
    }
  );

  // Delete a location permanently
  fastify.delete(
    '/:id',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        if (!request.user?.id) {
          return reply.status(401).send({ error: 'Unauthorized' });
        }

        const { id } = request.params as { id: string };
        const success = await LocationService.deleteLocation(
          id,
          request.user.id
        );

        if (!success) {
          return reply.status(404).send({ error: 'Location not found' });
        }

        return reply.send({ message: 'Location deleted successfully' });
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({ error: 'Internal server error' });
      }
    }
  );

  // Update location order
  fastify.patch(
    '/reorder',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        if (!request.user?.id) {
          return reply.status(401).send({ error: 'Unauthorized' });
        }

        const { locationOrders } = request.body as {
          locationOrders: {
            id: string;
            sortOrder: number;
            parentId?: string;
          }[];
        };

        await LocationService.updateLocationOrder(
          request.user.id,
          locationOrders
        );

        return reply.send({ message: 'Location order updated successfully' });
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({ error: 'Internal server error' });
      }
    }
  );
}
