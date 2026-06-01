import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { auth } from '@/auth';
import { getDb } from '@/lib/db/client';
import { apiUsageLogs } from '@/lib/db/schema';
import { generateId, now } from '@/lib/utils';

const GEMINI_IMAGE_COST_EUR = 0.04; // stima €/immagine

export async function POST(request: Request): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { prompt, characterId } = await request.json() as { prompt: string; characterId: string };
  if (!prompt?.trim()) return NextResponse.json({ error: 'Prompt mancante' }, { status: 400 });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'GEMINI_API_KEY non configurata' }, { status: 500 });

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-image' });

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        // @ts-expect-error — responseModalities not yet in SDK types
        responseModalities: ['IMAGE', 'TEXT'],
      },
    });

    const parts = result.response.candidates?.[0]?.content?.parts ?? [];
    const imagePart = parts.find(
      (p: { inlineData?: { mimeType: string; data: string } }) => p.inlineData
    );

    if (!imagePart?.inlineData) {
      console.error('[portrait/generate] No image in response:', JSON.stringify(parts));
      return NextResponse.json({ error: 'Nessuna immagine restituita. Riprova con un prompt diverso.' }, { status: 500 });
    }

    const { mimeType, data } = imagePart.inlineData;
    const buffer = Buffer.from(data, 'base64');
    const ext = mimeType === 'image/jpeg' ? 'jpg' : 'png';
    const filename = `portraits/${characterId}-${Date.now()}.${ext}`;

    const blob = await put(filename, buffer, { access: 'public', contentType: mimeType });

    // Logga l'utilizzo nel DB
    try {
      const db = getDb();
      await db.insert(apiUsageLogs).values({
        id: generateId(),
        service: 'gemini_image',
        characterId,
        userId: session.user?.email ?? null,
        costEur: GEMINI_IMAGE_COST_EUR,
        createdAt: now(),
      });
    } catch (logErr) {
      console.warn('[portrait/generate] log failed:', logErr);
    }

    return NextResponse.json({ url: blob.url });
  } catch (err) {
    console.error('[portrait/generate]', err);
    return NextResponse.json({ error: 'Errore generazione: ' + String(err) }, { status: 500 });
  }
}
