import { db } from '../utils/database';
import {
  vaultItems,
  NewVaultItem,
  VaultItem,
  vaultAccessLog,
} from '../models/schema';
import { eq, and, desc, like, or } from 'drizzle-orm';

export class VaultItemService {
  // Get all vault items for a user
  static async getUserVaultItems(userId: string): Promise<VaultItem[]> {
    return await db
      .select()
      .from(vaultItems)
      .where(
        and(eq(vaultItems.userId, userId), eq(vaultItems.isArchived, false))
      )
      .orderBy(desc(vaultItems.updatedAt));
  }

  // Get vault items by category
  static async getVaultItemsByCategory(
    categoryId: string,
    userId: string
  ): Promise<VaultItem[]> {
    return await db
      .select()
      .from(vaultItems)
      .where(
        and(
          eq(vaultItems.userId, userId),
          eq(vaultItems.categoryId, categoryId),
          eq(vaultItems.isArchived, false)
        )
      )
      .orderBy(desc(vaultItems.updatedAt));
  }

  // Get vault items by type
  static async getVaultItemsByType(
    type: string,
    userId: string
  ): Promise<VaultItem[]> {
    return await db
      .select()
      .from(vaultItems)
      .where(
        and(
          eq(vaultItems.userId, userId),
          eq(vaultItems.type, type),
          eq(vaultItems.isArchived, false)
        )
      )
      .orderBy(desc(vaultItems.updatedAt));
  }

  // Get favorite vault items
  static async getFavoriteVaultItems(userId: string): Promise<VaultItem[]> {
    return await db
      .select()
      .from(vaultItems)
      .where(
        and(
          eq(vaultItems.userId, userId),
          eq(vaultItems.isFavorite, true),
          eq(vaultItems.isArchived, false)
        )
      )
      .orderBy(desc(vaultItems.updatedAt));
  }

  // Search vault items
  static async searchVaultItems(
    userId: string,
    query: string
  ): Promise<VaultItem[]> {
    return await db
      .select()
      .from(vaultItems)
      .where(
        and(
          eq(vaultItems.userId, userId),
          eq(vaultItems.isArchived, false),
          or(
            like(vaultItems.name, `%${query}%`),
            like(vaultItems.website, `%${query}%`),
            like(vaultItems.username, `%${query}%`),
            like(vaultItems.email, `%${query}%`),
            like(vaultItems.notes, `%${query}%`)
          )
        )
      )
      .orderBy(desc(vaultItems.updatedAt));
  }

  // Get vault item by ID
  static async getVaultItemById(
    id: string,
    userId: string,
    logAccess = true
  ): Promise<VaultItem | null> {
    const result = await db
      .select()
      .from(vaultItems)
      .where(and(eq(vaultItems.id, id), eq(vaultItems.userId, userId)))
      .limit(1);

    if (result[0] && logAccess) {
      // Update access count and last accessed
      await db
        .update(vaultItems)
        .set({
          accessCount: result[0].accessCount + 1,
          lastAccessedAt: new Date(),
        })
        .where(eq(vaultItems.id, id));

      // Log access
      await this.logAccess(userId, id, 'view');
    }

    return result[0] || null;
  }

  // Create new vault item
  static async createVaultItem(itemData: NewVaultItem): Promise<VaultItem> {
    const result = await db.insert(vaultItems).values(itemData).returning();

    // Log creation
    if (result[0]) {
      await this.logAccess(itemData.userId, result[0].id, 'create');
    }

    return result[0] as VaultItem;
  }

  // Update vault item
  static async updateVaultItem(
    id: string,
    userId: string,
    updates: Partial<NewVaultItem>
  ): Promise<VaultItem | null> {
    const result = await db
      .update(vaultItems)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(vaultItems.id, id), eq(vaultItems.userId, userId)))
      .returning();

    if (result[0]) {
      // Log update
      await this.logAccess(userId, id, 'edit');
    }

    return result[0] || null;
  }

  // Archive vault item
  static async archiveVaultItem(id: string, userId: string): Promise<boolean> {
    const result = await db
      .update(vaultItems)
      .set({ isArchived: true, updatedAt: new Date() })
      .where(and(eq(vaultItems.id, id), eq(vaultItems.userId, userId)))
      .returning();

    if (result.length > 0) {
      await this.logAccess(userId, id, 'archive');
    }

    return result.length > 0;
  }

  // Delete vault item permanently
  static async deleteVaultItem(id: string, userId: string): Promise<boolean> {
    // Log deletion before deleting
    await this.logAccess(userId, id, 'delete');

    const result = await db
      .delete(vaultItems)
      .where(and(eq(vaultItems.id, id), eq(vaultItems.userId, userId)))
      .returning();

    return result.length > 0;
  }

  // Toggle favorite
  static async toggleFavorite(
    id: string,
    userId: string
  ): Promise<VaultItem | null> {
    const item = await this.getVaultItemById(id, userId, false);
    if (!item) return null;

    const result = await db
      .update(vaultItems)
      .set({ isFavorite: !item.isFavorite, updatedAt: new Date() })
      .where(and(eq(vaultItems.id, id), eq(vaultItems.userId, userId)))
      .returning();

    return result[0] || null;
  }

  // Get items expiring soon
  static async getExpiringItems(
    userId: string,
    days = 30
  ): Promise<VaultItem[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return await db
      .select()
      .from(vaultItems)
      .where(
        and(
          eq(vaultItems.userId, userId),
          eq(vaultItems.isArchived, false)
          // Note: This would need proper date comparison in a real implementation
        )
      )
      .orderBy(vaultItems.expiresAt);
  }

  // Log access for audit trail
  private static async logAccess(
    userId: string,
    vaultItemId: string,
    action: string,
    success = true,
    failureReason?: string
  ): Promise<void> {
    await db.insert(vaultAccessLog).values({
      userId,
      vaultItemId,
      action,
      success,
      failureReason,
      // In a real implementation, you'd capture IP, user agent, etc.
    });
  }

  // Get access log for an item
  static async getAccessLog(
    vaultItemId: string,
    userId: string,
    limit = 50
  ): Promise<any[]> {
    return await db
      .select()
      .from(vaultAccessLog)
      .where(
        and(
          eq(vaultAccessLog.vaultItemId, vaultItemId),
          eq(vaultAccessLog.userId, userId)
        )
      )
      .orderBy(desc(vaultAccessLog.createdAt))
      .limit(limit);
  }
}
