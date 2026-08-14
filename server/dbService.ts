// server/dbService.ts
import { eq, desc } from 'drizzle-orm';
import { db } from '../src/db/index.ts';
import { 
  products as productsTable, 
  orders as ordersTable, 
  bespokeRequests as bespokeTable, 
  siteSettings as siteSettingsTable, 
  contactMessages as contactMessagesTable, 
  studioCategories as studioCategoriesTable, 
  studioImages as studioImagesTable, 
  adminAccounts as adminAccountsTable 
} from '../src/db/schema.ts';
import { Product, Order, BespokeRequest, BrandingImages, ContactMessage, StudioCategory, StudioImage } from '../src/types.ts';
import { AdminUserRecord } from '../server.ts';

// Helper to convert database product row to client Product type
export function mapRowToProduct(row: typeof productsTable.$inferSelect): Product {
  const collections = [...((row.collections as string[]) || [])];
  if (row.isCollection && !collections.includes('collection')) {
    collections.push('collection');
  }
  if (row.isLiveShow && !collections.includes('liveshow')) {
    collections.push('liveshow');
  }
  if (row.isStudio && !collections.includes('studio')) {
    collections.push('studio');
  }

  return {
    id: row.id,
    name: row.name,
    amharicName: row.amharicName || '',
    category: row.category,
    collections,
    priceUSD: row.price,
    originalPriceUSD: row.originalPrice ?? undefined,
    rating: row.rating ?? 5.0,
    reviewsCount: row.reviewsCount ?? 0,
    inStock: row.inStock ?? true,
    stockQuantity: row.stockQuantity ?? 10,
    isFeatured: row.isFeatured ?? false,
    isNewArrival: row.isNewArrival ?? false,
    isBespokeAvailable: row.isBespokeAvailable ?? true,
    tibebPattern: row.tibebPattern || '',
    fabric: row.fabric || '',
    weaverRegion: row.weaverRegion || '',
    images: (row.images as string[]) || [],
    description: row.description || '',
    details: (row.details as string[]) || [],
    sizes: (row.sizes as string[]) || ['S', 'M', 'L', 'XL'],
    colors: (row.colors as string[]) || ['White & Gold'],
    weavingDays: row.weavingDays ?? 10,
    studioCategory: row.studioCategory || ''
  };
}

// Convert Product to database insert/update values
export function mapProductToRow(p: Product) {
  const isLive = Boolean(p.collections && p.collections.includes('liveshow')) || Boolean(p.isFeatured);
  const isStudio = Boolean(p.studioCategory && p.studioCategory.trim() !== '') || 
                  Boolean(p.collections && (p.collections.includes('studio') || p.collections.includes('studio-only'))) || 
                  p.category === 'studio';
  const isCollection = Boolean(p.collections && p.collections.includes('collection')) || 
                      (!isLive && !isStudio) || 
                      Boolean(p.collections && p.collections.some(c => c !== 'liveshow' && c !== 'studio' && c !== 'studio-only'));

  return {
    id: p.id,
    name: p.name,
    amharicName: p.amharicName || '',
    description: p.description || '',
    price: Number(p.priceUSD) || 0,
    originalPrice: p.originalPriceUSD !== undefined ? Number(p.originalPriceUSD) : null,
    rating: p.rating ?? 5.0,
    reviewsCount: p.reviewsCount ?? 0,
    category: p.category || 'wedding',
    collections: Array.isArray(p.collections) ? p.collections : [],
    images: Array.isArray(p.images) ? p.images : [],
    sizes: Array.isArray(p.sizes) ? p.sizes : ['S', 'M', 'L', 'XL'],
    colors: Array.isArray(p.colors) ? p.colors : ['White & Gold'],
    details: Array.isArray(p.details) ? p.details : [],
    inStock: Boolean(p.inStock),
    stockQuantity: p.stockQuantity !== undefined ? Number(p.stockQuantity) : 10,
    isFeatured: Boolean(p.isFeatured) || isLive,
    isBestSeller: false,
    isNewArrival: Boolean(p.isNewArrival),
    isBespokeAvailable: p.isBespokeAvailable !== undefined ? Boolean(p.isBespokeAvailable) : true,
    isLiveShow: isLive,
    isStudio: isStudio,
    isCollection: isCollection,
    tibebPattern: p.tibebPattern || '',
    fabric: p.fabric || '',
    weaverRegion: p.weaverRegion || '',
    weavingDays: Number(p.weavingDays) || 10,
    studioCategory: p.studioCategory || '',
    updatedAt: new Date()
  };
}

// ==================== PRODUCTS DB OPERATIONS ==================== //

export async function getSqlProducts(): Promise<Product[]> {
  try {
    const rows = await db.select().from(productsTable).orderBy(desc(productsTable.createdAt));
    return rows.map(mapRowToProduct);
  } catch (err: any) {
    console.error('[DB Service] Error fetching products from Cloud SQL:', err.message);
    throw err;
  }
}

export async function getSqlProductById(id: string): Promise<Product | null> {
  try {
    const rows = await db.select().from(productsTable).where(eq(productsTable.id, id));
    if (rows.length === 0) return null;
    return mapRowToProduct(rows[0]);
  } catch (err: any) {
    console.error(`[DB Service] Error fetching product ${id} from Cloud SQL:`, err.message);
    throw err;
  }
}

export async function upsertSqlProduct(p: Product): Promise<Product> {
  try {
    const values = mapProductToRow(p);
    const existing = await getSqlProductById(p.id);
    if (existing) {
      await db.update(productsTable).set(values).where(eq(productsTable.id, p.id));
    } else {
      await db.insert(productsTable).values({
        ...values,
        createdAt: new Date()
      });
    }
    return p;
  } catch (err: any) {
    console.error(`[DB Service] Error saving product ${p.id} to Cloud SQL:`, err.message);
    throw err;
  }
}

export async function deleteSqlProduct(id: string): Promise<void> {
  try {
    await db.delete(productsTable).where(eq(productsTable.id, id));
  } catch (err: any) {
    console.error(`[DB Service] Error deleting product ${id} from Cloud SQL:`, err.message);
    throw err;
  }
}

// ==================== ORDERS DB OPERATIONS ==================== //

export function mapRowToOrder(row: typeof ordersTable.$inferSelect): Order {
  return {
    id: row.id,
    firstName: row.firstName || undefined,
    lastName: row.lastName || undefined,
    customerName: row.customerName,
    email: row.email,
    phone: row.phone || '',
    companyName: row.companyName || undefined,
    address: row.address,
    apartment: row.apartment || undefined,
    city: row.city,
    postcode: row.postcode || undefined,
    country: row.country,
    orderNotes: row.orderNotes || undefined,
    items: (row.items as any[]) || [],
    totalUSD: row.totalUsd,
    currency: (row.currency as any) || 'ETB',
    totalInCurrency: row.totalInCurrency,
    paymentMethod: row.paymentMethod || 'TeleBirr / CBE Birr',
    status: (row.status as any) || 'Pending',
    createdAt: row.createdAt ? row.createdAt.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    trackingNumber: row.trackingNumber || undefined
  };
}

export async function getSqlOrders(): Promise<Order[]> {
  try {
    const rows = await db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt));
    return rows.map(mapRowToOrder);
  } catch (err: any) {
    console.error('[DB Service] Error fetching orders from Cloud SQL:', err.message);
    throw err;
  }
}

export async function upsertSqlOrder(o: Order): Promise<Order> {
  try {
    const existing = await db.select().from(ordersTable).where(eq(ordersTable.id, o.id));
    const values = {
      id: o.id,
      firstName: o.firstName || null,
      lastName: o.lastName || null,
      customerName: o.customerName,
      email: o.email,
      phone: o.phone || null,
      companyName: o.companyName || null,
      address: o.address,
      apartment: o.apartment || null,
      city: o.city,
      postcode: o.postcode || null,
      country: o.country,
      orderNotes: o.orderNotes || null,
      items: o.items || [],
      totalUsd: Number(o.totalUSD) || 0,
      currency: o.currency || 'ETB',
      totalInCurrency: Number(o.totalInCurrency) || Number(o.totalUSD) || 0,
      paymentMethod: o.paymentMethod || 'TeleBirr / CBE Birr',
      status: o.status || 'Pending',
      trackingNumber: o.trackingNumber || null
    };

    if (existing.length > 0) {
      await db.update(ordersTable).set(values).where(eq(ordersTable.id, o.id));
    } else {
      await db.insert(ordersTable).values({
        ...values,
        createdAt: new Date()
      });
    }
    return o;
  } catch (err: any) {
    console.error(`[DB Service] Error saving order ${o.id} to Cloud SQL:`, err.message);
    throw err;
  }
}

// ==================== STUDIO DB OPERATIONS ==================== //

export async function getSqlStudioCategories(): Promise<StudioCategory[]> {
  try {
    const rows = await db.select().from(studioCategoriesTable).orderBy(studioCategoriesTable.order);
    return rows.map(r => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      description: r.description || undefined
    }));
  } catch (err: any) {
    console.error('[DB Service] Error fetching studio categories:', err.message);
    throw err;
  }
}

export async function upsertSqlStudioCategory(c: StudioCategory, order = 0): Promise<StudioCategory> {
  try {
    const existing = await db.select().from(studioCategoriesTable).where(eq(studioCategoriesTable.id, c.id));
    if (existing.length > 0) {
      await db.update(studioCategoriesTable).set({
        name: c.name,
        slug: c.slug,
        description: c.description || null,
        order
      }).where(eq(studioCategoriesTable.id, c.id));
    } else {
      await db.insert(studioCategoriesTable).values({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description || null,
        order,
        createdAt: new Date()
      });
    }
    return c;
  } catch (err: any) {
    console.error(`[DB Service] Error upserting studio category ${c.id}:`, err.message);
    throw err;
  }
}

export async function deleteSqlStudioCategory(idOrSlug: string): Promise<void> {
  try {
    await db.delete(studioCategoriesTable).where(eq(studioCategoriesTable.id, idOrSlug));
  } catch (err: any) {
    console.error(`[DB Service] Error deleting studio category ${idOrSlug}:`, err.message);
    throw err;
  }
}

export async function getSqlStudioImages(): Promise<StudioImage[]> {
  try {
    const rows = await db.select().from(studioImagesTable).orderBy(studioImagesTable.orderIndex);
    return rows.map(r => ({
      id: r.id,
      title: r.title,
      description: r.description || '',
      imageUrl: r.imageUrl,
      categories: (r.categories as string[]) || [r.category || 'traditional-dresses'],
      tags: (r.tags as string[]) || [],
      isFeatured: r.featured ?? false,
      isHidden: r.isHidden ?? false,
      orderIndex: r.orderIndex ?? 0,
      createdAt: r.createdAt ? r.createdAt.toISOString() : new Date().toISOString(),
      productIds: (r.productIds as string[]) || []
    }));
  } catch (err: any) {
    console.error('[DB Service] Error fetching studio images from Cloud SQL:', err.message);
    throw err;
  }
}

export async function upsertSqlStudioImage(img: StudioImage): Promise<StudioImage> {
  try {
    const existing = await db.select().from(studioImagesTable).where(eq(studioImagesTable.id, img.id));
    const values = {
      id: img.id,
      title: img.title,
      imageUrl: img.imageUrl,
      thumbnailUrl: img.imageUrl,
      category: img.categories && img.categories.length > 0 ? img.categories[0] : 'General',
      categories: img.categories || [],
      description: img.description || '',
      tags: img.tags || [],
      featured: Boolean(img.isFeatured),
      isHidden: Boolean(img.isHidden),
      orderIndex: img.orderIndex ?? 0,
      productIds: img.productIds || []
    };

    if (existing.length > 0) {
      await db.update(studioImagesTable).set(values).where(eq(studioImagesTable.id, img.id));
    } else {
      await db.insert(studioImagesTable).values({
        ...values,
        createdAt: new Date()
      });
    }
    return img;
  } catch (err: any) {
    console.error(`[DB Service] Error saving studio image ${img.id}:`, err.message);
    throw err;
  }
}

export async function deleteSqlStudioImage(id: string): Promise<void> {
  try {
    await db.delete(studioImagesTable).where(eq(studioImagesTable.id, id));
  } catch (err: any) {
    console.error(`[DB Service] Error deleting studio image ${id}:`, err.message);
    throw err;
  }
}

// ==================== SITE SETTINGS & BRANDING ==================== //

export async function getSqlSetting<T>(key: string, defaultValue: T): Promise<T> {
  try {
    const rows = await db.select().from(siteSettingsTable).where(eq(siteSettingsTable.key, key));
    if (rows.length === 0) return defaultValue;
    return rows[0].value as T;
  } catch (err: any) {
    console.error(`[DB Service] Error reading setting ${key}:`, err.message);
    return defaultValue;
  }
}

export async function setSqlSetting<T>(key: string, value: T): Promise<void> {
  try {
    const existing = await db.select().from(siteSettingsTable).where(eq(siteSettingsTable.key, key));
    if (existing.length > 0) {
      await db.update(siteSettingsTable).set({
        value: value as any,
        updatedAt: new Date()
      }).where(eq(siteSettingsTable.key, key));
    } else {
      await db.insert(siteSettingsTable).values({
        key,
        value: value as any,
        updatedAt: new Date()
      });
    }
  } catch (err: any) {
    console.error(`[DB Service] Error saving setting ${key}:`, err.message);
    throw err;
  }
}

// ==================== CONTACT MESSAGES & BESPOKE ==================== //

export async function getSqlContactMessages(): Promise<ContactMessage[]> {
  try {
    const rows = await db.select().from(contactMessagesTable).orderBy(desc(contactMessagesTable.createdAt));
    return rows.map(r => ({
      id: r.id,
      fullName: r.fullName,
      subject: r.subject,
      email: r.email,
      phone: r.phone || undefined,
      message: r.message,
      createdAt: r.createdAt ? r.createdAt.toISOString() : new Date().toISOString(),
      read: r.read ?? false
    }));
  } catch (err: any) {
    console.error('[DB Service] Error fetching contact messages:', err.message);
    throw err;
  }
}

export async function upsertSqlContactMessage(m: ContactMessage): Promise<ContactMessage> {
  try {
    const existing = await db.select().from(contactMessagesTable).where(eq(contactMessagesTable.id, m.id));
    if (existing.length > 0) {
      await db.update(contactMessagesTable).set({
        fullName: m.fullName,
        subject: m.subject,
        email: m.email,
        phone: m.phone || null,
        message: m.message,
        read: Boolean(m.read)
      }).where(eq(contactMessagesTable.id, m.id));
    } else {
      await db.insert(contactMessagesTable).values({
        id: m.id,
        fullName: m.fullName,
        subject: m.subject,
        email: m.email,
        phone: m.phone || null,
        message: m.message,
        read: Boolean(m.read),
        createdAt: new Date()
      });
    }
    return m;
  } catch (err: any) {
    console.error(`[DB Service] Error saving contact message ${m.id}:`, err.message);
    throw err;
  }
}

export async function deleteSqlContactMessage(id: string): Promise<void> {
  try {
    await db.delete(contactMessagesTable).where(eq(contactMessagesTable.id, id));
  } catch (err: any) {
    console.error(`[DB Service] Error deleting contact message ${id}:`, err.message);
    throw err;
  }
}

export async function getSqlBespokeRequests(): Promise<BespokeRequest[]> {
  try {
    const rows = await db.select().from(bespokeTable).orderBy(desc(bespokeTable.createdAt));
    return rows.map(r => ({
      id: r.id,
      customerName: r.customerName,
      email: r.email,
      phone: r.phone || '',
      garmentType: r.garmentType,
      fabricGrade: (r.fabricGrade as BespokeRequest['fabricGrade']) || 'Superfine Hand-spun Cotton',
      tibebPatternColor: r.tibebPatternColor || '',
      measurements: (r.measurements as any) || {},
      eventDate: r.eventDate || '',
      specialNotes: r.specialNotes || '',
      status: (r.status as any) || 'Pending Review',
      createdAt: r.createdAt ? r.createdAt.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      estimatedCompletion: r.estimatedCompletion || '',
      assignedWeaverId: r.assignedWeaverId || undefined
    }));
  } catch (err: any) {
    console.error('[DB Service] Error fetching bespoke requests:', err.message);
    throw err;
  }
}

export async function upsertSqlBespokeRequest(b: BespokeRequest): Promise<BespokeRequest> {
  try {
    const existing = await db.select().from(bespokeTable).where(eq(bespokeTable.id, b.id));
    const values = {
      id: b.id,
      customerName: b.customerName,
      email: b.email,
      phone: b.phone || null,
      garmentType: b.garmentType,
      fabricGrade: b.fabricGrade,
      tibebPatternColor: b.tibebPatternColor || null,
      measurements: b.measurements || {},
      eventDate: b.eventDate || null,
      specialNotes: b.specialNotes || null,
      status: b.status || 'Pending Review',
      estimatedCompletion: b.estimatedCompletion || null,
      assignedWeaverId: b.assignedWeaverId || null
    };

    if (existing.length > 0) {
      await db.update(bespokeTable).set(values).where(eq(bespokeTable.id, b.id));
    } else {
      await db.insert(bespokeTable).values({
        ...values,
        createdAt: new Date()
      });
    }
    return b;
  } catch (err: any) {
    console.error(`[DB Service] Error saving bespoke request ${b.id}:`, err.message);
    throw err;
  }
}

// ==================== ADMIN ACCOUNTS ==================== //

export async function getSqlAdminUsers(): Promise<AdminUserRecord[]> {
  try {
    const rows = await db.select().from(adminAccountsTable);
    return rows.map(r => ({
      id: r.id,
      username: (r.username || r.email.split('@')[0]).toLowerCase(),
      email: r.email,
      fullName: r.name,
      role: (r.role as any) || 'Super Admin',
      status: r.isActive ? 'active' : 'inactive',
      createdAt: r.createdAt ? r.createdAt.toISOString() : new Date().toISOString(),
      lastLoginAt: r.lastLogin ? r.lastLogin.toISOString() : undefined,
      passwordHash: r.passwordHash,
      securityQuestion: r.securityQuestion || undefined,
      securityAnswerHash: r.securityAnswerHash || undefined
    }));
  } catch (err: any) {
    console.error('[DB Service] Error fetching admin accounts:', err.message);
    throw err;
  }
}

export async function upsertSqlAdminUser(u: AdminUserRecord): Promise<void> {
  try {
    const existing = await db.select().from(adminAccountsTable).where(eq(adminAccountsTable.id, u.id));
    const values = {
      id: u.id,
      email: u.email,
      username: u.username.toLowerCase(),
      name: u.fullName,
      role: u.role,
      passwordHash: u.passwordHash,
      securityQuestion: u.securityQuestion || null,
      securityAnswerHash: u.securityAnswerHash || null,
      isActive: u.status === 'active',
      lastLogin: u.lastLoginAt ? new Date(u.lastLoginAt) : null
    };

    if (existing.length > 0) {
      await db.update(adminAccountsTable).set(values).where(eq(adminAccountsTable.id, u.id));
    } else {
      await db.insert(adminAccountsTable).values({
        ...values,
        createdAt: new Date()
      });
    }
  } catch (err: any) {
    console.error(`[DB Service] Error upserting admin user ${u.id}:`, err.message);
    throw err;
  }
}

export async function deleteSqlAdminUser(id: string): Promise<void> {
  try {
    await db.delete(adminAccountsTable).where(eq(adminAccountsTable.id, id));
  } catch (err: any) {
    console.error(`[DB Service] Error deleting admin user ${id}:`, err.message);
    throw err;
  }
}
