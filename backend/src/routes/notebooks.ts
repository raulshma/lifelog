import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { NotebookService } from '../services/notebook.service';
import { NewNotebook } from '../models/schema';

export async function notebookRoutes(fastify: FastifyInstance) {
  // Get all notebooks for the authenticated user
  fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      if (!request.user?.id) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }

      const notebooks = await NotebookService.getUserNotebooks(request.user.id);
      return reply.send({ notebooks });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Get root notebooks (no parent)
  fastify.get('/root', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      if (!request.user?.id) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }

      const notebooks = await NotebookService.getRootNotebooks(request.user.id);
      return reply.send({ notebooks });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Get child notebooks
  fastify.get(
    '/:parentId/children',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        if (!request.user?.id) {
          return reply.status(401).send({ error: 'Unauthorized' });
        }

        const { parentId } = request.params as { parentId: string };
        const notebooks = await NotebookService.getChildNotebooks(
          request.user.id,
          parentId
        );
        return reply.send({ notebooks });
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({ error: 'Internal server error' });
      }
    }
  );

  // Get a specific notebook by ID
  fastify.get('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      if (!request.user?.id) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }

      const { id } = request.params as { id: string };
      const notebook = await NotebookService.getNotebookById(
        id,
        request.user.id
      );

      if (!notebook) {
        return reply.status(404).send({ error: 'Notebook not found' });
      }

      return reply.send({ notebook });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Create a new notebook
  fastify.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      if (!request.user?.id) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }

      const notebookData = request.body as Omit<NewNotebook, 'userId'>;
      const newNotebook = await NotebookService.createNotebook({
        ...notebookData,
        userId: request.user.id,
      });

      return reply.status(201).send({ notebook: newNotebook });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Update a notebook
  fastify.put('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      if (!request.user?.id) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }

      const { id } = request.params as { id: string };
      const updates = request.body as Partial<NewNotebook>;

      const updatedNotebook = await NotebookService.updateNotebook(
        id,
        request.user.id,
        updates
      );

      if (!updatedNotebook) {
        return reply.status(404).send({ error: 'Notebook not found' });
      }

      return reply.send({ notebook: updatedNotebook });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Archive a notebook
  fastify.patch(
    '/:id/archive',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        if (!request.user?.id) {
          return reply.status(401).send({ error: 'Unauthorized' });
        }

        const { id } = request.params as { id: string };
        const success = await NotebookService.archiveNotebook(
          id,
          request.user.id
        );

        if (!success) {
          return reply.status(404).send({ error: 'Notebook not found' });
        }

        return reply.send({ message: 'Notebook archived successfully' });
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({ error: 'Internal server error' });
      }
    }
  );

  // Delete a notebook permanently
  fastify.delete(
    '/:id',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        if (!request.user?.id) {
          return reply.status(401).send({ error: 'Unauthorized' });
        }

        const { id } = request.params as { id: string };
        const success = await NotebookService.deleteNotebook(
          id,
          request.user.id
        );

        if (!success) {
          return reply.status(404).send({ error: 'Notebook not found' });
        }

        return reply.send({ message: 'Notebook deleted successfully' });
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({ error: 'Internal server error' });
      }
    }
  );

  // Update notebook order
  fastify.patch(
    '/reorder',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        if (!request.user?.id) {
          return reply.status(401).send({ error: 'Unauthorized' });
        }

        const { notebookOrders } = request.body as {
          notebookOrders: {
            id: string;
            sortOrder: number;
            parentId?: string;
          }[];
        };

        await NotebookService.updateNotebookOrder(
          request.user.id,
          notebookOrders
        );

        return reply.send({ message: 'Notebook order updated successfully' });
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({ error: 'Internal server error' });
      }
    }
  );
}
