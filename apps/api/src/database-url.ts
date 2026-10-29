import { config } from 'dotenv';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const apiRoot = fileURLToPath(new URL('../', import.meta.url));
config({ path: resolve(apiRoot, '.env'), quiet: true });

export function databaseUrl(): string {
  const value = process.env.DATABASE_URL ?? 'file:./prisma/dev.db';
  if (!value.startsWith('file:') || value.slice(5).length === 0) {
    throw new Error('DATABASE_URL must be a SQLite file: URL.');
  }
  return `file:${resolve(apiRoot, value.slice(5))}`;
}
