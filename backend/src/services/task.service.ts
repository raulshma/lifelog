import { eq, and, desc, isNull, or } from 'drizzle-orm';
import { db } from '../utils/database';
import { tasks, type Task, type NewTask } from '../models/schema';

export class TaskService {
  // Get all tasks for a user
  static async getUserTasks(userId: string): Promise<Task[]> {
    return await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.userId, userId), eq(tasks.isArchived, false)))
      .orderBy(tasks.sortOrder, tasks.createdAt);
  }

  // Get tasks by board
  static async getTasksByBoard(
    boardId: string,
    userId: string
  ): Promise<Task[]> {
    return await db
      .select()
      .from(tasks)
      .where(
        and(
          eq(tasks.boardId, boardId),
          eq(tasks.userId, userId),
          eq(tasks.isArchived, false)
        )
      )
      .orderBy(tasks.sortOrder, tasks.createdAt);
  }

  // Get tasks without a board (inbox tasks)
  static async getInboxTasks(userId: string): Promise<Task[]> {
    return await db
      .select()
      .from(tasks)
      .where(
        and(
          eq(tasks.userId, userId),
          isNull(tasks.boardId),
          eq(tasks.isArchived, false)
        )
      )
      .orderBy(tasks.sortOrder, tasks.createdAt);
  }

  // Get a specific task by ID
  static async getTaskById(
    taskId: string,
    userId: string
  ): Promise<Task | null> {
    const result = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
      .limit(1);

    return result[0] || null;
  }

  // Create a new task
  static async createTask(taskData: NewTask): Promise<Task> {
    const result = await db
      .insert(tasks)
      .values({
        ...taskData,
        updatedAt: new Date(),
      })
      .returning();

    return result[0]!;
  }

  // Update a task
  static async updateTask(
    taskId: string,
    userId: string,
    updates: Partial<NewTask>
  ): Promise<Task | null> {
    const result = await db
      .update(tasks)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
      .returning();

    return result[0] || null;
  }

  // Mark task as completed
  static async completeTask(
    taskId: string,
    userId: string
  ): Promise<Task | null> {
    const result = await db
      .update(tasks)
      .set({
        status: 'done',
        completedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
      .returning();

    return result[0] || null;
  }

  // Archive a task (soft delete)
  static async archiveTask(taskId: string, userId: string): Promise<boolean> {
    const result = await db
      .update(tasks)
      .set({
        isArchived: true,
        updatedAt: new Date(),
      })
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
      .returning();

    return result.length > 0;
  }

  // Delete a task permanently
  static async deleteTask(taskId: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(tasks)
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
      .returning();

    return result.length > 0;
  }

  // Update task sort order
  static async updateTaskOrder(
    userId: string,
    taskOrders: { id: string; sortOrder: number; boardId?: string }[]
  ): Promise<void> {
    for (const { id, sortOrder, boardId } of taskOrders) {
      await db
        .update(tasks)
        .set({
          sortOrder,
          boardId: boardId || null,
          updatedAt: new Date(),
        })
        .where(and(eq(tasks.id, id), eq(tasks.userId, userId)));
    }
  }

  // Get tasks by status
  static async getTasksByStatus(
    userId: string,
    status: string,
    boardId?: string
  ): Promise<Task[]> {
    const conditions = [
      eq(tasks.userId, userId),
      eq(tasks.status, status),
      eq(tasks.isArchived, false),
    ];

    if (boardId) {
      conditions.push(eq(tasks.boardId, boardId));
    }

    return await db
      .select()
      .from(tasks)
      .where(and(...conditions))
      .orderBy(tasks.sortOrder, tasks.createdAt);
  }

  // Get overdue tasks
  static async getOverdueTasks(userId: string): Promise<Task[]> {
    return await db
      .select()
      .from(tasks)
      .where(
        and(
          eq(tasks.userId, userId),
          eq(tasks.isArchived, false),
          or(eq(tasks.status, 'todo'), eq(tasks.status, 'in-progress'))
        )
      )
      .orderBy(desc(tasks.dueDate));
  }
}
