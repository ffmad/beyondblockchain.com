import { createDatabase } from '../src/database.js';
import { seedContent } from '../src/seed-content.js';

const db = createDatabase();
try {
  await seedContent(db);
  console.info('Updated Ikitai, Fairmints, and FestCompass. Unrelated projects preserved.');
} finally {
  await db.$disconnect();
}
