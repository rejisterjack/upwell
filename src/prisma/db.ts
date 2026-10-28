import "dotenv/config";
import { attachDatabasePool } from "@vercel/functions";
import { Pool } from "pg";
import postgres from "@prisma/orm-postgres/runtime";
import { contractFromJson } from "@prisma/orm-postgres/static";
import type { Contract } from "./contract.d";
import contractJson from "./contract.json" with { type: "json" };

export const contract = contractFromJson<Contract>(contractJson);

function createPool() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
  });
  if (process.env.VERCEL) {
    attachDatabasePool(pool);
  }
  return pool;
}

function createDatabase(connection: Pool) {
  return postgres({
    contract,
    pg: connection,
  });
}

type Database = ReturnType<typeof createDatabase>;

const globalForDb = globalThis as typeof globalThis & {
  upwellPool?: Pool;
  upwellDb?: Database;
};

export const pool = globalForDb.upwellPool ?? createPool();
export const db: Database = globalForDb.upwellDb ?? createDatabase(pool);

if (process.env.NODE_ENV !== "production") {
  globalForDb.upwellPool = pool;
  globalForDb.upwellDb = db;
}
