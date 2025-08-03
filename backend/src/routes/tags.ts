import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { TagService } from '../services/tag.service';
import { NewTag } from '../models/schema';

export async function tagRoutes(fastify: FastifyInstance) {
  // Get all tags for the authenticated user
  fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      if (!request.user?.id) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }

      const { search } = request.query as { search?: string };

      let tags;
      if (search) {
        tags = await TagService.searchTags(request.user.id, search);
      } else {
        tags = await TagService.getUserTags(request.user.id);
      }

      return reply.send({ tags });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Get popular tags
  fastify.get(
    '/popular',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        if (!request.user?.id) {
          return reply.status(401).send({ error: 'Unauthorized' });
        }

        const { limit = 10 } = request.query as { limit?: number };
        const tags = await TagService.getPopularTags(
          request.user.id,
          Number(limit)
        );

        return reply.send({ tags });
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({ error: 'Internal server error' });
      }
    }
  );

  // Get a specific tag by ID
  fastify.get('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      if (!request.user?.id) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }

      const { id } = request.params as { id: string };
      const tag = await TagService.getTagById(id, request.user.id);

      if (!tag) {
        return reply.status(404).send({ error: 'Tag not found' });
      }

      return reply.send({ tag });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Create a new tag
  fastify.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      if (!request.user?.id) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }

      const tagData = request.body as Omit<NewTag, 'userId'>;

      // Check if tag with this name already exists
      const existingTag = await TagService.getTagByName(
        tagData.name,
        request.user.id
      );

      if (existingTag) {
        return reply
          .status(409)
          .send({ error: 'Tag with this name already exists' });
      }

      const newTag = await TagService.createTag({
        ...tagData,
        userId: request.user.id,
      });

      return reply.status(201).send({ tag: newTag });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Update a tag
  fastify.put('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      if (!request.user?.id) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }

      const { id } = request.params as { id: string };
      const updates = request.body as Partial<NewTag>;

      // If updating name, check for conflicts
      if (updates.name) {
        const existingTag = await TagService.getTagByName(
          updates.name,
          request.user.id
        );

        if (existingTag && existingTag.id !== id) {
          return reply
            .status(409)
            .send({ error: 'Tag with this name already exists' });
        }
      }

      const updatedTag = await TagService.updateTag(
        id,
        request.user.id,
        updates
      );

      if (!updatedTag) {
        return reply.status(404).send({ error: 'Tag not found' });
      }

      return reply.send({ tag: updatedTag });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Delete a tag permanently
  fastify.delete(
    '/:id',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        if (!request.user?.id) {
          return reply.status(401).send({ error: 'Unauthorized' });
        }

        const { id } = request.params as { id: string };
        const success = await TagService.deleteTag(id, request.user.id);

        if (!success) {
          return reply.status(404).send({ error: 'Tag not found' });
        }

        return reply.send({ message: 'Tag deleted successfully' });
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({ error: 'Internal server error' });
      }
    }
  );
}
