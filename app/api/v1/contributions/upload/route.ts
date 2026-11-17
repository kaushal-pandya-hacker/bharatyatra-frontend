import { NextRequest, NextResponse } from 'next/server';
import { requireServerUser } from '@/lib/auth/server-auth';
import { cloudStorageService } from '@/lib/storage/cloud-storage-service';

export const dynamic = 'force-dynamic';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
]);

export async function POST(req: NextRequest) {
  try {
    const auth = await requireServerUser(req);
    if (auth.response) return auth.response;
    const user = auth.user;

    const formData = await req.formData();
    const file = (formData.get('photo') || formData.get('file')) as File | null;
    const submissionId = (formData.get('submissionId') as string | null) || undefined;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file provided in form data field "photo".' },
        { status: 400 }
      );
    }

    // 1. Declared MIME Type check
    const declaredMime = (file.type || '').toLowerCase();
    if (!ALLOWED_MIME_TYPES.has(declaredMime)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid file format. Only JPEG, PNG, and WebP images are permitted.',
        },
        { status: 415 }
      );
    }

    // 2. Strict File Size Validation (<= 5 MB)
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        {
          success: false,
          message: `File exceeds maximum allowed size of 5 MB (Current size: ${(file.size / (1024 * 1024)).toFixed(2)} MB).`,
        },
        { status: 413 }
      );
    }

    // 3. ArrayBuffer & Binary Signature Verification
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const validation = cloudStorageService.validateImageBuffer(buffer, declaredMime);
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          message: validation.error || 'File failed binary signature inspection. Invalid image data.',
        },
        { status: 400 }
      );
    }

    // 4. Delegate to Production Cloud Storage Engine
    // (Uploads to Supabase Storage, Cloudinary, AWS S3, or Persistent Database Stream)
    const uploadResult = await cloudStorageService.uploadImage({
      userId: user.id,
      submissionId,
      originalFilename: file.name,
      buffer,
      declaredMimeType: validation.detectedMime || declaredMime,
    });

    return NextResponse.json({
      success: true,
      url: uploadResult.url,
      filename: uploadResult.filename,
      size: uploadResult.size,
      mimeType: uploadResult.mimeType,
      provider: uploadResult.provider,
      storagePath: uploadResult.storagePath,
      photoId: uploadResult.photoId,
    });
  } catch (err: any) {
    console.error('[ContributionUpload] Upload error:', err);
    return NextResponse.json(
      { success: false, message: err?.message || 'Failed to upload photo.' },
      { status: 500 }
    );
  }
}
