import { db } from '../utils/database';
import { items, NewItem, Item, itemLocationHistory } from '../models/schema';
import { eq, and, desc, like, or } from 'drizzle-orm';

export class ItemService {
  // Get all items for a user
  static async getUserItems(userId: string): Promise<Item[]> {
    return await db
      .select()
      .from(items)
      .where(and(eq(items.userId, userId), eq(items.isArchived, false)))
      .orderBy(desc(items.updatedAt));
  }

  // Get items by location
  static async getItemsByLocation(
    locationId: string,
    userId: string
  ): Promise<Item[]> {
    return await db
      .select()
      .from(items)
      .where(
        and(
          eq(items.userId, userId),
          eq(items.locationId, locationId),
          eq(items.isArchived, false)
        )
      )
      .orderBy(desc(items.updatedAt));
  }

  // Get items by category
  static async getItemsByCategory(
    category: string,
    userId: string
  ): Promise<Item[]> {
    return await db
      .select()
      .from(items)
      .where(
        and(
          eq(items.userId, userId),
          eq(items.category, category),
          eq(items.isArchived, false)
        )
      )
      .orderBy(desc(items.updatedAt));
  }

  // Get favorite items
  static async getFavoriteItems(userId: string): Promise<Item[]> {
    return await db
      .select()
      .from(items)
      .where(
        and(
          eq(items.userId, userId),
          eq(items.isFavorite, true),
          eq(items.isArchived, false)
        )
      )
      .orderBy(desc(items.updatedAt));
  }

  // Get lost items
  static async getLostItems(userId: string): Promise<Item[]> {
    return await db
      .select()
      .from(items)
      .where(
        and(
          eq(items.userId, userId),
          eq(items.isLost, true),
          eq(items.isArchived, false)
        )
      )
      .orderBy(desc(items.updatedAt));
  }

  // Get broken items
  static async getBrokenItems(userId: string): Promise<Item[]> {
    return await db
      .select()
      .from(items)
      .where(
        and(
          eq(items.userId, userId),
          eq(items.isBroken, true),
          eq(items.isArchived, false)
        )
      )
      .orderBy(desc(items.updatedAt));
  }

  // Get lent items
  static async getLentItems(userId: string): Promise<Item[]> {
    return await db
      .select()
      .from(items)
      .where(
        and(
          eq(items.userId, userId),
          eq(items.isLent, true),
          eq(items.isArchived, false)
        )
      )
      .orderBy(desc(items.updatedAt));
  }

  // Search items
  static async searchItems(userId: string, query: string): Promise<Item[]> {
    return await db
      .select()
      .from(items)
      .where(
        and(
          eq(items.userId, userId),
          eq(items.isArchived, false),
          or(
            like(items.name, `%${query}%`),
            like(items.description, `%${query}%`),
            like(items.brand, `%${query}%`),
            like(items.model, `%${query}%`),
            like(items.serialNumber, `%${query}%`),
            like(items.barcode, `%${query}%`),
            like(items.customId, `%${query}%`),
            like(items.notes, `%${query}%`),
            like(items.searchKeywords, `%${query}%`)
          )
        )
      )
      .orderBy(desc(items.updatedAt));
  }

  // Get item by ID
  static async getItemById(id: string, userId: string): Promise<Item | null> {
    const result = await db
      .select()
      .from(items)
      .where(and(eq(items.id, id), eq(items.userId, userId)))
      .limit(1);

    if (result[0]) {
      // Update last used date
      await db
        .update(items)
        .set({ lastUsedAt: new Date() })
        .where(eq(items.id, id));
    }

    return result[0] || null;
  }

  // Get item by barcode
  static async getItemByBarcode(
    barcode: string,
    userId: string
  ): Promise<Item | null> {
    const result = await db
      .select()
      .from(items)
      .where(and(eq(items.barcode, barcode), eq(items.userId, userId)))
      .limit(1);

    return result[0] || null;
  }

  // Get item by custom ID
  static async getItemByCustomId(
    customId: string,
    userId: string
  ): Promise<Item | null> {
    const result = await db
      .select()
      .from(items)
      .where(and(eq(items.customId, customId), eq(items.userId, userId)))
      .limit(1);

    return result[0] || null;
  }

  // Create new item
  static async createItem(itemData: NewItem): Promise<Item> {
    const result = await db.insert(items).values(itemData).returning();
    return result[0] as Item;
  }

  // Update item
  static async updateItem(
    id: string,
    userId: string,
    updates: Partial<NewItem>
  ): Promise<Item | null> {
    const result = await db
      .update(items)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(items.id, id), eq(items.userId, userId)))
      .returning();

    return result[0] || null;
  }

  // Move item to new location
  static async moveItem(
    id: string,
    userId: string,
    newLocationId: string,
    reason?: string,
    notes?: string
  ): Promise<Item | null> {
    const item = await this.getItemById(id, userId);
    if (!item) return null;

    // Log the move in history
    await db.insert(itemLocationHistory).values({
      itemId: id,
      fromLocationId: item.locationId,
      toLocationId: newLocationId,
      reason: reason || 'manual_move',
      notes,
      movedBy: 'user', // In a real app, you'd get this from the session
    });

    // Update item location
    const result = await db
      .update(items)
      .set({ locationId: newLocationId, updatedAt: new Date() })
      .where(and(eq(items.id, id), eq(items.userId, userId)))
      .returning();

    return result[0] || null;
  }

  // Archive item
  static async archiveItem(id: string, userId: string): Promise<boolean> {
    const result = await db
      .update(items)
      .set({ isArchived: true, updatedAt: new Date() })
      .where(and(eq(items.id, id), eq(items.userId, userId)))
      .returning();

    return result.length > 0;
  }

  // Delete item permanently
  static async deleteItem(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(items)
      .where(and(eq(items.id, id), eq(items.userId, userId)))
      .returning();

    return result.length > 0;
  }

  // Toggle favorite
  static async toggleFavorite(
    id: string,
    userId: string
  ): Promise<Item | null> {
    const item = await this.getItemById(id, userId);
    if (!item) return null;

    const result = await db
      .update(items)
      .set({ isFavorite: !item.isFavorite, updatedAt: new Date() })
      .where(and(eq(items.id, id), eq(items.userId, userId)))
      .returning();

    return result[0] || null;
  }

  // Mark as lost/found
  static async toggleLost(id: string, userId: string): Promise<Item | null> {
    const item = await this.getItemById(id, userId);
    if (!item) return null;

    const result = await db
      .update(items)
      .set({ isLost: !item.isLost, updatedAt: new Date() })
      .where(and(eq(items.id, id), eq(items.userId, userId)))
      .returning();

    return result[0] || null;
  }

  // Mark as broken/fixed
  static async toggleBroken(id: string, userId: string): Promise<Item | null> {
    const item = await this.getItemById(id, userId);
    if (!item) return null;

    const result = await db
      .update(items)
      .set({ isBroken: !item.isBroken, updatedAt: new Date() })
      .where(and(eq(items.id, id), eq(items.userId, userId)))
      .returning();

    return result[0] || null;
  }

  // Get location history for an item
  static async getItemLocationHistory(
    itemId: string,
    _userId: string,
    limit = 50
  ): Promise<any[]> {
    return await db
      .select()
      .from(itemLocationHistory)
      .where(eq(itemLocationHistory.itemId, itemId))
      .orderBy(desc(itemLocationHistory.movedDate))
      .limit(limit);
  }

  // Get items needing maintenance
  static async getItemsNeedingMaintenance(_userId: string): Promise<Item[]> {
    // Note: This would need proper date comparison in a real implementation
    return [];
  }

  // Get warranty expiring items
  static async getWarrantyExpiringItems(
    _userId: string,
    _days = 30
  ): Promise<Item[]> {
    // Note: This would need proper date comparison in a real implementation
    return [];
  }
}
