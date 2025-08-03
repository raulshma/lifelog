import { db } from '../utils/database';
import { notebooks, NewNotebook, Notebook } from '../models/schema';
import { eq, and, isNull } from 'drizzle-orm';

export class NotebookService {
  // Get all notebooks for a user
  static async getUserNotebooks(userId: string): Promise<Notebook[]> {
    return await db
      .select()
      .from(notebooks)
      .where(and(eq(notebooks.userId, userId), eq(notebooks.isArchived, false)))
      .orderBy(notebooks.sortOrder, notebooks.name);
  }

  // Get root notebooks (no parent)
  static async getRootNotebooks(userId: string): Promise<Notebook[]> {
    return await db
      .select()
      .from(notebooks)
      .where(
        and(
          eq(notebooks.userId, userId),
          isNull(notebooks.parentId),
          eq(notebooks.isArchived, false)
        )
      )
      .orderBy(notebooks.sortOrder, notebooks.name);
  }

  // Get child notebooks
  static async getChildNotebooks(
    userId: string,
    parentId: string
  ): Promise<Notebook[]> {
    return await db
      .select()
      .from(notebooks)
      .where(
        and(
          eq(notebooks.userId, userId),
          eq(notebooks.parentId, parentId),
          eq(notebooks.isArchived, false)
        )
      )
      .orderBy(notebooks.sortOrder, notebooks.name);
  }

  // Get notebook by ID
  static async getNotebookById(
    id: string,
    userId: string
  ): Promise<Notebook | null> {
    const result = await db
      .select()
      .from(notebooks)
      .where(and(eq(notebooks.id, id), eq(notebooks.userId, userId)))
      .limit(1);

    return result[0] || null;
  }

  // Create new notebook
  static async createNotebook(notebookData: NewNotebook): Promise<Notebook> {
    const result = await db.insert(notebooks).values(notebookData).returning();

    return Array.isArray(result) ? result[0] : result;
  }

  // Update notebook
  static async updateNotebook(
    id: string,
    userId: string,
    updates: Partial<NewNotebook>
  ): Promise<Notebook | null> {
    const result = await db
      .update(notebooks)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(notebooks.id, id), eq(notebooks.userId, userId)))
      .returning();

    return result[0] || null;
  }

  // Archive notebook
  static async archiveNotebook(id: string, userId: string): Promise<boolean> {
    const result = await db
      .update(notebooks)
      .set({ isArchived: true, updatedAt: new Date() })
      .where(and(eq(notebooks.id, id), eq(notebooks.userId, userId)))
      .returning();

    return result.length > 0;
  }

  // Delete notebook permanently
  static async deleteNotebook(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(notebooks)
      .where(and(eq(notebooks.id, id), eq(notebooks.userId, userId)))
      .returning();

    return Array.isArray(result) && result.length > 0;
  }

  // Update notebook order
  static async updateNotebookOrder(
    userId: string,
    notebookOrders: { id: string; sortOrder: number; parentId?: string }[]
  ): Promise<void> {
    for (const order of notebookOrders) {
      await db
        .update(notebooks)
        .set({
          sortOrder: order.sortOrder,
          parentId: order.parentId || null,
          updatedAt: new Date(),
        })
        .where(and(eq(notebooks.id, order.id), eq(notebooks.userId, userId)));
    }
  }
}
