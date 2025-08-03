import { db } from '../utils/database';
import { tags, NewTag, Tag, noteTags } from '../models/schema';
import { eq, and, desc, like, sql } from 'drizzle-orm';

export class TagService {
  // Get all tags for a user
  static async getUserTags(userId: string): Promise<Tag[]> {
    return await db
      .select()
      .from(tags)
      .where(eq(tags.userId, userId))
      .orderBy(desc(tags.usageCount), tags.name);
  }

  // Get popular tags
  static async getPopularTags(userId: string, limit = 10): Promise<Tag[]> {
    return await db
      .select()
      .from(tags)
      .where(eq(tags.userId, userId))
      .orderBy(desc(tags.usageCount))
      .limit(limit);
  }

  // Search tags
  static async searchTags(userId: string, query: string): Promise<Tag[]> {
    return await db
      .select()
      .from(tags)
      .where(and(eq(tags.userId, userId), like(tags.name, `%${query}%`)))
      .orderBy(desc(tags.usageCount), tags.name);
  }

  // Get tag by ID
  static async getTagById(id: string, userId: string): Promise<Tag | null> {
    const result = await db
      .select()
      .from(tags)
      .where(and(eq(tags.id, id), eq(tags.userId, userId)))
      .limit(1);

    return result[0] || null;
  }

  // Get tag by name
  static async getTagByName(name: string, userId: string): Promise<Tag | null> {
    const result = await db
      .select()
      .from(tags)
      .where(and(eq(tags.name, name), eq(tags.userId, userId)))
      .limit(1);

    return result[0] || null;
  }

  // Create new tag
  static async createTag(tagData: NewTag): Promise<Tag> {
    const result = await db.insert(tags).values(tagData).returning();
    return result[0] as Tag;
  }

  // Update tag
  static async updateTag(
    id: string,
    userId: string,
    updates: Partial<NewTag>
  ): Promise<Tag | null> {
    const result = await db
      .update(tags)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(tags.id, id), eq(tags.userId, userId)))
      .returning();

    return result[0] || null;
  }

  // Delete tag
  static async deleteTag(id: string, userId: string): Promise<boolean> {
    // First remove all note-tag associations
    await db.delete(noteTags).where(eq(noteTags.tagId, id));

    // Then delete the tag
    const result = await db
      .delete(tags)
      .where(and(eq(tags.id, id), eq(tags.userId, userId)))
      .returning();

    return result.length > 0;
  }

  // Increment usage count
  static async incrementUsageCount(id: string): Promise<void> {
    await db
      .update(tags)
      .set({
        usageCount: sql`${tags.usageCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(tags.id, id));
  }

  // Find or create tag by name
  static async findOrCreateTag(name: string, userId: string): Promise<Tag> {
    let tag = await this.getTagByName(name, userId);

    if (!tag) {
      tag = await this.createTag({
        name,
        userId,
        color: '#0078d4',
        usageCount: 0,
      });
    }

    return tag;
  }

  // Add tag to note
  static async addTagToNote(noteId: string, tagId: string): Promise<void> {
    // Check if association already exists
    const existing = await db
      .select()
      .from(noteTags)
      .where(and(eq(noteTags.noteId, noteId), eq(noteTags.tagId, tagId)))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(noteTags).values({ noteId, tagId });
      await this.incrementUsageCount(tagId);
    }
  }

  // Remove tag from note
  static async removeTagFromNote(noteId: string, tagId: string): Promise<void> {
    await db
      .delete(noteTags)
      .where(and(eq(noteTags.noteId, noteId), eq(noteTags.tagId, tagId)));

    // Decrement usage count
    await db
      .update(tags)
      .set({
        usageCount: sql`GREATEST(0, ${tags.usageCount} - 1)`,
        updatedAt: new Date(),
      })
      .where(eq(tags.id, tagId));
  }

  // Get tags for a note
  static async getTagsForNote(noteId: string): Promise<Tag[]> {
    const result = await db
      .select({
        id: tags.id,
        name: tags.name,
        color: tags.color,
        description: tags.description,
        usageCount: tags.usageCount,
        userId: tags.userId,
        createdAt: tags.createdAt,
        updatedAt: tags.updatedAt,
      })
      .from(noteTags)
      .innerJoin(tags, eq(noteTags.tagId, tags.id))
      .where(eq(noteTags.noteId, noteId))
      .orderBy(tags.name);

    return result;
  }
}
