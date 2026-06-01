import type { Config } from 'drizzle-kit';
import { config } from 'dotenv';

// Carica .env.local quando drizzle-kit gira fuori da Next.js
config({ path: '.env.local' });

const isTurso = !!process.env.TURSO_DATABASE_URL;

export default {
  schema: './lib/db/schema.ts',
  out: './drizzle',
  dialect: isTurso ? 'turso' : 'sqlite',
  dbCredentials: isTurso
    ? { url: process.env.TURSO_DATABASE_URL!, authToken: process.env.TURSO_AUTH_TOKEN }
    : { url: './aethon.db' },
} satisfies Config;
