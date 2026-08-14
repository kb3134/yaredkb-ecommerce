// src/db/drizzle.config.ts
import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

// Load environment variables from .env file.
dotenv.config();

const rawDbUrl = process.env.DATABASE_URL || process.env.SQL_URL;
const isRealPostgresUrl = Boolean(
  rawDbUrl && (rawDbUrl.startsWith("postgres://") || rawDbUrl.startsWith("postgresql://"))
);

const sqlHost = process.env.SQL_HOST;
const sqlDbName = process.env.SQL_DB_NAME;
const user = process.env.SQL_USER || process.env.SQL_ADMIN_USER;
const password = process.env.SQL_PASSWORD || process.env.SQL_ADMIN_PASSWORD;

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle", // Output directory for migrations.
  dialect: "postgresql",
  schemaFilter: ["public"],
  dbCredentials: isRealPostgresUrl && rawDbUrl ? {
    url: rawDbUrl,
  } : {
    host: sqlHost || '127.0.0.1',
    user: user || 'postgres',
    password: password || 'postgres',
    database: sqlDbName || 'postgres',
    ssl: false,
  },
  verbose: true,
});
