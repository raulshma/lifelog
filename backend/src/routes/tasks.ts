import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { TaskService } from '../services/task.service';
import { NewTask } from '../models/schema';

export async function taskRoutes(fastify: FastifyInstance) {
  // Get all tasks for the authenticated user
  fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      if (!request.user?.id) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }

      const { boardId, status } = request.query as {
        boardId?: string;
        status?: string;
      };

      let tasks;
      if (boardId) {
        tasks = await TaskService.getTasksByBoard(boardId, request.user.id);
      } else if (status) {
        tasks = await TaskService.getTasksByStatus(request.user.id, status);
      } else {
        tasks = await TaskService.getUserTasks(request.user.id);
      }

      return reply.send({ tasks });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Get inbox tasks (tasks without a board)
  fastify.get(
    '/inbox',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        if (!request.user?.id) {
          return reply.status(401).send({ error: 'Unauthorized' });
        }

        const tasks = await TaskService.getInboxTasks(request.user.id);
        return reply.send({ tasks });
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({ error: 'Internal server error' });
      }
    }
  );

  // Get overdue tasks
  fastify.get(
    '/overdue',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        if (!request.user?.id) {
          return reply.status(401).send({ error: 'Unauthorized' });
        }

        const tasks = await TaskService.getOverdueTasks(request.user.id);
        return reply.send({ tasks });
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({ error: 'Internal server error' });
      }
    }
  );

  // Get a specific task by ID
  fastify.get('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      if (!request.user?.id) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }

      const { id } = request.params as { id: string };
      const task = await TaskService.getTaskById(id, request.user.id);

      if (!task) {
        return reply.status(404).send({ error: 'Task not found' });
      }

      return reply.send({ task });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Create a new task
  fastify.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      if (!request.user?.id) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }

      const taskData = request.body as Omit<NewTask, 'userId'>;
      const newTask = await TaskService.createTask({
        ...taskData,
        userId: request.user.id,
      });

      return reply.status(201).send({ task: newTask });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Update a task
  fastify.put('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      if (!request.user?.id) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }

      const { id } = request.params as { id: string };
      const updates = request.body as Partial<NewTask>;

      const updatedTask = await TaskService.updateTask(
        id,
        request.user.id,
        updates
      );

      if (!updatedTask) {
        return reply.status(404).send({ error: 'Task not found' });
      }

      return reply.send({ task: updatedTask });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Mark task as completed
  fastify.patch(
    '/:id/complete',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        if (!request.user?.id) {
          return reply.status(401).send({ error: 'Unauthorized' });
        }

        const { id } = request.params as { id: string };
        const completedTask = await TaskService.completeTask(
          id,
          request.user.id
        );

        if (!completedTask) {
          return reply.status(404).send({ error: 'Task not found' });
        }

        return reply.send({ task: completedTask });
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({ error: 'Internal server error' });
      }
    }
  );

  // Archive a task
  fastify.patch(
    '/:id/archive',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        if (!request.user?.id) {
          return reply.status(401).send({ error: 'Unauthorized' });
        }

        const { id } = request.params as { id: string };
        const success = await TaskService.archiveTask(id, request.user.id);

        if (!success) {
          return reply.status(404).send({ error: 'Task not found' });
        }

        return reply.send({ message: 'Task archived successfully' });
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({ error: 'Internal server error' });
      }
    }
  );

  // Delete a task permanently
  fastify.delete(
    '/:id',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        if (!request.user?.id) {
          return reply.status(401).send({ error: 'Unauthorized' });
        }

        const { id } = request.params as { id: string };
        const success = await TaskService.deleteTask(id, request.user.id);

        if (!success) {
          return reply.status(404).send({ error: 'Task not found' });
        }

        return reply.send({ message: 'Task deleted successfully' });
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({ error: 'Internal server error' });
      }
    }
  );

  // Update task order and board assignment
  fastify.patch(
    '/reorder',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        if (!request.user?.id) {
          return reply.status(401).send({ error: 'Unauthorized' });
        }

        const { taskOrders } = request.body as {
          taskOrders: { id: string; sortOrder: number; boardId?: string }[];
        };

        await TaskService.updateTaskOrder(request.user.id, taskOrders);

        return reply.send({ message: 'Task order updated successfully' });
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({ error: 'Internal server error' });
      }
    }
  );
}
