import { eq } from 'drizzle-orm';
import { getDb } from '@/lib/db/client';
import { characters } from '@/lib/db/schema';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  const [char] = await db.select().from(characters).where(eq(characters.id, id));
  if (!char) return Response.json({ error: 'Not found' }, { status: 404 });
  return Response.json(char);
}
