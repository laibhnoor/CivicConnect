import fs from "fs";
import path from "path";
import pkg from "pg";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

const { Pool } = pkg;
dotenv.config();

// Needed because you're using ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL is required to run migrations.");
  process.exit(1);
}

// Connect to hosted PostgreSQL (Neon/Render-compatible)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const runSchema = async () => {
  try {
    console.log("📄 Reading schema.sql...");

    const schemaPath = path.join(__dirname, "../schema.sql");
    const schemaSQL = fs.readFileSync(schemaPath, "utf8");

    console.log("🚀 Running database migration...");

    await pool.query(schemaSQL);

    console.log("✅ Database schema applied successfully!");
    process.exit(0);

  } catch (error) {
    console.error("❌ Migration failed:");
    console.error(error.message);
    process.exit(1);
  }
};

runSchema();
