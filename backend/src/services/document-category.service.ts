import { db } from '../utils/database';
import {
  documentCategories,
  NewDocumentCategory,
  DocumentCategory,
} from '../models/schema';
import { eq, and, isNull } from 'drizzle-orm';

export class DocumentCategoryService {
  // Get all document categories for a user
  static async getUserDocumentCategories(
    userId: string
  ): Promise<DocumentCategory[]> {
    return await db
      .select()
      .from(documentCategories)
      .where(
        and(
          eq(documentCategories.userId, userId),
          eq(documentCategories.isArchived, false)
        )
      )
      .orderBy(documentCategories.sortOrder, documentCategories.name);
  }

  // Get root document categories (no parent)
  static async getRootDocumentCategories(
    userId: string
  ): Promise<DocumentCategory[]> {
    return await db
      .select()
      .from(documentCategories)
      .where(
        and(
          eq(documentCategories.userId, userId),
          isNull(documentCategories.parentId),
          eq(documentCategories.isArchived, false)
        )
      )
      .orderBy(documentCategories.sortOrder, documentCategories.name);
  }

  // Get child document categories
  static async getChildDocumentCategories(
    userId: string,
    parentId: string
  ): Promise<DocumentCategory[]> {
    return await db
      .select()
      .from(documentCategories)
      .where(
        and(
          eq(documentCategories.userId, userId),
          eq(documentCategories.parentId, parentId),
          eq(documentCategories.isArchived, false)
        )
      )
      .orderBy(documentCategories.sortOrder, documentCategories.name);
  }

  // Get document category by ID
  static async getDocumentCategoryById(
    id: string,
    userId: string
  ): Promise<DocumentCategory | null> {
    const result = await db
      .select()
      .from(documentCategories)
      .where(
        and(
          eq(documentCategories.id, id),
          eq(documentCategories.userId, userId)
        )
      )
      .limit(1);

    return result[0] || null;
  }

  // Create new document category
  static async createDocumentCategory(
    categoryData: NewDocumentCategory
  ): Promise<DocumentCategory> {
    const result = await db
      .insert(documentCategories)
      .values(categoryData)
      .returning();

    return result[0] as DocumentCategory;
  }

  // Update document category
  static async updateDocumentCategory(
    id: string,
    userId: string,
    updates: Partial<NewDocumentCategory>
  ): Promise<DocumentCategory | null> {
    const result = await db
      .update(documentCategories)
      .set({ ...updates, updatedAt: new Date() })
      .where(
        and(
          eq(documentCategories.id, id),
          eq(documentCategories.userId, userId)
        )
      )
      .returning();

    return result[0] || null;
  }

  // Archive document category
  static async archiveDocumentCategory(
    id: string,
    userId: string
  ): Promise<boolean> {
    const result = await db
      .update(documentCategories)
      .set({ isArchived: true, updatedAt: new Date() })
      .where(
        and(
          eq(documentCategories.id, id),
          eq(documentCategories.userId, userId)
        )
      )
      .returning();

    return result.length > 0;
  }

  // Delete document category permanently
  static async deleteDocumentCategory(
    id: string,
    userId: string
  ): Promise<boolean> {
    const result = await db
      .delete(documentCategories)
      .where(
        and(
          eq(documentCategories.id, id),
          eq(documentCategories.userId, userId)
        )
      )
      .returning();

    return result.length > 0;
  }

  // Update document category order
  static async updateDocumentCategoryOrder(
    userId: string,
    categoryOrders: { id: string; sortOrder: number; parentId?: string }[]
  ): Promise<void> {
    for (const order of categoryOrders) {
      await db
        .update(documentCategories)
        .set({
          sortOrder: order.sortOrder,
          parentId: order.parentId || null,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(documentCategories.id, order.id),
            eq(documentCategories.userId, userId)
          )
        );
    }
  }
}
