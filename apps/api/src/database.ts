import { Injectable, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from './generated/prisma/client.js';
import { databaseUrl } from './database-url.js';

export function createDatabase(url = databaseUrl()) {
  return new PrismaClient({ adapter: new PrismaBetterSqlite3({ url }) });
}

@Injectable()
export class Database implements OnModuleInit, OnModuleDestroy {
  readonly client = createDatabase();
  async onModuleInit() {
    await this.client.$connect();
  }
  async onModuleDestroy() {
    await this.client.$disconnect();
  }
}
