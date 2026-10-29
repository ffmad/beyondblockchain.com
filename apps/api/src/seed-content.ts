import type { PrismaClient } from './generated/prisma/client.js';
import { projects } from './content/projects.js';

export async function seedContent(db: PrismaClient) {
  await db.$transaction(
    projects.map((project) =>
      db.project.upsert({
        where: { slug: project.slug },
        create: project,
        update: project,
      }),
    ),
  );
}
