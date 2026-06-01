import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function POST(request: Request): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => ({
        allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
        maximumSizeInBytes: 5 * 1024 * 1024, // 5 MB
        tokenPayload: JSON.stringify({ pathname }),
      }),
      onUploadCompleted: async () => {},
    });
    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 400 });
  }
}
