import { db } from '../utils/database';
import { lending, NewLending, Lending, items } from '../models/schema';
import { eq, and, desc, like, or } from 'drizzle-orm';

export class LendingService {
  // Get all lending records for a user
  static async getUserLendings(userId: string): Promise<Lending[]> {
    return await db
      .select()
      .from(lending)
      .where(eq(lending.userId, userId))
      .orderBy(desc(lending.lentDate));
  }

  // Get active lendings
  static async getActiveLendings(userId: string): Promise<Lending[]> {
    return await db
      .select()
      .from(lending)
      .where(and(eq(lending.userId, userId), eq(lending.status, 'active')))
      .orderBy(desc(lending.lentDate));
  }

  // Get overdue lendings
  static async getOverdueLendings(userId: string): Promise<Lending[]> {
    return await db
      .select()
      .from(lending)
      .where(and(eq(lending.userId, userId), eq(lending.isOverdue, true)))
      .orderBy(desc(lending.expectedReturnDate));
  }

  // Get lendings by status
  static async getLendingsByStatus(
    userId: string,
    status: string
  ): Promise<Lending[]> {
    return await db
      .select()
      .from(lending)
      .where(and(eq(lending.userId, userId), eq(lending.status, status)))
      .orderBy(desc(lending.lentDate));
  }

  // Search lendings
  static async searchLendings(
    userId: string,
    query: string
  ): Promise<Lending[]> {
    return await db
      .select()
      .from(lending)
      .where(
        and(
          eq(lending.userId, userId),
          or(
            like(lending.borrowerName, `%${query}%`),
            like(lending.borrowerEmail, `%${query}%`),
            like(lending.borrowerPhone, `%${query}%`),
            like(lending.purpose, `%${query}%`),
            like(lending.notes, `%${query}%`)
          )
        )
      )
      .orderBy(desc(lending.lentDate));
  }

  // Get lending by ID
  static async getLendingById(
    id: string,
    userId: string
  ): Promise<Lending | null> {
    const result = await db
      .select()
      .from(lending)
      .where(and(eq(lending.id, id), eq(lending.userId, userId)))
      .limit(1);

    return result[0] || null;
  }

  // Get lendings for an item
  static async getLendingsForItem(
    itemId: string,
    userId: string
  ): Promise<Lending[]> {
    return await db
      .select()
      .from(lending)
      .where(and(eq(lending.itemId, itemId), eq(lending.userId, userId)))
      .orderBy(desc(lending.lentDate));
  }

  // Create new lending record
  static async createLending(lendingData: NewLending): Promise<Lending> {
    const result = await db.insert(lending).values(lendingData).returning();

    // Mark item as lent
    await db
      .update(items)
      .set({ isLent: true, updatedAt: new Date() })
      .where(eq(items.id, lendingData.itemId));

    return result[0] as Lending;
  }

  // Update lending record
  static async updateLending(
    id: string,
    userId: string,
    updates: Partial<NewLending>
  ): Promise<Lending | null> {
    const result = await db
      .update(lending)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(lending.id, id), eq(lending.userId, userId)))
      .returning();

    return result[0] || null;
  }

  // Return item
  static async returnItem(
    id: string,
    userId: string,
    conditionWhenReturned?: string,
    damageNotes?: string
  ): Promise<Lending | null> {
    const lendingRecord = await this.getLendingById(id, userId);
    if (!lendingRecord) return null;

    const updates: Partial<NewLending> = {
      actualReturnDate: new Date(),
      status: 'returned',
      conditionWhenReturned,
      damageNotes,
    };

    const result = await db
      .update(lending)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(lending.id, id), eq(lending.userId, userId)))
      .returning();

    if (result[0]) {
      // Mark item as no longer lent
      await db
        .update(items)
        .set({ isLent: false, updatedAt: new Date() })
        .where(eq(items.id, lendingRecord.itemId));
    }

    return result[0] || null;
  }

  // Mark as overdue
  static async markAsOverdue(id: string, userId: string): Promise<boolean> {
    const result = await db
      .update(lending)
      .set({
        isOverdue: true,
        status: 'overdue',
        updatedAt: new Date(),
      })
      .where(and(eq(lending.id, id), eq(lending.userId, userId)))
      .returning();

    return result.length > 0;
  }

  // Mark as lost
  static async markAsLost(id: string, userId: string): Promise<boolean> {
    const lendingRecord = await this.getLendingById(id, userId);
    if (!lendingRecord) return false;

    const result = await db
      .update(lending)
      .set({
        status: 'lost',
        updatedAt: new Date(),
      })
      .where(and(eq(lending.id, id), eq(lending.userId, userId)))
      .returning();

    if (result.length > 0) {
      // Mark item as lost
      await db
        .update(items)
        .set({ isLost: true, isLent: false, updatedAt: new Date() })
        .where(eq(items.id, lendingRecord.itemId));
    }

    return result.length > 0;
  }

  // Send reminder
  static async sendReminder(id: string, userId: string): Promise<boolean> {
    const result = await db
      .update(lending)
      .set({
        reminderSent: true,
        lastReminderDate: new Date(),
        updatedAt: new Date(),
      })
      .where(and(eq(lending.id, id), eq(lending.userId, userId)))
      .returning();

    return result.length > 0;
  }

  // Delete lending record
  static async deleteLending(id: string, userId: string): Promise<boolean> {
    const lendingRecord = await this.getLendingById(id, userId);
    if (!lendingRecord) return false;

    const result = await db
      .delete(lending)
      .where(and(eq(lending.id, id), eq(lending.userId, userId)))
      .returning();

    if (result.length > 0) {
      // Mark item as no longer lent if it was active
      if (lendingRecord.status === 'active') {
        await db
          .update(items)
          .set({ isLent: false, updatedAt: new Date() })
          .where(eq(items.id, lendingRecord.itemId));
      }
    }

    return result.length > 0;
  }

  // Get lending statistics
  static async getLendingStats(userId: string): Promise<any> {
    // This would need proper aggregation queries in a real implementation
    const allLendings = await this.getUserLendings(userId);
    const activeLendings = await this.getActiveLendings(userId);
    const overdueLendings = await this.getOverdueLendings(userId);

    return {
      total: allLendings.length,
      active: activeLendings.length,
      overdue: overdueLendings.length,
      returned: allLendings.filter(l => l.status === 'returned').length,
      lost: allLendings.filter(l => l.status === 'lost').length,
    };
  }

  // Check for overdue items (utility function for background jobs)
  static async checkOverdueItems(userId: string): Promise<Lending[]> {
    const today = new Date();
    const activeLendings = await this.getActiveLendings(userId);

    const overdueItems = activeLendings.filter(lending => {
      return (
        lending.expectedReturnDate &&
        new Date(lending.expectedReturnDate) < today &&
        !lending.isOverdue
      );
    });

    // Mark them as overdue
    for (const lending of overdueItems) {
      await this.markAsOverdue(lending.id, userId);
    }

    return overdueItems;
  }
}
