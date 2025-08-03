import { db } from '../utils/database';
import { notes, NewNote, Note, noteTags } from '../models/schema';
import { eq, and, desc, like, or, inArray } from 'drizzle-orm';

export class NoteService {
  // Get all notes for a user
  static async getUserNotes(userId: string): Promise<Note[]> {
    return await db
      .select()
      .from(notes)
      .where(and(eq(notes.userId, userId), eq(notes.isArchived, false)))
      .orderBy(desc(notes.updatedAt));
  }

  // Get notes by notebook
  static async getNotesByNotebook(
    notebookId: string,
    userId: string
  ): Promise<Note[]> {
    return await db
      .select()
      .from(notes)
      .where(
        and(
          eq(notes.userId, userId),
          eq(notes.notebookId, notebookId),
          eq(notes.isArchived, false)
        )
      )
      .orderBy(desc(notes.updatedAt));
  }

  // Get favorite notes
  static async getFavoriteNotes(userId: string): Promise<Note[]> {
    return await db
      .select()
      .from(notes)
      .where(
        and(
          eq(notes.userId, userId),
          eq(notes.isFavorite, true),
          eq(notes.isArchived, false)
        )
      )
      .orderBy(desc(notes.updatedAt));
  }

  // Get pinned notes
  static async getPinnedNotes(userId: string): Promise<Note[]> {
    return await db
      .select()
      .from(notes)
      .where(
        and(
          eq(notes.userId, userId),
          eq(notes.isPinned, true),
          eq(notes.isArchived, false)
        )
      )
      .orderBy(desc(notes.updatedAt));
  }

  // Search notes
  static async searchNotes(userId: string, query: string): Promise<Note[]> {
    return await db
      .select()
      .from(notes)
      .where(
        and(
          eq(notes.userId, userId),
          eq(notes.isArchived, false),
          or(
            like(notes.title, `%${query}%`),
            like(notes.content, `%${query}%`),
            like(notes.excerpt, `%${query}%`)
          )
        )
      )
      .orderBy(desc(notes.updatedAt));
  }

  // Get note by ID
  static async getNoteById(id: string, userId: string): Promise<Note | null> {
    const result = await db
      .select()
      .from(notes)
      .where(and(eq(notes.id, id), eq(notes.userId, userId)))
      .limit(1);

    if (result[0]) {
      // Update view count and last viewed
      await db
        .update(notes)
        .set({
          viewCount: result[0].viewCount + 1,
          lastViewedAt: new Date(),
        })
        .where(eq(notes.id, id));
    }

    return result[0] || null;
  }

  // Create new note
  static async createNote(noteData: NewNote): Promise<Note> {
    // Calculate word count and reading time
    const wordCount = noteData.content
      ? noteData.content.split(/\s+/).length
      : 0;
    const readingTime = Math.ceil(wordCount / 200); // Assume 200 words per minute

    const result = await db
      .insert(notes)
      .values({
        ...noteData,
        wordCount,
        readingTime,
      })
      .returning();

    return result[0] as Note;
  }

  // Update note
  static async updateNote(
    id: string,
    userId: string,
    updates: Partial<NewNote>
  ): Promise<Note | null> {
    // Recalculate word count and reading time if content is updated
    if (updates.content) {
      const wordCount = updates.content.split(/\s+/).length;
      const readingTime = Math.ceil(wordCount / 200);
      updates.wordCount = wordCount;
      updates.readingTime = readingTime;
    }

    const result = await db
      .update(notes)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(notes.id, id), eq(notes.userId, userId)))
      .returning();

    return result[0] || null;
  }

  // Archive note
  static async archiveNote(id: string, userId: string): Promise<boolean> {
    const result = await db
      .update(notes)
      .set({ isArchived: true, updatedAt: new Date() })
      .where(and(eq(notes.id, id), eq(notes.userId, userId)))
      .returning();

    return result.length > 0;
  }

  // Delete note permanently
  static async deleteNote(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(notes)
      .where(and(eq(notes.id, id), eq(notes.userId, userId)))
      .returning();

    return result.length > 0;
  }

  // Toggle favorite
  static async toggleFavorite(
    id: string,
    userId: string
  ): Promise<Note | null> {
    const note = await this.getNoteById(id, userId);
    if (!note) return null;

    const result = await db
      .update(notes)
      .set({ isFavorite: !note.isFavorite, updatedAt: new Date() })
      .where(and(eq(notes.id, id), eq(notes.userId, userId)))
      .returning();

    return result[0] || null;
  }

  // Toggle pin
  static async togglePin(id: string, userId: string): Promise<Note | null> {
    const note = await this.getNoteById(id, userId);
    if (!note) return null;

    const result = await db
      .update(notes)
      .set({ isPinned: !note.isPinned, updatedAt: new Date() })
      .where(and(eq(notes.id, id), eq(notes.userId, userId)))
      .returning();

    return result[0] || null;
  }

  // Get notes by tag
  static async getNotesByTag(userId: string, tagId: string): Promise<Note[]> {
    const noteIds = await db
      .select({ noteId: noteTags.noteId })
      .from(noteTags)
      .where(eq(noteTags.tagId, tagId));

    if (noteIds.length === 0) return [];

    return await db
      .select()
      .from(notes)
      .where(
        and(
          eq(notes.userId, userId),
          inArray(
            notes.id,
            noteIds.map(n => n.noteId)
          ),
          eq(notes.isArchived, false)
        )
      )
      .orderBy(desc(notes.updatedAt));
  }
}
