import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  text,
  integer,
  boolean,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// Users table for authentication
export const users = pgTable('users', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  firstName: varchar('first_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Sessions table for Better Auth
export const sessions = pgTable('sessions', {
  id: varchar('id', { length: 255 }).primaryKey(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Day Tracker Module Tables

// Boards table for Kanban boards
export const boards = pgTable('boards', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  color: varchar('color', { length: 7 }).default('#0078d4'), // Hex color code
  isArchived: boolean('is_archived').default(false).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Tasks table for individual tasks
export const tasks = pgTable('tasks', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  boardId: uuid('board_id').references(() => boards.id, {
    onDelete: 'cascade',
  }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  status: varchar('status', { length: 50 }).default('todo').notNull(), // todo, in-progress, done
  priority: varchar('priority', { length: 20 }).default('medium').notNull(), // low, medium, high, urgent
  dueDate: timestamp('due_date'),
  completedAt: timestamp('completed_at'),
  sortOrder: integer('sort_order').default(0).notNull(),
  tags: text('tags'), // JSON array of tags
  estimatedMinutes: integer('estimated_minutes'),
  actualMinutes: integer('actual_minutes'),
  isArchived: boolean('is_archived').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Journals table for daily journal entries
export const journals = pgTable('journals', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  date: timestamp('date').notNull(), // The date this journal entry is for
  title: varchar('title', { length: 255 }),
  content: text('content'), // Rich text content
  mood: varchar('mood', { length: 20 }), // happy, neutral, sad, etc.
  energyLevel: integer('energy_level'), // 1-10 scale
  productivityScore: integer('productivity_score'), // 1-10 scale
  tags: text('tags'), // JSON array of tags
  weather: varchar('weather', { length: 50 }),
  gratitude: text('gratitude'), // What they're grateful for
  goals: text('goals'), // Daily goals
  reflections: text('reflections'), // End of day reflections
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Export types for TypeScript
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;

export type Board = typeof boards.$inferSelect;
export type NewBoard = typeof boards.$inferInsert;
export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
export type Journal = typeof journals.$inferSelect;
export type NewJournal = typeof journals.$inferInsert;
