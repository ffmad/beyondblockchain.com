import { defineConfig } from 'prisma/config';
import { databaseUrl } from './src/database-url.js';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations', seed: 'node --import tsx prisma/seed.ts' },
  datasource: { url: databaseUrl() },
});
