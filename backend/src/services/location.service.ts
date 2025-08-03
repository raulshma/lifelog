import { db } from '../utils/database';
import { locations, NewLocation, Location } from '../models/schema';
import { eq, and, isNull } from 'drizzle-orm';

export class LocationService {
  // Get all locations for a user
  static async getUserLocations(userId: string): Promise<Location[]> {
    return await db
      .select()
      .from(locations)
      .where(and(eq(locations.userId, userId), eq(locations.isArchived, false)))
      .orderBy(locations.sortOrder, locations.name);
  }

  // Get root locations (no parent)
  static async getRootLocations(userId: string): Promise<Location[]> {
    return await db
      .select()
      .from(locations)
      .where(
        and(
          eq(locations.userId, userId),
          isNull(locations.parentId),
          eq(locations.isArchived, false)
        )
      )
      .orderBy(locations.sortOrder, locations.name);
  }

  // Get child locations
  static async getChildLocations(
    userId: string,
    parentId: string
  ): Promise<Location[]> {
    return await db
      .select()
      .from(locations)
      .where(
        and(
          eq(locations.userId, userId),
          eq(locations.parentId, parentId),
          eq(locations.isArchived, false)
        )
      )
      .orderBy(locations.sortOrder, locations.name);
  }

  // Get locations by type
  static async getLocationsByType(
    userId: string,
    locationType: string
  ): Promise<Location[]> {
    return await db
      .select()
      .from(locations)
      .where(
        and(
          eq(locations.userId, userId),
          eq(locations.locationType, locationType),
          eq(locations.isArchived, false)
        )
      )
      .orderBy(locations.sortOrder, locations.name);
  }

  // Get location by ID
  static async getLocationById(
    id: string,
    userId: string
  ): Promise<Location | null> {
    const result = await db
      .select()
      .from(locations)
      .where(and(eq(locations.id, id), eq(locations.userId, userId)))
      .limit(1);

    return result[0] || null;
  }

  // Create new location
  static async createLocation(locationData: NewLocation): Promise<Location> {
    const result = await db.insert(locations).values(locationData).returning();

    return result[0] as Location;
  }

  // Update location
  static async updateLocation(
    id: string,
    userId: string,
    updates: Partial<NewLocation>
  ): Promise<Location | null> {
    const result = await db
      .update(locations)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(locations.id, id), eq(locations.userId, userId)))
      .returning();

    return result[0] || null;
  }

  // Archive location
  static async archiveLocation(id: string, userId: string): Promise<boolean> {
    const result = await db
      .update(locations)
      .set({ isArchived: true, updatedAt: new Date() })
      .where(and(eq(locations.id, id), eq(locations.userId, userId)))
      .returning();

    return result.length > 0;
  }

  // Delete location permanently
  static async deleteLocation(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(locations)
      .where(and(eq(locations.id, id), eq(locations.userId, userId)))
      .returning();

    return result.length > 0;
  }

  // Update location order
  static async updateLocationOrder(
    userId: string,
    locationOrders: { id: string; sortOrder: number; parentId?: string }[]
  ): Promise<void> {
    for (const order of locationOrders) {
      await db
        .update(locations)
        .set({
          sortOrder: order.sortOrder,
          parentId: order.parentId || null,
          updatedAt: new Date(),
        })
        .where(and(eq(locations.id, order.id), eq(locations.userId, userId)));
    }
  }
}
