import test from 'node:test';
import assert from 'node:assert/strict';
import { cloudStorageService } from '../lib/storage/cloud-storage-service';
import { GET as streamPhotoRoute } from '../app/api/v1/contributions/photos/[id]/route';
import { NextRequest } from 'next/server';

test('BharatYatra Production Cloud Storage Engine & Upload Security Suite', async (t) => {
  // Test User Context
  const testUserId = 'test_voyager_49210';
  const testSubId = 'sub_heritage_001';

  // Valid Magic-Byte Payloads
  // 1. JPEG: FF D8 FF E0 00 10 4A 46 49 46 (JFIF)
  const validJpegBuffer = Buffer.from([
    0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x48,
    0x00, 0x48, 0x00, 0x00, 0xff, 0xdb, 0x00, 0x43, 0x00, 0xff, 0xd9,
  ]);

  // 2. PNG: 89 50 4E 47 0D 0A 1A 0A
  const validPngBuffer = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4,
  ]);

  // 3. WebP: RIFF .... WEBP
  const validWebpBuffer = Buffer.concat([
    Buffer.from('RIFF'),
    Buffer.from([0x20, 0x00, 0x00, 0x00]),
    Buffer.from('WEBPVP8 '),
    Buffer.from([0x14, 0x00, 0x00, 0x00, 0x30, 0x01, 0x00, 0x9d, 0x01, 0x2a, 0x01, 0x00, 0x01, 0x00]),
  ]);

  // Spoofed Payload (Plain text with .jpg extension)
  const spoofedBuffer = Buffer.from('<script>alert("malicious script")</script>', 'utf-8');

  // Oversized buffer (5.5 MB)
  const oversizedBuffer = Buffer.alloc(5.5 * 1024 * 1024, 0xff);

  let uploadedJpegResult: any;

  await t.test('1. Validates real JPEG magic bytes and accepts authentic image', async () => {
    const val = cloudStorageService.validateImageBuffer(validJpegBuffer, 'image/jpeg');
    assert.equal(val.valid, true);
    assert.equal(val.detectedMime, 'image/jpeg');
    assert.equal(val.extension, '.jpg');
  });

  await t.test('2. Validates real PNG magic bytes and accepts authentic image', async () => {
    const val = cloudStorageService.validateImageBuffer(validPngBuffer, 'image/png');
    assert.equal(val.valid, true);
    assert.equal(val.detectedMime, 'image/png');
    assert.equal(val.extension, '.png');
  });

  await t.test('3. Validates real WebP RIFF bytes and accepts authentic image', async () => {
    const val = cloudStorageService.validateImageBuffer(validWebpBuffer, 'image/webp');
    assert.equal(val.valid, true);
    assert.equal(val.detectedMime, 'image/webp');
    assert.equal(val.extension, '.webp');
  });

  await t.test('4. Rejects spoofed text or HTML masquerading as image with .jpg MIME', async () => {
    const val = cloudStorageService.validateImageBuffer(spoofedBuffer, 'image/jpeg');
    assert.equal(val.valid, false);
    assert.ok(val.error?.includes('Invalid file format') || val.error?.includes('binary'));
  });

  await t.test('5. Rejects oversized files (> 5 MB hard quota)', async () => {
    const val = cloudStorageService.validateImageBuffer(oversizedBuffer, 'image/jpeg');
    assert.equal(val.valid, false);
    assert.ok(val.error?.includes('exceeds 5 MB limit'));
  });

  await t.test('6. Uploads valid photograph and generates permanent, serverless-safe URL', async () => {
    uploadedJpegResult = await cloudStorageService.uploadImage({
      userId: testUserId,
      submissionId: testSubId,
      originalFilename: 'modhera_sun_temple_stepwell.jpg',
      buffer: validJpegBuffer,
      declaredMimeType: 'image/jpeg',
    });

    assert.ok(uploadedJpegResult.url, 'Permanent storage URL must be generated');
    assert.ok(uploadedJpegResult.photoId, 'Unique photoId must be issued');
    assert.ok(uploadedJpegResult.storagePath.includes(testUserId), 'Path must contain user namespace');
    assert.equal(uploadedJpegResult.mimeType, 'image/jpeg');
    assert.equal(uploadedJpegResult.size, validJpegBuffer.length);
    assert.notEqual(uploadedJpegResult.provider, undefined);
  });

  await t.test('7. Streams image through /api/v1/contributions/photos/[id] with caching & ETag', async () => {
    assert.ok(uploadedJpegResult?.photoId, 'Previous upload photoId must exist');

    // Create simulated NextRequest
    const req = new NextRequest(`https://www.bharatyatra.in/api/v1/contributions/photos/${uploadedJpegResult.photoId}`);
    const res = await streamPhotoRoute(req, { params: { id: uploadedJpegResult.photoId } });

    assert.equal(res.status, 200);
    assert.equal(res.headers.get('Content-Type'), 'image/jpeg');
    assert.ok(res.headers.get('Cache-Control')?.includes('immutable'));
    assert.ok(res.headers.get('ETag'));

    const streamedBytes = Buffer.from(await res.arrayBuffer());
    assert.equal(streamedBytes.length, validJpegBuffer.length);
    assert.equal(streamedBytes[0], 0xff);
    assert.equal(streamedBytes[1], 0xd8);
  });

  await t.test('8. Returns 304 Not Modified when client sends matching ETag', async () => {
    assert.ok(uploadedJpegResult?.photoId);

    const req = new NextRequest(`https://www.bharatyatra.in/api/v1/contributions/photos/${uploadedJpegResult.photoId}`, {
      headers: {
        'if-none-match': `"${uploadedJpegResult.photoId}"`,
      },
    });
    const res = await streamPhotoRoute(req, { params: { id: uploadedJpegResult.photoId } });
    assert.equal(res.status, 304);
  });

  await t.test('9. Returns 404 for unknown or non-existent photo ID', async () => {
    const req = new NextRequest('https://www.bharatyatra.in/api/v1/contributions/photos/unknown_photo_99999');
    const res = await streamPhotoRoute(req, { params: { id: 'unknown_photo_99999' } });
    assert.equal(res.status, 404);
  });

  await t.test('10. Vercel Serverless Simulation: Zero filesystem writes, zero ENOENT crashes', async () => {
    // Simulate Vercel Lambda environment
    const originalVercel = process.env.VERCEL;
    process.env.VERCEL = '1';

    try {
      const serverlessResult = await cloudStorageService.uploadImage({
        userId: 'lambda_user_882',
        submissionId: 'lambda_sub_991',
        originalFilename: 'rann_of_kutch_sunset.webp',
        buffer: validWebpBuffer,
        declaredMimeType: 'image/webp',
      });

      assert.ok(serverlessResult.url, 'Serverless upload must produce permanent URL');
      assert.ok(serverlessResult.url.startsWith('http') || serverlessResult.url.startsWith('/api/v1/contributions/photos/'));
      assert.notEqual(serverlessResult.provider, 'LOCAL', 'In serverless, provider must never be LOCAL disk');

      // Verify streamed output from serverless photo
      const req = new NextRequest(`https://www.bharatyatra.in${serverlessResult.url}`);
      const res = await streamPhotoRoute(req, { params: { id: serverlessResult.photoId } });
      assert.equal(res.status, 200);
      assert.equal(res.headers.get('Content-Type'), 'image/webp');
    } finally {
      process.env.VERCEL = originalVercel;
    }
  });
});
