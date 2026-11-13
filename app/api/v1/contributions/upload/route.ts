import { NextRequest, NextResponse } from 'next/server';
import { requireServerUser } from '@/lib/auth/server-auth';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const ALLOWED_MIME_TYPES: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export async function POST(req: NextRequest) {
  try {
    const auth = await requireServerUser(req);
    if (auth.response) return auth.response;

    const formData = await req.formData();
    const file = formData.get('photo') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file provided in form data field "photo".' },
        { status: 400 }
      );
    }

    // 1. MIME Type Validation
    const mime = file.type?.toLowerCase();
    const extension = ALLOWED_MIME_TYPES[mime];
    if (!extension) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid file format. Only JPEG, PNG, and WebP images are permitted.',
        },
        { status: 415 }
      );
    }

    // 2. File Size Validation
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        {
          success: false,
          message: `File exceeds maximum allowed size of 5 MB (Current size: ${(file.size / (1024 * 1024)).toFixed(2)} MB).`,
        },
        { status: 413 }
      );
    }

    // 3. Convert ArrayBuffer and write to storage
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Verify PNG/JPEG magic bytes
    const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8;
    const isPng = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
    const isWebp = buffer.slice(8, 12).toString('ascii') === 'WEBP';

    if (!isJpeg && !isPng && !isWebp) {
      return NextResponse.json(
        {
          success: false,
          message: 'File content failed binary header inspection. Invalid image data.',
        },
        { status: 400 }
      );
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'contributions');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const uniqueFilename = `${crypto.randomUUID()}${extension}`;
    const destinationPath = path.join(uploadDir, uniqueFilename);

    fs.writeFileSync(destinationPath, buffer);

    const publicUrl = `/uploads/contributions/${uniqueFilename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: uniqueFilename,
      size: file.size,
      mimeType: mime,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Failed to upload photo.' },
      { status: 500 }
    );
  }
}

