import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { DocumentService } from '../services/document.service';
import { NewDocument } from '../models/schema';

export async function documentRoutes(fastify: FastifyInstance) {
  // Get all documents for the authenticated user
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

      let documents;
      if (search) {
        documents = await DocumentService.searchDocuments(
          request.user.id,
          search
        );
      } else if (categoryId) {
        documents = await DocumentService.getDocumentsByCategory(
          categoryId,
          request.user.id
        );
      } else if (type) {
        documents = await DocumentService.getDocumentsByType(
          type,
          request.user.id
        );
      } else {
        documents = await DocumentService.getUserDocuments(request.user.id);
      }

      return reply.send({ documents });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Get favorite documents
  fastify.get(
    '/favorites',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        if (!request.user?.id) {
          return reply.status(401).send({ error: 'Unauthorized' });
        }

        const documents = await DocumentService.getFavoriteDocuments(
          request.user.id
        );
        return reply.send({ documents });
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({ error: 'Internal server error' });
      }
    }
  );

  // Get important documents
  fastify.get(
    '/important',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        if (!request.user?.id) {
          return reply.status(401).send({ error: 'Unauthorized' });
        }

        const documents = await DocumentService.getImportantDocuments(
          request.user.id
        );
        return reply.send({ documents });
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({ error: 'Internal server error' });
      }
    }
  );

  // Get a specific document by ID
  fastify.get('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      if (!request.user?.id) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }

      const { id } = request.params as { id: string };
      const document = await DocumentService.getDocumentById(
        id,
        request.user.id
      );

      if (!document) {
        return reply.status(404).send({ error: 'Document not found' });
      }

      return reply.send({ document });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Create a new document
  fastify.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      if (!request.user?.id) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }

      const documentData = request.body as Omit<NewDocument, 'userId'>;
      const newDocument = await DocumentService.createDocument({
        ...documentData,
        userId: request.user.id,
      });

      return reply.status(201).send({ document: newDocument });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Update a document
  fastify.put('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      if (!request.user?.id) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }

      const { id } = request.params as { id: string };
      const updates = request.body as Partial<NewDocument>;

      const updatedDocument = await DocumentService.updateDocument(
        id,
        request.user.id,
        updates
      );

      if (!updatedDocument) {
        return reply.status(404).send({ error: 'Document not found' });
      }

      return reply.send({ document: updatedDocument });
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
        const updatedDocument = await DocumentService.toggleFavorite(
          id,
          request.user.id
        );

        if (!updatedDocument) {
          return reply.status(404).send({ error: 'Document not found' });
        }

        return reply.send({ document: updatedDocument });
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({ error: 'Internal server error' });
      }
    }
  );

  // Toggle important
  fastify.patch(
    '/:id/important',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        if (!request.user?.id) {
          return reply.status(401).send({ error: 'Unauthorized' });
        }

        const { id } = request.params as { id: string };
        const updatedDocument = await DocumentService.toggleImportant(
          id,
          request.user.id
        );

        if (!updatedDocument) {
          return reply.status(404).send({ error: 'Document not found' });
        }

        return reply.send({ document: updatedDocument });
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({ error: 'Internal server error' });
      }
    }
  );

  // Download document
  fastify.get(
    '/:id/download',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        if (!request.user?.id) {
          return reply.status(401).send({ error: 'Unauthorized' });
        }

        const { id } = request.params as { id: string };
        const document = await DocumentService.getDocumentById(
          id,
          request.user.id,
          false
        );

        if (!document) {
          return reply.status(404).send({ error: 'Document not found' });
        }

        // Log the download
        await DocumentService.logDownload(id, request.user.id);

        // In a real implementation, you'd serve the actual file
        return reply.send({
          message: 'Download logged',
          downloadUrl: document.storagePath,
        });
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({ error: 'Internal server error' });
      }
    }
  );

  // Delete a document permanently
  fastify.delete(
    '/:id',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        if (!request.user?.id) {
          return reply.status(401).send({ error: 'Unauthorized' });
        }

        const { id } = request.params as { id: string };
        const success = await DocumentService.deleteDocument(
          id,
          request.user.id
        );

        if (!success) {
          return reply.status(404).send({ error: 'Document not found' });
        }

        return reply.send({ message: 'Document deleted successfully' });
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({ error: 'Internal server error' });
      }
    }
  );
}
