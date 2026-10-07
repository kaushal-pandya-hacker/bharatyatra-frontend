import { NextResponse } from 'next/server';
import { getStateFolderItemBySlug } from '@/lib/tourism/state-folder-loader';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const stateItem = getStateFolderItemBySlug(slug);

    if (!stateItem) {
      return NextResponse.json(
        { success: false, error: `State '${slug}' not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: stateItem,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch state details' },
      { status: 500 }
    );
  }
}
