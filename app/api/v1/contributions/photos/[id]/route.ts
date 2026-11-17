import { NextRequest, NextResponse } from 'next/server';
import { cloudStorageService } from '@/lib/storage/cloud-storage-service';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const photoId = params.id;
    if (!photoId) {
      return new NextResponse('Photo ID is required', { status: 400 });
    }

    const record = cloudStorageService.getStoredPhoto(photoId);
    if (!record) {
      return new NextResponse('Photo not found', { status: 404 });
    }

    let buffer: Buffer | null = null;
    if (record.dataBase64) {
      buffer = Buffer.from(record.dataBase64, 'base64');
    } else {
      const fs = require('fs');
      const path = require('path');
      const candidates = [
        path.join(process.cwd(), 'public', record.url.replace(/^\//, '')),
        path.join(process.cwd(), record.storagePath),
      ];
      for (const p of candidates) {
        if (fs.existsSync(p)) {
          buffer = fs.readFileSync(p);
          break;
        }
      }
    }

    if (!buffer) {
      return new NextResponse('Photo not found', { status: 404 });
    }

    const etag = `"${record.id}"`;
    const clientEtag = req.headers.get('if-none-match');
    if (clientEtag === etag) {
      return new NextResponse(null, { status: 304 });
    }

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': record.mimeType || 'image/jpeg',
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable',
        ETag: etag,
      },
    });
  } catch (err: any) {
    return new NextResponse('Failed to serve photo', { status: 500 });
  }
}
