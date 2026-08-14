// src/db/schema.ts
import { pgTable, text, integer, doublePrecision, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';

// Products Table - Permanent Source of Truth for Store, Live Show, Collection & Studio Products
export const products = pgTable('products', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  amharicName: text('amharic_name').default(''),
  description: text('description').default(''),
  price: doublePrecision('price').notNull().default(0),
  originalPrice: doublePrecision('original_price'),
  rating: doublePrecision('rating').default(5.0),
  reviewsCount: integer('reviews_count').default(0),
  category: text('category').notNull().default('All'),
  subCategory: text('sub_category'),
  collections: jsonb('collections').$type<string[]>().default([]),
  images: jsonb('images').$type<string[]>().default([]),
  sizes: jsonb('sizes').$type<string[]>().default([]),
  colors: jsonb('colors').$type<string[]>().default([]),
  details: jsonb('details').$type<string[]>().default([]),
  inStock: boolean('in_stock').default(true),
  stockQuantity: integer('stock_quantity').default(100),
  isFeatured: boolean('is_featured').default(false),
  isBestSeller: boolean('is_best_seller').default(false),
  isNewArrival: boolean('is_new_arrival').default(false),
  isBespokeAvailable: boolean('is_bespoke_available').default(true),
  isLiveShow: boolean('is_live_show').default(false),
  isStudio: boolean('is_studio').default(false),
  isCollection: boolean('is_collection').default(false),
  tibebPattern: text('tibeb_pattern').default(''),
  fabric: text('fabric').default(''),
  weaverRegion: text('weaver_region').default(''),
  weavingDays: integer('weaving_days').default(10),
  studioCategory: text('studio_category').default(''),
  brand: text('brand').default('YaredKB'),
  sku: text('sku'),
  tags: jsonb('tags').$type<string[]>().default([]),
  specifications: jsonb('specifications').$type<Record<string, string>>().default({}),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Categories Table
export const categories = pgTable('categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  image: text('image'),
  productCount: integer('product_count').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

// Collections Table
export const collections = pgTable('collections', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  image: text('image'),
  bannerImage: text('banner_image'),
  isFeatured: boolean('is_featured').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// Studio Categories Table
export const studioCategories = pgTable('studio_categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  order: integer('order').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

// Studio Images / Lookbook Table
export const studioImages = pgTable('studio_images', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  imageUrl: text('image_url').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  category: text('category').notNull().default('General'),
  categoryId: text('category_id'),
  categories: jsonb('categories').$type<string[]>().default([]),
  description: text('description'),
  tags: jsonb('tags').$type<string[]>().default([]),
  featured: boolean('featured').default(false),
  isHidden: boolean('is_hidden').default(false),
  orderIndex: integer('order_index').default(0),
  productIds: jsonb('product_ids').$type<string[]>().default([]),
  createdAt: timestamp('created_at').defaultNow(),
});

// Site Settings / Branding Table
export const siteSettings = pgTable('site_settings', {
  key: text('key').primaryKey(),
  value: jsonb('value').notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Admin Accounts Table
export const adminAccounts = pgTable('admin_accounts', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  username: text('username'),
  name: text('name').notNull(),
  role: text('role').notNull().default('admin'),
  passwordHash: text('password_hash').notNull(),
  securityQuestion: text('security_question'),
  securityAnswerHash: text('security_answer_hash'),
  isActive: boolean('is_active').default(true),
  lastLogin: timestamp('last_login'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Orders Table
export const orders = pgTable('orders', {
  id: text('id').primaryKey(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  customerName: text('customer_name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  companyName: text('company_name'),
  address: text('address').notNull(),
  apartment: text('apartment'),
  city: text('city').notNull(),
  postcode: text('postcode'),
  country: text('country').notNull(),
  orderNotes: text('order_notes'),
  items: jsonb('items').notNull(),
  totalUsd: doublePrecision('total_usd').notNull(),
  currency: text('currency').default('ETB'),
  totalInCurrency: doublePrecision('total_in_currency').notNull(),
  paymentMethod: text('payment_method').default('TeleBirr / CBE Birr'),
  status: text('status').default('Pending'),
  trackingNumber: text('tracking_number'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Bespoke Requests Table
export const bespokeRequests = pgTable('bespoke_requests', {
  id: text('id').primaryKey(),
  customerName: text('customer_name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  garmentType: text('garment_type').notNull(),
  fabricGrade: text('fabric_grade').notNull(),
  tibebPatternColor: text('tibeb_pattern_color'),
  measurements: jsonb('measurements').notNull(),
  eventDate: text('event_date'),
  specialNotes: text('special_notes'),
  status: text('status').default('Pending Review'),
  estimatedCompletion: text('estimated_completion'),
  assignedWeaverId: text('assigned_weaver_id'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Contact Messages Table
export const contactMessages = pgTable('contact_messages', {
  id: text('id').primaryKey(),
  fullName: text('full_name').notNull(),
  subject: text('subject').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  message: text('message').notNull(),
  read: boolean('read').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});
