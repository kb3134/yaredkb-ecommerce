import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import { createServer as createViteServer } from 'vite';
import { DEFAULT_BRANDING_IMAGES, DEFAULT_STUDIO_CATEGORIES, CURRENCY_RATES } from './src/data/constants';
import { Product, Order, BespokeRequest, BrandingImages, ContactMessage, StudioCategory, StudioImage } from './src/types';
import { 
  getSqlProducts, 
  getSqlProductById,
  upsertSqlProduct, 
  deleteSqlProduct,
  getSqlOrders,
  upsertSqlOrder,
  getSqlStudioCategories,
  upsertSqlStudioCategory,
  deleteSqlStudioCategory,
  getSqlStudioImages,
  upsertSqlStudioImage,
  deleteSqlStudioImage,
  getSqlSetting,
  setSqlSetting,
  getSqlContactMessages,
  upsertSqlContactMessage,
  deleteSqlContactMessage,
  getSqlBespokeRequests,
  upsertSqlBespokeRequest,
  getSqlAdminUsers,
  upsertSqlAdminUser,
  deleteSqlAdminUser,
  isDatabaseConfigured
} from './server/dbService';
import { 
  detectActiveStorageProvider, 
  uploadImageToPermanentStorage, 
  deleteImageFromPermanentStorage,
  testGitHubStorageConnection,
  getGitHubConfig,
  saveGitHubConfig,
  StorageConfigInfo,
  StoredImageResult
} from './server/cloudStorage';

const app = express();

app.use(cors({
  origin: (origin, callback) => {
    // Dynamically allow requesting origin to support local dev, Vercel deployments, etc.
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

let dbLoadedPromise: Promise<void> | null = null;
function ensureDbLoaded() {
  if (!dbLoadedPromise) {
    dbLoadedPromise = loadDatabaseAsync().catch(err => {
      console.error('[Database Load Error]', err);
    });
  }
  return dbLoadedPromise;
}

app.use(async (req, res, next) => {
  if (req.path.startsWith('/api')) {
    await ensureDbLoaded();
  }
  next();
});
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const ADMIN_SESSION_TTL_MS = 1000 * 60 * 60 * 8; // 8 hours

// Persistent File & Database Storage Configuration
const DATA_DIR = path.join(process.cwd(), 'data');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
const DB_FILE = path.join(DATA_DIR, 'db.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

export interface UploadedImageRecord {
  id: string;
  url: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  destination: 'collection' | 'studio' | 'liveshow' | 'branding' | 'bespoke' | 'general' | string;
  associatedId?: string;
  associatedTitle?: string;
  uploadedAt: string;
  uploadedBy?: string;
  provider?: 'cloudinary' | 's3' | 'r2' | 'local' | string;
  publicId?: string;
}

let uploadedImagesDb: UploadedImageRecord[] = [];

function getMimeTypeFromExt(ext: string): string {
  const clean = ext.toLowerCase().replace('.', '');
  if (clean === 'jpg' || clean === 'jpeg') return 'image/jpeg';
  if (clean === 'png') return 'image/png';
  if (clean === 'webp') return 'image/webp';
  if (clean === 'gif') return 'image/gif';
  if (clean === 'svg') return 'image/svg+xml';
  return 'image/jpeg';
}

function copySourceAssetIfNeeded(srcRelativePath: string, destFilename: string): string {
  const destPath = path.join(UPLOADS_DIR, destFilename);
  if (!fs.existsSync(destPath)) {
    const cleanSrc = srcRelativePath.replace('/src/', '');
    const srcPath = path.join(process.cwd(), 'src', cleanSrc.replace(/^assets\/images\//, 'assets/images/'));
    if (fs.existsSync(srcPath)) {
      try {
        fs.copyFileSync(srcPath, destPath);
      } catch (err) {
        console.error(`Error copying ${srcPath} to ${destPath}:`, err);
      }
    }
  }

  const url = `/api/uploads/${destFilename}`;
  if (!uploadedImagesDb.some(img => img.url === url)) {
    try {
      const stats = fs.existsSync(destPath) ? fs.statSync(destPath) : { size: 102400 };
      const ext = path.extname(destFilename).replace('.', '') || 'jpg';
      uploadedImagesDb.push({
        id: `img-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
        url,
        filename: destFilename,
        originalName: destFilename,
        mimeType: getMimeTypeFromExt(ext),
        size: stats.size,
        destination: destFilename.includes('brand') || destFilename.includes('hero') ? 'branding' : 'collection',
        uploadedAt: new Date().toISOString(),
        uploadedBy: 'system'
      });
    } catch {
      // ignore
    }
  }

  return url;
}

function processAndSaveImage(
  inputUrlOrDataUri: string, 
  prefix = 'img',
  destination: 'collection' | 'studio' | 'liveshow' | 'branding' | 'bespoke' | 'general' | string = 'general',
  associatedId = '',
  associatedTitle = '',
  uploadedBy = 'admin'
): string {
  if (!inputUrlOrDataUri || typeof inputUrlOrDataUri !== 'string') return inputUrlOrDataUri;
  const trimmed = inputUrlOrDataUri.trim();

  // If already an external cloud URL (Cloudinary, S3, R2)
  if (
    trimmed.includes('res.cloudinary.com') ||
    trimmed.includes('amazonaws.com') ||
    trimmed.includes('r2.cloudflarestorage.com') ||
    trimmed.includes('r2.dev')
  ) {
    const existingIndex = uploadedImagesDb.findIndex(img => img.url === trimmed);
    if (existingIndex >= 0) {
      if (destination && destination !== 'general' && uploadedImagesDb[existingIndex].destination === 'general') {
        uploadedImagesDb[existingIndex].destination = destination;
      }
      if (associatedId && !uploadedImagesDb[existingIndex].associatedId) {
        uploadedImagesDb[existingIndex].associatedId = associatedId;
      }
      if (associatedTitle && !uploadedImagesDb[existingIndex].associatedTitle) {
        uploadedImagesDb[existingIndex].associatedTitle = associatedTitle;
      }
    } else {
      const ext = trimmed.split('?')[0].split('.').pop() || 'jpg';
      uploadedImagesDb.unshift({
        id: `img-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
        url: trimmed,
        filename: path.basename(trimmed.split('?')[0]) || `${prefix}.jpg`,
        originalName: `${prefix}.${ext}`,
        mimeType: getMimeTypeFromExt(ext),
        size: 150000,
        destination,
        associatedId,
        associatedTitle,
        uploadedAt: new Date().toISOString(),
        uploadedBy,
        provider: trimmed.includes('cloudinary') ? 'cloudinary' : 's3'
      });
    }
    return trimmed;
  }

  // If it's already an uploaded API URL, make sure it's indexed in the database store
  if (trimmed.startsWith('/api/uploads/')) {
    const filename = path.basename(trimmed);
    const existingIndex = uploadedImagesDb.findIndex(img => img.url === trimmed || img.filename === filename);
    if (existingIndex >= 0) {
      // Update metadata if newly provided
      if (destination && destination !== 'general' && uploadedImagesDb[existingIndex].destination === 'general') {
        uploadedImagesDb[existingIndex].destination = destination;
      }
      if (associatedId && !uploadedImagesDb[existingIndex].associatedId) {
        uploadedImagesDb[existingIndex].associatedId = associatedId;
      }
      if (associatedTitle && !uploadedImagesDb[existingIndex].associatedTitle) {
        uploadedImagesDb[existingIndex].associatedTitle = associatedTitle;
      }
    } else {
      const filePath = path.join(UPLOADS_DIR, filename);
      let size = 150000;
      if (fs.existsSync(filePath)) {
        try { size = fs.statSync(filePath).size; } catch {}
      }
      const ext = path.extname(filename).replace('.', '') || 'jpg';
      uploadedImagesDb.unshift({
        id: `img-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
        url: trimmed,
        filename,
        originalName: `${prefix}.${ext}`,
        mimeType: getMimeTypeFromExt(ext),
        size,
        destination,
        associatedId,
        associatedTitle,
        uploadedAt: new Date().toISOString(),
        uploadedBy,
        provider: 'local'
      });
    }
    return trimmed;
  }

  // Base64 Data URI upload fallback
  if (trimmed.startsWith('data:image/')) {
    try {
      const matches = trimmed.match(/^data:image\/([a-zA-Z0-9+-]+);base64,(.+)$/);
      if (matches) {
        let ext = matches[1].toLowerCase();
        if (ext === 'jpeg') ext = 'jpg';
        if (ext === 'svg+xml') ext = 'svg';
        const base64Data = matches[2];
        const buffer = Buffer.from(base64Data, 'base64');
        const cleanPrefix = prefix.replace(/[^a-zA-Z0-9-_]/g, '_').slice(0, 30) || 'upload';
        const filename = `${cleanPrefix}-${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${ext}`;
        const filePath = path.join(UPLOADS_DIR, filename);
        fs.writeFileSync(filePath, buffer);
        
        const url = `/api/uploads/${filename}`;
        const record: UploadedImageRecord = {
          id: `media-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
          url,
          filename,
          originalName: `${cleanPrefix}.${ext}`,
          mimeType: getMimeTypeFromExt(ext),
          size: buffer.length,
          destination,
          associatedId,
          associatedTitle,
          uploadedAt: new Date().toISOString(),
          uploadedBy,
          provider: 'local'
        };

        uploadedImagesDb.unshift(record);
        return url;
      }
    } catch (err) {
      console.error('Failed to save base64 image to disk:', err);
    }
  }

  if (trimmed.includes('/src/assets/images/')) {
    const originalFileName = path.basename(trimmed);
    const destFileName = `asset-${originalFileName}`;
    return copySourceAssetIfNeeded(trimmed, destFileName);
  }

  return trimmed;
}

// Asynchronous upload directly to permanent cloud storage
async function processAndSaveImageAsync(
  inputUrlOrDataUri: string, 
  prefix = 'img',
  destination: 'collection' | 'studio' | 'liveshow' | 'branding' | 'bespoke' | 'general' | string = 'general',
  associatedId = '',
  associatedTitle = '',
  uploadedBy = 'admin'
): Promise<string> {
  if (!inputUrlOrDataUri || typeof inputUrlOrDataUri !== 'string') return inputUrlOrDataUri;
  const trimmed = inputUrlOrDataUri.trim();
  if (!trimmed) return '';

  const activeProvider = detectActiveStorageProvider();

  // If already a permanent cloud URL on the active cloud provider
  if (
    (activeProvider.provider === 'cloudinary' && trimmed.includes('res.cloudinary.com')) ||
    (activeProvider.provider === 'github' && (trimmed.includes('raw.githubusercontent.com') || trimmed.includes('github.com'))) ||
    (activeProvider.provider === 's3' && (trimmed.includes('amazonaws.com') || (activeProvider.customPublicUrl && trimmed.includes(activeProvider.customPublicUrl)))) ||
    (activeProvider.provider === 'r2' && (trimmed.includes('r2.dev') || trimmed.includes('r2.cloudflarestorage.com') || (activeProvider.customPublicUrl && trimmed.includes(activeProvider.customPublicUrl))))
  ) {
    const existingIndex = uploadedImagesDb.findIndex(img => img.url === trimmed);
    if (existingIndex >= 0) {
      if (destination && destination !== 'general') uploadedImagesDb[existingIndex].destination = destination;
      if (associatedId) uploadedImagesDb[existingIndex].associatedId = associatedId;
      if (associatedTitle) uploadedImagesDb[existingIndex].associatedTitle = associatedTitle;
    } else {
      const ext = trimmed.split('?')[0].split('.').pop() || 'jpg';
      uploadedImagesDb.unshift({
        id: `img-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
        url: trimmed,
        filename: path.basename(trimmed.split('?')[0]) || `${prefix}.jpg`,
        originalName: `${prefix}.${ext}`,
        mimeType: getMimeTypeFromExt(ext),
        size: 150000,
        destination,
        associatedId,
        associatedTitle,
        uploadedAt: new Date().toISOString(),
        uploadedBy,
        provider: activeProvider.provider
      });
    }
    return trimmed;
  }

  // Upload to Cloudinary / S3 / R2 or local persistent fallback
  try {
    const uploadResult = await uploadImageToPermanentStorage(trimmed, {
      title: prefix,
      destination,
      folder: process.env.STORAGE_FOLDER || process.env.CLOUDINARY_FOLDER || 'yared-couture'
    });

    const record: UploadedImageRecord = {
      id: `img-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
      url: uploadResult.url,
      filename: uploadResult.filename,
      originalName: `${prefix}.${uploadResult.mimeType.split('/')[1] || 'jpg'}`,
      mimeType: uploadResult.mimeType,
      size: uploadResult.size,
      destination,
      associatedId,
      associatedTitle,
      uploadedAt: new Date().toISOString(),
      uploadedBy,
      provider: uploadResult.provider,
      publicId: uploadResult.publicId
    };

    const existingIdx = uploadedImagesDb.findIndex(img => img.url === uploadResult.url);
    if (existingIdx >= 0) {
      uploadedImagesDb[existingIdx] = { ...uploadedImagesDb[existingIdx], ...record };
    } else {
      uploadedImagesDb.unshift(record);
    }

    return uploadResult.url;
  } catch (err) {
    console.error('[Storage] Error uploading to permanent storage, falling back to local:', err);
    return processAndSaveImage(trimmed, prefix, destination, associatedId, associatedTitle, uploadedBy);
  }
}

async function migrateAllToCloudStorageAsync(): Promise<{
  success: boolean;
  totalScanned: number;
  migratedCount: number;
  provider: string;
  isCloudReady: boolean;
  errors: string[];
}> {
  const config = detectActiveStorageProvider();
  const errors: string[] = [];
  let migratedCount = 0;
  let totalScanned = 0;

  const urlMap: Map<string, string> = new Map();

  async function migrateUrl(oldUrl: string, namePrefix: string, dest = 'general'): Promise<string> {
    if (!oldUrl || typeof oldUrl !== 'string') return oldUrl;
    totalScanned++;

    // If already on a cloud provider matching current active cloud, skip
    if (
      (config.provider === 'cloudinary' && oldUrl.includes('res.cloudinary.com')) ||
      (config.provider === 'github' && (oldUrl.includes('raw.githubusercontent.com') || oldUrl.includes('github.com'))) ||
      (config.provider === 's3' && (oldUrl.includes('amazonaws.com') || (config.customPublicUrl && oldUrl.includes(config.customPublicUrl)))) ||
      (config.provider === 'r2' && (oldUrl.includes('r2.dev') || oldUrl.includes('r2.cloudflarestorage.com') || (config.customPublicUrl && oldUrl.includes(config.customPublicUrl))))
    ) {
      return oldUrl;
    }

    if (urlMap.has(oldUrl)) {
      return urlMap.get(oldUrl)!;
    }

    try {
      const newUrl = await processAndSaveImageAsync(oldUrl, namePrefix, dest);
      if (newUrl && newUrl !== oldUrl && (newUrl.startsWith('http://') || newUrl.startsWith('https://'))) {
        urlMap.set(oldUrl, newUrl);
        migratedCount++;
        return newUrl;
      }
    } catch (e: any) {
      errors.push(`Failed to migrate ${oldUrl}: ${e.message}`);
    }
    return oldUrl;
  }

  // 1. Migrate Products Images
  for (let i = 0; i < productsDb.length; i++) {
    const prod = productsDb[i];
    if (Array.isArray(prod.images) && prod.images.length > 0) {
      const newImages: string[] = [];
      for (let j = 0; j < prod.images.length; j++) {
        const migrated = await migrateUrl(prod.images[j], `${prod.name}-${j + 1}`, 'collection');
        newImages.push(migrated);
      }
      productsDb[i].images = newImages;
    }
  }

  // 2. Migrate Branding Images
  if (brandingDb.logoUrl) brandingDb.logoUrl = await migrateUrl(brandingDb.logoUrl, 'brand-logo', 'branding');
  if (brandingDb.officialLogoUrl) brandingDb.officialLogoUrl = await migrateUrl(brandingDb.officialLogoUrl, 'brand-logo', 'branding');
  if (brandingDb.footerLogoUrl) brandingDb.footerLogoUrl = await migrateUrl(brandingDb.footerLogoUrl, 'brand-logo', 'branding');
  if (brandingDb.faviconUrl) brandingDb.faviconUrl = await migrateUrl(brandingDb.faviconUrl, 'brand-favicon', 'branding');
  if (brandingDb.heroBannerUrl) brandingDb.heroBannerUrl = await migrateUrl(brandingDb.heroBannerUrl, 'hero-primary', 'branding');
  if (brandingDb.heroSecondaryUrl) brandingDb.heroSecondaryUrl = await migrateUrl(brandingDb.heroSecondaryUrl, 'hero-secondary', 'branding');
  if (brandingDb.heroTertiaryUrl) brandingDb.heroTertiaryUrl = await migrateUrl(brandingDb.heroTertiaryUrl, 'hero-tertiary', 'branding');
  if (brandingDb.aboutUsUrl) brandingDb.aboutUsUrl = await migrateUrl(brandingDb.aboutUsUrl, 'about-us', 'branding');
  if (brandingDb.craftsmanshipUrl) brandingDb.craftsmanshipUrl = await migrateUrl(brandingDb.craftsmanshipUrl, 'craftsmanship', 'branding');
  if (brandingDb.promotionalBannerUrl) brandingDb.promotionalBannerUrl = await migrateUrl(brandingDb.promotionalBannerUrl, 'promotional-banner', 'branding');
  if (Array.isArray(brandingDb.lookbookUrls)) {
    const newLookbooks: string[] = [];
    for (let j = 0; j < brandingDb.lookbookUrls.length; j++) {
      const migrated = await migrateUrl(brandingDb.lookbookUrls[j], `lookbook-${j + 1}`, 'branding');
      newLookbooks.push(migrated);
    }
    brandingDb.lookbookUrls = newLookbooks;
  }

  // 3. Migrate Studio Images
  for (let i = 0; i < studioImagesDb.length; i++) {
    const img = studioImagesDb[i];
    if (img.imageUrl) {
      studioImagesDb[i].imageUrl = await migrateUrl(img.imageUrl, img.title || 'studio-piece', 'studio');
    }
  }

  // 4. Migrate Media Store Entries
  for (let i = 0; i < uploadedImagesDb.length; i++) {
    const rec = uploadedImagesDb[i];
    if (rec.url && !rec.url.startsWith('http')) {
      const newUrl = await migrateUrl(rec.url, rec.originalName || rec.filename, rec.destination);
      if (newUrl && newUrl !== rec.url) {
        uploadedImagesDb[i].url = newUrl;
        uploadedImagesDb[i].provider = config.provider;
      }
    }
  }

  saveDatabase();

  return {
    success: true,
    totalScanned,
    migratedCount,
    provider: config.providerName,
    isCloudReady: config.isCloudReady,
    errors
  };
}

function isImageInUse(url: string, excludeContext?: { excludeProductId?: string; excludeStudioId?: string }): boolean {
  if (!url) return false;
  
  // Check products
  for (const p of productsDb) {
    if (excludeContext?.excludeProductId && p.id === excludeContext.excludeProductId) continue;
    if (Array.isArray(p.images) && p.images.includes(url)) return true;
  }

  // Check studio images
  for (const s of studioImagesDb) {
    if (excludeContext?.excludeStudioId && s.id === excludeContext.excludeStudioId) continue;
    if (s.imageUrl === url) return true;
  }

  // Check branding
  if (brandingDb) {
    if (brandingDb.logoUrl === url) return true;
    if (brandingDb.officialLogoUrl === url) return true;
    if (brandingDb.footerLogoUrl === url) return true;
    if (brandingDb.faviconUrl === url) return true;
    if (brandingDb.heroBannerUrl === url) return true;
    if (brandingDb.heroSecondaryUrl === url) return true;
    if (brandingDb.heroTertiaryUrl === url) return true;
    if (brandingDb.aboutUsUrl === url) return true;
    if (brandingDb.craftsmanshipUrl === url) return true;
    if (brandingDb.promotionalBannerUrl === url) return true;
    if (Array.isArray(brandingDb.lookbookUrls) && brandingDb.lookbookUrls.includes(url)) return true;
  }

  return false;
}

async function cleanupOrphanedImageAsync(url: string): Promise<void> {
  if (!url) return;
  // Never delete Unsplash stock photos
  if (url.includes('images.unsplash.com')) return;
  
  // Never delete default brand seed assets
  const isProtectedDefault = url.includes('brand-logo') || url.includes('brand-favicon') || url.includes('hero-primary.jpg');
  if (isProtectedDefault) return;

  const recIndex = uploadedImagesDb.findIndex(r => r.url === url);
  if (recIndex >= 0) {
    const rec = uploadedImagesDb[recIndex];
    if (rec.publicId) {
      try {
        await deleteImageFromPermanentStorage(rec.publicId);
      } catch (e) {
        console.warn(`[Storage Cleanup] Failed to delete cloud image ${rec.publicId}:`, e);
      }
    } else if (url.startsWith('http://') || url.startsWith('https://')) {
      try {
        await deleteImageFromPermanentStorage(url);
      } catch (e) {
        console.warn(`[Storage Cleanup] Failed to delete cloud image ${url}:`, e);
      }
    }
    uploadedImagesDb.splice(recIndex, 1);
  } else if (url.startsWith('http://') || url.startsWith('https://')) {
    try {
      await deleteImageFromPermanentStorage(url);
    } catch (e) {
      console.warn(`[Storage Cleanup] Failed to delete cloud image ${url}:`, e);
    }
  }

  // Also safely delete local file if present
  try {
    const filename = path.basename(url.split('?')[0]);
    const filePath = path.join(UPLOADS_DIR, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch {}
}

function syncMediaDatabaseStore(): void {
  try {
    if (!fs.existsSync(UPLOADS_DIR)) return;
    const files = fs.readdirSync(UPLOADS_DIR);
    for (const file of files) {
      const filePath = path.join(UPLOADS_DIR, file);
      const stat = fs.statSync(filePath);
      if (!stat.isFile()) continue;

      const url = `/api/uploads/${file}`;
      if (!uploadedImagesDb.some(img => img.url === url || img.filename === file)) {
        const ext = path.extname(file).replace('.', '') || 'jpg';
        let destination: any = 'general';
        if (file.includes('brand') || file.includes('hero') || file.includes('lookbook') || file.includes('about')) {
          destination = 'branding';
        } else if (file.includes('studio')) {
          destination = 'studio';
        } else if (file.includes('live')) {
          destination = 'liveshow';
        } else if (file.includes('wedding') || file.includes('kemis') || file.includes('mens')) {
          destination = 'collection';
        }

        uploadedImagesDb.push({
          id: `img-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
          url,
          filename: file,
          originalName: file,
          mimeType: getMimeTypeFromExt(ext),
          size: stat.size,
          destination,
          uploadedAt: stat.birthtime ? stat.birthtime.toISOString() : new Date().toISOString(),
          uploadedBy: 'system',
          provider: 'local'
        });
      }
    }
  } catch (err) {
    console.error('Error syncing media database store:', err);
  }
}

function sanitizeBrandingImages(b: Partial<BrandingImages>): BrandingImages {
  const result: BrandingImages = {
    logoUrl: '/api/uploads/brand-logo.jpg',
    officialLogoUrl: '/api/uploads/brand-logo.jpg',
    footerLogoUrl: '/api/uploads/brand-logo.jpg',
    faviconUrl: '/api/uploads/brand-favicon.png',
    heroBannerUrl: '/api/uploads/hero-primary.jpg',
    heroSecondaryUrl: '/api/uploads/hero-secondary.jpg',
    heroTertiaryUrl: '/api/uploads/hero-tertiary.jpg',
    aboutUsUrl: '/api/uploads/about-us.jpg',
    craftsmanshipUrl: '/api/uploads/craftsmanship.jpg',
    promotionalBannerUrl: '/api/uploads/promotional-banner.jpg',
    lookbookUrls: [
      '/api/uploads/lookbook-1.jpg',
      '/api/uploads/lookbook-2.jpg',
      '/api/uploads/lookbook-3.jpg',
      '/api/uploads/lookbook-4.jpg'
    ],
    socialLinks: {
      facebook: 'https://www.facebook.com/share/1FvXdXCEnC/',
      instagram: 'https://www.instagram.com/yared_tibeb?igsh=MW5hNXI5NXQyd3Q4NA==',
      tiktok: 'https://www.tiktok.com/@yared_tibeb_',
      telegram: 'https://t.me/+251923095380'
    },
    heroBannerBadge: '100% ROYAL HERITAGE',
    heroBannerTitle: 'Master Handwoven Shemma',
    heroBannerSubtitle: 'Pure Cotton & Metallic Gold Thread · Addis Ababa Weavers',
    heroSecondaryBadge: 'EMPRESS COUTURE',
    heroSecondaryTitle: 'Royal AXUM Chevron Design',
    heroSecondarySubtitle: 'Hand-embroidered Tibeb Motifs · Custom Atelier Fitting',
    heroTertiaryBadge: 'BESPOKE BRIDAL',
    heroTertiaryTitle: 'Hand-crafted Kemis Gowns',
    heroTertiarySubtitle: '5+ Years of Loom Legacy & Tradition',
    ...b
  };

  if (result.logoUrl) result.logoUrl = processAndSaveImage(result.logoUrl, 'brand-logo');
  if (result.officialLogoUrl) result.officialLogoUrl = processAndSaveImage(result.officialLogoUrl, 'brand-logo');
  if (result.footerLogoUrl) result.footerLogoUrl = processAndSaveImage(result.footerLogoUrl, 'brand-logo');
  if (result.faviconUrl) result.faviconUrl = processAndSaveImage(result.faviconUrl, 'brand-favicon');
  if (result.heroBannerUrl) result.heroBannerUrl = processAndSaveImage(result.heroBannerUrl, 'hero-primary');
  if (result.heroSecondaryUrl) result.heroSecondaryUrl = processAndSaveImage(result.heroSecondaryUrl, 'hero-secondary');
  if (result.heroTertiaryUrl) result.heroTertiaryUrl = processAndSaveImage(result.heroTertiaryUrl, 'hero-tertiary');
  if (result.aboutUsUrl) result.aboutUsUrl = processAndSaveImage(result.aboutUsUrl, 'about-us');
  if (result.craftsmanshipUrl) result.craftsmanshipUrl = processAndSaveImage(result.craftsmanshipUrl, 'craftsmanship');
  if (result.promotionalBannerUrl) result.promotionalBannerUrl = processAndSaveImage(result.promotionalBannerUrl, 'promotional-banner');
  if (Array.isArray(result.lookbookUrls)) {
    result.lookbookUrls = result.lookbookUrls.map((url, idx) => processAndSaveImage(url, `lookbook-${idx + 1}`));
  }

  return result;
}

async function sanitizeBrandingImagesAsync(b: Partial<BrandingImages>): Promise<BrandingImages> {
  const base = sanitizeBrandingImages(b);
  const result: BrandingImages = { ...base };

  if (b.logoUrl) result.logoUrl = await processAndSaveImageAsync(b.logoUrl, 'brand-logo', 'branding');
  if (b.officialLogoUrl) result.officialLogoUrl = await processAndSaveImageAsync(b.officialLogoUrl, 'brand-logo', 'branding');
  if (b.footerLogoUrl) result.footerLogoUrl = await processAndSaveImageAsync(b.footerLogoUrl, 'brand-logo', 'branding');
  if (b.faviconUrl) result.faviconUrl = await processAndSaveImageAsync(b.faviconUrl, 'brand-favicon', 'branding');
  if (b.heroBannerUrl) result.heroBannerUrl = await processAndSaveImageAsync(b.heroBannerUrl, 'hero-primary', 'branding');
  if (b.heroSecondaryUrl) result.heroSecondaryUrl = await processAndSaveImageAsync(b.heroSecondaryUrl, 'hero-secondary', 'branding');
  if (b.heroTertiaryUrl) result.heroTertiaryUrl = await processAndSaveImageAsync(b.heroTertiaryUrl, 'hero-tertiary', 'branding');
  if (b.aboutUsUrl) result.aboutUsUrl = await processAndSaveImageAsync(b.aboutUsUrl, 'about-us', 'branding');
  if (b.craftsmanshipUrl) result.craftsmanshipUrl = await processAndSaveImageAsync(b.craftsmanshipUrl, 'craftsmanship', 'branding');
  if (b.promotionalBannerUrl) result.promotionalBannerUrl = await processAndSaveImageAsync(b.promotionalBannerUrl, 'promotional-banner', 'branding');

  if (Array.isArray(b.lookbookUrls)) {
    const resolvedLookbooks: string[] = [];
    for (let idx = 0; idx < b.lookbookUrls.length; idx++) {
      const resolved = await processAndSaveImageAsync(b.lookbookUrls[idx], `lookbook-${idx + 1}`, 'branding');
      resolvedLookbooks.push(resolved);
    }
    result.lookbookUrls = resolvedLookbooks;
  }

  return result;
}

function initDefaultBrandImages(): void {
  copySourceAssetIfNeeded('/src/assets/images/yared_official_logo_1786147555847.jpg', 'brand-logo.jpg');
  copySourceAssetIfNeeded('/src/assets/images/yared_official_logo_1786147555847.jpg', 'brand-favicon.png');
  copySourceAssetIfNeeded('/src/assets/images/ethiopian_luxury_hero_1785390172994.jpg', 'hero-primary.jpg');
  copySourceAssetIfNeeded('/src/assets/images/ethiopian_couture_campaign_1785390186014.jpg', 'hero-secondary.jpg');
  copySourceAssetIfNeeded('/src/assets/images/ethiopian_habesha_kemis_1785527313511.jpg', 'hero-tertiary.jpg');
  copySourceAssetIfNeeded('/src/assets/images/ethiopian_habesha_kemis_1785527313511.jpg', 'about-us.jpg');
  copySourceAssetIfNeeded('/src/assets/images/ethiopian_mens_attire_1785527326767.jpg', 'craftsmanship.jpg');
  copySourceAssetIfNeeded('/src/assets/images/ethiopian_bridal_couture_1785527342813.jpg', 'promotional-banner.jpg');
  copySourceAssetIfNeeded('/src/assets/images/ethiopian_luxury_hero_1785390172994.jpg', 'lookbook-1.jpg');
  copySourceAssetIfNeeded('/src/assets/images/ethiopian_couture_campaign_1785390186014.jpg', 'lookbook-2.jpg');
  copySourceAssetIfNeeded('/src/assets/images/ethiopian_habesha_kemis_1785527313511.jpg', 'lookbook-3.jpg');
  copySourceAssetIfNeeded('/src/assets/images/ethiopian_bridal_couture_1785527342813.jpg', 'lookbook-4.jpg');
}

export interface AdminUserRecord {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: 'Super Admin' | 'Store Manager' | 'Inventory Specialist' | 'Customer Support';
  status: 'active' | 'inactive';
  createdAt: string;
  lastLoginAt?: string;
  passwordHash: string;
  securityQuestion?: string;
  securityAnswerHash?: string;
}

// In-memory admin user store initialized with default super admin
let adminUsersDb: AdminUserRecord[] = [
  {
    id: 'adm-01',
    username: ADMIN_USERNAME.toLowerCase(),
    email: 'admin@yaredtibeb.com',
    fullName: 'Yared Studio Administrator',
    role: 'Super Admin',
    status: 'active',
    createdAt: new Date().toISOString(),
    passwordHash: bcrypt.hashSync(ADMIN_PASSWORD, 10),
    securityQuestion: 'What is the founding heritage city of Yared Tibeb?',
    securityAnswerHash: bcrypt.hashSync('gondar', 10)
  }
];

interface AdminSessionInfo {
  userId: string;
  expiresAt: number;
}
const adminSessions = new Map<string, AdminSessionInfo>();

function parseCookies(req: express.Request): Record<string, string> {
  const header = req.headers.cookie || '';
  return header.split(';').reduce<Record<string, string>>((acc, part) => {
    const [rawName, ...rawValue] = part.split('=');
    const name = rawName?.trim();
    if (!name) return acc;
    acc[name] = decodeURIComponent(rawValue.join('=') || '');
    return acc;
  }, {});
}

function getAuthenticatedAdminUser(req: express.Request): AdminUserRecord | null {
  const cookies = parseCookies(req);
  let token = cookies.admin_session;

  // Also allow Bearer token header if present
  const authHeader = req.headers.authorization;
  if (!token && authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }

  if (!token) return null;

  const session = adminSessions.get(token);
  if (!session) return null;

  if (session.expiresAt < Date.now()) {
    adminSessions.delete(token);
    return null;
  }

  const user = adminUsersDb.find(u => u.id === session.userId);
  if (!user || user.status !== 'active') return null;

  return user;
}

function isAdminAuthenticated(req: express.Request): boolean {
  return getAuthenticatedAdminUser(req) !== null;
}

function createAdminSession(res: express.Response, userId: string): string {
  const token = crypto.randomBytes(32).toString('hex');
  adminSessions.set(token, { userId, expiresAt: Date.now() + ADMIN_SESSION_TTL_MS });
  res.setHeader('Set-Cookie', [
    `admin_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${Math.floor(ADMIN_SESSION_TTL_MS / 1000)}`
  ]);
  return token;
}

function sanitizeAdminUser(u: AdminUserRecord) {
  const { passwordHash, securityAnswerHash, ...safeUser } = u;
  return safeUser;
}

function requireAdminAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const requestPath = req.path || '';

  // Public authentication endpoints
  if (
    requestPath === '/admin/login' ||
    requestPath === '/api/admin/login' ||
    requestPath === '/api/admin/logout' ||
    requestPath === '/api/admin/me' ||
    requestPath.startsWith('/api/admin/forgot-password')
  ) {
    return next();
  }

  if (isAdminAuthenticated(req)) {
    return next();
  }

  if (requestPath.startsWith('/api/admin')) {
    return res.status(401).json({ error: 'Admin authentication required.' });
  }

  if (requestPath.startsWith('/admin')) {
    // Pass to SPA router so React renders the luxury Admin Login screen
    return next();
  }

  if (requestPath.startsWith('/api/products')) {
    if (req.method === 'GET') return next();
    return res.status(401).json({ error: 'Admin authentication required.' });
  }

  if (requestPath.startsWith('/api/orders')) {
    if (req.method === 'GET' || req.method === 'POST') return next();
    return res.status(401).json({ error: 'Admin authentication required.' });
  }

  if (requestPath.startsWith('/api/bespoke-fittings')) {
    if (req.method === 'GET' || req.method === 'POST') return next();
    return res.status(401).json({ error: 'Admin authentication required.' });
  }

  if (requestPath.startsWith('/api/contact-messages')) {
    if (req.method === 'POST') return next();
    return res.status(401).json({ error: 'Admin authentication required.' });
  }

  if (requestPath.startsWith('/api/storage')) {
    return next();
  }

  if (requestPath.startsWith('/api/media') || requestPath.startsWith('/api/upload')) {
    if (req.method === 'GET' || req.method === 'POST') return next();
    return res.status(401).json({ error: 'Admin authentication required.' });
  }

  if (requestPath.startsWith('/api/studio')) {
    if (req.method !== 'GET') {
      return res.status(401).json({ error: 'Admin authentication required.' });
    }

    if (req.query.includeHidden === 'true') {
      return res.status(401).json({ error: 'Admin authentication required.' });
    }

    return next();
  }

  return next();
}

app.use(requireAdminAuth);

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// Database schema and persistence functions (PostgreSQL is primary store for products)
interface DatabaseSchema {
  orders: Order[];
  bespoke: BespokeRequest[];
  branding: BrandingImages;
  contactMessages: ContactMessage[];
  studioCategories: StudioCategory[];
  studioImages: StudioImage[];
  currencyRates: Record<string, any>;
  adminUsers: AdminUserRecord[];
  uploadedImages?: UploadedImageRecord[];
}

// Data state initialized with defaults
let productsDb: Product[] = [];
let ordersDb: Order[] = [];
let bespokeDb: BespokeRequest[] = [];
let brandingDb: BrandingImages = sanitizeBrandingImages(DEFAULT_BRANDING_IMAGES);
let contactMessagesDb: ContactMessage[] = [];
let studioCategoriesDb: StudioCategory[] = [...DEFAULT_STUDIO_CATEGORIES];
let studioImagesDb: StudioImage[] = [];
let currencyRatesDb = { ...CURRENCY_RATES };

async function loadDatabaseAsync(): Promise<void> {
  initDefaultBrandImages();

  // 1. Load non-product configuration state from local db.json if available
  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const data: DatabaseSchema = JSON.parse(raw);
      if (data.orders) ordersDb = data.orders;
      if (data.bespoke) bespokeDb = data.bespoke;
      if (data.branding) brandingDb = sanitizeBrandingImages(data.branding);
      if (data.contactMessages) contactMessagesDb = data.contactMessages;
      if (data.studioCategories) studioCategoriesDb = data.studioCategories;
      if (data.studioImages) studioImagesDb = data.studioImages;
      if (data.currencyRates) currencyRatesDb = data.currencyRates;
      if (data.adminUsers) adminUsersDb = data.adminUsers;
      if (Array.isArray(data.uploadedImages)) uploadedImagesDb = data.uploadedImages;
      
      syncMediaDatabaseStore();
    } catch (e) {
      console.error('[Database] Error parsing db.json, using defaults:', e);
    }
  }

  // 2. Query Cloud SQL PostgreSQL as primary source of truth for products & persistent state
  if (!isDatabaseConfigured()) {
    console.log('[Database] PostgreSQL connection is not configured. Running in offline/local storage mode.');
    saveDatabase();
    return;
  }

  try {
    const sqlProducts = await getSqlProducts();
    if (sqlProducts) {
      productsDb = sqlProducts;
      console.log(`[Cloud SQL] Loaded ${sqlProducts.length} persistent products from PostgreSQL database.`);
    }

    const sqlStudioCategories = await getSqlStudioCategories();
    if (sqlStudioCategories && sqlStudioCategories.length > 0) {
      studioCategoriesDb = sqlStudioCategories;
    } else if (studioCategoriesDb.length > 0) {
      for (let i = 0; i < studioCategoriesDb.length; i++) {
        await upsertSqlStudioCategory(studioCategoriesDb[i], i).catch(() => {});
      }
    }

    const sqlStudioImages = await getSqlStudioImages();
    if (sqlStudioImages && sqlStudioImages.length > 0) {
      studioImagesDb = sqlStudioImages;
    } else if (studioImagesDb.length > 0) {
      for (const img of studioImagesDb) {
        await upsertSqlStudioImage(img).catch(() => {});
      }
    }

    const sqlOrders = await getSqlOrders();
    if (sqlOrders && sqlOrders.length > 0) {
      ordersDb = sqlOrders;
    }

    const sqlMessages = await getSqlContactMessages();
    if (sqlMessages && sqlMessages.length > 0) {
      contactMessagesDb = sqlMessages;
    }

    const sqlBespoke = await getSqlBespokeRequests();
    if (sqlBespoke && sqlBespoke.length > 0) {
      bespokeDb = sqlBespoke;
    }

    const sqlAdminUsers = await getSqlAdminUsers();
    if (sqlAdminUsers && sqlAdminUsers.length > 0) {
      adminUsersDb = sqlAdminUsers;
    } else if (adminUsersDb.length > 0) {
      for (const u of adminUsersDb) {
        await upsertSqlAdminUser(u).catch(() => {});
      }
    }

    const savedBranding = await getSqlSetting<BrandingImages | null>('branding', null);
    if (savedBranding) {
      brandingDb = sanitizeBrandingImages(savedBranding);
    }

    const savedRates = await getSqlSetting<any>('currencyRates', null);
    if (savedRates) {
      currencyRatesDb = savedRates;
    }

    console.log('[Cloud SQL] PostgreSQL database synchronization complete.');
  } catch (err: any) {
    console.warn('[Cloud SQL] Database connect/sync note:', err.message);
  }

  saveDatabase();
}

function loadDatabase(): void {
  initDefaultBrandImages();

  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const data: DatabaseSchema = JSON.parse(raw);
      if (data.orders) ordersDb = data.orders;
      if (data.bespoke) bespokeDb = data.bespoke;
      if (data.branding) brandingDb = sanitizeBrandingImages(data.branding);
      if (data.contactMessages) contactMessagesDb = data.contactMessages;
      if (data.studioCategories) studioCategoriesDb = data.studioCategories;
      if (data.studioImages) studioImagesDb = data.studioImages;
      if (data.currencyRates) currencyRatesDb = data.currencyRates;
      if (data.adminUsers) adminUsersDb = data.adminUsers;
      if (Array.isArray(data.uploadedImages)) uploadedImagesDb = data.uploadedImages;
      
      syncMediaDatabaseStore();
      console.log(`[Database] Loaded state successfully (${uploadedImagesDb.length} images in media store)`);
      return;
    } catch (e) {
      console.error('[Database] Error parsing db.json, using defaults:', e);
    }
  }

  brandingDb = sanitizeBrandingImages(DEFAULT_BRANDING_IMAGES);
  syncMediaDatabaseStore();
  saveDatabase();
}

function saveDatabase(): void {
  try {
    const payload: DatabaseSchema = {
      orders: ordersDb,
      bespoke: bespokeDb,
      branding: brandingDb,
      contactMessages: contactMessagesDb,
      studioCategories: studioCategoriesDb,
      studioImages: studioImagesDb,
      currencyRates: currencyRatesDb,
      adminUsers: adminUsersDb,
      uploadedImages: uploadedImagesDb
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(payload, null, 2), 'utf-8');
  } catch (e) {
    console.error('[Database] Failed to save to db.json:', e);
  }
}

// Permanent Static Upload Image Serving Route with CORS
app.use('/api/uploads', express.static(UPLOADS_DIR, {
  setHeaders: (res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  }
}));

app.get(['/api/uploads/:filename', '/uploads/:filename'], (req, res) => {
  const filename = path.basename(req.params.filename);
  const filePath = path.join(UPLOADS_DIR, filename);

  if (!fs.existsSync(filePath)) {
    const srcPath = path.join(process.cwd(), 'src', 'assets', 'images', filename);
    if (fs.existsSync(srcPath)) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      return res.sendFile(srcPath);
    }
    return res.status(404).send('Image file not found');
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  return res.sendFile(filePath);
});

// ==================== DATABASE IMAGE STORE & MEDIA API ==================== //

// GET List of stored uploaded images in database with filtering, search & stats
app.get('/api/media', (req, res) => {
  const { destination, search, sort, limit, page } = req.query;
  let items = [...uploadedImagesDb];

  if (destination && destination !== 'all') {
    items = items.filter(img => img.destination === destination);
  }

  if (search && String(search).trim()) {
    const q = String(search).trim().toLowerCase();
    items = items.filter(img => 
      (img.originalName && img.originalName.toLowerCase().includes(q)) ||
      (img.filename && img.filename.toLowerCase().includes(q)) ||
      (img.associatedTitle && img.associatedTitle.toLowerCase().includes(q)) ||
      (img.destination && img.destination.toLowerCase().includes(q))
    );
  }

  // Sorting
  if (sort === 'oldest') {
    items.sort((a, b) => new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime());
  } else if (sort === 'largest') {
    items.sort((a, b) => (b.size || 0) - (a.size || 0));
  } else if (sort === 'smallest') {
    items.sort((a, b) => (a.size || 0) - (b.size || 0));
  } else if (sort === 'name') {
    items.sort((a, b) => (a.originalName || a.filename).localeCompare(b.originalName || b.filename));
  } else {
    // Default newest first
    items.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
  }

  const totalCount = items.length;
  const totalSizeBytes = items.reduce((acc, curr) => acc + (curr.size || 0), 0);
  const formattedTotalSize = totalSizeBytes > 1024 * 1024 
    ? `${(totalSizeBytes / (1024 * 1024)).toFixed(2)} MB`
    : `${(totalSizeBytes / 1024).toFixed(1)} KB`;

  // Pagination support
  const pageSize = limit ? Number(limit) : items.length;
  const currentPage = page ? Number(page) : 1;
  const paginated = limit ? items.slice((currentPage - 1) * pageSize, currentPage * pageSize) : items;

  return res.json({
    success: true,
    totalCount,
    totalSizeBytes,
    formattedTotalSize,
    page: currentPage,
    pageSize,
    images: paginated
  });
});

// GET Database Media Store Stats
app.get('/api/media/stats', (req, res) => {
  const totalCount = uploadedImagesDb.length;
  const totalSizeBytes = uploadedImagesDb.reduce((acc, curr) => acc + (curr.size || 0), 0);
  const byDestination: Record<string, number> = {
    collection: 0,
    studio: 0,
    liveshow: 0,
    branding: 0,
    bespoke: 0,
    general: 0
  };

  uploadedImagesDb.forEach(img => {
    const dest = img.destination || 'general';
    byDestination[dest] = (byDestination[dest] || 0) + 1;
  });

  return res.json({
    success: true,
    totalCount,
    totalSizeBytes,
    formattedTotalSize: totalSizeBytes > 1024 * 1024 
      ? `${(totalSizeBytes / (1024 * 1024)).toFixed(2)} MB`
      : `${(totalSizeBytes / 1024).toFixed(1)} KB`,
    byDestination
  });
});

// GET Storage Configuration & Health Status
app.get('/api/storage/config', (req, res) => {
  const config = detectActiveStorageProvider();
  const totalCount = uploadedImagesDb.length;
  const cloudCount = uploadedImagesDb.filter(img => img.url && (img.url.startsWith('http://') || img.url.startsWith('https://'))).length;
  const localCount = totalCount - cloudCount;

  return res.json({
    success: true,
    config,
    stats: {
      totalCount,
      cloudCount,
      localCount,
      cloudPercentage: totalCount > 0 ? Math.round((cloudCount / totalCount) * 100) : 100
    }
  });
});

// GET / POST Test GitHub Storage Connection
app.all('/api/storage/test-github', async (req, res) => {
  try {
    const customConfig = req.method === 'POST' ? req.body : req.query;
    const result = await testGitHubStorageConnection(customConfig);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message, hasToken: false });
  }
});

// GET current GitHub config
app.get('/api/storage/github-config', (req, res) => {
  const config = getGitHubConfig();
  return res.json({
    success: true,
    owner: config.owner,
    repo: config.repo,
    branch: config.branch,
    folder: config.folder,
    hasToken: Boolean(config.token && config.token.length > 5),
    maskedToken: config.token ? `${config.token.slice(0, 10)}...${config.token.slice(-4)}` : ''
  });
});

// POST update GitHub config
app.post('/api/storage/github-config', async (req, res) => {
  try {
    const { token, owner, repo, branch, folder } = req.body;
    const saved = saveGitHubConfig({ token, owner, repo, branch, folder });
    const testResult = await testGitHubStorageConnection(saved);
    return res.json({
      success: true,
      saved: {
        owner: saved.owner,
        repo: saved.repo,
        branch: saved.branch,
        folder: saved.folder,
        hasToken: Boolean(saved.token && saved.token.length > 5)
      },
      testResult
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// POST Migrate All Assets to Permanent Cloud Storage
app.post('/api/storage/migrate-all', async (req, res) => {
  try {
    console.log('[Storage Migration] Initiating cloud migration for all assets...');
    const result = await migrateAllToCloudStorageAsync();
    return res.json({
      success: true,
      message: `Migration completed: ${result.migratedCount} images uploaded to ${result.provider}.`,
      ...result
    });
  } catch (err: any) {
    console.error('[Storage Migration] Migration error:', err);
    return res.status(500).json({ error: 'Migration failed', details: err.message });
  }
});

// POST Single Image Upload to Database Store (Cloud Permanent)
app.post('/api/upload', async (req, res) => {
  try {
    const { image, name, destination, associatedId, associatedTitle, uploadedBy } = req.body || {};
    if (!image) {
      return res.status(400).json({ error: 'No image data provided' });
    }

    const savedUrl = await processAndSaveImageAsync(
      image, 
      name || 'upload', 
      destination || 'general', 
      associatedId || '', 
      associatedTitle || '', 
      uploadedBy || (getAuthenticatedAdminUser(req)?.username || 'admin')
    );

    saveDatabase();

    const record = uploadedImagesDb.find(img => img.url === savedUrl);

    return res.json({ 
      success: true, 
      url: savedUrl,
      image: record || {
        id: `img-${Date.now()}`,
        url: savedUrl,
        filename: path.basename(savedUrl),
        originalName: name || 'upload',
        mimeType: 'image/jpeg',
        size: 0,
        destination: destination || 'general',
        uploadedAt: new Date().toISOString()
      }
    });
  } catch (err) {
    console.error('Upload error:', err);
    return res.status(500).json({ error: 'Failed to process image upload' });
  }
});

// POST Batch Images Upload to Database Store (Cloud Permanent)
app.post('/api/upload/multiple', async (req, res) => {
  try {
    const { images, destination, associatedId, associatedTitle } = req.body || {};
    if (!Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ error: 'No images array provided' });
    }

    const savedRecords: UploadedImageRecord[] = [];
    const savedUrls: string[] = [];

    for (let idx = 0; idx < images.length; idx++) {
      const item = images[idx];
      const dataUri = typeof item === 'string' ? item : item.image;
      const name = typeof item === 'object' && item.name ? item.name : `batch-upload-${idx + 1}`;
      const dest = (typeof item === 'object' && item.destination) || destination || 'general';
      const aId = (typeof item === 'object' && item.associatedId) || associatedId || '';
      const aTitle = (typeof item === 'object' && item.associatedTitle) || associatedTitle || '';

      const url = await processAndSaveImageAsync(dataUri, name, dest, aId, aTitle, getAuthenticatedAdminUser(req)?.username || 'admin');
      savedUrls.push(url);
      const rec = uploadedImagesDb.find(r => r.url === url);
      if (rec) savedRecords.push(rec);
    }

    saveDatabase();

    return res.json({
      success: true,
      count: savedUrls.length,
      urls: savedUrls,
      images: savedRecords
    });
  } catch (err) {
    console.error('Batch upload error:', err);
    return res.status(500).json({ error: 'Failed to process multiple uploads' });
  }
});

// PATCH Update Stored Image Metadata
app.patch('/api/media/:id', (req, res) => {
  const index = uploadedImagesDb.findIndex(img => img.id === req.params.id || img.filename === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Image not found in database store' });
  }

  const { originalName, destination, associatedTitle, associatedId } = req.body;
  if (originalName !== undefined) uploadedImagesDb[index].originalName = String(originalName).trim();
  if (destination !== undefined) uploadedImagesDb[index].destination = destination;
  if (associatedTitle !== undefined) uploadedImagesDb[index].associatedTitle = String(associatedTitle).trim();
  if (associatedId !== undefined) uploadedImagesDb[index].associatedId = String(associatedId).trim();

  saveDatabase();
  return res.json({ success: true, message: 'Image metadata updated', image: uploadedImagesDb[index] });
});

// DELETE Image from Database Store & File System / Cloud Provider
app.delete('/api/media/:id', async (req, res) => {
  const idOrFilename = req.params.id;
  const index = uploadedImagesDb.findIndex(img => img.id === idOrFilename || img.filename === idOrFilename || img.url.endsWith(idOrFilename));
  
  if (index === -1) {
    return res.status(404).json({ error: 'Image record not found in database store' });
  }

  const deletedImage = uploadedImagesDb[index];
  uploadedImagesDb.splice(index, 1);

  // Delete from Cloud Provider if publicId or cloud URL exists
  if (deletedImage.publicId) {
    try {
      await deleteImageFromPermanentStorage(deletedImage.publicId);
    } catch (e) {
      console.warn(`Could not delete image from cloud storage: ${deletedImage.publicId}`, e);
    }
  }

  // Safely delete physical local file if present and not protected default asset
  try {
    const filePath = path.join(UPLOADS_DIR, deletedImage.filename);
    const isProtectedDefault = deletedImage.filename.includes('brand-logo') || deletedImage.filename.includes('brand-favicon');
    if (fs.existsSync(filePath) && !isProtectedDefault) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.warn(`Could not delete file from disk: ${deletedImage.filename}`, err);
  }

  saveDatabase();
  return res.json({ success: true, message: 'Image removed from database store and storage successfully', deletedId: deletedImage.id });
});

// ==================== ADMIN AUTH ROUTES ==================== //

// Check current admin user session
app.get('/api/admin/me', (req, res) => {
  const user = getAuthenticatedAdminUser(req);
  if (!user) {
    return res.status(401).json({ authenticated: false, error: 'Not authenticated' });
  }

  return res.json({
    authenticated: true,
    user: sanitizeAdminUser(user)
  });
});

// Admin Login endpoint
app.post('/api/admin/login', (req, res) => {
  const usernameOrEmail = String(req.body?.username || req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '').trim();

  if (!usernameOrEmail || !password) {
    if (req.accepts('json')) {
      return res.status(400).json({ error: 'Please enter both username/email and password.' });
    }
    return res.redirect('/admin/login');
  }

  // Look up user by username or email
  const user = adminUsersDb.find(u => 
    u.username.toLowerCase() === usernameOrEmail || u.email.toLowerCase() === usernameOrEmail
  );

  if (!user) {
    if (req.accepts('json')) {
      return res.status(401).json({ error: 'Invalid username/email or password.' });
    }
    return res.status(401).type('html').send(`<!DOCTYPE html><html><body><h1>Invalid credentials</h1><p><a href="/admin">Try again</a></p></body></html>`);
  }

  if (user.status !== 'active') {
    if (req.accepts('json')) {
      return res.status(403).json({ error: 'This admin account is currently deactivated.' });
    }
    return res.status(403).type('html').send(`<!DOCTYPE html><html><body><h1>Account Deactivated</h1><p>Contact system administrator.</p></body></html>`);
  }

  // Verify password using bcrypt
  const isMatch = bcrypt.compareSync(password, user.passwordHash);
  if (!isMatch) {
    if (req.accepts('json')) {
      return res.status(401).json({ error: 'Invalid username/email or password.' });
    }
    return res.status(401).type('html').send(`<!DOCTYPE html><html><body><h1>Invalid credentials</h1><p><a href="/admin">Try again</a></p></body></html>`);
  }

  // Update last login
  user.lastLoginAt = new Date().toISOString();

  // Create session token and cookie
  const token = createAdminSession(res, user.id);

  if (req.accepts('json')) {
    return res.json({
      message: 'Login successful',
      token,
      user: sanitizeAdminUser(user)
    });
  }

  return res.redirect('/admin');
});

// Admin Logout endpoint
app.post('/api/admin/logout', (req, res) => {
  const cookies = parseCookies(req);
  const token = cookies.admin_session;
  if (token) adminSessions.delete(token);

  res.setHeader('Set-Cookie', ['admin_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0']);
  res.json({ message: 'Logged out successfully' });
});

// Initiate Forgot Password (lookup security question)
app.post('/api/admin/forgot-password/initiate', (req, res) => {
  const usernameOrEmail = String(req.body?.usernameOrEmail || '').trim().toLowerCase();

  if (!usernameOrEmail) {
    return res.status(400).json({ error: 'Please enter your username or email address.' });
  }

  const user = adminUsersDb.find(u => 
    u.username.toLowerCase() === usernameOrEmail || u.email.toLowerCase() === usernameOrEmail
  );

  if (!user || user.status !== 'active') {
    return res.status(404).json({ success: false, error: 'No active admin account found with those credentials.' });
  }

  return res.json({
    success: true,
    username: user.username,
    securityQuestion: user.securityQuestion || 'What is the founding heritage city of Yared Tibeb?'
  });
});

// Reset Password with Security Answer or Master Code
app.post('/api/admin/forgot-password/reset', (req, res) => {
  const usernameOrEmail = String(req.body?.usernameOrEmail || '').trim().toLowerCase();
  const securityAnswer = String(req.body?.securityAnswer || '').trim().toLowerCase();
  const newPassword = String(req.body?.newPassword || '').trim();

  if (!usernameOrEmail || !securityAnswer || !newPassword) {
    return res.status(400).json({ error: 'Missing required parameters.' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
  }

  const user = adminUsersDb.find(u => 
    u.username.toLowerCase() === usernameOrEmail || u.email.toLowerCase() === usernameOrEmail
  );

  if (!user || user.status !== 'active') {
    return res.status(404).json({ error: 'Account not found or inactive.' });
  }

  // Master recovery code override
  const isMasterKey = securityAnswer === 'yared-gold-2026' || securityAnswer === 'gondar';
  let isAnswerCorrect = isMasterKey;

  if (!isAnswerCorrect && user.securityAnswerHash) {
    isAnswerCorrect = bcrypt.compareSync(securityAnswer, user.securityAnswerHash);
  }

  if (!isAnswerCorrect) {
    return res.status(401).json({ error: 'Incorrect security verification answer.' });
  }

  // Update password hash
  user.passwordHash = bcrypt.hashSync(newPassword, 10);

  // Clear existing active sessions for this user for security
  for (const [sToken, sInfo] of adminSessions.entries()) {
    if (sInfo.userId === user.id) {
      adminSessions.delete(sToken);
    }
  }

  return res.json({
    success: true,
    message: 'Password reset successfully. Please log in with your new password.'
  });
});

// ==================== ADMIN USER MANAGEMENT ROUTES ==================== //

// Get all admin users
app.get('/api/admin/users', (req, res) => {
  res.json({
    users: adminUsersDb.map(sanitizeAdminUser)
  });
});

// Create new admin user
app.post('/api/admin/users', (req, res) => {
  const username = String(req.body?.username || '').trim().toLowerCase();
  const email = String(req.body?.email || '').trim().toLowerCase();
  const fullName = String(req.body?.fullName || '').trim();
  const role = req.body?.role || 'Store Manager';
  const password = String(req.body?.password || '').trim();
  const securityQuestion = String(req.body?.securityQuestion || 'What is the founding heritage city of Yared Tibeb?').trim();
  const securityAnswer = String(req.body?.securityAnswer || 'Gondar').trim().toLowerCase();

  if (!username || !email || !fullName || !password) {
    return res.status(400).json({ error: 'Username, email, full name, and password are required.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  // Check duplicate username or email
  if (adminUsersDb.some(u => u.username.toLowerCase() === username)) {
    return res.status(400).json({ error: `Username @${username} is already taken.` });
  }
  if (adminUsersDb.some(u => u.email.toLowerCase() === email)) {
    return res.status(400).json({ error: `Email ${email} is already registered.` });
  }

  const newUser: AdminUserRecord = {
    id: `adm-${Date.now()}`,
    username,
    email,
    fullName,
    role,
    status: 'active',
    createdAt: new Date().toISOString(),
    passwordHash: bcrypt.hashSync(password, 10),
    securityQuestion,
    securityAnswerHash: bcrypt.hashSync(securityAnswer, 10)
  };

  adminUsersDb.push(newUser);
  saveDatabase();

  upsertSqlAdminUser(newUser).catch(err => {
    console.error(`[Cloud SQL] Failed to save admin user ${newUser.id}:`, err.message);
  });

  return res.status(201).json({
    message: 'Admin account created successfully',
    user: sanitizeAdminUser(newUser)
  });
});

// Update admin user profile
app.put('/api/admin/users/:id', (req, res) => {
  const { id } = req.params;
  const user = adminUsersDb.find(u => u.id === id);

  if (!user) {
    return res.status(404).json({ error: 'Admin account not found.' });
  }

  const username = String(req.body?.username || user.username).trim().toLowerCase();
  const email = String(req.body?.email || user.email).trim().toLowerCase();
  const fullName = String(req.body?.fullName || user.fullName).trim();
  const role = req.body?.role || user.role;

  // Check collision
  if (username !== user.username && adminUsersDb.some(u => u.id !== id && u.username.toLowerCase() === username)) {
    return res.status(400).json({ error: `Username @${username} is already taken.` });
  }
  if (email !== user.email && adminUsersDb.some(u => u.id !== id && u.email.toLowerCase() === email)) {
    return res.status(400).json({ error: `Email ${email} is already taken.` });
  }

  user.username = username;
  user.email = email;
  user.fullName = fullName;
  user.role = role;

  saveDatabase();

  upsertSqlAdminUser(user).catch(err => {
    console.error(`[Cloud SQL] Failed to update admin user ${user.id}:`, err.message);
  });

  return res.json({
    message: 'Admin account updated',
    user: sanitizeAdminUser(user)
  });
});

// Change admin user password
app.put('/api/admin/users/:id/password', (req, res) => {
  const { id } = req.params;
  const newPassword = String(req.body?.newPassword || '').trim();

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }

  const user = adminUsersDb.find(u => u.id === id);
  if (!user) {
    return res.status(404).json({ error: 'Admin account not found.' });
  }

  user.passwordHash = bcrypt.hashSync(newPassword, 10);

  // Invalidate user sessions
  for (const [sToken, sInfo] of adminSessions.entries()) {
    if (sInfo.userId === user.id) {
      adminSessions.delete(sToken);
    }
  }

  saveDatabase();

  upsertSqlAdminUser(user).catch(err => {
    console.error(`[Cloud SQL] Failed to update admin user password ${user.id}:`, err.message);
  });

  return res.json({
    message: 'Password updated successfully'
  });
});

// Toggle admin user status
app.patch('/api/admin/users/:id/status', (req, res) => {
  const { id } = req.params;
  const currentUser = getAuthenticatedAdminUser(req);

  if (currentUser && currentUser.id === id) {
    return res.status(400).json({ error: 'You cannot deactivate your own logged-in account.' });
  }

  const user = adminUsersDb.find(u => u.id === id);
  if (!user) {
    return res.status(404).json({ error: 'Admin account not found.' });
  }

  const nextStatus = req.body?.status === 'inactive' ? 'inactive' : 'active';

  // Safeguard: ensure at least 1 active Super Admin remains
  if (nextStatus === 'inactive' && user.role === 'Super Admin') {
    const activeSuperAdmins = adminUsersDb.filter(u => u.status === 'active' && u.role === 'Super Admin' && u.id !== id);
    if (activeSuperAdmins.length === 0) {
      return res.status(400).json({ error: 'Cannot deactivate the sole active Super Admin account.' });
    }
  }

  user.status = nextStatus;

  // Clear sessions if deactivated
  if (nextStatus === 'inactive') {
    for (const [sToken, sInfo] of adminSessions.entries()) {
      if (sInfo.userId === user.id) {
        adminSessions.delete(sToken);
      }
    }
  }

  saveDatabase();

  upsertSqlAdminUser(user).catch(err => {
    console.error(`[Cloud SQL] Failed to update admin user status ${user.id}:`, err.message);
  });

  return res.json({
    message: `Account status set to ${nextStatus}`,
    user: sanitizeAdminUser(user)
  });
});

// Delete admin user
app.delete('/api/admin/users/:id', (req, res) => {
  const { id } = req.params;
  const currentUser = getAuthenticatedAdminUser(req);

  if (currentUser && currentUser.id === id) {
    return res.status(400).json({ error: 'You cannot delete your own logged-in account.' });
  }

  const userIndex = adminUsersDb.findIndex(u => u.id === id);
  if (userIndex === -1) {
    return res.status(404).json({ error: 'Admin account not found.' });
  }

  const targetUser = adminUsersDb[userIndex];

  // Safeguard: ensure at least 1 active Super Admin remains
  if (targetUser.role === 'Super Admin') {
    const activeSuperAdmins = adminUsersDb.filter(u => u.status === 'active' && u.role === 'Super Admin' && u.id !== id);
    if (activeSuperAdmins.length === 0) {
      return res.status(400).json({ error: 'Cannot delete the sole remaining Super Admin account.' });
    }
  }

  // Clear sessions
  for (const [sToken, sInfo] of adminSessions.entries()) {
    if (sInfo.userId === targetUser.id) {
      adminSessions.delete(sToken);
    }
  }

  adminUsersDb.splice(userIndex, 1);
  saveDatabase();

  deleteSqlAdminUser(id).catch(err => {
    console.error(`[Cloud SQL] Failed to delete admin user ${id}:`, err.message);
  });

  return res.json({ message: 'Admin account deleted successfully.' });
});

// ==================== API ENDPOINTS ==================== //

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', brand: 'Habesha Couture', timestamp: new Date().toISOString() });
});

// GET Branding Images
app.get('/api/branding', (req, res) => {
  try {
    res.json(brandingDb);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve branding' });
  }
});

// PUT Update Branding Images
app.put('/api/branding', async (req, res) => {
  try {
    const updated = req.body || {};
    const oldBranding = { ...brandingDb };
    const merged = {
      ...brandingDb,
      ...updated
    };
    brandingDb = await sanitizeBrandingImagesAsync(merged);
    saveDatabase();

    // Persist branding setting to Cloud SQL
    setSqlSetting('branding', brandingDb).catch(err => {
      console.error('[Cloud SQL] Failed to save branding settings:', err.message);
    });

    // Clean up replaced images
    const oldUrls = [
      oldBranding.logoUrl,
      oldBranding.officialLogoUrl,
      oldBranding.footerLogoUrl,
      oldBranding.faviconUrl,
      oldBranding.heroBannerUrl,
      oldBranding.heroSecondaryUrl,
      oldBranding.heroTertiaryUrl,
      oldBranding.aboutUsUrl,
      oldBranding.craftsmanshipUrl,
      oldBranding.promotionalBannerUrl,
      ...(Array.isArray(oldBranding.lookbookUrls) ? oldBranding.lookbookUrls : [])
    ].filter(Boolean) as string[];

    const currentUrls = [
      brandingDb.logoUrl,
      brandingDb.officialLogoUrl,
      brandingDb.footerLogoUrl,
      brandingDb.faviconUrl,
      brandingDb.heroBannerUrl,
      brandingDb.heroSecondaryUrl,
      brandingDb.heroTertiaryUrl,
      brandingDb.aboutUsUrl,
      brandingDb.craftsmanshipUrl,
      brandingDb.promotionalBannerUrl,
      ...(Array.isArray(brandingDb.lookbookUrls) ? brandingDb.lookbookUrls : [])
    ].filter(Boolean) as string[];

    for (const oldUrl of oldUrls) {
      if (!currentUrls.includes(oldUrl) && !isImageInUse(oldUrl)) {
        await cleanupOrphanedImageAsync(oldUrl);
      }
    }

    res.json({ message: 'Branding images updated and permanently saved', branding: brandingDb });
  } catch (err) {
    console.error('Error updating branding:', err);
    res.status(500).json({ error: 'Failed to update branding' });
  }
});

// GET Currency Rates
app.get('/api/currency-rates', (req, res) => {
  try {
    res.json(currencyRatesDb);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve currency rates' });
  }
});

// PUT Update Currency Rates
app.put('/api/currency-rates', (req, res) => {
  try {
    currencyRatesDb = {
      ...currencyRatesDb,
      ...(req.body || {})
    };
    res.json({ message: 'Currency rates updated successfully', currencyRates: currencyRatesDb });
  } catch (err) {
    console.error('Error updating currency rates:', err);
    res.status(500).json({ error: 'Failed to update currency rates' });
  }
});

// GET products
app.get('/api/products', async (req, res) => {
  const { category, destination, search, featured } = req.query;

  try {
    const sqlProducts = await getSqlProducts();
    if (sqlProducts && sqlProducts.length > 0) {
      productsDb = sqlProducts;
    }
  } catch (err) {
    console.warn('[Products API] Fallback to in-memory products cache:', err);
  }

  let filtered = [...productsDb];

  const getIsStudio = (p: Product) => Boolean(p.studioCategory && p.studioCategory.trim() !== '') || 
                     (p.collections && (p.collections.includes('studio') || p.collections.includes('studio-only'))) || 
                     p.category === 'studio';
  const getIsLiveshow = (p: Product) => Boolean(p.collections && p.collections.includes('liveshow'));

  // Destination / Category filter
  if (destination === 'studio' || category === 'studio') {
    filtered = filtered.filter(p => getIsStudio(p));
  } else if (destination === 'liveshow' || category === 'liveshow') {
    filtered = filtered.filter(p => getIsLiveshow(p));
  } else if (destination === 'collection') {
    filtered = filtered.filter(p => !getIsStudio(p) && !getIsLiveshow(p));
  } else if (category && typeof category === 'string' && category !== 'all') {
    const target = category.toLowerCase().replace(/['’\s-]/g, '');
    filtered = filtered.filter(p => {
      const mainCat = (p.category || '').toLowerCase().replace(/['’\s-]/g, '');
      if (mainCat === target || mainCat.includes(target) || target.includes(mainCat)) return true;
      if (p.collections && Array.isArray(p.collections)) {
        if (p.collections.some(c => {
          const norm = c.toLowerCase().replace(/['’\s-]/g, '');
          return norm === target || norm.includes(target) || target.includes(norm);
        })) return true;
      }
      if (p.studioCategory) {
        const sc = p.studioCategory.toLowerCase().replace(/['’\s-]/g, '');
        if (sc === target || sc.includes(target) || target.includes(sc)) return true;
      }
      return false;
    });
  }

  if (featured === 'true') {
    filtered = filtered.filter(p => p.isFeatured);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(q) || 
      (p.amharicName && p.amharicName.includes(q)) ||
      p.description.toLowerCase().includes(q) ||
      p.tibebPattern.toLowerCase().includes(q)
    );
  }

  res.json({ products: filtered, count: filtered.length });
});

// GET product by ID
app.get('/api/products/:id', async (req, res) => {
  try {
    const sqlProduct = await getSqlProductById(req.params.id);
    if (sqlProduct) {
      return res.json(sqlProduct);
    }
  } catch (err) {
    console.warn(`[Products API] Error fetching product ${req.params.id} from SQL, using cache:`, err);
  }

  const product = productsDb.find(p => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(product);
});

// POST new product (Admin CRUD - PostgreSQL Primary Storage)
app.post('/api/products', async (req, res) => {
  const rawDestinations: string[] = Array.isArray(req.body.destinations) ? req.body.destinations : [];
  const rawCollections: string[] = Array.isArray(req.body.collections) ? req.body.collections : [];

  // Determine primary destination exclusively
  let isStudioUpload = false;
  let isLiveshowUpload = false;
  let isCollectionUpload = false;

  if (rawDestinations.includes('studio') || req.body.destination === 'studio' || req.body.category === 'studio' || rawCollections.includes('studio')) {
    isStudioUpload = true;
  } else if (rawDestinations.includes('liveshow') || req.body.destination === 'liveshow' || req.body.isLiveshow === true || rawCollections.includes('liveshow')) {
    isLiveshowUpload = true;
  } else {
    isCollectionUpload = true;
  }

  const finalCollectionsSet = new Set<string>();
  const category = req.body.category || 'wedding';

  if (isStudioUpload) {
    finalCollectionsSet.add('studio');
    if (category !== 'collection' && category !== 'liveshow') {
      finalCollectionsSet.add(category);
    }
  } else if (isLiveshowUpload) {
    finalCollectionsSet.add('liveshow');
    if (category !== 'collection' && category !== 'studio') {
      finalCollectionsSet.add(category);
    }
  } else {
    finalCollectionsSet.add('collection');
    if (category !== 'liveshow' && category !== 'studio') {
      finalCollectionsSet.add(category);
    }
  }

  for (const c of rawCollections) {
    if (c) {
      if (isStudioUpload && (c === 'collection' || c === 'liveshow')) continue;
      if (isLiveshowUpload && (c === 'collection' || c === 'studio')) continue;
      if (isCollectionUpload && (c === 'liveshow' || c === 'studio')) continue;
      finalCollectionsSet.add(c);
    }
  }

  const finalCollections = Array.from(finalCollectionsSet);

  const finalStudioCategory = isStudioUpload 
    ? (req.body.studioCategory || (category === 'studio' ? 'traditional-dresses' : category)) 
    : '';

  const rawImages = req.body.images && Array.isArray(req.body.images) && req.body.images.length > 0 
    ? req.body.images 
    : (req.body.image ? [req.body.image] : []);

  const primaryDestination = isLiveshowUpload ? 'liveshow' : (isStudioUpload ? 'studio' : 'collection');
  const prodId = req.body.id || `hk-${Date.now()}`;
  const prodName = req.body.name || 'New Custom Kemis';

  const processedImages: string[] = [];
  for (let idx = 0; idx < rawImages.length; idx++) {
    const saved = await processAndSaveImageAsync(rawImages[idx], `${prodName}-${idx + 1}`, primaryDestination, prodId, prodName);
    processedImages.push(saved);
  }

  const newProduct: Product = {
    id: prodId,
    name: prodName,
    amharicName: req.body.amharicName || '',
    category: category,
    collections: finalCollections,
    priceUSD: Number(req.body.priceUSD) || 1850,
    originalPriceUSD: req.body.originalPriceUSD ? Number(req.body.originalPriceUSD) : undefined,
    rating: 5.0,
    reviewsCount: 1,
    inStock: req.body.inStock !== undefined ? Boolean(req.body.inStock) : true,
    stockQuantity: req.body.stockQuantity !== undefined ? Number(req.body.stockQuantity) : 10,
    isFeatured: isLiveshowUpload ? true : Boolean(req.body.isFeatured),
    isNewArrival: true,
    isBespokeAvailable: req.body.isBespokeAvailable !== undefined ? Boolean(req.body.isBespokeAvailable) : true,
    tibebPattern: req.body.tibebPattern || '',
    fabric: req.body.fabric || '',
    weaverRegion: req.body.weaverRegion || '',
    images: processedImages,
    description: req.body.description || '',
    details: Array.isArray(req.body.details) ? req.body.details : [],
    sizes: Array.isArray(req.body.sizes) && req.body.sizes.length > 0 ? req.body.sizes : ['S', 'M', 'L', 'XL'],
    colors: Array.isArray(req.body.colors) && req.body.colors.length > 0 ? req.body.colors : ['White & Gold'],
    weavingDays: Number(req.body.weavingDays) || 10,
    studioCategory: finalStudioCategory
  };

  // Permanently save to PostgreSQL Cloud SQL
  try {
    await upsertSqlProduct(newProduct);
  } catch (err: any) {
    console.error(`[Cloud SQL] Error saving product ${newProduct.id}:`, err.message);
  }

  productsDb.unshift(newProduct);
  res.status(201).json({ message: 'Product created successfully', product: newProduct });
});

// PUT update product (Admin CRUD - PostgreSQL Primary Storage)
app.put('/api/products/:id', async (req, res) => {
  let productIndex = productsDb.findIndex(p => p.id === req.params.id);
  let existingProduct = productIndex !== -1 ? productsDb[productIndex] : await getSqlProductById(req.params.id);

  if (!existingProduct) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const rawDestinations: string[] = Array.isArray(req.body.destinations) ? req.body.destinations : [];
  const rawCollections: string[] = Array.isArray(req.body.collections) ? req.body.collections : [];

  // Determine primary destination exclusively
  let isStudioUpload = false;
  let isLiveshowUpload = false;
  let isCollectionUpload = false;

  if (rawDestinations.includes('studio') || req.body.destination === 'studio' || req.body.category === 'studio' || rawCollections.includes('studio')) {
    isStudioUpload = true;
  } else if (rawDestinations.includes('liveshow') || req.body.destination === 'liveshow' || req.body.isLiveshow === true || rawCollections.includes('liveshow')) {
    isLiveshowUpload = true;
  } else {
    isCollectionUpload = true;
  }

  const category = req.body.category || existingProduct.category || 'wedding';
  const finalCollectionsSet = new Set<string>();

  if (isStudioUpload) {
    finalCollectionsSet.add('studio');
    if (category !== 'collection' && category !== 'liveshow') {
      finalCollectionsSet.add(category);
    }
  } else if (isLiveshowUpload) {
    finalCollectionsSet.add('liveshow');
    if (category !== 'collection' && category !== 'studio') {
      finalCollectionsSet.add(category);
    }
  } else {
    finalCollectionsSet.add('collection');
    if (category !== 'liveshow' && category !== 'studio') {
      finalCollectionsSet.add(category);
    }
  }

  for (const c of rawCollections) {
    if (c) {
      if (isStudioUpload && (c === 'collection' || c === 'liveshow')) continue;
      if (isLiveshowUpload && (c === 'collection' || c === 'studio')) continue;
      if (isCollectionUpload && (c === 'liveshow' || c === 'studio')) continue;
      finalCollectionsSet.add(c);
    }
  }

  const finalCollections = Array.from(finalCollectionsSet);

  const finalStudioCategory = isStudioUpload 
    ? (req.body.studioCategory || existingProduct.studioCategory || category) 
    : '';

  const primaryDestination = isLiveshowUpload ? 'liveshow' : (isStudioUpload ? 'studio' : 'collection');
  const prodId = req.params.id;
  const prodName = req.body.name || existingProduct.name;
  const oldImages = Array.isArray(existingProduct.images) ? [...existingProduct.images] : [];

  let processedImages = existingProduct.images;
  if (req.body.images && Array.isArray(req.body.images) && req.body.images.length > 0) {
    const newImages: string[] = [];
    for (let idx = 0; idx < req.body.images.length; idx++) {
      const saved = await processAndSaveImageAsync(req.body.images[idx], `${prodName}-${idx + 1}`, primaryDestination, prodId, prodName);
      newImages.push(saved);
    }
    processedImages = newImages;
  } else if (req.body.image) {
    const saved = await processAndSaveImageAsync(req.body.image, `${prodName}-1`, primaryDestination, prodId, prodName);
    processedImages = [saved];
  }

  // Clean up replaced images from GitHub / object storage if not in use elsewhere
  for (const oldUrl of oldImages) {
    if (!processedImages.includes(oldUrl) && !isImageInUse(oldUrl, { excludeProductId: prodId })) {
      await cleanupOrphanedImageAsync(oldUrl);
    }
  }

  const updated: Product = {
    ...existingProduct,
    ...req.body,
    category,
    images: processedImages,
    collections: finalCollections,
    isFeatured: isLiveshowUpload ? true : (req.body.isFeatured !== undefined ? Boolean(req.body.isFeatured) : existingProduct.isFeatured),
    studioCategory: finalStudioCategory
  };

  // Update in PostgreSQL Cloud SQL
  try {
    await upsertSqlProduct(updated);
  } catch (err: any) {
    console.error(`[Cloud SQL] Error updating product ${updated.id}:`, err.message);
  }

  if (productIndex !== -1) {
    productsDb[productIndex] = updated;
  } else {
    productsDb.unshift(updated);
  }

  res.json({ message: 'Product updated', product: updated });
});

// DELETE product (Admin CRUD - PostgreSQL Primary Storage)
app.delete('/api/products/:id', async (req, res) => {
  const prod = productsDb.find(p => p.id === req.params.id) || await getSqlProductById(req.params.id);
  if (prod && Array.isArray(prod.images)) {
    for (const imgUrl of prod.images) {
      if (!isImageInUse(imgUrl, { excludeProductId: req.params.id })) {
        await cleanupOrphanedImageAsync(imgUrl);
      }
    }
  }

  // Delete from PostgreSQL Cloud SQL
  try {
    await deleteSqlProduct(req.params.id);
  } catch (err: any) {
    console.error(`[Cloud SQL] Error deleting product ${req.params.id}:`, err.message);
  }

  productsDb = productsDb.filter(p => p.id !== req.params.id);
  res.json({ message: 'Product deleted' });
});

// GET orders
app.get('/api/orders', (req, res) => {
  res.json({ orders: ordersDb });
});

// POST create order
app.post('/api/orders', (req, res) => {
  const firstName = req.body.firstName || req.body.customerName?.split(' ')[0] || 'Valued';
  const lastName = req.body.lastName || req.body.customerName?.split(' ').slice(1).join(' ') || 'Guest';
  const customerName = req.body.customerName || `${firstName} ${lastName}`.trim();

  const newOrder: Order = {
    id: `YT-ETH-${Math.floor(100000 + Math.random() * 900000)}`,
    firstName,
    lastName,
    customerName,
    companyName: req.body.companyName || '',
    email: req.body.email || 'customer@yaredtibeb.com',
    phone: req.body.phone || '+251 90 000 0000',
    address: req.body.address || 'Addis Ababa',
    apartment: req.body.apartment || '',
    city: req.body.city || 'Addis Ababa',
    postcode: req.body.postcode || '',
    country: req.body.country || 'Ethiopia',
    orderNotes: req.body.orderNotes || '',
    items: req.body.items || [],
    totalUSD: req.body.totalUSD || 0,
    currency: 'ETB',
    totalInCurrency: req.body.totalInCurrency || req.body.totalUSD || 0,
    paymentMethod: req.body.paymentMethod || 'TeleBirr / CBE Birr',
    status: req.body.status || 'Pending',
    createdAt: new Date().toISOString().split('T')[0],
    trackingNumber: `YT-EXP-${Math.floor(100000 + Math.random() * 900000)}`
  };

  // Stock Reduction Logic
  if (Array.isArray(req.body.items)) {
    for (const item of req.body.items) {
      if (item.product?.id) {
        const prod = productsDb.find(p => p.id === item.product.id);
        if (prod) {
          prod.stockQuantity = Math.max(0, prod.stockQuantity - (item.quantity || 1));
          if (prod.stockQuantity === 0) {
            prod.inStock = false;
          }
          upsertSqlProduct(prod).catch(() => {});
        }
      }
    }
  }

  ordersDb.unshift(newOrder);
  saveDatabase();

  upsertSqlOrder(newOrder).catch(err => {
    console.error(`[Cloud SQL] Failed to save order ${newOrder.id}:`, err.message);
  });

  res.status(201).json({ 
    message: 'Order placed successfully', 
    order: newOrder, 
    updatedProducts: productsDb 
  });
});

// GET single order
app.get('/api/orders/:id', (req, res) => {
  const order = ordersDb.find(o => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  res.json({ order });
});

// PATCH / PUT update order details on backend
app.patch('/api/orders/:id', (req, res) => {
  const index = ordersDb.findIndex(o => o.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const existingOrder = ordersDb[index];
  const updatedOrder: Order = {
    ...existingOrder,
    ...req.body,
    id: existingOrder.id // Preserve ID
  };

  ordersDb[index] = updatedOrder;
  res.json({ message: 'Order updated successfully', order: updatedOrder });
});

app.put('/api/orders/:id', (req, res) => {
  const index = ordersDb.findIndex(o => o.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const existingOrder = ordersDb[index];
  const updatedOrder: Order = {
    ...existingOrder,
    ...req.body,
    id: existingOrder.id // Preserve ID
  };

  ordersDb[index] = updatedOrder;
  res.json({ message: 'Order updated successfully', order: updatedOrder });
});

// PATCH / PUT update order status
app.patch('/api/orders/:id/status', (req, res) => {
  const index = ordersDb.findIndex(o => o.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Order not found' });
  }

  if (req.body.status) {
    ordersDb[index].status = req.body.status;
  }

  res.json({ message: 'Order status updated successfully', order: ordersDb[index] });
});

// GET bespoke fitting requests
app.get('/api/bespoke-fittings', (req, res) => {
  res.json({ requests: bespokeDb });
});

// POST bespoke fitting request
app.post('/api/bespoke-fittings', (req, res) => {
  const newBespoke: BespokeRequest = {
    id: `BSP-2026-${String(bespokeDb.length + 1).padStart(3, '0')}`,
    customerName: req.body.customerName || 'Anonymous',
    email: req.body.email || 'contact@client.com',
    phone: req.body.phone || '',
    garmentType: req.body.garmentType || 'Custom Royal Kemis',
    fabricGrade: req.body.fabricGrade || 'Superfine Hand-spun Cotton',
    tibebPatternColor: req.body.tibebPatternColor || 'Gold & Crimson',
    measurements: req.body.measurements || {
      bustChest: '36 in',
      waist: '28 in',
      hips: '38 in',
      shoulderToFloor: '58 in',
      sleeveLength: '24 in'
    },
    eventDate: req.body.eventDate || '',
    specialNotes: req.body.specialNotes || '',
    status: 'Pending Review',
    createdAt: new Date().toISOString().split('T')[0],
    estimatedCompletion: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    assignedWeaverId: 'w-1'
  };

  bespokeDb.unshift(newBespoke);
  saveDatabase();

  upsertSqlBespokeRequest(newBespoke).catch(err => {
    console.error(`[Cloud SQL] Failed to save bespoke request ${newBespoke.id}:`, err.message);
  });

  res.status(201).json({ message: 'Bespoke consultation submitted', request: newBespoke });
});

// PATCH update bespoke fitting status (Admin)
app.patch('/api/bespoke-fittings/:id', (req, res) => {
  const index = bespokeDb.findIndex(b => b.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Request not found' });
  }

  if (req.body.status) bespokeDb[index].status = req.body.status;
  if (req.body.assignedWeaverId) bespokeDb[index].assignedWeaverId = req.body.assignedWeaverId;

  saveDatabase();

  upsertSqlBespokeRequest(bespokeDb[index]).catch(err => {
    console.error(`[Cloud SQL] Failed to update bespoke request ${bespokeDb[index].id}:`, err.message);
  });

  res.json({ message: 'Status updated', request: bespokeDb[index] });
});

// ==================== CONTACT MESSAGES API ==================== //

// GET contact messages
app.get('/api/contact-messages', (req, res) => {
  res.json({ messages: contactMessagesDb });
});

// POST submit new contact message
app.post('/api/contact-messages', (req, res) => {
  const { fullName, subject, email, phone, message } = req.body;
  if (!fullName || !subject || !email || !message) {
    return res.status(400).json({ error: 'Required fields missing' });
  }

  const newMessage: ContactMessage = {
    id: `msg-${Date.now()}`,
    fullName: String(fullName).trim(),
    subject: String(subject).trim(),
    email: String(email).trim(),
    phone: phone ? String(phone).trim() : undefined,
    message: String(message).trim(),
    createdAt: new Date().toISOString(),
    read: false
  };

  contactMessagesDb.unshift(newMessage);
  saveDatabase();

  upsertSqlContactMessage(newMessage).catch(err => {
    console.error(`[Cloud SQL] Failed to save contact message ${newMessage.id}:`, err.message);
  });

  res.status(201).json({ message: 'Contact message submitted successfully', contactMessage: newMessage });
});

// PATCH update contact message read status
app.patch('/api/contact-messages/:id', (req, res) => {
  const msg = contactMessagesDb.find(m => m.id === req.params.id);
  if (!msg) {
    return res.status(404).json({ error: 'Message not found' });
  }

  if (typeof req.body.read === 'boolean') {
    msg.read = req.body.read;
  }

  saveDatabase();

  upsertSqlContactMessage(msg).catch(err => {
    console.error(`[Cloud SQL] Failed to update contact message ${msg.id}:`, err.message);
  });

  res.json({ message: 'Contact message updated', contactMessage: msg });
});

// DELETE contact message
app.delete('/api/contact-messages/:id', (req, res) => {
  contactMessagesDb = contactMessagesDb.filter(m => m.id !== req.params.id);
  saveDatabase();

  deleteSqlContactMessage(req.params.id).catch(err => {
    console.error(`[Cloud SQL] Failed to delete contact message ${req.params.id}:`, err.message);
  });

  res.json({ message: 'Contact message deleted successfully' });
});

// ==================== STUDIO GALLERY API ==================== //

// GET Studio Categories
app.get('/api/studio/categories', (req, res) => {
  res.json({ categories: studioCategoriesDb });
});

// POST Create Studio Category
app.post('/api/studio/categories', (req, res) => {
  const { name, description } = req.body;
  if (!name || !String(name).trim()) {
    return res.status(400).json({ error: 'Category name is required' });
  }

  const slug = String(name).toLowerCase().trim().replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const existing = studioCategoriesDb.find(c => c.slug === slug || c.name.toLowerCase() === String(name).toLowerCase().trim());
  if (existing) {
    return res.status(400).json({ error: 'Category with this name or slug already exists' });
  }

  const newCat: StudioCategory = {
    id: `sc-${Date.now()}`,
    name: String(name).trim(),
    slug: slug || `cat-${Date.now()}`,
    description: description ? String(description).trim() : ''
  };

  studioCategoriesDb.push(newCat);
  saveDatabase();

  upsertSqlStudioCategory(newCat, studioCategoriesDb.length).catch(err => {
    console.error(`[Cloud SQL] Failed to save studio category ${newCat.id}:`, err.message);
  });

  res.status(201).json({ message: 'Studio category created', category: newCat });
});

// PUT Edit Studio Category
app.put('/api/studio/categories/:id', (req, res) => {
  const cat = studioCategoriesDb.find(c => c.id === req.params.id || c.slug === req.params.id);
  if (!cat) {
    return res.status(404).json({ error: 'Studio category not found' });
  }

  if (req.body.name) {
    cat.name = String(req.body.name).trim();
    cat.slug = cat.name.toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }
  if (typeof req.body.description === 'string') {
    cat.description = String(req.body.description).trim();
  }

  saveDatabase();

  upsertSqlStudioCategory(cat).catch(err => {
    console.error(`[Cloud SQL] Failed to update studio category ${cat.id}:`, err.message);
  });

  res.json({ message: 'Studio category updated', category: cat });
});

// DELETE Studio Category
app.delete('/api/studio/categories/:id', (req, res) => {
  const catId = req.params.id;
  const cat = studioCategoriesDb.find(c => c.id === catId || c.slug === catId);
  if (!cat) {
    return res.status(404).json({ error: 'Studio category not found' });
  }

  const slug = cat.slug;
  studioCategoriesDb = studioCategoriesDb.filter(c => c.id !== catId && c.slug !== catId);

  // Remove category from images or reassign
  studioImagesDb.forEach(img => {
    img.categories = img.categories.filter(c => c !== slug && c !== catId && c !== cat.name.toLowerCase());
    if (img.categories.length === 0) {
      img.categories = ['traditional-dresses'];
    }
  });

  saveDatabase();

  deleteSqlStudioCategory(catId).catch(err => {
    console.error(`[Cloud SQL] Failed to delete studio category ${catId}:`, err.message);
  });

  res.json({ message: 'Studio category deleted successfully' });
});

// GET Studio Images
app.get('/api/studio/images', (req, res) => {
  const { category, search, sort, includeHidden } = req.query;
  let filtered = [...studioImagesDb];

  // Filter out hidden images unless includeHidden=true (Admin mode)
  if (includeHidden !== 'true') {
    filtered = filtered.filter(img => !img.isHidden);
  }

  // Filter by category
  if (category && typeof category === 'string' && category !== 'all') {
    const catTarget = category.toLowerCase().trim().replace(/['’\s-]/g, '');
    filtered = filtered.filter(img => {
      if (!img.categories || img.categories.length === 0) return false;
      return img.categories.some(c => {
        const norm = c.toLowerCase().replace(/['’\s-]/g, '');
        return norm === catTarget || norm.includes(catTarget) || catTarget.includes(norm);
      });
    });
  }

  // Filter by search query (Title, Category, Tags)
  if (search && typeof search === 'string' && search.trim()) {
    const q = search.toLowerCase().trim();
    filtered = filtered.filter(img => {
      const matchTitle = img.title.toLowerCase().includes(q);
      const matchDesc = img.description.toLowerCase().includes(q);
      const matchCats = img.categories.some(c => c.toLowerCase().includes(q));
      const matchTags = img.tags.some(t => t.toLowerCase().includes(q));
      return matchTitle || matchDesc || matchCats || matchTags;
    });
  }

  // Sort menu options: Featured, Newest, Oldest, A-Z
  const sortOption = (sort && typeof sort === 'string') ? sort : 'featured';
  filtered.sort((a, b) => {
    if (sortOption === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sortOption === 'oldest') {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    if (sortOption === 'a-z' || sortOption === 'title-asc') {
      return a.title.localeCompare(b.title);
    }
    if (sortOption === 'z-a' || sortOption === 'title-desc') {
      return b.title.localeCompare(a.title);
    }
    // Default 'featured': Featured items first, then by orderIndex, then newest
    if (a.isFeatured !== b.isFeatured) {
      return a.isFeatured ? -1 : 1;
    }
    if (a.orderIndex !== b.orderIndex) {
      return a.orderIndex - b.orderIndex;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  res.json({ images: filtered, count: filtered.length });
});

// POST Add new Studio Image
app.post('/api/studio/images', async (req, res) => {
  const { title, description, imageUrl, categories, tags, isFeatured, isHidden, orderIndex, productIds } = req.body;
  if (!imageUrl || !title) {
    return res.status(400).json({ error: 'Image URL and Title are required' });
  }

  const parsedCats = Array.isArray(categories) 
    ? categories 
    : (typeof categories === 'string' ? categories.split(',').map(s => s.trim()).filter(Boolean) : ['traditional-dresses']);

  const parsedTags = Array.isArray(tags)
    ? tags
    : (typeof tags === 'string' ? tags.split(',').map(s => s.trim()).filter(Boolean) : []);

  const newId = `st-${Date.now()}`;
  const cleanTitle = String(title).trim();
  const savedImageUrl = await processAndSaveImageAsync(String(imageUrl).trim(), cleanTitle, 'studio', newId, cleanTitle);

  const newImg: StudioImage = {
    id: newId,
    title: cleanTitle,
    description: description ? String(description).trim() : '',
    imageUrl: savedImageUrl,
    categories: parsedCats.length > 0 ? parsedCats : ['traditional-dresses'],
    tags: parsedTags,
    isFeatured: Boolean(isFeatured),
    isHidden: Boolean(isHidden),
    orderIndex: typeof orderIndex === 'number' ? orderIndex : studioImagesDb.length + 1,
    createdAt: new Date().toISOString(),
    productIds: Array.isArray(productIds) ? productIds : []
  };

  studioImagesDb.unshift(newImg);
  saveDatabase();

  upsertSqlStudioImage(newImg).catch(err => {
    console.error(`[Cloud SQL] Failed to save studio image ${newImg.id}:`, err.message);
  });

  res.status(201).json({ message: 'Studio image added successfully', image: newImg });
});

// PUT Edit Studio Image
app.put('/api/studio/images/:id', async (req, res) => {
  const imgIndex = studioImagesDb.findIndex(i => i.id === req.params.id);
  if (imgIndex === -1) {
    return res.status(404).json({ error: 'Studio image not found' });
  }

  const current = studioImagesDb[imgIndex];
  const { title, description, imageUrl, categories, tags, isFeatured, isHidden, orderIndex, productIds } = req.body;

  const parsedCats = categories !== undefined 
    ? (Array.isArray(categories) ? categories : String(categories).split(',').map(s => s.trim()).filter(Boolean))
    : current.categories;

  const parsedTags = tags !== undefined
    ? (Array.isArray(tags) ? tags : String(tags).split(',').map(s => s.trim()).filter(Boolean))
    : current.tags;

  const cleanTitle = title !== undefined ? String(title).trim() : current.title;
  let savedImageUrl = current.imageUrl;
  if (imageUrl !== undefined) {
    savedImageUrl = await processAndSaveImageAsync(String(imageUrl).trim(), cleanTitle, 'studio', current.id, cleanTitle);
    if (current.imageUrl && savedImageUrl !== current.imageUrl && !isImageInUse(current.imageUrl, { excludeStudioId: current.id })) {
      await cleanupOrphanedImageAsync(current.imageUrl);
    }
  }

  const updatedImg: StudioImage = {
    ...current,
    title: cleanTitle,
    description: description !== undefined ? String(description).trim() : current.description,
    imageUrl: savedImageUrl,
    categories: parsedCats,
    tags: parsedTags,
    isFeatured: isFeatured !== undefined ? Boolean(isFeatured) : current.isFeatured,
    isHidden: isHidden !== undefined ? Boolean(isHidden) : current.isHidden,
    orderIndex: typeof orderIndex === 'number' ? orderIndex : current.orderIndex,
    productIds: productIds !== undefined ? (Array.isArray(productIds) ? productIds : []) : current.productIds
  };

  studioImagesDb[imgIndex] = updatedImg;
  saveDatabase();

  upsertSqlStudioImage(updatedImg).catch(err => {
    console.error(`[Cloud SQL] Failed to update studio image ${updatedImg.id}:`, err.message);
  });

  res.json({ message: 'Studio image updated successfully', image: updatedImg });
});

// DELETE Studio Image
app.delete('/api/studio/images/:id', async (req, res) => {
  const id = req.params.id;
  const targetImg = studioImagesDb.find(i => i.id === id);
  if (!targetImg) {
    return res.status(404).json({ error: 'Studio image not found' });
  }

  if (targetImg.imageUrl && !isImageInUse(targetImg.imageUrl, { excludeStudioId: id })) {
    await cleanupOrphanedImageAsync(targetImg.imageUrl);
  }

  studioImagesDb = studioImagesDb.filter(i => i.id !== id);
  saveDatabase();

  deleteSqlStudioImage(id).catch(err => {
    console.error(`[Cloud SQL] Failed to delete studio image ${id}:`, err.message);
  });

  res.json({ message: 'Studio image deleted successfully' });
});

// POST Reorder Studio Images
app.post('/api/studio/images/reorder', (req, res) => {
  const { items } = req.body; // Array of { id: string, orderIndex: number }
  if (Array.isArray(items)) {
    items.forEach(({ id, orderIndex }) => {
      const img = studioImagesDb.find(i => i.id === id);
      if (img && typeof orderIndex === 'number') {
        img.orderIndex = orderIndex;
      }
    });
  }
  res.json({ message: 'Studio images reordered successfully', images: studioImagesDb });
});

// GET Admin Analytics
app.get('/api/admin/analytics', (req, res) => {
  const totalRevUSD = ordersDb.reduce((acc, o) => acc + (o.totalUSD || 0), 0);
  const totalRevETB = ordersDb.reduce((acc, o) => acc + (o.totalInCurrency || o.totalUSD || 0), 0);
  const completedOrdersCount = ordersDb.filter(o => o.status === 'Completed' || o.status === 'Delivered').length;

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weeklyMapUSD: Record<string, number> = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };

  ordersDb.forEach(o => {
    if (o.createdAt) {
      const d = new Date(o.createdAt);
      if (!isNaN(d.getTime())) {
        const dayName = daysOfWeek[d.getDay()];
        weeklyMapUSD[dayName] = (weeklyMapUSD[dayName] || 0) + (o.totalUSD || o.totalInCurrency || 0);
      }
    }
  });

  const weeklyRevenue = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => ({
    day,
    amountUSD: weeklyMapUSD[day] || 0
  }));

  res.json({
    totalRevenueUSD: totalRevUSD,
    totalRevenueETB: totalRevETB,
    totalOrders: ordersDb.length,
    completedOrders: completedOrdersCount,
    pendingBespoke: bespokeDb.filter(b => b.status === 'Pending Review' || b.status === 'Artisan Assigned').length,
    garmentsCount: productsDb.length,
    recentOrders: ordersDb,
    weeklyRevenue
  });
});

// ==================== VITE / STATIC SERVING ==================== //

async function startServer() {
  // Load persistent JSON database and sync with Cloud SQL PostgreSQL
  await loadDatabaseAsync();

  const storageConfig = detectActiveStorageProvider();
  console.log(`[Storage] Active Provider: ${storageConfig.providerName} (Cloud Ready: ${storageConfig.isCloudReady})`);
  if (storageConfig.isCloudReady) {
    migrateAllToCloudStorageAsync()
      .then(res => {
        console.log(`[Storage Auto-Sync] Sync completed. Migrated: ${res.migratedCount} images to ${res.provider}.`);
      })
      .catch(err => {
        console.error('[Storage Auto-Sync] Background sync error:', err);
      });
  }

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Habesha Couture] Server running on http://localhost:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
