import { NextResponse } from 'next/server';
import { getAllStateFolderItems } from '@/lib/tourism/state-folder-loader';

export async function GET() {
  try {
    const states = getAllStateFolderItems();
    return NextResponse.json({
      success: true,
      count: states.length,
      data: states.map(s => ({
        id: s.slug,
        name: s.name,
        slug: s.slug,
        folderName: s.folderName,
        coverImage: s.coverImage,
        placesCount: s.placesCount,
        _count: {
          destinations: s.placesCount,
          cities: s.placesCount,
        },
      })),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch states' },
      { status: 500 }
    );
  }
}
