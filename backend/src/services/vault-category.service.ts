import { db } from '../utils/database';
import {
  vaultCategories,
  NewVaultCategory,
  VaultCategory,
} from '../models/schema';
import { eq, and } from 'drizzle-orm';

export class VaultCategoryService {
  // Get all vault categories for a user
  static async getUserVaultCategories(
    userId: string
  ): Promise<VaultCategory[]> {
    return await db
      .select()
      .from(vaultCategories)
      .where(
        and(
          eq(vaultCategories.userId, userId),
          eq(vaultCategories.isArchived, false)
        )
      )
      .orderBy(vaultCategories.sortOrder, vaultCategories.name);
  }

  // Get vault category by ID
  static async getVaultCategoryById(
    id: string,
    userId: string
  ): Promise<VaultCategory | null> {
    const result = await db
      .select()
      .from(vaultCategories)
      .where(
        and(eq(vaultCategories.id, id), eq(vaultCategories.userId, userId))
      )
      .limit(1);

    return result[0] || null;
  }

  // Create new vault category
  static async createVaultCategory(
    categoryData: NewVaultCategory
  ): Promise<VaultCategory> {
    const result = await db
      .insert(vaultCategories)
      .values(categoryData)
      .returning();

    return result[0] as VaultCategory;
  }

  // Update vault category
  static async updateVaultCategory(
    id: string,
    userId: string,
    updates: Partial<NewVaultCategory>
  ): Promise<VaultCategory | null> {
    const result = await db
      .update(vaultCategories)
      .set({ ...updates, updatedAt: new Date() })
      .where(
        and(eq(vaultCategories.id, id), eq(vaultCategories.userId, userId))
      )
      .returning();

    return result[0] || null;
  }

  // Archive vault category
  static async archiveVaultCategory(
    id: string,
    userId: string
  ): Promise<boolean> {
    const result = await db
      .update(vaultCategories)
      .set({ isArchived: true, updatedAt: new Date() })
      .where(
        and(eq(vaultCategories.id, id), eq(vaultCategories.userId, userId))
      )
      .returning();

    return result.length > 0;
  }

  // Delete vault category permanently
  static async deleteVaultCategory(
    id: string,
    userId: string
  ): Promise<boolean> {
    const result = await db
      .delete(vaultCategories)
      .where(
        and(eq(vaultCategories.id, id), eq(vaultCategories.userId, userId))
      )
      .returning();

    return result.length > 0;
  }

  // Update vault category order
  static async updateVaultCategoryOrder(
    userId: string,
    categoryOrders: { id: string; sortOrder: number }[]
  ): Promise<void> {
    for (const order of categoryOrders) {
      await db
        .update(vaultCategories)
        .set({
          sortOrder: order.sortOrder,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(vaultCategories.id, order.id),
            eq(vaultCategories.userId, userId)
          )
        );
    }
  }
}
