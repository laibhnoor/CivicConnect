// server/db.js
import dotenv from "dotenv";
import pkg from "pg";
const { Pool } = pkg;

dotenv.config();

const usingConnectionString = Boolean(process.env.DATABASE_URL);

const pool = usingConnectionString
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      // Neon/hosted Postgres typically requires SSL.
      ssl: { rejectUnauthorized: false },
    })
  : new Pool({
      user: process.env.DB_USER,
      host: process.env.DB_HOST || "localhost",
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: Number(process.env.DB_PORT) || 5432,
    });

pool.connect()
  .then(() => {
    const mode = usingConnectionString ? "hosted database" : "local database";
    console.log(`✅ Connected to PostgreSQL (${mode})`);
  })
  .catch(err => {
    console.error("❌ Database connection error:", err);
    process.exit(1);
  });

export default pool;