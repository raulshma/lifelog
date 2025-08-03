import { eq, and, desc, gte, between } from 'drizzle-orm';
import { db } from '../utils/database';
import { journals, type Journal, type NewJournal } from '../models/schema';

export class JournalService {
  // Get all journal entries for a user
  static async getUserJournals(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<Journal[]> {
    return await db
      .select()
      .from(journals)
      .where(eq(journals.userId, userId))
      .orderBy(desc(journals.date))
      .limit(limit)
      .offset(offset);
  }

  // Get journal entry by date
  static async getJournalByDate(
    userId: string,
    date: Date
  ): Promise<Journal | null> {
    // Create start and end of day for the given date
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const result = await db
      .select()
      .from(journals)
      .where(
        and(
          eq(journals.userId, userId),
          between(journals.date, startOfDay, endOfDay)
        )
      )
      .limit(1);

    return result[0] ?? null;
  }

  // Get a specific journal entry by ID
  static async getJournalById(
    journalId: string,
    userId: string
  ): Promise<Journal | null> {
    const result = await db
      .select()
      .from(journals)
      .where(and(eq(journals.id, journalId), eq(journals.userId, userId)))
      .limit(1);

    return result[0] ?? null;
  }

  // Create a new journal entry
  static async createJournal(journalData: NewJournal): Promise<Journal> {
    const result = await db
      .insert(journals)
      .values({
        ...journalData,
        updatedAt: new Date(),
      })
      .returning();

    return result[0]!;
  }

  // Update a journal entry
  static async updateJournal(
    journalId: string,
    userId: string,
    updates: Partial<NewJournal>
  ): Promise<Journal | null> {
    const result = await db
      .update(journals)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(and(eq(journals.id, journalId), eq(journals.userId, userId)))
      .returning();

    return result[0] ?? null;
  }

  // Delete a journal entry
  static async deleteJournal(
    journalId: string,
    userId: string
  ): Promise<boolean> {
    const result = await db
      .delete(journals)
      .where(and(eq(journals.id, journalId), eq(journals.userId, userId)))
      .returning();

    return result.length > 0;
  }

  // Get journal entries within a date range
  static async getJournalsByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Journal[]> {
    return await db
      .select()
      .from(journals)
      .where(
        and(
          eq(journals.userId, userId),
          between(journals.date, startDate, endDate)
        )
      )
      .orderBy(desc(journals.date));
  }

  // Get journal entries by mood
  static async getJournalsByMood(
    userId: string,
    mood: string
  ): Promise<Journal[]> {
    return await db
      .select()
      .from(journals)
      .where(and(eq(journals.userId, userId), eq(journals.mood, mood)))
      .orderBy(desc(journals.date));
  }

  // Get recent journal entries
  static async getRecentJournals(
    userId: string,
    days: number = 7
  ): Promise<Journal[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return await db
      .select()
      .from(journals)
      .where(and(eq(journals.userId, userId), gte(journals.date, startDate)))
      .orderBy(desc(journals.date));
  }

  // Search journal entries by content
  static async searchJournals(
    userId: string,
    _searchTerm: string
  ): Promise<Journal[]> {
    // Note: This is a basic search. For production, consider using full-text search
    return await db
      .select()
      .from(journals)
      .where(eq(journals.userId, userId))
      .orderBy(desc(journals.date));
    // TODO: Add proper text search when implementing full-text search
  }

  // Get journal statistics for a user
  static async getJournalStats(userId: string): Promise<{
    totalEntries: number;
    averageEnergyLevel: number | null;
    averageProductivityScore: number | null;
    mostCommonMood: string | null;
  }> {
    const entries = await db
      .select()
      .from(journals)
      .where(eq(journals.userId, userId));

    if (entries.length === 0) {
      return {
        totalEntries: 0,
        averageEnergyLevel: null,
        averageProductivityScore: null,
        mostCommonMood: null,
      };
    }

    const energyLevels = entries
      .filter(e => e.energyLevel !== null)
      .map(e => e.energyLevel!);

    const productivityScores = entries
      .filter(e => e.productivityScore !== null)
      .map(e => e.productivityScore!);

    const moods = entries.filter(e => e.mood !== null).map(e => e.mood!);

    const moodCounts = moods.reduce(
      (acc, mood) => {
        acc[mood] = (acc[mood] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const mostCommonMood = Object.keys(moodCounts).reduce((a, b) =>
      (moodCounts[a] ?? 0) > (moodCounts[b] ?? 0) ? a : b
    );

    return {
      totalEntries: entries.length,
      averageEnergyLevel:
        energyLevels.length > 0
          ? energyLevels.reduce((a, b) => a + b, 0) / energyLevels.length
          : null,
      averageProductivityScore:
        productivityScores.length > 0
          ? productivityScores.reduce((a, b) => a + b, 0) /
            productivityScores.length
          : null,
      mostCommonMood: moods.length > 0 ? mostCommonMood : null,
    };
  }
}
