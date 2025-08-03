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

// Knowledge Base Module Tables

// Notebooks table for organizing notes hierarchically
export const notebooks: any = pgTable('notebooks', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  parentId: uuid('parent_id').references((): any => notebooks.id, {
    onDelete: 'cascade',
  }), // For nested notebooks
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  color: varchar('color', { length: 7 }).default('#0078d4'), // Hex color code
  icon: varchar('icon', { length: 50 }), // Icon identifier
  sortOrder: integer('sort_order').default(0).notNull(),
  isArchived: boolean('is_archived').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Tags table for organizing and categorizing content
export const tags = pgTable('tags', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  color: varchar('color', { length: 7 }).default('#0078d4'), // Hex color code
  description: text('description'),
  usageCount: integer('usage_count').default(0).notNull(), // Track how often tag is used
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Notes table for storing knowledge base content
export const notes = pgTable('notes', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  notebookId: uuid('notebook_id').references(() => notebooks.id, {
    onDelete: 'set null',
  }), // Optional notebook assignment
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content'), // Rich text/markdown content
  excerpt: text('excerpt'), // Auto-generated or manual excerpt for search
  contentType: varchar('content_type', { length: 20 })
    .default('markdown')
    .notNull(), // markdown, html, plain
  isTemplate: boolean('is_template').default(false).notNull(),
  isFavorite: boolean('is_favorite').default(false).notNull(),
  isArchived: boolean('is_archived').default(false).notNull(),
  isPinned: boolean('is_pinned').default(false).notNull(),
  viewCount: integer('view_count').default(0).notNull(),
  wordCount: integer('word_count').default(0).notNull(),
  readingTime: integer('reading_time').default(0).notNull(), // Estimated reading time in minutes
  lastViewedAt: timestamp('last_viewed_at'),
  publishedAt: timestamp('published_at'), // For sharing/publishing features
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Note tags junction table for many-to-many relationship
export const noteTags = pgTable('note_tags', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  noteId: uuid('note_id')
    .references(() => notes.id, { onDelete: 'cascade' })
    .notNull(),
  tagId: uuid('tag_id')
    .references(() => tags.id, { onDelete: 'cascade' })
    .notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Note links table for linking notes together (backlinks/references)
export const noteLinks = pgTable('note_links', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  sourceNoteId: uuid('source_note_id')
    .references(() => notes.id, { onDelete: 'cascade' })
    .notNull(),
  targetNoteId: uuid('target_note_id')
    .references(() => notes.id, { onDelete: 'cascade' })
    .notNull(),
  linkType: varchar('link_type', { length: 20 }).default('reference').notNull(), // reference, related, parent, child
  anchorText: varchar('anchor_text', { length: 255 }), // Text that was linked
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Vault Module Tables (Secure Storage)

// Vault categories for organizing credentials and secure items
export const vaultCategories = pgTable('vault_categories', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  icon: varchar('icon', { length: 50 }), // Icon identifier
  color: varchar('color', { length: 7 }).default('#0078d4'), // Hex color code
  sortOrder: integer('sort_order').default(0).notNull(),
  isArchived: boolean('is_archived').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Vault items for storing encrypted credentials and sensitive data
export const vaultItems = pgTable('vault_items', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  categoryId: uuid('category_id').references(() => vaultCategories.id, {
    onDelete: 'set null',
  }), // Optional category assignment
  type: varchar('type', { length: 50 }).notNull(), // login, secure_note, credit_card, identity, bank_account, etc.
  name: varchar('name', { length: 255 }).notNull(), // Display name/title

  // Encrypted fields - all sensitive data is encrypted client-side before storage
  encryptedData: text('encrypted_data').notNull(), // JSON blob of encrypted field data
  encryptionKeyId: varchar('encryption_key_id', { length: 255 }).notNull(), // Reference to encryption key version

  // Searchable metadata (non-sensitive)
  website: varchar('website', { length: 500 }), // For login items
  username: varchar('username', { length: 255 }), // For login items (not encrypted for search)
  email: varchar('email', { length: 255 }), // For login items (not encrypted for search)
  notes: text('notes'), // Non-sensitive notes

  // Security and management fields
  isFavorite: boolean('is_favorite').default(false).notNull(),
  isArchived: boolean('is_archived').default(false).notNull(),
  requiresMasterPassword: boolean('requires_master_password')
    .default(true)
    .notNull(),
  passwordStrength: integer('password_strength'), // 0-100 score for passwords
  passwordLastChanged: timestamp('password_last_changed'),
  lastAccessedAt: timestamp('last_accessed_at'),
  accessCount: integer('access_count').default(0).notNull(),

  // Expiration and reminders
  expiresAt: timestamp('expires_at'), // For credit cards, licenses, etc.
  reminderDays: integer('reminder_days'), // Days before expiration to remind

  // Audit trail
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Vault item tags junction table for organizing vault items
export const vaultItemTags = pgTable('vault_item_tags', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  vaultItemId: uuid('vault_item_id')
    .references(() => vaultItems.id, { onDelete: 'cascade' })
    .notNull(),
  tagId: uuid('tag_id')
    .references(() => tags.id, { onDelete: 'cascade' })
    .notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Vault access log for security auditing
export const vaultAccessLog = pgTable('vault_access_log', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  vaultItemId: uuid('vault_item_id').references(() => vaultItems.id, {
    onDelete: 'cascade',
  }),
  action: varchar('action', { length: 50 }).notNull(), // view, edit, create, delete, copy_password, etc.
  ipAddress: varchar('ip_address', { length: 45 }), // IPv4 or IPv6
  userAgent: text('user_agent'),
  deviceInfo: text('device_info'), // JSON with device details
  success: boolean('success').default(true).notNull(),
  failureReason: varchar('failure_reason', { length: 255 }), // If success is false
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Vault sharing (for future collaboration features)
export const vaultShares = pgTable('vault_shares', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  vaultItemId: uuid('vault_item_id')
    .references(() => vaultItems.id, { onDelete: 'cascade' })
    .notNull(),
  sharedByUserId: uuid('shared_by_user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  sharedWithUserId: uuid('shared_with_user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  permissions: varchar('permissions', { length: 50 }).default('read').notNull(), // read, write, admin
  encryptedForRecipient: text('encrypted_for_recipient').notNull(), // Item encrypted with recipient's key
  expiresAt: timestamp('expires_at'), // Optional expiration
  isRevoked: boolean('is_revoked').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Document Hub Module Tables

// Document categories for organizing files
export const documentCategories = pgTable('document_categories', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  parentId: uuid('parent_id').references((): any => documentCategories.id, {
    onDelete: 'cascade',
  }), // For nested categories
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  color: varchar('color', { length: 7 }).default('#0078d4'), // Hex color code
  icon: varchar('icon', { length: 50 }), // Icon identifier
  sortOrder: integer('sort_order').default(0).notNull(),
  isArchived: boolean('is_archived').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Documents table for storing file metadata and information
export const documents = pgTable('documents', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  categoryId: uuid('category_id').references(() => documentCategories.id, {
    onDelete: 'set null',
  }), // Optional category assignment

  // File information
  fileName: varchar('file_name', { length: 255 }).notNull(),
  originalFileName: varchar('original_file_name', { length: 255 }).notNull(),
  fileSize: integer('file_size').notNull(), // Size in bytes
  mimeType: varchar('mime_type', { length: 100 }).notNull(),
  fileExtension: varchar('file_extension', { length: 10 }).notNull(),
  fileHash: varchar('file_hash', { length: 64 }).notNull(), // SHA-256 hash for deduplication

  // Storage information
  storagePath: varchar('storage_path', { length: 500 }).notNull(), // Path to file in storage
  storageProvider: varchar('storage_provider', { length: 50 })
    .default('local')
    .notNull(), // local, s3, etc.

  // Document metadata
  title: varchar('title', { length: 255 }).notNull(), // User-defined title
  description: text('description'),
  documentType: varchar('document_type', { length: 50 }).notNull(), // contract, invoice, receipt, certificate, etc.

  // Content and search
  extractedText: text('extracted_text'), // OCR or extracted text content
  searchableContent: text('searchable_content'), // Processed content for search

  // Document properties
  isImportant: boolean('is_important').default(false).notNull(),
  isFavorite: boolean('is_favorite').default(false).notNull(),
  isArchived: boolean('is_archived').default(false).notNull(),
  isEncrypted: boolean('is_encrypted').default(false).notNull(),

  // Dates and expiration
  documentDate: timestamp('document_date'), // Date the document was created/issued
  expirationDate: timestamp('expiration_date'), // When document expires
  reminderDate: timestamp('reminder_date'), // When to remind about expiration
  reminderDays: integer('reminder_days'), // Days before expiration to remind

  // Access and usage tracking
  downloadCount: integer('download_count').default(0).notNull(),
  viewCount: integer('view_count').default(0).notNull(),
  lastAccessedAt: timestamp('last_accessed_at'),

  // Version control
  version: integer('version').default(1).notNull(),
  parentDocumentId: uuid('parent_document_id').references(
    (): any => documents.id,
    {
      onDelete: 'set null',
    }
  ), // For document versions

  // Audit trail
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Document metadata table for custom key-value metadata
export const documentMetadata = pgTable('document_metadata', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  documentId: uuid('document_id')
    .references(() => documents.id, { onDelete: 'cascade' })
    .notNull(),
  key: varchar('key', { length: 100 }).notNull(), // Metadata key (e.g., 'invoice_number', 'contract_party')
  value: text('value').notNull(), // Metadata value
  dataType: varchar('data_type', { length: 20 }).default('string').notNull(), // string, number, date, boolean
  isSearchable: boolean('is_searchable').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Document tags junction table for organizing documents
export const documentTags = pgTable('document_tags', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  documentId: uuid('document_id')
    .references(() => documents.id, { onDelete: 'cascade' })
    .notNull(),
  tagId: uuid('tag_id')
    .references(() => tags.id, { onDelete: 'cascade' })
    .notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Document sharing table for collaboration
export const documentShares = pgTable('document_shares', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  documentId: uuid('document_id')
    .references(() => documents.id, { onDelete: 'cascade' })
    .notNull(),
  sharedByUserId: uuid('shared_by_user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  sharedWithUserId: uuid('shared_with_user_id').references(() => users.id, {
    onDelete: 'cascade',
  }),
  shareToken: varchar('share_token', { length: 255 }), // For public sharing
  permissions: varchar('permissions', { length: 50 }).default('read').notNull(), // read, write, admin
  expiresAt: timestamp('expires_at'), // Optional expiration
  isRevoked: boolean('is_revoked').default(false).notNull(),
  accessCount: integer('access_count').default(0).notNull(),
  lastAccessedAt: timestamp('last_accessed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Document access log for audit trail
export const documentAccessLog = pgTable('document_access_log', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: uuid('user_id').references(() => users.id, {
    onDelete: 'cascade',
  }),
  documentId: uuid('document_id')
    .references(() => documents.id, { onDelete: 'cascade' })
    .notNull(),
  action: varchar('action', { length: 50 }).notNull(), // view, download, edit, delete, share, etc.
  ipAddress: varchar('ip_address', { length: 45 }), // IPv4 or IPv6
  userAgent: text('user_agent'),
  shareToken: varchar('share_token', { length: 255 }), // If accessed via share link
  success: boolean('success').default(true).notNull(),
  failureReason: varchar('failure_reason', { length: 255 }), // If success is false
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Inventory Module Tables

// Locations table for organizing where items are stored
export const locations = pgTable('locations', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  parentId: uuid('parent_id').references((): any => locations.id, {
    onDelete: 'cascade',
  }), // For nested locations (e.g., House > Living Room > TV Stand)
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  locationType: varchar('location_type', { length: 50 })
    .default('room')
    .notNull(), // room, building, storage, container, shelf, etc.

  // Physical address/details
  address: text('address'), // Full address for buildings/storage units
  coordinates: varchar('coordinates', { length: 50 }), // GPS coordinates if needed

  // Organization
  color: varchar('color', { length: 7 }).default('#0078d4'), // Hex color code
  icon: varchar('icon', { length: 50 }), // Icon identifier
  sortOrder: integer('sort_order').default(0).notNull(),
  isArchived: boolean('is_archived').default(false).notNull(),

  // Metadata
  capacity: varchar('capacity', { length: 100 }), // Storage capacity description
  accessInstructions: text('access_instructions'), // How to access this location

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Items table for tracking physical inventory
export const items = pgTable('items', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  locationId: uuid('location_id').references(() => locations.id, {
    onDelete: 'set null',
  }), // Current location of the item

  // Basic item information
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  category: varchar('category', { length: 100 }), // electronics, furniture, clothing, etc.
  brand: varchar('brand', { length: 100 }),
  model: varchar('model', { length: 100 }),
  serialNumber: varchar('serial_number', { length: 100 }),

  // Identification
  barcode: varchar('barcode', { length: 100 }), // UPC, EAN, or custom barcode
  qrCode: varchar('qr_code', { length: 255 }), // QR code data
  customId: varchar('custom_id', { length: 50 }), // User-defined ID

  // Physical properties
  color: varchar('color', { length: 50 }),
  size: varchar('size', { length: 100 }), // Dimensions or size description
  weight: varchar('weight', { length: 50 }),
  material: varchar('material', { length: 100 }),
  condition: varchar('condition', { length: 50 }).default('good').notNull(), // new, excellent, good, fair, poor

  // Financial information
  purchasePrice: integer('purchase_price'), // Price in cents
  currentValue: integer('current_value'), // Current estimated value in cents
  currency: varchar('currency', { length: 3 }).default('USD'), // ISO currency code
  purchaseDate: timestamp('purchase_date'),
  warrantyExpiration: timestamp('warranty_expiration'),

  // Purchase details
  purchaseLocation: varchar('purchase_location', { length: 255 }), // Store/website where purchased
  receiptNumber: varchar('receipt_number', { length: 100 }),

  // Organization and status
  isFavorite: boolean('is_favorite').default(false).notNull(),
  isArchived: boolean('is_archived').default(false).notNull(),
  isLost: boolean('is_lost').default(false).notNull(),
  isBroken: boolean('is_broken').default(false).notNull(),
  isLent: boolean('is_lent').default(false).notNull(), // Currently lent out

  // Images and attachments
  primaryImagePath: varchar('primary_image_path', { length: 500 }), // Path to main item photo
  additionalImages: text('additional_images'), // JSON array of image paths
  attachments: text('attachments'), // JSON array of attachment file paths

  // Usage and maintenance
  lastUsedAt: timestamp('last_used_at'),
  maintenanceNotes: text('maintenance_notes'),
  nextMaintenanceDate: timestamp('next_maintenance_date'),
  usageFrequency: varchar('usage_frequency', { length: 20 }), // daily, weekly, monthly, rarely, never

  // Search and notes
  notes: text('notes'), // User notes about the item
  searchKeywords: text('search_keywords'), // Additional keywords for search

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Item tags junction table for organizing items
export const itemTags = pgTable('item_tags', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  itemId: uuid('item_id')
    .references(() => items.id, { onDelete: 'cascade' })
    .notNull(),
  tagId: uuid('tag_id')
    .references(() => tags.id, { onDelete: 'cascade' })
    .notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Lending table for tracking when items are lent out
export const lending = pgTable('lending', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  itemId: uuid('item_id')
    .references(() => items.id, { onDelete: 'cascade' })
    .notNull(),

  // Borrower information
  borrowerName: varchar('borrower_name', { length: 255 }).notNull(),
  borrowerEmail: varchar('borrower_email', { length: 255 }),
  borrowerPhone: varchar('borrower_phone', { length: 50 }),
  borrowerAddress: text('borrower_address'),

  // Lending details
  lentDate: timestamp('lent_date').defaultNow().notNull(),
  expectedReturnDate: timestamp('expected_return_date'),
  actualReturnDate: timestamp('actual_return_date'),

  // Status and tracking
  status: varchar('status', { length: 20 }).default('active').notNull(), // active, returned, overdue, lost
  isOverdue: boolean('is_overdue').default(false).notNull(),

  // Reminders and notifications
  reminderSent: boolean('reminder_sent').default(false).notNull(),
  lastReminderDate: timestamp('last_reminder_date'),
  reminderFrequency: varchar('reminder_frequency', { length: 20 }).default(
    'weekly'
  ), // daily, weekly, monthly

  // Condition tracking
  conditionWhenLent: varchar('condition_when_lent', { length: 50 })
    .default('good')
    .notNull(),
  conditionWhenReturned: varchar('condition_when_returned', { length: 50 }),
  damageNotes: text('damage_notes'), // Notes about any damage upon return

  // Additional details
  purpose: text('purpose'), // Why the item was borrowed
  notes: text('notes'), // Additional notes about the lending
  deposit: integer('deposit'), // Security deposit in cents
  depositReturned: boolean('deposit_returned').default(false),

  // Agreement and terms
  agreementAccepted: boolean('agreement_accepted').default(false).notNull(),
  agreementDate: timestamp('agreement_date'),
  terms: text('terms'), // Specific terms for this lending

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Item location history for tracking item movements
export const itemLocationHistory = pgTable('item_location_history', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  itemId: uuid('item_id')
    .references(() => items.id, { onDelete: 'cascade' })
    .notNull(),
  fromLocationId: uuid('from_location_id').references(() => locations.id, {
    onDelete: 'set null',
  }),
  toLocationId: uuid('to_location_id').references(() => locations.id, {
    onDelete: 'set null',
  }),
  movedDate: timestamp('moved_date').defaultNow().notNull(),
  reason: varchar('reason', { length: 100 }), // reorganization, lending, maintenance, etc.
  notes: text('notes'),
  movedBy: varchar('moved_by', { length: 255 }), // Who moved the item
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Item maintenance log for tracking repairs and maintenance
export const itemMaintenanceLog = pgTable('item_maintenance_log', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  itemId: uuid('item_id')
    .references(() => items.id, { onDelete: 'cascade' })
    .notNull(),
  maintenanceType: varchar('maintenance_type', { length: 50 }).notNull(), // repair, cleaning, inspection, upgrade, etc.
  description: text('description').notNull(),
  cost: integer('cost'), // Cost in cents
  performedBy: varchar('performed_by', { length: 255 }), // Who performed the maintenance
  performedDate: timestamp('performed_date').defaultNow().notNull(),
  nextMaintenanceDate: timestamp('next_maintenance_date'),
  warrantyAffected: boolean('warranty_affected').default(false),
  notes: text('notes'),
  attachments: text('attachments'), // JSON array of receipt/photo paths
  createdAt: timestamp('created_at').defaultNow().notNull(),
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

export type Notebook = typeof notebooks.$inferSelect;
export type NewNotebook = typeof notebooks.$inferInsert;
export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;
export type Note = typeof notes.$inferSelect;
export type NewNote = typeof notes.$inferInsert;
export type NoteTag = typeof noteTags.$inferSelect;
export type NewNoteTag = typeof noteTags.$inferInsert;
export type NoteLink = typeof noteLinks.$inferSelect;
export type NewNoteLink = typeof noteLinks.$inferInsert;

export type VaultCategory = typeof vaultCategories.$inferSelect;
export type NewVaultCategory = typeof vaultCategories.$inferInsert;
export type VaultItem = typeof vaultItems.$inferSelect;
export type NewVaultItem = typeof vaultItems.$inferInsert;
export type VaultItemTag = typeof vaultItemTags.$inferSelect;
export type NewVaultItemTag = typeof vaultItemTags.$inferInsert;
export type VaultAccessLog = typeof vaultAccessLog.$inferSelect;
export type NewVaultAccessLog = typeof vaultAccessLog.$inferInsert;
export type VaultShare = typeof vaultShares.$inferSelect;
export type NewVaultShare = typeof vaultShares.$inferInsert;

export type DocumentCategory = typeof documentCategories.$inferSelect;
export type NewDocumentCategory = typeof documentCategories.$inferInsert;
export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;
export type DocumentMetadata = typeof documentMetadata.$inferSelect;
export type NewDocumentMetadata = typeof documentMetadata.$inferInsert;
export type DocumentTag = typeof documentTags.$inferSelect;
export type NewDocumentTag = typeof documentTags.$inferInsert;
export type DocumentShare = typeof documentShares.$inferSelect;
export type NewDocumentShare = typeof documentShares.$inferInsert;
export type DocumentAccessLog = typeof documentAccessLog.$inferSelect;
export type NewDocumentAccessLog = typeof documentAccessLog.$inferInsert;

export type Location = typeof locations.$inferSelect;
export type NewLocation = typeof locations.$inferInsert;
export type Item = typeof items.$inferSelect;
export type NewItem = typeof items.$inferInsert;
export type ItemTag = typeof itemTags.$inferSelect;
export type NewItemTag = typeof itemTags.$inferInsert;
export type Lending = typeof lending.$inferSelect;
export type NewLending = typeof lending.$inferInsert;
export type ItemLocationHistory = typeof itemLocationHistory.$inferSelect;
export type NewItemLocationHistory = typeof itemLocationHistory.$inferInsert;
export type ItemMaintenanceLog = typeof itemMaintenanceLog.$inferSelect;
export type NewItemMaintenanceLog = typeof itemMaintenanceLog.$inferInsert;
