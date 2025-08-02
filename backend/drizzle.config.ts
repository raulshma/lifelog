import { defineConfig } from 'drizzle-kit';
import { config } from 'dotenv';

// Load environment variables
config();

export default defineConfig({
  schema: './src/models/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'lifelog',
  },
  verbose: true,
  strict: true,
});