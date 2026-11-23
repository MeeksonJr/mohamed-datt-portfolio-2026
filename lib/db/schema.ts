import {
  pgTable,
  uuid,
  text,
  boolean,
  integer,
  jsonb,
  timestamp,
} from 'drizzle-orm/pg-core'

export const portfolioSections = pgTable('portfolio_sections', {
  id: uuid('id').defaultRandom().primaryKey(),
  sectionKey: text('section_key').notNull().unique(),
  title: text('title').notNull(),
  subtitle: text('subtitle').notNull().default(''),
  badge: text('badge').notNull().default(''),
  visible: boolean('visible').notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
  bentoSpan: text('bento_span').notNull().default('full'),
  customStyles: jsonb('custom_styles').$type<Record<string, string>>().default({}),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const contentBlocks = pgTable('content_blocks', {
  id: uuid('id').defaultRandom().primaryKey(),
  sectionKey: text('section_key').notNull(),
  blockKey: text('block_key').notNull().unique(),
  contentType: text('content_type').notNull().default('text'),
  value: text('value').notNull(),
  version: integer('version').notNull().default(1),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const projectsCatalog = pgTable('projects_catalog', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  tagline: text('tagline').notNull(),
  description: text('description').notNull(),
  category: text('category').notNull(),
  status: text('status').notNull().default('live'),
  techStack: jsonb('tech_stack').$type<string[]>().notNull().default([]),
  metrics: jsonb('metrics').$type<string[]>().notNull().default([]),
  githubUrl: text('github_url').notNull(),
  liveUrl: text('live_url'),
  imageUrl: text('image_url'),
  featured: boolean('featured').notNull().default(false),
  saleBadge: text('sale_badge'),
  architectureNotes: text('architecture_notes').notNull().default(''),
  sortOrder: integer('sort_order').notNull().default(0),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const aiLogs = pgTable('ai_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  feature: text('feature').notNull(),
  model: text('model').notNull(),
  prompt: text('prompt').notNull(),
  response: text('response').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const guestbookEntries = pgTable('guestbook_entries', {
  id: uuid('id').defaultRandom().primaryKey(),
  authorName: text('author_name').notNull(),
  roleOrCompany: text('role_or_company').notNull().default('Visitor'),
  message: text('message').notNull(),
  accentColor: text('accent_color').notNull().default('#10B981'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})
