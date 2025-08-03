import { eq, and } from 'drizzle-orm';
import { db } from '../utils/database';
import { boards, type Board, type NewBoard } from '../models/schema';

export class BoardService {
  // Get all boards for a user
  static async getUserBoards(userId: string): Promise<Board[]> {
    return await db
      .select()
      .from(boards)
      .where(and(eq(boards.userId, userId), eq(boards.isArchived, false)))
      .orderBy(boards.sortOrder, boards.createdAt);
  }

  // Get a specific board by ID
  static async getBoardById(
    boardId: string,
    userId: string
  ): Promise<Board | null> {
    const result = await db
      .select()
      .from(boards)
      .where(and(eq(boards.id, boardId), eq(boards.userId, userId)))
      .limit(1);

    return result[0] ?? null;
  }

  // Create a new board
  static async createBoard(boardData: NewBoard): Promise<Board> {
    const result = await db
      .insert(boards)
      .values({
        ...boardData,
        updatedAt: new Date(),
      })
      .returning();

    return result[0]!;
  }

  // Update a board
  static async updateBoard(
    boardId: string,
    userId: string,
    updates: Partial<NewBoard>
  ): Promise<Board | null> {
    const result = await db
      .update(boards)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(and(eq(boards.id, boardId), eq(boards.userId, userId)))
      .returning();

    return result[0] ?? null;
  }

  // Archive a board (soft delete)
  static async archiveBoard(boardId: string, userId: string): Promise<boolean> {
    const result = await db
      .update(boards)
      .set({
        isArchived: true,
        updatedAt: new Date(),
      })
      .where(and(eq(boards.id, boardId), eq(boards.userId, userId)))
      .returning();

    return result.length > 0;
  }

  // Delete a board permanently
  static async deleteBoard(boardId: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(boards)
      .where(and(eq(boards.id, boardId), eq(boards.userId, userId)))
      .returning();

    return result.length > 0;
  }

  // Update board sort order
  static async updateBoardOrder(
    userId: string,
    boardOrders: { id: string; sortOrder: number }[]
  ): Promise<void> {
    for (const { id, sortOrder } of boardOrders) {
      await db
        .update(boards)
        .set({
          sortOrder,
          updatedAt: new Date(),
        })
        .where(and(eq(boards.id, id), eq(boards.userId, userId)));
    }
  }
}
