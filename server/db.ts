// import pkg from "pg";
// import { drizzle } from "drizzle-orm/node-postgres";
// import * as schema from "@shared/schema";
// import "dotenv/config";

// const { Pool } = pkg;

// if (!process.env.DATABASE_URL) {
//   throw new Error("DATABASE_URL must be set in .env");
// }

// export const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: {
//     rejectUnauthorized: false, // Required for Railway
//   },
// });

// export const db = drizzle(pool, { schema });

// // Optional: quick test
// pool.connect()
//   .then(() => console.log(" Connected to Railway Postgres"))
//   .catch((err) => console.error(" DB Connection Error:", err));











import pkg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@shared/schema";
import "dotenv/config";

const { Pool } = pkg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set in .env");
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // remove ssl block when using local DB
  // ssl: {
  //   rejectUnauthorized: false,
  // },
});

export const db = drizzle(pool, { schema });

// Optional: quick test
pool.connect()
  .then(() => console.log(" Connected to Local Postgres"))
  .catch((err) => console.error(" DB Connection Error:", err));
