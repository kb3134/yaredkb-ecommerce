import { v2 as cloudinary } from 'cloudinary';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Local disk fallback directories
const DATA_DIR = path.join(process.cwd(), 'data');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

export type StorageProviderType = 'cloudinary' | 's3' | 'r2' | 'github' | 'local';

export interface StorageConfigInfo {
  provider: StorageProviderType;
  isCloudReady: boolean;
  providerName: string;
  bucketOrCloudName: string;
  region?: string;
  customPublicUrl?: string;
  folder: string;
}

export interface StoredImageResult {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
  provider: StorageProviderType;
  publicId?: string;
}

// Helper to detect dummy/placeholder environment credentials
function isDummyCredential(val?: string): boolean {
  if (!val) return true;
  const str = val.trim().toLowerCase();
  if (!str) return true;
  const placeholders = [
    '12345678',
    '123456789',
    'your_api_key',
    'your_cloud_name',
    'your_api_secret',
    'your_bucket',
    'your_access_key',
    'your_secret',
    'xxxx',
    'xxx',
    'dummy',
    'placeholder',
    'change_me',
    'test_key',
    'demo'
  ];
  return placeholders.some(p => str === p || str.includes('your_') || str.includes('change_me'));
}

// Lazy Cloudinary Client
let isCloudinaryConfigured = false;
let cloudinaryAuthFailed = false;

function initCloudinary() {
  if (cloudinaryAuthFailed) {
    isCloudinaryConfigured = false;
    return false;
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const cloudinaryUrl = process.env.CLOUDINARY_URL;

  if (cloudinaryUrl && !isDummyCredential(cloudinaryUrl)) {
    try {
      cloudinary.config({ url: cloudinaryUrl });
      isCloudinaryConfigured = true;
      return true;
    } catch {
      isCloudinaryConfigured = false;
      return false;
    }
  }

  if (
    cloudName && !isDummyCredential(cloudName) &&
    apiKey && !isDummyCredential(apiKey) &&
    apiSecret && !isDummyCredential(apiSecret)
  ) {
    try {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        secure: true
      });
      isCloudinaryConfigured = true;
      return true;
    } catch {
      isCloudinaryConfigured = false;
      return false;
    }
  }

  isCloudinaryConfigured = false;
  return false;
}

// Lazy S3 / Cloudflare R2 / Google Cloud Storage / S3-compatible Client
let s3Client: S3Client | null = null;
let isS3Configured = false;
let s3AuthFailed = false;

function initS3(): S3Client | null {
  if (s3AuthFailed) {
    isS3Configured = false;
    return null;
  }

  const bucket = process.env.S3_BUCKET || process.env.AWS_S3_BUCKET || process.env.R2_BUCKET || process.env.GCS_BUCKET;
  const accessKeyId = process.env.S3_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID || process.env.R2_ACCESS_KEY_ID || process.env.GCS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY || process.env.R2_SECRET_ACCESS_KEY || process.env.GCS_SECRET_ACCESS_KEY;
  const region = process.env.S3_REGION || process.env.AWS_REGION || (process.env.GCS_BUCKET ? 'auto' : 'auto');
  let endpoint = process.env.S3_ENDPOINT || process.env.R2_ENDPOINT;
  if (!endpoint && process.env.GCS_BUCKET) {
    endpoint = 'https://storage.googleapis.com';
  }

  if (
    bucket && !isDummyCredential(bucket) &&
    accessKeyId && !isDummyCredential(accessKeyId) &&
    secretAccessKey && !isDummyCredential(secretAccessKey)
  ) {
    try {
      s3Client = new S3Client({
        region,
        endpoint: endpoint || undefined,
        credentials: {
          accessKeyId,
          secretAccessKey
        },
        forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true' || Boolean(endpoint && !endpoint.includes('amazonaws.com'))
      });
      isS3Configured = true;
      return s3Client;
    } catch (err) {
      console.error('[CloudStorage] Failed to initialize S3/Object Storage client:', err);
      isS3Configured = false;
      return null;
    }
  }

  isS3Configured = false;
  return null;
}

export function detectActiveStorageProvider(): StorageConfigInfo {
  initCloudinary();
  initS3();

  const uploadFolder = process.env.STORAGE_FOLDER || process.env.CLOUDINARY_FOLDER || 'yared-couture';

  const githubConfig = getGitHubConfig();
  const githubToken = githubConfig.token;
  const githubOwner = githubConfig.owner;
  const githubRepo = githubConfig.repo;

  if (
    githubToken && !isDummyCredential(githubToken) &&
    githubOwner && !isDummyCredential(githubOwner) &&
    githubRepo && !isDummyCredential(githubRepo)
  ) {
    const githubFolder = githubConfig.folder || 'public/uploads';
    return {
      provider: 'github',
      isCloudReady: true,
      providerName: 'GitHub Repository Storage',
      bucketOrCloudName: `${githubOwner}/${githubRepo}`,
      folder: githubFolder
    };
  }

  if (isCloudinaryConfigured) {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'cloudinary-configured';
    return {
      provider: 'cloudinary',
      isCloudReady: true,
      providerName: 'Cloudinary Permanent Cloud Media',
      bucketOrCloudName: cloudName,
      folder: uploadFolder
    };
  }

  if (isS3Configured) {
    const isR2 = Boolean(process.env.R2_BUCKET || (process.env.S3_ENDPOINT && process.env.S3_ENDPOINT.includes('r2.cloudflarestorage.com')));
    const isGCS = Boolean(process.env.GCS_BUCKET || (process.env.S3_ENDPOINT && process.env.S3_ENDPOINT.includes('storage.googleapis.com')));
    const bucket = process.env.S3_BUCKET || process.env.AWS_S3_BUCKET || process.env.R2_BUCKET || process.env.GCS_BUCKET || 's3-bucket';
    const providerName = isR2 ? 'Cloudflare R2 Object Storage' : isGCS ? 'Google Cloud Storage (S3-Compatible)' : 'Amazon S3 / S3-Compatible Storage';
    return {
      provider: isR2 ? 'r2' : 's3',
      isCloudReady: true,
      providerName,
      bucketOrCloudName: bucket,
      region: process.env.S3_REGION || process.env.AWS_REGION,
      customPublicUrl: process.env.S3_PUBLIC_URL || process.env.STORAGE_PUBLIC_URL,
      folder: uploadFolder
    };
  }

  return {
    provider: 'local',
    isCloudReady: false,
    providerName: 'Local Persistent Store (Fallback)',
    bucketOrCloudName: 'local-disk',
    folder: 'data/uploads'
  };
}

export function getMimeType(filenameOrExt: string): string {
  const ext = filenameOrExt.toLowerCase().split('.').pop() || 'jpg';
  switch (ext) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    case 'gif':
      return 'image/gif';
    case 'svg':
      return 'image/svg+xml';
    case 'avif':
      return 'image/avif';
    default:
      return 'image/jpeg';
  }
}

/**
 * Uploads a base64 data URI, buffer, or remote image to permanent cloud storage.
 */
export async function uploadImageToPermanentStorage(
  input: string | Buffer,
  options: {
    filename?: string;
    mimeType?: string;
    folder?: string;
    destination?: string;
    title?: string;
  } = {}
): Promise<StoredImageResult> {
  const config = detectActiveStorageProvider();
  const folder = options.folder || config.folder || 'yared-couture';
  const cleanTitle = (options.title || options.filename || 'asset')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 40) || 'image';

  const timestamp = Date.now();
  const randomSuffix = crypto.randomBytes(3).toString('hex');
  const targetExtension = options.mimeType ? options.mimeType.split('/')[1] || 'jpg' : 'jpg';
  const safeFilename = `${cleanTitle}-${timestamp}-${randomSuffix}.${targetExtension}`;

  let buffer: Buffer;
  let finalMimeType = options.mimeType || 'image/jpeg';

  if (Buffer.isBuffer(input)) {
    buffer = input;
  } else if (typeof input === 'string') {
    const trimmed = input.trim();

    // Case 1: Base64 data URI (data:image/...;base64,...)
    if (trimmed.startsWith('data:image/')) {
      const matches = trimmed.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        finalMimeType = matches[1];
        buffer = Buffer.from(matches[2], 'base64');
      } else {
        const commaIdx = trimmed.indexOf(',');
        const base64Data = commaIdx >= 0 ? trimmed.slice(commaIdx + 1) : trimmed;
        buffer = Buffer.from(base64Data, 'base64');
      }
    } 
    // Case 2: Local file on disk
    else if (trimmed.startsWith('/api/uploads/') || trimmed.startsWith('/src/assets/images/')) {
      const diskFilename = path.basename(trimmed);
      let localPath = path.join(UPLOADS_DIR, diskFilename);
      if (!fs.existsSync(localPath)) {
        localPath = path.join(process.cwd(), 'src', 'assets', 'images', diskFilename);
      }

      if (fs.existsSync(localPath)) {
        buffer = fs.readFileSync(localPath);
        finalMimeType = getMimeType(diskFilename);
      } else {
        if (config.provider === 'local') {
          return {
            url: trimmed,
            filename: diskFilename,
            size: 150000,
            mimeType: getMimeType(diskFilename),
            provider: 'local'
          };
        }
        buffer = Buffer.from('/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=', 'base64');
        finalMimeType = 'image/jpeg';
        try {
          fs.writeFileSync(path.join(UPLOADS_DIR, diskFilename), buffer);
        } catch {}
      }
    }
    // Case 3: Remote HTTP / HTTPS URL
    else if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      // If it is already hosted on Cloudinary, GitHub or S3/R2 with https, return directly
      if (
        (config.provider === 'cloudinary' && trimmed.includes('res.cloudinary.com')) ||
        (config.provider === 'github' && (trimmed.includes('raw.githubusercontent.com') || trimmed.includes('github.com'))) ||
        (config.provider === 's3' && (trimmed.includes('amazonaws.com') || (config.customPublicUrl && trimmed.includes(config.customPublicUrl)))) ||
        (config.provider === 'r2' && (trimmed.includes('r2.dev') || (config.customPublicUrl && trimmed.includes(config.customPublicUrl))))
      ) {
        return {
          url: trimmed,
          filename: path.basename(trimmed.split('?')[0]) || safeFilename,
          size: 150000,
          mimeType: getMimeType(trimmed),
          provider: config.provider
        };
      }

      // Download remote image to buffer to make it permanently self-hosted
      const fetchResponse = await fetch(trimmed);
      if (!fetchResponse.ok) {
        throw new Error(`Failed to download remote image from ${trimmed}: status ${fetchResponse.status}`);
      }
      const arrayBuf = await fetchResponse.arrayBuffer();
      buffer = Buffer.from(arrayBuf);
      const ct = fetchResponse.headers.get('content-type');
      if (ct) finalMimeType = ct;
    } else {
      // Raw string assumed base64
      buffer = Buffer.from(trimmed, 'base64');
    }
  } else {
    throw new Error('Unsupported image input type');
  }

  // 0. GITHUB REPOSITORY UPLOAD
  if (config.provider === 'github') {
    try {
      const result = await uploadToGitHub(buffer, safeFilename, folder, finalMimeType);
      return result;
    } catch (err: any) {
      console.warn('[CloudStorage] GitHub upload notice, using persistent local fallback:', err?.message || err);
    }
  }

  // 1. CLOUDINARY UPLOAD
  if (config.provider === 'cloudinary') {
    try {
      const publicId = `${folder}/${cleanTitle}-${timestamp}-${randomSuffix}`;
      const base64Uri = `data:${finalMimeType};base64,${buffer.toString('base64')}`;

      const uploadRes = await cloudinary.uploader.upload(base64Uri, {
        public_id: publicId,
        folder: folder,
        resource_type: 'image',
        overwrite: true,
        transformation: [
          { quality: 'auto:good', fetch_format: 'auto' }
        ]
      });

      return {
        url: uploadRes.secure_url || uploadRes.url,
        filename: safeFilename,
        size: uploadRes.bytes || buffer.length,
        mimeType: finalMimeType,
        provider: 'cloudinary',
        publicId: uploadRes.public_id
      };
    } catch (err: any) {
      const httpCode = err?.http_code || err?.status;
      const errMsg = err?.message || String(err);
      if (
        httpCode === 401 ||
        httpCode === 403 ||
        errMsg.includes('Unknown API key') ||
        errMsg.includes('Must supply api_key') ||
        errMsg.includes('Invalid API key')
      ) {
        cloudinaryAuthFailed = true;
        isCloudinaryConfigured = false;
        console.warn(`[CloudStorage] Cloudinary API key authentication failed (${errMsg}). Disabling Cloudinary and switching to persistent local store.`);
      } else {
        console.warn('[CloudStorage] Cloudinary upload notice, using persistent local fallback:', errMsg);
      }
    }
  }

  // 2. S3 / CLOUDFLARE R2 UPLOAD
  if ((config.provider === 's3' || config.provider === 'r2') && s3Client) {
    try {
      const bucket = process.env.S3_BUCKET || process.env.AWS_S3_BUCKET || process.env.R2_BUCKET!;
      const key = `${folder}/${safeFilename}`;

      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: finalMimeType
      });

      await s3Client.send(command);

      let publicUrl = '';
      if (process.env.S3_PUBLIC_URL || process.env.STORAGE_PUBLIC_URL) {
        const baseUrl = (process.env.S3_PUBLIC_URL || process.env.STORAGE_PUBLIC_URL)!.replace(/\/+$/, '');
        publicUrl = `${baseUrl}/${key}`;
      } else if (config.provider === 'r2') {
        const publicR2Domain = process.env.R2_PUBLIC_DOMAIN;
        if (publicR2Domain) {
          publicUrl = `https://${publicR2Domain.replace(/\/+$/, '')}/${key}`;
        } else {
          publicUrl = `https://${bucket}.r2.cloudflarestorage.com/${key}`;
        }
      } else {
        const region = process.env.S3_REGION || process.env.AWS_REGION || 'us-east-1';
        publicUrl = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
      }

      return {
        url: publicUrl,
        filename: safeFilename,
        size: buffer.length,
        mimeType: finalMimeType,
        provider: config.provider,
        publicId: key
      };
    } catch (err: any) {
      const code = err?.name || err?.code;
      const errMsg = err?.message || String(err);
      if (
        code === 'AccessDenied' ||
        code === 'InvalidAccessKeyId' ||
        code === 'SignatureDoesNotMatch' ||
        code === 'UnrecognizedClientException'
      ) {
        s3AuthFailed = true;
        isS3Configured = false;
        console.warn(`[CloudStorage] S3/R2 authentication failed (${code}: ${errMsg}). Disabling S3 and switching to persistent local store.`);
      } else {
        console.warn('[CloudStorage] S3/R2 upload notice, using persistent local fallback:', errMsg);
      }
    }
  }

  // 3. LOCAL / DISK PERSISTENT FALLBACK
  const localDestPath = path.join(UPLOADS_DIR, safeFilename);
  fs.writeFileSync(localDestPath, buffer);

  return {
    url: `/api/uploads/${safeFilename}`,
    filename: safeFilename,
    size: buffer.length,
    mimeType: finalMimeType,
    provider: 'local'
  };
}

/**
 * Permanently deletes an asset from Cloudinary or S3 if publicId is known.
 */
export async function deleteImageFromPermanentStorage(publicIdOrUrl: string): Promise<boolean> {
  const config = detectActiveStorageProvider();

  try {
    if (config.provider === 'cloudinary') {
      let publicId = publicIdOrUrl;
      if (publicIdOrUrl.includes('res.cloudinary.com')) {
        const parts = publicIdOrUrl.split('/upload/');
        if (parts[1]) {
          const sub = parts[1].replace(/^v\d+\//, '').split('.')[0];
          publicId = sub;
        }
      }
      await cloudinary.uploader.destroy(publicId);
      return true;
    }

    if (config.provider === 'github' || publicIdOrUrl.includes('raw.githubusercontent.com')) {
      return await deleteFromGitHub(publicIdOrUrl);
    }

    if ((config.provider === 's3' || config.provider === 'r2') && s3Client) {
      const bucket = process.env.S3_BUCKET || process.env.AWS_S3_BUCKET || process.env.R2_BUCKET!;
      let key = publicIdOrUrl;
      if (publicIdOrUrl.startsWith('http')) {
        try {
          const urlObj = new URL(publicIdOrUrl);
          key = urlObj.pathname.replace(/^\/+/, '');
        } catch {
          // ignore
        }
      }
      await s3Client.send(new DeleteObjectCommand({
        Bucket: bucket,
        Key: key
      }));
      return true;
    }
  } catch (err) {
    console.warn('[CloudStorage] Delete failed:', err);
  }

  return false;
}

export function getGitHubConfig(): {
  token?: string;
  owner: string;
  repo: string;
  branch: string;
  folder: string;
} {
  let fileConfig: any = {};
  const configPath = path.join(DATA_DIR, 'github_config.json');
  if (fs.existsSync(configPath)) {
    try {
      fileConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch {
      // ignore
    }
  }

  const token = process.env.GITHUB_TOKEN || fileConfig.token;
  const owner = process.env.GITHUB_OWNER || fileConfig.owner || 'kb3134';
  const repo = process.env.GITHUB_REPO || fileConfig.repo || 'yaredkb-ecommerce';
  const branch = process.env.GITHUB_BRANCH || fileConfig.branch || 'main';
  const folder = process.env.GITHUB_FOLDER || process.env.STORAGE_FOLDER || fileConfig.folder || 'public/uploads';

  return { token, owner, repo, branch, folder };
}

export function saveGitHubConfig(newConfig: {
  token?: string;
  owner?: string;
  repo?: string;
  branch?: string;
  folder?: string;
}) {
  const current = getGitHubConfig();
  const merged = {
    token: newConfig.token !== undefined ? newConfig.token.trim() : current.token,
    owner: newConfig.owner !== undefined ? newConfig.owner.trim() : current.owner,
    repo: newConfig.repo !== undefined ? newConfig.repo.trim() : current.repo,
    branch: newConfig.branch !== undefined ? newConfig.branch.trim() : current.branch,
    folder: newConfig.folder !== undefined ? newConfig.folder.trim() : current.folder
  };

  const configPath = path.join(DATA_DIR, 'github_config.json');
  fs.writeFileSync(configPath, JSON.stringify(merged, null, 2), 'utf8');

  if (merged.token) {
    process.env.GITHUB_TOKEN = merged.token;
  }
  if (merged.owner) {
    process.env.GITHUB_OWNER = merged.owner;
  }
  if (merged.repo) {
    process.env.GITHUB_REPO = merged.repo;
  }
  if (merged.branch) {
    process.env.GITHUB_BRANCH = merged.branch;
  }

  return merged;
}

async function uploadToGitHub(buffer: Buffer, safeFilename: string, folder: string, mimeType: string): Promise<StoredImageResult> {
  const config = getGitHubConfig();
  const token = config.token;
  const owner = config.owner;
  const repo = config.repo;
  const branch = config.branch;
  const targetFolder = folder || config.folder;
  const cleanFolder = targetFolder.replace(/^\/+|\/+$/g, '');
  const repoPath = cleanFolder ? `${cleanFolder}/${safeFilename}` : safeFilename;

  if (!token) {
    throw new Error('GITHUB_TOKEN is missing. Please configure your GitHub token.');
  }

  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${repoPath}`;
  const base64Content = buffer.toString('base64');

  let existingSha: string | undefined = undefined;
  try {
    const getRes = await fetch(`${apiUrl}?ref=${branch}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'E-Commerce-App'
      }
    });
    if (getRes.ok) {
      const fileData = await getRes.json() as any;
      if (fileData && fileData.sha) {
        existingSha = fileData.sha;
      }
    }
  } catch {
    // ignore
  }

  const putBody: any = {
    message: `Upload image ${safeFilename} via e-commerce admin panel`,
    content: base64Content,
    branch: branch
  };
  if (existingSha) {
    putBody.sha = existingSha;
  }

  const putRes = await fetch(apiUrl, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'User-Agent': 'E-Commerce-App'
    },
    body: JSON.stringify(putBody)
  });

  if (!putRes.ok) {
    const errText = await putRes.text().catch(() => '');
    throw new Error(`GitHub API upload failed (status ${putRes.status}): ${errText.slice(0, 200)}`);
  }

  const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${repoPath}`;

  return {
    url: rawUrl,
    filename: safeFilename,
    size: buffer.length,
    mimeType: mimeType,
    provider: 'github',
    publicId: repoPath
  };
}

async function deleteFromGitHub(publicIdOrUrl: string): Promise<boolean> {
  const config = getGitHubConfig();
  const token = config.token;
  const owner = config.owner;
  const repo = config.repo;
  const branch = config.branch;

  if (!token) return false;

  let repoPath = publicIdOrUrl;
  if (publicIdOrUrl.startsWith('http')) {
    try {
      const urlObj = new URL(publicIdOrUrl);
      const segments = urlObj.pathname.split('/').filter(Boolean);
      if (urlObj.hostname.includes('raw.githubusercontent.com') && segments.length >= 4) {
        repoPath = segments.slice(3).join('/');
      } else if (segments.length >= 5 && segments.includes('raw')) {
        const rawIdx = segments.indexOf('raw');
        repoPath = segments.slice(rawIdx + 2).join('/');
      } else {
        repoPath = segments.slice(2).join('/');
      }
    } catch {
      // fallback
    }
  }

  repoPath = repoPath.replace(/^\/+/, '');
  if (!repoPath) return false;

  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${repoPath}`;

  try {
    const getRes = await fetch(`${apiUrl}?ref=${branch}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'E-Commerce-App'
      }
    });
    if (!getRes.ok) {
      console.warn(`[GitHub Storage] File not found on GitHub for deletion: ${repoPath}`);
      return false;
    }
    const fileData = await getRes.json() as any;
    const sha = fileData?.sha;
    if (!sha) return false;

    const delRes = await fetch(apiUrl, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'User-Agent': 'E-Commerce-App'
      },
      body: JSON.stringify({
        message: `Delete image ${repoPath} via e-commerce admin panel`,
        sha: sha,
        branch: branch
      })
    });

    return delRes.ok;
  } catch (err) {
    console.warn('[GitHub Storage] Delete error:', err);
    return false;
  }
}

export async function testGitHubStorageConnection(customConfig?: {
  token?: string;
  owner?: string;
  repo?: string;
  branch?: string;
}): Promise<{
  success: boolean;
  message: string;
  repo: string;
  owner: string;
  branch: string;
  canRead?: boolean;
  canWrite?: boolean;
  hasToken: boolean;
}> {
  const current = getGitHubConfig();
  const token = customConfig?.token || current.token;
  const owner = customConfig?.owner || current.owner || 'kb3134';
  const repo = customConfig?.repo || current.repo || 'yaredkb-ecommerce';
  const branch = customConfig?.branch || current.branch || 'main';

  if (!token || isDummyCredential(token)) {
    return {
      success: false,
      message: 'GITHUB_TOKEN is missing or not set. Enter your personal access token to connect.',
      repo,
      owner,
      branch,
      hasToken: false
    };
  }

  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'E-Commerce-App'
      }
    });

    if (!res.ok) {
      const err = await res.text().catch(() => '');
      let cleanMsg = err.slice(0, 150);
      try {
        const parsed = JSON.parse(err);
        if (parsed.message) cleanMsg = parsed.message;
      } catch {}
      return {
        success: false,
        message: `GitHub repository check failed (${res.status}): ${cleanMsg}`,
        repo,
        owner,
        branch,
        hasToken: true
      };
    }

    const data = await res.json() as any;
    const permissions = data?.permissions || {};
    const canPush = permissions.push !== false;

    return {
      success: true,
      message: `Successfully verified repository https://github.com/${owner}/${repo} (Branch: ${branch}) with ${canPush ? 'Read & Write' : 'Read-only'} access!`,
      repo,
      owner,
      branch,
      canRead: true,
      canWrite: canPush,
      hasToken: true
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Network error connecting to GitHub: ${err.message}`,
      repo,
      owner,
      branch,
      hasToken: Boolean(token)
    };
  }
}

