import { eq } from 'drizzle-orm';
import { db } from '../utils/database';
import { users, type User, type NewUser } from '../models/schema';

export class UserService {
  // Get user by ID
  static async getUserById(id: string): Promise<User | null> {
    try {
      const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      throw new Error('Failed to get user');
    }
  }

  // Get user by email
  static async getUserByEmail(email: string): Promise<User | null> {
    try {
      const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error('Error getting user by email:', error);
      throw new Error('Failed to get user');
    }
  }

  // Create new user
  static async createUser(userData: NewUser): Promise<User> {
    try {
      const result = await db.insert(users).values({
        ...userData,
        updatedAt: new Date(),
      }).returning();
      
      if (!result[0]) {
        throw new Error('Failed to create user - no result returned');
      }
      
      return result[0];
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }
  }

  // Update user
  static async updateUser(id: string, userData: Partial<NewUser>): Promise<User | null> {
    try {
      const result = await db
        .update(users)
        .set({
          ...userData,
          updatedAt: new Date(),
        })
        .where(eq(users.id, id))
        .returning();
      
      return result[0] || null;
    } catch (error) {
      console.error('Error updating user:', error);
      throw new Error('Failed to update user');
    }
  }

  // Delete user
  static async deleteUser(id: string): Promise<boolean> {
    try {
      const result = await db.delete(users).where(eq(users.id, id)).returning();
      return result.length > 0;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw new Error('Failed to delete user');
    }
  }

  // Get all users (admin function)
  static async getAllUsers(): Promise<User[]> {
    try {
      return await db.select().from(users);
    } catch (error) {
      console.error('Error getting all users:', error);
      throw new Error('Failed to get users');
    }
  }
}