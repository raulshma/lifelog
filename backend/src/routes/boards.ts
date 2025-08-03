import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { BoardService } from '../services/board.service';
import { NewBoard } from '../models/schema';

export async function boardRoutes(fastify: FastifyInstance) {
  // Get all boards for the authenticated user
  fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      if (!request.user?.id) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }

      const boards = await BoardService.getUserBoards(request.user.id);
      return reply.send({ boards });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Get a specific board by ID
  fastify.get('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      if (!request.user?.id) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }

      const { id } = request.params as { id: string };
      const board = await BoardService.getBoardById(id, request.user.id);

      if (!board) {
        return reply.status(404).send({ error: 'Board not found' });
      }

      return reply.send({ board });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Create a new board
  fastify.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      if (!request.user?.id) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }

      const boardData = request.body as Omit<NewBoard, 'userId'>;
      const newBoard = await BoardService.createBoard({
        ...boardData,
        userId: request.user.id,
      });

      return reply.status(201).send({ board: newBoard });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Update a board
  fastify.put('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      if (!request.user?.id) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }

      const { id } = request.params as { id: string };
      const updates = request.body as Partial<NewBoard>;

      const updatedBoard = await BoardService.updateBoard(
        id,
        request.user.id,
        updates
      );

      if (!updatedBoard) {
        return reply.status(404).send({ error: 'Board not found' });
      }

      return reply.send({ board: updatedBoard });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Archive a board
  fastify.patch(
    '/:id/archive',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        if (!request.user?.id) {
          return reply.status(401).send({ error: 'Unauthorized' });
        }

        const { id } = request.params as { id: string };
        const success = await BoardService.archiveBoard(id, request.user.id);

        if (!success) {
          return reply.status(404).send({ error: 'Board not found' });
        }

        return reply.send({ message: 'Board archived successfully' });
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({ error: 'Internal server error' });
      }
    }
  );

  // Delete a board permanently
  fastify.delete(
    '/:id',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        if (!request.user?.id) {
          return reply.status(401).send({ error: 'Unauthorized' });
        }

        const { id } = request.params as { id: string };
        const success = await BoardService.deleteBoard(id, request.user.id);

        if (!success) {
          return reply.status(404).send({ error: 'Board not found' });
        }

        return reply.send({ message: 'Board deleted successfully' });
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({ error: 'Internal server error' });
      }
    }
  );

  // Update board order
  fastify.patch(
    '/reorder',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        if (!request.user?.id) {
          return reply.status(401).send({ error: 'Unauthorized' });
        }

        const { boardOrders } = request.body as {
          boardOrders: { id: string; sortOrder: number }[];
        };

        await BoardService.updateBoardOrder(request.user.id, boardOrders);

        return reply.send({ message: 'Board order updated successfully' });
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({ error: 'Internal server error' });
      }
    }
  );
}
