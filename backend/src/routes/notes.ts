import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { NoteService } from '../services/note.service';
import { TagService } from '../services/tag.service';
import { NewNote } from '../models/schema';

export async function noteRoutes(fastify: FastifyInstance) {
  // Get all notes for the authenticated user
  fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      if (!request.user?.id) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }

      const { notebookId, search } = request.query as {
        notebookId?: string;
        search?: string;
      };

      let notes;
      if (search) {
        notes = await NoteService.searchNotes(request.user.id, search);
      } else if (notebookId) {
        notes = await NoteService.getNotesByNotebook(
          notebookId,
          request.user.id
        );
      } else {
        notes = await NoteService.getUserNotes(request.user.id);
      }

      return reply.send({ notes });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Get favorite notes
  fastify.get(
    '/favorites',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        if (!request.user?.id) {
          return reply.status(401).send({ error: 'Unauthorized' });
        }

        const notes = await NoteService.getFavoriteNotes(request.user.id);
        return reply.send({ notes });
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({ error: 'Internal server error' });
      }
    }
  );

  // Get pinned notes
  fastify.get(
    '/pinned',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        if (!request.user?.id) {
          return reply.status(401).send({ error: 'Unauthorized' });
        }

        const notes = await NoteService.getPinnedNotes(request.user.id);
        return reply.send({ notes });
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({ error: 'Internal server error' });
      }
    }
  );

  // Get notes by tag
  fastify.get(
    '/tag/:tagId',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        if (!request.user?.id) {
          return reply.status(401).send({ error: 'Unauthorized' });
        }

        const { tagId } = request.params as { tagId: string };
        const notes = await NoteService.getNotesByTag(request.user.id, tagId);
        return reply.send({ notes });
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({ error: 'Internal server error' });
      }
    }
  );

  // Get a specific note by ID
  fastify.get('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      if (!request.user?.id) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }

      const { id } = request.params as { id: string };
      const note = await NoteService.getNoteById(id, request.user.id);

      if (!note) {
        return reply.status(404).send({ error: 'Note not found' });
      }

      // Get tags for this note
      const tags = await TagService.getTagsForNote(id);

      return reply.send({ note: { ...note, tags } });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Create a new note
  fastify.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      if (!request.user?.id) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }

      const { tags: tagNames, ...noteData } = request.body as Omit<
        NewNote,
        'userId'
      > & { tags?: string[] };

      const newNote = await NoteService.createNote({
        ...noteData,
        userId: request.user.id,
      });

      // Handle tags if provided
      if (tagNames && tagNames.length > 0) {
        for (const tagName of tagNames) {
          const tag = await TagService.findOrCreateTag(
            tagName,
            request.user.id
          );
          await TagService.addTagToNote(newNote.id, tag.id);
        }
      }

      return reply.status(201).send({ note: newNote });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Update a note
  fastify.put('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      if (!request.user?.id) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }

      const { id } = request.params as { id: string };
      const { tags: tagNames, ...updates } =
        request.body as Partial<NewNote> & {
          tags?: string[];
        };

      const updatedNote = await NoteService.updateNote(
        id,
        request.user.id,
        updates
      );

      if (!updatedNote) {
        return reply.status(404).send({ error: 'Note not found' });
      }

      // Handle tags if provided
      if (tagNames !== undefined) {
        // Get current tags
        const currentTags = await TagService.getTagsForNote(id);

        // Remove all current tags
        for (const tag of currentTags) {
          await TagService.removeTagFromNote(id, tag.id);
        }

        // Add new tags
        for (const tagName of tagNames) {
          const tag = await TagService.findOrCreateTag(
            tagName,
            request.user.id
          );
          await TagService.addTagToNote(id, tag.id);
        }
      }

      return reply.send({ note: updatedNote });
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
        const updatedNote = await NoteService.toggleFavorite(
          id,
          request.user.id
        );

        if (!updatedNote) {
          return reply.status(404).send({ error: 'Note not found' });
        }

        return reply.send({ note: updatedNote });
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({ error: 'Internal server error' });
      }
    }
  );

  // Toggle pin
  fastify.patch(
    '/:id/pin',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        if (!request.user?.id) {
          return reply.status(401).send({ error: 'Unauthorized' });
        }

        const { id } = request.params as { id: string };
        const updatedNote = await NoteService.togglePin(id, request.user.id);

        if (!updatedNote) {
          return reply.status(404).send({ error: 'Note not found' });
        }

        return reply.send({ note: updatedNote });
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({ error: 'Internal server error' });
      }
    }
  );

  // Archive a note
  fastify.patch(
    '/:id/archive',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        if (!request.user?.id) {
          return reply.status(401).send({ error: 'Unauthorized' });
        }

        const { id } = request.params as { id: string };
        const success = await NoteService.archiveNote(id, request.user.id);

        if (!success) {
          return reply.status(404).send({ error: 'Note not found' });
        }

        return reply.send({ message: 'Note archived successfully' });
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({ error: 'Internal server error' });
      }
    }
  );

  // Delete a note permanently
  fastify.delete(
    '/:id',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        if (!request.user?.id) {
          return reply.status(401).send({ error: 'Unauthorized' });
        }

        const { id } = request.params as { id: string };
        const success = await NoteService.deleteNote(id, request.user.id);

        if (!success) {
          return reply.status(404).send({ error: 'Note not found' });
        }

        return reply.send({ message: 'Note deleted successfully' });
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({ error: 'Internal server error' });
      }
    }
  );
}
