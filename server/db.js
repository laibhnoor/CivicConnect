// import dotenv from 'dotenv';
// import pkg from 'pg';
// const { Pool } = pkg;
// dotenv.config();

// const pool = new Pool({
//   user: process.env.DB_USER,
//   host: process.env.DB_HOST,
//   database: process.env.DB_NAME,
//   password: process.env.DB_PASSWORD,
//   port: process.env.DB_PORT,
// });

// pool.connect()
//   .then(() => console.log("✅ Connected to PostgreSQL"))
//   .catch((err) => console.error("❌ Database connection error:", err));
// export default pool;

import dotenv from "dotenv";
import pkg from "pg";
const { Pool } = pkg;

dotenv.config();

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL is missing");
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool.connect()
  .then(() => console.log("✅ Connected to PostgreSQL (Render)"))
  .catch(err => {
    console.error("❌ Database connection error:", err);
    process.exit(1);
  });

export default pool;
