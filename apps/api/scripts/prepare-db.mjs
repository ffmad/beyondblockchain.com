import { mkdirSync, openSync, closeSync } from 'node:fs';
import { dirname } from 'node:path';
import { databaseUrl } from '../src/database-url.ts';

// Prisma 7's schema engine on this host needs the SQLite file to exist first.
// Append mode creates it when missing and never truncates existing content.
const path = databaseUrl().slice(5);
mkdirSync(dirname(path), { recursive: true });
closeSync(openSync(path, 'a'));
