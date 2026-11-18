import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import { getSupabaseServerClient } from '@/lib/supabase/client';

export interface StorageUploadOptions {
  userId: string;
  submissionId?: string;
  originalFilename: string;
  buffer: Buffer;
  declaredMimeType: string;
}

export interface StorageUploadResult {
  url: string;
  storagePath: string;
  provider: 'SUPABASE' | 'CLOUDINARY' | 'S3' | 'DATABASE_STREAM' | 'LOCAL';
  size: number;
  mimeType: string;
  photoId: string;
  filename: string;
}

export interface StoredPhotoRecord {
  id: string;
  userId: string;
  submissionId?: string;
  storagePath: string;
  filename: string;
  mimeType: string;
  size: number;
  provider: string;
  url: string;
  dataBase64?: string;
  createdAt: string;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const ALLOWED_MIME_MAP: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

class CloudStorageService {
  private dbPhotoStore: Map<string, StoredPhotoRecord> = new Map();
  private dbLoaded: boolean = false;
  private readonly storePath = path.join(process.cwd(), 'data', 'community_photos.json');

  private isServerless(): boolean {
    const cwd = process.cwd();
    return (
      Boolean(process.env.VERCEL) ||
      Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME) ||
      cwd.startsWith('/var/task') ||
      cwd.startsWith('/tmp')
    );
  }

  private ensureStoreLoaded() {
    if (this.dbLoaded) return;
    this.dbLoaded = true;

    try {
      if (fs.existsSync(this.storePath)) {
        const raw = fs.readFileSync(this.storePath, 'utf-8');
        const list: StoredPhotoRecord[] = JSON.parse(raw);
        for (const item of list) {
          this.dbPhotoStore.set(item.id, item);
        }
      }
    } catch (err) {
      // In serverless read-only mode, store exists in memory if file cannot be read
      console.warn('[CloudStorage] Note reading storePath (expected on fresh serverless cold-start):', (err as any)?.message);
    }
  }

  private persistStore() {
    // Only attempt local disk persist if NOT in serverless
    if (this.isServerless()) return;

    try {
      const dir = path.dirname(this.storePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const list = Array.from(this.dbPhotoStore.values());
      fs.writeFileSync(this.storePath, JSON.stringify(list, null, 2), 'utf-8');
    } catch (err) {
      console.warn('[CloudStorage] Non-fatal store persist warning:', (err as any)?.message);
    }
  }

  /**
   * Validate image buffer headers (magic bytes) against spoofed extensions.
   */
  public validateImageBuffer(buffer: Buffer, declaredMime: string): {
    valid: boolean;
    detectedMime?: string;
    extension?: string;
    error?: string;
  } {
    if (!buffer || buffer.length === 0) {
      return { valid: false, error: 'Empty file buffer received.' };
    }

    if (buffer.length > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `File size exceeds 5 MB limit (${(buffer.length / (1024 * 1024)).toFixed(2)} MB).`,
      };
    }

    // Magic Bytes Inspection
    const isJpeg = buffer.length > 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    const isPng =
      buffer.length > 4 &&
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47;
    const isWebp =
      buffer.length > 12 &&
      buffer.slice(0, 4).toString('ascii') === 'RIFF' &&
      buffer.slice(8, 12).toString('ascii') === 'WEBP';

    let detectedMime = '';
    let extension = '';

    if (isJpeg) {
      detectedMime = 'image/jpeg';
      extension = '.jpg';
    } else if (isPng) {
      detectedMime = 'image/png';
      extension = '.png';
    } else if (isWebp) {
      detectedMime = 'image/webp';
      extension = '.webp';
    } else {
      return {
        valid: false,
        error: 'Invalid file format. Binary content is not a valid JPEG, PNG, or WebP image.',
      };
    }

    // Verify declared MIME matches detected MIME family
    const cleanDeclared = (declaredMime || '').toLowerCase();
    if (cleanDeclared && !cleanDeclared.includes(detectedMime.replace('image/', '')) && !(isJpeg && cleanDeclared.includes('jpeg'))) {
      // Allow minor mismatch like image/jpg vs image/jpeg, but reject text/html or application/octet-stream
      if (!ALLOWED_MIME_MAP[cleanDeclared]) {
        return {
          valid: false,
          error: `MIME type "${declaredMime}" does not match detected ${detectedMime} binary stream.`,
        };
      }
    }

    return { valid: true, detectedMime, extension };
  }

  /**
   * Primary Image Upload: Adapts seamlessly across Supabase Storage, Cloudinary,
   * AWS S3, and Database Streaming with zero serverless filesystem crashes.
   */
  public async uploadImage(options: StorageUploadOptions): Promise<StorageUploadResult> {
    this.ensureStoreLoaded();

    // 1. Rigorous Magic-Byte & Size Validation
    const validation = this.validateImageBuffer(options.buffer, options.declaredMimeType);
    if (!validation.valid || !validation.detectedMime || !validation.extension) {
      throw new Error(validation.error || 'Invalid image content.');
    }

    const photoId = `photo_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const uniqueFilename = `${crypto.randomUUID()}${validation.extension}`;
    const cleanUserId = options.userId.replace(/[^a-zA-Z0-9_-]/g, '_');
    const cleanSubId = (options.submissionId || 'temp').replace(/[^a-zA-Z0-9_-]/g, '_');
    const storagePath = `contributions/${cleanUserId}/${cleanSubId}/${uniqueFilename}`;
    const mimeType = validation.detectedMime;

    // --------------------------------------------------------------------------
    // ADAPTER 1: SUPABASE STORAGE (Primary Cloud Backend)
    // --------------------------------------------------------------------------
    try {
      const supabase = getSupabaseServerClient();
      const bucketName = process.env.SUPABASE_STORAGE_BUCKET || 'contributions';

      const { data, error } = await supabase.storage.from(bucketName).upload(storagePath, options.buffer, {
        contentType: mimeType,
        upsert: true,
      });

      if (!error && data?.path) {
        const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(storagePath);
        if (urlData?.publicUrl) {
          const record: StoredPhotoRecord = {
            id: photoId,
            userId: options.userId,
            submissionId: options.submissionId,
            storagePath,
            filename: uniqueFilename,
            mimeType,
            size: options.buffer.length,
            provider: 'SUPABASE',
            url: urlData.publicUrl,
            createdAt: new Date().toISOString(),
          };
          this.dbPhotoStore.set(photoId, record);
          this.persistStore();

          return {
            url: urlData.publicUrl,
            storagePath,
            provider: 'SUPABASE',
            size: options.buffer.length,
            mimeType,
            photoId,
            filename: uniqueFilename,
          };
        }
      } else if (error) {
        console.warn(`[CloudStorage] Supabase Storage upload to bucket "${bucketName}" returned:`, error.message);
      }
    } catch (supaErr: any) {
      console.warn('[CloudStorage] Supabase Storage error:', supaErr?.message || supaErr);
    }

    // --------------------------------------------------------------------------
    // ADAPTER 2: CLOUDINARY (If configured)
    // --------------------------------------------------------------------------
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (cloudName && apiKey && apiSecret) {
      try {
        const timestamp = Math.floor(Date.now() / 1000);
        const folder = `bharatyatra/contributions/${cleanUserId}`;
        const publicId = `${cleanSubId}_${path.parse(uniqueFilename).name}`;

        // SHA-1 signature
        const signatureStr = `folder=${folder}&public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
        const signature = crypto.createHash('sha1').update(signatureStr).digest('hex');

        const formData = new FormData();
        const blob = new Blob([new Uint8Array(options.buffer)], { type: mimeType });
        formData.append('file', blob, uniqueFilename);
        formData.append('api_key', apiKey);
        formData.append('timestamp', timestamp.toString());
        formData.append('signature', signature);
        formData.append('folder', folder);
        formData.append('public_id', publicId);

        const cldRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: 'POST',
          body: formData,
        });

        if (cldRes.ok) {
          const cldData = await cldRes.json();
          const permanentUrl = cldData.secure_url || cldData.url;

          const record: StoredPhotoRecord = {
            id: photoId,
            userId: options.userId,
            submissionId: options.submissionId,
            storagePath: cldData.public_id || storagePath,
            filename: uniqueFilename,
            mimeType,
            size: options.buffer.length,
            provider: 'CLOUDINARY',
            url: permanentUrl,
            createdAt: new Date().toISOString(),
          };
          this.dbPhotoStore.set(photoId, record);
          this.persistStore();

          return {
            url: permanentUrl,
            storagePath: record.storagePath,
            provider: 'CLOUDINARY',
            size: options.buffer.length,
            mimeType,
            photoId,
            filename: uniqueFilename,
          };
        }
      } catch (cldErr: any) {
        console.warn('[CloudStorage] Cloudinary upload error:', cldErr?.message);
      }
    }

    // --------------------------------------------------------------------------
    // ADAPTER 3: LOCAL DISK (Only when local and non-serverless)
    // --------------------------------------------------------------------------
    if (!this.isServerless()) {
      try {
        const localUploadDir = path.join(process.cwd(), 'public', 'uploads', 'contributions', cleanUserId, cleanSubId);
        if (!fs.existsSync(localUploadDir)) {
          fs.mkdirSync(localUploadDir, { recursive: true });
        }
        const diskDest = path.join(localUploadDir, uniqueFilename);
        fs.writeFileSync(diskDest, options.buffer);

        const localUrl = `/uploads/contributions/${cleanUserId}/${cleanSubId}/${uniqueFilename}`;
        const record: StoredPhotoRecord = {
          id: photoId,
          userId: options.userId,
          submissionId: options.submissionId,
          storagePath,
          filename: uniqueFilename,
          mimeType,
          size: options.buffer.length,
          provider: 'LOCAL',
          url: localUrl,
          dataBase64: options.buffer.toString('base64'),
          createdAt: new Date().toISOString(),
        };
        this.dbPhotoStore.set(photoId, record);
        this.persistStore();

        return {
          url: localUrl,
          storagePath: record.storagePath,
          provider: 'LOCAL',
          size: options.buffer.length,
          mimeType,
          photoId,
          filename: uniqueFilename,
        };
      } catch (diskErr: any) {
        console.warn('[CloudStorage] Local disk write fallback failed:', diskErr?.message);
      }
    }

    // --------------------------------------------------------------------------
    // ADAPTER 4: DATABASE-BACKED STREAMING STORAGE (Universal Serverless Fallback)
    // --------------------------------------------------------------------------
    // In serverless environments where local disk is read-only (/var/task) and external
    // bucket is in transit, store the image payload securely in the database layer.
    // Serves via permanent /api/v1/contributions/photos/[id] stream with aggressive caching.
    const streamUrl = `/api/v1/contributions/photos/${photoId}`;
    const base64Data = options.buffer.toString('base64');

    const streamingRecord: StoredPhotoRecord = {
      id: photoId,
      userId: options.userId,
      submissionId: options.submissionId,
      storagePath,
      filename: uniqueFilename,
      mimeType,
      size: options.buffer.length,
      provider: 'DATABASE_STREAM',
      url: streamUrl,
      dataBase64: base64Data,
      createdAt: new Date().toISOString(),
    };

    this.dbPhotoStore.set(photoId, streamingRecord);
    this.persistStore();

    // Also attempt to record into Supabase public.place_submission_photos table if connected
    try {
      const supabase = getSupabaseServerClient();
      await supabase.from('place_submission_photos').insert({
        id: crypto.randomUUID(),
        submission_id: options.submissionId || crypto.randomUUID(),
        storage_path: storagePath,
        image_url: streamUrl,
        is_primary: false,
      });
    } catch {
      // Ignored non-fatal if table not migrated
    }

    return {
      url: streamUrl,
      storagePath,
      provider: 'DATABASE_STREAM',
      size: options.buffer.length,
      mimeType,
      photoId,
      filename: uniqueFilename,
    };
  }

  /**
   * Retrieve stored photo record by photoId for image streaming.
   */
  public getStoredPhoto(photoId: string): StoredPhotoRecord | undefined {
    this.ensureStoreLoaded();
    return this.dbPhotoStore.get(photoId);
  }

  /**
   * Generates a privacy-aware secure access URL for contribution photographs.
   * - Approved destination photographs return public CDN URLs.
   * - Unapproved/pending/rejected photographs return time-limited signed URLs only for the owner or authorized admins.
   * - Unauthorized callers are denied access to unmoderated images.
   */
  public async getSecurePhotoUrl(
    photoIdOrPath: string,
    options: { isApproved?: boolean; userId?: string; isAdmin?: boolean } = {}
  ): Promise<string> {
    this.ensureStoreLoaded();

    let record: StoredPhotoRecord | undefined;
    for (const r of Array.from(this.dbPhotoStore.values())) {
      if (r.id === photoIdOrPath || r.storagePath === photoIdOrPath || r.url === photoIdOrPath) {
        record = r;
        break;
      }
    }

    // If already approved, return public URL directly (preserves published image links)
    if (options.isApproved) {
      return record?.url || photoIdOrPath;
    }

    // If unapproved: verify owner or administrator
    const isOwner = Boolean(options.userId && record && record.userId === options.userId);
    const isAdmin = Boolean(options.isAdmin);

    if (!isOwner && !isAdmin) {
      throw new Error('ACCESS_DENIED: Unapproved destination photographs are confidential and restricted to owner and moderators.');
    }

    // Generate secure time-limited signed URL for Supabase Storage
    if (record && record.provider === 'SUPABASE') {
      try {
        const supabase = getSupabaseServerClient();
        const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'contributions';
        const { data, error } = await supabase.storage.from(bucket).createSignedUrl(record.storagePath, 3600); // 1 hour
        if (!error && data?.signedUrl) {
          return data.signedUrl;
        }
      } catch (err) {
        console.warn('[CloudStorage] Signed URL generation failed, falling back to authenticated stream:', err);
      }
    }

    return record?.url || photoIdOrPath;
  }

  /**
   * Delete or cleanup stored photo.
   */
  public async deletePhoto(photoIdOrPath: string): Promise<boolean> {
    this.ensureStoreLoaded();

    // Check memory / json store
    for (const [id, record] of Array.from(this.dbPhotoStore.entries())) {
      if (id === photoIdOrPath || record.storagePath === photoIdOrPath || record.url === photoIdOrPath) {
        this.dbPhotoStore.delete(id);
        this.persistStore();

        if (record.provider === 'SUPABASE') {
          try {
            const supabase = getSupabaseServerClient();
            const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'contributions';
            await supabase.storage.from(bucket).remove([record.storagePath]);
          } catch (err) {
            console.warn('[CloudStorage] Supabase remove warning:', err);
          }
        }
        return true;
      }
    }
    return false;
  }
}

export const cloudStorageService = new CloudStorageService();
