import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { JournalService } from '../services/journal.service';
import { NewJournal } from '../models/schema';

export async function journalRoutes(fastify: FastifyInstance) {
  // Get all journal entries for the authenticated user
  fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      if (!request.user?.id) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }

      const { limit = 50, offset = 0 } = request.query as {
        limit?: number;
        offset?: number;
      };

      const journals = await JournalService.getUserJournals(
        request.user.id,
        Number(limit),
        Number(offset)
      );

      return reply.send({ journals });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Get journal entry by date
  fastify.get(
    '/date/:date',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        if (!request.user?.id) {
          return reply.status(401).send({ error: 'Unauthorized' });
        }

        const { date } = request.params as { date: string };
        const journalDate = new Date(date);

        if (isNaN(journalDate.getTime())) {
          return reply.status(400).send({ error: 'Invalid date format' });
        }

        const journal = await JournalService.getJournalByDate(
          request.user.id,
          journalDate
        );

        if (!journal) {
          return reply
            .status(404)
            .send({ error: 'Journal entry not found for this date' });
        }

        return reply.send({ journal });
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({ error: 'Internal server error' });
      }
    }
  );

  // Get recent journal entries
  fastify.get(
    '/recent',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        if (!request.user?.id) {
          return reply.status(401).send({ error: 'Unauthorized' });
        }

        const { days = 7 } = request.query as { days?: number };
        const journals = await JournalService.getRecentJournals(
          request.user.id,
          Number(days)
        );

        return reply.send({ journals });
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({ error: 'Internal server error' });
      }
    }
  );

  // Get journal statistics
  fastify.get(
    '/stats',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        if (!request.user?.id) {
          return reply.status(401).send({ error: 'Unauthorized' });
        }

        const stats = await JournalService.getJournalStats(request.user.id);
        return reply.send({ stats });
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({ error: 'Internal server error' });
      }
    }
  );

  // Get journal entries by mood
  fastify.get(
    '/mood/:mood',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        if (!request.user?.id) {
          return reply.status(401).send({ error: 'Unauthorized' });
        }

        const { mood } = request.params as { mood: string };
        const journals = await JournalService.getJournalsByMood(
          request.user.id,
          mood
        );

        return reply.send({ journals });
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({ error: 'Internal server error' });
      }
    }
  );

  // Get journal entries within a date range
  fastify.get(
    '/range',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        if (!request.user?.id) {
          return reply.status(401).send({ error: 'Unauthorized' });
        }

        const { startDate, endDate } = request.query as {
          startDate: string;
          endDate: string;
        };

        if (!startDate || !endDate) {
          return reply
            .status(400)
            .send({ error: 'Start date and end date are required' });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          return reply.status(400).send({ error: 'Invalid date format' });
        }

        const journals = await JournalService.getJournalsByDateRange(
          request.user.id,
          start,
          end
        );

        return reply.send({ journals });
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({ error: 'Internal server error' });
      }
    }
  );

  // Get a specific journal entry by ID
  fastify.get('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      if (!request.user?.id) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }

      const { id } = request.params as { id: string };
      const journal = await JournalService.getJournalById(id, request.user.id);

      if (!journal) {
        return reply.status(404).send({ error: 'Journal entry not found' });
      }

      return reply.send({ journal });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Create a new journal entry
  fastify.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      if (!request.user?.id) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }

      const journalData = request.body as Omit<NewJournal, 'userId'>;

      // Ensure date is provided
      if (!journalData.date) {
        journalData.date = new Date();
      }

      const newJournal = await JournalService.createJournal({
        ...journalData,
        userId: request.user.id,
      });

      return reply.status(201).send({ journal: newJournal });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Update a journal entry
  fastify.put('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      if (!request.user?.id) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }

      const { id } = request.params as { id: string };
      const updates = request.body as Partial<NewJournal>;

      const updatedJournal = await JournalService.updateJournal(
        id,
        request.user.id,
        updates
      );

      if (!updatedJournal) {
        return reply.status(404).send({ error: 'Journal entry not found' });
      }

      return reply.send({ journal: updatedJournal });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Delete a journal entry
  fastify.delete(
    '/:id',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        if (!request.user?.id) {
          return reply.status(401).send({ error: 'Unauthorized' });
        }

        const { id } = request.params as { id: string };
        const success = await JournalService.deleteJournal(id, request.user.id);

        if (!success) {
          return reply.status(404).send({ error: 'Journal entry not found' });
        }

        return reply.send({ message: 'Journal entry deleted successfully' });
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({ error: 'Internal server error' });
      }
    }
  );
}
