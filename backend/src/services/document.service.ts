import { db } from '../utils/database';
import {
  documents,
  NewDocument,
  Document,
  documentAccessLog,
} from '../models/schema';
import { eq, and, desc, like, or, sql } from 'drizzle-orm';

export class DocumentService {
  // Get all documents for a user
  static async getUserDocuments(userId: string): Promise<Document[]> {
    return await db
      .select()
      .from(documents)
      .where(and(eq(documents.userId, userId), eq(documents.isArchived, false)))
      .orderBy(desc(documents.updatedAt));
  }

  // Get documents by category
  static async getDocumentsByCategory(
    categoryId: string,
    userId: string
  ): Promise<Document[]> {
    return await db
      .select()
      .from(documents)
      .where(
        and(
          eq(documents.userId, userId),
          eq(documents.categoryId, categoryId),
          eq(documents.isArchived, false)
        )
      )
      .orderBy(desc(documents.updatedAt));
  }

  // Get documents by type
  static async getDocumentsByType(
    documentType: string,
    userId: string
  ): Promise<Document[]> {
    return await db
      .select()
      .from(documents)
      .where(
        and(
          eq(documents.userId, userId),
          eq(documents.documentType, documentType),
          eq(documents.isArchived, false)
        )
      )
      .orderBy(desc(documents.updatedAt));
  }

  // Get favorite documents
  static async getFavoriteDocuments(userId: string): Promise<Document[]> {
    return await db
      .select()
      .from(documents)
      .where(
        and(
          eq(documents.userId, userId),
          eq(documents.isFavorite, true),
          eq(documents.isArchived, false)
        )
      )
      .orderBy(desc(documents.updatedAt));
  }

  // Get important documents
  static async getImportantDocuments(userId: string): Promise<Document[]> {
    return await db
      .select()
      .from(documents)
      .where(
        and(
          eq(documents.userId, userId),
          eq(documents.isImportant, true),
          eq(documents.isArchived, false)
        )
      )
      .orderBy(desc(documents.updatedAt));
  }

  // Search documents
  static async searchDocuments(
    userId: string,
    query: string
  ): Promise<Document[]> {
    return await db
      .select()
      .from(documents)
      .where(
        and(
          eq(documents.userId, userId),
          eq(documents.isArchived, false),
          or(
            like(documents.title, `%${query}%`),
            like(documents.description, `%${query}%`),
            like(documents.fileName, `%${query}%`),
            like(documents.extractedText, `%${query}%`),
            like(documents.searchableContent, `%${query}%`)
          )
        )
      )
      .orderBy(desc(documents.updatedAt));
  }

  // Get document by ID
  static async getDocumentById(
    id: string,
    userId: string,
    logAccess = true
  ): Promise<Document | null> {
    const result = await db
      .select()
      .from(documents)
      .where(and(eq(documents.id, id), eq(documents.userId, userId)))
      .limit(1);

    if (result[0] && logAccess) {
      // Update view count and last accessed
      await db
        .update(documents)
        .set({
          viewCount: result[0].viewCount + 1,
          lastAccessedAt: new Date(),
        })
        .where(eq(documents.id, id));

      // Log access
      await this.logAccess(userId, id, 'view');
    }

    return result[0] || null;
  }

  // Create new document
  static async createDocument(documentData: NewDocument): Promise<Document> {
    const result = await db.insert(documents).values(documentData).returning();

    // Log creation
    if (result[0]) {
      await this.logAccess(documentData.userId, result[0].id, 'create');
    }

    return result[0] as Document;
  }

  // Update document
  static async updateDocument(
    id: string,
    userId: string,
    updates: Partial<NewDocument>
  ): Promise<Document | null> {
    // If this is a new version, increment version number
    if (updates.storagePath || updates.fileName) {
      const currentDoc = await this.getDocumentById(id, userId, false);
      if (currentDoc) {
        updates.version = (currentDoc.version || 1) + 1;
      }
    }

    const result = await db
      .update(documents)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(documents.id, id), eq(documents.userId, userId)))
      .returning();

    if (result[0]) {
      // Log update
      await this.logAccess(userId, id, 'edit');
    }

    return result[0] || null;
  }

  // Archive document
  static async archiveDocument(id: string, userId: string): Promise<boolean> {
    const result = await db
      .update(documents)
      .set({ isArchived: true, updatedAt: new Date() })
      .where(and(eq(documents.id, id), eq(documents.userId, userId)))
      .returning();

    if (result.length > 0) {
      await this.logAccess(userId, id, 'archive');
    }

    return result.length > 0;
  }

  // Delete document permanently
  static async deleteDocument(id: string, userId: string): Promise<boolean> {
    // Log deletion before deleting
    await this.logAccess(userId, id, 'delete');

    const result = await db
      .delete(documents)
      .where(and(eq(documents.id, id), eq(documents.userId, userId)))
      .returning();

    return result.length > 0;
  }

  // Toggle favorite
  static async toggleFavorite(
    id: string,
    userId: string
  ): Promise<Document | null> {
    const document = await this.getDocumentById(id, userId, false);
    if (!document) return null;

    const result = await db
      .update(documents)
      .set({ isFavorite: !document.isFavorite, updatedAt: new Date() })
      .where(and(eq(documents.id, id), eq(documents.userId, userId)))
      .returning();

    return result[0] || null;
  }

  // Toggle important
  static async toggleImportant(
    id: string,
    userId: string
  ): Promise<Document | null> {
    const document = await this.getDocumentById(id, userId, false);
    if (!document) return null;

    const result = await db
      .update(documents)
      .set({ isImportant: !document.isImportant, updatedAt: new Date() })
      .where(and(eq(documents.id, id), eq(documents.userId, userId)))
      .returning();

    return result[0] || null;
  }

  // Get documents expiring soon
  static async getExpiringDocuments(
    userId: string,
    days = 30
  ): Promise<Document[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return await db
      .select()
      .from(documents)
      .where(
        and(
          eq(documents.userId, userId),
          eq(documents.isArchived, false)
          // Note: This would need proper date comparison in a real implementation
        )
      )
      .orderBy(documents.expirationDate);
  }

  // Log download
  static async logDownload(id: string, userId: string): Promise<void> {
    // Update download count
    await db
      .update(documents)
      .set({
        downloadCount: sql`${documents.downloadCount} + 1`,
      })
      .where(eq(documents.id, id));

    // Log access
    await this.logAccess(userId, id, 'download');
  }

  // Log access for audit trail
  private static async logAccess(
    userId: string,
    documentId: string,
    action: string,
    success = true,
    failureReason?: string
  ): Promise<void> {
    await db.insert(documentAccessLog).values({
      userId,
      documentId,
      action,
      success,
      failureReason,
      // In a real implementation, you'd capture IP, user agent, etc.
    });
  }

  // Get access log for a document
  static async getAccessLog(
    documentId: string,
    userId: string,
    limit = 50
  ): Promise<any[]> {
    return await db
      .select()
      .from(documentAccessLog)
      .where(
        and(
          eq(documentAccessLog.documentId, documentId),
          eq(documentAccessLog.userId, userId)
        )
      )
      .orderBy(desc(documentAccessLog.createdAt))
      .limit(limit);
  }
}
